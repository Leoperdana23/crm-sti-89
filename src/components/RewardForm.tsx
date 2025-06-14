import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useCreateReward, useUpdateReward } from '@/hooks/useRewards';
import { RewardItem } from '@/hooks/useRewards';

interface RewardFormProps {
  isOpen: boolean;
  onClose: () => void;
  reward?: RewardItem;
}

const RewardForm: React.FC<RewardFormProps> = ({
  isOpen,
  onClose,
  reward
}) => {
  const createRewardMutation = useCreateReward();
  const updateRewardMutation = useUpdateReward();
  
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    reward_type: 'points' as 'commission' | 'points',
    cost: 0,
    image_url: '',
    is_active: true
  });

  const isLoading = createRewardMutation.isPending || updateRewardMutation.isPending;

  useEffect(() => {
    if (reward) {
      setFormData({
        name: reward.name,
        description: reward.description || '',
        reward_type: reward.reward_type,
        cost: reward.cost,
        image_url: reward.image_url || '',
        is_active: reward.is_active
      });
    } else {
      setFormData({
        name: '',
        description: '',
        reward_type: 'points',
        cost: 0,
        image_url: '',
        is_active: true
      });
    }
  }, [reward, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (reward) {
        await updateRewardMutation.mutateAsync({
          id: reward.id,
          ...formData
        });
      } else {
        await createRewardMutation.mutateAsync(formData);
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving reward:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {reward ? 'Edit Hadiah' : 'Tambah Hadiah Baru'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Hadiah</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Masukkan nama hadiah"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Deskripsi hadiah (opsional)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reward_type">Tipe Hadiah</Label>
            <Select 
              value={formData.reward_type} 
              onValueChange={(value: 'commission' | 'points') => 
                setFormData({ ...formData, reward_type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih tipe hadiah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="points">Poin</SelectItem>
                <SelectItem value="commission">Komisi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cost">
              Biaya ({formData.reward_type === 'points' ? 'Poin' : 'Rupiah'})
            </Label>
            <Input
              id="cost"
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
              required
              min="0"
              placeholder={`Masukkan biaya dalam ${formData.reward_type === 'points' ? 'poin' : 'rupiah'}`}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL Gambar</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg (opsional)"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Hadiah Aktif</Label>
          </div>

          <div className="flex gap-2 pt-4">
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
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Menyimpan...' : (reward ? 'Perbarui' : 'Tambah')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RewardForm;
