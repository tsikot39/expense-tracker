import { z } from 'zod';

// Category validation schema
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50, 'Category name must be less than 50 characters'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format').optional(),
  icon: z.string().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

// Expense validation schema
export const expenseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  amount: z.coerce.number().positive('Amount must be positive'),
  date: z.date({
    required_error: 'Date is required',
    invalid_type_error: 'Invalid date format',
  }),
  category: z.string().min(1, 'Category is required'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;

// Date range validation schema for filtering
export const dateRangeSchema = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
});

export type DateRangeValues = z.infer<typeof dateRangeSchema>;