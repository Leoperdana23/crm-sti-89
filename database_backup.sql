
-- SEDEKAT CRM Database Backup
-- Generated on: 2025-06-14

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS
ALTER DATABASE postgres SET row_security = on;

-- Create enum types
CREATE TYPE app_role AS ENUM ('super_admin', 'admin', 'manager', 'employee', 'sales');

-- Create function for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- App Users table
CREATE TABLE IF NOT EXISTS app_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    auth_user_id UUID UNIQUE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role app_role NOT NULL DEFAULT 'employee',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    menu_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role Permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    role app_role NOT NULL,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    can_view BOOLEAN DEFAULT false,
    can_create BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Branches table
CREATE TABLE IF NOT EXISTS branches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    manager_id UUID REFERENCES app_users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    birthday DATE,
    notes TEXT,
    created_by UUID REFERENCES app_users(id),
    branch_id UUID REFERENCES branches(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resellers table
CREATE TABLE IF NOT EXISTS resellers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    total_points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES app_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Categories table
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    category_id UUID REFERENCES product_categories(id),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Catalog Tokens table
CREATE TABLE IF NOT EXISTS catalog_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
    name TEXT NOT NULL,
    description TEXT,
    reseller_id UUID REFERENCES resellers(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES app_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    catalog_token TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    total_amount DECIMAL(12,2) DEFAULT 0,
    delivery_method TEXT DEFAULT 'pickup',
    expedisi TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_name TEXT NOT NULL,
    product_price DECIMAL(12,2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    subtotal DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reseller Sessions table
CREATE TABLE IF NOT EXISTS reseller_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reseller_id UUID REFERENCES resellers(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add triggers for updated_at
CREATE TRIGGER update_app_users_updated_at
    BEFORE UPDATE ON app_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_branches_updated_at
    BEFORE UPDATE ON branches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resellers_updated_at
    BEFORE UPDATE ON resellers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_categories_updated_at
    BEFORE UPDATE ON product_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_catalog_tokens_updated_at
    BEFORE UPDATE ON catalog_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default permissions
INSERT INTO permissions (name, description, menu_path) VALUES 
('dashboard', 'Dashboard', '/dashboard'),
('customers', 'Kelola Pelanggan', '/customers'),
('orders', 'Kelola Pesanan', '/orders'),
('resellers', 'Kelola Reseller', '/resellers'),
('reports', 'Laporan', '/reports'),
('users', 'Kelola Pengguna', '/users'),
('branches', 'Kelola Cabang', '/branches'),
('product_management', 'Kelola Produk', '/sedekat-app/product-management'),
('catalog_management', 'Kelola Katalog', '/sedekat-app/catalog-management'),
('reseller_management', 'Kelola Reseller App', '/sedekat-app/reseller-management'),
('order_management', 'Kelola Order App', '/sedekat-app/order-management'),
('commission', 'Komisi & Poin', '/sedekat-app/commission'),
('app_settings', 'Pengaturan App', '/sedekat-app/app-settings'),
('statistics', 'Statistik App', '/sedekat-app/statistics');

-- Insert default role permissions for super_admin
INSERT INTO role_permissions (role, permission_id, can_view, can_create, can_edit, can_delete)
SELECT 
    'super_admin'::app_role, 
    p.id, 
    true, 
    true, 
    true, 
    true
FROM permissions p;

-- Insert sample data
INSERT INTO app_users (name, email, role) VALUES 
('Super Admin', 'admin@sedekat.com', 'super_admin');

INSERT INTO branches (name, address, phone) VALUES 
('Cabang Pusat', 'Jakarta Pusat', '021-12345678');

INSERT INTO product_categories (name, description) VALUES 
('Elektronik', 'Produk elektronik dan gadget'),
('Fashion', 'Pakaian dan aksesoris'),
('Makanan', 'Produk makanan dan minuman');

-- Enable Row Level Security
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE resellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (customize based on your needs)
CREATE POLICY "Enable all for authenticated users" ON app_users FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON customers FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON resellers FOR ALL USING (true);
CREATE POLICY "Enable viewing active products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Enable all for authenticated users" ON products FOR ALL USING (true);
CREATE POLICY "Enable viewing active categories" ON product_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Enable all for authenticated users" ON product_categories FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON orders FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON order_items FOR ALL USING (true);
