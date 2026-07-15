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

const products = [
  {
    name: 'Premier Executive Journal',
    slug: 'premier-executive-journal',
    description: 'Luxury lined journal with premium paper for notes, plans, and ideas.',
    price: 450,
    discountPrice: 399,
    category: 'Notebooks',
    brand: 'Premier',
    stock: 42,
    images: ['https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.7,
    numReviews: 12,
    isFeatured: true,
    tags: ['journal', 'executive', 'lined']
  },
  {
    name: 'Dollar Classic Ballpoint Pen Set',
    slug: 'dollar-classic-ballpoint-pen-set',
    description: 'Smooth-writing ballpoint pens in a premium 12-pack set.',
    price: 220,
    category: 'Pens',
    brand: 'Dollar',
    stock: 120,
    images: ['https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.3,
    numReviews: 48,
    isFeatured: true,
    tags: ['pen', 'ballpoint', 'stationery']
  },
  {
    name: 'Camlin Watercolour Set',
    slug: 'camlin-watercolour-set',
    description: 'Rich watercolour palette with 12 blendable shades for artists.',
    price: 560,
    category: 'Art Supplies',
    brand: 'Camlin',
    stock: 25,
    images: ['https://images.unsplash.com/photo-1513267048331-6f2e412c371f?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.8,
    numReviews: 32,
    isFeatured: true,
    tags: ['watercolour', 'paint', 'art']
  },
  {
    name: 'Faber-Castell Drafting Set',
    slug: 'faber-castell-drafting-set',
    description: 'Complete geometry kit with compass, protractor, scale, and pencils.',
    price: 480,
    category: 'Geometry',
    brand: 'Faber-Castell',
    stock: 18,
    images: ['https://images.unsplash.com/photo-1495121605193-b116b5b9c5d5?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.4,
    numReviews: 21,
    isFeatured: true,
    tags: ['geometry', 'kit', 'drafting']
  },
  {
    name: 'Rosette Premium Mechanical Pencil',
    slug: 'rosette-premium-mechanical-pencil',
    description: 'Smooth mechanical pencil with refillable 0.5mm lead.',
    price: 180,
    category: 'Pens',
    brand: 'Rosette',
    stock: 78,
    images: ['https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.5,
    numReviews: 15,
    isFeatured: false,
    tags: ['mechanical', 'pencil', 'writing']
  },
  {
    name: 'Deli Leather Laptop Bag',
    slug: 'deli-leather-laptop-bag',
    description: 'Stylish laptop bag with padded compartment and front organizer.',
    price: 2400,
    category: 'Bags',
    brand: 'Deli',
    stock: 14,
    images: ['https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.6,
    numReviews: 19,
    isFeatured: false,
    tags: ['bag', 'laptop', 'office']
  },
  {
    name: 'Paper Products A4 Notebook Pack',
    slug: 'paper-products-a4-notebook-pack',
    description: 'Bundle of A4 notebooks for school and office use.',
    price: 320,
    category: 'Paper Products',
    brand: 'Paper Products',
    stock: 60,
    images: ['https://images.unsplash.com/photo-1496104679561-38a97a17e78d?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.2,
    numReviews: 27,
    isFeatured: false,
    tags: ['notebook', 'paper', 'pack']
  },
  {
    name: 'Faber-Castell Ink Pen Set',
    slug: 'faber-castell-ink-pen-set',
    description: 'Elegant ink pens with smooth nibs for everyday writing.',
    price: 550,
    category: 'Pens',
    brand: 'Faber-Castell',
    stock: 33,
    images: ['https://images.unsplash.com/photo-1520975918144-5d02cdadcc53?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.9,
    numReviews: 28,
    isFeatured: true,
    tags: ['ink', 'pen', 'premium']
  },
  {
    name: 'Rosette Sketchbook Large',
    slug: 'rosette-sketchbook-large',
    description: 'Thick paper sketchbook designed for pencils and light watercolour.',
    price: 620,
    category: 'Art Supplies',
    brand: 'Rosette',
    stock: 26,
    images: ['https://images.unsplash.com/photo-1496765987097-9b6e3c09953c?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.6,
    numReviews: 12,
    isFeatured: false,
    tags: ['sketchbook', 'art', 'paper']
  },
  {
    name: 'Dollar Office Stapler',
    slug: 'dollar-office-stapler',
    description: 'Heavy-duty stapler with ergonomic grip for office use.',
    price: 280,
    category: 'Office Supplies',
    brand: 'Dollar',
    stock: 47,
    images: ['https://images.unsplash.com/photo-1519861532820-7b2ab316e2ab?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.3,
    numReviews: 9,
    isFeatured: false,
    tags: ['stapler', 'office', 'tool']
  },
  {
    name: 'Camlin Acrylic Colour Tubes',
    slug: 'camlin-acrylic-colour-tubes',
    description: 'Set of 10 vibrant acrylic colours for hobby and school art.',
    price: 760,
    category: 'Art Supplies',
    brand: 'Camlin',
    stock: 35,
    images: ['https://images.unsplash.com/photo-1519197924295-6e3783c9f863?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.5,
    numReviews: 12,
    isFeatured: true,
    tags: ['acrylic', 'paint', 'art']
  },
  {
    name: 'Premier Study Planner',
    slug: 'premier-study-planner',
    description: 'Daily planner with time blocks and task trackers for students.',
    price: 310,
    category: 'Books',
    brand: 'Premier',
    stock: 75,
    images: ['https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.4,
    numReviews: 20,
    isFeatured: false,
    tags: ['planner', 'study', 'organizer']
  },
  {
    name: 'Dollar Highlighter Set',
    slug: 'dollar-highlighter-set',
    description: 'Bright neon highlighters with long-lasting ink.',
    price: 210,
    category: 'Office Supplies',
    brand: 'Dollar',
    stock: 89,
    images: ['https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.1,
    numReviews: 16,
    isFeatured: false,
    tags: ['highlighter', 'marker', 'office']
  },
  {
    name: 'Camlin Graphite Pencil Pack',
    slug: 'camlin-graphite-pencil-pack',
    description: 'Pack of 10 HB pencils with good lead quality for writing and sketching.',
    price: 95,
    category: 'Pens',
    brand: 'Camlin',
    stock: 110,
    images: ['https://images.unsplash.com/photo-1508458392017-eca42f75b0af?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.2,
    numReviews: 24,
    isFeatured: false,
    tags: ['pencil', 'graphite', 'pack']
  },
  {
    name: 'Rosette Binding Tape Roll',
    slug: 'rosette-binding-tape-roll',
    description: 'Strong adhesive tape for binding and stationery repairs.',
    price: 150,
    category: 'Paper Products',
    brand: 'Rosette',
    stock: 52,
    images: ['https://images.unsplash.com/photo-1502767089025-6572583495b9?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.0,
    numReviews: 18,
    isFeatured: false,
    tags: ['tape', 'binding', 'office']
  },
  {
    name: 'Faber-Castell Geometry Pro Set',
    slug: 'faber-castell-geometry-pro-set',
    description: 'Precision set including compass, divider, protractor and set squares.',
    price: 580,
    category: 'Geometry',
    brand: 'Faber-Castell',
    stock: 22,
    images: ['https://images.unsplash.com/photo-1512009324739-4b986b71934f?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.6,
    numReviews: 14,
    isFeatured: true,
    tags: ['geometry', 'precision', 'study']
  },
  {
    name: 'Dollar Craft Scissors',
    slug: 'dollar-craft-scissors',
    description: 'Comfort-handled scissors perfect for school crafts and projects.',
    price: 130,
    category: 'Office Supplies',
    brand: 'Dollar',
    stock: 65,
    images: ['https://images.unsplash.com/photo-1520636806220-5438f8450657?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.2,
    numReviews: 11,
    isFeatured: false,
    tags: ['scissors', 'craft', 'office']
  },
  {
    name: 'Premier Hardcover Diary',
    slug: 'premier-hardcover-diary',
    description: 'Classic hardcover diary with ribbon marker and lockable cover.',
    price: 360,
    category: 'Books',
    brand: 'Premier',
    stock: 34,
    images: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.7,
    numReviews: 22,
    isFeatured: false,
    tags: ['diary', 'hardcover', 'journal']
  },
  {
    name: 'Camlin Marker Pen Set',
    slug: 'camlin-marker-pen-set',
    description: '12-piece marker set ideal for art, design and school projects.',
    price: 450,
    category: 'Pens',
    brand: 'Camlin',
    stock: 55,
    images: ['https://images.unsplash.com/photo-1488180354355-8e76e4e0f4bf?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.4,
    numReviews: 20,
    isFeatured: false,
    tags: ['marker', 'art', 'school']
  },
  {
    name: 'Dollar Plain Notebook',
    slug: 'dollar-plain-notebook',
    description: 'Affordable plain notebook with soft cover for everyday notes.',
    price: 85,
    category: 'Notebooks',
    brand: 'Dollar',
    stock: 175,
    images: ['https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.0,
    numReviews: 32,
    isFeatured: false,
    tags: ['notebook', 'plain', 'school']
  },
  {
    name: 'Rosette Soft Cover Planner',
    slug: 'rosette-soft-cover-planner',
    description: 'Soft cover weekly planner with motivational layout for students.',
    price: 280,
    category: 'Books',
    brand: 'Rosette',
    stock: 38,
    images: ['https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.5,
    numReviews: 16,
    isFeatured: false,
    tags: ['planner', 'weekly', 'organizer']
  },
  {
    name: 'Camlin Calculator Pro',
    slug: 'camlin-calculator-pro',
    description: 'Scientific calculator with multi-line display and memory functions.',
    price: 950,
    category: 'Calculators',
    brand: 'Camlin',
    stock: 20,
    images: ['https://images.unsplash.com/photo-1515871204537-028b7d37814a?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.8,
    numReviews: 13,
    isFeatured: false,
    tags: ['calculator', 'scientific', 'study']
  },
  {
    name: 'Dollar Document Folder',
    slug: 'dollar-document-folder',
    description: 'Durable document folder for organizing notes and papers.',
    price: 170,
    category: 'Office Supplies',
    brand: 'Dollar',
    stock: 70,
    images: ['https://images.unsplash.com/photo-1515169067867-25b110f2ba6d?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.1,
    numReviews: 10,
    isFeatured: false,
    tags: ['folder', 'office', 'organization']
  },
  {
    name: 'Premier Gift Wrap Set',
    slug: 'premier-gift-wrap-set',
    description: 'Gift wrap bundle with ribbons, tags, and patterned paper.',
    price: 340,
    category: 'Gift Items',
    brand: 'Premier',
    stock: 40,
    images: ['https://images.unsplash.com/photo-1473186505569-9c61870c11f9?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.6,
    numReviews: 14,
    isFeatured: false,
    tags: ['gift', 'wrap', 'celebration']
  },
  {
    name: 'Rosette Fancy Pen Holder',
    slug: 'rosette-fancy-pen-holder',
    description: 'Vintage-style pen holder with brass accents for desktop decor.',
    price: 420,
    category: 'Office Supplies',
    brand: 'Rosette',
    stock: 31,
    images: ['https://images.unsplash.com/photo-1530914813430-0c7510b8bcd7?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.3,
    numReviews: 11,
    isFeatured: true,
    tags: ['pen holder', 'desk', 'decor']
  },
  {
    name: 'Faber-Castell Sketch Set',
    slug: 'faber-castell-sketch-set',
    description: 'Artist sketch set with charcoal, pencils, eraser and sharpener.',
    price: 680,
    category: 'Art Supplies',
    brand: 'Faber-Castell',
    stock: 28,
    images: ['https://images.unsplash.com/photo-1522113852364-0bc8c23b0f52?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.7,
    numReviews: 17,
    isFeatured: false,
    tags: ['sketch', 'artist', 'set']
  },
  {
    name: 'Dollar Notecard Set',
    slug: 'dollar-notecard-set',
    description: 'Elegant blank notecard set for notes, invites and messages.',
    price: 260,
    category: 'Paper Products',
    brand: 'Dollar',
    stock: 54,
    images: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.1,
    numReviews: 9,
    isFeatured: false,
    tags: ['notecard', 'cards', 'stationery']
  },
  {
    name: 'Rosette Hardcover Notebook',
    slug: 'rosette-hardcover-notebook',
    description: 'Hardcover notebook with premium ivory paper and elastic closure.',
    price: 380,
    category: 'Notebooks',
    brand: 'Rosette',
    stock: 48,
    images: ['https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80'],
    ratings: 4.6,
    numReviews: 20,
    isFeatured: true,
    tags: ['notebook', 'hardcover', 'premium']
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

    const createdProducts = await Product.insertMany(products);

    await Order.create({
      user: user._id,
      orderItems: [
        {
          name: createdProducts[0].name,
          qty: 2,
          image: createdProducts[0].images[0],
          price: createdProducts[0].price,
          product: createdProducts[0]._id
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
      totalPrice: 900,
      status: 'pending',
      isPaid: false,
      isDelivered: false
    });

    console.log('✅ Data seeded successfully!');
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