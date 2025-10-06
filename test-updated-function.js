// Test the updated vector search function directly
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://nmwkutvyqprxvzsohbgd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2t1dHZ5cXByeHZ6c29oYmdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTUzMjU0NSwiZXhwIjoyMDUxMTA4NTQ1fQ.tKxrSCgjGxGa_xSj9CTHagXtlLy6TfGU8BU_xNMOvBM'
);

async function testUpdatedFunction() {
  console.log('🧪 Testing Updated Vector Search Function...\n');

  const workspaceId = 'abee6737-7bb9-4da4-969f-899a2792641e';
  const userId = '6b47cbac-9009-42e3-9a37-b1106bf0cba0';

  try {
    // Test 1: Check if the function accepts the new parameter
    console.log('1. Testing new function with p_workspace_id...');
    
    // Create a simple mock embedding for testing
    const mockEmbedding = Array(1536).fill(0).map(() => Math.random() * 0.1);
    
    const { data: newFunctionResult, error: newFunctionError } = await supabase.rpc('match_document_chunks', {
      p_workspace_id: workspaceId,
      p_query_embedding: mockEmbedding,
      p_match_threshold: 0.01, // Very low threshold to catch any matches
      p_match_count: 10
    });

    if (newFunctionError) {
      console.log('❌ New function failed:', newFunctionError.message);
      console.log('   This means the SQL fix might not have been applied correctly');
      return;
    } else {
      console.log(`✅ New function works! Found ${newFunctionResult?.length || 0} chunks`);
      
      if (newFunctionResult && newFunctionResult.length > 0) {
        console.log('📄 Found chunks:');
        newFunctionResult.forEach((chunk, i) => {
          console.log(`   ${i + 1}. Score: ${chunk.score.toFixed(4)}`);
          console.log(`      Content: "${chunk.content.substring(0, 100)}..."`);
          console.log(`      Document: ${chunk.url}`);
          console.log('');
        });
      } else {
        console.log('⚠️  No chunks found for workspace. Let\'s investigate...');
      }
    }

    // Test 2: Check what chunks exist for this workspace
    console.log('2. Checking raw chunks for workspace...');
    const { data: rawChunks, error: rawError } = await supabase
      .from('document_chunks')
      .select(`
        id,
        content,
        workspace_id,
        user_id,
        documents(filename)
      `)
      .eq('workspace_id', workspaceId)
      .limit(5);

    if (rawError) {
      console.log('❌ Raw chunks query failed:', rawError.message);
    } else {
      console.log(`✅ Raw query found ${rawChunks?.length || 0} chunks for workspace ${workspaceId}`);
      rawChunks?.forEach((chunk, i) => {
        console.log(`   ${i + 1}. ${chunk.documents?.filename}: "${chunk.content.substring(0, 80)}..."`);
      });
    }

    // Test 3: Check what chunks exist for this user
    console.log('\n3. Checking raw chunks for user...');
    const { data: userChunks, error: userError } = await supabase
      .from('document_chunks')
      .select(`
        id,
        content,
        workspace_id,
        user_id,
        documents(filename)
      `)
      .eq('user_id', userId)
      .limit(5);

    if (userError) {
      console.log('❌ User chunks query failed:', userError.message);
    } else {
      console.log(`✅ Raw query found ${userChunks?.length || 0} chunks for user ${userId}`);
      userChunks?.forEach((chunk, i) => {
        console.log(`   ${i + 1}. ${chunk.documents?.filename}: "${chunk.content.substring(0, 80)}..."`);
        console.log(`      Workspace: ${chunk.workspace_id}`);
      });
    }

    // Test 4: Try the old function to see if it still exists
    console.log('\n4. Testing if old function still exists...');
    try {
      const { data: oldResult, error: oldError } = await supabase.rpc('match_document_chunks', {
        p_user_id: userId,
        p_query_embedding: mockEmbedding,
        p_match_threshold: 0.01,
        p_match_count: 5
      });

      if (oldError) {
        console.log('✅ Old function properly removed:', oldError.message);
      } else {
        console.log('⚠️  Old function still exists and returned results');
      }
    } catch (error) {
      console.log('✅ Old function properly removed (threw error)');
    }

    console.log('\n🎯 Analysis:');
    if (newFunctionResult?.length > 0) {
      console.log('   ✅ Vector search function is working correctly');
      console.log('   ✅ Found chunks with the new workspace_id parameter');
      console.log('   🔍 Next: Check why chat API isn\'t using these results');
    } else {
      console.log('   ❌ No chunks found for workspace - possible issues:');
      console.log('   1. Documents stored with different workspace_id');
      console.log('   2. Embedding vectors not properly stored');
      console.log('   3. Threshold too high for test embedding');
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testUpdatedFunction();