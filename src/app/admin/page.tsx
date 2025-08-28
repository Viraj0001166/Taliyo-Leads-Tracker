
'use client';
import { PageHeader } from "@/components/common/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeePerformance } from "@/components/admin/employee-performance";
import { Leaderboard } from "@/components/admin/leaderboard";
import { TaskAssignmentForm } from "@/components/admin/task-assignment-form";
import { BroadcastForm } from "@/components/admin/broadcast-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Trophy, ClipboardEdit, Loader2, UserPlus, BookCopy } from "lucide-react";
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { AddUserForm } from "@/components/admin/add-user-form";
import { collection, getDocs, query, where, onSnapshot, orderBy, limit, doc, getDoc } from "firebase/firestore";
import type { Employee, PerformanceData, Resource, DailyLog } from "@/lib/types";
import { ResourceManager } from "@/components/admin/resource-manager";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        try {
          // Check if the user has an 'admin' role in Firestore.
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists() && userDocSnapshot.data().role === 'admin') {
            setIsAuthorized(true);
          } else {
             // Not an admin, redirect to employee dashboard
            router.push('/dashboard');
          }
        } catch (error) {
            console.error("Error checking admin status:", error);
            // If we can't check, assume not authorized and redirect.
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

  useEffect(() => {
    if (!isAuthorized) return;
    
    // Subscribe to all users to get employee list
    const usersCollection = collection(db, "users");
    const unsubscribeEmployees = onSnapshot(usersCollection, async (snapshot) => {
      const allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
      const employeeList = allUsers.filter(user => user.role === 'employee');
      setEmployees(employeeList);

      // Fetch performance data for the leaderboard when employees are loaded/updated
      if (allUsers.length > 0) {
        const perfDataPromises = allUsers
          .filter(u => u.role === 'employee')
          .map(async (employee) => {
            const logsCollection = collection(db, "dailyLogs");
            const q = query(
              logsCollection,
              where("employeeId", "==", employee.id),
              orderBy("date", "desc"),
              limit(1) // Get the most recent log
            );
            const logSnapshot = await getDocs(q);
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
        setPerformanceData(perfDataResults.filter(Boolean) as PerformanceData[]);
      }
    }, (error) => {
      console.error("Error fetching users in real-time:", error);
    });

    // Subscribe to resources
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

  }, [isAuthorized]);

  // Render loading state
  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Admin Panel...</p>
      </div>
    );
  }

  // Render redirecting/unauthorized state
  if (!isAuthorized || !user) {
    return (
       <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  // If loading is false and user is authorized, render the admin panel
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
          <TabsList className="grid w-full grid-cols-5">
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
          </TabsList>
          
          <TabsContent value="users" className="mt-4">
             <Card>
                <CardHeader>
                  <CardTitle>Add New User</CardTitle>
                  <CardDescription>
                    Create a new employee or admin account. This will create a user in Firebase Auth and a corresponding record in Firestore.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AddUserForm />
                </CardContent>
              </Card>
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
            <ResourceManager initialResources={resources} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
