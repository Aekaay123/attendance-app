"use client";
import React from 'react';
import { signIn } from '@/app/api/auth/[...nextauth]/auth';
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation

const Button = () => {
  const router = useRouter();

  const handleSignIn = async () => {
    const result = await signIn('google', { redirect: false }); // Get the sign-in result without redirecting
    if (result?.error) {
      console.error(result.error);
    } else {
      // Redirect to the dashboard after sign-in
      router.push('/dashboard');
    }
  };

  return (
    <button onClick={handleSignIn}>Sign in</button>
  );
}

export default Button;
