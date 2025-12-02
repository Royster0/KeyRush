"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Palette, Plus } from "lucide-react";
import Link from "next/link";
import { useCustomTheme } from "@/hooks/useCustomTheme";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function ThemeModal() {
    const { presets, customThemes, applyTheme } = useCustomTheme();
    const [open, setOpen] = useState(false);

    const allThemes = [...presets, ...customThemes];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="fixed bottom-8 right-8 h-12 w-12 rounded-full shadow-lg backdrop-blur-sm bg-background/80 hover:bg-background transition-all duration-300 hover:scale-110 border-border/50"
                >
                    <Palette className="h-6 w-6" />
                    <span className="sr-only">Open theme selector</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto" overlayClassName="bg-black/0 backdrop-blur-none">
                <DialogHeader>
                    <DialogTitle>Select Theme</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                    {allThemes.map((theme) => (
                        <button
                            key={theme.id}
                            className={cn(
                                "group relative flex flex-col items-center gap-2 rounded-lg border p-4 hover:bg-accent transition-all duration-200",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            )}
                            onMouseEnter={() => applyTheme(theme.id)}
                            onClick={() => {
                                applyTheme(theme.id);
                                setOpen(false);
                            }}
                        >
                            <div className="flex h-16 w-full items-center justify-center rounded-md border shadow-sm overflow-hidden gap-1 p-2"
                                style={{ background: `hsl(${theme.colors.background})` }}
                            >
                                <div className="h-full w-1/3 rounded-sm" style={{ background: `hsl(${theme.colors.primary})` }} />
                                <div className="h-full w-1/3 rounded-sm" style={{ background: `hsl(${theme.colors.secondary})` }} />
                                <div className="h-full w-1/3 rounded-sm" style={{ background: `hsl(${theme.colors.accent})` }} />
                            </div>
                            <span className="text-sm font-medium">{theme.name}</span>
                        </button>
                    ))}
                </div>
                <div className="border-t pt-4 mt-2 flex justify-center">
                    <Link
                        href="/settings"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                        onClick={() => setOpen(false)}
                    >
                        <Plus className="h-4 w-4" />
                        Add more themes
                    </Link>
                </div>
            </DialogContent>
        </Dialog>
    );
}
