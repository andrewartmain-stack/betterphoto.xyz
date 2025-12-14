export default function SuccessPage() {

    const gid = localStorage.getItem('generationId');

    const handleDownload = async () => {
        const res = await fetch(`/api/download?gid=${gid}`);
        if (!res.ok) return alert('Payment required or error');

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'photo.jpg';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-600">Done!</p>
            <button onClick={handleDownload} className="px-6 py-3 bg-black text-white rounded-sm">
                Download without watermark
            </button>
        </div>
    );
}
