
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, User, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface Location {
  latitude: number;
  longitude: number;
}

interface AttendanceFormProps {
  onCheckIn: (location: Location, notes?: string) => Promise<void>;
  onCheckOut: (location: Location, notes?: string) => Promise<void>;
  todayAttendance: any;
  currentEmployee: any;
}

const AttendanceForm: React.FC<AttendanceFormProps> = ({
  onCheckIn,
  onCheckOut,
  todayAttendance,
  currentEmployee
}) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      if (!navigator.geolocation) {
        toast.error('Geolocation tidak didukung oleh browser ini');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Gagal mendapatkan lokasi. Pastikan GPS aktif.');
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } catch (error) {
      console.error('Location error:', error);
      setLocationLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!currentLocation) {
      toast.error('Lokasi belum tersedia. Silakan tunggu atau refresh lokasi.');
      return;
    }

    try {
      await onCheckIn(currentLocation, notes);
      setNotes('');
    } catch (error) {
      console.error('Check in error:', error);
    }
  };

  const handleCheckOut = async () => {
    if (!currentLocation) {
      toast.error('Lokasi belum tersedia. Silakan tunggu atau refresh lokasi.');
      return;
    }

    try {
      await onCheckOut(currentLocation, notes);
      setNotes('');
    } catch (error) {
      console.error('Check out error:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-b-3xl">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Absensi Karyawan</h1>
          <p className="text-blue-100 text-sm">{formatDate(currentTime)}</p>
        </div>
      </div>

      {/* Time Display */}
      <div className="px-6 -mt-8">
        <Card className="bg-white shadow-lg border-0">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-3xl font-bold text-gray-800">
                {formatTime(currentTime)}
              </span>
            </div>
            <p className="text-gray-500 text-sm">Waktu Sekarang</p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Info */}
      <div className="px-6 mt-4">
        <Card className="bg-white shadow-sm border-0">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {currentEmployee?.user?.full_name || 'Unknown'}
                </p>
                <p className="text-sm text-gray-500">
                  {currentEmployee?.employee_code}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location Info */}
      <div className="px-6 mt-4">
        <Card className="bg-white shadow-sm border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Lokasi</p>
                  <p className="text-sm text-gray-500">
                    {currentLocation ? 'Lokasi terdeteksi' : 'Mencari lokasi...'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={locationLoading}
              >
                {locationLoading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Today */}
      {todayAttendance && (
        <div className="px-6 mt-4">
          <Card className="bg-white shadow-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Status Hari Ini</h3>
                <Badge className="bg-green-100 text-green-800">
                  {todayAttendance.status === 'present' ? 'Hadir' : todayAttendance.status}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Masuk:</span>
                  <span className="font-medium">
                    {todayAttendance.check_in_time 
                      ? new Date(todayAttendance.check_in_time).toLocaleTimeString('id-ID', {
                          hour: '2-digit', minute: '2-digit'
                        })
                      : '-'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Keluar:</span>
                  <span className="font-medium">
                    {todayAttendance.check_out_time 
                      ? new Date(todayAttendance.check_out_time).toLocaleTimeString('id-ID', {
                          hour: '2-digit', minute: '2-digit'
                        })
                      : '-'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notes Input */}
      <div className="px-6 mt-4">
        <Card className="bg-white shadow-sm border-0">
          <CardContent className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg resize-none"
              rows={3}
              placeholder="Tambahkan catatan..."
            />
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="px-6 mt-6 pb-8">
        <div className="space-y-3">
          <Button
            onClick={handleCheckIn}
            disabled={!currentLocation || !!todayAttendance?.check_in_time}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl text-lg font-semibold shadow-lg"
          >
            {todayAttendance?.check_in_time ? 'Sudah Absen Masuk' : 'Absen Masuk'}
          </Button>

          <Button
            onClick={handleCheckOut}
            disabled={!currentLocation || !todayAttendance?.check_in_time || !!todayAttendance?.check_out_time}
            variant="outline"
            className="w-full border-2 border-red-500 text-red-500 hover:bg-red-50 py-4 rounded-xl text-lg font-semibold"
          >
            {todayAttendance?.check_out_time ? 'Sudah Absen Keluar' : 'Absen Keluar'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceForm;
