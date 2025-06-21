
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface RedemptionEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  redemption: any;
}

const RedemptionEditDialog: React.FC<RedemptionEditDialogProps> = ({
  isOpen,
  onClose,
  redemption
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    reward_description: redemption?.reward_description || '',
    reward_type: redemption?.reward_type || 'points',
    amount_redeemed: redemption?.amount_redeemed || 0,
    status: redemption?.status || 'pending'
  });

  const updateRedemption = useMutation({
    mutationFn: async (data: any) => {
      console.log('Updating redemption:', redemption.id, data);
      
      const { error } = await supabase
        .from('reward_redemptions')
        .update({
          reward_description: data.reward_description,
          reward_type: data.reward_type,
          amount_redeemed: Number(data.amount_redeemed),
          status: data.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', redemption.id);

      if (error) {
        console.error('Error updating redemption:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-redemptions'] });
      queryClient.invalidateQueries({ queryKey: ['resellers'] });
      queryClient.invalidateQueries({ queryKey: ['all-reseller-orders'] });
      toast({
        title: 'Sukses',
        description: 'Penukaran hadiah berhasil diperbarui',
      });
      onClose();
    },
    onError: (error: any) => {
      console.error('Error updating redemption:', error);
      toast({
        title: 'Error',
        description: error.message || 'Gagal memperbarui penukaran hadiah',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reward_description.trim()) {
      toast({
        title: 'Error',
        description: 'Deskripsi hadiah harus diisi',
        variant: 'destructive',
      });
      return;
    }

    if (formData.amount_redeemed <= 0) {
      toast({
        title: 'Error',
        description: 'Jumlah penukaran harus lebih dari 0',
        variant: 'destructive',
      });
      return;
    }

    updateRedemption.mutate(formData);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Penukaran Hadiah</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reward_description">Deskripsi Hadiah</Label>
            <Textarea
              id="reward_description"
              value={formData.reward_description}
              onChange={(e) => setFormData(prev => ({ ...prev, reward_description: e.target.value }))}
              placeholder="Masukkan deskripsi hadiah..."
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="reward_type">Jenis Hadiah</Label>
            <Select
              value={formData.reward_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, reward_type: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="points">Poin</SelectItem>
                <SelectItem value="commission">Komisi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount_redeemed">
              Jumlah {formData.reward_type === 'points' ? 'Poin' : 'Komisi'}
            </Label>
            <Input
              id="amount_redeemed"
              type="number"
              value={formData.amount_redeemed}
              onChange={(e) => setFormData(prev => ({ ...prev, amount_redeemed: Number(e.target.value) }))}
              className="mt-1"
              min="1"
              required
            />
            {formData.reward_type === 'commission' && (
              <p className="text-sm text-gray-500 mt-1">
                {formatCurrency(formData.amount_redeemed)}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={updateRedemption.isPending}
            >
              {updateRedemption.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RedemptionEditDialog;
