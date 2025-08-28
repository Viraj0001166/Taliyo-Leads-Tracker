
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, onAuthStateChanged, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
          router.push('/admin');
        } else {
          // If a non-admin is logged in, sign them out and redirect to admin login
          await auth.signOut();
          setAuthLoading(false);
        }
      } else {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
        toast({ title: "Login Successful", description: "Redirecting to admin panel..." });
        router.push('/admin');
      } else {
        await auth.signOut();
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: "You do not have admin privileges.",
        });
      }
    } catch (error: any) {
       if (error.code === 'auth/user-not-found' && email.toLowerCase() === 'taliyotechnologies@gmail.com') {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          await updateProfile(user, { displayName: 'Admin' });
          await setDoc(doc(db, 'users', user.uid), {
            name: 'Admin',
            email: user.email,
            role: 'admin',
            avatar: `https://picsum.photos/seed/${user.email}/100/100`,
          });
          
          toast({ title: "Admin Account Created", description: "Login successful. Redirecting..." });
          router.push('/admin');
          
        } catch (creationError: any) {
          toast({ variant: 'destructive', title: 'Setup Failed', description: creationError.message });
        }
      } else {
         console.error("Firebase Auth Error:", error.code, error.message);
         toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: "Invalid credentials or you are not an admin.",
         });
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Loading Admin Portal...</p>
        </div>
      )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
       <div className="flex flex-col items-center justify-center text-center mb-8">
         <div className="p-3 rounded-full bg-primary/10 border border-primary/20 mb-2">
            <Shield className="h-8 w-8 text-primary" />
         </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tighter">Admin Portal</h1>
         <p className="text-muted-foreground mt-2 max-w-md">Please enter your admin credentials.</p>
      </div>

      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Enter your credentials to access the admin panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
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
              Login as Admin
            </Button>
          </form>
           <div className="mt-4 text-center text-sm">
            Not an admin?{' '}
            <Link href="/employee/login" className="underline hover:text-primary">
              Login as Employee
            </Link>
          </div>
        </CardContent>
      </Card>
       <footer className="mt-8 text-center text-sm text-muted-foreground">
         <Link href="/" className="underline hover:text-primary">
            Back to Home
        </Link>
      </footer>
    </main>
  );
}
