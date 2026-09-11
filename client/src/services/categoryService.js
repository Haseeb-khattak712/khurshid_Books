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
  Boxes,
  FolderTree
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
  Boxes,
  FolderTree
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

export const getCategoryIcon = (iconName) => {
  return ICON_MAP[iconName] || Folder;
};

// ==============================================================================
// 1. DEFAULT HIERARCHICAL FALLBACK CATEGORIES (Parents & Subcategories)
// ==============================================================================

export const DEFAULT_CATEGORIES = [
  // Core Roots
  {
    id: 'def-root-books',
    parent_id: null,
    name: 'Books & Syllabi',
    slug: 'books',
    description: 'Textbooks, novels, storybooks, and curriculum guides',
    icon_name: 'BookOpen',
    display_order: 1,
    is_active: true
  },
  {
    id: 'def-root-packs',
    parent_id: null,
    name: 'School Packs',
    slug: 'school-packs',
    description: 'Curated grade-wise school course packs and bundles',
    icon_name: 'School',
    display_order: 2,
    is_active: true
  },
  {
    id: 'def-root-notebooks',
    parent_id: null,
    name: 'Notebooks & Registers',
    slug: 'notebooks',
    description: 'Ruled, broad-line, grid, and spiral exercise notebooks',
    icon_name: 'BookMarked',
    display_order: 3,
    is_active: true
  },
  {
    id: 'def-root-pens',
    parent_id: null,
    name: 'Pens & Writing',
    slug: 'pens',
    description: 'Ballpoints, gel pens, fountain pens, and highlighters',
    icon_name: 'PenLine',
    display_order: 4,
    is_active: true
  },
  {
    id: 'def-root-art',
    parent_id: null,
    name: 'Fine Arts & Crafts',
    slug: 'art-supplies',
    description: 'Acrylics, oil paints, sketch pads, easels, and brushes',
    icon_name: 'Palette',
    display_order: 5,
    is_active: true
  },
  {
    id: 'def-root-bags',
    parent_id: null,
    name: 'School Bags & Bottles',
    slug: 'bags',
    description: 'Ergonomic backpacks, lunch boxes, and hydration bottles',
    icon_name: 'Backpack',
    display_order: 6,
    is_active: true
  },
  {
    id: 'def-root-office',
    parent_id: null,
    name: 'Office & Desk Supplies',
    slug: 'office-supplies',
    description: 'Files, folders, organizers, calculators, and stationery',
    icon_name: 'Briefcase',
    display_order: 7,
    is_active: true
  },
  {
    id: 'def-root-geometry',
    parent_id: null,
    name: 'Geometry & Math Tools',
    slug: 'geometry',
    description: 'Rulers, compasses, protractors, and math instruments',
    icon_name: 'Ruler',
    display_order: 8,
    is_active: true
  },
  {
    id: 'def-root-paper',
    parent_id: null,
    name: 'Paper & Chart Sheets',
    slug: 'paper-products',
    description: 'Poster sheets, craft paper, wrapping rolls, and notes',
    icon_name: 'FileText',
    display_order: 9,
    is_active: true
  },
  {
    id: 'def-root-toys',
    parent_id: null,
    name: 'Toys & Educational Games',
    slug: 'toys-games',
    description: 'Rubik cubes, puzzles, STEM toys, and card games',
    icon_name: 'Sparkles',
    display_order: 10,
    is_active: true
  },
  {
    id: 'def-root-gifts',
    parent_id: null,
    name: 'Gifts & Party Items',
    slug: 'gifts',
    description: 'Gift wrapping, birthday decor, bags, and festive goods',
    icon_name: 'Gift',
    display_order: 11,
    is_active: true
  },

  // Subcategories under Books & Syllabi
  {
    id: 'def-sub-oxford',
    parent_id: 'def-root-books',
    name: 'Oxford University Press',
    slug: 'oxford-books',
    description: 'Oxford curriculum series, readers, and countdown math',
    icon_name: 'BookOpen',
    display_order: 1,
    is_active: true
  },
  {
    id: 'def-sub-cambridge',
    parent_id: 'def-root-books',
    name: 'Cambridge International',
    slug: 'cambridge-books',
    description: 'Cambridge Checkpoint, IGCSE & O-Level resources',
    icon_name: 'BookOpen',
    display_order: 2,
    is_active: true
  },
  {
    id: 'def-sub-ptb',
    parent_id: 'def-root-books',
    name: 'Punjab Textbook Board (PTB)',
    slug: 'ptb-books',
    description: 'Government curriculum textbooks for all grades',
    icon_name: 'BookOpen',
    display_order: 3,
    is_active: true
  },
  {
    id: 'def-sub-stories',
    parent_id: 'def-root-books',
    name: 'Story Books & Fiction',
    slug: 'story-books',
    description: 'Children tales, English classics, and Urdu literature',
    icon_name: 'Smile',
    display_order: 4,
    is_active: true
  },

  // Subcategories under School Packs
  {
    id: 'def-sub-kindergarten',
    parent_id: 'def-root-packs',
    name: 'Pre-School & Kindergarten',
    slug: 'kindergarten-packs',
    description: 'Complete course packs for Nursery, KG & Prep',
    icon_name: 'School',
    display_order: 1,
    is_active: true
  },
  {
    id: 'def-sub-primary-packs',
    parent_id: 'def-root-packs',
    name: 'Primary Grades (1 - 5)',
    slug: 'primary-packs',
    description: 'All-in-one book and notebook course packs for grades 1-5',
    icon_name: 'School',
    display_order: 2,
    is_active: true
  },
  {
    id: 'def-sub-middle-packs',
    parent_id: 'def-root-packs',
    name: 'Middle Grades (6 - 8)',
    slug: 'middle-packs',
    description: 'Comprehensive course packs for grades 6-8',
    icon_name: 'School',
    display_order: 3,
    is_active: true
  },

  // Subcategories under Notebooks
  {
    id: 'def-sub-narrow',
    parent_id: 'def-root-notebooks',
    name: 'Narrow Line Notebooks',
    slug: 'narrow-line-notebooks',
    description: 'Standard single-line exercise notebooks',
    icon_name: 'BookMarked',
    display_order: 1,
    is_active: true
  },
  {
    id: 'def-sub-broad',
    parent_id: 'def-root-notebooks',
    name: 'Broad Line Notebooks',
    slug: 'broad-line-notebooks',
    description: 'Double and broad-lined notebooks for early grades & Urdu',
    icon_name: 'BookMarked',
    display_order: 2,
    is_active: true
  },
  {
    id: 'def-sub-grid',
    parent_id: 'def-root-notebooks',
    name: 'Grid & Math Registers',
    slug: 'grid-registers',
    description: 'Square grid registers for calculations and math',
    icon_name: 'Calculator',
    display_order: 3,
    is_active: true
  },

  // Subcategories under Pens
  {
    id: 'def-sub-ballpoints',
    parent_id: 'def-root-pens',
    name: 'Ballpoint Pens',
    slug: 'ballpoint-pens',
    description: 'Smooth daily writing ballpoints in blue, black, red',
    icon_name: 'PenLine',
    display_order: 1,
    is_active: true
  },
  {
    id: 'def-sub-gel',
    parent_id: 'def-root-pens',
    name: 'Gel & Rollerball Pens',
    slug: 'gel-pens',
    description: 'Precision ink flow gel pens for exams and office',
    icon_name: 'PenLine',
    display_order: 2,
    is_active: true
  }
];

