// Complete system check before making any changes
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://nmwkutvyqprxvzsohbgd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2t1dHZ5cXByeHZ6c29oYmdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTUzMjU0NSwiZXhwIjoyMDUxMTA4NTQ1fQ.tKxrSCgjGxGa_xSj9CTHagXtlLy6TfGU8BU_xNMOvBM'
);

async function checkCompleteSystem() {
  console.log('🔍 COMPLETE SYSTEM CHECK\n');

  const userId = '6b47cbac-9009-42e3-9a37-b1106bf0cba0';
  const workspaceId = 'abee6737-7bb9-4da4-969f-899a2792641e';

  try {
    console.log('1. TABLE STRUCTURES:');
    console.log('===================');

    // Check documents table structure
    const { data: docColumns, error: docColError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'documents' 
        ORDER BY ordinal_position;
      `
    }).catch(() => ({ data: null, error: { message: 'exec_sql not available' } }));

    if (docColError) {
      console.log('❌ Cannot check documents table structure:', docColError.message);
    } else {
      console.log('📄 Documents table columns:');
      docColumns?.forEach(col => {
        console.log(`   ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }

    // Check document_chunks table structure
    const { data: chunkColumns, error: chunkColError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'document_chunks' 
        ORDER BY ordinal_position;
      `
    }).catch(() => ({ data: null, error: { message: 'exec_sql not available' } }));

    if (chunkColError) {
      console.log('❌ Cannot check document_chunks table structure:', chunkColError.message);
    } else {
      console.log('\n🧩 Document_chunks table columns:');
      chunkColumns?.forEach(col => {
        console.log(`   ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }

    console.log('\n2. EXISTING FUNCTIONS:');
    console.log('=====================');

    // Check existing functions
    const { data: functions, error: funcError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT routine_name, specific_name, routine_type,
               array_to_string(
                 array(
                   SELECT p.parameter_name || ' ' || p.data_type
                   FROM information_schema.parameters p
                   WHERE p.specific_name = r.specific_name
                   AND p.parameter_mode = 'IN'
                   ORDER BY p.ordinal_position
                 ), ', '
               ) as parameters
        FROM information_schema.routines r
        WHERE routine_name LIKE '%match_document_chunks%'
        AND routine_schema = 'public';
      `
    }).catch(() => ({ data: null, error: { message: 'exec_sql not available' } }));

    if (funcError) {
      console.log('❌ Cannot check functions:', funcError.message);
    } else if (functions?.length > 0) {
      console.log('⚙️ Existing match_document_chunks functions:');
      functions.forEach(func => {
        console.log(`   ${func.routine_name}(${func.parameters})`);
      });
    } else {
      console.log('📭 No match_document_chunks functions found');
    }

    console.log('\n3. USER DATA:');
    console.log('=============');

    // Check user's documents
    const { data: docs, error: docsError } = await supabase
      .from('documents')
      .select('id, filename, status, embedding_status, user_id, workspace_id, created_at')
      .eq('user_id', userId);

    if (docsError) {
      console.log('❌ Error fetching documents:', docsError.message);
    } else {
      console.log(`📄 Documents for user ${userId}:`);
      docs?.forEach((doc, i) => {
        console.log(`   ${i + 1}. ${doc.filename}`);
        console.log(`      Status: ${doc.status}`);
        console.log(`      Embedding Status: ${doc.embedding_status}`);
        console.log(`      User ID: ${doc.user_id}`);
        console.log(`      Workspace ID: ${doc.workspace_id || 'NULL'}`);
        console.log(`      Created: ${doc.created_at}`);
      });
    }

    // Check user's document chunks
    const { data: chunks, error: chunksError } = await supabase
      .from('document_chunks')
      .select('id, document_id, user_id, workspace_id, embedding')
      .eq('user_id', userId)
      .limit(5);

    if (chunksError) {
      console.log('❌ Error fetching chunks:', chunksError.message);
    } else {
      console.log(`\n🧩 Document chunks for user ${userId} (first 5):`);
      chunks?.forEach((chunk, i) => {
        console.log(`   ${i + 1}. Chunk ID: ${chunk.id}`);
        console.log(`      Document ID: ${chunk.document_id}`);
        console.log(`      User ID: ${chunk.user_id}`);
        console.log(`      Workspace ID: ${chunk.workspace_id || 'NULL'}`);
        console.log(`      Has Embedding: ${chunk.embedding ? 'YES' : 'NO'}`);
      });
    }

    console.log('\n4. WORKSPACE MAPPING:');
    console.log('====================');

    // Check profile to workspace mapping
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, workspace_id, chatbot_name, welcome_message')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.log('❌ Error fetching profile:', profileError.message);
    } else {
      console.log(`👤 Profile for user ${userId}:`);
      console.log(`   Workspace ID: ${profile.workspace_id || 'NULL'}`);
      console.log(`   Chatbot Name: ${profile.chatbot_name}`);
      console.log(`   Welcome Message: ${profile.welcome_message}`);
    }

    console.log('\n5. CURRENT ISSUES SUMMARY:');
    console.log('==========================');

    const issues = [];
    
    if (docs?.length === 0) {
      issues.push('❌ No documents found for user');
    }
    
    if (chunks?.length === 0) {
      issues.push('❌ No document chunks found for user');
    }
    
    const hasWorkspaceIdInDocs = docColumns?.some(col => col.column_name === 'workspace_id');
    const hasWorkspaceIdInChunks = chunkColumns?.some(col => col.column_name === 'workspace_id');
    
    if (!hasWorkspaceIdInDocs) {
      issues.push('⚠️ Documents table missing workspace_id column');
    }
    
    if (!hasWorkspaceIdInChunks) {
      issues.push('⚠️ Document_chunks table missing workspace_id column');
    }
    
    if (docs?.some(doc => !doc.workspace_id)) {
      issues.push('⚠️ Some documents have NULL workspace_id');
    }
    
    if (chunks?.some(chunk => !chunk.workspace_id)) {
      issues.push('⚠️ Some chunks have NULL workspace_id');
    }
    
    if (!chunks?.some(chunk => chunk.embedding)) {
      issues.push('❌ No chunks have embeddings (processing failed)');
    }

    if (issues.length === 0) {
      console.log('✅ No major issues detected');
    } else {
      issues.forEach(issue => console.log(issue));
    }

    console.log('\n6. RECOMMENDED NEXT STEPS:');
    console.log('==========================');
    
    if (!hasWorkspaceIdInDocs || !hasWorkspaceIdInChunks) {
      console.log('1. Add missing workspace_id columns to tables');
    }
    
    if (functions?.length > 0) {
      console.log('2. Drop existing match_document_chunks function first');
      console.log('3. Create new function with correct parameters');
    }
    
    if (docs?.some(doc => !doc.workspace_id) || chunks?.some(chunk => !chunk.workspace_id)) {
      console.log('4. Update existing data with workspace_id values');
    }
    
    console.log('5. Test the complete flow end-to-end');

  } catch (error) {
    console.error('💥 System check failed:', error.message);
  }
}

checkCompleteSystem();