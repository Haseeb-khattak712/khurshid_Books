-- ==============================================================================
-- Khurshid Books: Category Self-Relation & Product Category Associations
-- ==============================================================================

-- 1. Ensure categories table exists with parent_id (Self-Relation)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT DEFAULT 'Folder',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- In case table already exists without parent_id, add column idempotently
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'categories' 
      AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE public.categories ADD COLUMN parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 2. Create index on parent_id for fast tree traversals
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order);

-- 3. Enhance products table to support category foreign keys & multi-category arrays
DO $$
BEGIN
  -- Ensure category_id exists (foreign key to primary category)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'products' 
      AND column_name = 'category_id'
  ) THEN
    ALTER TABLE public.products ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
  END IF;

  -- Ensure category_ids exists (for items belonging to multiple categories)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'products' 
      AND column_name = 'category_ids'
  ) THEN
    ALTER TABLE public.products ADD COLUMN category_ids UUID[] DEFAULT '{}';
  END IF;

  -- Ensure subcategory column exists as convenient label
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'products' 
      AND column_name = 'subcategory'
  ) THEN
    ALTER TABLE public.products ADD COLUMN subcategory TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_category_ids ON public.products USING GIN (category_ids);

-- 4. Row Level Security for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Public categories are viewable by everyone'
  ) THEN
    CREATE POLICY "Public categories are viewable by everyone" 
      ON public.categories FOR SELECT 
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Admins can insert categories'
  ) THEN
    CREATE POLICY "Admins can insert categories" 
      ON public.categories FOR INSERT 
      TO authenticated 
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Admins can update categories'
  ) THEN
    CREATE POLICY "Admins can update categories" 
      ON public.categories FOR UPDATE 
      TO authenticated 
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Admins can delete categories'
  ) THEN
    CREATE POLICY "Admins can delete categories" 
      ON public.categories FOR DELETE 
      TO authenticated 
      USING (true);
  END IF;
END $$;

-- 5. Seed Core Pillars with Hierarchical Subcategories
-- Insert Parents First
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
ON CONFLICT (slug) DO UPDATE SET
  icon_name = EXCLUDED.icon_name,
  description = EXCLUDED.description;

-- Insert Subcategories (referencing parent by slug)
INSERT INTO public.categories (name, slug, description, icon_name, display_order, is_active, parent_id)
VALUES
  -- Under Books & Syllabi
  ('Oxford University Press', 'oxford-books', 'Oxford curriculum series and readers', 'BookOpen', 1, true, (SELECT id FROM public.categories WHERE slug = 'books')),
  ('Cambridge International', 'cambridge-books', 'Cambridge IGCSE, O-Level & primary resources', 'BookOpen', 2, true, (SELECT id FROM public.categories WHERE slug = 'books')),
  ('Punjab Textbook Board (PTB)', 'ptb-books', 'Government curriculum textbooks for all grades', 'BookOpen', 3, true, (SELECT id FROM public.categories WHERE slug = 'books')),
  ('Story Books & Fiction', 'story-books', 'Children tales, English classics, and Urdu literature', 'Smile', 4, true, (SELECT id FROM public.categories WHERE slug = 'books')),
  
  -- Under School Packs
  ('Pre-School & Kindergarten', 'kindergarten-packs', 'Complete course packs for Nursery, KG & Prep', 'School', 1, true, (SELECT id FROM public.categories WHERE slug = 'school-packs')),
  ('Primary Grades (1 - 5)', 'primary-packs', 'All-in-one book and notebook course packs for grades 1-5', 'School', 2, true, (SELECT id FROM public.categories WHERE slug = 'school-packs')),
  ('Middle Grades (6 - 8)', 'middle-packs', 'Comprehensive course packs for grades 6-8', 'School', 3, true, (SELECT id FROM public.categories WHERE slug = 'school-packs')),
  ('Matric & O-Levels (9 - 10)', 'matric-o-levels-packs', 'Senior school course book packs and exam syllabi', 'School', 4, true, (SELECT id FROM public.categories WHERE slug = 'school-packs')),

  -- Under Notebooks & Registers
  ('Narrow Line Notebooks', 'narrow-line-notebooks', 'Standard single-line exercise notebooks', 'BookMarked', 1, true, (SELECT id FROM public.categories WHERE slug = 'notebooks')),
  ('Broad Line Notebooks', 'broad-line-notebooks', 'Double and broad-lined notebooks for early grades & Urdu', 'BookMarked', 2, true, (SELECT id FROM public.categories WHERE slug = 'notebooks')),
  ('Four Line Notebooks', 'four-line-notebooks', 'English handwriting exercise notebooks', 'BookMarked', 3, true, (SELECT id FROM public.categories WHERE slug = 'notebooks')),
  ('Grid & Math Registers', 'grid-registers', 'Small and big square grid notebooks for Mathematics', 'Calculator', 4, true, (SELECT id FROM public.categories WHERE slug = 'notebooks')),
  ('Spiral Bound Registers', 'spiral-registers', 'Durable plastic-cover and hardcover spiral registers', 'BookMarked', 5, true, (SELECT id FROM public.categories WHERE slug = 'notebooks')),

  -- Under Pens & Writing
  ('Ballpoint Pens', 'ballpoint-pens', 'Smooth daily writing ballpoints in blue, black, red', 'PenLine', 1, true, (SELECT id FROM public.categories WHERE slug = 'pens')),
  ('Gel & Rollerball Pens', 'gel-pens', 'Precision ink flow gel pens for exams and office', 'PenLine', 2, true, (SELECT id FROM public.categories WHERE slug = 'pens')),
  ('Fountain Pens & Ink', 'fountain-pens', 'Classic nib fountain pens and washable ink pots', 'PenLine', 3, true, (SELECT id FROM public.categories WHERE slug = 'pens')),
  ('Highlighters & Markers', 'highlighters-markers', 'Pastel and neon text highlighters and whiteboard markers', 'PenLine', 4, true, (SELECT id FROM public.categories WHERE slug = 'pens')),

  -- Under Fine Arts & Crafts
  ('Paints & Mediums', 'paints-mediums', 'Acrylic, oil, watercolor tubes and palette cakes', 'Palette', 1, true, (SELECT id FROM public.categories WHERE slug = 'art-supplies')),
  ('Sketchbooks & Canvases', 'sketchbooks-canvases', 'Heavyweight cartridge paper pads and stretched canvas', 'Palette', 2, true, (SELECT id FROM public.categories WHERE slug = 'art-supplies')),
  ('Brushes & Tools', 'brushes-tools', 'Synthetic hair round/flat brushes, palette knives', 'Scissors', 3, true, (SELECT id FROM public.categories WHERE slug = 'art-supplies')),

  -- Under Geometry & Math Tools
  ('Geometry Instrument Boxes', 'geometry-boxes', 'Complete tin and plastic mathematical instrument sets', 'Ruler', 1, true, (SELECT id FROM public.categories WHERE slug = 'geometry')),
  ('Calculators', 'calculators', 'Scientific and standard desktop calculators', 'Calculator', 2, true, (SELECT id FROM public.categories WHERE slug = 'geometry'))
ON CONFLICT (slug) DO UPDATE SET
  parent_id = EXCLUDED.parent_id,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name;

-- 6. Permissions and reload PostgREST schema cache
GRANT ALL ON TABLE public.categories TO anon, authenticated, service_role;
NOTIFY pgrst, 'reload schema';
