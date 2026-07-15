import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined. Check your server/.env file.');
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
    process.exit(1);
  }
};

// Complete product catalog based on Alfajr-style inventory
const products = [
  // NOTEBOOKS
  {
    name: 'Premier A4 Single Line Notebook (Pack of 5)',
    slug: 'premier-a4-single-line-notebook-pack-5',
    description: 'High-quality A4 single line notebooks with 160 pages each. Smooth paper perfect for daily notes and homework. Pack of 5.',
    price: 450,
    discountPrice: 399,
    category: 'Notebooks',
    brand: 'Premier',
    stock: 200,
    images: ['/roots.png'],
    ratings: 4.7,
    numReviews: 45,
    isFeatured: true,
    tags: ['notebook', 'a4', 'single-line', 'school']
  },
  {
    name: 'Premier A4 Square Line Notebook (Pack of 5)',
    slug: 'premier-a4-square-line-notebook-pack-5',
    description: 'A4 square line notebooks ideal for math and science subjects. 160 pages, pack of 5.',
    price: 450,
    category: 'Notebooks',
    brand: 'Premier',
    stock: 180,
    images: ['/roots.png'],
    ratings: 4.6,
    numReviews: 38,
    isFeatured: false,
    tags: ['notebook', 'a4', 'square-line', 'math']
  },
  {
    name: 'Premier A4 Broad Line Notebook (Pack of 5)',
    slug: 'premier-a4-broad-line-notebook-pack-5',
    description: 'Broad line notebooks perfect for junior classes. Easy-to-write bold lines, 160 pages, pack of 5.',
    price: 450,
    category: 'Notebooks',
    brand: 'Premier',
    stock: 150,
    images: ['/roots.png'],
    ratings: 4.5,
    numReviews: 28,
    isFeatured: false,
    tags: ['notebook', 'a4', 'broad-line', 'junior']
  },
  {
    name: 'Rosette Hardcover Journal',
    slug: 'rosette-hardcover-journal',
    description: 'Premium hardcover journal with 200 lined pages, ribbon bookmark, and elastic closure. Perfect for professionals and students.',
    price: 650,
    discountPrice: 580,
    category: 'Notebooks',
    brand: 'Rosette',
    stock: 80,
    images: ['/roots.png'],
    ratings: 4.8,
    numReviews: 52,
    isFeatured: true,
    tags: ['journal', 'hardcover', 'premium']
  },
  {
    name: 'Dollar A5 Pocket Notebook (Pack of 3)',
    slug: 'dollar-a5-pocket-notebook-pack-3',
    description: 'Compact A5 pocket notebooks for quick notes. 80 pages each, pack of 3.',
    price: 180,
    category: 'Notebooks',
    brand: 'Dollar',
    stock: 250,
    images: ['/roots.png'],
    ratings: 4.2,
    numReviews: 15,
    isFeatured: false,
    tags: ['notebook', 'a5', 'pocket']
  },

  // PENS & WRITING
  {
    name: 'Dollar Classic Ballpoint Pen Blue (Pack of 12)',
    slug: 'dollar-classic-ballpoint-pen-blue-pack-12',
    description: 'Smooth-writing ballpoint pens with 0.7mm tip. Long-lasting blue ink, pack of 12.',
    price: 220,
    category: 'Pens',
    brand: 'Dollar',
    stock: 500,
    images: ['/roots.png'],
    ratings: 4.4,
    numReviews: 120,
    isFeatured: true,
    tags: ['pen', 'ballpoint', 'blue', 'school']
  },
  {
    name: 'Dollar Classic Ballpoint Pen Black (Pack of 12)',
    slug: 'dollar-classic-ballpoint-pen-black-pack-12',
    description: 'Smooth-writing ballpoint pens with 0.7mm tip. Long-lasting black ink, pack of 12.',
    price: 220,
    category: 'Pens',
    brand: 'Dollar',
    stock: 450,
    images: ['/roots.png'],
    ratings: 4.4,
    numReviews: 110,
    isFeatured: false,
    tags: ['pen', 'ballpoint', 'black', 'school']
  },
  {
    name: 'Dollar Gel Pen Set (Pack of 10)',
    slug: 'dollar-gel-pen-set-pack-10',
    description: 'Vibrant gel pens in assorted colors. Smooth flow, quick-dry ink. Pack of 10.',
    price: 350,
    category: 'Pens',
    brand: 'Dollar',
    stock: 200,
    images: ['/roots.png'],
    ratings: 4.6,
    numReviews: 75,
    isFeatured: true,
    tags: ['pen', 'gel', 'colors']
  },
  {
    name: 'Faber-Castell Ink Pen Set',
    slug: 'faber-castell-ink-pen-set',
    description: 'Elegant fountain pens with smooth nibs. Perfect for calligraphy and fine writing.',
    price: 850,
    discountPrice: 750,
    category: 'Pens',
    brand: 'Faber-Castell',
    stock: 60,
    images: ['/roots.png'],
    ratings: 4.9,
    numReviews: 42,
    isFeatured: true,
    tags: ['pen', 'ink', 'premium', 'calligraphy']
  },
  {
    name: 'Camlin Highlighter Set (Pack of 6)',
    slug: 'camlin-highlighter-set-pack-6',
    description: 'Bright neon highlighters in yellow, pink, green, orange, blue, purple. Chisel tip for broad and fine lines.',
    price: 280,
    category: 'Pens',
    brand: 'Camlin',
    stock: 180,
    images: ['/roots.png'],
    ratings: 4.3,
    numReviews: 65,
    isFeatured: false,
    tags: ['highlighter', 'marker', 'study']
  },
  {
    name: 'Camlin Graphite Pencil Pack (Pack of 12)',
    slug: 'camlin-graphite-pencil-pack-12',
    description: 'HB graphite pencils with strong lead. Ideal for writing and sketching. Pack of 12 with eraser tips.',
    price: 180,
    category: 'Pens',
    brand: 'Camlin',
    stock: 300,
    images: ['/roots.png'],
    ratings: 4.2,
    numReviews: 55,
    isFeatured: false,
    tags: ['pencil', 'graphite', 'hb', 'school']
  },
  {
    name: 'Rosette Premium Mechanical Pencil (0.5mm)',
    slug: 'rosette-premium-mechanical-pencil-05mm',
    description: 'Smooth mechanical pencil with refillable 0.5mm lead. Rubber grip for comfort.',
    price: 150,
    category: 'Pens',
    brand: 'Rosette',
    stock: 150,
    images: ['/roots.png'],
    ratings: 4.5,
    numReviews: 35,
    isFeatured: false,
    tags: ['pencil', 'mechanical', '0.5mm']
  },

  // ART SUPPLIES
  {
    name: 'Camlin Watercolour Set (12 Shades)',
    slug: 'camlin-watercolour-set-12-shades',
    description: 'Rich watercolour palette with 12 blendable shades. Includes brush. Perfect for school art projects.',
    price: 480,
    category: 'Art Supplies',
    brand: 'Camlin',
    stock: 100,
    images: ['/roots.png'],
    ratings: 4.7,
    numReviews: 88,
    isFeatured: true,
    tags: ['watercolour', 'paint', 'art', 'school']
  },
  {
    name: 'Camlin Acrylic Colour Tubes (Set of 10)',
    slug: 'camlin-acrylic-colour-tubes-set-10',
    description: 'Vibrant acrylic colours in 10ml tubes. Rich pigmentation, suitable for canvas and paper.',
    price: 650,
    category: 'Art Supplies',
    brand: 'Camlin',
    stock: 80,
    images: ['/roots.png'],
    ratings: 4.5,
    numReviews: 45,
    isFeatured: true,
    tags: ['acrylic', 'paint', 'art']
  },
  {
    name: 'Faber-Castell Sketch Set',
    slug: 'faber-castell-sketch-set',
    description: 'Complete sketch set with charcoal pencils, graphite sticks, eraser, and sharpener.',
    price: 550,
    category: 'Art Supplies',
    brand: 'Faber-Castell',
    stock: 70,
    images: ['/roots.png'],
    ratings: 4.8,
    numReviews: 38,
    isFeatured: false,
    tags: ['sketch', 'charcoal', 'artist']
  },
  {
    name: 'Rosette Sketchbook Large (A4)',
    slug: 'rosette-sketchbook-large-a4',
    description: 'Thick 180gsm paper sketchbook for pencils and light watercolour. 50 sheets, spiral bound.',
    price: 450,
    category: 'Art Supplies',
    brand: 'Rosette',
    stock: 90,
    images: ['/roots.png'],
    ratings: 4.6,
    numReviews: 32,
    isFeatured: false,
    tags: ['sketchbook', 'a4', 'art-paper']
  },
  {
    name: 'Camlin Oil Pastels (Set of 25)',
    slug: 'camlin-oil-pastels-set-25',
    description: 'Vibrant oil pastels in 25 colors. Smooth blending, ideal for school art classes.',
    price: 320,
    category: 'Art Supplies',
    brand: 'Camlin',
    stock: 120,
    images: ['/roots.png'],
    ratings: 4.4,
    numReviews: 28,
    isFeatured: false,
    tags: ['pastels', 'oil', 'colors']
  },

  // GEOMETRY
  {
    name: 'Faber-Castell Geometry Box',
    slug: 'faber-castell-geometry-box',
    description: 'Complete geometry set with compass, divider, protractor, set squares, ruler, and pencil.',
    price: 380,
    category: 'Geometry',
    brand: 'Faber-Castell',
    stock: 200,
    images: ['/roots.png'],
    ratings: 4.7,
    numReviews: 95,
    isFeatured: true,
    tags: ['geometry', 'box', 'compass', 'school']
  },
  {
    name: 'Dollar Geometry Protractor (Pack of 2)',
    slug: 'dollar-geometry-protractor-pack-2',
    description: 'Clear plastic protractors with accurate degree markings. Pack of 2.',
    price: 80,
    category: 'Geometry',
    brand: 'Dollar',
    stock: 250,
    images: ['/roots.png'],
    ratings: 4.1,
    numReviews: 22,
    isFeatured: false,
    tags: ['geometry', 'protractor']
  },

  // CALCULATORS
  {
    name: 'Camlin Scientific Calculator',
    slug: 'camlin-scientific-calculator',
    description: 'Advanced scientific calculator with 240 functions. 2-line display, perfect for O/A Level students.',
    price: 950,
    discountPrice: 850,
    category: 'Calculators',
    brand: 'Camlin',
    stock: 100,
    images: ['/roots.png'],
    ratings: 4.6,
    numReviews: 70,
    isFeatured: true,
    tags: ['calculator', 'scientific', 'o-level']
  },
  {
    name: 'Premier Basic Calculator',
    slug: 'premier-basic-calculator',
    description: 'Standard 8-digit calculator with large display. Solar and battery powered.',
    price: 350,
    category: 'Calculators',
    brand: 'Premier',
    stock: 150,
    images: ['/roots.png'],
    ratings: 4.2,
    numReviews: 40,
    isFeatured: false,
    tags: ['calculator', 'basic']
  },

  // BAGS
  {
    name: 'Deli School Backpack (Navy Blue)',
    slug: 'deli-school-backpack-navy-blue',
    description: 'Durable school backpack with padded laptop compartment, water bottle pockets, and ergonomic straps.',
    price: 1800,
    discountPrice: 1650,
    category: 'Bags',
    brand: 'Deli',
    stock: 80,
    images: ['/roots.png'],
    ratings: 4.5,
    numReviews: 55,
    isFeatured: true,
    tags: ['backpack', 'school', 'navy']
  },
  {
    name: 'Premier Messenger Bag (Black)',
    slug: 'premier-messenger-bag-black',
    description: 'Stylish messenger bag with multiple compartments. Perfect for college students and professionals.',
    price: 1200,
    category: 'Bags',
    brand: 'Premier',
    stock: 60,
    images: ['/roots.png'],
    ratings: 4.3,
    numReviews: 30,
    isFeatured: false,
    tags: ['messenger', 'bag', 'college']
  },

  // OFFICE SUPPLIES
  {
    name: 'Dollar Office Stapler',
    slug: 'dollar-office-stapler',
    description: 'Heavy-duty stapler with ergonomic grip. Includes 1000 staples.',
    price: 280,
    category: 'Office Supplies',
    brand: 'Dollar',
    stock: 100,
    images: ['/roots.png'],
    ratings: 4.2,
    numReviews: 25,
    isFeatured: false,
    tags: ['stapler', 'office']
  },
  {
    name: 'Dollar Document Folder (Pack of 5)',
    slug: 'dollar-document-folder-pack-5',
    description: 'Durable plastic document folders in assorted colors. A4 size, pack of 5.',
    price: 220,
    category: 'Office Supplies',
    brand: 'Dollar',
    stock: 150,
    images: ['/roots.png'],
    ratings: 4.0,
    numReviews: 18,
    isFeatured: false,
    tags: ['folder', 'office', 'documents']
  },
  {
    name: 'Rosette Fancy Pen Holder',
    slug: 'rosette-fancy-pen-holder',
    description: 'Vintage-style brass pen holder for desk organization.',
    price: 420,
    category: 'Office Supplies',
    brand: 'Rosette',
    stock: 50,
    images: ['/roots.png'],
    ratings: 4.4,
    numReviews: 20,
    isFeatured: false,
    tags: ['pen-holder', 'desk', 'decor']
  },

  // PAPER PRODUCTS
  {
    name: 'Paper Products A4 Copy Paper (Ream of 500)',
    slug: 'paper-products-a4-copy-paper-ream-500',
    description: 'Premium A4 photocopy paper. 75gsm, bright white, jam-free. 500 sheets.',
    price: 550,
    category: 'Paper Products',
    brand: 'Paper Products',
    stock: 200,
    images: ['/roots.png'],
    ratings: 4.5,
    numReviews: 60,
    isFeatured: false,
    tags: ['paper', 'a4', 'copy', 'ream']
  },
  {
    name: 'Rosette Binding Tape Roll',
    slug: 'rosette-binding-tape-roll',
    description: 'Strong adhesive cloth tape for book binding and repairs. 2-inch wide, 10 meters.',
    price: 150,
    category: 'Paper Products',
    brand: 'Rosette',
    stock: 100,
    images: ['/roots.png'],
    ratings: 4.0,
    numReviews: 15,
    isFeatured: false,
    tags: ['tape', 'binding', 'repair']
  },
  {
    name: 'Dollar Chart Paper (Pack of 20)',
    slug: 'dollar-chart-paper-pack-20',
    description: 'Colorful chart paper in assorted colors. Ideal for projects and presentations. Pack of 20 sheets.',
    price: 280,
    category: 'Paper Products',
    brand: 'Dollar',
    stock: 120,
    images: ['/roots.png'],
    ratings: 4.3,
    numReviews: 35,
    isFeatured: false,
    tags: ['chart-paper', 'project', 'colors']
  },

  // BOOKS
  {
    name: 'Premier Study Planner 2025',
    slug: 'premier-study-planner-2025',
    description: 'Daily planner with time blocks, task trackers, and exam countdown. Dated Jan-Dec 2025.',
    price: 450,
    category: 'Books',
    brand: 'Premier',
    stock: 100,
    images: ['/roots.png'],
    ratings: 4.6,
    numReviews: 42,
    isFeatured: true,
    tags: ['planner', '2025', 'study']
  },
  {
    name: 'Premier Hardcover Diary',
    slug: 'premier-hardcover-diary',
    description: 'Classic hardcover diary with ribbon marker and lock. 300 pages.',
    price: 550,
    category: 'Books',
    brand: 'Premier',
    stock: 70,
    images: ['/roots.png'],
    ratings: 4.7,
    numReviews: 38,
    isFeatured: false,
    tags: ['diary', 'hardcover', 'journal']
  },

  // GIFT ITEMS
  {
    name: 'Premier Gift Wrap Set',
    slug: 'premier-gift-wrap-set',
    description: 'Gift wrap bundle with 5 patterned papers, ribbons, and gift tags.',
    price: 350,
    category: 'Gift Items',
    brand: 'Premier',
    stock: 80,
    images: ['/roots.png'],
    ratings: 4.4,
    numReviews: 22,
    isFeatured: false,
    tags: ['gift', 'wrap', 'celebration']
  },
  {
    name: 'Dollar Notecard Set (Pack of 20)',
    slug: 'dollar-notecard-set-pack-20',
    description: 'Elegant blank notecards with envelopes. Perfect for invitations and messages.',
    price: 250,
    category: 'Gift Items',
    brand: 'Dollar',
    stock: 90,
    images: ['/roots.png'],
    ratings: 4.1,
    numReviews: 18,
    isFeatured: false,
    tags: ['notecard', 'invitation']
  }
];

