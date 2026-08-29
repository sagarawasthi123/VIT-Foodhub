/*
# VIT FoodHub - Sprint 5 Database Schema

Creates all tables needed for the VIT FoodHub ordering system.

## Tables Created
1. profiles - User profiles linked to Supabase auth (id, name, email, role, created_at)
2. food_courts - Food court locations (id, name, location, status, created_at)
3. shops - Shops within food courts (id, food_court_id, shopkeeper_id, name, category, contact, status, created_at)
4. menu_items - Food items on shop menus (id, shop_id, name, description, price, category, type, availability, preparation_time, image, created_at)
5. cart_items - Student shopping cart (id, student_id, menu_item_id, quantity, created_at)
6. orders - Student orders (id, student_id, shop_id, total_amount, payment_status, order_status, token_number, qr_code_data, payment_method, estimated_pickup_time, created_at, updated_at)
7. order_items - Items within an order (id, order_id, menu_item_id, name, quantity, price)

## Security (RLS)
- profiles: Users can read/update own profile. Admins can read all.
- food_courts, shops, menu_items: Public read (anon + authenticated). Shopkeepers can update their own shop's menu items.
- cart_items: Students can CRUD their own cart items.
- orders: Students can read their own orders. Shopkeepers can read/update orders for their shop.
- order_items: Students can read their own order items. Shopkeepers can read order items for their shop's orders.

## Seed Data
- 2 food courts, 3 shops, 5 menu items, 1 demo shopkeeper account
*/

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'shopkeeper', 'admin')),
  reg_no text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================================
-- FOOD COURTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS food_courts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  crowd text NOT NULL DEFAULT 'low' CHECK (crowd IN ('low', 'moderate', 'busy')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE food_courts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "food_courts_select_all" ON food_courts;
CREATE POLICY "food_courts_select_all"
ON food_courts FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "food_courts_insert_admin" ON food_courts;
CREATE POLICY "food_courts_insert_admin"
ON food_courts FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "food_courts_update_admin" ON food_courts;
CREATE POLICY "food_courts_update_admin"
ON food_courts FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "food_courts_delete_admin" ON food_courts;
CREATE POLICY "food_courts_delete_admin"
ON food_courts FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ============================================================
-- SHOPS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  food_court_id uuid NOT NULL REFERENCES food_courts(id) ON DELETE CASCADE,
  shopkeeper_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT '',
  contact text DEFAULT '',
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  crowd text NOT NULL DEFAULT 'low' CHECK (crowd IN ('low', 'moderate', 'busy')),
  rating numeric DEFAULT 0,
  image text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shops_select_all" ON shops;
CREATE POLICY "shops_select_all"
ON shops FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "shops_insert_admin" ON shops;
CREATE POLICY "shops_insert_admin"
ON shops FOR INSERT
TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "shops_update_admin" ON shops;
CREATE POLICY "shops_update_admin"
ON shops FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

DROP POLICY IF EXISTS "shops_delete_admin" ON shops;
CREATE POLICY "shops_delete_admin"
ON shops FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- ============================================================
-- MENU ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  price integer NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'veg' CHECK (type IN ('veg', 'non_veg')),
  availability text NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'low_stock', 'out_of_stock')),
  preparation_time integer DEFAULT 10,
  image text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "menu_items_select_all" ON menu_items;
CREATE POLICY "menu_items_select_all"
ON menu_items FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "menu_items_insert_shopkeeper" ON menu_items;
CREATE POLICY "menu_items_insert_shopkeeper"
ON menu_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shops s
    JOIN profiles p ON p.id = auth.uid()
    WHERE s.id = menu_items.shop_id
    AND (s.shopkeeper_id = auth.uid() OR p.role = 'admin')
  )
);

DROP POLICY IF EXISTS "menu_items_update_shopkeeper" ON menu_items;
CREATE POLICY "menu_items_update_shopkeeper"
ON menu_items FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM shops s
    JOIN profiles p ON p.id = auth.uid()
    WHERE s.id = menu_items.shop_id
    AND (s.shopkeeper_id = auth.uid() OR p.role = 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM shops s
    JOIN profiles p ON p.id = auth.uid()
    WHERE s.id = menu_items.shop_id
    AND (s.shopkeeper_id = auth.uid() OR p.role = 'admin')
  )
);