// In-memory cache to avoid duplicate network waterfalls
let _categoryCache = {
  data: null,
  timestamp: 0,
  includeInactive: null
};

const CACHE_TTL_MS = 60 * 1000; // 1 minute

export function invalidateCategoryCache() {
  _categoryCache = { data: null, timestamp: 0, includeInactive: null };
}

// ==============================================================================
// 2. TREE & HIERARCHY ALGORITHMS
// ==============================================================================

/**
 * Builds a hierarchical tree structure from a flat array of categories.
 * Each node will contain a `children: [...]` array, `depth`, and `path`.
 */
export function buildCategoryTree(categories = []) {
  if (!categories || categories.length === 0) return [];

  const categoryMap = new Map();
  const roots = [];

  // Clone items to avoid mutating source arrays
  categories.forEach((cat) => {
    categoryMap.set(cat.id || cat.slug, {
      ...cat,
      children: [],
      depth: 0,
      path: cat.name
    });
  });

  // Second pass: wire children to parents
  categoryMap.forEach((node) => {
    if (node.parent_id && categoryMap.has(node.parent_id)) {
      const parent = categoryMap.get(node.parent_id);
      node.depth = (parent.depth || 0) + 1;
      node.path = `${parent.path} > ${node.name}`;
      parent.children.push(node);
      // Sort children by display_order
      parent.children.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    } else {
      roots.push(node);
    }
  });

  // Sort roots by display_order
  roots.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  return roots;
}

