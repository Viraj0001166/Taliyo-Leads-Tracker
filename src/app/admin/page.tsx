
'use client';
import { PageHeader } from "@/components/common/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeePerformance } from "@/components/admin/employee-performance";
import { Leaderboard } from "@/components/admin/leaderboard";
import { TaskAssignmentForm } from "@/components/admin/task-assignment-form";
import { BroadcastForm } from "@/components/admin/broadcast-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, ClipboardEdit, Loader2, UserPlus } from "lucide-react";
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { AddUserForm } from "@/components/admin/add-user-form";
import { collection, getDocs, query, where } from "firebase/firestore";
import type { Employee, PerformanceData } from "@/lib/types";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        if (currentUser.email === 'taliyotechnologies@gmail.com') {
          setUser(currentUser);
          setIsAuthorized(true);
          // Fetch employees and performance data
          try {
            const usersCollection = collection(db, "users");
            const q = query(usersCollection, where("role", "==", "employee"));
            const userSnapshot = await getDocs(q);
            const employeeList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
            setEmployees(employeeList);
          } catch(e) {
            console.error("Error fetching employees", e);
          }
        } else {
          // Not an admin, redirect to employee dashboard
          router.push('/dashboard');
        }
      } else {
        // No user logged in, redirect to login page
        router.push('/');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Admin Panel...</p>
      </div>
    );
  }

  if (!isAuthorized || !user) {
    // While redirecting or if unauthorized, render nothing or a loader
    return (
       <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  const currentUser = {
    name: user.displayName || "Admin",
    email: user.email || "",
    avatar: user.photoURL || `https://picsum.photos/seed/${user.email}/100/100`,
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader title="Admin Panel" user={currentUser} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="users">
              <UserPlus className="mr-2 h-4 w-4" />
              User Management
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
          <TabsContent value="users" className="mt-4">
             <Card>
                <CardHeader>
                  <CardTitle>Add New User</CardTitle>
                  <CardDescription>
                    Create a new employee or admin account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AddUserForm />
                </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
