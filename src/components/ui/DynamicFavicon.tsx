"use client";

import { useEffect } from "react";
import { useThemeColors } from "@/hooks/useCustomTheme";
import { hslToHex } from "@/lib/colors";

export default function DynamicFavicon() {
    const colors = useThemeColors();

    useEffect(() => {
        const updateFavicon = () => {
            const primaryColorHex = hslToHex(colors.primary);
            const encodedColor = encodeURIComponent(primaryColorHex);
            const faviconUrl = `/api/favicon?color=${encodedColor}`;

            // Find all existing icon links and remove them to force update
            const existingLinks = document.querySelectorAll("link[rel*='icon']");
            existingLinks.forEach(link => {
                if (link.parentNode) {
                    link.parentNode.removeChild(link);
                }
            });

            const link = document.createElement("link");
            link.type = "image/svg+xml";
            link.rel = "icon";
            link.href = faviconUrl;
            document.head.appendChild(link);
        };

        updateFavicon();
    }, [colors.primary]);

    return null;
}