/**
 * Flattens a category tree into a clean sequential list with depth indicators.
 * Perfect for <select> options or autocomplete components.
 */
export function flattenCategoryTree(tree = [], prefix = '— ') {
  const result = [];

  function traverse(nodes, depth = 0, parentPath = '') {
    nodes.forEach((node) => {
      const fullPath = parentPath ? `${parentPath} > ${node.name}` : node.name;
      const indent = depth > 0 ? prefix.repeat(depth) : '';
      result.push({
        ...node,
        depth,
        fullPath,
        selectLabel: `${indent}${node.name}`,
        hasChildren: node.children && node.children.length > 0
      });

      if (node.children && node.children.length > 0) {
        traverse(node.children, depth + 1, fullPath);
      }
    });
  }

  traverse(tree);
  return result;
}

/**
 * Retrieves the ancestor path array from root down to the target category.
 */
export function getCategoryHierarchy(categoryId, categories = []) {
  if (!categoryId || !categories.length) return [];
  const map = new Map(categories.map(c => [c.id || c.slug, c]));
  const hierarchy = [];
  let currentId = categoryId;
  const visited = new Set();

  while (currentId && map.has(currentId) && !visited.has(currentId)) {
    visited.add(currentId);
    const cat = map.get(currentId);
    hierarchy.unshift(cat);
    currentId = cat.parent_id;
  }

  return hierarchy;
}

/**
 * Checks whether candidateChildId is already a descendant of ancestorId.
 * Used during category creation/editing to prevent circular loops.
 */
export function isDescendantOf(candidateChildId, ancestorId, categories = []) {
  if (!candidateChildId || !ancestorId || candidateChildId === ancestorId) return true;
  const map = new Map(categories.map(c => [c.id || c.slug, c]));
  let currentId = candidateChildId;
  const visited = new Set();

  while (currentId && map.has(currentId) && !visited.has(currentId)) {
    visited.add(currentId);
    const cat = map.get(currentId);
    if (cat.parent_id === ancestorId) return true;
    currentId = cat.parent_id;
  }

  return false;
}

/**
 * Gets a category and all of its descendant category IDs and Names.
 * Crucial for storefront filtering: filtering by parent category fetches
 * all products belonging to that parent and any of its subcategories!
 */
export function getCategoryAndDescendants(categoryIdOrName, categories = []) {
  if (!categoryIdOrName || !categories.length) return { ids: [], names: [] };

  const target = categories.find(
    c => (c.id && c.id === categoryIdOrName) ||
         (c.name && c.name.toLowerCase() === categoryIdOrName.toLowerCase()) ||
         (c.slug && c.slug.toLowerCase() === categoryIdOrName.toLowerCase())
  );

  if (!target) return { ids: [categoryIdOrName], names: [categoryIdOrName] };

  const ids = [target.id].filter(Boolean);
  const names = [target.name];

  // Helper to collect all child IDs/names recursively
  function collectChildren(parentId) {
    categories
      .filter(c => c.parent_id === parentId)
      .forEach(child => {
        if (child.id) ids.push(child.id);
        names.push(child.name);
        collectChildren(child.id);
      });
  }

  if (target.id) {
    collectChildren(target.id);
  }

  return { ids, names };
}

// ==============================================================================
// 3. DATABASE CRUD OPERATIONS
// ==============================================================================

/**
 * Fetch all categories from Supabase with graceful fallback to default categories.
 */
