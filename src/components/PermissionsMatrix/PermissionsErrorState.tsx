
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface PermissionsErrorStateProps {
  error: string;
  onRefresh: () => void;
}

const PermissionsErrorState: React.FC<PermissionsErrorStateProps> = ({ error, onRefresh }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Matrix Hak Akses Role</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-6 w-6" />
            <span>Terjadi kesalahan: {error}</span>
          </div>
          <Button onClick={onRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Coba Lagi
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionsErrorState;
