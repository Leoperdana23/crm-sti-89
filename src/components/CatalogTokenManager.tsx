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
      await createTokenMutation.mutateAsync({
        name: newTokenName,
        description: newTokenDescription,
      });
      setNewTokenName('');
      setNewTokenDescription('');
      toast({
        title: 'Sukses',
        description: 'Token berhasil dibuat',
      });
    } catch (error) {
      console.error('Error creating token:', error);
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kelola Link Publik Katalog</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Token */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Buat Link Baru</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tokenName">Nama Token</Label>
                <Input
                  id="tokenName"
                  placeholder="Contoh: Katalog Reseller Q1 2024"
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="tokenDescription">Deskripsi (opsional)</Label>
                <Input
                  id="tokenDescription"
                  placeholder="Deskripsi untuk token ini"
                  value={newTokenDescription}
                  onChange={(e) => setNewTokenDescription(e.target.value)}
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Token yang Ada</h3>
            
            {isLoading ? (
              <div className="text-center py-8">Memuat token...</div>
            ) : tokens && tokens.length > 0 ? (
              <div className="space-y-3">
                {tokens.map((token) => (
                  <Card key={token.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{token.name}</h4>
                            <Badge variant={token.is_active ? 'default' : 'secondary'}>
                              {token.is_active ? 'Aktif' : 'Nonaktif'}
                            </Badge>
                          </div>
                          
                          {token.description && (
                            <p className="text-sm text-gray-600 mb-2">{token.description}</p>
                          )}
                          
                          <div className="text-xs text-gray-500">
                            Dibuat: {new Date(token.created_at).toLocaleDateString('id-ID')}
                            {token.expires_at && (
                              <span className="ml-2">
                                Kedaluwarsa: {new Date(token.expires_at).toLocaleDateString('id-ID')}
                              </span>
                            )}
                          </div>

                          <div className="mt-3 p-2 bg-gray-50 rounded text-sm font-mono break-all">
                            {getPublicCatalogUrl(token.token)}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(getPublicCatalogUrl(token.token))}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(getPublicCatalogUrl(token.token), '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteToken(token.id)}
                            disabled={deleteTokenMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Belum ada token yang dibuat
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CatalogTokenManager;
