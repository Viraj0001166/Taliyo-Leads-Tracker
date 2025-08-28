
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Shield, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        } catch (error) {
          console.error("Error checking user role, redirecting to employee login:", error);
          router.push('/employee/login');
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Initializing...</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="flex flex-col items-center justify-center text-center mb-8">
        <div className="bg-primary text-primary-foreground p-2 rounded-full mb-4">
           <Image src="https://placehold.co/48x48/3B82F6/FFFFFF/png?text=T" alt="Taliyo Lead Track Logo" width={48} height={48} className="rounded-full" data-ai-hint="logo company" />
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tighter">Welcome to Taliyo Lead Track</h1>
        <p className="text-muted-foreground mt-2 max-w-md">Please select your login portal.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
          <Card className="shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="items-center text-center">
              <div className="p-3 rounded-full bg-primary/10 border border-primary/20 mb-2">
                <User className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Employee Login</CardTitle>
              <CardDescription>Access your personal dashboard to log tasks and view progress.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/employee/login">
                  Proceed to Employee Login
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="shadow-xl hover:shadow-2xl transition-shadow">
            <CardHeader className="items-center text-center">
               <div className="p-3 rounded-full bg-primary/10 border border-primary/20 mb-2">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Admin Login</CardTitle>
              <CardDescription>Access the admin panel to manage users and view analytics.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                 <Link href="/admin/login">
                  Proceed to Admin Login
                </Link>
              </Button>
            </CardContent>
          </Card>
      </div>
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
