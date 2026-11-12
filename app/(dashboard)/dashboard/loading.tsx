import {
  CardGridSkeleton,
  PageHeaderSkeleton,
  TableRowsSkeleton,
} from "@/components/shell/skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <CardGridSkeleton />
      <Skeleton className="h-[360px] w-full rounded-lg" />
      <TableRowsSkeleton rows={4} />
    </div>
  );
}
