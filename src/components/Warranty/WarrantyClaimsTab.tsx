
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const WarrantyClaimsTab = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Klaim Garansi</CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Buat Klaim
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Tab Klaim Garansi sedang dalam pengembangan...</p>
      </CardContent>
    </Card>
  );
};

export default WarrantyClaimsTab;
