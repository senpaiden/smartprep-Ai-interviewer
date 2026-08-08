/* ===== TypeScript Types ===== */

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  role: 'candidate' | 'admin';
  is_email_verified: boolean;
  avatar: string | null;
  profile: Profile;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  phone: string;
  bio: string;
  education: Education[];
  experience: Experience[];
  skills: string[];
  social_links: Record<string, string>;
  profile_completion: number;
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

export interface CandidateProfile {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  missionsCount: number;
  weak_topics: string[];
}

export interface Interview {
  id: string;
  interview_type: InterviewType;
  difficulty: Difficulty;
  status: InterviewStatus;
  duration_minutes: number;
  total_questions: number;
  language: string;
  tech_stack: string[];
  company: string;
  role: string;
  candidate_id: string;
  covered_days: number[];
  overall_score: number;
  technical_score: number;
  communication_score: number;
  confidence_score: number;
  english_fluency_score: number;
  grammar_score: number;
  problem_solving_score: number;
  current_question_index: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  questions: InterviewQuestion[];
  questions_answered: number;
  recording_url?: string;
  ai_summary?: {
    overall_feedback: string;
    top_strengths: string[];
    areas_to_improve: string[];
    recommended_topics: string[];
    overall_score: number;
    hire_recommendation: string;
  };
}

export type InterviewType = 'hr' | 'technical' | 'coding' | 'behavioral' | 'company_specific' | 'custom';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type InterviewStatus = 'setup' | 'in_progress' | 'completed' | 'cancelled';

export type InterviewRole =
  | 'full-stack' | 'ai-ml' | 'frontend' | 'backend'
  | 'devops' | 'data-engineer' | 'data-scientist' | 'ui-ux'
  | 'mobile' | 'cloud-architect' | 'cybersecurity' | 'product-manager';

export interface InterviewQuestion {
  id: string;
  question_text: string;
  category: string;
  order: number;
  is_follow_up: boolean;
  answer: InterviewAnswer | null;
  created_at: string;
}

export interface InterviewAnswer {
  id: string;
  answer_text: string;
  technical_accuracy: number;
  confidence: number;
  communication: number;
  english_fluency: number;
  grammar: number;
  vocabulary: number;
  fluency: number;
  relevance: number;
  completeness: number;
  problem_solving: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  overall_score: number;
  created_at: string;
}

export interface Resume {
  id: string;
  original_filename: string;
  status: 'uploaded' | 'analyzing' | 'analyzed' | 'failed';
  technical_skills: string[];
  soft_skills: string[];
  projects: ResumeProject[];
  certifications: string[];
  education: Education[];
  experience: Experience[];
  ats_score: number;
  resume_rating: number;
  missing_keywords: string[];
  missing_skills: string[];
  grammar_issues: string[];
  formatting_issues: string[];
  improvement_suggestions: string[];
  created_at: string;
  updated_at: string;
}

export interface ResumeProject {
  name: string;
  description: string;
  technologies: string[];
}

export interface Notification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string;
  created_at: string;
}

export interface InterviewStats {
  total_interviews: number;
  completed_interviews: number;
  average_score: number;
  scores: {
    technical: number;
    communication: number;
    confidence: number;
    grammar: number;
    problem_solving: number;
  };
  recent_interviews: Interview[];
  progress_over_time?: { day: string; score: number }[];
  resume_score: string;
  ats_score: string;
  interviews_completed: number;
  overall_rating: string;
}

export interface Certificate {
  id: string;
  unique_id: string;
  issue_date: string;
  interview_type: string;
  overall_score: number;
  candidate_name: string;
  interview: string;
}

export interface StudyPlan {
  weak_areas: string[];
  courses: { title: string; url: string; type: string }[];
  daily_tasks: string[];
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatar: string | null;
  avg_score: number;
  interviews_done: number;
}

export interface CurrentQuestion {
  id: string;
  text: string;
  number: number;
  total: number;
}

export interface AnswerEvaluation {
  score: number;
  technical_accuracy: number;
  confidence: number;
  communication: number;
  english_fluency: number;
  grammar: number;
  vocabulary: number;
  fluency: number;
  relevance: number;
  completeness: number;
  problem_solving: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}
