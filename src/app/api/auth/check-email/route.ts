import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/user';
import { z } from 'zod';

// Validation schema for email check
const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = emailSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { email } = result.data;
    
    await connectToDatabase();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    return NextResponse.json(
      { exists: !!existingUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking email:', error);
    return NextResponse.json(
      { error: 'Failed to check email. Please try again.' },
      { status: 500 }
    );
  }
}