export async function fetchCategories(includeInactive = false, forceRefresh = false) {
  const now = Date.now();
  if (
    !forceRefresh &&
    _categoryCache.data &&
    _categoryCache.includeInactive === includeInactive &&
    now - _categoryCache.timestamp < CACHE_TTL_MS
  ) {
    return _categoryCache.data;
  }

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
      console.warn('Could not fetch categories from Supabase, using defaults:', error.message);
      const fallback = includeInactive ? DEFAULT_CATEGORIES : DEFAULT_CATEGORIES.filter(c => c.is_active);
      return fallback;
    }

    if (!data || data.length === 0) {
      return includeInactive ? DEFAULT_CATEGORIES : DEFAULT_CATEGORIES.filter(c => c.is_active);
    }

    // Cache the result
    _categoryCache = {
      data,
      timestamp: now,
      includeInactive
    };

    return data;
  } catch (err) {
    console.error('Error fetching categories:', err);
    return includeInactive ? DEFAULT_CATEGORIES : DEFAULT_CATEGORIES.filter(c => c.is_active);
  }
}

/**
 * Fetches categories combined with real-time product counts.
 */
export async function fetchCategoriesWithProductCounts(includeInactive = false) {
  const categories = await fetchCategories(includeInactive);

  try {
    // Query product category distributions
    const { data: products, error } = await supabase
      .from('products')
      .select('id, category, category_id, subcategory');

    if (error || !products) {
      return categories.map(c => ({ ...c, product_count: 0 }));
    }

    // Count products per category name & category_id
    const countByName = {};
    const countById = {};

    products.forEach(p => {
      if (p.category) {
        countByName[p.category.toLowerCase()] = (countByName[p.category.toLowerCase()] || 0) + 1;
      }
      if (p.category_id) {
        countById[p.category_id] = (countById[p.category_id] || 0) + 1;
      }
      if (p.subcategory) {
        countByName[p.subcategory.toLowerCase()] = (countByName[p.subcategory.toLowerCase()] || 0) + 1;
      }
    });

    return categories.map(cat => {
      const directCount = (cat.id && countById[cat.id]) ||
                          (cat.name && countByName[cat.name.toLowerCase()]) || 0;
      return {
        ...cat,
        product_count: directCount
      };
    });
  } catch (err) {
    console.warn('Could not fetch product counts for categories:', err);
    return categories.map(c => ({ ...c, product_count: 0 }));
  }
}

/**
 * Fetches products that belong to a specific category (and optionally its subcategories).
 */
