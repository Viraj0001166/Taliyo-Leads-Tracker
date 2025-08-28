"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { analyzeEmployeePerformance } from "@/ai/flows/analyze-employee-performance";
import type { Employee } from "@/lib/types";
import { Sparkles, Loader2, AlertTriangle } from "lucide-react";
import { Separator } from "../ui/separator";

interface AIPerformanceAnalyzerProps {
  employee: Employee;
}

type AnalysisState = "idle" | "loading" | "success" | "error";

export function AIPerformanceAnalyzer({ employee }: AIPerformanceAnalyzerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<AnalysisState>("idle");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setState("loading");
    try {
      const weeklyReport = `Weekly performance for ${employee.name}:
- LinkedIn Connections: Average of 45 per day.
- Cold Emails: Sent 350 this week.
- Follow-ups: Completed 210 follow-ups.
- Leads Generated: 12 new qualified leads.
- Notes: Showing strong initiative in prospecting new verticals. Some emails could be more personalized.`;

      const result = await analyzeEmployeePerformance({
        employeeName: employee.name,
        weeklyReport,
      });

      setAnalysis(result.analysis);
      setSuggestions(result.suggestions);
      setState("success");
    } catch (error) {
      console.error("AI Analysis failed:", error);
      setState("error");
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setState("idle");
      setAnalysis(null);
      setSuggestions(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="mr-2 h-4 w-4 text-accent" />
          Analyze with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary"/>
            AI Performance Analysis for {employee.name}
          </DialogTitle>
          <DialogDescription>
            AI-powered insights and suggestions based on recent performance data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {state === "idle" && (
            <div className="text-center p-8">
              <p className="mb-4 text-muted-foreground">Click the button below to start the AI analysis.</p>
              <Button onClick={handleAnalyze}>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Insights
              </Button>
            </div>
          )}
          {state === "loading" && (
            <div className="flex flex-col items-center justify-center gap-4 p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Analyzing performance data...</p>
            </div>
          )}
          {state === "error" && (
             <div className="flex flex-col items-center justify-center gap-4 p-8 text-destructive">
                <AlertTriangle className="h-8 w-8" />
                <p>Failed to generate analysis. Please try again.</p>
                <Button variant="destructive" onClick={handleAnalyze}>Retry</Button>
            </div>
          )}
          {state === "success" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Analysis</h3>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{analysis}</p>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold text-lg mb-2">Suggestions</h3>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap">{suggestions}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
