
export interface Sales {
  id: string;
  name: string;
  code: string;
  phone?: string;
  email?: string;
  branch_id?: string;
  is_active: boolean;
  password_hash?: string;
  created_at: string;
  updated_at: string;
}
