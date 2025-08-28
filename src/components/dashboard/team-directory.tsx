
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Employee } from "@/lib/types";

interface TeamDirectoryProps {
    employees: Employee[];
}

export function TeamDirectory({ employees }: TeamDirectoryProps) {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Directory</CardTitle>
        <CardDescription>A list of all team members.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
            <div className="space-y-4">
            {employees.map((employee) => (
                <div key={employee.id} className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={employee.avatar} alt={employee.name} />
                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-medium leading-none">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                    </div>
                </div>
            ))}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
