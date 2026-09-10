import {
  BookOpen,
  School,
  BookMarked,
  PenLine,
  Palette,
  Backpack,
  Briefcase,
  Ruler,
  FileText,
  Sparkles,
  Gift,
  Calculator,
  Scissors,
  Folder,
  Tag,
  Layers,
  Smile,
  Boxes
} from 'lucide-react';
import { supabase } from './supabase.js';

export const ICON_MAP = {
  BookOpen,
  School,
  BookMarked,
  PenLine,
  Palette,
  Backpack,
  Briefcase,
  Ruler,
  FileText,
  Sparkles,
  Gift,
  Calculator,
  Scissors,
  Folder,
  Tag,
  Layers,
  Smile,
  Boxes
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

export const getCategoryIcon = (iconName) => {
  return ICON_MAP[iconName] || Folder;
};

export const DEFAULT_CATEGORIES = [
  {
    id: 'def-1',
    name: 'Books & Syllabi',
    slug: 'books',
    description: 'Textbooks, novels, storybooks, and curriculum guides',
    icon_name: 'BookOpen',
    display_order: 1,
    is_active: true
  },
  {
    id: 'def-2',
    name: 'School Packs',
    slug: 'school-packs',
    description: 'Curated grade-wise school course packs and bundles',
    icon_name: 'School',
    display_order: 2,
    is_active: true
  },
  {
    id: 'def-3',
    name: 'Notebooks & Registers',
    slug: 'notebooks',
    description: 'Ruled, broad-line, grid, and spiral exercise notebooks',
    icon_name: 'BookMarked',
    display_order: 3,
    is_active: true
  },
  {
    id: 'def-4',
    name: 'Pens & Writing',
    slug: 'pens',
    description: 'Ballpoints, gel pens, fountain pens, and highlighters',
    icon_name: 'PenLine',
    display_order: 4,
    is_active: true
  },
  {
    id: 'def-5',
    name: 'Fine Arts & Crafts',
    slug: 'art-supplies',
    description: 'Acrylics, oil paints, sketch pads, easels, and brushes',
    icon_name: 'Palette',
    display_order: 5,
    is_active: true
  },
  {
    id: 'def-6',
    name: 'School Bags & Bottles',
    slug: 'bags',
    description: 'Ergonomic backpacks, lunch boxes, and hydration bottles',
    icon_name: 'Backpack',
    display_order: 6,
    is_active: true
  },
  {
    id: 'def-7',
    name: 'Office & Desk Supplies',
    slug: 'office-supplies',
    description: 'Files, folders, organizers, calculators, and stationery',
    icon_name: 'Briefcase',
    display_order: 7,
    is_active: true
  },
  {
    id: 'def-8',
    name: 'Geometry & Math Tools',
    slug: 'geometry',
    description: 'Rulers, compasses, protractors, and math instruments',
    icon_name: 'Ruler',
    display_order: 8,
    is_active: true
  },
  {
    id: 'def-9',
    name: 'Paper & Chart Sheets',
    slug: 'paper-products',
    description: 'Poster sheets, craft paper, wrapping rolls, and notes',
    icon_name: 'FileText',
    display_order: 9,
    is_active: true
  },
  {
    id: 'def-10',
    name: 'Toys & Educational Games',
    slug: 'toys-games',
    description: 'Rubik cubes, puzzles, STEM toys, and card games',
    icon_name: 'Sparkles',
    display_order: 10,
    is_active: true
  },
  {
    id: 'def-11',
    name: 'Gifts & Party Items',
    slug: 'gifts',
    description: 'Gift wrapping, birthday decor, bags, and festive goods',
    icon_name: 'Gift',
    display_order: 11,
    is_active: true
  }
];

/**
 * Fetch all categories from Supabase, falling back to default categories if the table does not exist or is empty.
 * @param {boolean} includeInactive Whether to include inactive categories (for admin)
 * @returns {Promise<Array>} Array of category objects
 */
export async function fetchCategories(includeInactive = false) {
  try {
    let query = supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Could not fetch categories from Supabase (using fallback defaults):', error.message);
      return includeInactive ? DEFAULT_CATEGORIES : DEFAULT_CATEGORIES.filter(c => c.is_active);
    }

    if (!data || data.length === 0) {
      return includeInactive ? DEFAULT_CATEGORIES : DEFAULT_CATEGORIES.filter(c => c.is_active);
    }

    return data;
  } catch (err) {
    console.error('Error fetching categories:', err);
    return includeInactive ? DEFAULT_CATEGORIES : DEFAULT_CATEGORIES.filter(c => c.is_active);
  }
}

/**
 * Create a new category in Supabase
 */
export async function createCategory(categoryData) {
  const { data, error } = await supabase
    .from('categories')
    .insert([
      {
        name: categoryData.name.trim(),
        slug: categoryData.slug?.trim() || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: categoryData.description || '',
        icon_name: categoryData.icon_name || 'Folder',
        display_order: Number(categoryData.display_order) || 0,
        is_active: categoryData.is_active ?? true
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing category
 */
export async function updateCategory(id, updates) {
  const payload = { ...updates, updated_at: new Date().toISOString() };
  delete payload.id;

  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a category
 */
export async function deleteCategory(id) {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/**
 * Seed or re-seed the default categories into Supabase
 */
export async function seedDefaultCategories() {
  const rowsToInsert = DEFAULT_CATEGORIES.map(({ id: _id, ...rest }) => rest);
  const { data, error } = await supabase
    .from('categories')
    .upsert(rowsToInsert, { onConflict: 'slug' })
    .select();

  if (error) throw error;
  return data;
}
