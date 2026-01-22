"use client";

import { useSettings } from "@/hooks/useSettings";
import { TEST_WIDTH_OPTIONS, TestWidth } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoveHorizontal } from "lucide-react";

export function WidthSettings() {
    const { 
        singleplayerWidth, 
        setSingleplayerWidth, 
        multiplayerWidth, 
        setMultiplayerWidth, 
        mounted 
    } = useSettings();

    if (!mounted) return null;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <MoveHorizontal className="h-5 w-5 text-primary" />
                    <CardTitle>Test Width</CardTitle>
                </div>
                <CardDescription>
                    Adjust the width of the typing test area for singleplayer and multiplayer modes.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Singleplayer Width */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Singleplayer</label>
                        <span className="text-sm text-muted-foreground font-mono">
                            {singleplayerWidth}vw
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {TEST_WIDTH_OPTIONS.map((width) => (
                            <Button
                                key={`sp-${width}`}
                                variant={singleplayerWidth === width ? "default" : "outline"}
                                onClick={() => setSingleplayerWidth(width)}
                                size="sm"
                                className="min-w-[60px]"
                            >
                                {width}%
                            </Button>
                        ))}
                    </div>
                    {/* Preview bar */}
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden mt-2">
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 h-full bg-primary/40 rounded-full transition-all duration-200"
                            style={{ width: `${singleplayerWidth}%` }}
                        />
                    </div>
                </div>

                {/* Multiplayer Width */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Multiplayer</label>
                        <span className="text-sm text-muted-foreground font-mono">
                            {multiplayerWidth}vw
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {TEST_WIDTH_OPTIONS.map((width) => (
                            <Button
                                key={`mp-${width}`}
                                variant={multiplayerWidth === width ? "default" : "outline"}
                                onClick={() => setMultiplayerWidth(width)}
                                size="sm"
                                className="min-w-[60px]"
                            >
                                {width}%
                            </Button>
                        ))}
                    </div>
                    {/* Preview bar */}
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden mt-2">
                        <div 
                            className="absolute left-1/2 -translate-x-1/2 h-full bg-sky-500/40 rounded-full transition-all duration-200"
                            style={{ width: `${multiplayerWidth}%` }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
