
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSurveys } from '@/hooks/useSurveys';
import { Star, TrendingUp, Users, Award } from 'lucide-react';

const SurveyReports = () => {
  const { surveys, loading, getAverageRatings } = useSurveys();
  const averages = getAverageRatings();

  if (loading) {
    return <div>Memuat data survei...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pelayanan Teknisi</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averages.service_technician.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground">Rating rata-rata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pelayanan Sales/CS</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averages.service_sales.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground">Rating rata-rata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kualitas Produk</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averages.product_quality.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground">Rating rata-rata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kejelasan Penggunaan</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averages.usage_clarity.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground">Rating rata-rata</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Survei</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{surveys.length}</div>
            <p className="text-xs text-muted-foreground">Survei selesai</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating Keseluruhan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averages.overall.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground">Rata-rata semua aspek</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tingkat Rekomendasi</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averages.recommendationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Pelanggan merekomendasikan</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Survei Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {surveys.slice(0, 10).map((survey) => (
              <div key={survey.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="text-sm font-medium">ID: {survey.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(survey.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">Teknisi:</span>
                    <span className="font-medium">{survey.service_technician}/10</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">Sales:</span>
                    <span className="font-medium">{survey.service_sales}/10</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">Produk:</span>
                    <span className="font-medium">{survey.product_quality}/10</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">Penggunaan:</span>
                    <span className="font-medium">{survey.usage_clarity}/10</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">Rekomendasi:</span>
                    <span className={`font-medium ${survey.price_approval ? 'text-green-600' : 'text-red-600'}`}>
                      {survey.price_approval ? 'Ya' : 'Tidak'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyReports;
