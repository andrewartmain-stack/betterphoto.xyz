import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const gid = searchParams.get('gid');

  if (!gid) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { data } = await supabase
    .from('generations')
    .select('*')
    .eq('id', gid)
    .single();

  if (!data || !data.paid)
    return NextResponse.json({ error: 'Payment required' }, { status: 403 });

  const { data: fileData, error } = await supabase.storage
    .from('results')
    .download(data.result_path);

  if (error || !fileData)
    return NextResponse.json({ error: 'File not found' }, { status: 404 });

  const arrayBuffer = await fileData.arrayBuffer();
  return new Response(arrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Disposition': `attachment; filename="${gid}.jpg"`,
    },
  });
}
