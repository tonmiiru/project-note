import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PointCard } from './PointCard';
import { useProjectStore } from '@/stores/useProjectStore';
import { List, ArrowDownUp, LayoutGrid } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatePresence, motion } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import type { Point } from 'worker/types';
export function PointsView() {
  const { points, loading, sortOption, groupOption, setSortOption, setGroupOption, topics } = useProjectStore();
  const isLoading = loading.fetch;
  const sortedAndGroupedPoints = useMemo(() => {
    let sorted = [...points];
    if (sortOption === 'newest') {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOption === 'oldest') {
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
    if (groupOption === 'none') {
      return { 'All Points': sorted };
    }
    const grouped: Record<string, Point[]> = {};
    for (const point of sorted) {
      const key = groupOption === 'topic' ? point.topic : point.status;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(point);
    }
    return grouped;
  }, [points, sortOption, groupOption]);
  const groupKeys = Object.keys(sortedAndGroupedPoints);
  return (
    <Card className="shadow-md border transition-all duration-300 hover:shadow-lg h-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <List className="w-6 h-6 text-blue-500" />
            Points Board
          </CardTitle>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowDownUp className="w-4 h-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup value={sortOption} onValueChange={(value) => setSortOption(value as 'newest' | 'oldest')}>
                  <DropdownMenuRadioItem value="newest">Newest first</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="oldest">Oldest first</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <LayoutGrid className="w-4 h-4" />
                  Group by
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup value={groupOption} onValueChange={(value) => setGroupOption(value as 'none' | 'topic' | 'status')}>
                  <DropdownMenuRadioItem value="none">None</DropdownMenuRadioItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioItem value="topic">Topic</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="status">Status</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2 p-4 border rounded-lg">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-6 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : points.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <List className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">No points yet</h3>
            <p>Add a point using the form to get started.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {groupKeys.map((groupName) => (
                <motion.div key={groupName} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {groupOption !== 'none' && (
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                      {groupName}
                    </h3>
                  )}
                  <div className="space-y-4">
                    {sortedAndGroupedPoints[groupName].map((point) => (
                      <PointCard key={point.id} point={point} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}