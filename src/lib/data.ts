
import type { Resource } from './types';

// This file is used for seeding the initial data into Firestore.

export const initialResourcesData: Omit<Resource, 'id'>[] = [
    // Email Templates
    { 
        category: "Email Templates", 
        title: "Cold Outreach", 
        content: "Subject: Quick Question\n\nHi [Name],\n\nI came across your company and noticed [specific thing]. We help businesses like yours achieve [benefit].\n\nWould you be open to a quick 10-min call this week?\n\nRegards,\n[Your Name]" 
    },
    { 
        category: "Email Templates", 
        title: "Follow-Up (No Reply)", 
        content: "Hi [Name],\n\nJust following up on my earlier email.\n\nWe’ve helped [similar company] increase [metric] by [X%].\n\nCan we schedule a quick chat?\n\nBest,\n[Your Name]" 
    },
    { 
        category: "Email Templates", 
        title: "Meeting Confirmation", 
        content: "Hi [Name],\n\nThis is to confirm our meeting scheduled on [Date, Time].\n\nHere’s the Zoom link: [link]\n\nLooking forward!\n\nBest,\n[Your Name]" 
    },
    
    // Lead Generation Tools
    { 
        category: "Lead Generation Tools & Links", 
        title: "Free Directories", 
        content: "Google My Business\nLinkedIn Company Search\nJustDial / IndiaMart" 
    },
    { 
        category: "Lead Generation Tools & Links", 
        title: "Scraping Tools (Free/Trial)", 
        content: "Apollo.io (free 50 leads/month)\nSkrapp.io\nHunter.io" 
    },
    
    // Outreach Scripts (Phone/WhatsApp)
    { 
        category: "Scripts", 
        title: "Cold Call Script", 
        content: "Hi [Name], I’m [Your Name] from Taliyo Technologies.\n\nWe help businesses with [service].\n\nMay I take 2 minutes to explain how it can benefit your company?" 
    },
    { 
        category: "Scripts", 
        title: "WhatsApp Intro Script", 
        content: "Hello [Name],\n\nI’m [Your Name] from Taliyo Technologies. We recently helped [industry example] achieve [result].\n\nWould you be interested in knowing how we can do the same for you?" 
    },
    
    // Daily Task Sheets
    { 
        category: "Daily Task Sheet / Workflow", 
        title: "Sample Day Plan", 
        content: "9:00–10:00 → Collect 20 new leads\n\n10:00–12:00 → Send cold emails\n\n12:00–1:00 → Follow up yesterday’s emails\n\n2:00–4:00 → Cold calling (min. 15 calls)\n\n4:00–5:00 → Daily report update" 
    },
];
