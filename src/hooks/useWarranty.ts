
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { WarrantySupplier, WarrantyProduct, WarrantySale, WarrantyClaim } from '@/types/warranty';

// Define input types for mutations (excluding auto-generated fields)
type WarrantyProductInput = Omit<WarrantyProduct, 'id' | 'created_at' | 'updated_at' | 'warranty_end_date' | 'supplier'>;
type WarrantySaleInput = Omit<WarrantySale, 'id' | 'created_at' | 'updated_at' | 'customer_warranty_end_date' | 'warranty_product' | 'customer' | 'reseller'>;
type WarrantyClaimInput = Omit<WarrantyClaim, 'id' | 'created_at' | 'updated_at' | 'warranty_sale'>;

// Warranty Suppliers
export const useWarrantySuppliers = () => {
  return useQuery({
    queryKey: ['warranty-suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warranty_suppliers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as WarrantySupplier[];
    }
  });
};

export const useCreateWarrantySupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (supplier: Omit<WarrantySupplier, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('warranty_suppliers')
        .insert(supplier)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranty-suppliers'] });
      toast({
        title: 'Berhasil',
        description: 'Supplier berhasil ditambahkan'
      });
    },
    onError: (error) => {
      console.error('Error creating supplier:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan supplier',
        variant: 'destructive'
      });
    }
  });
};

export const useUpdateWarrantySupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...supplier }: Partial<WarrantySupplier> & { id: string }) => {
      const { data, error } = await supabase
        .from('warranty_suppliers')
        .update(supplier)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranty-suppliers'] });
      toast({
        title: 'Berhasil',
        description: 'Supplier berhasil diperbarui'
      });
    }
  });
};

// Warranty Products
export const useWarrantyProducts = () => {
  return useQuery({
    queryKey: ['warranty-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warranty_products')
        .select(`
          *,
          supplier:warranty_suppliers(*)
        `)
        .order('received_date', { ascending: false });
      
      if (error) throw error;
      return data as WarrantyProduct[];
    }
  });
};

export const useCreateWarrantyProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: WarrantyProductInput) => {
      const { data, error } = await supabase
        .from('warranty_products')
        .insert(product)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranty-products'] });
      toast({
        title: 'Berhasil',
        description: 'Produk berhasil ditambahkan'
      });
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan produk',
        variant: 'destructive'
      });
    }
  });
};

export const useCreateBulkWarrantyProducts = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (products: WarrantyProductInput[]) => {
      const { data, error } = await supabase
        .from('warranty_products')
        .insert(products)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['warranty-products'] });
      toast({
        title: 'Berhasil',
        description: `${data.length} produk berhasil ditambahkan`
      });
    },
    onError: (error) => {
      console.error('Error creating products:', error);
      toast({
        title: 'Error',
        description: 'Gagal menambahkan produk',
        variant: 'destructive'
      });
    }
  });
};

// Warranty Sales
export const useWarrantySales = () => {
  return useQuery({
    queryKey: ['warranty-sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warranty_sales')
        .select(`
          *,
          warranty_product:warranty_products(*),
          customer:customers(*),
          reseller:resellers(*)
        `)
        .order('sale_date', { ascending: false });
      
      if (error) throw error;
      return data as WarrantySale[];
    }
  });
};

export const useCreateWarrantySale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sale: WarrantySaleInput) => {
      const { data, error } = await supabase
        .from('warranty_sales')
        .insert(sale)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranty-sales'] });
      queryClient.invalidateQueries({ queryKey: ['warranty-products'] });
      toast({
        title: 'Berhasil',
        description: 'Penjualan berhasil dicatat'
      });
    },
    onError: (error) => {
      console.error('Error creating sale:', error);
      toast({
        title: 'Error',
        description: 'Gagal mencatat penjualan',
        variant: 'destructive'
      });
    }
  });
};

// Warranty Claims
export const useWarrantyClaims = () => {
  return useQuery({
    queryKey: ['warranty-claims'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('warranty_claims')
        .select(`
          *,
          warranty_sale:warranty_sales(
            *,
            warranty_product:warranty_products(*)
          )
        `)
        .order('claim_date', { ascending: false });
      
      if (error) throw error;
      return data as WarrantyClaim[];
    }
  });
};

export const useCreateWarrantyClaim = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (claim: WarrantyClaimInput) => {
      const { data, error } = await supabase
        .from('warranty_claims')
        .insert(claim)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranty-claims'] });
      toast({
        title: 'Berhasil',
        description: 'Klaim garansi berhasil dibuat'
      });
    },
    onError: (error) => {
      console.error('Error creating claim:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat klaim garansi',
        variant: 'destructive'
      });
    }
  });
};

export const useUpdateWarrantyClaim = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...claim }: Partial<WarrantyClaim> & { id: string }) => {
      const { data, error } = await supabase
        .from('warranty_claims')
        .update(claim)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranty-claims'] });
      toast({
        title: 'Berhasil',
        description: 'Klaim garansi berhasil diperbarui'
      });
    }
  });
};

// Check warranty by serial number
export const useCheckWarrantyBySerial = () => {
  return useMutation({
    mutationFn: async (serialNumber: string) => {
      const { data, error } = await supabase
        .from('warranty_sales')
        .select(`
          *,
          warranty_product:warranty_products(*)
        `)
        .eq('warranty_product.serial_number', serialNumber)
        .single();
      
      if (error) throw error;
      return data as WarrantySale;
    }
  });
};
