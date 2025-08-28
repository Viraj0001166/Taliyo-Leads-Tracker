
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { Resource } from "@/lib/types";
import { AddResourceForm } from './add-resource-form';
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ResourceManagerProps {
  initialResources: Resource[];
}

export function ResourceManager({ initialResources }: ResourceManagerProps) {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>(initialResources);

  const handleResourceAdded = () => {
    // The parent component will re-fetch and update props
  };
  
  const handleDelete = async (resourceId: string) => {
    try {
      await deleteDoc(doc(db, "resources", resourceId));
      setResources(prev => prev.filter(r => r.id !== resourceId));
      toast({
        title: "Resource Deleted",
        description: "The resource has been removed successfully.",
      });
    } catch (error) {
      console.error("Error deleting resource:", error);
       toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "Could not delete the resource. Please try again.",
      });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Add New Resource</CardTitle>
            <CardDescription>Create a new template or resource for your employees.</CardDescription>
          </CardHeader>
          <CardContent>
            <AddResourceForm onResourceAdded={handleResourceAdded} />
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Existing Resources</CardTitle>
            <CardDescription>A list of all currently available resources.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialResources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell className="font-medium">{resource.category}</TableCell>
                    <TableCell>{resource.title}</TableCell>
                    <TableCell className="text-right">
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="destructive" size="icon">
                              <Trash2 className="h-4 w-4" />
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the resource
                              and remove it from your employees' dashboards.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(resource.id)}>
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
