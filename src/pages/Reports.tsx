
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, PieChart } from 'lucide-react';
import SedekatAppReports from '@/components/Reports/SedekatAppReports';
import GeneralReports from '@/components/Reports/GeneralReports';

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Laporan</h1>
        <p className="text-gray-600">Dashboard analitik dan laporan lengkap</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Laporan Umum
          </TabsTrigger>
          <TabsTrigger value="sedekat-app" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Laporan SEDEKAT APP
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralReports
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
            onCustomStartDateChange={setCustomStartDate}
            onCustomEndDateChange={setCustomEndDate}
          />
        </TabsContent>

        <TabsContent value="sedekat-app">
          <SedekatAppReports
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
            customStartDate={customStartDate}
            customEndDate={customEndDate}
            onCustomStartDateChange={setCustomStartDate}
            onCustomEndDateChange={setCustomEndDate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
