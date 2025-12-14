'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ClientSuccess() {
    const searchParams = useSearchParams();
    const gid = searchParams.get('gid');

    useEffect(() => {
        if (gid) {
            // сразу начинаем скачивание
            window.location.href = `/api/download?gid=${gid}`;
        }
    }, [gid]);

    return (
        <div className="flex flex-col items-center justify-center text-center">
            <p className="text-gray-600 text-lg mb-2">Thank you for your payment!</p>
            <p className="text-gray-400 text-sm">Your download will start automatically…</p>
            <p className="text-gray-400 text-sm mt-2">
                If the download doesn’t start, <a className="underline" href={`/api/download?gid=${gid}`}>click here</a>.
            </p>
        </div>
    );
}
