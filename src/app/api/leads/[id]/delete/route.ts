import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const leadId = params.id;

  if (!leadId) {
    return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('leads').delete().eq('id', leadId);

  if (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: 'Lead deleted successfully' });
}