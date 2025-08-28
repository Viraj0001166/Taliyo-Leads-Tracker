
"use client";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Employee } from "@/lib/types";
import { Send } from "lucide-react";
import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

interface TaskAssignmentFormProps {
  employees: Employee[];
}

export function TaskAssignmentForm({ employees }: TaskAssignmentFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const employeeId = formData.get("employee");
    const task = formData.get("task");
    const currentForm = event.currentTarget;

    if (!employeeId || !task) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Please select an employee and enter a task."
        });
        setLoading(false);
        return;
    }

    const employeeName = employees.find(e => e.id === employeeId)?.name;
    const adminName = auth.currentUser?.displayName || "Admin";

    try {
      await addDoc(collection(db, "tasks"), {
        employeeId,
        task,
        assignedBy: adminName,
        isCompleted: false,
        assignedAt: serverTimestamp()
      });

      toast({
        title: "Task Assigned!",
        description: `Task has been assigned to ${employeeName}.`,
      });
      currentForm.reset();
    } catch (error) {
      console.error("Error assigning task:", error);
      toast({
        variant: "destructive",
        title: "Failed to assign task",
        description: "An unexpected error occurred.",
      });
    } finally {
      setLoading(false);
    }
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
      <Button type="submit" className="w-full" disabled={loading}>
        <Send className="mr-2 h-4 w-4" />
        {loading ? "Assigning..." : "Assign Task"}
      </Button>
    </form>
  );
}
