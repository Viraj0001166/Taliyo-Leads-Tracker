
'use client';
import { PageHeader } from "@/components/common/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeePerformance } from "@/components/admin/employee-performance";
import { Leaderboard } from "@/components/admin/leaderboard";
import { TaskAssignmentForm } from "@/components/admin/task-assignment-form";
import { BroadcastForm } from "@/components/admin/broadcast-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, ClipboardEdit, Loader2, UserPlus, BookCopy, BarChart4 } from "lucide-react";
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { AddUserForm } from "@/components/admin/add-user-form";
import { collection, getDocs, query, where, onSnapshot, orderBy, limit, doc, getDoc } from "firebase/firestore";
import type { Employee, PerformanceData, Resource, DailyLog } from "@/lib/types";
import { ResourceManager } from "@/components/admin/resource-manager";
import { VisitorAnalytics } from "@/components/admin/visitor-analytics";

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
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists() && userDocSnapshot.data().role === 'admin') {
            setIsAuthorized(true);
          } else {
            // This is a non-admin user, redirect them.
            await auth.signOut();
            router.push('/admin/login');
          }
        } catch (error) {
            console.error("Error checking admin status:", error);
            router.push('/admin/login');
        }
      } else {
        router.push('/admin/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!isAuthorized) return;
    
    setLoading(true);

    const unsubscribeEmployees = fetchUsers();

    const resourcesCollection = collection(db, "resources");
    const unsubscribeResources = onSnapshot(resourcesCollection, (snapshot) => {
        const resourceList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource));
        setResources(resourceList);
    }, (error) => {
        console.error("Error fetching resources in real-time:", error);
    });

    setLoading(false);

    return () => {
        unsubscribeEmployees();
        unsubscribeResources();
    };

  }, [isAuthorized, fetchUsers]);

  useEffect(() => {
    if (employees.length === 0 || !isAuthorized) return;

    const fetchPerformanceData = async () => {
        const perfDataPromises = employees.map(async (employee) => {
            const logsCollection = collection(db, "dailyLogs");
            const qLogs = query(
              logsCollection,
              where("employeeId", "==", employee.id),
              orderBy("date", "desc"),
              limit(1) 
            );
            const logSnapshot = await getDocs(qLogs);
            if (!logSnapshot.empty) {
              const lastLog = logSnapshot.docs[0].data() as DailyLog;
              return {
                employeeName: employee.name,
                linkedinConnections: lastLog.linkedinConnections,
                followUps: lastLog.followUps,
                coldEmails: lastLog.coldEmails,
                leadsGenerated: lastLog.leadsGenerated,
              };
            }
            return {
              employeeName: employee.name,
              linkedinConnections: 0,
              followUps: 0,
              coldEmails: 0,
              leadsGenerated: 0,
            };
        });

        const perfDataResults = await Promise.all(perfDataPromises);
        setPerformanceData(perfDataResults);
    };

    fetchPerformanceData();

  }, [employees, isAuthorized]);


  if (loading || !isAuthorized) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying Admin Access...</p>
      </div>
    );
  }

  const currentUser = {
    name: user?.displayName || "Admin",
    email: user?.email || "",
    avatar: user?.photoURL || `https://picsum.photos/seed/${user?.email}/100/100`,
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader title="Admin Panel" user={currentUser} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="performance" className="w-full">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-6">
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
             <TabsTrigger value="resources">
              <BookCopy className="mr-2 h-4 w-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart4 className="mr-2 h-4 w-4" />
              Visitor Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-4">
             <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-1">
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
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Employees</CardTitle>
                            <CardDescription>
                                View and manage existing employee accounts.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* You can add a user management table here in the future */}
                             <p className="text-sm text-muted-foreground">List of employees will be displayed here.</p>
                        </CardContent>
                    </Card>
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

           <TabsContent value="resources" className="mt-4">
            <ResourceManager resources={resources} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <VisitorAnalytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
