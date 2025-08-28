
'use client';
import { PageHeader } from "@/components/common/page-header";
import { AssignedTasks } from "@/components/dashboard/assigned-tasks";
import { DailyTaskForm } from "@/components/dashboard/daily-task-form";
import { Resources } from "@/components/dashboard/resources";
import { WeeklySummary } from "@/components/dashboard/weekly-summary";
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { Loader2 } from "lucide-react";
import { collection, query, where, getDocs, doc, getDoc, limit, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import type { Employee, AssignedTask, Resource, DailyLog } from "@/lib/types";

async function logVisitor(employee: Employee) {
  try {
    // We can use a free, simple API to get the user's IP address.
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    
    await addDoc(collection(db, "visitorLogs"), {
      employeeId: employee.id,
      employeeName: employee.name,
      employeeEmail: employee.email,
      loginTime: serverTimestamp(),
      ipAddress: ipData.ip,
      userAgent: navigator.userAgent,
    });
  } catch (error) {
    console.error("Failed to log visitor:", error);
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [employeeData, setEmployeeData] = useState<Employee | null>(null);
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        try {
          // Fetch employee data and check role
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
              const empData = { id: userDocSnap.id, ...userDocSnap.data() } as Employee;
              
              // If user is an admin, redirect them to the admin panel
              if (empData.role === 'admin') {
                  router.push('/admin');
                  // No need to fetch employee data, just exit
                  return; 
              }

              setEmployeeData(empData);
              
              // Log the visitor session for employees
              logVisitor(empData);

              // Fetch assigned tasks
              const tasksCollection = collection(db, "tasks");
              const tasksQuery = query(tasksCollection, where("employeeId", "==", empData.id));
              const tasksSnapshot = await getDocs(tasksQuery);
              setAssignedTasks(tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssignedTask)));

              // Fetch daily logs for the last 7 days for the chart
              const logsCollection = collection(db, "dailyLogs");
              const logsQuery = query(
                logsCollection, 
                where("employeeId", "==", empData.id),
                orderBy("date", "desc"), 
                limit(7)
              );
              const logsSnapshot = await getDocs(logsQuery);
              // Reverse to show oldest first on the chart
              setDailyLogs(logsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyLog)).reverse());
          } else {
            // If user doc doesn't exist, they can't be an employee
             router.push('/');
             return;
          }

          // Fetch resources for all users
          const resourcesCollection = collection(db, "resources");
          const resourcesSnapshot = await getDocs(resourcesCollection);
          setResources(resourcesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource)));

        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }

      } else {
        router.push('/');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading || !user || !employeeData) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Dashboard...</p>
      </div>
    );
  }
  
  const currentUser = {
    name: user.displayName || employeeData.name,
    email: user.email || "",
    avatar: user.photoURL || employeeData.avatar || `https://picsum.photos/seed/${user.email}/100/100`,
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader title="My Dashboard" user={currentUser} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <DailyTaskForm employeeId={employeeData.id} />
          </div>
          <div className="lg:col-span-2">
            <WeeklySummary data={dailyLogs} />
          </div>
          <div className="lg:col-span-2">
            <AssignedTasks tasks={assignedTasks} />
          </div>
          <div className="lg:col-span-2">
            <Resources resources={resources} />
          </div>
        </div>
      </main>
    </div>
  );
}
