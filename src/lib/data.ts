
import type { Employee, DailyLog, AssignedTask, Resource, PerformanceData } from './types';

// This file is now deprecated for providing live data.
// It can be used for initial seeding or testing, but the application now fetches data from Firestore.

export const employees: Employee[] = [
  { id: '1', name: 'Aarav Sharma', email: 'aarav.sharma@example.com', avatar: 'https://picsum.photos/id/1005/100/100', role: 'employee' },
  { id: '2', name: 'Viraj Srivastav', email: 'virajsrivastav016@gmail.com', avatar: 'https://picsum.photos/id/1011/100/100', role: 'employee' },
  { id: '3', name: 'Rohan Mehta', email: 'rohan.mehta@example.com', avatar: 'https://picsum.photos/id/1012/100/100', role: 'employee' },
  { id: '4', name: 'Sneha Reddy', email: 'sneha.reddy@example.com', avatar: 'https://picsum.photos/id/1027/100/100', role: 'employee' },
];

export const dailyLogs: DailyLog[] = [
  // Logs for Aarav Sharma (employee 1)
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `log1_${i}`,
    employeeId: '1',
    date: `2023-10-${20 + i}`,
    linkedinConnections: Math.floor(Math.random() * 20) + 30,
    followUps: Math.floor(Math.random() * 15) + 20,
    coldEmails: Math.floor(Math.random() * 30) + 40,
    leadsGenerated: Math.floor(Math.random() * 5) + 1,
  })),
  // Logs for Viraj Srivastav (employee 2)
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `log2_${i}`,
    employeeId: '2',
    date: `2023-10-${20 + i}`,
    linkedinConnections: Math.floor(Math.random() * 25) + 35,
    followUps: Math.floor(Math.random() * 20) + 25,
    coldEmails: Math.floor(Math.random() * 25) + 35,
    leadsGenerated: Math.floor(Math.random() * 7) + 2,
  })),
];

export const assignedTasks: AssignedTask[] = []; // Fetched from Firestore now

export const resources: Resource[] = []; // Fetched from Firestore now

export const performanceData: PerformanceData[] = []; // Calculated or fetched from Firestore now
