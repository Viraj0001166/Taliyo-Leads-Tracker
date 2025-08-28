
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
import { collection, query, where, onSnapshot, doc, getDoc, limit, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import type { Employee, AssignedTask, Resource, DailyLog } from "@/lib/types";

async function logVisitor(employee: Employee) {
  try {
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
        
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const empData = { id: userDocSnap.id, ...userDocSnap.data() } as Employee;
            
            if (empData.role === 'admin') {
                router.push('/admin');
                return; 
            }

            setEmployeeData(empData);
            await logVisitor(empData);
            // Data fetching will be triggered by the second useEffect
        } else {
           // This case might happen if a user is deleted from Firestore but not Auth.
           // Or during initial user creation before Firestore doc is set.
           // It can also happen if the user's record hasn't been created yet.
           // Log out to be safe and redirect to login
           await auth.signOut();
           router.push('/');
        }
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!employeeData) return;

    // Set up real-time listeners for employee-specific data
    const tasksCollection = collection(db, "tasks");
    const tasksQuery = query(tasksCollection, where("employeeId", "==", employeeData.id));
    const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
        setAssignedTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AssignedTask)));
    });

    const logsCollection = collection(db, "dailyLogs");
    const logsQuery = query(
      logsCollection, 
      where("employeeId", "==", employeeData.id),
      orderBy("date", "desc"), 
      limit(7)
    );
    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
        setDailyLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyLog)).reverse());
    });

    const resourcesCollection = collection(db, "resources");
    const unsubscribeResources = onSnapshot(resourcesCollection, (snapshot) => {
        setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource)));
    });

    setLoading(false); // Stop loading now that we have data and listeners are set up

    return () => {
        unsubscribeTasks();
        unsubscribeLogs();
        unsubscribeResources();
    };
  }, [employeeData]);

  if (loading || !employeeData) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading Dashboard...</p>
      </div>
    );
  }
  
  const currentUser = {
    name: user?.displayName || employeeData.name,
    email: user?.email || "",
    avatar: user?.photoURL || employeeData.avatar || `https://picsum.photos/seed/${user?.email}/100/100`,
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
