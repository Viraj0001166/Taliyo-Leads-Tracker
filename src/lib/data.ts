import type { Employee, DailyLog, AssignedTask, Resource, PerformanceData } from './types';

export const employees: Employee[] = [
  { id: '1', name: 'Aarav Sharma', email: 'aarav.sharma@example.com', avatar: 'https://picsum.photos/id/1005/100/100' },
  { id: '2', name: 'Priya Patel', email: 'priya.patel@example.com', avatar: 'https://picsum.photos/id/1011/100/100' },
  { id: '3', name: 'Rohan Mehta', email: 'rohan.mehta@example.com', avatar: 'https://picsum.photos/id/1012/100/100' },
  { id: '4', name: 'Sneha Reddy', email: 'sneha.reddy@example.com', avatar: 'https://picsum.photos/id/1027/100/100' },
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
  // Logs for Priya Patel (employee 2)
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

export const assignedTasks: AssignedTask[] = [
  { id: 'task1', employeeId: '1', task: 'Reach out to 50 potential leads on LinkedIn this week.', assignedBy: 'Admin', isCompleted: false },
  { id: 'task2', employeeId: '1', task: 'Follow up with all leads from the tech conference.', assignedBy: 'Admin', isCompleted: true },
  { id: 'task3', employeeId: '2', task: 'Prepare the sales script for the new product launch.', assignedBy: 'Admin', isCompleted: false },
];

export const resources: Resource[] = [
  {
    id: 'res1',
    category: 'LinkedIn',
    title: 'Initial Connection Request',
    content: `Hi {FirstName}, I came across your profile and was impressed by your work in the {Industry} space. I'd love to connect and learn more about what you do.`,
  },
  {
    id: 'res2',
    category: 'Email',
    title: 'Cold Email Template',
    content: `Subject: Quick Question about {Company}\n\nHi {FirstName},\n\nMy name is {YourName} and I'm with {YourCompany}. We help businesses like yours to achieve {Benefit}. I'd love to show you how we can help you. Are you available for a quick 15-minute call next week?\n\nBest,\n{YourName}`,
  },
  {
    id: 'res3',
    category: 'WhatsApp',
    title: 'Follow-Up Message',
    content: `Hi {FirstName}, just following up on our conversation from last week. Have you had a chance to look at the proposal I sent over? Let me know if you have any questions!`,
  },
  {
    id: 'res4',
    category: 'Instagram',
    title: 'Insta Caption Idea',
    content: `Just wrapped up an amazing week of connecting with new people and generating leads! 🚀 Always exciting to see the hard work pay off. #Sales #LeadGen #Motivation`,
  },
];

export const performanceData: PerformanceData[] = [
  { employeeName: 'Aarav Sharma', linkedinConnections: 250, followUps: 180, coldEmails: 350, leadsGenerated: 25 },
  { employeeName: 'Priya Patel', linkedinConnections: 300, followUps: 220, coldEmails: 310, leadsGenerated: 35 },
  { employeeName: 'Rohan Mehta', linkedinConnections: 220, followUps: 150, coldEmails: 300, leadsGenerated: 20 },
  { employeeName: 'Sneha Reddy', linkedinConnections: 280, followUps: 200, coldEmails: 380, leadsGenerated: 30 },
];
