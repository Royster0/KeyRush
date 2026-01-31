import { ThemeManager } from "@/components/settings/ThemeManager";
import { CaretSettings } from "@/components/settings/CaretSettings";
import { WidthSettings } from "@/components/settings/WidthSettings";
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Settings | KeyRush",
  description: "Manage your KeyRush settings and themes.",
  path: "/settings",
  noIndex: true,
});

export default function SettingsPage() {
    return (
        <div className="container mx-auto max-w-4xl py-10">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                    <p className="text-muted-foreground">
                        Manage your settings and themes.
                    </p>
                </div>
                <div className="my-6 border-t" />
                <CaretSettings />
                <WidthSettings />
                <ThemeManager />
            </div>
        </div>
    );
}
