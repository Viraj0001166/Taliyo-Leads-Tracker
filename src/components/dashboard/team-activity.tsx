
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { FakeEmployee } from '@/lib/types';
import { format } from 'date-fns';
import { Loader2, UserCheck } from 'lucide-react';

const maskEmail = (email: string) => {
  const [localPart, domain] = email.split('@');
  if (localPart.length <= 4) {
    return `${localPart}****@${domain}`;
  }
  return `${localPart.substring(0, 4)}****@${domain}`;
};

const getStatusVariant = (status: FakeEmployee['status']): "default" | "secondary" | "destructive" => {
    switch (status) {
        case 'Active':
            return 'default';
        case 'Training':
            return 'secondary';
        case 'Inactive':
            return 'destructive';
        default:
            return 'secondary';
    }
};

export function TeamActivity() {
  const [employees, setEmployees] = useState<FakeEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const q = query(collection(db, 'fakeEmployees'), orderBy('joinDate', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const employeeList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FakeEmployee));
      setEmployees(employeeList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching fake employees:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const latestEmployee = employees.length > 0 ? employees[0] : null;

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
        const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              employee.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || employee.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
  }, [employees, searchTerm, statusFilter]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Activity</CardTitle>
        <CardDescription>A list of team members and their current status.</CardDescription>
      </CardHeader>
      <CardContent>
        {latestEmployee && (
            <Alert className="mb-4 bg-primary/10 border-primary/20">
                <UserCheck className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary">New Team Member!</AlertTitle>
                <AlertDescription>
                    Welcome {latestEmployee.name}! Joined on {format(new Date(latestEmployee.joinDate.seconds * 1000), 'dd MMM yyyy')}.
                </AlertDescription>
            </Alert>
        )}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Input 
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="w-full overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredEmployees.length > 0 ? filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{maskEmail(employee.email)}</TableCell>
                    <TableCell>Added on: {format(new Date(employee.joinDate.seconds * 1000), 'dd MMM yyyy')}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusVariant(employee.status)}>{employee.status}</Badge>
                    </TableCell>
                </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            No team members found.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
