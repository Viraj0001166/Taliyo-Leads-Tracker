import { PageHeader } from "@/components/common/page-header";
import { AssignedTasks } from "@/components/dashboard/assigned-tasks";
import { DailyTaskForm } from "@/components/dashboard/daily-task-form";
import { Resources } from "@/components/dashboard/resources";
import { WeeklySummary } from "@/components/dashboard/weekly-summary";
import { employees, assignedTasks, resources, dailyLogs } from "@/lib/data";

export default function DashboardPage() {
  const currentUser = employees[0]; // Mock current user
  const userTasks = assignedTasks.filter(task => task.employeeId === currentUser.id);
  const userLogs = dailyLogs.filter(log => log.employeeId === currentUser.id);

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
