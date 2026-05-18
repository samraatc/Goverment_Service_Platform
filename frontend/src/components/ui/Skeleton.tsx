import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={clsx('skeleton h-4 w-full', className)} />
);

export const ServiceCardSkeleton = () => (
  <div className="card p-5 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-24 rounded-full" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <div className="flex items-center justify-between pt-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  </div>
);

export const CategoryCardSkeleton = () => (
  <div className="card p-5 flex items-center gap-4">
    <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-20" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ cols = 5 }: { cols?: number }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4" />
      </td>
    ))}
  </tr>
);

export const StatCardSkeleton = () => (
  <div className="card p-5 space-y-3">
    <div className="flex items-center justify-between">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <Skeleton className="h-4 w-16 rounded-full" />
    </div>
    <Skeleton className="h-8 w-24" />
    <Skeleton className="h-4 w-32" />
  </div>
);
