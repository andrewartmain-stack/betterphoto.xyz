'use client';

import { Suspense } from 'react';
import ClientSuccess from '../../components/ClientSuccess';

export default function SuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Suspense fallback={<p>Loading…</p>}>
                <ClientSuccess />
            </Suspense>
        </div>
    );
}