// School pack definitions - what each pack contains
const schoolPacks = [
  {
    name: 'Beaconhouse School Pack (Grade 1-5)',
    slug: 'beaconhouse-school-pack-grade-1-5',
    description: 'Complete stationery pack approved for Beaconhouse School System. Includes all required notebooks, pens, pencils, and art supplies for primary grades.',
    price: 2850,
    discountPrice: 2499,
    category: 'School Packs',
    brand: 'Khursheed',
    stock: 50,
    images: ['/roots.png'],
    ratings: 4.8,
    numReviews: 35,
    isFeatured: true,
    tags: ['beaconhouse', 'school-pack', 'primary', 'bss'],
    packItems: [
      'Premier A4 Single Line Notebook (Pack of 5)',
      'Premier A4 Square Line Notebook (Pack of 5)',
      'Dollar Classic Ballpoint Pen Blue (Pack of 12)',
      'Camlin Graphite Pencil Pack (Pack of 12)',
      'Camlin Watercolour Set (12 Shades)',
      'Faber-Castell Geometry Box',
      'Dollar Chart Paper (Pack of 20)',
      'Paper Products A4 Copy Paper (Ream of 500)'
    ]
  },
  {
    name: 'Beaconhouse School Pack (Grade 6-8)',
    slug: 'beaconhouse-school-pack-grade-6-8',
    description: 'Complete stationery pack for Beaconhouse middle school. Includes advanced geometry, scientific calculator, and subject-specific notebooks.',
    price: 3200,
    discountPrice: 2899,
    category: 'School Packs',
    brand: 'Khursheed',
    stock: 40,
    images: ['/roots.png'],
    ratings: 4.7,
    numReviews: 28,
    isFeatured: true,
    tags: ['beaconhouse', 'school-pack', 'middle', 'bss'],
    packItems: [
      'Premier A4 Single Line Notebook (Pack of 5)',
      'Premier A4 Square Line Notebook (Pack of 3)',
      'Premier A4 Broad Line Notebook (Pack of 2)',
      'Dollar Classic Ballpoint Pen Blue (Pack of 12)',
      'Dollar Classic Ballpoint Pen Black (Pack of 6)',
      'Camlin Scientific Calculator',
      'Faber-Castell Geometry Box',
      'Camlin Watercolour Set (12 Shades)',
      'Rosette Sketchbook Large (A4)'
    ]
  },
  {
    name: 'LGS School Pack (Grade 1-5)',
    slug: 'lgs-school-pack-grade-1-5',
    description: 'Lahore Grammar School approved stationery pack. Premium quality notebooks and supplies for primary students.',
    price: 2950,
    discountPrice: 2599,
    category: 'School Packs',
    brand: 'Khursheed',
    stock: 45,
    images: ['/roots.png'],
    ratings: 4.8,
    numReviews: 42,
    isFeatured: true,
    tags: ['lgs', 'school-pack', 'primary', 'lahore-grammar'],
    packItems: [
      'Premier A4 Single Line Notebook (Pack of 5)',
      'Premier A4 Square Line Notebook (Pack of 5)',
      'Dollar Classic Ballpoint Pen Blue (Pack of 12)',
      'Camlin Graphite Pencil Pack (Pack of 12)',
      'Camlin Oil Pastels (Set of 25)',
      'Faber-Castell Geometry Box',
      'Dollar Chart Paper (Pack of 20)',
      'Deli School Backpack (Navy Blue)'
    ]
  },
  {
    name: 'LGS School Pack (Grade 6-8)',
    slug: 'lgs-school-pack-grade-6-8',
    description: 'Complete LGS middle school pack with scientific calculator, advanced geometry, and premium notebooks.',
    price: 3400,
    discountPrice: 3099,
    category: 'School Packs',
    brand: 'Khursheed',
    stock: 35,
    images: ['/roots.png'],
    ratings: 4.7,
    numReviews: 30,
    isFeatured: true,
    tags: ['lgs', 'school-pack', 'middle', 'lahore-grammar'],
    packItems: [
      'Premier A4 Single Line Notebook (Pack of 5)',
      'Premier A4 Square Line Notebook (Pack of 3)',
      'Dollar Classic Ballpoint Pen Blue (Pack of 12)',
      'Dollar Gel Pen Set (Pack of 10)',
      'Camlin Scientific Calculator',
      'Faber-Castell Geometry Box',
      'Camlin Acrylic Colour Tubes (Set of 10)',
      'Rosette Sketchbook Large (A4)'
    ]
  },
  {
    name: 'Roots School Pack (Grade 1-5)',
    slug: 'roots-school-pack-grade-1-5',
    description: 'Roots Millennium School approved pack. Includes all essential stationery for primary students.',
    price: 2750,
    discountPrice: 2399,
    category: 'School Packs',
    brand: 'Khursheed',
    stock: 40,
    images: ['/roots.png'],
    ratings: 4.6,
    numReviews: 25,
    isFeatured: true,
    tags: ['roots', 'school-pack', 'primary'],
    packItems: [
      'Premier A4 Single Line Notebook (Pack of 5)',
      'Premier A4 Broad Line Notebook (Pack of 3)',
      'Dollar Classic Ballpoint Pen Blue (Pack of 12)',
      'Camlin Graphite Pencil Pack (Pack of 12)',
      'Camlin Watercolour Set (12 Shades)',
      'Faber-Castell Geometry Box',
      'Paper Products A4 Copy Paper (Ream of 500)'
    ]
  },
  {
    name: 'The City School (TCS) Pack (Grade 1-5)',
    slug: 'tcs-school-pack-grade-1-5',
    description: 'The City School approved stationery pack. Complete set for primary grades with premium quality items.',
    price: 2900,
    discountPrice: 2599,
    category: 'School Packs',
    brand: 'Khursheed',
    stock: 45,
    images: ['/roots.png'],
    ratings: 4.7,
    numReviews: 32,
    isFeatured: true,
    tags: ['tcs', 'school-pack', 'primary', 'city-school'],
    packItems: [
      'Premier A4 Single Line Notebook (Pack of 5)',
      'Premier A4 Square Line Notebook (Pack of 5)',
      'Dollar Classic Ballpoint Pen Blue (Pack of 12)',
      'Dollar Classic Ballpoint Pen Black (Pack of 6)',
      'Camlin Graphite Pencil Pack (Pack of 12)',
      'Camlin Watercolour Set (12 Shades)',
      'Faber-Castell Geometry Box',
      'Dollar Chart Paper (Pack of 20)'
    ]
  },
  {
    name: 'Silver Oaks School Pack (Grade 1-5)',
    slug: 'silver-oaks-school-pack-grade-1-5',
    description: 'Silver Oaks School premium pack. High-quality stationery set designed for young learners.',
    price: 3100,
    discountPrice: 2799,
    category: 'School Packs',
    brand: 'Khursheed',
    stock: 30,
    images: ['/roots.png'],
    ratings: 4.8,
    numReviews: 20,
    isFeatured: true,
    tags: ['silver-oaks', 'school-pack', 'primary'],
    packItems: [
      'Premier A4 Single Line Notebook (Pack of 5)',
      'Premier A4 Square Line Notebook (Pack of 5)',
      'Premier A4 Broad Line Notebook (Pack of 2)',
      'Dollar Classic Ballpoint Pen Blue (Pack of 12)',
      'Camlin Graphite Pencil Pack (Pack of 12)',
      'Camlin Oil Pastels (Set of 25)',
      'Faber-Castell Geometry Box',
      'Rosette Sketchbook Large (A4)',
      'Deli School Backpack (Navy Blue)'
    ]
  }
];

