
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useEmployees } from '@/hooks/useEmployees';
import { useAttendanceWithGPS } from '@/hooks/useAttendanceWithGPS';
import AttendanceForm from '@/components/Attendance/AttendanceForm';
import AttendanceMenu from '@/components/Attendance/AttendanceMenu';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AttendanceApp = () => {
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { checkIn, checkOut, getTodayAttendance } = useAttendanceWithGPS();
  const [currentView, setCurrentView] = useState<string>('menu');

  // Find current user's employee record
  const currentEmployee = employees.find(emp => emp.user_id === user?.id);
  const todayAttendance = currentEmployee ? getTodayAttendance(currentEmployee.id) : null;

  const handleCheckIn = async (location: { latitude: number; longitude: number }, notes?: string) => {
    if (!currentEmployee) {
      throw new Error('Data karyawan tidak ditemukan');
    }
    await checkIn(currentEmployee.id, location, notes);
  };

  const handleCheckOut = async (location: { latitude: number; longitude: number }, notes?: string) => {
    if (!todayAttendance) {
      throw new Error('Belum absen masuk hari ini');
    }
    await checkOut(todayAttendance.id, location, notes);
  };

  const handleMenuSelect = (menu: string) => {
    setCurrentView(menu);
  };

  const handleBackToMenu = () => {
    setCurrentView('menu');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'attendance':
        return (
          <div>
            <div className="flex items-center p-4 bg-white shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToMenu}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">Kembali ke Menu</h1>
            </div>
            <AttendanceForm
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              todayAttendance={todayAttendance}
              currentEmployee={currentEmployee}
            />
          </div>
        );
      
      case 'overtime':
        return (
          <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
            <div className="flex items-center p-4 bg-white shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToMenu}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">Pengajuan Lembur</h1>
            </div>
            <div className="p-6">
              <div className="bg-white rounded-lg p-6 text-center">
                <p className="text-gray-500">Fitur pengajuan lembur akan segera tersedia</p>
              </div>
            </div>
          </div>
        );
      
      case 'leave':
        return (
          <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
            <div className="flex items-center p-4 bg-white shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToMenu}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">Pengajuan Cuti</h1>
            </div>
            <div className="p-6">
              <div className="bg-white rounded-lg p-6 text-center">
                <p className="text-gray-500">Fitur pengajuan cuti akan segera tersedia</p>
              </div>
            </div>
          </div>
        );
      
      case 'permission':
        return (
          <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
            <div className="flex items-center p-4 bg-white shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToMenu}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">Pengajuan Izin</h1>
            </div>
            <div className="p-6">
              <div className="bg-white rounded-lg p-6 text-center">
                <p className="text-gray-500">Fitur pengajuan izin akan segera tersedia</p>
              </div>
            </div>
          </div>
        );
      
      case 'schedule':
        return (
          <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
            <div className="flex items-center p-4 bg-white shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToMenu}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">Jadwal Pekerjaan</h1>
            </div>
            <div className="p-6">
              <div className="bg-white rounded-lg p-6 text-center">
                <p className="text-gray-500">Fitur jadwal pekerjaan akan segera tersedia</p>
              </div>
            </div>
          </div>
        );
      
      case 'calendar':
        return (
          <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
            <div className="flex items-center p-4 bg-white shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToMenu}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">Kalender</h1>
            </div>
            <div className="p-6">
              <div className="bg-white rounded-lg p-6 text-center">
                <p className="text-gray-500">Fitur kalender akan segera tersedia</p>
              </div>
            </div>
          </div>
        );
      
      case 'payroll':
        return (
          <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
            <div className="flex items-center p-4 bg-white shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToMenu}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">Slip Gaji</h1>
            </div>
            <div className="p-6">
              <div className="bg-white rounded-lg p-6 text-center">
                <p className="text-gray-500">Fitur slip gaji akan segera tersedia</p>
              </div>
            </div>
          </div>
        );
      
      case 'claims':
        return (
          <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
            <div className="flex items-center p-4 bg-white shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToMenu}
                className="mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">Klaim</h1>
            </div>
            <div className="p-6">
              <div className="bg-white rounded-lg p-6 text-center">
                <p className="text-gray-500">Fitur klaim akan segera tersedia</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return <AttendanceMenu onMenuSelect={handleMenuSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {renderContent()}
    </div>
  );
};

export default AttendanceApp;
