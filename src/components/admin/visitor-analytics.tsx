
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { VisitorLog } from '@/lib/types';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export function VisitorAnalytics() {
  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const logsCollection = collection(db, "visitorLogs");
    const q = query(logsCollection, orderBy("loginTime", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VisitorLog));
      setVisitorLogs(logs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching visitor logs:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Visitor Analytics</CardTitle>
        <CardDescription>
          A log of employee logins, including their IP address and browser information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Login Time</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>System (User Agent)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitorLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                     <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={`https://picsum.photos/seed/${log.employeeEmail}/100/100`} alt={log.employeeName} />
                            <AvatarFallback>{log.employeeName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{log.employeeName}</p>
                            <p className="text-sm text-muted-foreground">{log.employeeEmail}</p>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(log.loginTime.seconds * 1000), 'PPpp')}
                  </TableCell>
                  <TableCell>{log.ipAddress}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.userAgent}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
