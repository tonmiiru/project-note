import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, FileText, Users, Clock, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Header } from '@/components/pointflow/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/useAuthStore';
import { createProject, getProjects } from '@/lib/api';
import type { ProjectInfo } from 'worker/types';
import { UpgradeModal } from '@/components/pointflow/UpgradeModal';
const createProjectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').max(50, 'Project name is too long'),
});
const TIER_LIMITS = {
  free: 1,
  plus: 5,
};
export function UserDashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, tier } = useAuthStore();
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else {
      const fetchProjects = async () => {
        setIsLoading(true);
        const userProjects = await getProjects();
        if (userProjects) {
          setProjects(userProjects);
        }
        setIsLoading(false);
      };
      fetchProjects();
    }
  }, [isAuthenticated, navigate]);
  const form = useForm<z.infer<typeof createProjectSchema>>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: '' },
  });
  const handleCreateProjectClick = () => {
    if (tier === 'free' && projects.length >= TIER_LIMITS.free) {
      setIsUpgradeModalOpen(true);
    } else {
      setIsCreateDialogOpen(true);
    }
  };
  const onCreateProject = async (values: z.infer<typeof createProjectSchema>) => {
    const newProject = await createProject(values.name);
    if (newProject) {
      setProjects((prev) => [newProject, ...prev]);
      toast.success(`Project "${values.name}" created!`);
      setIsCreateDialogOpen(false);
      form.reset();
      navigate(`/project/${newProject.id}`);
    } else {
      toast.error('Failed to create project. Please try again.');
    }
  };
  return (
    <div className="min-h-screen bg-muted/40 dark:bg-background">
      <Header />
      <main className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-3xl font-bold">Your Projects</h1>
          <div className="flex items-center gap-2">
            {tier === 'free' && (
              <Button variant="outline" onClick={() => navigate('/pricing')} className="gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Upgrade
              </Button>
            )}
            <Button className="gap-2" onClick={handleCreateProjectClick}>
              <Plus className="w-4 h-4" />
              Create New Project
            </Button>
          </div>
        </motion.div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4 w-1/2 mt-2" /></CardHeader>
                <CardContent><Skeleton className="h-4 w-full" /></CardContent>
                <CardFooter><Skeleton className="h-10 w-full" /></CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            {projects.length > 0 ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {projects.map((project) => (
                  <motion.div
                    key={project.id}
                    variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                    layout
                  >
                    <Link to={`/project/${project.id}`}>
                      <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <CardHeader>
                          <CardTitle className="text-xl">{project.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1.5 text-xs pt-1">
                            <Clock className="w-3 h-3" />
                            Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5"><FileText className="w-4 h-4" /><span>0 Points</span></div>
                            <div className="flex items-center gap-1.5"><Users className="w-4 h-4" /><span>1 Member</span></div>
                          </div>
                        </CardContent>
                        <CardFooter><Button variant="secondary" className="w-full">View Project</Button></CardFooter>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 border-2 border-dashed rounded-lg"
              >
                <h2 className="text-2xl font-semibold mb-2">No projects yet!</h2>
                <p className="text-muted-foreground mb-4">Click "Create New Project" to get started.</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Project</DialogTitle>
            <DialogDescription>Give your new project a name to get started.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCreateProject)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Q3 Marketing Campaign" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Project
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onOpenChange={setIsUpgradeModalOpen}
        featureName="projects"
        limit={TIER_LIMITS.free}
      />
    </div>
  );
}