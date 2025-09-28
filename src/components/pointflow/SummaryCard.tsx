import { useState } from 'react';
import { Sparkles, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjectStore } from '@/stores/useProjectStore';
import { generateSummary } from '@/lib/api';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Skeleton } from '../ui/skeleton';
import { useAuthStore } from '@/stores/useAuthStore';
import { UpgradeModal } from './UpgradeModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
export function SummaryCard() {
  const { projectId } = useParams<{ projectId: string }>();
  const { summary, summaryHistory, setSummary, addSummaryToHistory, loading, setLoading } = useProjectStore();
  const { tier } = useAuthStore();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const handleGenerateSummary = async () => {
    if (!projectId) return;
    if (tier === 'free' && summaryHistory.length > 0) {
      setIsUpgradeModalOpen(true);
      return;
    }
    setLoading('summary', true);
    try {
      const newSummaryData = await generateSummary(projectId);
      if (newSummaryData) {
        setSummary(newSummaryData.summary);
        addSummaryToHistory(newSummaryData);
        toast.success('Summary generated successfully!');
      } else {
        toast.error('Failed to generate summary. You may have reached your limit for today.');
      }
    } catch (error) {
      toast.error('An error occurred while generating the summary.');
      console.error(error);
    } finally {
      setLoading('summary', false);
    }
  };
  return (
    <>
      <Card className="shadow-md border transition-all duration-300 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Sparkles className="w-6 h-6 text-blue-500" />
            AI Summary
          </CardTitle>
          <div className="flex items-center gap-2">
            {summaryHistory.length > 0 && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <History className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                  <DialogHeader>
                    <DialogTitle>Summary History</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-4">
                      {summaryHistory.map((item, index) => (
                        <div key={item.id}>
                          <div className="text-sm text-muted-foreground mb-2">
                            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{item.summary}</p>
                          {index < summaryHistory.length - 1 && <Separator className="mt-4" />}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            )}
            <Button
              onClick={handleGenerateSummary}
              disabled={loading.summary}
              className="gap-2 transition-all duration-200 hover:shadow-md active:scale-95 bg-blue-500 hover:bg-blue-600"
            >
              {loading.summary ? 'Generating...' : 'Generate'}
              {!loading.summary && <Sparkles className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading.summary ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : summary ? (
            <p className="text-base text-muted-foreground whitespace-pre-wrap">{summary}</p>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold">No summary available</h3>
              <p>Click "Generate" to create an AI-powered summary of the points.</p>
            </div>
          )}
        </CardContent>
      </Card>
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onOpenChange={setIsUpgradeModalOpen}
        featureName="summaries"
        limit={1}
      />
    </>
  );
}