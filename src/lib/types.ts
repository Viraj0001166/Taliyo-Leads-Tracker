export interface Employee {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface DailyLog {
  id: string;
  employeeId: string;
  date: string; 
  linkedinConnections: number;
  followUps: number;
  coldEmails: number;
  leadsGenerated: number;
  notes?: string;
}

export interface AssignedTask {
  id: string;
  employeeId: string;
  task: string;
  assignedBy: string;
  isCompleted: boolean;
}

export interface Resource {
  id: string;
  category: string;
  title: string;
  content: string;
}

export interface PerformanceData {
  employeeName: string;
  linkedinConnections: number;
  followUps: number;
  coldEmails: number;
  leadsGenerated: number;
}
