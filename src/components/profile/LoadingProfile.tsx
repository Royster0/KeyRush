"use client"

import React, { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export default function LoadingProfile() {
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(prev => {
        if (prev < 100) {
          // Faster at the beginning, slower at the end
          const increment = Math.max(1, 10 - Math.floor(prev / 20))
          return Math.min(prev + increment, 100)
        }
        return prev
      })
    }, 100)
    
    return () => clearTimeout(timer)
  }, [progress])
  
  return (
    <div className="container mx-auto max-w-5xl p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      <div className="rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-6 w-32 bg-secondary animate-pulse rounded"></div>
            <div className="h-4 w-24 bg-secondary/60 animate-pulse rounded"></div>
          </div>
          <div className="h-16 w-16 bg-secondary animate-pulse rounded-full"></div>
        </div>
        
        <div className="space-y-2 pt-4">
          <div className="h-4 w-full bg-secondary/60 animate-pulse rounded"></div>
          <div className="h-4 w-3/4 bg-secondary/60 animate-pulse rounded"></div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="rounded-lg border p-6 h-64 space-y-4">
          <div className="h-6 w-32 bg-secondary animate-pulse rounded"></div>
          <div className="space-y-2 mt-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 w-24 bg-secondary/60 animate-pulse rounded"></div>
                <div className="h-4 w-16 bg-secondary/60 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="rounded-lg border p-6 h-64 space-y-4">
          <div className="h-6 w-32 bg-secondary animate-pulse rounded"></div>
          <div className="h-40 w-full bg-secondary/30 animate-pulse rounded mt-4"></div>
        </div>
      </div>
      
      <div className="fixed bottom-4 left-4 right-4 mx-auto max-w-md">
        <div className="text-center text-sm text-muted-foreground mb-2">
          Loading profile data...
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  )
}