import { NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';
import { supabase } from '@/lib/supabase';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  const { imageUrl, prompt } = await req.json();

  if (!imageUrl || !prompt) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 });
  }

  const generationId = randomUUID();

  // 1️⃣ Generate image
  const result = await fal.subscribe('fal-ai/nano-banana-pro/edit', {
    input: {
      prompt,
      image_urls: [imageUrl.publicUrl],
    },
  });

  const finalImageUrl = result.data.images[0].url;
  const imageBuffer = Buffer.from(
    await (await fetch(finalImageUrl)).arrayBuffer()
  );

  // 2️⃣ Create watermark preview
  const previewBuffer = await sharp(imageBuffer)
    .composite([
      {
        input: Buffer.from(`
          <svg width="800" height="200">
            <text x="50%" y="50%" text-anchor="middle"
              dominant-baseline="middle"
              font-size="48"
              fill="white"
              opacity="0.35">
              BetterPhoto.xyz
            </text>
          </svg>
        `),
        gravity: 'center',
      },
    ])
    .jpeg()
    .toBuffer();

  // 3️⃣ Upload preview
  const previewPath = `${generationId}.jpg`;
  await supabase.storage
    .from('previews')
    .upload(previewPath, previewBuffer, { contentType: 'image/jpeg' });

  // 4️⃣ Upload original
  const resultPath = `${generationId}.jpg`;
  await supabase.storage
    .from('results')
    .upload(resultPath, imageBuffer, { contentType: 'image/jpeg' });

  const previewUrl = supabase.storage.from('previews').getPublicUrl(previewPath)
    .data.publicUrl;

  // 5️⃣ Save to DB
  await supabase.from('generations').insert({
    id: generationId,
    preview_url: previewUrl,
    result_url: resultPath,
    paid: false,
  });

  return NextResponse.json({
    generationId,
    previewUrl,
  });
}
