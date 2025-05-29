import { Metadata } from 'next';
import { SignUpForm } from '@/components/auth/signup-form';

export const metadata: Metadata = {
  title: 'Sign Up | Expense Tracker',
  description: 'Create a new Expense Tracker account',
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
            Expense Tracker
          </h1>
          <p className="text-muted-foreground">
            Create an account to start tracking your expenses
          </p>
        </div>
        
        <SignUpForm />
      </div>
    </div>
  );
}