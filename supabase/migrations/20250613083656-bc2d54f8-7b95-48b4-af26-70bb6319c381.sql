
-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;

-- Create more flexible RLS policies for products
CREATE POLICY "Enable read access for all users" ON products
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON products
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL OR 
        EXISTS (
            SELECT 1 FROM app_users 
            WHERE auth_user_id = auth.uid() 
            AND is_active = true
        )
    );

CREATE POLICY "Enable update for authenticated users" ON products
    FOR UPDATE USING (
        auth.uid() IS NOT NULL OR 
        EXISTS (
            SELECT 1 FROM app_users 
            WHERE auth_user_id = auth.uid() 
            AND is_active = true
        )
    );

CREATE POLICY "Enable delete for authenticated users" ON products
    FOR DELETE USING (
        auth.uid() IS NOT NULL OR 
        EXISTS (
            SELECT 1 FROM app_users 
            WHERE auth_user_id = auth.uid() 
            AND is_active = true
        )
    );

-- Also ensure product_categories has proper RLS
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON product_categories;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON product_categories;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON product_categories;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON product_categories;

CREATE POLICY "Enable read access for all users" ON product_categories
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON product_categories
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL OR 
        EXISTS (
            SELECT 1 FROM app_users 
            WHERE auth_user_id = auth.uid() 
            AND is_active = true
        )
    );

CREATE POLICY "Enable update for authenticated users" ON product_categories
    FOR UPDATE USING (
        auth.uid() IS NOT NULL OR 
        EXISTS (
            SELECT 1 FROM app_users 
            WHERE auth_user_id = auth.uid() 
            AND is_active = true
        )
    );

CREATE POLICY "Enable delete for authenticated users" ON product_categories
    FOR DELETE USING (
        auth.uid() IS NOT NULL OR 
        EXISTS (
            SELECT 1 FROM app_users 
            WHERE auth_user_id = auth.uid() 
            AND is_active = true
        )
    );
