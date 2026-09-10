-- ==============================================================================
-- Khurshid Books: Categories Schema & Default Seed Data
-- ==============================================================================

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT DEFAULT 'Folder',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Anyone can view active categories
CREATE POLICY "Public categories are viewable by everyone" 
  ON public.categories FOR SELECT 
  USING (true);

-- Authenticated admins can insert categories
CREATE POLICY "Admins can insert categories" 
  ON public.categories FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Authenticated admins can update categories
CREATE POLICY "Admins can update categories" 
  ON public.categories FOR UPDATE 
  TO authenticated 
  USING (true);

-- Authenticated admins can delete categories
CREATE POLICY "Admins can delete categories" 
  ON public.categories FOR DELETE 
  TO authenticated 
  USING (true);

-- 4. Initial Seed: 11 Core Pillars Adapted & Streamlined from Scribble.pk
INSERT INTO public.categories (name, slug, description, icon_name, display_order, is_active)
VALUES
  ('Books & Syllabi', 'books', 'Textbooks, novels, storybooks, and curriculum guides', 'BookOpen', 1, true),
  ('School Packs', 'school-packs', 'Curated grade-wise school course packs and bundles', 'School', 2, true),
  ('Notebooks & Registers', 'notebooks', 'Ruled, broad-line, grid, and spiral exercise notebooks', 'BookMarked', 3, true),
  ('Pens & Writing', 'pens', 'Ballpoints, gel pens, fountain pens, and highlighters', 'PenLine', 4, true),
  ('Fine Arts & Crafts', 'art-supplies', 'Acrylics, oil paints, sketch pads, easels, and brushes', 'Palette', 5, true),
  ('School Bags & Bottles', 'bags', 'Ergonomic backpacks, lunch boxes, and hydration bottles', 'Backpack', 6, true),
  ('Office & Desk Supplies', 'office-supplies', 'Files, folders, organizers, calculators, and stationery', 'Briefcase', 7, true),
  ('Geometry & Math Tools', 'geometry', 'Rulers, compasses, protractors, and math instruments', 'Ruler', 8, true),
  ('Paper & Chart Sheets', 'paper-products', 'Poster sheets, craft paper, wrapping rolls, and notes', 'FileText', 9, true),
  ('Toys & Educational Games', 'toys-games', 'Rubik cubes, puzzles, STEM toys, and card games', 'Sparkles', 10, true),
  ('Gifts & Party Items', 'gifts', 'Gift wrapping, birthday decor, bags, and festive goods', 'Gift', 11, true)
ON CONFLICT (slug) DO NOTHING;

-- 5. Grant permissions & reload PostgREST schema cache
GRANT ALL ON TABLE public.categories TO anon, authenticated, service_role;
NOTIFY pgrst, 'reload schema';

