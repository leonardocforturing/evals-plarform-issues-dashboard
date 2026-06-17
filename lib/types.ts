export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type IssueType = 'Bug' | 'Feature Request' | 'Other';
export type Status = 'Triage' | 'In Progress' | 'In Review' | 'Done';

export interface Issue {
  id: string;
  github_issue_number: number;
  type: IssueType;
  component: string;
  title: string;
  description: string;
  steps_to_reproduce?: string;
  priority: Priority;
  submitted_by: string;
  timestamp: string;
  status: Status;
}