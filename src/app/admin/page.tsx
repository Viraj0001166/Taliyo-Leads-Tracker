
'use client';
import { PageHeader } from "@/components/common/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { employees, performanceData } from "@/lib/data";
import { EmployeePerformance } from "@/components/admin/employee-performance";
import { Leaderboard } from "@/components/admin/leaderboard";
import { TaskAssignmentForm } from "@/components/admin/task-assignment-form";
import { BroadcastForm } from "@/components/admin/broadcast-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, ClipboardEdit } from "lucide-react";
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        if (user.email === 'taliyotechnologies@gmail.com') {
          setUser(user);
          setIsAuthorized(true);
        } else {
          router.push('/dashboard');
        }
      } else {
        router.push('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);


  if (loading || !isAuthorized) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const currentUser = {
    name: user?.displayName || "Admin",
    email: user?.email || "",
    avatar: user?.photoURL || "https://picsum.photos/id/1/100/100",
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader title="Admin Panel" user={currentUser} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance">
              <Users className="mr-2 h-4 w-4" />
              Employee Performance
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Trophy className="mr-2 h-4 w-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <ClipboardEdit className="mr-2 h-4 w-4" />
              Task Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="mt-4">
            <EmployeePerformance employees={employees} />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-4">
            <Leaderboard data={performanceData} />
          </TabsContent>

          <TabsContent value="tasks" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Assign a New Task</CardTitle>
                  <CardDescription>
                    Assign a specific task to an individual employee.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TaskAssignmentForm employees={employees} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Broadcast Notification</CardTitle>
                  <CardDescription>
                    Send a message or notification to all employees at once.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BroadcastForm />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
