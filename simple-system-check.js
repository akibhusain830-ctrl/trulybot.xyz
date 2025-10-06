// Simple system check without complex RPC calls
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://nmwkutvyqprxvzsohbgd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2t1dHZ5cXByeHZ6c29oYmdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTUzMjU0NSwiZXhwIjoyMDUxMTA4NTQ1fQ.tKxrSCgjGxGa_xSj9CTHagXtlLy6TfGU8BU_xNMOvBM'
);

async function simpleSystemCheck() {
  console.log('🔍 SIMPLE SYSTEM CHECK\n');

  const userId = '6b47cbac-9009-42e3-9a37-b1106bf0cba0';
  const workspaceId = 'abee6737-7bb9-4da4-969f-899a2792641e';

  try {
    console.log('1. USER DOCUMENTS:');
    console.log('==================');

    // Check user's documents
    const { data: docs, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId);

    if (docsError) {
      console.log('❌ Error fetching documents:', docsError.message);
    } else {
      console.log(`📄 Found ${docs?.length || 0} documents:`);
      docs?.forEach((doc, i) => {
        console.log(`   ${i + 1}. ${doc.filename}`);
        console.log(`      ID: ${doc.id}`);
        console.log(`      Status: ${doc.status}`);
        console.log(`      Embedding Status: ${doc.embedding_status || 'N/A'}`);
        console.log(`      User ID: ${doc.user_id}`);
        console.log(`      Workspace ID: ${doc.workspace_id || 'NULL'}`);
        console.log(`      Created: ${doc.created_at}`);
        console.log('');
      });
    }

    console.log('2. DOCUMENT CHUNKS:');
    console.log('==================');

    // Check user's document chunks
    const { data: chunks, error: chunksError } = await supabase
      .from('document_chunks')
      .select('id, document_id, user_id, workspace_id, content, embedding')
      .eq('user_id', userId)
      .limit(5);

    if (chunksError) {
      console.log('❌ Error fetching chunks:', chunksError.message);
    } else {
      console.log(`🧩 Found ${chunks?.length || 0} document chunks (showing first 5):`);
      chunks?.forEach((chunk, i) => {
        console.log(`   ${i + 1}. Chunk ID: ${chunk.id}`);
        console.log(`      Document ID: ${chunk.document_id}`);
        console.log(`      User ID: ${chunk.user_id}`);
        console.log(`      Workspace ID: ${chunk.workspace_id || 'NULL'}`);
        console.log(`      Content: "${chunk.content.substring(0, 80)}..."`);
        console.log(`      Has Embedding: ${chunk.embedding ? 'YES' : 'NO'}`);
        console.log('');
      });
    }

    console.log('3. USER PROFILE:');
    console.log('================');

    // Check profile to workspace mapping
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.log('❌ Error fetching profile:', profileError.message);
    } else {
      console.log(`👤 Profile for user ${userId}:`);
      console.log(`   Workspace ID: ${profile.workspace_id || 'NULL'}`);
      console.log(`   Chatbot Name: ${profile.chatbot_name || 'N/A'}`);
      console.log(`   Welcome Message: ${profile.welcome_message || 'N/A'}`);
      console.log(`   Email: ${profile.email || 'N/A'}`);
    }

    console.log('4. TEST VECTOR SEARCH FUNCTION:');
    console.log('===============================');

    // Test current vector search function
    const mockEmbedding = Array(1536).fill(0).map(() => Math.random() * 0.1);

    // Try current function with workspace_id
    console.log('Testing with workspace_id...');
    const { data: wsResult, error: wsError } = await supabase.rpc('match_document_chunks', {
      p_workspace_id: workspaceId,
      p_query_embedding: mockEmbedding,
      p_match_threshold: 0.01,
      p_match_count: 5
    });

    if (wsError) {
      console.log('❌ Workspace search failed:', wsError.message);
      
      // Try with user_id instead
      console.log('Testing with user_id...');
      const { data: userResult, error: userError } = await supabase.rpc('match_document_chunks', {
        p_user_id: userId,
        p_query_embedding: mockEmbedding,
        p_match_threshold: 0.01,
        p_match_count: 5
      });

      if (userError) {
        console.log('❌ User search also failed:', userError.message);
      } else {
        console.log(`✅ User search worked! Found ${userResult?.length || 0} results`);
        userResult?.forEach((result, i) => {
          console.log(`   ${i + 1}. Score: ${result.score?.toFixed(4)}, Content: "${result.content?.substring(0, 60)}..."`);
        });
      }
    } else {
      console.log(`✅ Workspace search worked! Found ${wsResult?.length || 0} results`);
      wsResult?.forEach((result, i) => {
        console.log(`   ${i + 1}. Score: ${result.score?.toFixed(4)}, Content: "${result.content?.substring(0, 60)}..."`);
      });
    }

    console.log('\n5. DIAGNOSIS:');
    console.log('=============');

    const issues = [];
    const solutions = [];

    if (!docs || docs.length === 0) {
      issues.push('❌ No documents found for user');
      solutions.push('Re-upload business knowledge through dashboard');
    }

    if (!chunks || chunks.length === 0) {
      issues.push('❌ No document chunks found for user');
      solutions.push('Documents need to be processed into chunks');
    } else {
      const chunksWithEmbeddings = chunks.filter(chunk => chunk.embedding);
      if (chunksWithEmbeddings.length === 0) {
        issues.push('❌ No chunks have embeddings');
        solutions.push('Embedding processing failed - check OpenAI API');
      }

      const chunksWithWorkspace = chunks.filter(chunk => chunk.workspace_id);
      if (chunksWithWorkspace.length === 0) {
        issues.push('⚠️ No chunks have workspace_id');
        solutions.push('Update chunks with workspace_id or modify search to use user_id');
      }
    }

    if (wsError && userError) {
      issues.push('❌ Vector search function not working with either parameter');
      solutions.push('Fix or recreate the match_document_chunks function');
    } else if (wsError && !userError) {
      issues.push('⚠️ Function works with user_id but not workspace_id');
      solutions.push('Either update data with workspace_id or modify API to use user_id');
    }

    if (issues.length === 0) {
      console.log('✅ System appears to be working correctly!');
    } else {
      console.log('ISSUES FOUND:');
      issues.forEach(issue => console.log(issue));
      console.log('\nRECOMMENDED SOLUTIONS:');
      solutions.forEach((solution, i) => console.log(`${i + 1}. ${solution}`));
    }

  } catch (error) {
    console.error('💥 System check failed:', error.message);
  }
}

simpleSystemCheck();