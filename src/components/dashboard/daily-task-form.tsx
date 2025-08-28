"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Send } from "lucide-react"

export function DailyTaskForm() {
  const { toast } = useToast()

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    toast({
      title: "Log Submitted!",
      description: "Your daily performance has been recorded successfully.",
    })
    event.currentTarget.reset();
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
              <Input id="linkedin-connections" type="number" placeholder="e.g. 50" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="follow-ups">Follow-ups</Label>
              <Input id="follow-ups" type="number" placeholder="e.g. 30" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cold-emails">Cold Emails</Label>
              <Input id="cold-emails" type="number" placeholder="e.g. 100" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leads-generated">Leads Generated</Label>
              <Input id="leads-generated" type="number" placeholder="e.g. 5" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Any additional notes or comments..." />
          </div>
          <Button type="submit" className="w-full">
            <Send className="mr-2 h-4 w-4" />
            Submit Log
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
