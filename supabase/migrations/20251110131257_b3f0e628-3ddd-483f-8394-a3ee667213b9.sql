-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for managing admin access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Create menu_items table
CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on menu_items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu_items
-- Everyone can view available menu items
CREATE POLICY "Anyone can view available menu items"
  ON public.menu_items
  FOR SELECT
  USING (is_available = TRUE OR public.has_role(auth.uid(), 'admin'));

-- Only admins can insert menu items
CREATE POLICY "Admins can insert menu items"
  ON public.menu_items
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update menu items
CREATE POLICY "Admins can update menu items"
  ON public.menu_items
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete menu items
CREATE POLICY "Admins can delete menu items"
  ON public.menu_items
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create trigger for menu_items
CREATE TRIGGER update_menu_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample menu items
INSERT INTO public.menu_items (name, description, price, category, image_url, is_available) VALUES
  ('Tajine Poulet', 'Tajine traditionnel au poulet, citron confit et olives', 85.00, 'Plats Principaux', NULL, TRUE),
  ('Couscous Royal', 'Couscous aux sept légumes avec viande d''agneau', 120.00, 'Plats Principaux', NULL, TRUE),
  ('Pastilla au Poulet', 'Feuilleté sucré-salé au poulet et amandes', 95.00, 'Entrées', NULL, TRUE),
  ('Harira', 'Soupe traditionnelle marocaine', 35.00, 'Entrées', NULL, TRUE),
  ('Thé à la Menthe', 'Thé vert à la menthe fraîche', 15.00, 'Boissons', NULL, TRUE),
  ('Cornes de Gazelle', 'Pâtisserie aux amandes', 45.00, 'Desserts', NULL, TRUE);