import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCatalogTokens, useCreateCatalogToken, useDeleteCatalogToken } from '@/hooks/useCatalogTokens';

interface CatalogTokenManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CatalogTokenManager = ({ isOpen, onClose }: CatalogTokenManagerProps) => {
  const { data: tokens, isLoading } = useCatalogTokens();
  const createTokenMutation = useCreateCatalogToken();
  const deleteTokenMutation = useDeleteCatalogToken();
  const { toast } = useToast();
  
  const [newTokenName, setNewTokenName] = useState('');
  const [newTokenDescription, setNewTokenDescription] = useState('');

  const handleCreateToken = async () => {
    if (!newTokenName.trim()) {
      toast({
        title: 'Error',
        description: 'Nama token harus diisi',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Creating catalog token with data:', {
        name: newTokenName,
        description: newTokenDescription,
      });

      const result = await createTokenMutation.mutateAsync({
        name: newTokenName,
        description: newTokenDescription,
      });

      console.log('Token creation result:', result);
      
      setNewTokenName('');
      setNewTokenDescription('');
      toast({
        title: 'Sukses',
        description: 'Token berhasil dibuat',
      });
    } catch (error) {
      console.error('Error creating token:', error);
      toast({
        title: 'Error',
        description: 'Gagal membuat token. Silakan coba lagi.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteToken = async (tokenId: string) => {
    try {
      await deleteTokenMutation.mutateAsync(tokenId);
      toast({
        title: 'Sukses',
        description: 'Token berhasil dihapus',
      });
    } catch (error) {
      console.error('Error deleting token:', error);
      toast({
        title: 'Error',
        description: 'Gagal menghapus token',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Berhasil',
      description: 'Link berhasil disalin ke clipboard',
    });
  };

  const getPublicCatalogUrl = (token: string) => {
    return `${window.location.origin}/catalog/${token}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Kelola Link Publik Katalog</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Create New Token */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg flex items-center space-x-2">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Buat Link Baru</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="tokenName" className="text-sm">Nama Token</Label>
                <Input
                  id="tokenName"
                  placeholder="Contoh: Katalog Reseller Q1 2024"
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="tokenDescription" className="text-sm">Deskripsi (opsional)</Label>
                <Input
                  id="tokenDescription"
                  placeholder="Deskripsi untuk token ini"
                  value={newTokenDescription}
                  onChange={(e) => setNewTokenDescription(e.target.value)}
                  className="mt-1"
                />
              </div>

              <Button 
                onClick={handleCreateToken}
                disabled={createTokenMutation.isPending}
                className="w-full"
              >
                {createTokenMutation.isPending ? 'Membuat...' : 'Buat Token'}
              </Button>
            </CardContent>
          </Card>

          {/* Existing Tokens */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold">Token yang Ada</h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Memuat token...</p>
              </div>
            ) : tokens && tokens.length > 0 ? (
              <div className="space-y-3">
                {tokens.map((token) => (
                  <Card key={token.id} className="overflow-hidden">
                    <CardContent className="p-3 sm:p-4">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                              <h4 className="font-medium text-sm sm:text-base break-words">{token.name}</h4>
                              <Badge variant={token.is_active ? 'default' : 'secondary'} className="text-xs w-fit">
                                {token.is_active ? 'Aktif' : 'Nonaktif'}
                              </Badge>
                            </div>
                            
                            {token.description && (
                              <p className="text-xs sm:text-sm text-gray-600 mb-2 break-words">{token.description}</p>
                            )}
                            
                            <div className="text-xs text-gray-500 space-y-1">
                              <div>Dibuat: {new Date(token.created_at).toLocaleDateString('id-ID')}</div>
                              {token.expires_at && (
                                <div>Kedaluwarsa: {new Date(token.expires_at).toLocaleDateString('id-ID')}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* URL Display */}
                        <div className="p-2 sm:p-3 bg-gray-50 rounded text-xs sm:text-sm font-mono break-all">
                          {getPublicCatalogUrl(token.token)}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(getPublicCatalogUrl(token.token))}
                            className="flex-1 sm:flex-none"
                          >
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="text-xs sm:text-sm">Salin</span>
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(getPublicCatalogUrl(token.token), '_blank')}
                            className="flex-1 sm:flex-none"
                          >
                            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="text-xs sm:text-sm">Buka</span>
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteToken(token.id)}
                            disabled={deleteTokenMutation.isPending}
                            className="flex-1 sm:flex-none"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span className="text-xs sm:text-sm">Hapus</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Plus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm sm:text-base">Belum ada token yang dibuat</p>
                <p className="text-xs sm:text-sm mt-1">Buat token pertama Anda untuk membagikan katalog</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CatalogTokenManager;
