
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Eye,
  ArrowUpRight,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const ModernDashboard = () => {
  const { stats, loading, refetch } = useDashboardStats();
  const { toast } = useToast();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Auto-refreshing dashboard data...');
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleManualRefresh = async () => {
    console.log('Manual refresh triggered');
    await refetch();
    toast({
      title: "Data Diperbarui",
      description: "Dashboard telah diperbarui dengan data terbaru",
    });
  };

  const statCards = [
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      change: '+12%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      change: '+8%',
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      change: '+15%',
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Conversion Rate',
      value: `${(stats?.conversionRate || 0).toFixed(1)}%`,
      change: '+2.5%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with real-time indicator */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Real-time</h1>
          <p className="text-gray-600">Data terbaru dari aplikasi Anda (update setiap 30 detik)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleManualRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View Report
          </Button>
          <Button size="sm">
            <ArrowUpRight className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Real-time Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <Badge variant="secondary" className="text-xs">
                    {stat.change} from last month
                  </Badge>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid with Real-time Data */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer Status Chart with Real Data */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Customer Status Overview (Real-time)</CardTitle>
              <CardDescription>Distribusi status customer terkini</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Prospects</span>
                    <span className="text-sm text-gray-600">{stats?.customersByStatus.prospek || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${stats?.totalCustomers ? 
                          ((stats.customersByStatus.prospek || 0) / stats.totalCustomers) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Follow-up</span>
                    <span className="text-sm text-gray-600">{stats?.customersByStatus.followUp || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full" 
                      style={{ 
                        width: `${stats?.totalCustomers ? 
                          ((stats.customersByStatus.followUp || 0) / stats.totalCustomers) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Deals</span>
                    <span className="text-sm text-gray-600">{stats?.customersByStatus.deal || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${stats?.totalCustomers ? 
                          ((stats.customersByStatus.deal || 0) / stats.totalCustomers) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Not Converted</span>
                    <span className="text-sm text-gray-600">{stats?.customersByStatus.tidakJadi || 0}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ 
                        width: `${stats?.totalCustomers ? 
                          ((stats.customersByStatus.tidakJadi || 0) / stats.totalCustomers) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities with Real Data */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities (Real-time)</CardTitle>
            <CardDescription>Aktivitas customer terbaru</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                stats.recentActivities.slice(0, 5).map((activity, index) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.customer} • {new Date(activity.timestamp).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Belum ada aktivitas terbaru</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ModernDashboard;
