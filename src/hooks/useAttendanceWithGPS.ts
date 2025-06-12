
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Attendance } from '@/types/employee';
import { toast } from 'sonner';

interface Location {
  latitude: number;
  longitude: number;
}

interface EmployeeLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number;
  is_active: boolean;
}

export const useAttendanceWithGPS = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [employeeLocations, setEmployeeLocations] = useState<EmployeeLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          employee:employees(
            *,
            user:app_users(full_name, email)
          )
        `)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching attendance:', error);
        return;
      }

      setAttendanceRecords((data || []) as Attendance[]);
    } catch (error) {
      console.error('Error in fetchAttendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_locations')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching locations:', error);
        return;
      }

      setEmployeeLocations((data || []) as EmployeeLocation[]);
    } catch (error) {
      console.error('Error in fetchEmployeeLocations:', error);
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchEmployeeLocations();
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ, λ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; // in metres
    return d;
  };

  const validateLocation = (userLocation: Location): EmployeeLocation | null => {
    for (const location of employeeLocations) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        location.latitude,
        location.longitude
      );

      if (distance <= location.radius) {
        return location;
      }
    }
    return null;
  };

  const checkIn = async (employeeId: string, location: Location, notes?: string) => {
    try {
      const validLocation = validateLocation(location);
      
      if (!validLocation) {
        toast.error('Anda berada di luar area yang diizinkan untuk absen');
        throw new Error('Invalid location');
      }

      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('attendance')
        .upsert({
          employee_id: employeeId,
          date: today,
          check_in_time: now,
          check_in_latitude: location.latitude,
          check_in_longitude: location.longitude,
          location_id: validLocation.id,
          status: 'present',
          notes
        })
        .select(`
          *,
          employee:employees(
            *,
            user:app_users(full_name, email)
          )
        `)
        .single();

      if (error) {
        console.error('Error checking in:', error);
        throw error;
      }

      if (data) {
        setAttendanceRecords(prev => {
          const existing = prev.find(a => a.employee_id === employeeId && a.date === today);
          if (existing) {
            return prev.map(a => a.id === (data as Attendance).id ? data as Attendance : a);
          }
          return [data as Attendance, ...prev];
        });
        toast.success(`Berhasil absen masuk di ${validLocation.name}`);
        return data as Attendance;
      }
    } catch (error) {
      console.error('Error in checkIn:', error);
      throw error;
    }
  };

  const checkOut = async (attendanceId: string, location: Location, notes?: string) => {
    try {
      const validLocation = validateLocation(location);
      
      if (!validLocation) {
        toast.error('Anda berada di luar area yang diizinkan untuk absen');
        throw new Error('Invalid location');
      }

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('attendance')
        .update({
          check_out_time: now,
          check_out_latitude: location.latitude,
          check_out_longitude: location.longitude,
          notes
        })
        .eq('id', attendanceId)
        .select(`
          *,
          employee:employees(
            *,
            user:app_users(full_name, email)
          )
        `)
        .single();

      if (error) {
        console.error('Error checking out:', error);
        throw error;
      }

      if (data) {
        setAttendanceRecords(prev => prev.map(a => a.id === attendanceId ? data as Attendance : a));
        toast.success(`Berhasil absen keluar di ${validLocation.name}`);
        return data as Attendance;
      }
    } catch (error) {
      console.error('Error in checkOut:', error);
      throw error;
    }
  };

  const getTodayAttendance = (employeeId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return attendanceRecords.find(a => a.employee_id === employeeId && a.date === today);
  };

  return {
    attendanceRecords,
    employeeLocations,
    loading,
    checkIn,
    checkOut,
    getTodayAttendance,
    refreshAttendance: fetchAttendance
  };
};
