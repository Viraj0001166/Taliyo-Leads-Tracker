
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const formSchema = z.object({
  category: z.string().min(1, { message: 'Category is required.' }),
  customCategory: z.string().optional(),
  title: z.string().min(1, { message: 'Title is required.' }),
  content: z.string().min(10, { message: 'Content must be at least 10 characters.' }),
}).refine(data => {
    if (data.category === 'Other' && (!data.customCategory || data.customCategory.trim() === '')) {
        return false;
    }
    return true;
}, {
    message: 'Custom category cannot be empty.',
    path: ['customCategory'],
});

interface AddResourceFormProps {
  onResourceAdded: () => void;
}

const predefinedCategories = [
    "Email Templates",
    "Lead Generation Tools",
    "Outreach Scripts (Phone/WhatsApp)",
    "Daily Task Sheets",
];

export function AddResourceForm({ onResourceAdded }: AddResourceFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: '',
      customCategory: '',
      title: '',
      content: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const finalCategory = values.category === 'Other' ? values.customCategory : values.category;

      await addDoc(collection(db, "resources"), {
        category: finalCategory,
        title: values.title,
        content: values.content,
      });

      toast({
        title: 'Resource Added!',
        description: `The resource "${values.title}" has been added successfully.`,
      });
      form.reset();
      setShowCustomCategory(false);
      onResourceAdded();
    } catch (error: any) {
      console.error('Error adding resource:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Add Resource',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
               <Select 
                onValueChange={(value) => {
                    field.onChange(value);
                    setShowCustomCategory(value === 'Other');
                }} 
                defaultValue={field.value}
               >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {predefinedCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                  <SelectItem value="Other">Other (Please specify)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {showCustomCategory && (
            <FormField
            control={form.control}
            name="customCategory"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Custom Category Name</FormLabel>
                <FormControl>
                    <Input placeholder="Enter the new category name" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        )}
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Initial Cold Outreach" {...field} />
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
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea placeholder="Write the template or resource content here..." {...field} rows={6} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="mr-2 animate-spin" /> : <PlusCircle className="mr-2" />}
          Add Resource
        </Button>
      </form>
    </Form>
  );
}
