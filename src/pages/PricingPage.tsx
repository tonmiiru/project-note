import { Check, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/pointflow/Header';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';
export function PricingPage() {
  const navigate = useNavigate();
  const { user, upgrade, tier } = useAuthStore();
  const handleUpgrade = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const success = await upgrade();
    if (success) {
      toast.success("Upgrade successful! You're now on the Plus plan.");
      navigate('/dashboard');
    } else {
      toast.error('Upgrade failed. Please try again later.');
    }
  };
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'For individuals and small teams getting started.',
      features: [
        '1 Project',
        '1 AI Summary per week',
        'Real-time collaboration',
        'Unlimited points',
      ],
      isCurrent: tier === 'free',
    },
    {
      name: 'Plus',
      price: '$5',
      description: 'For growing teams that need more power and flexibility.',
      features: [
        '5 Projects',
        '10 AI Summaries per day',
        'Everything in Free',
        'Priority support (coming soon)',
      ],
      isCurrent: tier === 'plus',
      isFeatured: true,
    },
  ];
  return (
    <div className="min-h-screen bg-muted/40 dark:bg-background">
      <Header />
      <main className="container max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            Choose the plan that's right for you
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Simple, transparent pricing. No hidden fees.
          </p>
        </motion.div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            >
              <Card className={cn(
                "h-full flex flex-col transition-all duration-300",
                plan.isFeatured ? "border-2 border-blue-500 shadow-2xl shadow-blue-500/10" : "hover:shadow-xl hover:-translate-y-1"
              )}>
                {plan.isFeatured && (
                  <div className="absolute top-0 right-4 -mt-3">
                    <div className="inline-flex items-center text-xs font-semibold px-3 py-1 bg-blue-500 text-white rounded-full shadow-md">
                      Most Popular
                    </div>
                  </div>
                )}
                <CardHeader className="pt-8">
                  <CardTitle className="text-3xl font-bold">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-6">
                    <span className="text-5xl font-extrabold">{plan.price}</span>
                    <span className="text-muted-foreground">/ month</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    size="lg"
                    className="w-full gap-2"
                    variant={plan.isFeatured ? 'default' : 'outline'}
                    onClick={plan.name === 'Plus' ? handleUpgrade : undefined}
                    disabled={plan.isCurrent}
                  >
                    {plan.isCurrent ? 'Current Plan' : `Get Started with ${plan.name}`}
                    {plan.name === 'Plus' && !plan.isCurrent && <Zap className="w-4 h-4" />}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}