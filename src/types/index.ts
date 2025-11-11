
export interface KnowledgeEntry {
  id: string;
  category: string;
  tags?: string[];
  questionPatterns: string[];
  keywords: string[];
  answer: string;
  short?: string;
  priority?: number;
}

export interface Profile {
  id: string;
  chatbot_name?: string;
  welcome_message?: string;
  accent_color?: string;
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_name: string;
  status: 'active' | 'inactive' | 'cancelled';
  current_period_end: string;
  created_at: string;
}

