"use client";

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface MonthlyData {
  month: string;
  monthName: string;
  amount: number;
}

interface MonthlyComparisonChartProps {
  title?: string;
  months?: number;
}

export function MonthlyComparisonChart({
  title = "Monthly Expense Comparison",
  months = 6
}: MonthlyComparisonChartProps) {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setIsLoading(true);

        // Fetch data from the API
        const response = await fetch(`/api/expenses/by-month?months=${months}`);

        if (!response.ok) {
          throw new Error('Failed to fetch monthly comparison data');
        }

        const data = await response.json();
        setMonthlyData(data);
      } catch (err) {
        setError('Error loading monthly comparison data. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonthlyData();
  }, [months]);

  // Custom tooltip for the bar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-2 border rounded shadow-sm text-card-foreground">
          <p className="font-medium">{payload[0].payload.monthName}</p>
          <p>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
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

  if (monthlyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <p>No expense data available for comparison.</p>
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
            <BarChart
              data={monthlyData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="monthName" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value).split('.')[0]} 
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="amount" 
                fill="#6366F1" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
