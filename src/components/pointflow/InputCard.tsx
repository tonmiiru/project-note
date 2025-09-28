import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PlusCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useProjectStore } from '@/stores/useProjectStore';
import { addPoint } from '@/lib/api';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
const formSchema = z.object({
  topic: z.string().min(1, 'Topic is required').max(50, 'Topic is too long'),
  content: z.string().min(3, 'Point is too short').max(500, 'Point is too long'),
});
export function InputCard() {
  const { projectId } = useParams<{ projectId: string }>();
  const { addPoint: addPointToStore, setLoading } = useProjectStore((state) => ({ addPoint: state.addPoint, setLoading: state.setLoading }));
  const isSubmitting = useProjectStore((state) => state.loading.addPoint);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      content: '',
    },
  });
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!projectId) return;
    setLoading('addPoint', true);
    try {
      const newPoint = await addPoint(projectId, values.content, values.topic);
      if (newPoint) {
        addPointToStore(newPoint);
        toast.success('Point added successfully!');
        form.reset();
      } else {
        toast.error('Failed to add point.');
      }
    } catch (error) {
      toast.error('An error occurred while adding the point.');
      console.error(error);
    } finally {
      setLoading('addPoint', false);
    }
  }
  return (
    <Card className="shadow-md border transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <PlusCircle className="w-6 h-6 text-blue-500" />
          Add a New Point
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., UI/UX Improvements" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bullet Point</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the point in a concise manner..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full gap-2 transition-all duration-200 hover:shadow-md active:scale-95 bg-blue-500 hover:bg-blue-600" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Point'}
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}