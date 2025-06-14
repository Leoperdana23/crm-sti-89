
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  birth_date?: string;
  id_number?: string;
  needs?: string;
  notes?: string;
  status: 'Prospek' | 'Follow-up' | 'Deal' | 'Tidak Jadi';
  created_at: string;
  updated_at: string;
  deal_date?: string;
  survey_status?: 'sudah_disurvei' | 'belum_disurvei';
  branch_id?: string;
  sales_id?: string;
  interactions: Interaction[];
  work_status?: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  work_start_date?: string;
  work_completed_date?: string;
  work_notes?: string;
  estimated_days?: number;
  assigned_employees?: string[];
}

export interface Interaction {
  id: string;
  customer_id: string;
  type: 'call' | 'whatsapp' | 'email' | 'meeting';
  notes: string;
  date: string;
  follow_up_date?: string;
}

export interface Survey {
  id: string;
  customer_id: string;
  deal_date: string;
  service_technician: number;
  service_sales: number;
  product_quality: number;
  usage_clarity: number;
  price_approval: boolean;
  testimonial: string;
  suggestions: string;
  is_completed: boolean;
  completed_at?: string;
  survey_token: string;
}
