'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import {
  CloudArrowUpIcon,
  SparklesIcon,
  ArrowPathIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [generationId, setGenerationId] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);

  /* -------------------- PREDEFINED OPTIONS -------------------- */

  const styleOptions = [
    { value: 'aesthetic professional photo', label: 'Aesthetic Professional' },
    { value: 'cinematic portrait', label: 'Cinematic Portrait' },
    { value: 'editorial fashion photo', label: 'Editorial Fashion' },
    { value: 'moody film look', label: 'Moody Film' },
    { value: 'minimalist aesthetic', label: 'Minimalist Aesthetic' },
  ];

  const cameraOptions = [
    { value: 'not looking at the camera', label: 'Looking Away' },
    { value: 'looking at the camera', label: 'Direct Gaze' },
  ];

  const locationOptions = [
    { value: 'European city', label: 'European City' },
    { value: 'modern studio', label: 'Modern Studio' },
    { value: 'historic street', label: 'Historic Street' },
    { value: 'cozy café', label: 'Cozy Café' },
    { value: 'mountain landscape', label: 'Mountain Landscape' },
  ];

  const [style, setStyle] = useState(styleOptions[0].value);
  const [cameraLook, setCameraLook] = useState(cameraOptions[0].value);
  const [location, setLocation] = useState(locationOptions[0].value);

  /* -------------------- PAYMENT RETURN -------------------- */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paidParam = params.get('paid');
    const gid = params.get('gid');

    if (paidParam === 'true' && gid) {
      setPaid(true);
      setGenerationId(gid);
    }
  }, []);

  /* -------------------- GENERATE -------------------- */

  const handleGenerate = async () => {
    if (!file) return alert('Upload a photo first');

    setLoading(true);
    setPreview(null);

    const gid = uuidv4();
    setGenerationId(gid);

    const prompt = `Create ${style} in ${location}. The subject is posing naturally, ${cameraLook}, standing slightly sideways, with a calm, non-smiling expression. Use a muted, moody atmosphere with soft cinematic lighting and a darkened overall tone. Apply an aesthetic color palette inspired by #d8d5cd, #d9d2c7, and #655340. Editorial, film-like look, shallow depth of field, clean composition, subtle grain, and high-end photography style.`;

    try {
      const fileName = `${gid}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName);

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: publicUrl.publicUrl,
          prompt,
          generationId: gid,
        }),
      });

      const data = await res.json();
      setPreview(data.previewUrl);
    } catch (err) {
      console.error(err);
      alert('Generation failed');
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- UI -------------------- */

  return (
    <main className="min-h-screen bg-white text-black px-4 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight">
            BetterPhoto<span className="opacity-50">.xyz</span>
          </h1>
          <p className="mt-3 text-gray-500">
            Turn your photo into an aesthetic Instagram-ready portrait
          </p>
        </header>

        {/* Controls */}
        <section className="grid md:grid-cols-3 gap-4 mb-8">
          <select
            className="border px-3 py-2 rounded-sm"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          >
            {styleOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            className="border px-3 py-2 rounded-sm"
            value={cameraLook}
            onChange={(e) => setCameraLook(e.target.value)}
          >
            {cameraOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            className="border px-3 py-2 rounded-sm"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            {locationOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </section>

        {/* Upload */}
        <section className="border rounded-lg p-8 text-center mb-10">
          <label className="cursor-pointer block">
            <CloudArrowUpIcon className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">
              {file ? file.name : 'Click to upload photo'}
            </p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          <button
            onClick={handleGenerate}
            disabled={loading || !file}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Generating
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5" />
                Enhance photo
              </>
            )}
          </button>
        </section>

        {/* Preview */}
        {preview && (
          <section className="text-center">
            <img
              src={preview}
              alt="Preview"
              className="mx-auto rounded-lg shadow-lg mb-6 max-h-[500px]"
            />

            {!paid ? (
              <button
                onClick={() => {
                  // 1️⃣ сохраняем generationId локально
                  localStorage.setItem('generationId', generationId as string);

                  // 2️⃣ уходим на Stripe
                  window.location.href =
                    `https://buy.stripe.com/28E9AS2Qy6xj9pGf4JdUY01` +
                    `?client_reference_id=${generationId}`;
                }}
              >
                Unlock & Download — $2
              </button>
            ) : (
              <a
                href={`/api/download?gid=${generationId}`}
                className="inline-block px-6 py-3 bg-black text-white rounded-sm"
              >
                Download without watermark
              </a>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
