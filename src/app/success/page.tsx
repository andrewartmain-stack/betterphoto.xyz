'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SparklesIcon, ArrowPathIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const generationId = searchParams.get('gid');
    const paid = searchParams.get('paid') === 'true';

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDownload = async () => {
        if (!generationId) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/download?gid=${generationId}`);
            if (!res.ok) throw new Error('Payment required or file not found');

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'photo.jpg';
            a.click();
            URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Download failed');
        } finally {
            setLoading(false);
        }
    };

    if (!generationId) {
        return (
            <div className="min-h-screen flex items-center justify-center text-center">
                <p className="text-gray-700">Missing generation ID.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Your Photo is Ready!</h1>

            {!paid ? (
                <button
                    onClick={() => {
                        window.location.href =
                            `https://buy.stripe.com/28E9AS2Qy6xj9pGf4JdUY01` +
                            `?client_reference_id=${generationId}` +
                            `&success_url=${encodeURIComponent(`${window.location.origin}/success?paid=true&gid=${generationId}`)}`;
                    }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-sm hover:opacity-90 transition"
                >
                    <LockClosedIcon className="w-5 h-5" />
                    Unlock & Download — $2
                </button>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <button
                        onClick={handleDownload}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-sm hover:opacity-90 transition"
                    >
                        {loading ? (
                            <>
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                Downloading...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                Download without watermark
                            </>
                        )}
                    </button>
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>
            )}
        </div>
    );
}
