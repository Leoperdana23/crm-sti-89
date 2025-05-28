
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LeaveRequest } from '@/types/employee';

export const useLeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          employee:employees(
            *,
            user:app_users(full_name, email)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leave requests:', error);
        return;
      }

      setLeaveRequests(data || []);
    } catch (error) {
      console.error('Error in fetchLeaveRequests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const createLeaveRequest = async (requestData: Omit<LeaveRequest, 'id' | 'status' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .insert(requestData)
        .select(`
          *,
          employee:employees(
            *,
            user:app_users(full_name, email)
          )
        `)
        .single();

      if (error) {
        console.error('Error creating leave request:', error);
        throw error;
      }

      if (data) {
        setLeaveRequests(prev => [data, ...prev]);
        return data;
      }
    } catch (error) {
      console.error('Error in createLeaveRequest:', error);
      throw error;
    }
  };

  const updateLeaveRequest = async (id: string, updates: Partial<LeaveRequest>) => {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          employee:employees(
            *,
            user:app_users(full_name, email)
          )
        `)
        .single();

      if (error) {
        console.error('Error updating leave request:', error);
        throw error;
      }

      if (data) {
        setLeaveRequests(prev => prev.map(lr => lr.id === id ? data : lr));
      }
    } catch (error) {
      console.error('Error in updateLeaveRequest:', error);
      throw error;
    }
  };

  return {
    leaveRequests,
    loading,
    createLeaveRequest,
    updateLeaveRequest,
    refreshLeaveRequests: fetchLeaveRequests
  };
};
