
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSurveys } from '@/hooks/useSurveys';
import { useCustomers } from '@/hooks/useCustomers';
import { useBranches } from '@/hooks/useBranches';
import { Star, MessageSquare, Lightbulb, TrendingUp, Users, Award, Calendar, User, Phone, MapPin, Building } from 'lucide-react';

const DetailedSurveyReports = () => {
  const { surveys, loading, getAverageRatings } = useSurveys();
  const { customers } = useCustomers();
  const { branches } = useBranches();
  const averages = getAverageRatings();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <span>Memuat data survei...</span>
        </div>
      </div>
    );
  }

  // Get detailed customer survey data with customer and branch information
  const getCustomerSurveyDetails = () => {
    return surveys.map(survey => {
      const customer = customers.find(c => c.id === survey.customer_id);
      const branch = branches.find(b => b.id === customer?.branch_id);
      return {
        ...survey,
        customer_name: customer?.name || 'Tidak Diketahui',
        customer_phone: customer?.phone || '-',
        customer_address: customer?.address || '-',
        branch_name: branch?.name || 'Tidak Diketahui',
        average_rating: (survey.service_technician + survey.service_sales + survey.product_quality + survey.usage_clarity) / 4
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  const customerSurveyDetails = getCustomerSurveyDetails();
  const recentSurveys = customerSurveyDetails.slice(0, 10);
  const surveysWithTestimonials = customerSurveyDetails.filter(s => s.testimonial && s.testimonial.trim());
  const surveysWithSuggestions = customerSurveyDetails.filter(s => s.suggestions && s.suggestions.trim());

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Survei</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{surveys.length}</div>
            <p className="text-xs text-muted-foreground">Survei selesai</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating Keseluruhan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{averages.overall.toFixed(1)}/10</div>
            <p className="text-xs text-muted-foreground">Rata-rata semua aspek</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tingkat Rekomendasi</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{averages.recommendationRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Pelanggan merekomendasikan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Testimoni</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{surveysWithTestimonials.length}</div>
            <p className="text-xs text-muted-foreground">Testimoni positif</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Detail per Aspek</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium">Pelayanan Teknisi</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">{averages.service_technician.toFixed(1)}</div>
              <div className="text-sm text-gray-500">/10</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm font-medium">Pelayanan Sales/CS</span>
              </div>
              <div className="text-3xl font-bold text-green-600">{averages.service_sales.toFixed(1)}</div>
              <div className="text-sm text-gray-500">/10</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-sm font-medium">Kualitas Produk</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">{averages.product_quality.toFixed(1)}</div>
              <div className="text-sm text-gray-500">/10</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="h-5 w-5 text-orange-500 mr-2" />
                <span className="text-sm font-medium">Kejelasan Penggunaan</span>
              </div>
              <div className="text-3xl font-bold text-orange-600">{averages.usage_clarity.toFixed(1)}</div>
              <div className="text-sm text-gray-500">/10</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Hasil Survei Per Pelanggan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detail Hasil Survei Per Pelanggan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {customerSurveyDetails.map((survey) => (
              <div key={survey.id} className="border rounded-lg p-4 hover:bg-gray-50">
                {/* Customer Info Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-gray-900">{survey.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-3 w-3" />
                      <span>{survey.customer_phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {new Date(survey.created_at).toLocaleDateString('id-ID')}
                    </Badge>
                    <Badge 
                      variant={survey.price_approval ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {survey.price_approval ? "Merekomendasikan" : "Tidak Merekomendasikan"}
                    </Badge>
                  </div>
                </div>

                {/* Customer Address & Branch */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-3 w-3" />
                    <span>{survey.customer_address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Building className="h-3 w-3" />
                    <span>Cabang: {survey.branch_name}</span>
                  </div>
                </div>

                {/* Rating Details */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                  <div className="text-center bg-blue-50 p-2 rounded">
                    <div className="text-lg font-semibold text-blue-600">{survey.service_technician}</div>
                    <div className="text-xs text-gray-600">Teknisi</div>
                  </div>
                  <div className="text-center bg-green-50 p-2 rounded">
                    <div className="text-lg font-semibold text-green-600">{survey.service_sales}</div>
                    <div className="text-xs text-gray-600">Sales/CS</div>
                  </div>
                  <div className="text-center bg-purple-50 p-2 rounded">
                    <div className="text-lg font-semibold text-purple-600">{survey.product_quality}</div>
                    <div className="text-xs text-gray-600">Produk</div>
                  </div>
                  <div className="text-center bg-orange-50 p-2 rounded">
                    <div className="text-lg font-semibold text-orange-600">{survey.usage_clarity}</div>
                    <div className="text-xs text-gray-600">Penggunaan</div>
                  </div>
                  <div className="text-center bg-yellow-50 p-2 rounded">
                    <div className="text-lg font-semibold text-yellow-600">{survey.average_rating.toFixed(1)}</div>
                    <div className="text-xs text-gray-600">Rata-rata</div>
                  </div>
                </div>

                {/* Testimonial */}
                {survey.testimonial && survey.testimonial.trim() && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">Testimoni:</span>
                    </div>
                    <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                      <p className="text-sm text-gray-700 italic">"{survey.testimonial}"</p>
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {survey.suggestions && survey.suggestions.trim() && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-700">Saran & Kritik:</span>
                    </div>
                    <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-500">
                      <p className="text-sm text-gray-700">{survey.suggestions}</p>
                    </div>
                  </div>
                )}

                {/* Deal Date */}
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Tanggal Deal: {new Date(survey.deal_date).toLocaleDateString('id-ID')}</span>
                    <span>ID Survei: {survey.id.slice(0, 8)}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {customerSurveyDetails.length > 10 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">
                  Menampilkan semua {customerSurveyDetails.length} hasil survei
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Testimonials Section */}
      {surveysWithTestimonials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Testimoni Pelanggan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {surveysWithTestimonials.slice(0, 5).map((survey) => (
                <div key={survey.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded-r">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">{survey.customer_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {new Date(survey.created_at).toLocaleDateString('id-ID')}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs text-gray-600">
                        {survey.average_rating.toFixed(1)}/10
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 italic">"{survey.testimonial}"</p>
                </div>
              ))}
              {surveysWithTestimonials.length > 5 && (
                <p className="text-center text-sm text-gray-500">
                  +{surveysWithTestimonials.length - 5} testimoni lainnya
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions Section */}
      {surveysWithSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Saran & Kritik Pelanggan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {surveysWithSuggestions.slice(0, 5).map((survey) => (
                <div key={survey.id} className="border-l-4 border-orange-500 pl-4 py-3 bg-orange-50 rounded-r">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">{survey.customer_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {new Date(survey.created_at).toLocaleDateString('id-ID')}
                    </Badge>
                    <Badge 
                      variant={survey.price_approval ? "default" : "secondary"} 
                      className="text-xs"
                    >
                      {survey.price_approval ? "Merekomendasikan" : "Tidak Merekomendasikan"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{survey.suggestions}</p>
                </div>
              ))}
              {surveysWithSuggestions.length > 5 && (
                <p className="text-center text-sm text-gray-500">
                  +{surveysWithSuggestions.length - 5} saran lainnya
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DetailedSurveyReports;
