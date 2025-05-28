
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { AppUser } from '@/types/user';
import { useBranches } from '@/hooks/useBranches';

interface UserFormProps {
  user?: AppUser | null;
  onSubmit: (userData: any) => Promise<void>;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
  const { branches } = useBranches();
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    role: 'staff' as 'super_admin' | 'admin' | 'manager' | 'staff',
    branch_id: '',
    is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        branch_id: user.branch_id || '',
        is_active: user.is_active
      });
    } else {
      // Reset form untuk user baru
      setFormData({
        username: '',
        full_name: '',
        email: '',
        role: 'staff',
        branch_id: '',
        is_active: true
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Validasi form
      if (!formData.username.trim() || !formData.full_name.trim() || !formData.email.trim()) {
        throw new Error('Username, nama lengkap, dan email wajib diisi');
      }
      
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { value: 'staff', label: 'Staff' },
    { value: 'manager', label: 'Manager' },
    { value: 'admin', label: 'Admin' },
    { value: 'super_admin', label: 'Super Admin' }
  ];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{user ? 'Edit User' : 'Tambah User Baru'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value: 'super_admin' | 'admin' | 'manager' | 'staff') => 
                  setFormData(prev => ({ ...prev, role: value }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Cabang</Label>
              <Select 
                value={formData.branch_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, branch_id: value }))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Cabang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tidak Ada Cabang</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                disabled={isSubmitting}
              />
              <Label htmlFor="is_active">Aktif</Label>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : (user ? 'Update User' : 'Tambah User')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={isSubmitting}>
              Batal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserForm;
