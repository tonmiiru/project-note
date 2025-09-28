import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { AtSign, Lock, LogIn, UserPlus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useAuthStore } from '@/stores/useAuthStore';
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export function AuthenticationPage() {
  const navigate = useNavigate();
  const { login, signup } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '' },
  });
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    const success = await login(values.email, values.password);
    if (success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error('Invalid credentials. Please try again.');
    }
    setLoading(false);
  };
  const onSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
    setLoading(true);
    const success = await signup(values.email, values.password);
    if (success) {
      toast.success('Signup successful! Welcome to PointFlow.');
      navigate('/dashboard');
    } else {
      toast.error('An account with this email already exists.');
    }
    setLoading(false);
  };
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-muted/40 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/50">
          <Zap className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          PointFlow
        </h1>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs defaultValue="login" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Enter your credentials to access your projects.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Email</Label>
                          <div className="relative">
                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" {...field} className="pl-9" />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Password</Label>
                           <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} className="pl-9" />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full gap-2" disabled={loading}>
                      <LogIn className="w-4 h-4" />
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>Join PointFlow to start collaborating seamlessly.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...signupForm}>
                  <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                    <FormField
                      control={signupForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Email</Label>
                          <div className="relative">
                            <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" {...field} className="pl-9" />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={signupForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} className="pl-9" />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full gap-2" disabled={loading}>
                      <UserPlus className="w-4 h-4" />
                      {loading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}