
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Employee, DailyLog } from "@/lib/types";
import { AIPerformanceAnalyzer } from "./ai-performance-analyzer";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface EmployeePerformanceProps {
  employees: Employee[];
}

interface PerformanceMetrics {
  [employeeId: string]: {
    connections: number;
    followUps: number;
    emails: number;
    leads: number;
  };
}

export function EmployeePerformance({ employees }: EmployeePerformanceProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});

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
          newMetrics[employee.id] = {
            connections: lastLog.linkedinConnections,
            followUps: lastLog.followUps,
            emails: lastLog.coldEmails,
            leads: lastLog.leadsGenerated,
          };
        } else {
          newMetrics[employee.id] = { connections: 0, followUps: 0, emails: 0, leads: 0 };
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead className="text-center">Connections</TableHead>
              <TableHead className="text-center">Follow-ups</TableHead>
              <TableHead className="text-center">Emails Sent</TableHead>
              <TableHead className="text-center">Leads</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
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
                <TableCell className="text-center font-medium">{metrics[employee.id]?.connections ?? 'N/A'}</TableCell>
                <TableCell className="text-center font-medium">{metrics[employee.id]?.followUps ?? 'N/A'}</TableCell>
                <TableCell className="text-center font-medium">{metrics[employee.id]?.emails ?? 'N/A'}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={ (metrics[employee.id]?.leads ?? 0) > 0 ? "default" : "secondary"}>
                    {metrics[employee.id]?.leads ?? 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <AIPerformanceAnalyzer employee={employee} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
