"use client";

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface CategoryData {
  _id: string;
  name: string;
  color: string;
  amount: number;
}

interface CategoryDistributionChartProps {
  title?: string;
  period?: 'current-month' | 'all-time' | 'custom';
  startDate?: Date;
  endDate?: Date;
}

export function CategoryDistributionChart({
  title = "Expense Distribution by Category",
  period = 'current-month',
  startDate,
  endDate
}: CategoryDistributionChartProps) {
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
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
        const response = await fetch(`/api/expenses/by-category?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch category distribution data');
        }

        const data = await response.json();
        setCategoryData(data);
      } catch (err) {
        setError('Error loading category distribution data. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryData();
  }, [period, startDate, endDate]);

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-2 border rounded shadow-sm text-card-foreground">
          <p className="font-medium">{data.name}</p>
          <p>{formatCurrency(data.amount)}</p>
          <p className="text-xs text-muted-foreground">
            {Math.round(data.percent * 100)}% of total
          </p>
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

  if (categoryData.length === 0) {
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

  // Calculate total amount for percentage calculation
  const totalAmount = categoryData.reduce((sum, category) => sum + category.amount, 0);

  // Add percentage to each category
  const dataWithPercent = categoryData.map(category => ({
    ...category,
    percent: category.amount / totalAmount
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dataWithPercent}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="amount"
                nameKey="name"
                label={({ name, percent, cx, cy, midAngle, innerRadius, outerRadius, index }) => {
                  const RADIAN = Math.PI / 180;
                  // Position the label outside the pie
                  const radius = outerRadius * 1.1;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);

                  return (
                    <text 
                      x={x} 
                      y={y} 
                      fill={dataWithPercent[index].color}
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="central"
                      fontSize={11}
                      fontWeight="500"
                    >
                      {`${name} (${(percent * 100).toFixed(0)}%)`}
                    </text>
                  );
                }}
                labelLine={false}
              >
                {dataWithPercent.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
