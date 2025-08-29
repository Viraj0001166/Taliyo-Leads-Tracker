
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Send, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { collection, addDoc, onSnapshot, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { format } from "date-fns"
import type { TaskField, AppConfig, Employee } from "@/lib/types"
import { Skeleton } from "../ui/skeleton"

interface DailyTaskFormProps {
    employeeId: string;
}

export function DailyTaskForm({ employeeId }: DailyTaskFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [taskFields, setTaskFields] = useState<TaskField[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(true);

  useEffect(() => {
    const q = collection(db, 'taskFields');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fields = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaskField));
      setTaskFields(fields);
      setFieldsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const formValues: { [key: string]: any } = {};

    taskFields.forEach(field => {
        formValues[field.name] = Number(formData.get(field.name)) || 0;
    });
    formValues.notes = formData.get('notes') as string;
    
    const currentForm = event.currentTarget;

    const fullLogData = {
        employeeId,
        date: format(new Date(), 'yyyy-MM-dd'),
        submittedAt: new Date().toISOString(),
        ...formValues,
    };

    try {
        // 1. Save to Firestore
        await addDoc(collection(db, 'dailyLogs'), {
            ...fullLogData,
            timestamp: serverTimestamp(),
        });

        // 2. Send to Google Sheet Webhook
        const configDocRef = doc(db, 'config', 'googleSheetWebhookUrl');
        const configDocSnap = await getDoc(configDocRef);
        
        if (configDocSnap.exists()) {
            const config = configDocSnap.data() as AppConfig;
            const userDoc = await getDoc(doc(db, 'users', employeeId));
            const employeeName = userDoc.exists() ? (userDoc.data() as Employee).name : 'Unknown';
            const employeeEmail = auth.currentUser?.email || 'Unknown';

            await fetch(config.url, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...fullLogData,
                    employeeName: employeeName,
                    employeeEmail: employeeEmail,
                }),
            });
        }

        toast({
            title: "Log Submitted!",
            description: "Your daily performance has been recorded successfully.",
        });
        currentForm.reset();
    } catch(e) {
        console.error("Error submitting log:", e);
        toast({
            variant: 'destructive',
            title: "Submission Failed",
            description: "There was an error saving your log. Please try again.",
        })
    } finally {
        setLoading(false);
    }
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Log Daily Tasks</CardTitle>
        <CardDescription>Update your progress for today.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
            {fieldsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {taskFields.map(field => (
                        <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.name}>{field.label}</Label>
                        <Input id={field.name} name={field.name} type="number" placeholder={field.placeholder} required />
                        </div>
                    ))}
                </div>
            )}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Any additional notes or comments..." />
          </div>
          <Button type="submit" className="w-full" disabled={loading || fieldsLoading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {loading ? "Submitting..." : "Submit Log"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
