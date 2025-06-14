
export interface Reseller {
  id: string;
  reseller_id?: string; // Custom reseller ID field
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
  password_hash?: string;
  created_at: string;
  updated_at: string;
  branches?: {
    name: string;
    code: string;
  };
}

export interface CreateResellerData {
  reseller_id?: string; // Custom reseller ID
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
