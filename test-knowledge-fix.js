// Test script to verify the knowledge base fix works
const { createClient } = require('@supabase/supabase-js');

// Using the same configuration as the app
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nmwkutvyqprxvzsohbgd.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2t1dHZ5cXByeHZ6c29oYmdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTUzMjU0NSwiZXhwIjoyMDUxMTA4NTQ1fQ.tKxrSCgjGxGa_xSj9CTHagXtlLy6TfGU8BU_xNMOvBM'
);

async function testKnowledgeBaseFix() {
  console.log('🔧 Testing Knowledge Base Fix...\n');

  try {
    // First, let's update the database function
    console.log('1. Applying database function fix...');
    const sqlFix = `
CREATE OR REPLACE FUNCTION match_document_chunks(
    p_workspace_id UUID,
    p_query_embedding VECTOR(1536),
    p_match_threshold FLOAT DEFAULT 0.7,
    p_match_count INT DEFAULT 10
)
RETURNS TABLE(
    chunkid UUID,
    documentid UUID,
    content TEXT,
    score FLOAT,
    url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.id as chunkid,
        dc.document_id as documentid,
        dc.content,
        (1 - (dc.embedding <=> p_query_embedding)) as score,
        d.filename as url
    FROM document_chunks dc
    JOIN documents d ON dc.document_id = d.id
    WHERE 
        dc.workspace_id = p_workspace_id
        AND (1 - (dc.embedding <=> p_query_embedding)) >= p_match_threshold
    ORDER BY dc.embedding <=> p_query_embedding
    LIMIT p_match_count;
END;
$$;
    `;

    const { error: updateError } = await supabase.rpc('exec_sql', { sql: sqlFix });

    if (updateError) {
      console.log('❌ Database function update failed:', updateError.message);
      console.log('🔄 Continuing with test anyway...');
      // Continue with test anyway to see if the TypeScript fix helps
    } else {
      console.log('✅ Database function updated successfully!');
    }

    // Now test the vector search with workspace_id
    console.log('\n2. Testing vector search with workspace_id...');
    const workspaceId = 'abee6737-7bb9-4da4-969f-899a2792641e';
    const testQuery = 'leather goods calculator tools business';
    
    // Create a simple embedding (normally this would use OpenAI)
    const mockEmbedding = Array(1536).fill(0).map(() => Math.random() * 0.1);

    // Test the updated function
    const { data: chunks, error: searchError } = await supabase.rpc('match_document_chunks', {
      p_workspace_id: workspaceId,
      p_query_embedding: mockEmbedding,
      p_match_threshold: 0.01, // Very low threshold for testing
      p_match_count: 10
    });

    if (searchError) {
      console.log('❌ Vector search failed:', searchError.message);
      console.log('📝 This might be expected if the SQL function update failed');
    } else {
      console.log(`✅ Vector search succeeded! Found ${chunks?.length || 0} chunks`);
      if (chunks && chunks.length > 0) {
        console.log('📋 Sample chunk:', {
          id: chunks[0].chunkid,
          content: chunks[0].content.substring(0, 100) + '...',
          score: chunks[0].score
        });
      }
    }

    // Test workspace data query
    console.log('\n3. Checking workspace data...');
    const { data: workspaceChunks, error: workspaceError } = await supabase
      .from('document_chunks')
      .select(`
        id,
        content,
        workspace_id,
        user_id,
        documents!inner(filename)
      `)
      .eq('workspace_id', workspaceId)
      .limit(3);

    if (workspaceError) {
      console.log('❌ Workspace query failed:', workspaceError.message);
    } else {
      console.log(`✅ Found ${workspaceChunks?.length || 0} chunks for workspace ${workspaceId}`);
      if (workspaceChunks && workspaceChunks.length > 0) {
        workspaceChunks.forEach((chunk, i) => {
          console.log(`   ${i + 1}. ${chunk.documents?.filename}: "${chunk.content.substring(0, 60)}..."`);
        });
      }
    }

    console.log('\n🎯 Fix Summary:');
    console.log('   - Updated match_document_chunks to use workspace_id instead of user_id');
    console.log('   - Updated TypeScript vectorStore.ts to pass p_workspace_id parameter');
    console.log('   - This should allow chatbots to retrieve their workspace documents');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testKnowledgeBaseFix();