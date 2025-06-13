
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryMovement } from '@/types/product';
import { useToast } from '@/hooks/use-toast';

export const useInventoryMovements = (productId?: string) => {
  return useQuery({
    queryKey: ['inventory-movements', productId],
    queryFn: async () => {
      console.log('Fetching inventory movements...');
      
      let query = supabase
        .from('inventory_movements')
        .select(`
          *,
          products (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching inventory movements:', error);
        throw error;
      }

      console.log('Inventory movements fetched successfully:', data);
      return data as InventoryMovement[];
    },
  });
};

export const useCreateInventoryMovement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (movementData: {
      product_id: string;
      movement_type: 'in' | 'out' | 'adjustment';
      quantity: number;
      reference_type?: string;
      reference_id?: string;
      notes?: string;
    }) => {
      console.log('Creating inventory movement with data:', movementData);
      
      const { data, error } = await supabase
        .from('inventory_movements')
        .insert([movementData])
        .select(`
          *,
          products (
            name
          )
        `)
        .single();

      if (error) {
        console.error('Error creating inventory movement:', error);
        throw error;
      }

      // Update product stock quantity
      const stockChange = movementData.movement_type === 'out' ? -movementData.quantity : movementData.quantity;
      
      const { error: stockError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: supabase.raw(`stock_quantity + ${stockChange}`) 
        })
        .eq('id', movementData.product_id);

      if (stockError) {
        console.error('Error updating stock:', stockError);
        throw stockError;
      }

      console.log('Inventory movement created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Sukses',
        description: 'Pergerakan stok berhasil dicatat',
      });
    },
    onError: (error: any) => {
      console.error('Error in useCreateInventoryMovement:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Gagal mencatat pergerakan stok',
        variant: 'destructive',
      });
    },
  });
};
