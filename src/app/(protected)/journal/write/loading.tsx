import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-4 p-4">
      {/* Title skeleton */}
      <Skeleton className="h-12 w-3/4 max-w-lg" />

      {/* Content area skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Button skeleton */}
      <Skeleton className="h-10 w-24 mt-6" />
    </div>
  )
}