const importData = async () => {
  try {
    await connectDB();

    await Order.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();

    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@khursheed.com',
      password: adminPassword,
      role: 'admin'
    });

    const userPassword = await bcrypt.hash('user123', 10);
    const user = await User.create({
      name: 'Test User',
      email: 'user@example.com',
      password: userPassword,
      role: 'user'
    });

    // Insert all individual products
    const createdProducts = await Product.insertMany(products);
    
    // Insert school packs
    const createdPacks = await Product.insertMany(schoolPacks);

    // Create a sample order with mix of products and a school pack
    const subtotal = createdProducts[0].price * 2 + createdPacks[0].price;
    const taxPrice = Math.round(subtotal * 0.05);
    const shippingPrice = 100;
    const totalPrice = subtotal + taxPrice + shippingPrice;

    await Order.create({
      user: user._id,
      orderItems: [
        {
          name: createdProducts[0].name,
          quantity: 2,
          image: '/roots.png',
          price: createdProducts[0].price,
          product: createdProducts[0]._id
        },
        {
          name: createdPacks[0].name,
          quantity: 1,
          image: '/roots.png',
          price: createdPacks[0].price,
          product: createdPacks[0]._id
        }
      ],
      shippingAddress: {
        street: '123 Main Street',
        city: 'Lahore',
        province: 'Punjab',
        postalCode: '54000',
        country: 'Pakistan'
      },
      paymentMethod: 'Cash on Delivery',
      subtotal,
      taxPrice,
      shippingPrice,
      totalPrice,
      status: 'pending',
      isPaid: false,
      isDelivered: false
    });

    console.log('✅ Data seeded successfully!');
    console.log('');
    console.log(`📦 ${createdProducts.length} individual products created`);
    console.log(`🎒 ${createdPacks.length} school packs created`);
    console.log('');
    console.log('🔑 Admin login: admin@khursheed.com / admin123');
    console.log('👤 User login:  user@example.com / user123');
    process.exit();
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

importData();