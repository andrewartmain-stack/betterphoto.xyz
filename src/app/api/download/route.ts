import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gid = searchParams.get('gid');
    if (!gid)
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { data: genData, error: dbError } = await supabaseServer
      .from('generations')
      .select('*')
      .eq('id', gid)
      .single();

    if (dbError || !genData)
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      );
    if (!genData.paid)
      return NextResponse.json({ error: 'Payment required' }, { status: 403 });

    if (!genData.result_url)
      return NextResponse.json({ error: 'File path missing' }, { status: 404 });

    const { data: fileData, error: fileError } = await supabaseServer.storage
      .from('results')
      .download(genData.result_url);

    if (fileError || !fileData)
      return NextResponse.json(
        { error: 'File not found in storage', details: fileError },
        { status: 404 }
      );

    const arrayBuffer = await fileData.arrayBuffer();
    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${gid}.jpg"`,
      },
    });
  } catch (err) {
    console.error('Download error:', err);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
