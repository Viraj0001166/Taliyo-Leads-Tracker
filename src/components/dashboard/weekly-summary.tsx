"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { DailyLog } from "@/lib/types"
import { format, parseISO } from "date-fns"

const chartConfig = {
  linkedinConnections: {
    label: "LinkedIn",
    color: "hsl(var(--chart-1))",
  },
  coldEmails: {
    label: "Emails",
    color: "hsl(var(--chart-2))",
  },
  leadsGenerated: {
    label: "Leads",
    color: "hsl(var(--chart-3))",
  },
}

interface WeeklySummaryProps {
  data: DailyLog[]
}

export function WeeklySummary({ data }: WeeklySummaryProps) {
    const chartData = data.map(log => ({
        date: format(new Date(log.date), 'EEE'),
        linkedinConnections: log.linkedinConnections,
        coldEmails: log.coldEmails,
        leadsGenerated: log.leadsGenerated,
    }));

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Weekly Summary</CardTitle>
        <CardDescription>Your performance over the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="w-full h-full min-h-[250px]">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis />
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="linkedinConnections" fill="var(--color-linkedinConnections)" radius={4} />
            <Bar dataKey="coldEmails" fill="var(--color-coldEmails)" radius={4} />
            <Bar dataKey="leadsGenerated" fill="var(--color-leadsGenerated)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
