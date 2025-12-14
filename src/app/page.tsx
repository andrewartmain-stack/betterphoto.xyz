'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  CloudArrowUpIcon,
  CheckCircleIcon,
  PaintBrushIcon,
  MapPinIcon,
  EyeIcon,
  SparklesIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleUpload = async () => {
    if (!file) return alert('Select a photo first');

    setLoading(true);
    setResult(null);

    const prompt = `Create ${style} in ${location}. The subject is posing naturally, ${cameraLook}, standing slightly sideways, with a calm, non-smiling expression. Use a muted, moody atmosphere with soft cinematic lighting and a darkened overall tone. Apply an aesthetic color palette inspired by #d8d5cd, #d9d2c7, and #655340. Editorial, film-like look, shallow depth of field, clean composition, subtle grain, and high-end photography style.`;

    try {
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName);

      if (!publicUrl) throw new Error('Failed to get public URL');

      const genRes = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: publicUrl, prompt }),
      });

      const genData = await genRes.json();
      if (!genData.previewUrl) throw new Error('Generation failed');

      setResult(genData.previewUrl);
    } catch (err) {
      console.error(err);
      alert('Something went wrong: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center font-sans px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-2xl text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="relative">
            <img src="./logo.png" width={56} alt="logo" className="rounded-xl" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">AI</span>
            </div>
          </div>
          <div className="text-left">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              BetterPhoto.xyz
            </h1>
            <p className="text-gray-500 text-sm">AI Photo Enhancer</p>
          </div>
        </div>
        <p className="text-gray-600 max-w-md mx-auto">
          Transform your photos with AI-powered aesthetic enhancements
        </p>
      </div>

      <div className="w-full max-w-2xl flex flex-col lg:flex-row gap-8">
        {/* Left Panel - Controls */}
        <div className="lg:w-1/2">
          {/* Style Options */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <PaintBrushIcon className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Style</h3>
                <p className="text-sm text-gray-500">Choose your aesthetic</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {styleOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStyle(option.value)}
                  className={`p-3 rounded-xl border transition-all duration-200 ${style === option.value
                    ? 'border-gray-800 bg-gray-900 text-white'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Camera & Location */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <EyeIcon className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Gaze Direction</h3>
                  <p className="text-sm text-gray-500">Set the subject's look</p>
                </div>
              </div>
              <div className="flex gap-3">
                {cameraOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setCameraLook(option.value)}
                    className={`flex-1 p-3 rounded-xl border transition-all duration-200 ${cameraLook === option.value
                      ? 'border-gray-800 bg-gray-900 text-white'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <MapPinIcon className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Location</h3>
                  <p className="text-sm text-gray-500">Choose your backdrop</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {locationOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setLocation(option.value)}
                    className={`p-3 rounded-xl border transition-all duration-200 ${location === option.value
                      ? 'border-gray-800 bg-gray-900 text-white'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                      }`}
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Upload & Preview */}
        <div className="lg:w-1/2 space-y-8">
          {/* Upload Section */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Upload Photo
              </h2>
              <p className="text-gray-500 text-sm">
                Supported formats: JPG, PNG, WEBP
              </p>
            </div>

            <label
              htmlFor="file-upload"
              className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all duration-300 ${file
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400 bg-white'
                } p-10 cursor-pointer mb-6`}
            >
              {file ? (
                <>
                  <CheckCircleIcon className="w-12 h-12 text-green-500 mb-3" />
                  <span className="text-gray-700 font-medium">{file.name}</span>
                  <span className="text-sm text-gray-500 mt-1">
                    Click to change
                  </span>
                </>
              ) : (
                <>
                  <div className="p-4 bg-gray-100 rounded-full mb-4 group-hover:bg-gray-200 transition-colors">
                    <CloudArrowUpIcon className="w-8 h-8 text-gray-600" />
                  </div>
                  <span className="text-gray-700 font-medium">
                    Drag & drop or click to upload
                  </span>
                  <span className="text-sm text-gray-500 mt-1">
                    Max file size: 10MB
                  </span>
                </>
              )}
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>

            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-3
                ${loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 hover:shadow-lg'
                }
                ${!file ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  Enhance Photo
                </>
              )}
            </button>
          </div>

          {/* Preview Section */}
          {result && (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Enhanced</h3>
                    <p className="text-sm text-gray-500">Your transformed photo</p>
                  </div>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(result)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Copy Link
                </button>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-gray-200">
                <img
                  src={result}
                  alt="Enhanced"
                  className="w-full h-auto object-cover rounded-xl transition-transform duration-300 hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
              </div>
              <div className="mt-4 text-center">
                <button className="text-sm text-gray-600 hover:text-gray-900">
                  Download Result
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500">
          AI processing may take 30-60 seconds. Results are optimized for social media.
        </p>
      </div>
    </div>
  );
}