"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { expenseSchema, type ExpenseFormValues } from '@/lib/validations';
import { cn } from '@/lib/utils';

interface Category {
  _id: string;
  name: string;
  color?: string;
}

interface ExpenseFormProps {
  expenseId?: string;
  defaultValues?: Partial<ExpenseFormValues>;
}

export function ExpenseForm({ expenseId, defaultValues }: ExpenseFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with default values or empty values
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: defaultValues || {
      title: '',
      amount: 0,
      date: new Date(),
      category: '',
      description: '',
    },
  });

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);

        // Check if there are no categories and set an appropriate error message
        if (data.length === 0) {
          setError('You need to create at least one category before adding an expense. Please go to the Categories page to create a category first.');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again later.');
      }
    };

    // Fetch expense data if editing an existing expense
    const fetchExpense = async () => {
      if (!expenseId) return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/expenses/${expenseId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch expense');
        }

        const expense = await response.json();

        // Format the date properly
        form.reset({
          ...expense,
          date: new Date(expense.date),
        });
      } catch (err) {
        console.error('Error fetching expense:', err);
        setError('Failed to load expense data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
    fetchExpense();
  }, [expenseId, form]);

  const onSubmit = async (data: ExpenseFormValues) => {
    try {
      setIsLoading(true);

      const url = expenseId 
        ? `/api/expenses/${expenseId}` 
        : '/api/expenses';

      const method = expenseId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${expenseId ? 'update' : 'create'} expense`);
      }

      // Redirect to the dashboard after successful submission
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error(`Error ${expenseId ? 'updating' : 'creating'} expense:`, err);
      setError(`Failed to ${expenseId ? 'update' : 'create'} expense. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-border/50 shadow-sm">
      <CardHeader className="pb-4 border-b border-border/50 bg-muted/30">
        <CardTitle className="text-xl font-semibold text-primary">
          {expenseId ? 'Edit Expense' : 'Add New Expense'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg mb-6 animate-in fade-in duration-300">
            {error.includes('create at least one category') ? (
              <>
                <p className="font-medium mb-2">Category Required</p>
                <p className="mb-2">You need to create at least one category before adding an expense.</p>
                <Button 
                  variant="outline" 
                  className="mt-1 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => router.push('/categories/new')}
                >
                  Create a new category
                </Button>
                <p className="text-xs mt-2 text-destructive/80">You'll be redirected back to add your expense afterward.</p>
              </>
            ) : (
              error
            )}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Grocery shopping" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00" 
                      value={field.value === 0 ? '' : field.value}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                        field.onChange(isNaN(value) ? 0 : value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No categories available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add any additional details here" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <CardFooter className="px-0 pt-6 flex flex-col sm:flex-row gap-3">
              <Button 
                type="submit" 
                className="w-full sm:w-auto relative overflow-hidden transition-all duration-200 shadow-sm hover:shadow"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"></span>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center">
                    {expenseId ? 'Update Expense' : 'Add Expense'}
                  </span>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full sm:w-auto border-primary/20 hover:bg-primary/5 transition-all duration-200"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
