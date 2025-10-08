import { embed } from '@/lib/embedding';
import { createClient } from '@supabase/supabase-js';
import { simpleTextSplitter } from '@/lib/textSplitter';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createRequestId } from '../../../lib/requestContext';
import { getPlanQuota, countWords, currentMonthKey } from '@/lib/constants/quotas';
import { config } from '@/lib/config/secrets';
import { limitIp } from '@/lib/middleware/rateLimiter';
import { withApi } from '@/lib/middleware/apiHandler';
import { PlanLimitError, ValidationError, UnifiedRateLimitError, AuthError } from '@/lib/errors';
import { authenticateRequest } from '@/lib/protectedRoute';

// Admin client (server role) via centralized config
const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  { auth: { persistSession: false } }
);

// --- Environment Variable Check --- 
// A fast check to ensure all required server-side variables are present.
// Config validation happens at import; if we reach here config is present.

export const dynamic = 'force-dynamic';

export const POST = withApi(async function POST(req: NextRequest) {
  const reqId = createRequestId();
  // Rate limit (per-IP upload limiter)
  const rl = limitIp(req as any as Request, 'upload');
  if (rl.limited) {
    throw new UnifiedRateLimitError('Upload rate limit exceeded');
  }
  
  // Authentication check using unified system
  const authResult = await authenticateRequest(req);
  if (!authResult.success) {
    throw new AuthError('You must be logged in to upload');
  }

  try {
    const { text, filename } = await req.json();
    if (!text || !filename || !filename.trim()) {
      throw new ValidationError('File name and text content are required.');
    }

    // Convert user.id to string to match your database schema
    const userId = authResult.userId;

    // Fetch profile to determine tier (fallback basic)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, subscription_status, subscription_tier, trial_ends_at, workspace_id')
      .eq('id', userId)
      .single();

    const subscriptionTier = (profile?.subscription_tier || 'basic') as string;
    const quota = getPlanQuota(subscriptionTier) || getPlanQuota('basic')!;

    // Word counting & per-upload limit
    const wordCount = countWords(text);
    if (wordCount === 0) throw new ValidationError('Text content is empty after normalization.');
    if (wordCount > quota.perUploadWordLimit) {
      throw new PlanLimitError('Per-upload word limit exceeded', { count: wordCount, limit: quota.perUploadWordLimit });
    }

    // Determine month key
    const monthKey = currentMonthKey();

    // Fetch or init usage_counters row
    const { data: usageRow } = await supabaseAdmin
      .from('usage_counters')
      .select('*')
      .eq('workspace_id', profile?.workspace_id)
      .eq('month', monthKey)
      .maybeSingle();

    let monthlyUploads = usageRow?.monthly_uploads || 0;
    let totalStored = usageRow?.total_stored_words || 0;
    let monthlyWords = usageRow?.monthly_words || 0;

    // Upload count enforcement
    if (monthlyUploads + 1 > quota.monthlyUploadLimit) {
      throw new PlanLimitError('Monthly upload limit reached', { limit: quota.monthlyUploadLimit });
    }

    // Total stored enforcement (non-ultra hard cap; ultra uses fair use)
    if (quota.totalWordCap && totalStored + wordCount > quota.totalWordCap) {
      throw new PlanLimitError('Total stored word cap exceeded', { cap: quota.totalWordCap, attempted: totalStored + wordCount });
    }

    // Ultra fair use
    if (!quota.totalWordCap && quota.fairUseHard && totalStored + wordCount > quota.fairUseHard) {
      throw new PlanLimitError('Fair use hard limit reached', { hard: quota.fairUseHard });
    }

    let fairUseWarning: string | null = null;
    if (!quota.totalWordCap && quota.fairUseSoft && totalStored + wordCount > quota.fairUseSoft) {
      fairUseWarning = 'Approaching fair use threshold';
    }

    // 1. Create the main document record to get an ID and set status to PENDING
    let docData: any = null;
    try {
      const documentInsert: any = {
        user_id: userId,
        filename,
        content: text,
        word_count: wordCount,
        status: 'PENDING',
      };

      // Only add workspace_id if the profile has one (backwards compatibility)
      if (profile?.workspace_id) {
        documentInsert.workspace_id = profile.workspace_id;
      }

      const { data: primaryInsert, error: primaryError } = await supabaseAdmin
        .from('documents')
        .insert(documentInsert)
        .select('id')
        .single();
      if (primaryError) throw primaryError;
      docData = primaryInsert;
    } catch (primaryErr: any) {
      // Fallback: if column missing, retry without word_count
      const missingColumn = /word_count/i.test(primaryErr?.message || '');
      if (missingColumn) {
        logger.warn('word_count column missing – retrying insert without it', { reqId });
        const fallbackInsert: any = {
          user_id: userId,
          filename,
          content: text,
          status: 'PENDING',
        };

        // Only add workspace_id if the profile has one (backwards compatibility)
        if (profile?.workspace_id) {
          fallbackInsert.workspace_id = profile.workspace_id;
        }

        const { data: fallbackResult, error: fallbackError } = await supabaseAdmin
          .from('documents')
          .insert(fallbackInsert)
          .select('id')
          .single();
        if (fallbackError) {
          logger.error('Document insert fallback failed', { reqId, error: fallbackError });
          throw fallbackError;
        }
        docData = fallbackResult;
      } else {
        logger.error('Document insert error', { reqId, error: primaryErr });
        throw primaryErr;
      }
    }
    
    const documentId = docData.id;

    // 2. Split the text into chunks
    const chunks = simpleTextSplitter(text);

    // 3. Embed and store each chunk
    for (const chunk of chunks) {
      const embedding = await embed(chunk);

      const chunkInsert: any = {
        document_id: documentId,
        user_id: userId,
        content: chunk,
        embedding,
      };

      // Only add workspace_id if the profile has one (backwards compatibility)
      if (profile?.workspace_id) {
        chunkInsert.workspace_id = profile.workspace_id;
      }

      const { error: chunkError } = await supabaseAdmin
        .from('document_chunks')
        .insert(chunkInsert);

      if (chunkError) {
        logger.error('Chunk insert error', { reqId, error: chunkError });
        // If any chunk fails, mark the document as FAILED and stop
        await supabaseAdmin
          .from('documents')
          .update({ status: 'FAILED' })
          .eq('id', documentId);
        throw chunkError;
      }
    }

    // 4. If all chunks are successful, mark the document as INDEXED
    await supabaseAdmin
      .from('documents')
      .update({ status: 'INDEXED' })
      .eq('id', documentId);

    // Fetch the final document to return to the UI
    const { data: finalDocument } = await supabaseAdmin
      .from('documents')
      .select('id, content, filename, created_at, status')
      .eq('id', documentId)
      .single();

    // Upsert usage counters (increment values)
    const updates = {
      monthly_uploads: monthlyUploads + 1,
      monthly_words: monthlyWords + wordCount,
      total_stored_words: totalStored + wordCount,
      workspace_id: profile?.workspace_id,
      user_id: userId,
      month: monthKey
    };

    if (usageRow) {
      await supabaseAdmin
        .from('usage_counters')
        .update(updates)
        .eq('id', usageRow.id);
    } else {
      await supabaseAdmin
        .from('usage_counters')
        .insert(updates);
    }

    return NextResponse.json({
      message: 'Text uploaded and indexed successfully!',
      document: finalDocument,
      quota: {
        plan: subscriptionTier,
        word_count: wordCount,
        monthly_uploads: monthlyUploads + 1,
        monthly_upload_limit: quota.monthlyUploadLimit,
        total_stored_words: totalStored + wordCount,
        total_stored_limit: quota.totalWordCap || quota.fairUseHard,
        fair_use_warning: fairUseWarning,
      },
      request_id: reqId
    }, {
      headers: {
        ...(fairUseWarning ? { 'x-fair-use-warning': fairUseWarning } : {}),
        'x-rate-limit-remaining': String(rl.remaining)
      }
    });

  } catch (error: any) { // will be handled by withApi but keep logging for context
    logger.error('[text-upload API Error]', { reqId, error });
    throw error; // delegate to wrapper
  }
});
