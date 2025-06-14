
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const WarrantySuppliersTab = () => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Supplier Management</CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Supplier
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Tab Supplier sedang dalam pengembangan...</p>
      </CardContent>
    </Card>
  );
};

export default WarrantySuppliersTab;
