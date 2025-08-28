
"use client";

import { useState } from 'react';
import type { Resource } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Loader2 } from 'lucide-react';
import { CopyButton } from '../common/copy-button';

interface ResourceListProps {
  resources: Resource[];
}

export function ResourceList({ resources }: ResourceListProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const groupedResources = resources.reduce((acc, resource) => {
    (acc[resource.category] = acc[resource.category] || []).push(resource);
    return acc;
  }, {} as Record<string, Resource[]>);

  const handleDelete = async (resourceId: string, resourceTitle: string) => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "resources", resourceId));
      toast({
        title: "Resource Deleted",
        description: `"${resourceTitle}" has been successfully deleted.`,
      });
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not delete the resource. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Library</CardTitle>
        <CardDescription>View, edit, or delete existing resources for your team.</CardDescription>
      </CardHeader>
      <CardContent>
        {resources.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No resources found. Add a resource or seed the initial data.</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(groupedResources).map(([category, items]) => (
              <AccordionItem value={category} key={category}>
                <AccordionTrigger className="text-base font-semibold">{category}</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-3 pt-2">
                    {items.map((item) => (
                      <li key={item.id} className="p-3 rounded-md border bg-secondary/30">
                          <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium text-secondary-foreground">{item.title}</h4>
                              <div className="flex items-center gap-1">
                                <CopyButton textToCopy={item.content} />
                                <Button variant="ghost" size="icon" disabled>
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                </Button>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Delete</span>
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Are you sure?</DialogTitle>
                                      <DialogDescription>
                                        This action cannot be undone. This will permanently delete the resource titled "{item.title}".
                                      </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                      <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                      </DialogClose>
                                      <Button
                                        variant="destructive"
                                        onClick={() => handleDelete(item.id, item.title)}
                                        disabled={isDeleting}
                                      >
                                        {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Delete
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              </div>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap font-mono p-2 bg-background rounded-md">
                              {item.content}
                          </p>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
