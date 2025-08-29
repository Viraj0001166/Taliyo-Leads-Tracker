
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
          if (userDocSnap.exists()) {
            if (userDocSnap.data().role === 'admin') {
              router.push('/admin');
            } else {
              router.push('/dashboard');
            }
          } else {
             // If user exists in auth but not firestore, they can't be routed.
             // Sign them out and let them re-authenticate through the correct portal.
             await auth.signOut();
             setLoading(false);
          }
        } catch (error) {
          console.error("Error checking user role, redirecting to employee login:", error);
          await auth.signOut();
          setLoading(false);
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="flex flex-col items-center justify-center text-center mb-12">
        <div className="bg-primary text-primary-foreground p-3 rounded-full mb-4 shadow-lg">
           <Image src="https://placehold.co/48x48/FFFFFF/3B82F6/png?text=T" alt="Taliyo Lead Track Logo" width={48} height={48} className="rounded-full" data-ai-hint="logo company" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tighter">Welcome to Taliyo Lead Track</h1>
        <p className="text-muted-foreground text-lg mt-3 max-w-xl">The all-in-one solution for tracking employee performance and streamlining your workflow.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="items-center text-center p-8">
              <div className="p-4 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <User className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">Employee Login</CardTitle>
              <CardDescription className="text-base">Access your personal dashboard to log tasks and view progress.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <Button asChild className="w-full text-base py-6">
                <Link href="/employee/login">
                  Proceed to Employee Login
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <CardHeader className="items-center text-center p-8">
               <div className="p-4 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Shield className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">Admin Login</CardTitle>
              <CardDescription className="text-base">Access the admin panel to manage users and view analytics.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <Button asChild className="w-full text-base py-6">
                 <Link href="/admin/login">
                  Proceed to Admin Login
                </Link>
              </Button>
            </CardContent>
          </Card>
      </div>
       <footer className="mt-12 text-center text-base text-muted-foreground">
        © {new Date().getFullYear()} Taliyo Lead Track. All rights reserved.
        <br />
        <Link href="https://taliyotechnologies.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
            Made by Taliyo Technologies
        </Link>
      </footer>
    </main>
  );
}
