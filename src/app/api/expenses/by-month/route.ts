import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Expense from '@/models/expense';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get query parameters
    const url = new URL(request.url);
    const monthsCount = parseInt(url.searchParams.get('months') || '6', 10);
    
    // Limit to a reasonable number of months
    const count = Math.min(Math.max(monthsCount, 1), 12);
    
    // Calculate date range for the last N months
    const endDate = new Date();
    const startDate = subMonths(startOfMonth(endDate), count - 1);
    
    // Query expenses within the date range
    const expenses = await Expense.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).lean();
    
    // Create a map to store monthly totals
    const monthlyTotals = new Map<string, number>();
    
    // Initialize all months in the range with zero
    for (let i = 0; i < count; i++) {
      const monthDate = subMonths(endDate, i);
      const monthKey = format(monthDate, 'yyyy-MM');
      monthlyTotals.set(monthKey, 0);
    }
    
    // Sum expenses for each month
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = format(date, 'yyyy-MM');
      
      if (monthlyTotals.has(monthKey)) {
        const currentAmount = monthlyTotals.get(monthKey) || 0;
        monthlyTotals.set(monthKey, currentAmount + expense.amount);
      }
    });
    
    // Format the response data
    const result = Array.from(monthlyTotals.entries()).map(([monthKey, amount]) => {
      const [year, month] = monthKey.split('-');
      return {
        month: monthKey,
        monthName: format(new Date(parseInt(year), parseInt(month) - 1, 1), 'MMM yyyy'),
        amount
      };
    });
    
    // Sort by month (oldest to newest)
    result.sort((a, b) => a.month.localeCompare(b.month));
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching monthly comparison data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch monthly comparison data' },
      { status: 500 }
    );
  }
}