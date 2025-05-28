
export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  birthDate: string;
  idNumber: string;
  needs?: string;
  notes?: string;
  status: 'Prospek' | 'Follow-up' | 'Deal' | 'Tidak Jadi';
  createdAt: string;
  updatedAt: string;
  dealDate?: string;
  surveyStatus?: 'sudah_disurvei' | 'belum_disurvei';
  interactions: Interaction[];
}

export interface Interaction {
  id: string;
  customerId: string;
  type: 'call' | 'whatsapp' | 'email' | 'meeting';
  notes: string;
  date: string;
  followUpDate?: string;
}

export interface Survey {
  id: string;
  customerId: string;
  dealDate: string;
  serviceTechnician: number;
  serviceSales: number;
  productQuality: number;
  usageClarity: number;
  priceApproval: boolean;
  testimonial: string;
  suggestions: string;
  isCompleted: boolean;
  completedAt?: string;
  surveyToken: string;
}
