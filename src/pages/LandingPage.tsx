import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/pointflow/Header';
export function LandingPage() {
  const features = [
    "Frictionless note sharing with a simple link.",
    "Organize ideas with topic-based tagging.",
    "Generate instant AI-powered summaries.",
    "Track progress with statuses and reactions.",
  ];
  return (
    <div className="min-h-screen flex flex-col bg-muted/40 dark:bg-background">
      <Header />
      <main className="flex-grow flex items-center">
        <div className="container max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium mb-6">
              <Zap className="h-4 w-4 mr-2 text-blue-500" />
              <span>Streamline Your Project Communication</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              Capture Ideas. <span className="text-blue-500">Create Clarity.</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
              PointFlow is a minimalist, real-time collaboration tool to capture, organize, and summarize project notes with AI-powered insights.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="gap-2">
                  Get Started for Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            className="mt-20 max-w-3xl mx-auto"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start text-left gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
      <footer className="py-8 text-center text-muted-foreground">
        <p>Built with ❤️ at Cloudflare</p>
      </footer>
    </div>
  );
}