'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const gid = searchParams.get('gid');

    useEffect(() => {
        if (gid) {
            // 🔥 сразу начинаем скачивание
            window.location.href = `/api/download?gid=${gid}`;
        }
    }, [gid]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <p className="text-gray-600 text-lg mb-4">Thank you for your payment!</p>
            <p className="text-gray-400 text-sm">Your download will start automatically…</p>
        </div>
    );
}