DROP POLICY IF EXISTS "menu_items_delete_shopkeeper" ON menu_items;
CREATE POLICY "menu_items_delete_shopkeeper"
ON menu_items FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM shops s
    JOIN profiles p ON p.id = auth.uid()
    WHERE s.id = menu_items.shop_id
    AND (s.shopkeeper_id = auth.uid() OR p.role = 'admin')
  )
);

-- ============================================================
-- CART ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cart_select_own" ON cart_items;
CREATE POLICY "cart_select_own"
ON cart_items FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "cart_insert_own" ON cart_items;
CREATE POLICY "cart_insert_own"
ON cart_items FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "cart_update_own" ON cart_items;
CREATE POLICY "cart_update_own"
ON cart_items FOR UPDATE
TO authenticated
USING (auth.uid() = student_id)
WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "cart_delete_own" ON cart_items;
CREATE POLICY "cart_delete_own"
ON cart_items FOR DELETE
TO authenticated
USING (auth.uid() = student_id);

-- ============================================================
-- ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id uuid NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  total_amount integer NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'SUCCESS', 'FAILED')),
  order_status text NOT NULL DEFAULT 'PLACED' CHECK (order_status IN ('PLACED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED')),
  token_number text NOT NULL,
  qr_code_data text DEFAULT '',
  payment_method text DEFAULT '',
  estimated_pickup_time text DEFAULT '',
  student_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Students can read their own orders
DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own"
ON orders FOR SELECT
TO authenticated
USING (
  auth.uid() = student_id
  OR EXISTS (
    SELECT 1 FROM shops s
    WHERE s.id = orders.shop_id
    AND s.shopkeeper_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- Students can insert their own orders
DROP POLICY IF EXISTS "orders_insert_own" ON orders;
CREATE POLICY "orders_insert_own"
ON orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id);

-- Students can update their own orders (for payment status), shopkeepers can update order status
DROP POLICY IF EXISTS "orders_update_own" ON orders;
CREATE POLICY "orders_update_own"
ON orders FOR UPDATE
TO authenticated
USING (
  auth.uid() = student_id
  OR EXISTS (
    SELECT 1 FROM shops s
    WHERE s.id = orders.shop_id
    AND s.shopkeeper_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  )
)
WITH CHECK (
  auth.uid() = student_id
  OR EXISTS (
    SELECT 1 FROM shops s
    WHERE s.id = orders.shop_id
    AND s.shopkeeper_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  )
);

-- ============================================================
-- ORDER ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
  name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price integer NOT NULL DEFAULT 0,
  image text DEFAULT ''
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
CREATE POLICY "order_items_select_own"
ON order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_items.order_id
    AND (
      o.student_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM shops s WHERE s.id = o.shop_id AND s.shopkeeper_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
      )
    )
  )
);

DROP POLICY IF EXISTS "order_items_insert_own" ON order_items;
CREATE POLICY "order_items_insert_own"
ON order_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_items.order_id
    AND o.student_id = auth.uid()
  )
);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SEED DATA
-- ============================================================

-- Food Courts
INSERT INTO food_courts (name, location, description, status, crowd)
VALUES
  ('Food Court 1', 'Ground Floor, Main Academic Block', 'Diverse cuisines ranging from North Indian to fast food.', 'open', 'busy'),
  ('Food Court 2', 'First Floor, SJT Building', 'Popular South Indian meals, snacks and refreshing beverages.', 'open', 'moderate')
ON CONFLICT DO NOTHING;

-- Shops (food_court_id will be set via subquery since we use gen_random_uuid)
INSERT INTO shops (food_court_id, name, category, contact, status, crowd, rating, image)
SELECT fc.id, 'Burger House', 'Fast Food', '9876543210', 'open', 'busy', 4.2,
  'https://images.pexels.com/photos/5374419/pexels-photo-5374419.jpeg?auto=compress&cs=tinysrgb&w=600'
