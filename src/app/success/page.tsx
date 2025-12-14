'use client';
import { useEffect } from 'react';

export default function SuccessPage() {
    useEffect(() => {
        const gid = localStorage.getItem('generationId');

        if (gid) {
            // 🔥 сразу начинаем скачивание
            window.location.href = `/api/download?gid=${gid}`;
        }
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <p className="text-gray-600 text-lg mb-2">Thank you for your payment!</p>
            <p className="text-gray-400 text-sm">
                Your download will start automatically…
            </p>
            <p className="text-gray-400 text-sm mt-2">
                If the download doesn’t start, click{' '}
                <a
                    className="underline"
                    href={`/api/download?gid=${localStorage.getItem('generationId')}`}
                >
                    here
                </a>
                .
            </p>
        </div>
    );
}
