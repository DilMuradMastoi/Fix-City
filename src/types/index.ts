export type Role = 'user' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  createdAt: string;
}

export type IssueCategory =
  | 'Garbage'
  | 'Road Damage'
  | 'Street Light'
  | 'Water Leakage'
  | 'Infrastructure'
  | 'Environment'
  | 'Traffic'
  | 'Safety'
  | 'Other';

export type IssueStatus = 'Reported' | 'Under Review' | 'In Progress' | 'Resolved';
export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface LocationData {
  address: string;
  latitude: number;
  longitude: number;
}

export interface StatusHistoryItem {
  status: IssueStatus;
  changedAt: string;
  changedBy: string;
  note?: string;
}

export interface Report {
  _id: string;
  title: string;
  description: string;
  category: IssueCategory;
  image: string;
  location: LocationData;
  status: IssueStatus;
  priority: IssuePriority;
  reportedBy: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
  upvotes: string[]; // List of user IDs
  statusHistory?: StatusHistoryItem[];
  officialResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalReports: number;
  resolvedReports: number;
  inProgressReports: number;
  underReviewReports: number;
  reportedPending: number;
  highOrCritical: number;
  resolutionRate: number;
  categoryData: { name: string; value: number }[];
  statusData: { name: string; value: number; color: string }[];
  priorityData: { name: string; count: number }[];
  timelineTrends: { month: string; reported: number; resolved: number }[];
}

export interface AIAssessmentResponse {
  category: IssueCategory;
  priority: IssuePriority;
  suggestedTitle: string;
  suggestedDescription: string;
  severityReasoning: string;
  confidenceScore: number;
  tags: string[];
}
