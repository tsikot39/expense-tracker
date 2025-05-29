import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Expense from '@/models/expense';
import { getFirstDayOfMonth, getLastDayOfMonth } from '@/lib/utils';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, subMonths, startOfDay, endOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get query parameters
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'current-month';
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');
    const groupBy = url.searchParams.get('groupBy') || 'day'; // day, week, month
    
    // Determine date range
    let startDate: Date;
    let endDate: Date;
    
    if (period === 'current-month') {
      startDate = getFirstDayOfMonth();
      endDate = getLastDayOfMonth();
    } else if (period === 'last-3-months') {
      endDate = new Date();
      startDate = subMonths(startOfMonth(endDate), 2); // Start from 3 months ago
    } else if (period === 'custom' && startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else {
      // Default to current month
      startDate = getFirstDayOfMonth();
      endDate = getLastDayOfMonth();
    }
    
    // Query expenses within the date range
    const expenses = await Expense.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).lean();
    
    // Group expenses by date
    const expensesByDate = new Map<string, number>();
    
    // Initialize all dates in the range with zero
    const dateInterval = eachDayOfInterval({ start: startDate, end: endDate });
    
    dateInterval.forEach(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      expensesByDate.set(dateKey, 0);
    });
    
    // Sum expenses for each date
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      const currentAmount = expensesByDate.get(dateKey) || 0;
      expensesByDate.set(dateKey, currentAmount + expense.amount);
    });
    
    // Format the response data
    const result = Array.from(expensesByDate.entries()).map(([date, amount]) => ({
      date,
      amount
    }));
    
    // Sort by date
    result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching expense trends data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense trends data' },
      { status: 500 }
    );
  }
}