
export interface Employee {
  id: string; // This will be the Firebase Auth UID
  name: string;
  email: string;
  avatar: string;
  role: 'employee' | 'admin';
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
  assignedAt: {
      seconds: number,
      nanoseconds: number
  };
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
