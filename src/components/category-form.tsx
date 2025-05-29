"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { categorySchema, type CategoryFormValues } from '@/lib/validations';

interface CategoryFormProps {
  categoryId?: string;
  defaultValues?: Partial<CategoryFormValues>;
}

export function CategoryForm({ categoryId, defaultValues }: CategoryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectToAddExpense, setRedirectToAddExpense] = useState(false);

  // Check if we came from the add expense page
  useEffect(() => {
    const referrer = document.referrer;
    if (referrer && referrer.includes('/expenses/new')) {
      setRedirectToAddExpense(true);
    }
  }, []);

  // Initialize form with default values or empty values
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: defaultValues || {
      name: '',
      color: '#6366F1', // Default indigo color
      icon: 'tag',
    },
  });

  // Fetch category data if editing an existing category
  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/categories/${categoryId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch category');
        }

        const category = await response.json();
        form.reset(category);
      } catch (err) {
        console.error('Error fetching category:', err);
        setError('Failed to load category data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId, form]);

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setIsLoading(true);

      const url = categoryId 
        ? `/api/categories/${categoryId}` 
        : '/api/categories';

      const method = categoryId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${categoryId ? 'update' : 'create'} category`);
      }

      // Redirect to the appropriate page after successful submission
      if (!categoryId && redirectToAddExpense) {
        router.push('/expenses/new');
      } else {
        router.push('/categories');
      }
      router.refresh();
    } catch (err) {
      console.error(`Error ${categoryId ? 'updating' : 'creating'} category:`, err);
      setError((err as Error).message || `Failed to ${categoryId ? 'update' : 'create'} category. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{categoryId ? 'Edit Category' : 'Add New Category'}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Groceries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full border" 
                      style={{ backgroundColor: field.value }}
                    />
                    <FormControl>
                      <Input type="color" {...field} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="px-0 pt-4">
              <Button 
                type="submit" 
                className="mr-2" 
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : categoryId ? 'Update Category' : 'Add Category'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="mr-2"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              {!categoryId && (
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => {
                    router.push('/expenses/new');
                  }}
                >
                  Back to Add Expense
                </Button>
              )}
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
