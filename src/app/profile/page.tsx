
'use client';

import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { ArrowLeft, Loader2 } from "lucide-react";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
           if (userDocSnap.data().role === 'admin') {
             setIsAdmin(true);
           }
        } else {
          // If no user doc, they shouldn't be here
          await auth.signOut();
          router.push('/');
        }
      } else {
        router.push('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !displayName) return;
    setIsUpdating(true);
    try {
      await updateProfile(user, { displayName });
      
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, { name: displayName });
      
      toast({
        title: "Profile Updated",
        description: "Your display name has been updated successfully.",
      });
      // Create a new user object to trigger re-render in header
      const updatedUser = { ...user, displayName };
      setUser(updatedUser);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Profile...</p>
      </div>
    );
  }

  const currentUser = {
    name: user.displayName || "User",
    email: user.email || "",
    avatar: user.photoURL || `https://picsum.photos/seed/${user.email}/100/100`,
  };
  
  const dashboardPath = isAdmin ? '/admin' : '/dashboard';

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader title="My Profile" user={currentUser} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
         <div className="max-w-2xl mx-auto w-full">
            <Button asChild variant="outline" className="mb-4">
              <Link href={dashboardPath}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
              </Link>
            </Button>
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>View and update your personal details.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-8">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{user.displayName || 'User'}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user.email || ''}
                      disabled
                    />
                  </div>
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
         </div>
      </main>
    </div>
  );
}
