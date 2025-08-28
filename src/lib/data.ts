
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
    { category: "Email Templates", title: "Cold Outreach", content: "Hi [Name], I saw..." },
    { category: "Email Templates", title: "Follow-up Emails", content: "Hi [Name], just following up on..." },
    { category: "Email Templates", title: "Meeting Request", content: "Hi [Name], are you available for a brief chat..." },
    { category: "Email Templates", title: "Service Pitch", content: "Hi [Name], we offer services that can..." },
    // Lead Generation Tools & Links
    { category: "Lead Generation Tools & Links", title: "LinkedIn Filters (saved searches)", content: "Link to saved search: [URL]" },
    { category: "Lead Generation Tools & Links", title: "Apollo.io free sign-up link", content: "https://www.apollo.io/" },
    { category: "Lead Generation Tools & Links", title: "Hunter.io free email extractor link", content: "https://hunter.io/" },
    { category: "Lead Generation Tools & Links", title: "Crunchbase free directory", content: "https://www.crunchbase.com/" },
    { category: "Lead Generation Tools & Links", title: "Google Search Hacks", content: "site:linkedin.com/in/ \"[Job Title]\" \"[Industry]\"" },
    // Scripts
    { category: "Scripts", title: "Cold Calling Script", content: "Hello, am I speaking with [Name]?" },
    { category: "Scripts", title: "WhatsApp Outreach Script", content: "Hi [Name], I got your number from..." },
    { category: "Scripts", title: "LinkedIn Connection Request Script", content: "Hi [Name], I'd like to connect. I see we're both in the [Industry] space." },
    { category: "Scripts", title: "Demo Pitch Script", content: "In this demo, I'll walk you through..." },
    // Daily Task Sheet / Workflow
    { category: "Daily Task Sheet / Workflow", title: "Excel / Google Sheet task tracker", content: "Link to template: [URL]" },
    { category: "Daily Task Sheet / Workflow", title: "Daily Leads Target: 50 connections, 20 emails, 5 replies", content: "A reminder of the daily targets to hit." },
    // Training & Tutorials
    { category: "Training & Tutorials", title: "How to use LinkedIn Search Filters (Step by Step PDF)", content: "Link to PDF: [URL]" },
    { category: "Training & Tutorials", title: "How to extract emails using Hunter.io", content: "Link to tutorial: [URL]" },
    { category: "Training & Tutorials", title: "How to qualify a lead", content: "A qualified lead is someone who..." },
    // Motivation & Guidelines
    { category: "Motivation & Guidelines", title: "Best Practices in Sales", content: "1. Always listen more than you talk. 2. ..." },
    { category: "Motivation & Guidelines", title: "Do’s & Don’ts in Client Outreach", content: "DO: Personalize every message. DON'T: Use a generic template without changes." },
    { category: "Motivation & Guidelines", title: "Daily Motivation Quotes / Small Video Links", content: "Link to today's quote: [URL]" },
];

export const resources: Resource[] = []; // Fetched from Firestore now

export const performanceData: PerformanceData[] = []; // Calculated or fetched from Firestore now
