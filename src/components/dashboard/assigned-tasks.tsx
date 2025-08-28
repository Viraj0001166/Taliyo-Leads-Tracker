"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { AssignedTask } from "@/lib/types";

interface AssignedTasksProps {
  tasks: AssignedTask[];
}

export function AssignedTasks({ tasks }: AssignedTasksProps) {
  const [taskStatus, setTaskStatus] = React.useState<Record<string, boolean>>(
    tasks.reduce((acc, task) => ({ ...acc, [task.id]: task.isCompleted }), {})
  );

  const handleCheckedChange = (taskId: string) => {
    setTaskStatus(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Assigned Tasks</CardTitle>
        <CardDescription>Tasks assigned to you by your admin.</CardDescription>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <ul className="space-y-4">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-start space-x-3">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={taskStatus[task.id]}
                  onCheckedChange={() => handleCheckedChange(task.id)}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor={`task-${task.id}`}
                    className={`font-medium ${taskStatus[task.id] ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {task.task}
                  </Label>
                  <p className="text-sm text-muted-foreground">Assigned by {task.assignedBy}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>No tasks assigned yet. Great job!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
