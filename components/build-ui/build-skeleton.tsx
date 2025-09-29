import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function BuildSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Skeleton className={cn("bg-accent animate-pulse rounded-none", className)} {...props} />
  )
}

export { BuildSkeleton }