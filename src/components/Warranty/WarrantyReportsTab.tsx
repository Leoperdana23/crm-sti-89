
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const WarrantyReportsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Laporan & Monitoring
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Tab Laporan & Monitoring sedang dalam pengembangan...</p>
      </CardContent>
    </Card>
  );
};

export default WarrantyReportsTab;
