"use client";

import { useEffect, useState } from 'react';

export default function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        const handleStatusChange = () => {
            setIsOnline(navigator.onLine);
        };

        window.addEventListener('online', handleStatusChange);
        window.addEventListener('offline', handleStatusChange);

        // Initial check to update state if different from default
        // Initial check to update state if different from default
        if (navigator.onLine !== isOnline) {
            // Use setTimeout to avoid 'synchronous setState during effect' warning
            setTimeout(() => setIsOnline(navigator.onLine), 0);
        }

        return () => {
            window.removeEventListener('online', handleStatusChange);
            window.removeEventListener('offline', handleStatusChange);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isOnline) return null;

    return (
        <div className="bg-red-500 text-white text-center p-1 text-sm fixed bottom-0 w-full z-50">
            You are currently offline. Changes will be saved locally.
        </div>
    );
}
