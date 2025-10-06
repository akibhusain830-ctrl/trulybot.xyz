// Find your workspace and understand the document storage structure
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://nmwkutvyqprxvzsohbgd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2t1dHZ5cXByeHZ6c29oYmdkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTUzMjU0NSwiZXhwIjoyMDUxMTA4NTQ1fQ.tKxrSCgjGxGa_xSj9CTHagXtlLy6TfGU8BU_xNMOvBM'
);

async function findYourWorkspace() {
  console.log('🔍 Finding Your Workspace...\n');

  try {
    // 1. Look for workspaces with uploaded documents
    console.log('1. Workspaces with uploaded documents:');
    const { data: workspacesWithDocs, error: wsError } = await supabase
      .from('workspaces')
      .select(`
        id,
        name,
        slug,
        documents(id, filename, created_at)
      `)
      .not('documents', 'is', null);

    if (wsError) {
      console.log('❌ Error fetching workspaces:', wsError.message);
    } else {
      workspacesWithDocs?.forEach((ws, i) => {
        console.log(`   ${i + 1}. ${ws.name} (${ws.slug})`);
        console.log(`      ID: ${ws.id}`);
        console.log(`      Documents: ${ws.documents?.length || 0}`);
        ws.documents?.forEach((doc, j) => {
          console.log(`         ${j + 1}. ${doc.filename} (${doc.created_at})`);
        });
        console.log('');
      });
    }

    // 2. Find documents with "business" content
    console.log('2. Documents containing business knowledge:');
    const { data: businessDocs, error: docError } = await supabase
      .from('documents')
      .select(`
        id,
        filename,
        workspace_id,
        user_id,
        content,
        workspaces(name, slug)
      `)
      .or('filename.ilike.%business%,content.ilike.%leather%,content.ilike.%calculator%,content.ilike.%artisan%');

    if (docError) {
      console.log('❌ Error fetching business docs:', docError.message);
    } else {
      businessDocs?.forEach((doc, i) => {
        console.log(`   ${i + 1}. ${doc.filename}`);
        console.log(`      Workspace: ${doc.workspaces?.name} (${doc.workspace_id})`);
        console.log(`      User: ${doc.user_id}`);
        console.log(`      Content preview: "${doc.content.substring(0, 100)}..."`);
        console.log('');
      });
    }

    // 3. Check document chunks for your business
    console.log('3. Document chunks with business content:');
    const { data: chunks, error: chunkError } = await supabase
      .from('document_chunks')
      .select(`
        id,
        content,
        workspace_id,
        user_id,
        documents(filename),
        workspaces(name, slug)
      `)
      .or('content.ilike.%leather%,content.ilike.%calculator%,content.ilike.%artisan%')
      .limit(10);

    if (chunkError) {
      console.log('❌ Error fetching chunks:', chunkError.message);
    } else {
      chunks?.forEach((chunk, i) => {
        console.log(`   ${i + 1}. From: ${chunk.documents?.filename}`);
        console.log(`      Workspace: ${chunk.workspaces?.name} (${chunk.workspace_id})`);
        console.log(`      Content: "${chunk.content.substring(0, 120)}..."`);
        console.log('');
      });
    }

    // 4. Check the specific workspace we identified earlier
    console.log('4. Your identified workspace details:');
    const yourWorkspaceId = 'abee6737-7bb9-4da4-969f-899a2792641e';
    const { data: yourWorkspace, error: yourWsError } = await supabase
      .from('workspaces')
      .select(`
        id,
        name,
        slug,
        created_at,
        documents(id, filename, content_type, created_at),
        document_chunks(id, content)
      `)
      .eq('id', yourWorkspaceId)
      .single();

    if (yourWsError) {
      console.log('❌ Error fetching your workspace:', yourWsError.message);
    } else {
      console.log(`   Name: ${yourWorkspace.name}`);
      console.log(`   Slug: ${yourWorkspace.slug}`);
      console.log(`   ID: ${yourWorkspace.id}`);
      console.log(`   Documents: ${yourWorkspace.documents?.length || 0}`);
      console.log(`   Chunks: ${yourWorkspace.document_chunks?.length || 0}`);
      
      yourWorkspace.documents?.forEach((doc, i) => {
        console.log(`      Document ${i + 1}: ${doc.filename} (${doc.created_at})`);
      });
    }

    console.log('\n🎯 Summary:');
    console.log('   - Your workspace ID: abee6737-7bb9-4da4-969f-899a2792641e');
    console.log('   - Apply the CORRECT_SQL_FIX.sql in Supabase SQL Editor');
    console.log('   - This will fix the function signature error');
    console.log('   - Then test the chat API again');

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

findYourWorkspace();