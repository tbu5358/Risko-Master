import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LeaderboardLoadingState() {
  return (
    <div className="space-y-8">
      {/* Podium Loading */}
      <div className="bg-card/90 backdrop-blur border border-border rounded-xl overflow-hidden">
        <div className="p-6 sm:p-8 pt-8 sm:pt-10">
          <div className="flex items-end justify-center gap-6 h-60">
            <Skeleton className="w-24 h-32" />
            <Skeleton className="w-24 h-40" />
            <Skeleton className="w-24 h-28" />
          </div>
        </div>
      </div>

      {/* List Loading */}
      <Card className="bg-card border-border">
        <div className="divide-y divide-border">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <Skeleton className="w-8 h-4" />
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-24 h-4 ml-auto" />
              <Skeleton className="w-16 h-4" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}