
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface PermissionsEmptyStateProps {
  onRefresh: () => void;
}

const PermissionsEmptyState: React.FC<PermissionsEmptyStateProps> = ({ onRefresh }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Matrix Hak Akses Role</CardTitle>
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <p className="text-gray-600">Tidak ada data permissions. Sistem sedang menginisialisasi data...</p>
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Muat Ulang Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionsEmptyState;
