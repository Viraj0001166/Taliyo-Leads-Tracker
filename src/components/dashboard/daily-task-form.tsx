
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Send, Loader2 } from "lucide-react"
import { useState } from "react"
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { format } from "date-fns"

interface DailyTaskFormProps {
    employeeId: string;
}

export function DailyTaskForm({ employeeId }: DailyTaskFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const formValues = {
        linkedinConnections: Number(formData.get('linkedin-connections')),
        followUps: Number(formData.get('follow-ups')),
        coldEmails: Number(formData.get('cold-emails')),
        leadsGenerated: Number(formData.get('leads-generated')),
        notes: formData.get('notes') as string,
    };
    const currentForm = event.currentTarget;

    try {
        await addDoc(collection(db, 'dailyLogs'), {
            employeeId,
            date: format(new Date(), 'yyyy-MM-dd'),
            ...formValues
        });

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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin-connections">LinkedIn Connections</Label>
              <Input id="linkedin-connections" name="linkedin-connections" type="number" placeholder="e.g. 50" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="follow-ups">Follow-ups</Label>
              <Input id="follow-ups" name="follow-ups" type="number" placeholder="e.g. 30" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cold-emails">Cold Emails</Label>
              <Input id="cold-emails" name="cold-emails" type="number" placeholder="e.g. 100" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leads-generated">Leads Generated</Label>
              <Input id="leads-generated" name="leads-generated" type="number" placeholder="e.g. 5" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" placeholder="Any additional notes or comments..." />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {loading ? "Submitting..." : "Submit Log"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
