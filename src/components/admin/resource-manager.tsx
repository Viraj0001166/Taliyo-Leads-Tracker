
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import type { Resource } from "@/lib/types";
import { AddResourceForm } from './add-resource-form';
import { db } from '@/lib/firebase';
import { doc, deleteDoc, collection, writeBatch, getDocs } from 'firebase/firestore';
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
import { initialResourcesData } from '@/lib/data';

interface ResourceManagerProps {
  initialResources: Resource[];
}

export function ResourceManager({ initialResources }: ResourceManagerProps) {
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    setResources(initialResources);
  }, [initialResources]);

  const handleResourceAdded = () => {
    // The parent component's onSnapshot listener will handle the update
  };
  
  const handleDelete = async (resourceId: string) => {
    try {
      await deleteDoc(doc(db, "resources", resourceId));
      // The onSnapshot listener will update the state automatically
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

  const seedInitialData = async () => {
    setIsSeeding(true);
    try {
        const resourcesCollection = collection(db, "resources");
        const snapshot = await getDocs(resourcesCollection);
        if (snapshot.empty) {
            const batch = writeBatch(db);
            initialResourcesData.forEach(resource => {
                const docRef = doc(collection(db, "resources"));
                batch.set(docRef, resource);
            });
            await batch.commit();
            toast({
                title: "Initial Resources Added!",
                description: "Your resource library has been populated with default templates."
            });
        } else {
             toast({
                title: "Database Not Empty",
                description: "Initial resources were not added because the database already contains data.",
                variant: "default"
            });
        }
    } catch(error) {
        console.error("Error seeding data:", error);
        toast({
            variant: "destructive",
            title: "Seeding Failed",
            description: "Could not add initial resources.",
        });
    } finally {
        setIsSeeding(false);
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
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Existing Resources</CardTitle>
                <CardDescription>A list of all currently available resources.</CardDescription>
              </div>
               <Button onClick={seedInitialData} disabled={isSeeding} variant="outline" size="sm">
                {isSeeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Seed Initial Data
              </Button>
            </div>
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
                {resources.map((resource) => (
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
                {resources.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                            No resources found. Click "Seed Initial Data" to add default templates.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
