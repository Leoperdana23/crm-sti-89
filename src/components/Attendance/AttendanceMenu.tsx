
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Clock, 
  ClockIcon as Overtime, 
  Calendar, 
  CalendarDays, 
  FileText,
  DollarSign,
  Receipt,
  MapPin
} from 'lucide-react';

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  color: string;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, subtitle, color, onClick }) => (
  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
    <CardContent className="p-4">
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface AttendanceMenuProps {
  onMenuSelect: (menu: string) => void;
}

const AttendanceMenu: React.FC<AttendanceMenuProps> = ({ onMenuSelect }) => {
  const menuItems = [
    {
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      title: "Absen",
      subtitle: "Absen masuk dan keluar",
      color: "bg-blue-100",
      key: "attendance"
    },
    {
      icon: <Overtime className="h-6 w-6 text-orange-600" />,
      title: "Lembur",
      subtitle: "Pengajuan lembur",
      color: "bg-orange-100",
      key: "overtime"
    },
    {
      icon: <Calendar className="h-6 w-6 text-green-600" />,
      title: "Cuti",
      subtitle: "Pengajuan cuti",
      color: "bg-green-100",
      key: "leave"
    },
    {
      icon: <FileText className="h-6 w-6 text-purple-600" />,
      title: "Izin",
      subtitle: "Pengajuan izin",
      color: "bg-purple-100",
      key: "permission"
    },
    {
      icon: <CalendarDays className="h-6 w-6 text-indigo-600" />,
      title: "Jadwal Pekerjaan",
      subtitle: "Lihat jadwal kerja",
      color: "bg-indigo-100",
      key: "schedule"
    },
    {
      icon: <CalendarDays className="h-6 w-6 text-teal-600" />,
      title: "Kalender",
      subtitle: "Kalender kerja",
      color: "bg-teal-100",
      key: "calendar"
    },
    {
      icon: <DollarSign className="h-6 w-6 text-emerald-600" />,
      title: "Gaji (Slip Gaji)",
      subtitle: "Lihat slip gaji",
      color: "bg-emerald-100",
      key: "payroll"
    },
    {
      icon: <Receipt className="h-6 w-6 text-red-600" />,
      title: "Klaim",
      subtitle: "Pengajuan klaim",
      color: "bg-red-100",
      key: "claims"
    }
  ];

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <h1 className="text-xl font-bold text-center">Menu Absensi</h1>
        <p className="text-blue-100 text-center text-sm mt-1">Pilih menu yang diinginkan</p>
      </div>

      {/* Menu Grid */}
      <div className="p-6 space-y-3">
        {menuItems.map((item) => (
          <MenuItem
            key={item.key}
            icon={item.icon}
            title={item.title}
            subtitle={item.subtitle}
            color={item.color}
            onClick={() => onMenuSelect(item.key)}
          />
        ))}
      </div>
    </div>
  );
};

export default AttendanceMenu;
