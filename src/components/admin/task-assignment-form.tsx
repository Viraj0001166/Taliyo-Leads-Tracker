"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Employee } from "@/lib/types";
import { Send } from "lucide-react";

interface TaskAssignmentFormProps {
  employees: Employee[];
}

export function TaskAssignmentForm({ employees }: TaskAssignmentFormProps) {
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const employeeId = formData.get("employee");
    const task = formData.get("task");

    if (!employeeId || !task) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Please select an employee and enter a task."
        })
        return;
    }

    const employeeName = employees.find(e => e.id === employeeId)?.name;

    toast({
      title: "Task Assigned!",
      description: `Task has been assigned to ${employeeName}.`,
    });
    event.currentTarget.reset();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="employee-select">Select Employee</Label>
        <Select name="employee">
          <SelectTrigger id="employee-select">
            <SelectValue placeholder="Choose an employee" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((employee) => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="task-description">Task Description</Label>
        <Textarea
          id="task-description"
          name="task"
          placeholder="e.g., 'Focus on following up with enterprise leads this week.'"
          required
        />
      </div>
      <Button type="submit" className="w-full">
        <Send className="mr-2 h-4 w-4" />
        Assign Task
      </Button>
    </form>
  );
}
