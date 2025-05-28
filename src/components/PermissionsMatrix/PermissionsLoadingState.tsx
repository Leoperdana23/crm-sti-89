
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const PermissionsLoadingState: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Matrix Hak Akses Role</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Memuat data hak akses...</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionsLoadingState;
