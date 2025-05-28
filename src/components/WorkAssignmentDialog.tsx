
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { UserPlus, X } from 'lucide-react';
import { useSales } from '@/hooks/useSales';

interface WorkAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (data: {
    employeeIds: string[];
    workNotes: string;
    estimatedDays: string;
  }) => void;
  customerName: string;
}

const WorkAssignmentDialog: React.FC<WorkAssignmentDialogProps> = ({
  isOpen,
  onClose,
  onAssign,
  customerName
}) => {
  const { sales } = useSales();
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [workNotes, setWorkNotes] = useState('');
  const [estimatedDays, setEstimatedDays] = useState('');

  const handleEmployeeToggle = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSubmit = () => {
    // Work notes is still required, but employees can be empty
    if (!workNotes.trim()) {
      alert('Catatan pekerjaan harus diisi');
      return;
    }

    onAssign({
      employeeIds: selectedEmployees,
      workNotes: workNotes.trim(),
      estimatedDays
    });

    // Reset form
    setSelectedEmployees([]);
    setWorkNotes('');
    setEstimatedDays('');
  };

  const getSelectedEmployeeNames = () => {
    return selectedEmployees.map(id => {
      const employee = sales.find(s => s.id === id);
      return employee?.name || 'Unknown';
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <UserPlus className="h-5 w-5 mr-2" />
            Assign Karyawan untuk Pekerjaan
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Pelanggan: <strong>{customerName}</strong>
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Selected Employees Summary */}
          {selectedEmployees.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">
                Karyawan Terpilih ({selectedEmployees.length}):
              </h4>
              <div className="flex flex-wrap gap-2">
                {getSelectedEmployeeNames().map((name, index) => (
                  <Badge key={index} className="bg-blue-100 text-blue-800">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Employee Selection */}
          <div>
            <h4 className="font-medium mb-3">Pilih Karyawan (Opsional):</h4>
            <p className="text-sm text-gray-600 mb-3">Anda dapat mengassign karyawan sekarang atau nanti</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
              {sales.map((employee) => (
                <div key={employee.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <Checkbox
                    id={employee.id}
                    checked={selectedEmployees.includes(employee.id)}
                    onCheckedChange={() => handleEmployeeToggle(employee.id)}
                  />
                  <label 
                    htmlFor={employee.id} 
                    className="flex-1 cursor-pointer"
                  >
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-gray-600">{employee.code}</p>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Work Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Catatan Pekerjaan *
            </label>
            <Textarea
              placeholder="Jelaskan detail pekerjaan yang akan dilakukan..."
              value={workNotes}
              onChange={(e) => setWorkNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Estimated Days */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Estimasi Hari Pengerjaan
            </label>
            <Input
              type="number"
              placeholder="Masukkan estimasi hari"
              value={estimatedDays}
              onChange={(e) => setEstimatedDays(e.target.value)}
              min="1"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Simpan Assignment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkAssignmentDialog;
