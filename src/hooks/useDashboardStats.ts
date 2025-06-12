
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MonthlyStats {
  month: string;
  prospek: number;
  deal: number;
}

// Fallback data for chart
const fallbackMonthlyData: MonthlyStats[] = [
  { month: 'Jan', prospek: 8, deal: 3 },
  { month: 'Feb', prospek: 12, deal: 5 },
  { month: 'Mar', prospek: 15, deal: 7 },
  { month: 'Apr', prospek: 10, deal: 4 },
  { month: 'May', prospek: 18, deal: 8 },
  { month: 'Jun', prospek: 20, deal: 10 },
];

export const useDashboardStats = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMonthlyStats = async () => {
    try {
      setLoading(true);
      console.log('Fetching monthly stats...');
      
      // Ambil data customers untuk 6 bulan terakhir
      const { data: customers, error } = await supabase
        .from('customers')
        .select('status, created_at, deal_date')
        .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('Error fetching monthly stats:', error);
        console.log('Using fallback monthly data');
        setMonthlyData(fallbackMonthlyData);
        return;
      }

      if (customers && customers.length > 0) {
        // Proses data untuk chart
        const monthlyStats: { [key: string]: { prospek: number; deal: number } } = {};
        
        // Inisialisasi 6 bulan terakhir
        for (let i = 5; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = date.toLocaleDateString('id-ID', { month: 'short' });
          monthlyStats[monthKey] = { prospek: 0, deal: 0 };
        }

        // Hitung data dari database
        customers?.forEach(customer => {
          const createdDate = new Date(customer.created_at);
          const monthKey = createdDate.toLocaleDateString('id-ID', { month: 'short' });
          
          if (monthlyStats[monthKey]) {
            if (customer.status === 'Prospek') {
              monthlyStats[monthKey].prospek++;
            } else if (customer.status === 'Deal') {
              monthlyStats[monthKey].deal++;
            }
          }
        });

        // Convert ke array untuk chart
        const chartData = Object.entries(monthlyStats).map(([month, stats]) => ({
          month,
          prospek: stats.prospek,
          deal: stats.deal
        }));

        console.log('Monthly stats processed:', chartData);
        setMonthlyData(chartData);
      } else {
        console.log('No customers found, using fallback monthly data');
        setMonthlyData(fallbackMonthlyData);
      }
    } catch (error) {
      console.error('Error processing monthly stats:', error);
      console.log('Using fallback monthly data due to network error');
      setMonthlyData(fallbackMonthlyData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyStats();
  }, []);

  return {
    monthlyData,
    loading,
    refetch: fetchMonthlyStats
  };
};
