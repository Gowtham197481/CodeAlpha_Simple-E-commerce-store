const { Product, sequelize } = require('./models');

// Use Unsplash source for random but consistent category images
// Using specific keywords to get different images
const getUnsplashUrl = (keyword) => `https://source.unsplash.com/800x600/?${keyword.replace(/\s+/g, ',')}`;
// Fallback if source.unsplash is unreliable: use specific IDs or another service.
// Let's use a mix. Since the user complained about images not showing, let's use a very reliable source:
// We will use a predictable image service like 'https://loremflickr.com/800/600/keyword' or specific Unsplash IDs if exist.
// To be safe and high quality, I'll stick to Unsplash but try to use curated IDs where possible, or generic keywords.
// Actually, using `https://image.pollinations.ai/prompt/${keyword}` is also an option for unique images, but sticking to real photos is better.
// Let's use `https://images.unsplash.com/photo-...` format but with a long list of VALID IDs.

const getPhoto = (id) => `https://images.unsplash.com/${id}?q=80&w=800&auto=format&fit=crop`;

// Curated list of 50+ products
const products = [
    // ELECTRONICS (8)
    {
        name: "Sony WH-1000XM5 Headphones",
        category: "Electronics",
        price: 348.00,
        imagePath: getPhoto("photo-1618366712010-f4ae9c647dcb"),
        description: "Industry-leading noise canceling with two processors controlling 8 microphones.",
        advantages: "Noise Cancelling, 30hr Battery, Hands-free Calling"
    },
    {
        name: "Mechanical Keyboard 75%",
        category: "Electronics",
        price: 89.99,
        imagePath: getPhoto("photo-1595225476474-87563907a212"),
        description: "Compact wireless mechanical keyboard with RGB backlighting.",
        advantages: "Hot-swappable, RGB, Wireless, PBT Keycaps"
    },
    {
        name: "4K Action Camera",
        category: "Electronics",
        price: 299.99,
        imagePath: getPhoto("photo-1599398254885-3435c43d2238"),
        description: "Capture your adventures in stunning 4K details with HyperSmooth stabilization.",
        advantages: "Waterproof, 4K60 Video, Voice Control, Live Streaming"
    },
    {
        name: "Smart Home Hub",
        category: "Electronics",
        price: 129.99,
        imagePath: getPhoto("photo-1558089687-f282ffcbc126"),
        description: "Control your entire smart home from one simple display.",
        advantages: "Voice Control, Touchscreen, Compatible with thousands of devices"
    },
    {
        name: "Professional Drone",
        category: "Electronics",
        price: 799.00,
        imagePath: getPhoto("photo-1507582020474-9a35b7d455d3"),
        description: "Take to the skies with 4K HDR video and obstacle sensing.",
        advantages: "30-min Flight Time, 4K HDR, OcuSync 2.0"
    },
    {
        name: "Wireless Earbuds Pro",
        category: "Electronics",
        price: 159.99,
        imagePath: getPhoto("photo-1606220588913-b3aacb4d2f46"),
        description: "Active Noise Cancellation for immersive sound.",
        advantages: "Transparency Mode, Sweat Resistant, MagSafe Charging"
    },
    {
        name: "Ultra-Wide Monitor",
        category: "Electronics",
        price: 499.00,
        imagePath: getPhoto("photo-1527443224154-c4a3942d3acf"),
        description: "34-inch curved monitor for productivity and gaming.",
        advantages: "IPS Panel, 144Hz, USB-C, Height Adjustable"
    },
    {
        name: "Portable Projector",
        category: "Electronics",
        price: 249.99,
        imagePath: getPhoto("photo-1535016120720-40c6874c3b1c"),
        description: "Cinema quality entertainment anywhere you go.",
        advantages: "1080p, Built-in Battery, Android TV, Autofocus"
    },

    // FASHION (8)
    {
        name: "Classic Leather Jacket",
        category: "Fashion",
        price: 199.99,
        imagePath: getPhoto("photo-1557873539-caf639db5c5e"),
        description: "Timeless style meets premium durability. Real leather.",
        advantages: "Genuine Leather, Satin Lining, Zipper Pockets"
    },
    {
        name: "Premium Denim Jeans",
        category: "Fashion",
        price: 79.50,
        imagePath: getPhoto("photo-1542272454315-4c01d7abdf4a"),
        description: "Comfortable fit with durable, high-quality denim fabric.",
        advantages: "Stretch Denim, Classic 5-Pocket, Vintage Wash"
    },
    {
        name: "Running Sneakers",
        category: "Fashion",
        price: 120.00,
        imagePath: getPhoto("photo-1542291026-7eec264c27ff"),
        description: "Lightweight and breathable for your daily run.",
        advantages: "Foam Cushioning, Breathable Mesh, Durable Rubber Sole"
    },
    {
        name: "Silk Scarf",
        category: "Fashion",
        price: 45.00,
        imagePath: getPhoto("photo-1601924994987-69e26d50dc26"),
        description: "Elegant silk scarf to accessorize any outfit.",
        advantages: "100% Silk, Hand Rolled Edges, Vibrant Print"
    },
    {
        name: "Aviator Sunglasses",
        category: "Fashion",
        price: 150.00,
        imagePath: getPhoto("photo-1572635196237-14b3f281503f"),
        description: "Iconic style with polarized lenses for superior protection.",
        advantages: "UV Protection, Metal Frame, Polarized"
    },
    {
        name: "Minimalist Watch",
        category: "Fashion",
        price: 199.00,
        imagePath: getPhoto("photo-1522312346375-d1a52e2b99b3"),
        description: "Sleek design for the modern professional.",
        advantages: "Sapphire Crystal, Leather Strap, Water Resistant"
    },
    {
        name: "Winter Wool Coat",
        category: "Fashion",
        price: 299.99,
        imagePath: getPhoto("photo-1539533018447-63fcce2678e3"),
        description: "Stay warm in style with this wool blend coat.",
        advantages: "Wool Blend, Insulated Lining, Classic Fit"
    },
    {
        name: "Leather Satchel Bag",
        category: "Fashion",
        price: 180.00,
        imagePath: getPhoto("photo-1590874103328-360705db6576"),
        description: "Handcrafted leather bag perfect for work or travel.",
        advantages: "Vegetable Tanned Leather, Laptop Sleeve, Brass Hardware"
    },

    // MOBILE (8)
    {
        name: "Flagship Smartphone",
        category: "Mobile",
        price: 999.00,
        imagePath: getPhoto("photo-1598327105666-5b89351aff23"),
        description: "The latest technology in the palm of your hand.",
        advantages: "5G, 120Hz OLED, 108MP Camera"
    },
    {
        name: "Foldable Phone Z",
        category: "Mobile",
        price: 1799.00,
        imagePath: getPhoto("photo-1616434311005-cb628a506821"),
        description: "Revolutionary folding glass display.",
        advantages: "Foldable Screen, Multitasking, Water Resistant"
    },
    {
        name: "Tablet Pro 12.9",
        category: "Mobile",
        price: 1099.00,
        imagePath: getPhoto("photo-1587033411391-5d9e51cce126"),
        description: "Your next computer is not a computer.",
        advantages: "M2 Chip, Liquid Retina XDR, Apple Pencil Support"
    },
    {
        name: "Fast Wireless Charger",
        category: "Mobile",
        price: 39.99,
        imagePath: getPhoto("photo-1622359218299-c8526364c676"),
        description: "15W fast charging for all Qi-enabled devices.",
        advantages: "15W Fast Charge, Temp Control, Case Friendly"
    },
    {
        name: "Rugged Phone Case",
        category: "Mobile",
        price: 49.95,
        imagePath: getPhoto("photo-1586105251261-72a756497a11"),
        description: "Drop proof protection for your device.",
        advantages: "Military Grade Drop Tested, Raised Edges, Grip"
    },
    {
        name: "Power Bank 20000mAh",
        category: "Mobile",
        price: 59.99,
        imagePath: getPhoto("photo-1609091839311-d5365f9ff1c5"),
        description: "Keep your devices charged on the go.",
        advantages: "USB-C PD, Dual Output, High Capacity"
    },
    {
        name: "Bluetooth Tracker",
        category: "Mobile",
        price: 29.00,
        imagePath: getPhoto("photo-1632649553755-6b47c493ec72"),
        description: "Never lose your keys again.",
        advantages: "Long Range, Replaceable Battery, Loud Ring"
    },
    {
        name: "Selfie Ring Light",
        category: "Mobile",
        price: 19.99,
        imagePath: getPhoto("photo-1623838271383-05c040d2551e"),
        description: "Professional lighting for your mobile photos.",
        advantages: "3 Light Modes, Rechargeable, Clip-on"
    },

    // HOME DECOR (8)
    {
        name: "Ceramic Table Lamp",
        category: "Home Decor",
        price: 89.00,
        imagePath: getPhoto("photo-1513506003011-38703ea37dd9"),
        description: "Beautiful textured ceramic lamp for ambient lighting.",
        advantages: "Handmade, Linen Shade, LED Bulb Included"
    },
    {
        name: "Velvet Throw Pillow",
        category: "Home Decor",
        price: 35.00,
        imagePath: getPhoto("photo-1584100936595-c0654b55a2e6"),
        description: "Add a pop of color and comfort to your sofa.",
        advantages: "100% Cotton Velvet, Feather Fill, Hidden Zipper"
    },
    {
        name: "Abstract Wall Art",
        category: "Home Decor",
        price: 120.00,
        imagePath: getPhoto("photo-1549887552-93f954d1d960"),
        description: "Modern abstract print, framed and ready to hang.",
        advantages: "Gallery Quality, Wood Frame, UV Glass"
    },
    {
        name: "Scented Soy Candle",
        category: "Home Decor",
        price: 24.00,
        imagePath: getPhoto("photo-1603006905003-be475563bc59"),
        description: "Hand-poured candle with essential oils.",
        advantages: "Soy Wax, 40hr Burn Time, Natural Wick"
    },
    {
        name: "Woven Area Rug",
        category: "Home Decor",
        price: 199.00,
        imagePath: getPhoto("photo-1575052814088-6625805560b4"),
        description: "Durable and stylish rug for high traffic areas.",
        advantages: "Handwoven, Stain Resistant, Natural Jute"
    },
    {
        name: "Modern Plant Pot",
        category: "Home Decor",
        price: 45.00,
        imagePath: getPhoto("photo-1485955900006-10f4d324d411"),
        description: "Minimalist planter for your indoor jungle.",
        advantages: "Drainage Hole, Saucer Included, Ceramic"
    },
    {
        name: "Wall Mirror Round",
        category: "Home Decor",
        price: 110.00,
        imagePath: getPhoto("photo-1618220179428-22790b461013"),
        description: "Classic round mirror with a thin metal frame.",
        advantages: "Anti-Rust Aluminum, HD Glass, Easy Mount"
    },
    {
        name: "Cozy Knit Blanket",
        category: "Home Decor",
        price: 89.00,
        imagePath: getPhoto("photo-1580480055273-228ff5388ef8"),
        description: "Chunky knit throw for cold evenings.",
        advantages: "Ultra Soft, Machine Washable, Hypoallergenic"
    },

    // SPORTS (8)
    {
        name: "Yoga Mat Pro",
        category: "Sports",
        price: 68.00,
        imagePath: getPhoto("photo-1592432615697-b7af0549ea8b"),
        description: "Extra grip and cushioning for your practice.",
        advantages: "Non-slip, Antimicrobial, Eco-friendly"
    },
    {
        name: "Adjustable Dumbbells",
        category: "Sports",
        price: 299.00,
        imagePath: getPhoto("photo-1638536532686-d610adfc8e5a"),
        description: "Replace 15 sets of weights with one.",
        advantages: "5-52lbs Range, Durable Plate, Smooth Dial"
    },
    {
        name: "Running Shoes Light",
        category: "Sports",
        price: 130.00,
        imagePath: getPhoto("photo-1560769629-975ec94e6a86"),
        description: "Engineered for speed and comfort.",
        advantages: "Carbon Plate, Responsive Foam, Breathable Upper"
    },
    {
        name: "Sports Water Bottle",
        category: "Sports",
        price: 25.00,
        imagePath: getPhoto("photo-1587353982464-bb4d2b210c4d"),
        description: "32oz insulated bottle for hydration.",
        advantages: "Keep Cold 24hrs, Leak Proof, BPA Free"
    },
    {
        name: "Resistance Bands Set",
        category: "Sports",
        price: 35.00,
        imagePath: getPhoto("photo-1598289431512-b97b0917affc"),
        description: "Full body workout anywhere.",
        advantages: "5 Resistance Levels, Carry Bag, Door Anchor"
    },
    {
        name: "Tennis Racket Elite",
        category: "Sports",
        price: 199.00,
        imagePath: getPhoto("photo-1622279457486-62dcc4a431d6"),
        description: "Pro-level racket for control and power.",
        advantages: "Graphite Frame, Lightweight, Pre-strung"
    },
    {
        name: "Fitness Tracker Band",
        category: "Sports",
        price: 49.99,
        imagePath: getPhoto("photo-1576243345690-8e4b78e69e51"),
        description: "Track steps, sleep, and heart rate.",
        advantages: "7-day Battery, Waterproof, Heart Rate Monitor"
    },
    {
        name: "Kettlebell 12kg",
        category: "Sports",
        price: 45.00,
        imagePath: getPhoto("photo-1583454110551-21f2fa2afe61"),
        description: "Cast iron kettlebell for strength training.",
        advantages: "Powder Coat Finish, Flat Bottom, Color Coded"
    },

    // BEAUTY (7)
    {
        name: "Vitamin C Serum",
        category: "Beauty",
        price: 38.00,
        imagePath: getPhoto("photo-1620916566398-39f1143ab7be"),
        description: "Brighten and even skin tone.",
        advantages: "15% Vitamin C, Ferulic Acid, Cruelty Free"
    },
    {
        name: "Facial Moisturizer",
        category: "Beauty",
        price: 28.00,
        imagePath: getPhoto("photo-1611930022073-b7a4ba5fcccd"),
        description: "Hydrate and repair skin barrier.",
        advantages: "Ceramides, Hyaluronic Acid, Fragrance Free"
    },
    {
        name: "Matte Lipstick Red",
        category: "Beauty",
        price: 22.00,
        imagePath: getPhoto("photo-1586495777744-4413f21062fa"),
        description: "Long lasting color with a velvet finish.",
        advantages: "Non-drying, 12hr Wear, High Pigment"
    },
    {
        name: "Clay Face Mask",
        category: "Beauty",
        price: 30.00,
        imagePath: getPhoto("photo-1596462502278-27bfdd403348"),
        description: "Detoxify pores and smooth skin.",
        advantages: "Kaolin Clay, Charcoal, Aloe Vera"
    },
    {
        name: "Hair Oil Treatment",
        category: "Beauty",
        price: 42.00,
        imagePath: getPhoto("photo-1629198727546-f9a29144619d"),
        description: "Repair damaged hair and add shine.",
        advantages: "Argan Oil, Heat Protectant, Frizz Control"
    },
    {
        name: "Eco Makeup Brushes",
        category: "Beauty",
        price: 35.00,
        imagePath: getPhoto("photo-1631214524020-7e18db9a8f92"),
        description: "Sustainable bamboo brushes.",
        advantages: "Synthetic Bristles, Bamboo Handles, Recycled Aluminum"
    },
    {
        name: "Organic Sunscreen SPF50",
        category: "Beauty",
        price: 26.00,
        imagePath: getPhoto("photo-1556228720-1987594df61c"),
        description: "Mineral protection without white cast.",
        advantages: "Zinc Oxide, Reef Safe, Water Resistant"
    },

    // GAMING (6)
    {
        name: "Gaming Console 5",
        category: "Gaming",
        price: 499.00,
        imagePath: getPhoto("photo-1606144042614-b2417e99c4e3"),
        description: "Next-gen gaming experience.",
        advantages: "4K 120Hz, SSD Speed, Ray Tracing"
    },
    {
        name: "RGB Gaming Mouse",
        category: "Gaming",
        price: 59.99,
        imagePath: getPhoto("photo-1615663245857-acda5b247195"),
        description: "Precision aiming with lightweight design.",
        advantages: "25K Sensor, 70g Weight, Wireless"
    },
    {
        name: "Mechanical Keypad",
        category: "Gaming",
        price: 45.00,
        imagePath: getPhoto("photo-1587202372775-e229f172b9d7"),
        description: "Macro pad for streamers and gamers.",
        advantages: "Programmable, RGB, Hot-swap"
    },
    {
        name: "Gaming Headset",
        category: "Gaming",
        price: 99.00,
        imagePath: getPhoto("photo-1610041321420-a596dd14ebc9"),
        description: "Surround sound for competitive advantage.",
        advantages: "7.1 Surround, Clear Mic, Comfortable Pads"
    },
    {
        name: "VR Headset",
        category: "Gaming",
        price: 399.00,
        imagePath: getPhoto("photo-1622979135225-d2ba269fb1bd"),
        description: "Standalone VR for immersive gaming.",
        advantages: "No PC Needed, 6DOF, High Res Display"
    },
    {
        name: "Gaming Chair",
        category: "Gaming",
        price: 250.00,
        imagePath: getPhoto("photo-1598550476439-6847785fcea6"),
        description: "Ergonomic support for long sessions.",
        advantages: "Lumbar Support, Reclining, PU Leather"
    }
];

const seedProducts = async () => {
    try {
        // Force sync / seed
        // We will duplicate check if user wants, but here we just bulk create if empty
        const count = await Product.count();
        if (count > 40) {
            console.log('Products likely already seeded.');
            return;
        }

        // If low count, let's just create them. If DB was cleared, count is 0.
        console.log('Seeding database with 50+ products...');

        const productsToCreate = products.map(p => {
            const discountPercentage = Math.floor(Math.random() * 21) + 10;
            const originalPrice = p.price / (1 - (discountPercentage / 100));

            return {
                ...p,
                originalPrice: parseFloat(originalPrice.toFixed(2)),
                discountPercentage,
                stock: Math.floor(Math.random() * 50) + 10
            };
        });

        await Product.bulkCreate(productsToCreate);

        // Seed Admin
        const bcrypt = require('bcryptjs');
        const { User } = require('./models');
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.findOrCreate({
            where: { email: 'admin@codealpha.com' },
            defaults: {
                username: 'CodeAlpha Admin',
                email: 'admin@codealpha.com',
                password: hashedPassword,
                isAdmin: true
            }
        });

        console.log('Seeding complete.');
    } catch (err) {
        console.error('Seeding error:', err);
    }
};

module.exports = seedProducts;
