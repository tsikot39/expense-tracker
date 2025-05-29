import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import Expense from '@/models/expense';
import Category from '@/models/category';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get the user session
    const session = await getServerSession(authOptions);

    // If not authenticated, return 401
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Pagination parameters
    const page = url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : 1;
    const pageSize = url.searchParams.get('pageSize') ? parseInt(url.searchParams.get('pageSize')!) : 10;
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;

    // Determine if we're using pagination or just a simple limit
    const isPaginated = url.searchParams.has('page') || url.searchParams.has('pageSize');

    // Build query with user filter
    const query: any = {
      user: session.user.id // Filter expenses by user ID
    };

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Create base query
    let expensesQuery = Expense.find(query).sort({ date: -1 });

    // Get all categories for this user
    const categories = await Category.find({ user: session.user.id }).lean();

    // Create a map of categories with string IDs as keys for easy lookup
    const categoryMap = new Map();
    categories.forEach(cat => {
      const idStr = cat._id.toString();
      categoryMap.set(idStr, cat);
    });

    // Function to enhance expense with category information
    const enhanceExpenseWithCategory = (expense: any) => {
      const expenseObj = expense.toObject ? expense.toObject() : expense;
      const categoryId = expenseObj.category;
      const category = categoryMap.get(categoryId);

      return {
        ...expenseObj,
        categoryName: category ? category.name : 'Unknown',
        categoryColor: category ? category.color : '#CCCCCC'
      };
    };

    // If using pagination, we need to get the total count for pagination metadata
    if (isPaginated) {
      // Get total count for pagination
      const totalItems = await Expense.countDocuments(query);
      const totalPages = Math.ceil(totalItems / pageSize);

      // Apply pagination
      const skip = (page - 1) * pageSize;
      expensesQuery = expensesQuery.skip(skip).limit(pageSize);

      const expenses = await expensesQuery;
      const enhancedExpenses = expenses.map(enhanceExpenseWithCategory);

      // Return paginated response
      return NextResponse.json({
        data: enhancedExpenses,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          pageSize
        }
      });
    } else {
      // Simple limit without pagination
      if (limit) {
        expensesQuery = expensesQuery.limit(limit);
      }

      const expenses = await expensesQuery;
      const enhancedExpenses = expenses.map(enhanceExpenseWithCategory);

      // Return simple response
      return NextResponse.json(enhancedExpenses);
    }
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Get the user session
    const session = await getServerSession(authOptions);

    // If not authenticated, return 401
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Associate the expense with the current user
    const expense = new Expense({
      ...body,
      user: session.user.id
    });

    await expense.save();

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
