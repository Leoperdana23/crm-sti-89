
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Attendance } from '@/types/employee';

export const useAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
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

  useEffect(() => {
    fetchAttendance();
  }, []);

  const checkIn = async (employeeId: string, notes?: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('attendance')
        .upsert({
          employee_id: employeeId,
          date: today,
          check_in_time: now,
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
        return data as Attendance;
      }
    } catch (error) {
      console.error('Error in checkIn:', error);
      throw error;
    }
  };

  const checkOut = async (attendanceId: string, notes?: string) => {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('attendance')
        .update({
          check_out_time: now,
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
    loading,
    checkIn,
    checkOut,
    getTodayAttendance,
    refreshAttendance: fetchAttendance
  };
};
