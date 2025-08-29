
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, collection, onSnapshot, addDoc, deleteDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, PlusCircle, Trash2 } from "lucide-react";
import type { AppConfig, TaskField } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

const webhookFormSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." }),
});

const taskFieldFormSchema = z.object({
  label: z.string().min(2, { message: "Label must be at least 2 characters." }),
  placeholder: z.string().min(2, { message: "Placeholder must be at least 2 characters." }),
});


export function AppSettings() {
  const { toast } = useToast();
  const [isSubmittingWebhook, setIsSubmittingWebhook] = useState(false);
  const [isSubmittingField, setIsSubmittingField] = useState(false);
  const [taskFields, setTaskFields] = useState<TaskField[]>([]);
  const [loadingFields, setLoadingFields] = useState(true);

  const webhookForm = useForm<z.infer<typeof webhookFormSchema>>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: { url: "" },
  });
  
  const taskFieldForm = useForm<z.infer<typeof taskFieldFormSchema>>({
    resolver: zodResolver(taskFieldFormSchema),
    defaultValues: { label: "", placeholder: "" },
  });

  useEffect(() => {
    const fetchWebhookUrl = async () => {
      const docRef = doc(db, "config", "googleSheetWebhookUrl");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        webhookForm.setValue("url", docSnap.data().url);
      }
    };
    fetchWebhookUrl();

    const fieldsQuery = collection(db, "taskFields");
    const unsubscribe = onSnapshot(fieldsQuery, (snapshot) => {
        const fields = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaskField));
        setTaskFields(fields);
        setLoadingFields(false);
    });

    return () => unsubscribe();
  }, [webhookForm]);

  const onWebhookSubmit = async (values: z.infer<typeof webhookFormSchema>) => {
    setIsSubmittingWebhook(true);
    try {
      const docRef = doc(db, "config", "googleSheetWebhookUrl");
      await setDoc(docRef, values);
      toast({ title: "Settings Saved", description: "Google Sheet webhook URL has been updated." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSubmittingWebhook(false);
    }
  };
  
  const onTaskFieldSubmit = async (values: z.infer<typeof taskFieldFormSchema>) => {
    setIsSubmittingField(true);
    try {
      // Create a URL-friendly name from the label, e.g., "LinkedIn Connections" -> "linkedinConnections"
      const name = values.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const finalName = name.replace(/-(\w)/g, (match, letter) => letter.toUpperCase());

      await addDoc(collection(db, "taskFields"), {
          label: values.label,
          placeholder: values.placeholder,
          name: finalName,
      });
      toast({ title: "Field Added", description: `The field "${values.label}" has been added to the daily log form.` });
      taskFieldForm.reset();
    } catch (error: any) {
       toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
        setIsSubmittingField(false);
    }
  };

  const handleDeleteField = async (id: string) => {
    try {
        await deleteDoc(doc(db, 'taskFields', id));
        toast({ title: 'Field Deleted', description: 'The form field has been removed.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the field.' });
    }
  }


  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>Configure global settings for the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...webhookForm}>
            <form onSubmit={webhookForm.handleSubmit(onWebhookSubmit)} className="space-y-4">
              <FormField
                control={webhookForm.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Sheet Webhook URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://script.google.com/macros/s/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmittingWebhook}>
                {isSubmittingWebhook ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
                Save Webhook URL
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>Manage Daily Log Form Fields</CardTitle>
                <CardDescription>Add or remove fields from the employee daily log form.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...taskFieldForm}>
                    <form onSubmit={taskFieldForm.handleSubmit(onTaskFieldSubmit)} className="flex items-end gap-4">
                       <FormField
                        control={taskFieldForm.control}
                        name="label"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Field Label</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. LinkedIn Connections" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={taskFieldForm.control}
                        name="placeholder"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Placeholder</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 50" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={isSubmittingField}>
                        {isSubmittingField ? <Loader2 className="animate-spin" /> : <PlusCircle />}
                        <span className="sr-only">Add Field</span>
                      </Button>
                    </form>
                </Form>

                <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">Current Fields</h3>
                    {loadingFields ? (
                         <div className="flex justify-center items-center h-20">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : (
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Label</TableHead>
                                    <TableHead>Placeholder</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {taskFields.map(field => (
                                    <TableRow key={field.id}>
                                        <TableCell>{field.label}</TableCell>
                                        <TableCell>{field.placeholder}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteField(field.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    )}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
