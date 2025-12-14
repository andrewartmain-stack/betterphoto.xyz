'use client';

import { useEffect } from 'react';

export default function SuccessPage() {
    useEffect(() => {
        const gid = localStorage.getItem('generationId');
        if (!gid) return;

        const poll = async () => {
            const res = await fetch(`/api/check-paid?gid=${gid}`);
            const data = await res.json();

            if (data.paid) {
                // 🔥 автоматический download
                window.location.href = `/api/download?gid=${gid}`;
            } else {
                // webhook может прийти с задержкой
                setTimeout(poll, 1500);
            }
        };

        poll();
    }, []);

    return (
        <div className="text-center mt-20">
            <h1 className="text-xl font-semibold">
                Payment received. Preparing download…
            </h1>
        </div>
    );
}
