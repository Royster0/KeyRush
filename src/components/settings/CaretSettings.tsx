"use client";

import { useSettings } from "@/hooks/useSettings";
import { CARET_SPEEDS } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MousePointer2 } from "lucide-react";

export function CaretSettings() {
    const { caretSpeed, setCaretSpeed, mounted } = useSettings();

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
            <CardContent>
                <div className="flex gap-4">
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
            </CardContent>
        </Card>
    );
}
