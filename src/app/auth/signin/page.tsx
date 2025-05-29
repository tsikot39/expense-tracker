import { Metadata } from 'next';
import { SignInForm } from '@/components/auth/signin-form';

export const metadata: Metadata = {
  title: 'Sign In | Expense Tracker',
  description: 'Sign in to your Expense Tracker account',
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
            Expense Tracker
          </h1>
          <p className="text-muted-foreground">
            Track and manage your expenses easily
          </p>
        </div>
        
        <SignInForm />
      </div>
    </div>
  );
}