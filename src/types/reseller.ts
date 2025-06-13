
export interface Reseller {
  id: string;
  name: string;
  phone: string;
  address: string;
  birth_date?: string;
  email?: string;
  id_number?: string;
  notes?: string;
  branch_id?: string;
  commission_rate?: number;
  total_points?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateResellerData {
  name: string;
  phone: string;
  address: string;
  birth_date?: string;
  email?: string;
  id_number?: string;
  notes?: string;
  branch_id?: string;
  commission_rate?: number;
  is_active?: boolean;
}

export interface UpdateResellerData extends Partial<CreateResellerData> {
  id: string;
}
