
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAttendance } from '@/hooks/useAttendance';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/hooks/useAuth';
import { Clock, ClockIn, ClockOut, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const Attendance = () => {
  const { attendanceRecords, loading, checkIn, checkOut, getTodayAttendance } = useAttendance();
  const { employees } = useEmployees();
  const { user } = useAuth();
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  // Find current user's employee record
  const currentEmployee = employees.find(emp => emp.user_id === user?.id);
  const todayAttendance = currentEmployee ? getTodayAttendance(currentEmployee.id) : null;

  const handleCheckIn = async () => {
    if (!currentEmployee) {
      toast.error('Data karyawan tidak ditemukan');
      return;
    }

    try {
      setCheckingIn(true);
      await checkIn(currentEmployee.id);
      toast.success('Berhasil absen masuk');
    } catch (error) {
      toast.error('Gagal absen masuk');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) {
      toast.error('Belum absen masuk hari ini');
      return;
    }

    try {
      setCheckingOut(true);
      await checkOut(todayAttendance.id);
      toast.success('Berhasil absen keluar');
    } catch (error) {
      toast.error('Gagal absen keluar');
    } finally {
      setCheckingOut(false);
    }
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      half_day: 'bg-blue-100 text-blue-800'
    };

    const statusLabels = {
      present: 'Hadir',
      absent: 'Tidak Hadir',
      late: 'Terlambat',
      half_day: 'Setengah Hari'
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors]}>
        {statusLabels[status as keyof typeof statusLabels]}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data absensi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Absensi Karyawan</h1>
          <p className="text-gray-600">Kelola absensi masuk dan keluar karyawan</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockIn className="h-5 w-5 text-green-600" />
                Absen Masuk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {todayAttendance?.check_in_time 
                    ? `Sudah absen masuk: ${formatTime(todayAttendance.check_in_time)}`
                    : 'Belum absen masuk hari ini'
                  }
                </p>
                <Button 
                  onClick={handleCheckIn}
                  disabled={!!todayAttendance?.check_in_time || checkingIn}
                  className="w-full"
                >
                  {checkingIn ? 'Sedang Proses...' : 'Absen Masuk'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockOut className="h-5 w-5 text-red-600" />
                Absen Keluar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {todayAttendance?.check_out_time 
                    ? `Sudah absen keluar: ${formatTime(todayAttendance.check_out_time)}`
                    : 'Belum absen keluar hari ini'
                  }
                </p>
                <Button 
                  onClick={handleCheckOut}
                  disabled={!todayAttendance?.check_in_time || !!todayAttendance?.check_out_time || checkingOut}
                  variant="outline"
                  className="w-full"
                >
                  {checkingOut ? 'Sedang Proses...' : 'Absen Keluar'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                Status Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAttendance ? (
                  <>
                    {getStatusBadge(todayAttendance.status)}
                    <div className="text-sm text-gray-600">
                      <p>Masuk: {formatTime(todayAttendance.check_in_time)}</p>
                      <p>Keluar: {formatTime(todayAttendance.check_out_time)}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-600">Belum ada data absensi hari ini</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance History */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Absensi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Tanggal</th>
                    <th className="text-left p-4">Karyawan</th>
                    <th className="text-left p-4">Masuk</th>
                    <th className="text-left p-4">Keluar</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        {new Date(record.date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-4">
                        {record.employee?.user?.full_name || 'Unknown'}
                      </td>
                      <td className="p-4">{formatTime(record.check_in_time)}</td>
                      <td className="p-4">{formatTime(record.check_out_time)}</td>
                      <td className="p-4">{getStatusBadge(record.status)}</td>
                      <td className="p-4">{record.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Attendance;
