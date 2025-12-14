'use client';
import { useEffect, useState } from 'react';

export default function SuccessPage() {
    const [gid, setGid] = useState<string | null>(null);

    useEffect(() => {
        const storedGid = localStorage.getItem('generationId');
        if (storedGid) {
            setGid(storedGid);
        }
    }, []);

    const downloadImage = async () => {
        const res = await fetch(`/api/download?gid=${gid}`);
        return res;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <p className="text-gray-600 text-lg mb-2">Thank you for your payment!</p>
            {gid && (
                <button onClick={downloadImage} className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-sm disabled:opacity-50" >
                    Download image without watermark
                </button>
            )}
        </div>
    );
}
