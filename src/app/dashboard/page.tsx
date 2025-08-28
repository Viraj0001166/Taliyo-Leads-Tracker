
'use client';
import { PageHeader } from "@/components/common/page-header";
import { AssignedTasks } from "@/components/dashboard/assigned-tasks";
import { DailyTaskForm } from "@/components/dashboard/daily-task-form";
import { Resources } from "@/components/dashboard/resources";
import { WeeklySummary } from "@/components/dashboard/weekly-summary";
import { employees, assignedTasks, resources, dailyLogs } from "@/lib/data";
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
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
        <p>Loading...</p>
      </div>
    );
  }
  
  const employeeData = employees.find(e => e.email === user.email) || employees.find(e => e.email === 'virajsrivastav016@gmail.com') || employees[1];
  const userTasks = assignedTasks.filter(task => task.employeeId === employeeData.id);
  const userLogs = dailyLogs.filter(log => log.employeeId === employeeData.id);

  const currentUser = {
    name: user.displayName || employeeData.name,
    email: user.email || "",
    avatar: user.photoURL || employeeData.avatar,
  };


  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader title="My Dashboard" user={currentUser} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <DailyTaskForm />
          </div>
          <div className="lg:col-span-2">
            <WeeklySummary data={userLogs} />
          </div>
          <div className="lg:col-span-2">
            <AssignedTasks tasks={userTasks} />
          </div>
          <div className="lg:col-span-2">
            <Resources resources={resources} />
          </div>
        </div>
      </main>
    </div>
  );
}
