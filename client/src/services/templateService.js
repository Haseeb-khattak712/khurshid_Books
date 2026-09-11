/**
 * Khurshid Books: Category & Item Blueprint Templates
 * 
 * Provides domain-optimized presets for scaffolding hierarchical categories
 * and creating structured catalog items rapidly.
 */

// ==============================================================================
// 1. CATEGORY HIERARCHY BLUEPRINTS (Scaffold entire category trees)
// ==============================================================================

export const CATEGORY_TREE_BLUEPRINTS = [
  {
    id: 'bp-curriculum-books',
    name: 'Books & Syllabi Hierarchy',
    badge: 'Education Core',
    description: 'Complete book hierarchy including international and national curriculum boards plus storybooks.',
    icon_name: 'BookOpen',
    root: {
      name: 'Books & Syllabi',
      slug: 'books',
      description: 'Textbooks, coursebooks, revision guides, and literature for all school levels.',
      icon_name: 'BookOpen',
      display_order: 1
    },
    subcategories: [
      { name: 'Oxford University Press', slug: 'oxford-books', description: 'Oxford New Syllabus, countdown math, and reader series', icon_name: 'BookOpen', display_order: 1 },
      { name: 'Cambridge International', slug: 'cambridge-books', description: 'Cambridge Checkpoint, IGCSE & O-Level coursebooks', icon_name: 'BookOpen', display_order: 2 },
      { name: 'Punjab Textbook Board (PTB)', slug: 'ptb-books', description: 'Official PTB curriculum textbooks for grades 1 through 10', icon_name: 'BookOpen', display_order: 3 },
      { name: 'National Curriculum (SNC)', slug: 'snc-curriculum', description: 'Single National Curriculum standardized textbooks', icon_name: 'BookOpen', display_order: 4 },
      { name: 'Story Books & Novels', slug: 'story-books', description: 'English classics, Urdu fiction, and illustrated bedtime stories', icon_name: 'Smile', display_order: 5 }
    ]
  },
  {
    id: 'bp-school-packs',
    name: 'Grade-wise School Packs',
    badge: 'High Demand',
    description: 'Curated all-in-one student packs organized by academic grade levels.',
    icon_name: 'School',
    root: {
      name: 'School Packs',
      slug: 'school-packs',
      description: 'Curated grade-wise school course packs and bundles including syllabi, notebooks, and tools.',
      icon_name: 'School',
      display_order: 2
    },
    subcategories: [
      { name: 'Playgroup & Kindergarten', slug: 'kindergarten-packs', description: 'Early years tracing books, color activity pads & play dough', icon_name: 'School', display_order: 1 },
      { name: 'Primary Grades (1 - 5)', slug: 'primary-packs', description: 'Complete textbook, notebook, and stationery kits for grades 1-5', icon_name: 'School', display_order: 2 },
      { name: 'Middle Grades (6 - 8)', slug: 'middle-packs', description: 'Comprehensive subject sets and lab manuals for grades 6-8', icon_name: 'School', display_order: 3 },
      { name: 'Matric & O-Levels (9 - 10)', slug: 'matric-o-levels-packs', description: 'Senior secondary syllabi, past paper bundles & registers', icon_name: 'School', display_order: 4 }
    ]
  },
  {
    id: 'bp-notebooks',
    name: 'Exercise Notebooks & Registers',
    badge: 'Stationery',
    description: 'Ruling variations, spiral bindings, and academic square-grid notebooks.',
    icon_name: 'BookMarked',
    root: {
      name: 'Notebooks & Registers',
      slug: 'notebooks',
      description: 'Ruled, broad-line, four-line, and spiral exercise notebooks.',
      icon_name: 'BookMarked',
      display_order: 3
    },
    subcategories: [
      { name: 'Narrow Line (English/General)', slug: 'narrow-line-notebooks', description: 'Single lined notebooks with index and margin lines', icon_name: 'BookMarked', display_order: 1 },
      { name: 'Broad Line (Urdu & Early Grades)', slug: 'broad-line-notebooks', description: 'Wide spaced lines suitable for Urdu script and handwriting practice', icon_name: 'BookMarked', display_order: 2 },
      { name: 'Four Line (Handwriting Practice)', slug: 'four-line-notebooks', description: 'Guided 4-line notebooks for cursive and beginners', icon_name: 'BookMarked', display_order: 3 },
      { name: 'Math Square Grid Registers', slug: 'grid-registers', description: 'Small and large square grid paper for calculations and geometry', icon_name: 'Calculator', display_order: 4 },
      { name: 'Spiral Bound College Registers', slug: 'spiral-registers', description: 'Hardcover & PP cover perforated multi-subject registers', icon_name: 'BookMarked', display_order: 5 }
    ]
  },
  {
    id: 'bp-pens-writing',
    name: 'Writing Instruments',
    badge: 'Daily Essentials',
    description: 'Pen types, highlighters, correction supplies, and ink pots.',
    icon_name: 'PenLine',
    root: {
      name: 'Pens & Writing',
      slug: 'pens',
      description: 'Ballpoints, gel pens, fountain pens, pencils, and markers.',
      icon_name: 'PenLine',
      display_order: 4
    },
    subcategories: [
      { name: 'Ballpoint Pens', slug: 'ballpoint-pens', description: 'Economic oil-based ballpoint pens in standard blue, black, red, green', icon_name: 'PenLine', display_order: 1 },
      { name: 'Gel & Rollerball Pens', slug: 'gel-pens', description: 'Smooth fluid ink pens with 0.5mm and 0.7mm needle tips', icon_name: 'PenLine', display_order: 2 },
      { name: 'Fountain Pens & Ink', slug: 'fountain-pens', description: 'Iridium nib pens, ink cartridges, and bottled writing inks', icon_name: 'PenLine', display_order: 3 },
      { name: 'Pastel Highlighters & Markers', slug: 'highlighters-markers', description: 'Chisel tip fluorescent & soft pastel highlighters and board markers', icon_name: 'PenLine', display_order: 4 },
      { name: 'Pencils & Erasers', slug: 'pencils-erasers', description: 'HB graphite pencils, mechanical pencils, and dust-free erasers', icon_name: 'PenLine', display_order: 5 }
    ]
  },
  {
    id: 'bp-fine-arts',
    name: 'Fine Arts & Studio Crafts',
    badge: 'Creative',
    description: 'Pigments, canvases, sculpting tools, and drawing pads.',
    icon_name: 'Palette',
    root: {
      name: 'Fine Arts & Crafts',
      slug: 'art-supplies',
      description: 'Artist acrylics, watercolors, oil paints, sketchbooks, and craft tools.',
      icon_name: 'Palette',
      display_order: 5
    },
    subcategories: [
      { name: 'Paints & Pigments', slug: 'paints-mediums', description: 'Acrylic tubes, watercolor pans, gouache, and varnishes', icon_name: 'Palette', display_order: 1 },
      { name: 'Sketchbooks & Canvases', slug: 'sketchbooks-canvases', description: 'Acid-free cartridge paper, mixed media pads, and stretched canvas frames', icon_name: 'FileText', display_order: 2 },
      { name: 'Brushes & Painting Knives', slug: 'brushes-tools', description: 'Natural and synthetic bristle sets in fan, round, and flat shapes', icon_name: 'Scissors', display_order: 3 },
      { name: 'Modelling Clay & Craft Glues', slug: 'craft-clays-glues', description: 'Non-toxic air dry clays, hot glue guns, and PVA adhesives', icon_name: 'Sparkles', display_order: 4 }
    ]
  }
];

