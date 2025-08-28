
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

export const initialResourcesData: Omit<Resource, 'id'>[] = [
    // Email Templates
    { category: "Email Templates", title: "Cold Outreach", content: "Subject: Quick Question\n\nHi [Name],\n\nI came across your company and noticed [specific thing]. We help businesses like yours achieve [benefit].\n\nWould you be open to a quick 10-min call this week?\n\nRegards,\n[Your Name]" },
    { category: "Email Templates", title: "Follow-Up (No Reply)", content: "Hi [Name],\n\nJust following up on my earlier email.\n\nWe’ve helped [similar company] increase [metric] by [X%].\n\nCan we schedule a quick chat?\n\nBest,\n[Your Name]" },
    { category: "Email Templates", title: "Meeting Confirmation", content: "Hi [Name],\n\nThis is to confirm our meeting scheduled on [Date, Time].\n\nHere’s the Zoom link: [link]\n\nLooking forward!\n\nBest,\n[Your Name]" },
    
    // Lead Generation Tools
    { category: "Lead Generation Tools", title: "Free Directories", content: "Google My Business\nLinkedIn Company Search\nJustDial / IndiaMart" },
    { category: "Lead Generation Tools", title: "Scraping Tools (Free/Trial)", content: "Apollo.io (free 50 leads/month)\nSkrapp.io\nHunter.io" },
    
    // Outreach Scripts (Phone/WhatsApp)
    { category: "Outreach Scripts (Phone/WhatsApp)", title: "Cold Call Script", content: "Hi [Name], I’m [Your Name] from Taliyo Technologies.\n\nWe help businesses with [service].\n\nMay I take 2 minutes to explain how it can benefit your company?" },
    { category: "Outreach Scripts (Phone/WhatsApp)", title: "WhatsApp Intro Script", content: "Hello [Name],\n\nI’m [Your Name] from Taliyo Technologies. We recently helped [industry example] achieve [result].\n\nWould you be interested in knowing how we can do the same for you?" },
    
    // Daily Task Sheets
    { category: "Daily Task Sheets", title: "Sample Day Plan", content: "9:00–10:00 → Collect 20 new leads\n\n10:00–12:00 → Send cold emails\n\n12:00–1:00 → Follow up yesterday’s emails\n\n2:00–4:00 → Cold calling (min. 15 calls)\n\n4:00–5:00 → Daily report update" },
];


export const resources: Resource[] = []; // Fetched from Firestore now

export const performanceData: PerformanceData[] = []; // Calculated or fetched from Firestore now