export async function fetchProductsInCategory(category, includeSubcategories = true) {
  try {
    const allCategories = await fetchCategories(true);
    const { names, ids } = getCategoryAndDescendants(category.id || category.name, allCategories);

    const matchNames = includeSubcategories ? names : [category.name];
    const matchIds = includeSubcategories ? ids : (category.id ? [category.id] : []);

    let query = supabase.from('products').select('*');

    if (matchIds.length > 0) {
      // Check both category_id or text name
      const orFilter = `category_id.in.(${matchIds.join(',')}),category.in.(${matchNames.map(n => `"${n}"`).join(',')})`;
      query = query.or(orFilter);
    } else {
      query = query.in('category', matchNames);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching products in category:', err);
    return [];
  }
}

/**
 * Create a new category in Supabase with parent_id self-relation.
 * Gracefully handles databases where the parent_id column has not yet been migrated.
 */
export async function createCategory(categoryData) {
  invalidateCategoryCache();

  const payload = {
    name: categoryData.name.trim(),
    slug: categoryData.slug?.trim() || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    description: categoryData.description || '',
    icon_name: categoryData.icon_name || 'Folder',
    display_order: Number(categoryData.display_order) || 0,
    is_active: categoryData.is_active ?? true
  };

  const hasParent = categoryData.parent_id &&
                    categoryData.parent_id !== 'null' &&
                    categoryData.parent_id !== 'undefined' &&
                    String(categoryData.parent_id).trim() !== '';

  if (hasParent) {
    payload.parent_id = categoryData.parent_id;
  }

  let { data, error } = await supabase
    .from('categories')
    .insert([payload])
    .select()
    .single();

  // If error is caused by missing parent_id column in database
  if (error && (error.code === 'PGRST204' || error.message?.includes('parent_id'))) {
    if (hasParent) {
      throw new Error(
        "Subcategories require the 'parent_id' column in Supabase. Please run the migration script in client/supabase/categories_and_items.sql"
      );
    } else {
      // Retry without parent_id column
      delete payload.parent_id;
      const retry = await supabase
        .from('categories')
        .insert([payload])
        .select()
        .single();

      if (retry.error) throw retry.error;
      return retry.data;
    }
  }

  if (error) throw error;
  return data;
}

/**
 * Update an existing category
 * Gracefully handles databases where the parent_id column has not yet been migrated.
 */
export async function updateCategory(id, updates) {
  invalidateCategoryCache();

  const payload = {
    ...updates,
    updated_at: new Date().toISOString()
  };
  delete payload.id;
  delete payload.product_count;
  delete payload.children;
  delete payload.depth;
  delete payload.path;

  const hasParent = payload.parent_id &&
                    payload.parent_id !== 'null' &&
                    payload.parent_id !== 'undefined' &&
                    String(payload.parent_id).trim() !== '';

  // Only set parent_id if a parent is selected, otherwise null
  if (hasParent) {
    payload.parent_id = updates.parent_id;
  } else {
    payload.parent_id = null;
  }

  let { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  // If error is caused by missing parent_id column in database
  if (error && (error.code === 'PGRST204' || error.message?.includes('parent_id'))) {
    if (hasParent) {
      throw new Error(
        "Subcategories require the 'parent_id' column in Supabase. Please run the migration script in client/supabase/categories_and_items.sql"
      );
    } else {
      // User selected None (Top-Level Category) - retry omitting parent_id completely
      delete payload.parent_id;
      const retry = await supabase
        .from('categories')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (retry.error) throw retry.error;
      return retry.data;
    }
  }

  if (error) throw error;
  return data;
}

/**
 * Delete a category (children will have parent_id set to null or cascade depending on FK)
 */
export async function deleteCategory(id) {
  invalidateCategoryCache();

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/**
 * Seed or re-seed the default categories into Supabase (Parents first, then Children).
 */
export async function seedDefaultCategories() {
  invalidateCategoryCache();

  // 1. Separate roots and children
  const roots = DEFAULT_CATEGORIES.filter(c => !c.parent_id).map(({ id: _id, ...rest }) => rest);
  const children = DEFAULT_CATEGORIES.filter(c => Boolean(c.parent_id));

  // 2. Upsert roots
  const { data: insertedRoots, error: rootError } = await supabase
    .from('categories')
    .upsert(roots, { onConflict: 'slug' })
    .select();

  if (rootError) throw rootError;

  // 3. Map root slugs to their new database UUIDs
  const slugToIdMap = {};
  (insertedRoots || []).forEach(r => {
    slugToIdMap[r.slug] = r.id;
  });

  // 4. Map default parent IDs to real database IDs
  const idToSlug = {
    'def-root-books': 'books',
    'def-root-packs': 'school-packs',
    'def-root-notebooks': 'notebooks',
    'def-root-pens': 'pens',
    'def-root-art': 'art-supplies'
  };

  const childrenToInsert = children.map(({ id: _id, parent_id, ...rest }) => {
    const parentSlug = idToSlug[parent_id];
    const realParentId = slugToIdMap[parentSlug] || null;
    return {
      ...rest,
      parent_id: realParentId
    };
  });

  if (childrenToInsert.length > 0) {
    const { data: insertedChildren, error: childError } = await supabase
      .from('categories')
      .upsert(childrenToInsert, { onConflict: 'slug' })
      .select();

    if (childError) {
      console.warn('Note: Children categories seeded with warnings:', childError.message);
    }
    return [...(insertedRoots || []), ...(insertedChildren || [])];
  }

  return insertedRoots;
}

/**
 * Applies a category blueprint to Supabase, creating root and subcategories.
 */
export async function applyCategoryBlueprint(blueprint) {
  invalidateCategoryCache();

  // 1. Upsert root category
  const rootPayload = {
    ...blueprint.root,
    parent_id: null
  };

  const { data: rootCat, error: rootError } = await supabase
    .from('categories')
    .upsert([rootPayload], { onConflict: 'slug' })
    .select()
    .single();

  if (rootError) throw rootError;

  // 2. Insert or upsert subcategories with parent_id = rootCat.id
  if (blueprint.subcategories && blueprint.subcategories.length > 0) {
    const subcategoryRows = blueprint.subcategories.map(sub => ({
      ...sub,
      parent_id: rootCat.id
    }));

    const { data: subCats, error: subError } = await supabase
      .from('categories')
      .upsert(subcategoryRows, { onConflict: 'slug' })
      .select();

    if (subError) throw subError;
    return { root: rootCat, subcategories: subCats };
  }

  return { root: rootCat, subcategories: [] };
}
