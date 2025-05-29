"use client";

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface ExpenseData {
  date: string;
  amount: number;
}

interface ExpenseTrendsChartProps {
  title?: string;
  period?: 'current-month' | 'last-3-months' | 'all-time' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

export function ExpenseTrendsChart({
  title = "Expense Trends",
  period = 'current-month',
  startDate,
  endDate
}: ExpenseTrendsChartProps) {
  const [expenseData, setExpenseData] = useState<ExpenseData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpenseData = async () => {
      try {
        setIsLoading(true);

        // Prepare query parameters for the API call
        const params = new URLSearchParams();
        params.append('period', period);

        if (period === 'custom' && startDate && endDate) {
          params.append('startDate', startDate.toISOString());
          params.append('endDate', endDate.toISOString());
        }

        // Fetch data from the API
        const response = await fetch(`/api/expenses/by-time?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch expense trends data');
        }

        const data = await response.json();
        setExpenseData(data);
      } catch (err) {
        setError('Error loading expense trends data. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenseData();
  }, [period, startDate, endDate]);

  // Custom tooltip for the line chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-2 border rounded shadow-sm text-card-foreground">
          <p className="font-medium">{format(parseISO(label), 'MMM dd, yyyy')}</p>
          <p>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  // Format date for X-axis
  const formatXAxis = (dateStr: string) => {
    return format(parseISO(dateStr), 'MMM dd');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <p>Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (expenseData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <p>No expense data available for this period.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={expenseData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatXAxis}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value).split('.')[0]} 
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#6366F1"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
