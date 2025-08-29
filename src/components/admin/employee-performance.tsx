

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Employee, DailyLog, TaskField } from "@/lib/types";
import { AIPerformanceAnalyzer } from "./ai-performance-analyzer";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface EmployeePerformanceProps {
  employees: Employee[];
}

interface PerformanceMetrics {
  [employeeId: string]: {
    [key: string]: number | string;
  };
}

export function EmployeePerformance({ employees }: EmployeePerformanceProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});
  const [taskFields, setTaskFields] = useState<TaskField[]>([]);

  useEffect(() => {
    const q = collection(db, 'taskFields');
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fields = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaskField));
        setTaskFields(fields);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchMetrics = async () => {
      const newMetrics: PerformanceMetrics = {};
      for (const employee of employees) {
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
          newMetrics[employee.id] = lastLog;
        } else {
          newMetrics[employee.id] = {};
        }
      }
      setMetrics(newMetrics);
    };

    if (employees.length > 0) {
      fetchMetrics();
    }
  }, [employees]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Performance</CardTitle>
        <CardDescription>An overview of the most recently logged performance metrics for all employees.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Employee</TableHead>
                    {taskFields.map(field => (
                        <TableHead key={field.id} className="text-center">{field.label}</TableHead>
                    ))}
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {employees.map((employee) => (
                <TableRow key={employee.id}>
                    <TableCell>
                    <div className="flex items-center gap-3 min-w-[200px]">
                        <Avatar>
                        <AvatarImage src={employee.avatar} alt={employee.name} />
                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                        </div>
                    </div>
                    </TableCell>
                    {taskFields.map(field => (
                        <TableCell key={field.id} className="text-center font-medium">
                            {metrics[employee.id]?.[field.name] ?? 'N/A'}
                        </TableCell>
                    ))}
                    <TableCell className="text-right">
                    <AIPerformanceAnalyzer employee={employee} />
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
