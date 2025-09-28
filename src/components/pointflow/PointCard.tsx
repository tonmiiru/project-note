import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Smile, Tag, User, Clock, CheckCircle, CircleDot, XCircle, Circle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import type { Point, PointStatus, Reply } from 'worker/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/stores/useProjectStore';
import { updatePointStatus, addReaction, addReply } from '@/lib/api';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
interface PointCardProps {
  point: Point;
}
const statusConfig: Record<PointStatus, { icon: React.ElementType; color: string; label: string }> = {
  Open: { icon: CircleDot, color: 'text-blue-500', label: 'Open' },
  'In Progress': { icon: Circle, color: 'text-yellow-500 animate-pulse', label: 'In Progress' },
  Resolved: { icon: CheckCircle, color: 'text-green-500', label: 'Resolved' },
  Closed: { icon: XCircle, color: 'text-red-500', label: 'Closed' },
};
const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
export function PointCard({ point }: PointCardProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const { updatePointStatus: updateStoreStatus, addReaction: addStoreReaction, addReply: addStoreReply } = useProjectStore();
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const handleStatusChange = async (newStatus: PointStatus) => {
    if (!projectId || newStatus === point.status) return;
    const originalStatus = point.status;
    updateStoreStatus(point.id, newStatus);
    const updatedPoint = await updatePointStatus(projectId, point.id, newStatus);
    if (updatedPoint) {
      toast.success(`Point status updated to "${newStatus}"`);
    } else {
      toast.error('Failed to update status.');
      updateStoreStatus(point.id, originalStatus);
    }
  };
  const handleReaction = async (emoji: string) => {
    if (!projectId) return;
    const newReaction = await addReaction(projectId, point.id, emoji);
    if (newReaction) {
      addStoreReaction(point.id, newReaction);
    } else {
      toast.error('Failed to add reaction.');
    }
  };
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !replyContent.trim()) return;
    const newReply = await addReply(projectId, point.id, replyContent);
    if (newReply) {
      addStoreReply(point.id, newReply);
      setReplyContent('');
    } else {
      toast.error('Failed to post reply.');
    }
  };
  const reactionCounts = point.reactions.reduce((acc, reaction) => {
    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Card className="shadow-sm border transition-all duration-300 hover:shadow-md hover:-translate-y-1">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><User className="w-4 h-4" /><span>Anonymous</span></div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="w-4 h-4" /><time dateTime={new Date(point.createdAt).toISOString()}>{formatDistanceToNow(new Date(point.createdAt), { addSuffix: true })}</time></div>
          </div>
        </CardHeader>
        <CardContent className="py-2">
          <p className="text-base text-foreground">{point.content}</p>
        </CardContent>
        <CardFooter className="flex flex-col items-start pt-4">
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="gap-1.5 pl-2"><Tag className="w-3.5 h-3.5" />{point.topic}</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className={cn("gap-2 text-xs h-7 px-2", statusConfig[point.status].color)}>
                    {(() => {
                      const Icon = statusConfig[point.status].icon;
                      return <Icon className="w-3.5 h-3.5" />;
                    })()}
                    {point.status}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {Object.entries(statusConfig).map(([status, config]) => {
                    const Icon = config.icon;
                    return (
                      <DropdownMenuItem key={status} onClick={() => handleStatusChange(status as PointStatus)}>
                        <Icon className={cn("w-4 h-4 mr-2", config.color)} />
                        <span>{config.label}</span>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-1">
              <Popover>
                <PopoverTrigger asChild><Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:bg-yellow-100 hover:text-yellow-600 dark:hover:bg-yellow-900/50 dark:hover:text-yellow-400"><Smile className="w-4 h-4" /></Button></PopoverTrigger>
                <PopoverContent className="w-auto p-1"><div className="flex gap-1">{EMOJIS.map(emoji => <Button key={emoji} variant="ghost" size="icon" className="text-lg" onClick={() => handleReaction(emoji)}>{emoji}</Button>)}</div></PopoverContent>
              </Popover>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/50 dark:hover:text-blue-400" onClick={() => setShowReplies(!showReplies)}><MessageSquare className="w-4 h-4" /></Button>
            </div>
          </div>
          {(Object.keys(reactionCounts).length > 0 || point.replies.length > 0) && (
            <div className="w-full flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              {Object.keys(reactionCounts).length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {Object.entries(reactionCounts).map(([emoji, count]) => (
                    <Badge key={emoji} variant="secondary" className="px-2 py-0.5">{emoji} {count}</Badge>
                  ))}
                </div>
              )}
              {point.replies.length > 0 && (
                <button onClick={() => setShowReplies(!showReplies)} className="hover:underline">{point.replies.length} {point.replies.length === 1 ? 'reply' : 'replies'}</button>
              )}
            </div>
          )}
          <AnimatePresence>
            {showReplies && (
              <motion.div layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="w-full mt-4 pt-4 border-t">
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                  {point.replies.map((reply: Reply) => (
                    <div key={reply.id} className="text-sm">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1"><span>Anonymous</span><span>{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}</span></div>
                      <p className="bg-muted/50 p-2 rounded-md">{reply.content}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleReplySubmit} className="flex items-start gap-2 mt-3">
                  <Textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} placeholder="Write a reply..." className="resize-none text-sm" rows={1} />
                  <Button type="submit" size="icon" className="h-9 w-9 flex-shrink-0"><Send className="w-4 h-4" /></Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </CardFooter>
      </Card>
    </motion.div>
  );
}