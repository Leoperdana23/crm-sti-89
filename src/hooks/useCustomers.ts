
import { useState } from 'react';
import { Customer } from '@/types/customer';

const initialCustomers: Customer[] = [
  {
    id: '1',
    name: 'Ahmad Rizki',
    phone: '081234567890',
    address: 'Jl. Sudirman No. 123, Jakarta Selatan',
    birthDate: '1985-05-15',
    idNumber: '3175051505850001',
    needs: 'Sistem CCTV untuk rumah',
    notes: 'Tertarik dengan paket premium',
    status: 'Follow-up',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    interactions: []
  },
  {
    id: '2',
    name: 'Siti Nurhaliza',
    phone: '082345678901',
    address: 'Jl. Gatot Subroto No. 456, Jakarta Pusat',
    birthDate: '1990-08-22',
    idNumber: '3175082290900002',
    needs: 'Alarm system untuk toko',
    notes: 'Budget terbatas, perlu penawaran khusus',
    status: 'Prospek',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
    interactions: []
  },
  {
    id: '3',
    name: 'Budi Santoso',
    phone: '083456789012',
    address: 'Jl. Thamrin No. 789, Jakarta Pusat',
    birthDate: '1982-12-03',
    idNumber: '3175120382820003',
    needs: 'Access control dan CCTV kantor',
    notes: 'Deal closed, instalasi minggu depan',
    status: 'Deal',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-25',
    dealDate: '2024-01-25',
    interactions: []
  }
];

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'interactions'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      interactions: []
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => 
      prev.map(customer => 
        customer.id === id 
          ? { ...customer, ...updates, updatedAt: new Date().toISOString() }
          : customer
      )
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(customer => customer.id !== id));
  };

  const getCustomersByStatus = (status: Customer['status']) => {
    return customers.filter(customer => customer.status === status);
  };

  const getStats = () => {
    return {
      total: customers.length,
      prospek: customers.filter(c => c.status === 'Prospek').length,
      followUp: customers.filter(c => c.status === 'Follow-up').length,
      deal: customers.filter(c => c.status === 'Deal').length,
      tidakJadi: customers.filter(c => c.status === 'Tidak Jadi').length,
    };
  };

  return {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomersByStatus,
    getStats
  };
};
