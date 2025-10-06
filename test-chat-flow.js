// Test if the chat API can now find workspace knowledge after our TypeScript fixes
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://nmwkutvyqprxvzsohbgd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2t1dHZ5cXByeHZ6c29oYmdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTUzMjU0NSwiZXhwIjoyMDUxMTA4NTQ1fQ.tKxrSCgjGxGa_xSj9CTHagXtlLy6TfGU8BU_xNMOvBM'
);

async function testChatFlow() {
  console.log('🤖 Testing Chat Flow After Fix...\n');

  const workspaceId = 'abee6737-7bb9-4da4-969f-899a2792641e';
  const userId = '6b47cbac-9009-42e3-9a37-b1106bf0cba0';

  // Test 1: Check if chunks exist for this workspace
  console.log('1. Checking chunks by workspace_id...');
  const { data: workspaceChunks, error: wsError } = await supabase
    .from('document_chunks')
    .select('id, content, workspace_id, user_id')
    .eq('workspace_id', workspaceId);

  if (wsError) {
    console.log('❌ Workspace chunks query failed:', wsError.message);
  } else {
    console.log(`✅ Found ${workspaceChunks?.length || 0} chunks for workspace ${workspaceId}`);
    workspaceChunks?.forEach((chunk, i) => {
      console.log(`   ${i + 1}. Chunk: "${chunk.content.substring(0, 80)}..."`);
    });
  }

  // Test 2: Check if chunks exist for this user
  console.log('\n2. Checking chunks by user_id...');
  const { data: userChunks, error: userError } = await supabase
    .from('document_chunks')
    .select('id, content, workspace_id, user_id')
    .eq('user_id', userId);

  if (userError) {
    console.log('❌ User chunks query failed:', userError.message);
  } else {
    console.log(`✅ Found ${userChunks?.length || 0} chunks for user ${userId}`);
    userChunks?.forEach((chunk, i) => {
      console.log(`   ${i + 1}. Chunk: "${chunk.content.substring(0, 80)}..."`);
    });
  }

  // Test 3: See what the old function call returns (should be empty now)
  console.log('\n3. Testing old function call (p_user_id with workspace_id)...');
  try {
    const { data: oldResult, error: oldError } = await supabase.rpc('match_document_chunks', {
      p_user_id: workspaceId,  // This should fail because workspace_id ≠ user_id
      p_query_embedding: Array(1536).fill(0.1),
      p_match_threshold: 0.01,
      p_match_count: 5
    });

    if (oldError) {
      console.log('❌ Old function call failed (expected):', oldError.message);
    } else {
      console.log(`⚠️  Old function returned ${oldResult?.length || 0} results (unexpected!)`);
    }
  } catch (error) {
    console.log('❌ Old function call errored (expected):', error.message);
  }

  // Test 4: See what the new function call should return
  console.log('\n4. Testing new function call (p_workspace_id)...');
  try {
    const { data: newResult, error: newError } = await supabase.rpc('match_document_chunks', {
      p_workspace_id: workspaceId,  // This should work if we updated the function
      p_query_embedding: Array(1536).fill(0.1),
      p_match_threshold: 0.01,
      p_match_count: 5
    });

    if (newError) {
      console.log('❌ New function call failed:', newError.message);
      console.log('📝 This means the SQL function hasn\'t been updated yet');
    } else {
      console.log(`✅ New function returned ${newResult?.length || 0} results!`);
      newResult?.forEach((chunk, i) => {
        console.log(`   ${i + 1}. Score: ${chunk.score}, Content: "${chunk.content.substring(0, 60)}..."`);
      });
    }
  } catch (error) {
    console.log('❌ New function call errored:', error.message);
  }

  console.log('\n🎯 Key Insight:');
  console.log('   - Documents are stored with BOTH workspace_id AND user_id');
  console.log('   - Chat API provides workspace_id (botId)');
  console.log('   - Vector search must filter by workspace_id, not user_id');
  console.log('   - Need to update the SQL function to use p_workspace_id parameter');
}

testChatFlow();