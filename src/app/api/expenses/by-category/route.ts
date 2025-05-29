import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Expense from '@/models/expense';
import Category from '@/models/category';
import { getFirstDayOfMonth, getLastDayOfMonth } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get query parameters
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'current-month';
    const startDateParam = url.searchParams.get('startDate');
    const endDateParam = url.searchParams.get('endDate');

    // Build date range query
    const dateQuery: any = {};

    if (period === 'current-month') {
      const firstDay = getFirstDayOfMonth();
      const lastDay = getLastDayOfMonth();
      dateQuery.$gte = firstDay;
      dateQuery.$lte = lastDay;
    } else if (period === 'custom' && startDateParam && endDateParam) {
      dateQuery.$gte = new Date(startDateParam);
      dateQuery.$lte = new Date(endDateParam);
    }

    // Only add date filter if we have date constraints
    const query: any = {};
    if (Object.keys(dateQuery).length > 0) {
      query.date = dateQuery;
    }

    // Get all categories first
    const categories = await Category.find().lean();

    // Create a map of categories with both string and ObjectId keys for robust lookups
    const categoryMap = new Map();


    categories.forEach(cat => {
      const idStr = cat._id.toString();
      categoryMap.set(idStr, cat);
      categoryMap.set(cat._id, cat);

      // Also add lowercase version of the ID for case-insensitive matching
      categoryMap.set(idStr.toLowerCase(), cat);
    });

    // Aggregate expenses by category
    const expenses = await Expense.find(query).lean();

    // Group expenses by category and calculate total amount
    const categoryTotals = new Map<string, number>();


    for (const expense of expenses) {
      // Ensure categoryId is a string for consistent lookup
      let categoryId = typeof expense.category === 'object' && expense.category !== null 
        ? expense.category.toString() 
        : expense.category;

      // Try to find the category in the map
      let category = categoryMap.get(categoryId);

      // If category not found, try lowercase version
      if (!category && typeof categoryId === 'string') {
        const lowercaseId = categoryId.toLowerCase();
        category = categoryMap.get(lowercaseId);

        // If found with lowercase, use the lowercase ID for consistency
        if (category) {
          categoryId = lowercaseId;
        }
      }


      const currentTotal = categoryTotals.get(categoryId) || 0;
      categoryTotals.set(categoryId, currentTotal + expense.amount);
    }

    // Format the response data
    const result = Array.from(categoryTotals.entries()).map(([categoryId, amount]) => {
      // Try to find the category using different formats
      let category = categoryMap.get(categoryId);

      // If not found, try lowercase
      if (!category && typeof categoryId === 'string') {
        category = categoryMap.get(categoryId.toLowerCase());
      }


      return {
        _id: categoryId,
        name: category ? category.name : 'Unknown',
        color: category ? category.color : '#CCCCCC',
        amount
      };
    });

    // Sort by amount (descending)
    result.sort((a, b) => b.amount - a.amount);


    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching category distribution data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category distribution data' },
      { status: 500 }
    );
  }
}
