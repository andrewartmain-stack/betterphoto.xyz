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
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-600">Preparing your download…</p>
        </div>
    );
}
