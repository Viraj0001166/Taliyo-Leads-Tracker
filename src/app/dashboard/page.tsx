
'use client';
import { PageHeader } from "@/components/common/page-header";
import { AssignedTasks } from "@/components/dashboard/assigned-tasks";
import { DailyTaskForm } from "@/components/dashboard/daily-task-form";
import { Resources } from "@/components/dashboard/resources";
import { WeeklySummary } from "@/components/dashboard/weekly-summary";
import { Announcements } from "@/components/dashboard/announcements";
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { Loader2 } from "lucide-react";
import { collection, query, where, onSnapshot, doc, getDoc, limit, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import type { Employee, AssignedTask, Resource, DailyLog, Announcement } from "@/lib/types";
import { TeamActivity } from "@/components/dashboard/team-activity";

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
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
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
        } else {
           // If user doc doesn't exist, they are not a valid employee.
           await auth.signOut();
           router.push('/employee/login');
        }
      } else {
        router.push('/employee/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!employeeData) return;

    // Listener for all employees for the directory
    const announcementRef = doc(db, "announcements", "latest");
    const unsubscribeAnnouncement = onSnapshot(announcementRef, (doc) => {
        if (doc.exists()) {
            setAnnouncement({ id: doc.id, ...doc.data()} as Announcement);
        }
    });

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
      try {
        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DailyLog));
        setDailyLogs(logs.reverse());
      } catch (error) {
        console.error("Error processing daily logs:", error);
        // If there's an error (e.g., missing index), you can set logs to empty
        setDailyLogs([]);
      }
    });


    const resourcesCollection = collection(db, "resources");
    const unsubscribeResources = onSnapshot(resourcesCollection, (snapshot) => {
        setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Resource)));
    });

    setLoading(false);

    return () => {
        unsubscribeTasks();
        unsubscribeLogs();
        unsubscribeResources();
        unsubscribeAnnouncement();
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
          <div className="lg:col-span-4">
            <TeamActivity />
          </div>
          <div className="lg:col-span-4">
             <Announcements announcement={announcement} />
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
