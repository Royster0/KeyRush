"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnnouncementBarProps {
    message: string;
    storageKey: string;
}

export function AnnouncementBar({ message, storageKey }: AnnouncementBarProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const isDismissed = localStorage.getItem(storageKey);
        if (isDismissed) {
            setIsVisible(false);
        }
    }, [storageKey]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem(storageKey, "true");
    };

    if (!isVisible || !isMounted) return null;

    return (
        <div className="bg-yellow-500/90 text-yellow-950 px-4 py-2 text-center relative backdrop-blur-sm">
            <div className="container mx-auto flex items-center justify-center">
                <p className="text-sm font-medium">{message}</p>
                <button
                    onClick={handleDismiss}
                    className="absolute right-4 p-1 hover:bg-yellow-600/20 rounded-full transition-colors"
                    aria-label="Dismiss announcement"
                >
                    <X className="size-4" />
                </button>
            </div>
        </div>
    );
}
