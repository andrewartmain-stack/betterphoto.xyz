'use client';
import { useEffect, useState } from 'react';

export default function SuccessPage() {
    const [gid, setGid] = useState<string | null>(null);

    useEffect(() => {
        // ✅ только на клиенте
        const storedGid = localStorage.getItem('generationId');
        if (storedGid) {
            setGid(storedGid);
            // сразу начинаем скачивание
            window.location.href = `/api/download?gid=${storedGid}`;
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <p className="text-gray-600 text-lg mb-2">Thank you for your payment!</p>
            <p className="text-gray-400 text-sm">
                Your download will start automatically…
            </p>
            {gid && (
                <p className="text-gray-400 text-sm mt-2">
                    If the download doesn’t start, click{' '}
                    <a className="underline" href={`/api/download?gid=${gid}`}>
                        here
                    </a>
                    .
                </p>
            )}
        </div>
    );
}
