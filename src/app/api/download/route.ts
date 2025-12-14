import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const gid = searchParams.get('gid');

  if (!gid) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const { data } = await supabase
    .from('generations')
    .select('*')
    .eq('id', gid)
    .single();

  if (!data || !data.paid) {
    return NextResponse.json({ error: 'Payment required' }, { status: 403 });
  }

  const { data: signedURL } = await supabase.storage
    .from('results')
    .createSignedUrl(data.result_url, 60);

  return NextResponse.redirect(signedURL?.signedUrl!);
}
