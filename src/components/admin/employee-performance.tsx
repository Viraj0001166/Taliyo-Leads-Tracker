import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Employee } from "@/lib/types";
import { AIPerformanceAnalyzer } from "./ai-performance-analyzer";

interface EmployeePerformanceProps {
  employees: Employee[];
}

export function EmployeePerformance({ employees }: EmployeePerformanceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Performance</CardTitle>
        <CardDescription>An overview of daily performance metrics for all employees.</CardDescription>
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
                <TableCell className="text-center font-medium">{Math.floor(Math.random() * 50) + 10}</TableCell>
                <TableCell className="text-center font-medium">{Math.floor(Math.random() * 40) + 10}</TableCell>
                <TableCell className="text-center font-medium">{Math.floor(Math.random() * 80) + 20}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={Math.random() > 0.5 ? "default" : "secondary"}>
                    {Math.floor(Math.random() * 5)}
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
