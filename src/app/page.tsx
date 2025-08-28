
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.email}`,
      });

      // Simple role check based on email
      if (email === 'taliyotechnologies@gmail.com') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }

    } catch (error: any) {
      console.error("Firebase Auth Error:", error);
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.message || 'Please check your credentials and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="flex flex-col items-center justify-center text-center mb-8">
        <div className="bg-primary text-primary-foreground p-2 rounded-full mb-4">
          <Image src="https://placehold.co/48x48/3B82F6/FFFFFF/png?text=T" alt="Taliyo Lead Track Logo" width={48} height={48} className="rounded-full" data-ai-hint="logo company" />
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tighter">Taliyo Lead Track</h1>
        <p className="text-muted-foreground mt-2 max-w-md">Streamline your team's performance tracking. Log daily tasks, view progress, and stay ahead.</p>
      </div>

      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader>
          <CardTitle>Welcome Back!</CardTitle>
          <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Taliyo Lead Track. All rights reserved.
        <br />
        <Link href="https://taliyotechnologies.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
            Made by Taliyo Technologies
        </Link>
      </footer>
    </main>
  );
}
