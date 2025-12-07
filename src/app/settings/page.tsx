import { Metadata } from "next";
import { ThemeManager } from "@/components/settings/ThemeManager";
import { CaretSettings } from "@/components/settings/CaretSettings";


export const metadata: Metadata = {
    title: "Settings | KeyRush",
    description: "Manage your KeyRush settings and themes.",
};

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
                <ThemeManager />
            </div>
        </div>
    );
}
