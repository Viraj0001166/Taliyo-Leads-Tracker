
'use client';
import { PageHeader } from "@/components/common/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeePerformance } from "@/components/admin/employee-performance";
import { Leaderboard } from "@/components/admin/leaderboard";
import { RecurringTaskForm } from "@/components/admin/recurring-task-form";
import { BroadcastForm } from "@/components/admin/broadcast-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, ClipboardEdit, Loader2, UserPlus, BookCopy, BarChart4, Briefcase, Settings } from "lucide-react";
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { AddUserForm } from "@/components/admin/add-user-form";
import { collection, onSnapshot, query, where, doc, getDoc } from "firebase/firestore";
import type { Employee, PerformanceData, Resource } from "@/lib/types";
import { ResourceManager } from "@/components/admin/resource-manager";
import { VisitorAnalytics } from "@/components/admin/visitor-analytics";
import { FakeEmployeeManager } from "@/components/admin/fake-employee-manager";
import { AppSettings } from "@/components/admin/app-settings";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  const fetchUsers = useCallback(() => {
    const usersCollection = collection(db, "users");
    const qUsers = query(usersCollection, where("role", "==", "employee"));
    return onSnapshot(qUsers, (snapshot) => {
      const employeeList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
      setEmployees(employeeList);
    }, (error) => {
      console.error("Error fetching users in real-time:", error);
    });
  }, []);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Delay role check slightly to allow for state propagation
        setTimeout(async () => {
          try {
            const userDocRef = doc(db, "users", currentUser.uid);
            const userDocSnapshot = await getDoc(userDocRef);

            if (userDocSnapshot.exists() && userDocSnapshot.data().role === 'admin') {
              setIsAuthorized(true);
            } else {
              router.push('/admin/login');
            }
          } catch (error) {
              console.error("Error checking admin status:", error);
              router.push('/admin/login');
          } finally {
            setLoading(false);
          }
        }, 50); 
      } else {
        router.push('/admin/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!isAuthorized) return;
    
    const unsubscribeEmployees = fetchUsers();

    const resourcesCollection = collection(db, "resources");
    const unsubscribeResources = onSnapshot(resourcesCollection, (snapshot) => {
        const resourceList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource));
        setResources(resourceList);
    }, (error) => {
        console.error("Error fetching resources in real-time:", error);
    });

    return () => {
        unsubscribeEmployees();
        unsubscribeResources();
    };

  }, [isAuthorized, fetchUsers]);

  const currentUser = {
    name: user?.displayName || "Admin",
    email: user?.email || "",
    avatar: user?.photoURL || `https://picsum.photos/seed/${user?.email}/100/100`,
  };

  if (loading || !isAuthorized) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying Admin Access...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader title="Admin Panel" user={currentUser} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-8 h-auto">
            <TabsTrigger value="performance" className="flex-wrap">
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
             <TabsTrigger value="manage-team">
              <Briefcase className="mr-2 h-4 w-4" />
              Manage Team
            </TabsTrigger>
            <TabsTrigger value="users">
              <UserPlus className="mr-2 h-4 w-4" />
              User Management
            </TabsTrigger>
             <TabsTrigger value="resources">
              <BookCopy className="mr-2 h-4 w-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart4 className="mr-2 h-4 w-4" />
              Visitor Analytics
            </TabsTrigger>
             <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              App Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-4">
             <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                        <CardTitle>Add New User</CardTitle>
                        <CardDescription>
                            Create a new employee or admin account.
                        </CardDescription>
                        </CardHeader>
                        <CardContent>
                        <AddUserForm onUserAdded={fetchUsers} />
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <EmployeePerformance employees={employees} />
                </div>
            </div>
          </TabsContent>

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
                    Assign a specific or recurring task to an individual employee.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecurringTaskForm employees={employees} />
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

           <TabsContent value="resources" className="mt-4">
            <ResourceManager resources={resources} />
          </TabsContent>
          
          <TabsContent value="manage-team" className="mt-4">
            <FakeEmployeeManager />
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <VisitorAnalytics />
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <AppSettings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