// ==============================================================================
// 2. ITEM CREATION BLUEPRINTS (Fast product form pre-fills)
// ==============================================================================

export const ITEM_CREATION_BLUEPRINTS = [
  {
    id: 'item-bp-textbook',
    title: 'School Coursebook / Textbook',
    category: 'Books & Syllabi',
    subcategory: 'Oxford University Press',
    icon: 'BookOpen',
    badge: 'Books',
    description: 'Pre-configures a standard school textbook with complete educational specifications.',
    preset: {
      name: 'Oxford New Countdown Book - Class 5 (3rd Edition)',
      category: 'Books & Syllabi',
      subcategory: 'Oxford University Press',
      brand: 'Oxford University Press',
      price: 680,
      stock: 45,
      isFeatured: true,
      description: `### Product Overview
Official Oxford University Press coursebook designed to build mathematical thinking and problem-solving skills for primary students.

### Specifications
- **Curriculum:** Oxford Syllabus / SNC Compatible
- **Grade / Level:** Class 5
- **Publisher:** Oxford University Press
- **Language:** English
- **Binding:** Softcover / Perfect Bound
- **Edition:** 3rd Revised Edition
- **Key Features:** Full-colour illustrations, chapter-wise review exercises, and real-world math scenarios.`
    }
  },
  {
    id: 'item-bp-coursepack',
    title: 'Curated Grade Course Pack',
    category: 'School Packs',
    subcategory: 'Primary Grades (1 - 5)',
    icon: 'School',
    badge: 'Bundles',
    description: 'Pre-configures an all-inclusive school pack containing syllabi books, notebooks, and accessories.',
    preset: {
      name: 'Class 3 Complete Academic Course Pack (Session 2026-27)',
      category: 'School Packs',
      subcategory: 'Primary Grades (1 - 5)',
      brand: 'Khurshid Book Agency',
      price: 4950,
      stock: 25,
      isFeatured: true,
      description: `### Complete Course Pack Bundle
Everything a Class 3 student needs for the full academic year, verified by teachers and packed in a protective waterproof carry case.

### Bundle Contents
- **Coursebooks (5 Books):** English Oxford Tree, New Countdown Math 3, General Science 3, Urdu PTB 3, Islamiat 3.
- **Exercise Notebooks (10 Books):** 4 Narrow line (English), 3 Broad line (Urdu), 2 Square grid (Math), 1 Drawing book.
- **Stationery Kit:** 1 Geometry box, 1 Pack HB pencils (12 pcs), 2 Non-dust erasers, 1 Plastic sharpener, 1 Pack color pencils.`
    }
  },
  {
    id: 'item-bp-notebook',
    title: 'Standard Ruled Exercise Notebook',
    category: 'Notebooks & Registers',
    subcategory: 'Narrow Line Notebooks',
    icon: 'BookMarked',
    badge: 'Stationery',
    description: 'Standard 120-page exercise notebook with bleed-proof paper specifications.',
    preset: {
      name: 'Executive Single Line Exercise Notebook - 120 Pages',
      category: 'Notebooks & Registers',
      subcategory: 'Narrow Line Notebooks',
      brand: 'Khurshid Paper Mart',
      price: 130,
      stock: 350,
      isFeatured: false,
      description: `### Notebook Specifications
High-grade exercise notebook designed for school, college, and daily note-taking with smooth fountain-pen friendly paper.

### Details
- **Page Count:** 120 Pages / 60 Leaves
- **Ruling:** Single Line (Narrow) with top date & margin lines
- **Paper Quality:** 70 GSM Premium White Bond Paper
- **Cover:** 250 GSM Gloss laminated card cover with student profile label
- **Binding:** Center stapled with durable thread stitching`
    }
  },
  {
    id: 'item-bp-pen-pack',
    title: 'Ballpoint / Gel Pen Pack',
    category: 'Pens & Writing',
    subcategory: 'Ballpoint Pens',
    icon: 'PenLine',
    badge: 'Writing',
    description: 'Multi-pack writing instruments with tip size, ink fluidity, and pack specs.',
    preset: {
      name: 'Ultra-Glide 0.8mm Ballpoint Pens (Pack of 10 - Blue Ink)',
      category: 'Pens & Writing',
      subcategory: 'Ballpoint Pens',
      brand: 'Piano',
      price: 240,
      stock: 120,
      isFeatured: false,
      description: `### Writing Instrument Features
Engineered for continuous, effortless writing during extended school periods and competitive examinations.

### Details
- **Tip Size:** 0.8mm Nickel Silver Tip with Tungsten Carbide Ball
- **Ink Type:** Low-viscosity quick-dry German ink formula (Smudge-free)
- **Ink Colour:** Royal Blue
- **Pack Quantity:** 10 Pens per box
- **Grip:** Ergonomic triangular ventilated grip for fatigue-free handwriting`
    }
  },
  {
    id: 'item-bp-geometry-box',
    title: 'Mathematical Geometry Kit',
    category: 'Geometry & Math Tools',
    subcategory: 'Geometry Instrument Boxes',
    icon: 'Calculator',
    badge: 'Tools',
    description: 'Full mathematical instruments set in a protective tin organizer case.',
    preset: {
      name: 'Deluxe Metal Geometry Box Set (9 Pieces)',
      category: 'Geometry & Math Tools',
      subcategory: 'Geometry Instrument Boxes',
      brand: 'Dux Precision',
      price: 360,
      stock: 75,
      isFeatured: false,
      description: `### Mathematical Tools Set
Sturdy, calibrated mathematical instruments ideal for high school geometry, technical drawing, and engineering sketches.

### Included Instruments
- 1 Self-centering compass with safety pencil lock
- 1 Measuring divider
- 1 Clear 15cm / 6-inch transparent ruler with dual metric/inch markings
- 2 Set squares (45° and 60°/30°)
- 1 180° Protracter
- 1 Mechanical drafting pencil with refill leads
- 1 Precision eraser & mini sharpener
- Embossed protective tin carrying case with mathematical formula chart`
    }
  },
  {
    id: 'item-bp-art-paint',
    title: 'Studio Acrylic Colour Set',
    category: 'Fine Arts & Crafts',
    subcategory: 'Paints & Mediums',
    icon: 'Palette',
    badge: 'Art Supplies',
    description: 'Artist-grade acrylic tubes with high pigment density and blending capabilities.',
    preset: {
      name: 'Artist Studio Acrylic Paint Set - 12 Vibrant Colours (12ml)',
      category: 'Fine Arts & Crafts',
      subcategory: 'Paints & Mediums',
      brand: 'Keep Smiling',
      price: 890,
      stock: 40,
      isFeatured: true,
      description: `### Creative Art Materials
Rich, lightfast acrylic colors suitable for students, hobbyists, and professional canvas painting.

### Product Features
- **Volume:** 12 Tubes x 12ml each
- **Pigment Quality:** High pigment saturation with smooth buttery consistency
- **Finishing:** Dries to a water-resistant, flexible satin finish without cracking
- **Surfaces:** Canvas boards, wood, paper, ceramic, clay, and leather
- **Included Shades:** Titanium White, Lemon Yellow, Crimson Red, Ultramarine Blue, Sap Green, Burnt Umber, Lamp Black, and more.`
    }
  }
];

// ==============================================================================
// 3. CUSTOM USER ITEM TEMPLATES (LocalStorage Persistence)
// ==============================================================================

const CUSTOM_TEMPLATES_KEY = 'khurshid_custom_product_templates_v1';

export function getCustomItemTemplates() {
  try {
    const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load custom item templates:', err);
    return [];
  }
}

export function saveCustomItemTemplate(template) {
  try {
    const existing = getCustomItemTemplates();
    const newTemplate = {
      ...template,
      id: `custom-bp-${Date.now()}`,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    const updated = [newTemplate, ...existing];
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
    return newTemplate;
  } catch (err) {
    console.error('Failed to save custom item template:', err);
    throw err;
  }
}

export function deleteCustomItemTemplate(templateId) {
  try {
    const existing = getCustomItemTemplates();
    const updated = existing.filter(t => t.id !== templateId);
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Failed to delete custom item template:', err);
    throw err;
  }
}
