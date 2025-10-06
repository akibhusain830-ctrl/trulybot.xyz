const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) envVars[key.trim()] = value.trim();
});

const supabaseAdmin = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function debugKnowledgeBaseIssue() {
  console.log('🔍 DEBUGGING KNOWLEDGE BASE RETRIEVAL ISSUE');
  console.log('='.repeat(60));
  
  const testUserId = '6b47cbac-9009-42e3-9a37-b1106bf0cba0'; // akibhusain830@gmail.com
  
  try {
    // Step 1: Check what documents are stored
    console.log('\n1️⃣ Checking stored documents...');
    const { data: documents, error: docsError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false });
    
    if (docsError) {
      console.error('❌ Error fetching documents:', docsError);
      return;
    }
    
    console.log(`📄 Found ${documents.length} documents:`);
    documents.forEach((doc, i) => {
      console.log(`${i + 1}. "${doc.filename}" (${doc.status})`);
      console.log(`   Created: ${doc.created_at}`);
      console.log(`   Content preview: ${doc.content.substring(0, 100)}...`);
      console.log(`   Word count: ~${doc.content.split(/\s+/).length} words`);
      console.log('');
    });
    
    // Step 2: Check document chunks
    console.log('\n2️⃣ Checking document chunks...');
    const { data: chunks, error: chunksError } = await supabaseAdmin
      .from('document_chunks')
      .select('id, content, document_id, embedding')
      .eq('user_id', testUserId)
      .limit(10);
    
    if (chunksError) {
      console.error('❌ Error fetching chunks:', chunksError);
      return;
    }
    
    console.log(`🧩 Found ${chunks.length} document chunks:`);
    chunks.forEach((chunk, i) => {
      console.log(`${i + 1}. Document ID: ${chunk.document_id}`);
      console.log(`   Content: ${chunk.content.substring(0, 80)}...`);
      console.log(`   Has embedding: ${chunk.embedding ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    // Step 3: Test vector search with a relevant query
    console.log('\n3️⃣ Testing vector search with calculator-related query...');
    
    // Create a test query that should match calculator content
    const testQuery = "age calculator percentage calculator tools";
    
    // We need to create an embedding for this query first
    // Let's test with a simple similarity search using SQL
    const { data: searchResults, error: searchError } = await supabaseAdmin
      .from('document_chunks')
      .select('content, document_id')
      .eq('user_id', testUserId)
      .textSearch('content', testQuery)
      .limit(5);
    
    if (searchError) {
      console.log('⚠️ Text search failed (expected if no full-text search):', searchError.message);
      
      // Fallback: just get recent chunks
      const { data: recentChunks, error: recentError } = await supabaseAdmin
        .from('document_chunks')
        .select('content, document_id')
        .eq('user_id', testUserId)
        .limit(3);
      
      if (!recentError && recentChunks) {
        console.log('📋 Recent chunks (fallback):');
        recentChunks.forEach((chunk, i) => {
          console.log(`${i + 1}. ${chunk.content.substring(0, 100)}...`);
        });
      }
    } else if (searchResults) {
      console.log(`🔍 Text search found ${searchResults.length} results:`);
      searchResults.forEach((result, i) => {
        console.log(`${i + 1}. ${result.content.substring(0, 100)}...`);
      });
    }
    
    // Step 4: Test the vector search function directly
    console.log('\n4️⃣ Testing vector search function...');
    
    // Create a dummy embedding for testing
    const dummyEmbedding = new Array(1536).fill(0).map((_, i) => i < 10 ? 0.1 : 0);
    
    const { data: vectorResults, error: vectorError } = await supabaseAdmin
      .rpc('match_document_chunks', {
        p_user_id: testUserId,
        p_query_embedding: dummyEmbedding,
        p_match_threshold: 0.0, // Very low threshold
        p_match_count: 5
      });
    
    if (vectorError) {
      console.error('❌ Vector search failed:', vectorError);
    } else {
      console.log(`🎯 Vector search returned ${vectorResults.length} results:`);
      vectorResults.forEach((result, i) => {
        console.log(`${i + 1}. Score: ${result.score.toFixed(4)}`);
        console.log(`   Content: ${result.content.substring(0, 80)}...`);
      });
    }
    
    // Step 5: Check the chat API behavior
    console.log('\n5️⃣ Simulating chat API call...');
    
    // Test if the chat API would find the right content
    const { data: profileCheck, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, workspace_id')
      .eq('id', testUserId)
      .single();
    
    if (profileError) {
      console.error('❌ Profile check failed:', profileError);
    } else {
      console.log(`👤 Profile found: ${profileCheck.id}`);
      console.log(`🏢 Workspace ID: ${profileCheck.workspace_id}`);
      
      // The issue might be here - check if workspace_id != user_id
      if (profileCheck.workspace_id !== testUserId) {
        console.log('⚠️ POTENTIAL ISSUE FOUND:');
        console.log(`   User ID: ${testUserId}`);
        console.log(`   Workspace ID: ${profileCheck.workspace_id}`);
        console.log('   These are different! This might be why knowledge retrieval fails.');
      } else {
        console.log('✅ User ID and workspace ID match');
      }
    }
    
    // Step 6: Check if there's a mismatch in the chat API
    console.log('\n6️⃣ Checking chat API logic...');
    
    // Simulate what the chat API does
    console.log('Chat API flow:');
    console.log('1. Receives botId from widget');
    console.log('2. Uses botId as workspaceId in retrieveWorkspaceChunks()');
    console.log('3. Calls queryVectorStore with workspaceId');
    console.log('4. Vector store calls match_document_chunks with p_user_id');
    console.log('');
    
    if (profileCheck.workspace_id !== testUserId) {
      console.log('🚨 DIAGNOSIS: The issue is likely that:');
      console.log('- Widget passes user_id as botId');
      console.log('- Chat API uses this as workspaceId');
      console.log('- But vector search expects user_id, not workspace_id');
      console.log('- Documents are stored with user_id, but search uses workspace_id');
    }
    
    // Step 7: Test what happens with correct parameters
    console.log('\n7️⃣ Testing with correct workspace_id...');
    
    const { data: workspaceChunks, error: workspaceError } = await supabaseAdmin
      .from('document_chunks')
      .select('content')
      .eq('workspace_id', profileCheck.workspace_id)
      .limit(3);
    
    if (workspaceError) {
      console.log('❌ Workspace chunks query failed:', workspaceError.message);
    } else {
      console.log(`📊 Chunks with workspace_id: ${workspaceChunks.length}`);
    }
    
    const { data: userChunks, error: userError } = await supabaseAdmin
      .from('document_chunks')
      .select('content')
      .eq('user_id', testUserId)
      .limit(3);
    
    if (userError) {
      console.log('❌ User chunks query failed:', userError.message);
    } else {
      console.log(`📊 Chunks with user_id: ${userChunks.length}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 DIAGNOSIS SUMMARY');
    console.log('='.repeat(60));
    
    if (documents.length === 0) {
      console.log('❌ NO DOCUMENTS FOUND - Upload may have failed');
    } else if (chunks.length === 0) {
      console.log('❌ NO CHUNKS FOUND - Document processing may have failed');
    } else if (profileCheck.workspace_id !== testUserId) {
      console.log('❌ ID MISMATCH - Chat API using workspace_id but chunks stored with user_id');
    } else {
      console.log('❓ UNKNOWN ISSUE - Documents and chunks exist, IDs match');
    }
    
  } catch (error) {
    console.error('❌ Debug failed with error:', error);
  }
}

debugKnowledgeBaseIssue().catch(console.error);