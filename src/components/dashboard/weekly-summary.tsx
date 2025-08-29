
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
import type { DailyLog, TaskField } from "@/lib/types"
import { format } from "date-fns"
import { useMemo, useState, useEffect } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface WeeklySummaryProps {
  data: DailyLog[]
}

const chartColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];

export function WeeklySummary({ data }: WeeklySummaryProps) {
    const [taskFields, setTaskFields] = useState<TaskField[]>([]);

    useEffect(() => {
        const q = collection(db, 'taskFields');
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const fields = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TaskField));
          setTaskFields(fields);
        });
        return () => unsubscribe();
      }, []);

    const { chartData, chartConfig } = useMemo(() => {
        const config = taskFields.reduce((acc, field, index) => {
            acc[field.name] = {
                label: field.label,
                color: chartColors[index % chartColors.length],
            };
            return acc;
        }, {} as any);

        const aData = data.map(log => {
            const dayData: {[key: string]: any} = {
                date: format(new Date(log.date), 'EEE'),
            };
            taskFields.forEach(field => {
                dayData[field.name] = log[field.name] || 0;
            });
            return dayData;
        });
        return { chartData: aData, chartConfig: config };
    }, [data, taskFields]);

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
            {Object.keys(chartConfig).map(key => (
                 <Bar key={key} dataKey={key} fill={`var(--color-${key})`} radius={4} />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
