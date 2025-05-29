"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, getFirstDayOfMonth, getLastDayOfMonth } from '@/lib/utils';

interface ExpenseSummaryProps {
  title?: string;
  period?: 'current-month' | 'all-time' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

export function ExpenseSummary({ 
  title = "Monthly Summary", 
  period = 'current-month',
  startDate,
  endDate
}: ExpenseSummaryProps) {
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);

        // Determine date range based on period
        let queryParams = '';
        if (period === 'current-month') {
          const firstDay = getFirstDayOfMonth();
          const lastDay = getLastDayOfMonth();
          queryParams = `startDate=${firstDay.toISOString()}&endDate=${lastDay.toISOString()}`;
        } else if (period === 'custom' && startDate && endDate) {
          queryParams = `startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
        }

        const url = `/api/expenses${queryParams ? '?' + queryParams : ''}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Failed to fetch expenses');
        }

        const expenses = await response.json();

        // Calculate total amount
        const total = expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
        setTotalAmount(total);
      } catch (err) {
        setError('Error loading summary. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [period, startDate, endDate]);

  if (isLoading) {
    return (
      <Card className="overflow-hidden transition-all duration-200">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-50" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center text-lg">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex justify-center items-center h-20">
            <div className="animate-pulse flex space-x-2">
              <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-3 w-3 bg-primary rounded-full animate-bounce"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="overflow-hidden transition-all duration-200 border-destructive/20">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-destructive/10 opacity-50" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center text-lg">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="flex justify-center items-center h-20">
            <p className="text-destructive font-medium text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-50" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center text-lg">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-3xl font-bold tracking-tight text-primary">{formatCurrency(totalAmount)}</div>
        <p className="text-xs text-muted-foreground mt-2">
          {period === 'current-month' 
            ? 'Total expenses for the current month' 
            : period === 'all-time' 
              ? 'Total expenses for all time' 
              : title === 'Last Month'
                ? 'Total expenses for the last month'
                : title === 'This Year'
                  ? 'Total expenses for the current year'
                  : 'Total expenses for selected period'}
        </p>
      </CardContent>
    </Card>
  );
}
