import { Metadata } from "next";
import { ThemeManager } from "@/components/settings/ThemeManager";

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
                        Manage your account settings and set e-mail preferences.
                    </p>
                </div>
                <div className="my-6 border-t" />
                <ThemeManager />
            </div>
        </div>
    );
}
