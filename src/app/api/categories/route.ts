import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/db';
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

    // Filter categories by user ID
    const categories = await Category.find({ user: session.user.id }).sort({ name: 1 });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
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

    // Associate the category with the current user
    const category = new Category({
      ...body,
      user: session.user.id
    });

    await category.save();

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);

    // Check for duplicate key error (unique constraint violation)
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
