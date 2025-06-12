
-- Create table for employee locations/offices
CREATE TABLE employee_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  radius INTEGER NOT NULL DEFAULT 100, -- radius in meters
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for work schedules
CREATE TABLE work_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location_id UUID REFERENCES employee_locations(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for overtime requests
CREATE TABLE overtime_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES app_users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update attendance table to include GPS coordinates
ALTER TABLE attendance 
ADD COLUMN check_in_latitude DECIMAL(10, 8),
ADD COLUMN check_in_longitude DECIMAL(11, 8),
ADD COLUMN check_out_latitude DECIMAL(10, 8),
ADD COLUMN check_out_longitude DECIMAL(11, 8),
ADD COLUMN location_id UUID REFERENCES employee_locations(id);

-- Add triggers for updated_at
CREATE TRIGGER update_employee_locations_updated_at
    BEFORE UPDATE ON employee_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_schedules_updated_at
    BEFORE UPDATE ON work_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_overtime_requests_updated_at
    BEFORE UPDATE ON overtime_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default office location
INSERT INTO employee_locations (name, address, latitude, longitude, radius)
VALUES ('Kantor Pusat PT STI', 'Jakarta, Indonesia', -6.2088, 106.8456, 200);
