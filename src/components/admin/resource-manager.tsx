
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Resource } from "@/lib/types";
import { AddResourceForm } from './add-resource-form';
import { ResourceList } from './resource-list';
import { db } from '@/lib/firebase';
import { collection, writeBatch, getDocs, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { initialResourcesData } from '@/lib/data';

interface ResourceManagerProps {
  resources: Resource[];
}

export function ResourceManager({ resources }: ResourceManagerProps) {
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);

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
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Add New Resource</CardTitle>
            <CardDescription>Create a new template or a handy link for your team.</CardDescription>
          </CardHeader>
          <CardContent>
            <AddResourceForm />
             <div className="mt-4 border-t pt-4">
                 <Button onClick={seedInitialData} disabled={isSeeding || resources.length > 0} variant="outline" size="sm" className="w-full">
                    {isSeeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Seed Initial Data
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <ResourceList resources={resources} />
      </div>
    </div>
  );
}
