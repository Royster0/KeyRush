import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function GameSkeleton() {
    return (
        <div className="w-full flex items-center justify-center">
            <Card className="w-full max-w-[85vw] shadow-none border-none">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center px-6 py">
                        <div className="flex items-center justify-center w-full">
                            {/* Toolbar Skeleton */}
                            <div className="flex items-center gap-4 bg-secondary/30 px-4 py-2 rounded-md animate-pulse">
                                <div className="h-8 w-24 bg-muted rounded" />
                                <div className="w-px h-4 bg-border" />
                                <div className="flex gap-5">
                                    <div className="size-5 bg-muted rounded-full" />
                                    <div className="size-5 bg-muted rounded-full" />
                                </div>
                            </div>
                        </div>
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {/* Text Area Skeleton */}
                    <div className="p-6 rounded-lg mb-4 font-mono leading-relaxed overflow-hidden">
                        <div className="h-[9em] w-full animate-pulse space-y-4">
                            <div className="h-4 bg-muted/50 rounded w-full" />
                            <div className="h-4 bg-muted/50 rounded w-[90%]" />
                            <div className="h-4 bg-muted/50 rounded w-[95%]" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Footer Stats Skeleton */}
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 flex gap-8 animate-pulse">
                <div className="h-4 w-16 bg-muted/50 rounded" />
                <div className="h-4 w-16 bg-muted/50 rounded" />
            </div>
        </div>
    )
}
