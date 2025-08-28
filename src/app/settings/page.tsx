
'use client';

import Link from "next/link";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { ArrowLeft, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Settings...</p>
      </div>
    );
  }

  const currentUser = {
    name: user.displayName || "User",
    email: user.email || "",
    avatar: user.photoURL || `https://picsum.photos/seed/${user.email}/100/100`,
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader title="Settings" user={currentUser} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="max-w-4xl mx-auto w-full">
            <Button asChild variant="outline" className="mb-4">
              <Link href={user.email === 'taliyotechnologies@gmail.com' ? '/admin' : '/dashboard'}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
              </Link>
            </Button>
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Account Settings</CardTitle>
                        <CardDescription>Manage your account preferences.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                            <span>Dark Mode</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                                Enable or disable the dark theme for the application.
                            </span>
                            </Label>
                            <Switch id="dark-mode" />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                            <span>Email Notifications</span>
                            <span className="font-normal leading-snug text-muted-foreground">
                              Receive email notifications for important updates.
                            </span>
                            </Label>
                            <Switch id="email-notifications" defaultChecked />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Danger Zone</CardTitle>
                        <CardDescription>These actions are irreversible. Please proceed with caution.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive">Delete Account</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </div>
  );
}
