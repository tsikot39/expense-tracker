"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { debounce } from 'lodash';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

// Validation schema
const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Function to check if email already exists
  const checkEmailExists = async (email: string) => {
    if (!email || !email.includes('@')) return;

    try {
      setIsCheckingEmail(true);
      setEmailExists(false);

      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        setEmailExists(data.exists);
      }
    } catch (err) {
      console.error('Error checking email:', err);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Debounced version of the email check function
  const debouncedCheckEmail = debounce(checkEmailExists, 500);

  // Watch for changes to the email field
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'email' && value.email) {
        debouncedCheckEmail(value.email);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, debouncedCheckEmail]);

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      // Check if email exists before proceeding
      if (emailExists) {
        setError('Email already exists. Please use a different email address.');
        return;
      }

      setIsLoading(true);
      setError(null);

      // Register the user
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Registration failed. Please try again.');
        return;
      }

      // Sign in the user automatically after successful registration
      const signInResult = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (signInResult?.error) {
        setError('Registration successful, but sign-in failed. Please try signing in manually.');
        return;
      }

      // Redirect to dashboard on success
      router.push('/');
      router.refresh();
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign up error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
        <CardDescription className="text-center">
          Sign up to start tracking your expenses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Enter your name"
                        autoComplete="name"
                        className="pl-10"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Enter your email"
                        type="email" 
                        autoComplete="email"
                        className={`pl-10 ${emailExists ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        {...field} 
                      />
                      {isCheckingEmail && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage>
                    {emailExists && (
                      <span className="text-destructive">
                        Email already exists. Please use a different email address.
                      </span>
                    )}
                  </FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Enter your password"
                        type={showPassword ? "text" : "password"} 
                        autoComplete="new-password"
                        className="pl-10 pr-10"
                        {...field} 
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Confirm password"
                        type={showConfirmPassword ? "text" : "password"} 
                        autoComplete="new-password"
                        className="pl-10 pr-10"
                        {...field} 
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full"></span>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </span>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
