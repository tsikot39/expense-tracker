import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
import Category from '@/models/category';
import Expense from '@/models/expense';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Find the category by ID and ensure it belongs to the current user
    const category = await Category.findOne({
      _id: params.id,
      user: session.user.id
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Find and update the category, ensuring it belongs to the current user
    const category = await Category.findOneAndUpdate(
      { 
        _id: params.id,
        user: session.user.id
      },
      body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);

    // Check for duplicate key error (unique constraint violation)
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if category is being used by any expenses
    const expenseCount = await Expense.countDocuments({ 
      category: params.id,
      user: session.user.id
    });

    if (expenseCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category that is being used by expenses' },
        { status: 400 }
      );
    }

    // Find and delete the category, ensuring it belongs to the current user
    const category = await Category.findOneAndDelete({
      _id: params.id,
      user: session.user.id
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
