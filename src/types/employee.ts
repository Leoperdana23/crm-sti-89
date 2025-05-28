
export interface Employee {
  id: string;
  user_id?: string;
  employee_code: string;
  position?: string;
  department?: string;
  hire_date?: string;
  salary?: number;
  status: 'active' | 'inactive' | 'terminated';
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    email: string;
  };
}

export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  notes?: string;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  leave_type: 'annual' | 'sick' | 'personal' | 'maternity' | 'emergency';
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface Claim {
  id: string;
  employee_id: string;
  claim_type: 'medical' | 'transport' | 'meal' | 'overtime' | 'other';
  description: string;
  amount: number;
  receipt_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface Payroll {
  id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  basic_salary: number;
  overtime_hours?: number;
  overtime_rate?: number;
  allowances?: number;
  deductions?: number;
  gross_salary: number;
  tax?: number;
  net_salary: number;
  status: 'draft' | 'processed' | 'paid';
  generated_by?: string;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}
