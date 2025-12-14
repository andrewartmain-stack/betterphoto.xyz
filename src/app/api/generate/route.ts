import { NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import { supabaseServer } from '@/lib/supabase-server';
import sharp from 'sharp';

export async function POST(req: Request) {
  try {
    const { imageUrl, prompt, generationId } = await req.json();

    if (!imageUrl || !prompt || !generationId) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    /* -------------------- 1. Generate image -------------------- */

    const result = await fal.subscribe('fal-ai/nano-banana-pro/edit', {
      input: {
        prompt,
        image_urls: [imageUrl],
      },
    });

    const finalImageUrl = result.data.images[0].url;
    const imageBuffer = Buffer.from(
      await (await fetch(finalImageUrl)).arrayBuffer()
    );

    // 2️⃣ Create watermark preview (SAFE)

    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    const width = metadata.width ?? 1024;
    const height = metadata.height ?? 1024;

    // watermark всегда меньше изображения
    const watermarkWidth = Math.floor(width * 0.8);
    const watermarkHeight = Math.floor(height * 0.2);

    const watermarkSvg = `
<svg width="${watermarkWidth}" height="${watermarkHeight}">
  <text
    x="50%"
    y="50%"
    text-anchor="middle"
    dominant-baseline="middle"
    font-size="${Math.floor(watermarkHeight * 0.4)}"
    fill="white"
    opacity="0.35"
    font-family="Arial, Helvetica, sans-serif"
  >
    BetterPhoto.xyz
  </text>
</svg>
`;

    const previewBuffer = await image
      .composite([
        {
          input: Buffer.from(watermarkSvg),
          gravity: 'center',
        },
      ])
      .jpeg({ quality: 90 })
      .toBuffer();

    /* -------------------- 3. Upload preview (PUBLIC) -------------------- */

    const previewPath = `${generationId}.jpg`;

    await supabaseServer.storage
      .from('previews') // PUBLIC bucket
      .upload(previewPath, previewBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    const previewUrl = supabaseServer.storage
      .from('previews')
      .getPublicUrl(previewPath).data.publicUrl;

    /* -------------------- 4. Upload original (PRIVATE) -------------------- */

    const resultPath = `${generationId}.jpg`;

    await supabaseServer.storage
      .from('results') // PRIVATE bucket
      .upload(resultPath, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    /* -------------------- 5. Save generation -------------------- */

    await supabaseServer.from('generations').insert({
      id: generationId,
      preview_url: previewUrl,
      result_path: resultPath,
      paid: false,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      generationId,
      previewUrl,
    });
  } catch (err) {
    console.error('Generate error:', err);
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}
