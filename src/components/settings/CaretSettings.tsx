"use client";

import { useSettings } from "@/hooks/useSettings";
import { CARET_SPEEDS } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, MousePointer2 } from "lucide-react";

export function CaretSettings() {
    const { caretSpeed, setCaretSpeed, showOpponentCaret, setShowOpponentCaret, mounted } = useSettings();

    if (!mounted) return null;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <MousePointer2 className="h-5 w-5 text-primary" />
                    <CardTitle>Caret Speed</CardTitle>
                </div>
                <CardDescription>
                    Adjust how quickly the caret follows your typing.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                    {Object.values(CARET_SPEEDS).map((speed) => (
                        <Button
                            key={speed}
                            variant={caretSpeed === speed ? "default" : "outline"}
                            onClick={() => setCaretSpeed(speed)}
                            className="capitalize min-w-[100px]"
                        >
                            {speed}
                        </Button>
                    ))}
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 px-4 py-3">
                    <div>
                        <p className="font-medium">Opponent caret</p>
                        <p className="text-sm text-muted-foreground">Show your opponent&apos;s caret in multiplayer.</p>
                    </div>
                    <Button
                        variant={showOpponentCaret ? "default" : "outline"}
                        onClick={() => setShowOpponentCaret(!showOpponentCaret)}
                    >
                        {showOpponentCaret ? (
                            <>
                                <Eye className="h-4 w-4" />
                                On
                            </>
                        ) : (
                            <>
                                <EyeOff className="h-4 w-4" />
                                Off
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