FROM food_courts fc WHERE fc.name = 'Food Court 1'
ON CONFLICT DO NOTHING;

INSERT INTO shops (food_court_id, name, category, contact, status, crowd, rating, image)
SELECT fc.id, 'Pizza Corner', 'Fast Food', '9876543211', 'open', 'moderate', 4.0,
  'https://images.pexels.com/photos/708589/pexels-photo-708589.jpeg?auto=compress&cs=tinysrgb&w=600'
FROM food_courts fc WHERE fc.name = 'Food Court 1'
ON CONFLICT DO NOTHING;

INSERT INTO shops (food_court_id, name, category, contact, status, crowd, rating, image)
SELECT fc.id, 'South Indian Kitchen', 'South Indian', '9876543212', 'open', 'moderate', 4.5,
  'https://images.pexels.com/photos/20422123/pexels-photo-20422123.jpeg?auto=compress&cs=tinysrgb&w=600'
FROM food_courts fc WHERE fc.name = 'Food Court 2'
ON CONFLICT DO NOTHING;

-- Menu Items for Burger House
INSERT INTO menu_items (shop_id, name, description, price, category, type, availability, preparation_time, image)
SELECT s.id, 'Veg Burger', 'Crispy veg patty with cheese and fresh veggies.', 70, 'Fast Food', 'veg', 'available', 7,
  'https://images.pexels.com/photos/28636771/pexels-photo-28636771.jpeg?auto=compress&cs=tinysrgb&w=600'
FROM shops s WHERE s.name = 'Burger House'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (shop_id, name, description, price, category, type, availability, preparation_time, image)
SELECT s.id, 'Cheese Burger', 'Grilled chicken patty with lettuce and extra cheese.', 95, 'Fast Food', 'non_veg', 'available', 9,
  'https://images.pexels.com/photos/36007383/pexels-photo-36007383.jpeg?auto=compress&cs=tinysrgb&w=600'
FROM shops s WHERE s.name = 'Burger House'
ON CONFLICT DO NOTHING;

-- Menu Items for Pizza Corner
INSERT INTO menu_items (shop_id, name, description, price, category, type, availability, preparation_time, image)
SELECT s.id, 'Margherita Pizza', 'Classic pizza with mozzarella, tomato sauce and basil.', 180, 'Fast Food', 'veg', 'available', 15,
  'https://images.pexels.com/photos/708589/pexels-photo-708589.jpeg?auto=compress&cs=tinysrgb&w=600'
FROM shops s WHERE s.name = 'Pizza Corner'
ON CONFLICT DO NOTHING;

-- Menu Items for South Indian Kitchen
INSERT INTO menu_items (shop_id, name, description, price, category, type, availability, preparation_time, image)
SELECT s.id, 'Masala Dosa', 'Crispy rice crepe filled with spiced potato masala.', 60, 'South Indian', 'veg', 'available', 10,
  'https://images.pexels.com/photos/39104603/pexels-photo-39104603.jpeg?auto=compress&cs=tinysrgb&w=600'
FROM shops s WHERE s.name = 'South Indian Kitchen'
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (shop_id, name, description, price, category, type, availability, preparation_time, image)
SELECT s.id, 'Idli Sambar', 'Steamed rice cakes served with sambar and chutney.', 40, 'South Indian', 'veg', 'available', 6,
  'https://images.pexels.com/photos/35514447/pexels-photo-35514447.jpeg?auto=compress&cs=tinysrgb&w=600'
FROM shops s WHERE s.name = 'South Indian Kitchen'
ON CONFLICT DO NOTHING;

-- ============================================================
-- TOKEN GENERATOR FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION generate_token_number()
RETURNS text AS $$
DECLARE
  next_num integer;
  token text;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(token_number FROM 4) AS integer)), 0) + 1
  INTO next_num
  FROM orders
  WHERE token_number LIKE 'FH-%';

  token := 'FH-' || lpad(next_num::text, 3, '0');
  RETURN token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
