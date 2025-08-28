"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Megaphone } from "lucide-react";

export function BroadcastForm() {
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const message = formData.get("message");
    
    if (!message) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Message cannot be empty."
        })
        return;
    }

    toast({
      title: "Notification Sent!",
      description: "Your message has been broadcast to all employees.",
    });
    event.currentTarget.reset();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="broadcast-message">Message</Label>
        <Textarea
          id="broadcast-message"
          name="message"
          placeholder="e.g., 'Team meeting tomorrow at 10 AM to discuss Q3 goals.'"
          required
          rows={5}
        />
      </div>
      <Button type="submit" className="w-full">
        <Megaphone className="mr-2 h-4 w-4" />
        Send Broadcast
      </Button>
    </form>
  );
}
