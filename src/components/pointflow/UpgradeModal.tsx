import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Zap, Star } from 'lucide-react';
interface UpgradeModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  featureName: string;
  limit: number;
}
export function UpgradeModal({ isOpen, onOpenChange, featureName, limit }: UpgradeModalProps) {
  const navigate = useNavigate();
  const handleUpgrade = () => {
    onOpenChange(false);
    navigate('/pricing');
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
            <Zap className="h-6 w-6 text-blue-600" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">Upgrade to Plus</DialogTitle>
          <DialogDescription className="text-center pt-2">
            You've reached the limit of {limit} {featureName} on the Free plan.
            Upgrade to Plus to unlock more features and higher limits.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ul className="space-y-2">
            <li className="flex items-center gap-3">
              <Star className="w-5 h-5 text-yellow-500" />
              <span>Up to 5 Projects</span>
            </li>
            <li className="flex items-center gap-3">
              <Star className="w-5 h-5 text-yellow-500" />
              <span>10 AI Summaries per day</span>
            </li>
            <li className="flex items-center gap-3">
              <Star className="w-5 h-5 text-yellow-500" />
              <span>And much more...</span>
            </li>
          </ul>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button type="button" onClick={handleUpgrade} className="gap-2">
            Upgrade Now
            <Zap className="w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}