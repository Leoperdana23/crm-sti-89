
export interface Sales {
  id: string;
  name: string;
  code: string;
  phone?: string;
  email?: string;
  branchId?: string;
  isActive: boolean;
  passwordHash?: string;
  createdAt: string;
  updatedAt: string;
}
