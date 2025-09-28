import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/pointflow/Header';
import { InputCard } from '@/components/pointflow/InputCard';
import { PointsView } from '@/components/pointflow/PointsView';
import { SummaryCard } from '@/components/pointflow/SummaryCard';
import { useProjectStore } from '@/stores/useProjectStore';
import { getProject } from '@/lib/api';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
export function HomePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { setProject, setLoading } = useProjectStore();
  const navigate = useNavigate();
  useEffect(() => {
    async function fetchProjectData() {
      if (!projectId) return;
      setLoading('fetch', true);
      const projectData = await getProject(projectId);
      if (projectData) {
        setProject(projectId, projectData);
      } else {
        toast.error(`Failed to load project. It may not exist or you don't have access.`);
        navigate('/dashboard');
      }
      setLoading('fetch', false);
    }
    fetchProjectData();
  }, [projectId, setProject, setLoading, navigate]);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
        transition: {
          staggerChildren: 0.15,
          ease: "easeOut" as const,
        },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };
  return (
    <div className="min-h-screen bg-muted/40 dark:bg-background">
      <Header />
      <main className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-12 gap-8"
        >
          <motion.div
            variants={itemVariants}
            className="col-span-12 lg:col-span-7"
          >
            <PointsView />
          </motion.div>
          <div className="col-span-12 lg:col-span-5 space-y-8">
            <motion.div variants={itemVariants}>
              <InputCard />
            </motion.div>
            <motion.div variants={itemVariants}>
              <SummaryCard />
            </motion.div>
          </div>
        </motion.div>
      </main>
      <footer className="py-8 text-center text-muted-foreground">
        <p>Built with ❤️ at Cloudflare</p>
      </footer>
    </div>
  );
}