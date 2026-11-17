import {
  PrismaClient,
  RoleName,
  ProductCondition,
  ProductStatus,
  InventoryTransactionReason,
  RefurbishedStatus,
  ConditionGrade,
  ServicePricingType,
  RepairBookingStatus,
  QuotationStatus,
  OrderStatus,
  PaymentStatus,
  FulfilmentType,
  EnquiryStatus,
  UsedDeviceSubmissionStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { ensurePostgresAvailable, stopEmbeddedPostgres } from '../src/prisma/embedded-pg';

export async function seedDatabase(prisma: PrismaClient): Promise<void> {
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.ALLOW_DEMO_SEED_IN_PROD !== 'true'
  ) {
    throw new Error(
      'SAFETY ABORT: Seed script cannot run in production without ALLOW_DEMO_SEED_IN_PROD=true.',
    );
  }

  // Clean existing demo data in reverse dependency order for deterministic idempotency
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.enquiry.deleteMany({});
  await prisma.repairQuotation.deleteMany({});
  await prisma.repairUpdate.deleteMany({});
  await prisma.repairBooking.deleteMany({});
  await prisma.usedDeviceSubmission.deleteMany({});
  await prisma.deviceInspection.deleteMany({});
  await prisma.refurbishedDevice.deleteMany({});
  await prisma.inventoryTransaction.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.productSpecification.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.serviceCategory.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.customerProfile.deleteMany({});
  await prisma.userRole.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});
  await prisma.siteContent.deleteMany({});

  // 1. Roles
  const [adminRole, customerRole, staffRole] = await Promise.all([
    prisma.role.create({
      data: { name: RoleName.ADMIN, description: 'Full platform administrator' },
    }),
    prisma.role.create({
      data: { name: RoleName.CUSTOMER, description: 'Registered customer' },
    }),
    prisma.role.create({
      data: { name: RoleName.STAFF, description: 'Service & operations technician' },
    }),
  ]);

  // 2. Users (1 Admin + 10 Demo Customers)
  const adminPasswordHash = await bcrypt.hash('Admin@Kiran2026!', 10);
  const customerPasswordHash = await bcrypt.hash('Customer@2026!', 10);

  const adminUser = await prisma.user.create({
    data: {
      name: 'Kiran Deshmukh (Admin)',
      email: 'admin@kiransinfotech.demo',
      phone: '+919000000001',
      passwordHash: adminPasswordHash,
      isDemo: true,
      userRoles: {
        create: [{ roleId: adminRole.id }, { roleId: customerRole.id }],
      },
    },
  });

  const customerSeeds = [
    { name: 'Rahul Sharma', email: 'rahul.sharma@example.demo', phone: '+919820100101', city: 'Pune', company: 'Sharma Design Studio' },
    { name: 'Priya Patel', email: 'priya.patel@example.demo', phone: '+919820100102', city: 'Mumbai', company: 'Patel Consulting LLP' },
    { name: 'Amit Kulkarni', email: 'amit.kulkarni@example.demo', phone: '+919820100103', city: 'Pune', company: null },
    { name: 'Sneha Nair', email: 'sneha.nair@example.demo', phone: '+919820100104', city: 'Bengaluru', company: 'NextWave Media' },
    { name: 'Vikram Joshi', email: 'vikram.joshi@example.demo', phone: '+919820100105', city: 'Nashik', company: 'Joshi Accounting' },
    { name: 'Ananya Verma', email: 'ananya.verma@example.demo', phone: '+919820100106', city: 'Pune', company: null },
    { name: 'Rohan Mehta', email: 'rohan.mehta@example.demo', phone: '+919820100107', city: 'Mumbai', company: 'Mehta Logistics' },
    { name: 'Kavita Iyer', email: 'kavita.iyer@example.demo', phone: '+919820100108', city: 'Pune', company: null },
    { name: 'Sandeep Pawar', email: 'sandeep.pawar@example.demo', phone: '+919820100109', city: 'Satara', company: 'Pawar Engineering' },
    { name: 'Neha Gokhale', email: 'neha.gokhale@example.demo', phone: '+919820100110', city: 'Pune', company: null },
  ];

  const customers = [];
  for (let i = 0; i < customerSeeds.length; i++) {
    const c = customerSeeds[i];
    const created = await prisma.user.create({
      data: {
        name: c.name,
        email: c.email,
        phone: c.phone,
        passwordHash: customerPasswordHash,
        isDemo: true,
        userRoles: { create: [{ roleId: customerRole.id }] },
        customerProfile: {
          create: {
            companyName: c.company,
            gstNumber: c.company ? `27AABC${1000 + i}R1ZM` : null,
          },
        },
        addresses: {
          create: [
            {
              label: 'Office / Home',
              recipient: c.name,
              phone: c.phone,
              addressLine1: `Plot ${10 + i}, Tech Park Road`,
              city: c.city,
              state: 'Maharashtra',
              postalCode: `4110${10 + i}`,
              country: 'India',
              isDefault: true,
            },
          ],
        },
      },
    });
    customers.push(created);
  }

  // 3. Product Categories (8 Categories)
  const categorySeeds = [
    { name: 'Laptops', slug: 'laptops', description: 'Business, creator, and everyday notebooks from Dell, HP, Lenovo, and ASUS.', sortOrder: 1, imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80' },
    { name: 'Desktops & Workstations', slug: 'desktops', description: 'Commercial desktops, compact mini-PCs, and custom tower systems.', sortOrder: 2, imageUrl: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=80' },
    { name: 'Monitors & Displays', slug: 'monitors', description: 'IPS office monitors, QHD creator displays, and ergonomic stands.', sortOrder: 3, imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80' },
    { name: 'SSD & Storage', slug: 'storage', description: 'NVMe Gen4 SSDs, 2.5-inch SATA SSDs, enterprise HDDs, and portable drives.', sortOrder: 4, imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80' },
    { name: 'Memory (RAM)', slug: 'ram', description: 'DDR4 and DDR5 SO-DIMM laptop and UDIMM desktop memory modules.', sortOrder: 5, imageUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=800&q=80' },
    { name: 'Keyboards & Mice', slug: 'keyboards-mice', description: 'Mechanical keyboards, wireless office combos, and precision ergonomic mice.', sortOrder: 6, imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80' },
    { name: 'Printers & Scanners', slug: 'printers', description: 'LaserJet office printers, ink-tank multifunction printers, and consumables.', sortOrder: 7, imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80' },
    { name: 'Computer Accessories', slug: 'accessories', description: 'USB-C docking stations, laptop chargers, cooling pads, UPS units, and cables.', sortOrder: 8, imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80' },
  ];

  const categoriesBySlug: Record<string, { id: string; name: string }> = {};
  for (const cat of categorySeeds) {
    const created = await prisma.category.create({
      data: { ...cat, isDemo: true },
    });
    categoriesBySlug[cat.slug] = created;
  }

  // 4. Products (20 New Hardware Products)
  const productSeeds = [
    {
      sku: 'KI-LAP-001',
      slug: 'dell-latitude-3440-i5-13th-gen',
      name: 'Dell Latitude 3440 Business Laptop (Core i5 13th Gen / 16GB / 512GB NVMe)',
      brand: 'Dell',
      model: 'Latitude 3440',
      categorySlug: 'laptops',
      costPrice: 52500,
      sellingPrice: 61900,
      mrpPrice: 68990,
      stock: 8,
      featured: true,
      warrantyMonths: 36,
      warrantySummary: '3-Year Dell ProSupport On-Site Warranty',
      shortSummary: '14" FHD IPS anti-glare business notebook with Intel Core i5-1335U and Wi-Fi 6E.',
      description: 'Engineered for commercial reliability, the Dell Latitude 3440 combines a 13th Gen Intel Core i5 processor, 16GB DDR4 memory, and a fast 512GB PCIe NVMe SSD with enterprise security features.',
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80',
      specs: [
        { key: 'Processor', value: 'Intel Core i5-1335U (10 Cores, up to 4.6 GHz)' },
        { key: 'Memory', value: '16GB DDR4 3200MHz (Upgradeable to 64GB)' },
        { key: 'Storage', value: '512GB M.2 PCIe NVMe SSD' },
        { key: 'Display', value: '14.0" FHD (1920x1080) IPS Anti-Glare 250 nits' },
        { key: 'Operating System', value: 'Windows 11 Pro 64-bit' },
      ],
    },
    {
      sku: 'KI-LAP-002',
      slug: 'hp-probook-440-g10-ryzen-7',
      name: 'HP ProBook 440 G10 Notebook (Core i7 13th Gen / 16GB / 512GB SSD)',
      brand: 'HP',
      model: 'ProBook 440 G10',
      categorySlug: 'laptops',
      costPrice: 61000,
      sellingPrice: 71500,
      mrpPrice: 79900,
      stock: 5,
      featured: true,
      warrantyMonths: 36,
      warrantySummary: '3-Year HP Onsite Commercial Warranty',
      shortSummary: 'Lightweight aluminum-chassis commercial laptop built for hybrid professionals.',
      description: 'The HP ProBook 440 G10 delivers commercial-grade durability, MIL-STD-810H testing, HP Wolf Security, and dual-channel SO-DIMM upgrade slots.',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
      specs: [
        { key: 'Processor', value: 'Intel Core i7-1355U (10 Cores, up to 5.0 GHz)' },
        { key: 'Memory', value: '16GB DDR4 3200MHz' },
        { key: 'Storage', value: '512GB PCIe Gen4 NVMe SSD' },
        { key: 'Display', value: '14" FHDUWVA Anti-Glare' },
      ],
    },
    {
      sku: 'KI-LAP-003',
      slug: 'lenovo-thinkpad-e14-gen5-i5',
      name: 'Lenovo ThinkPad E14 Gen 5 (Core i5-1335U / 16GB / 512GB SSD / Backlit KB)',
      brand: 'Lenovo',
      model: 'ThinkPad E14 Gen 5',
      categorySlug: 'laptops',
      costPrice: 50000,
      sellingPrice: 58990,
      mrpPrice: 66500,
      stock: 6,
      featured: true,
      warrantyMonths: 12,
      warrantySummary: '1-Year Lenovo Premier Support',
      shortSummary: 'Legendary ThinkPad keyboard with WUXGA 16:10 display and robust metal top cover.',
      description: 'Designed for developers and business executives, the ThinkPad E14 Gen 5 features a 16:10 aspect ratio screen, Thunderbolt 4 connectivity, and discrete TPM 2.0 encryption.',
      imageUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=900&q=80',
      specs: [
        { key: 'Processor', value: 'Intel Core i5-1335U' },
        { key: 'Memory', value: '16GB DDR4' },
        { key: 'Storage', value: '512GB NVMe M.2 2242 SSD' },
        { key: 'Display', value: '14" WUXGA (1920x1200) IPS 300 nits' },
      ],
    },
    {
      sku: 'KI-LAP-004',
      slug: 'asus-vivobook-16x-creator-rtx3050',
      name: 'ASUS Vivobook 16X Creator Laptop (Core i5-12500H / 16GB / 512GB / RTX 3050)',
      brand: 'ASUS',
      model: 'Vivobook 16X K3605',
      categorySlug: 'laptops',
      costPrice: 54000,
      sellingPrice: 63490,
      mrpPrice: 74990,
      stock: 2,
      featured: false,
      warrantyMonths: 12,
      warrantySummary: '1-Year ASUS India Onsite Warranty',
      shortSummary: '16-inch 120Hz creator notebook with dedicated NVIDIA RTX 3050 4GB graphics.',
      description: 'Ideal for CAD engineers, video editors, and students needing dedicated GPU acceleration alongside a spacious 16-inch 120Hz display.',
      imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&q=80',
      specs: [
        { key: 'Processor', value: 'Intel Core i5-12500H (12 Cores)' },
        { key: 'Graphics', value: 'NVIDIA GeForce RTX 3050 4GB GDDR6' },
        { key: 'Memory', value: '16GB DDR4' },
        { key: 'Storage', value: '512GB PCIe 4.0 SSD' },
      ],
    },
    {
      sku: 'KI-DSK-001',
      slug: 'dell-optiplex-7010-sff-i5',
      name: 'Dell OptiPlex 7010 Small Form Factor Desktop (Core i5-13500 / 16GB / 512GB)',
      brand: 'Dell',
      model: 'OptiPlex 7010 SFF',
      categorySlug: 'desktops',
      costPrice: 44000,
      sellingPrice: 51500,
      mrpPrice: 57900,
      stock: 7,
      featured: true,
      warrantyMonths: 36,
      warrantySummary: '3-Year Dell Next Business Day Onsite Service',
      shortSummary: 'Compact enterprise SFF desktop powered by 14-core Intel Core i5-13500.',
      description: 'Space-saving commercial desktop engineered for office fleets, featuring native DisplayPort + HDMI multi-monitor support and tool-less chassis access.',
      imageUrl: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=900&q=80',
      specs: [
        { key: 'Processor', value: 'Intel Core i5-13500 (14 Cores, 20 Threads)' },
        { key: 'Memory', value: '16GB DDR4 (Expandable to 64GB)' },
        { key: 'Storage', value: '512GB M.2 PCIe NVMe SSD' },
        { key: 'Form Factor', value: 'Small Form Factor (SFF)' },
      ],
    },
    {
      sku: 'KI-DSK-002',
      slug: 'kirans-probuild-workstation-i7',
      name: 'Kiran ProBuild Custom Workstation (Core i7-14700 / 32GB DDR5 / 1TB Gen4 SSD)',
      brand: "Kiran's Infotech",
      model: 'ProBuild WS-1470',
      categorySlug: 'desktops',
      costPrice: 76000,
      sellingPrice: 88900,
      mrpPrice: 96000,
      stock: 3,
      featured: false,
      warrantyMonths: 36,
      warrantySummary: '3-Year Component & In-Store Support Warranty',
      shortSummary: 'Custom-assembled workstation tested with 24-hour thermal stress validation.',
      description: 'Built in-house by Kiran’s Infotech engineers using Tier-1 components (ASUS Prime B760 motherboard, Corsair 32GB DDR5, Samsung 1TB NVMe, 650W 80+ Gold PSU).',
      imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=900&q=80',
      specs: [
        { key: 'Processor', value: 'Intel Core i7-14700 (20 Cores)' },
        { key: 'Memory', value: '32GB (2x16GB) DDR5 5600MHz' },
        { key: 'Storage', value: '1TB PCIe 4.0 NVMe SSD' },
        { key: 'Power Supply', value: '650W 80 Plus Gold Certified' },
      ],
    },
    {
      sku: 'KI-MON-001',
      slug: 'dell-p2422h-24-ips-monitor',
      name: 'Dell 24" P2422H Professional Ergonomic IPS Monitor (Height Adjustable)',
      brand: 'Dell',
      model: 'P2422H',
      categorySlug: 'monitors',
      costPrice: 12200,
      sellingPrice: 14800,
      mrpPrice: 18500,
      stock: 12,
      featured: true,
      warrantyMonths: 36,
      warrantySummary: '3-Year Dell Advanced Exchange Service',
      shortSummary: '24-inch Full HD IPS monitor with ComfortView Plus and full pivot/tilt/height stand.',
      description: 'The gold standard for office productivity with 99% sRGB coverage, integrated USB 3.2 hub, and flicker-free low-blue-light panel.',
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80',
      specs: [
        { key: 'Panel Size & Type', value: '23.8" IPS Anti-Glare' },
        { key: 'Resolution', value: '1920 x 1080 @ 60Hz' },
        { key: 'Ports', value: 'HDMI, DisplayPort 1.2, VGA, 4x SuperSpeed USB 5Gbps' },
        { key: 'Ergonomics', value: 'Height (150mm), Pivot, Swivel, Tilt, VESA 100x100' },
      ],
    },
    {
      sku: 'KI-MON-002',
      slug: 'lg-ultragear-27-qhd-ips-165hz',
      name: 'LG 27" QHD (2560x1440) IPS 100Hz USB-C Creator & Office Monitor (27QN880)',
      brand: 'LG',
      model: '27QN880-B',
      categorySlug: 'monitors',
      costPrice: 23500,
      sellingPrice: 27990,
      mrpPrice: 34000,
      stock: 4,
      featured: false,
      warrantyMonths: 36,
      warrantySummary: '3-Year LG India Onsite Warranty',
      shortSummary: 'QHD IPS display with Ergo clamp arm and 60W USB-C single-cable laptop docking.',
      description: 'Clutter-free desk setup with C-clamp ergonomic stand, HDR10 support, and single-cable USB Type-C display + power delivery.',
      imageUrl: 'https://images.unsplash.com/photo-1551645120-d70bfe84c826?auto=format&fit=crop&w=900&q=80',
      specs: [
        { key: 'Resolution', value: 'QHD (2560 x 1440) IPS' },
        { key: 'Color Gamut', value: 'sRGB 99% (Typ.)' },
        { key: 'Connectivity', value: 'USB-C (60W PD), 2x HDMI, DisplayPort' },
      ],
    },
    {
      sku: 'KI-SSD-001',
      slug: 'samsung-990-evo-1tb-nvme-ssd',
      name: 'Samsung 990 EVO 1TB M.2 PCIe Gen4 NVMe Internal SSD (Up to 5000 MB/s)',
      brand: 'Samsung',
      model: 'MZ-V9E1T0BW',
      categorySlug: 'storage',
      costPrice: 6400,
      sellingPrice: 7850,
      mrpPrice: 9999,
      stock: 18,
      featured: true,
      warrantyMonths: 60,
      warrantySummary: '5-Year Samsung Limited Warranty (600 TBW)',
      shortSummary: 'High-efficiency PCIe 4.0 x4 NVMe SSD for laptop and desktop upgrades.',
      description: 'Dramatically accelerate boot times, application launches, and large file transfers with up to 5,000 MB/s sequential read speeds and smart thermal control.',
      imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=900&q=80',
      specs: [
        { key: 'Capacity', value: '1TB' },
        { key: 'Form Factor', value: 'M.2 2280' },
        { key: 'Sequential Read/Write', value: '5,000 MB/s Read | 4,200 MB/s Write' },
      ],
    },
    {
      sku: 'KI-SSD-002',
      slug: 'crucial-bx500-500gb-sata-ssd',
      name: 'Crucial BX500 500GB 2.5-inch SATA III Internal SSD (Laptop HDD Replacement)',
      brand: 'Crucial',
      model: 'CT500BX500SSD1',
      categorySlug: 'storage',
      costPrice: 2450,
      sellingPrice: 3150,
      mrpPrice: 4200,
      stock: 25,
      featured: false,
      warrantyMonths: 36,
      warrantySummary: '3-Year Crucial Manufacturer Warranty',
      shortSummary: 'Best-value 2.5" SATA SSD to revive older laptops running slow mechanical hard drives.',
      description: 'Drop-in replacement for any standard 2.5-inch laptop or desktop SATA bay, delivering 300% faster boot and load responsiveness than 5400RPM HDDs.',
      imageUrl: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&w=900&q=80',
      specs: [
        { key: 'Capacity', value: '500GB' },
        { key: 'Interface', value: 'SATA 6.0 Gb/s (2.5-inch 7mm)' },
        { key: 'Sequential Read', value: '540 MB/s' },
      ],
    },
    {
      sku: 'KI-HDD-001',
      slug: 'wd-blue-2tb-desktop-hdd-7200rpm',
      name: 'Western Digital WD Blue 2TB 3.5-inch Internal Desktop HDD (SATA 6Gb/s)',
      brand: 'Western Digital',
      model: 'WD20EZBX',
      categorySlug: 'storage',
      costPrice: 4600,
      sellingPrice: 5490,
      mrpPrice: 6500,
      stock: 9,
      featured: false,
      warrantyMonths: 24,
      warrantySummary: '2-Year WD India Replacement Warranty',
      shortSummary: 'Reliable 2TB bulk secondary storage for desktops, CCTV NVR, and office backups.',
      description: 'Proven everyday mechanical storage featuring 256MB cache and NoTouch Ramp Load technology to protect recording heads.',
      imageUrl: 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&w=900&q=80',
      specs: [
        { key: 'Capacity', value: '2TB' },
        { key: 'Form Factor', value: '3.5-inch Desktop SATA' },
        { key: 'Cache', value: '256MB' },
      ],
    },
    {
      sku: 'KI-SSD-003',
      slug: 'sandisk-extreme-1tb-portable-ssd',
      name: 'SanDisk Extreme 1TB USB-C Portable External SSD (1050 MB/s, IP65 Water Resistant)',
      brand: 'SanDisk',
      model: 'SDSSDE61-1T00',
      categorySlug: 'storage',
      costPrice: 7800,
      sellingPrice: 9290,
      mrpPrice: 12500,
      stock: 6,
      featured: false,
      warrantyMonths: 60,
      warrantySummary: '5-Year Limited Warranty',
      shortSummary: 'Rugged pocket-sized NVMe external SSD with 256-bit AES hardware encryption.',
      description: 'Built for photographers and field engineers needing fast, shock-resistant external backup across USB-C laptops and tablets.',
      imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=900&q=80',
      specs: [
        { key: 'Interface', value: 'USB 3.2 Gen 2 Type-C (10Gbps)' },
        { key: 'Read Speed', value: 'Up to 1050 MB/s' },
        { key: 'Durability', value: 'IP65 water/dust resistance, 3-meter drop protection' },
      ],
    },
    {
      sku: 'KI-RAM-001',
      slug: 'crucial-16gb-ddr4-3200-sodimm-laptop-ram',
      name: 'Crucial 16GB DDR4 3200MHz CL22 SO-DIMM Laptop Memory Module',
      brand: 'Crucial',
      model: 'CT16G4SFRA32A',
      categorySlug: 'ram',
      costPrice: 2350,
      sellingPrice: 2990,
      mrpPrice: 3900,
      stock: 22,
      featured: true,
      warrantyMonths: 120,
      warrantySummary: 'Limited Lifetime Manufacturer Warranty',
      shortSummary: 'Compatible 16GB laptop RAM upgrade for 10th–13th Gen Intel and Ryzen notebooks.',
      description: 'Eliminate browser tab freezes and multitasking bottlenecks with genuine Micron-die DDR4 3200MHz laptop memory.',
      imageUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=900&q=80',
      specs: [
        { key: 'Capacity', value: '16GB Single Rank / Dual Rank SO-DIMM' },
        { key: 'Speed & Type', value: 'DDR4 3200MT/s (PC4-25600) 260-pin' },
        { key: 'Voltage', value: '1.2V' },
      ],
    },
    {
      sku: 'KI-RAM-002',
      slug: 'kingston-fury-impact-16gb-ddr5-5600-sodimm',
      name: 'Kingston FURY Impact 16GB DDR5 5600MT/s CL40 SO-DIMM Laptop RAM',
      brand: 'Kingston',
      model: 'KF556S40IB-16',
      categorySlug: 'ram',
      costPrice: 4100,
      sellingPrice: 4990,
      mrpPrice: 6200,
      stock: 11,
      featured: false,
      warrantyMonths: 120,
      warrantySummary: 'Lifetime Kingston Warranty',
      shortSummary: 'Next-gen DDR5 SO-DIMM memory with on-die ECC for modern laptops.',
      description: 'Plug N Play automatic overclocking at 5600MT/s with lower 1.1V power draw for 13th/14th Gen Intel and Ryzen 7000/8000 laptops.',
      imageUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=900&q=80',
      specs: [
        { key: 'Capacity', value: '16GB DDR5 SO-DIMM' },
        { key: 'Speed', value: '5600MT/s CL40' },
        { key: 'Voltage', value: '1.1V with On-Die ECC' },
      ],
    },
    {
      sku: 'KI-KBM-001',
      slug: 'logitech-mk295-silent-wireless-combo',
      name: 'Logitech MK295 Silent Wireless Keyboard and Mouse Combo (SilentTouch)',
      brand: 'Logitech',
      model: 'MK295',
      categorySlug: 'keyboards-mice',
      costPrice: 1850,
      sellingPrice: 2395,
      mrpPrice: 2995,
      stock: 15,
      featured: false,
      warrantyMonths: 36,
      warrantySummary: '3-Year Logitech Hardware Warranty',
      shortSummary: '90% noise-reduced wireless office keyboard and contoured optical mouse.',
      description: 'Spill-resistant full-size keyboard with numeric keypad, 8 media shortcuts, and a single nano USB receiver with 10m range.',
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80',
      specs: [
        { key: 'Connectivity', value: '2.4GHz Unifying Nano USB Receiver' },
        { key: 'Technology', value: 'SilentTouch (>90% noise reduction)' },
        { key: 'Battery Life', value: '36 months (Keyboard) / 18 months (Mouse)' },
      ],
    },
    {
      sku: 'KI-KBM-002',
      slug: 'logitech-mx-master-3s-wireless-mouse',
      name: 'Logitech MX Master 3S Performance Wireless Mouse (8000 DPI, MagSpeed)',
      brand: 'Logitech',
      model: 'MX Master 3S',
      categorySlug: 'keyboards-mice',
      costPrice: 7400,
      sellingPrice: 8995,
      mrpPrice: 10995,
      stock: 2,
      featured: true,
      warrantyMonths: 12,
      warrantySummary: '1-Year Logitech India Warranty',
      shortSummary: 'Flagship ergonomic productivity mouse with MagSpeed electromagnetic scroll wheel.',
      description: 'Tracks on any surface including glass with an 8,000 DPI sensor, quiet clicks, USB-C quick charging, and multi-device Bluetooth/Logi Bolt switching.',
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=80',
      specs: [
        { key: 'Sensor', value: 'Darkfield High Precision 8000 DPI' },
        { key: 'Connectivity', value: 'Bluetooth Low Energy + Logi Bolt USB Receiver' },
        { key: 'Charging', value: 'USB-C Rechargeable (Up to 70 days per charge)' },
      ],
    },
    {
      sku: 'KI-KBM-003',
      slug: 'keychron-k2-v2-wireless-mechanical-keyboard',
      name: 'Keychron K2 V2 Hot-Swappable Wireless Mechanical Keyboard (Brown Tactile)',
      brand: 'Keychron',
      model: 'K2-V2-HS',
      categorySlug: 'keyboards-mice',
      costPrice: 6800,
      sellingPrice: 8290,
      mrpPrice: 9999,
      stock: 0,
      featured: false,
      warrantyMonths: 12,
      warrantySummary: '1-Year Keychron India Warranty',
      shortSummary: 'Compact 75% 84-key Bluetooth & USB-C mechanical keyboard for Windows & macOS.',
      description: 'Features Gateron G Pro Brown tactile switches, 4000mAh battery, and dedicated macOS/Windows keycaps.',
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80',
      specs: [
        { key: 'Layout', value: '75% Compact (84 Keys)' },
        { key: 'Switches', value: 'Gateron G Pro Brown (Hot-Swappable)' },
        { key: 'Connectivity', value: 'Bluetooth 5.1 (3 devices) + Wired USB Type-C' },
      ],
    },
    {
      sku: 'KI-PRN-001',
      slug: 'hp-laserjet-pro-mfp-m126nw-printer',
      name: 'HP LaserJet Pro MFP M126nw All-in-One Monochrome Laser Printer (Wi-Fi)',
      brand: 'HP',
      model: 'LaserJet Pro M126nw',
      categorySlug: 'printers',
      costPrice: 17500,
      sellingPrice: 20490,
      mrpPrice: 23800,
      stock: 5,
      featured: false,
      warrantyMonths: 12,
      warrantySummary: '1-Year HP Onsite Warranty',
      shortSummary: 'Print, scan, and copy workhorse with Ethernet, Wi-Fi, and 20 ppm speed.',
      description: 'Trusted by clinics, CA offices, and retail counters for crisp monochrome laser printing using genuine HP 88A toner cartridges.',
      imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&q=80',
      specs: [
        { key: 'Functions', value: 'Print, Copy, Flatbed Scan' },
        { key: 'Print Speed', value: 'Up to 20 ppm (A4)' },
        { key: 'Connectivity', value: 'Wi-Fi 802.11b/g/n, Ethernet, Hi-Speed USB 2.0' },
      ],
    },
    {
      sku: 'KI-PRN-002',
      slug: 'epson-ecotank-l3250-wifi-inktank-printer',
      name: 'Epson EcoTank L3250 Wi-Fi All-in-One Color Ink Tank Printer',
      brand: 'Epson',
      model: 'EcoTank L3250',
      categorySlug: 'printers',
      costPrice: 13200,
      sellingPrice: 15690,
      mrpPrice: 17999,
      stock: 7,
      featured: false,
      warrantyMonths: 12,
      warrantySummary: '1-Year or 30,000 Pages Epson Warranty',
      shortSummary: 'Ultra-low-cost color printing with spill-free refill bottles (4,500 black / 7,500 color pages).',
      description: 'Heat-Free technology consumes minimal power so it can even run on standard home/office UPS inverters during power cuts.',
      imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&q=80',
      specs: [
        { key: 'Page Yield', value: '4,500 Pages Black / 7,500 Pages Color Included' },
        { key: 'Connectivity', value: 'Wi-Fi Direct, Epson Smart Panel App, USB' },
      ],
    },
    {
      sku: 'KI-ACC-001',
      slug: 'anker-555-usb-c-8-in-1-hub-100w-pd',
      name: 'Anker 555 USB-C 8-in-1 Hub (4K 60Hz HDMI, 1Gbps Ethernet, 100W PD, SD/microSD)',
      brand: 'Anker',
      model: 'A8383',
      categorySlug: 'accessories',
      costPrice: 3600,
      sellingPrice: 4690,
      mrpPrice: 6499,
      stock: 14,
      featured: false,
      warrantyMonths: 18,
      warrantySummary: '18-Month Anker Replacement Warranty',
      shortSummary: 'All-metal 10Gbps USB-C docking hub for modern ultrabooks and MacBooks.',
      description: 'Expands a single USB-C port into 4K@60Hz HDMI, Gigabit RJ45 Ethernet, 100W Power Delivery pass-through, 10Gbps USB-C data, 2x USB-A 10Gbps, and SD/microSD slots.',
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80',
      specs: [
        { key: 'Video Output', value: 'HDMI 2.0 up to 4K @ 60Hz' },
        { key: 'Power Delivery', value: '100W USB-C PD Input (85W Host Charging)' },
        { key: 'Network', value: '10/100/1000 Mbps Gigabit Ethernet' },
      ],
    },
  ];

  const createdProducts = [];
  for (const p of productSeeds) {
    const category = categoriesBySlug[p.categorySlug];
    const prod = await prisma.product.create({
      data: {
        sku: p.sku,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        model: p.model,
        shortSummary: p.shortSummary,
        description: p.description,
        condition: ProductCondition.NEW,
        costPrice: p.costPrice,
        sellingPrice: p.sellingPrice,
        mrpPrice: p.mrpPrice,
        warrantyMonths: p.warrantyMonths,
        warrantySummary: p.warrantySummary,
        featured: p.featured,
        status: ProductStatus.PUBLISHED,
        categoryId: category.id,
        isDemo: true,
        images: {
          create: [
            {
              url: p.imageUrl,
              altText: p.name,
              sortOrder: 0,
              isPrimary: true,
            },
          ],
        },
        specifications: {
          create: p.specs.map((s, idx) => ({
            groupName: 'Technical Specifications',
            key: s.key,
            value: s.value,
            sortOrder: idx,
          })),
        },
        inventory: {
          create: {
            quantity: p.stock,
            reservedQuantity: 0,
            lowStockThreshold: 3,
            warehouseLocation: 'Main Showroom',
            transactions: {
              create: [
                {
                  changeQuantity: p.stock,
                  previousQty: 0,
                  resultingQty: p.stock,
                  reason: InventoryTransactionReason.INITIAL_STOCK,
                  notes: 'Initial demo stock seed',
                  actorId: adminUser.id,
                },
              ],
            },
          },
        },
      },
      include: { inventory: true },
    });
    createdProducts.push(prod);
  }

  // 5. Refurbished Laptops (8 Individual Units across lifecycle stages)
  const refurbishedSeeds = [
    {
      deviceCode: 'REF-2026-001',
      slug: 'refurb-lenovo-thinkpad-t490-i7-16gb-512gb',
      title: 'Lenovo ThinkPad T490 Certified Refurbished (Core i7-8665U / 16GB / 512GB NVMe)',
      brand: 'Lenovo',
      model: 'ThinkPad T490',
      serialNumber: 'PF2K9L11',
      processor: 'Intel Core i7-8665U vPro (4C/8T, up to 4.8 GHz)',
      ram: '16GB DDR4 2400MHz',
      storage: '512GB Brand-New Crucial NVMe SSD',
      display: '14.0" FHD (1920x1080) IPS Anti-Glare',
      batteryHealthPct: 89,
      batteryCycles: 142,
      conditionGrade: ConditionGrade.GRADE_A_EXCELLENT,
      cosmeticNotes: 'Clean matte palmrest and top lid; zero dead pixels; minor micro-scuff on bottom cover.',
      workPerformed: 'Upgraded to brand-new 512GB NVMe SSD, repasted CPU with Arctic MX-6, ultrasonic fan cleaning, fresh Windows 11 Pro digital license.',
      warrantyMonths: 6,
      warrantyTerms: "6-Month Kiran's Infotech Hardware Carry-In Warranty",
      acquisitionSource: 'Corporate Lease Return — Pune IT Park',
      acquisitionCost: 19500,
      refurbishmentCost: 3200,
      sellingPrice: 28900,
      status: RefurbishedStatus.PUBLISHED,
      featured: true,
      imageUrls: ['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=900&q=80'],
      inspection: {
        inspectorName: 'Suresh K. (Lead Hardware Tech)',
        screenCheck: '100% Pass — No bright spots, pressure marks, or dead pixels.',
        keyboardTrackpad: '100% Pass — All keys actuation tested, TrackPoint & backlit LEDs functional.',
        portsConnectivity: '100% Pass — 2x USB-C/Thunderbolt 3, HDMI, RJ45, Wi-Fi & Bluetooth verified.',
        thermalsFan: 'Pass — Peak load 74°C after 30-min AIDA64 stress test.',
        batteryHealthReport: '89% design capacity remaining (44.9 Wh / 50.5 Wh); ~5.5 hrs office runtime.',
        storageSmartHealth: '100% Health (0 hours prior usage — newly installed Crucial NVMe).',
        overallVerdict: 'Certified Grade-A Ready for Sale',
        passed: true,
      },
    },
    {
      deviceCode: 'REF-2026-002',
      slug: 'refurb-dell-latitude-5420-i5-11th-gen-16gb',
      title: 'Dell Latitude 5420 Refurbished Business Laptop (Core i5-1145G7 / 16GB / 512GB SSD)',
      brand: 'Dell',
      model: 'Latitude 5420',
      serialNumber: '8H3M793',
      processor: 'Intel Core i5-1145G7 11th Gen (Iris Xe Graphics)',
      ram: '16GB DDR4 3200MHz Dual-Channel',
      storage: '512GB M.2 PCIe NVMe SSD',
      display: '14.0" FHD IPS Anti-Glare',
      batteryHealthPct: 92,
      batteryCycles: 98,
      conditionGrade: ConditionGrade.GRADE_A_EXCELLENT,
      cosmeticNotes: 'Near-mint chassis condition; keyboard legends crisp with backlit keys.',
      workPerformed: 'Added second 8GB RAM module for dual-channel 16GB, BIOS updated, thermal pads replaced.',
      warrantyMonths: 6,
      warrantyTerms: "6-Month Kiran's Infotech Hardware Carry-In Warranty",
      acquisitionSource: 'Enterprise Off-Lease Batch',
      acquisitionCost: 23000,
      refurbishmentCost: 2100,
      sellingPrice: 32500,
      status: RefurbishedStatus.PUBLISHED,
      featured: true,
      imageUrls: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80'],
      inspection: {
        inspectorName: 'Suresh K. (Lead Hardware Tech)',
        screenCheck: 'Pass — Crisp FHD IPS output, hinges tight.',
        keyboardTrackpad: 'Pass — Backlit keyboard and precision touchpad verified.',
        portsConnectivity: 'Pass — Dual Thunderbolt 4, HDMI 2.0, RJ45, microSD tested.',
        thermalsFan: 'Pass — Quiet fan curve, max 71°C under sustained load.',
        batteryHealthReport: '92% health in Dell BIOS diagnostics ("Excellent" status).',
        storageSmartHealth: '98% SMART life remaining, 0 bad sectors.',
        overallVerdict: 'Certified Grade-A Ready for Sale',
        passed: true,
      },
    },
    {
      deviceCode: 'REF-2026-003',
      slug: 'refurb-hp-elitebook-840-g7-i5-10th-16gb',
      title: 'HP EliteBook 840 G7 Ultra-Slim Aluminum (Core i5-10310U / 16GB / 512GB NVMe)',
      brand: 'HP',
      model: 'EliteBook 840 G7',
      serialNumber: '5CG0428XRT',
      processor: 'Intel Core i5-10310U (10th Gen vPro)',
      ram: '16GB DDR4',
      storage: '512GB NVMe SSD',
      display: '14.0" FHD IPS Ultra-Slim Bezel',
      batteryHealthPct: 85,
      batteryCycles: 190,
      conditionGrade: ConditionGrade.GRADE_A_EXCELLENT,
      cosmeticNotes: 'CNC aluminum unibody in great shape; Bang & Olufsen stereo speakers clear.',
      workPerformed: 'Full internal dust purge, thermal compound renewal, fresh OS image.',
      warrantyMonths: 6,
      warrantyTerms: "6-Month Kiran's Infotech Hardware Carry-In Warranty",
      acquisitionSource: 'Corporate Buyback',
      acquisitionCost: 21500,
      refurbishmentCost: 1500,
      sellingPrice: 29900,
      status: RefurbishedStatus.PUBLISHED,
      featured: true,
      imageUrls: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80'],
      inspection: {
        inspectorName: 'Mahesh R. (Diagnostics Tech)',
        screenCheck: 'Pass — Bright 250-nit IPS panel, webcam privacy shutter intact.',
        keyboardTrackpad: 'Pass — Spill-resistant backlit keyboard tested.',
        portsConnectivity: 'Pass — 2x USB-C Thunderbolt, 2x USB-A, HDMI 1.4b verified.',
        thermalsFan: 'Pass — Normal thermal profile.',
        batteryHealthReport: '85% capacity verified via HP Support Assistant.',
        storageSmartHealth: '96% SMART health.',
        overallVerdict: 'Certified Grade-A Ready for Sale',
        passed: true,
      },
    },
    {
      deviceCode: 'REF-2026-004',
      slug: 'refurb-apple-macbook-pro-a2289-m1-8gb-256gb',
      title: 'Apple MacBook Air 13" M1 (A2337 / Apple M1 8-Core / 8GB / 256GB SSD — Space Grey)',
      brand: 'Apple',
      model: 'MacBook Air M1 A2337',
      serialNumber: 'FVFF84Q2Q6L4',
      processor: 'Apple M1 Chip (8-Core CPU / 7-Core GPU)',
      ram: '8GB Unified Memory',
      storage: '256GB Apple PCIe SSD',
      display: '13.3" Retina True Tone (2560x1600)',
      osInstalled: 'macOS Sequoia',
      batteryHealthPct: 91,
      batteryCycles: 112,
      conditionGrade: ConditionGrade.GRADE_A_EXCELLENT,
      cosmeticNotes: 'Zero dents on corners; oleophobic Retina coating intact.',
      workPerformed: 'Apple Diagnostics (ADP000 No Issues), sanitized, paired with original 30W USB-C adapter.',
      warrantyMonths: 6,
      warrantyTerms: "6-Month Kiran's Infotech Store Warranty",
      acquisitionSource: 'Customer Direct Trade-In',
      acquisitionCost: 37000,
      refurbishmentCost: 1200,
      sellingPrice: 46900,
      status: RefurbishedStatus.PUBLISHED,
      featured: true,
      imageUrls: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80'],
      inspection: {
        inspectorName: 'Suresh K. (Lead Hardware Tech)',
        screenCheck: 'Pass — True Tone Retina display flawless.',
        keyboardTrackpad: 'Pass — Magic Keyboard & Touch ID sensor verified.',
        portsConnectivity: 'Pass — Both Thunderbolt / USB 4 ports & 3.5mm jack verified.',
        thermalsFan: 'Pass — Fanless M1 thermal envelope nominal.',
        batteryHealthReport: '91% Maximum Capacity (112 cycles, Normal condition).',
        storageSmartHealth: '99% Apple SSD life remaining.',
        overallVerdict: 'Certified Grade-A Ready for Sale',
        passed: true,
      },
    },
    {
      deviceCode: 'REF-2026-005',
      slug: 'refurb-dell-latitude-7400-i7-8th-16gb-256gb',
      title: 'Dell Latitude 7400 Ultrabook (Core i7-8665U / 16GB / 256GB NVMe)',
      brand: 'Dell',
      model: 'Latitude 7400',
      serialNumber: '3J9P203',
      processor: 'Intel Core i7-8665U',
      ram: '16GB DDR4',
      storage: '256GB NVMe SSD',
      display: '14.0" FHD Anti-Glare',
      batteryHealthPct: 81,
      batteryCycles: 230,
      conditionGrade: ConditionGrade.GRADE_B_GOOD,
      cosmeticNotes: 'Light surface wear on top lid and slight shine on spacebar; 100% hardware functionality.',
      workPerformed: 'New CMOS coin battery, hinge torque adjustment, thermal paste replacement.',
      warrantyMonths: 6,
      warrantyTerms: "6-Month Kiran's Infotech Hardware Carry-In Warranty",
      acquisitionSource: 'Corporate Lease Return',
      acquisitionCost: 16500,
      refurbishmentCost: 1800,
      sellingPrice: 24500,
      status: RefurbishedStatus.PUBLISHED,
      featured: false,
      imageUrls: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80'],
      inspection: {
        inspectorName: 'Mahesh R. (Diagnostics Tech)',
        screenCheck: 'Pass — Even backlight, no dead pixels.',
        keyboardTrackpad: 'Pass — All keys responsive.',
        portsConnectivity: 'Pass — Thunderbolt 3, HDMI, USB 3.1 verified.',
        thermalsFan: 'Pass — Max 76°C.',
        batteryHealthReport: '81% capacity remaining (~4.5 hours office work).',
        storageSmartHealth: '94% SMART health.',
        overallVerdict: 'Certified Grade-B Value Pick',
        passed: true,
      },
    },
    {
      deviceCode: 'REF-2026-006',
      slug: 'refurb-lenovo-thinkpad-l14-gen2-ryzen5-pro',
      title: 'Lenovo ThinkPad L14 Gen 2 (AMD Ryzen 5 PRO 5650U / 16GB / 512GB NVMe)',
      brand: 'Lenovo',
      model: 'ThinkPad L14 Gen 2',
      serialNumber: 'MP24X89A',
      processor: 'AMD Ryzen 5 PRO 5650U (6 Cores, 12 Threads)',
      ram: '16GB DDR4 3200MHz',
      storage: '512GB PCIe NVMe SSD',
      display: '14.0" FHD IPS',
      batteryHealthPct: 94,
      batteryCycles: 74,
      conditionGrade: ConditionGrade.GRADE_A_EXCELLENT,
      cosmeticNotes: 'Clean condition, minimal usage marks.',
      workPerformed: 'RAM upgraded from 8GB to 16GB, full burn-in test completed.',
      warrantyMonths: 6,
      warrantyTerms: "6-Month Kiran's Infotech Hardware Carry-In Warranty",
      acquisitionSource: 'IT Startup Liquidation',
      acquisitionCost: 22000,
      refurbishmentCost: 1900,
      sellingPrice: 31900,
      status: RefurbishedStatus.PUBLISHED,
      featured: false,
      imageUrls: ['https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=900&q=80'],
      inspection: {
        inspectorName: 'Suresh K. (Lead Hardware Tech)',
        screenCheck: 'Pass — 100% sRGB check & uniform brightness.',
        keyboardTrackpad: 'Pass — TrackPoint & dual click buttons verified.',
        portsConnectivity: 'Pass — USB-C, HDMI 2.0, Ethernet verified.',
        thermalsFan: 'Pass — Runs cool at 68°C peak.',
        batteryHealthReport: '94% original capacity.',
        storageSmartHealth: '99% health.',
        overallVerdict: 'Certified Grade-A Ready for Sale',
        passed: true,
      },
    },
    {
      deviceCode: 'REF-2026-007',
      slug: 'refurb-hp-probook-440-g8-i5-11th-under-refurb',
      title: 'HP ProBook 440 G8 (Core i5-1135G7 / 16GB / 512GB SSD)',
      brand: 'HP',
      model: 'ProBook 440 G8',
      serialNumber: '5CD1294LPQ',
      processor: 'Intel Core i5-1135G7',
      ram: '16GB DDR4',
      storage: '512GB NVMe SSD',
      display: '14.0" FHD IPS',
      batteryHealthPct: 78,
      batteryCycles: 280,
      conditionGrade: ConditionGrade.GRADE_B_GOOD,
      cosmeticNotes: 'Awaiting new OEM palmrest assembly in workshop.',
      workPerformed: 'Currently in refurbishment bay for battery and palmrest upgrade.',
      warrantyMonths: 6,
      warrantyTerms: "6-Month Kiran's Infotech Hardware Carry-In Warranty",
      acquisitionSource: 'Customer Direct Buyback',
      acquisitionCost: 18500,
      refurbishmentCost: 2800,
      sellingPrice: 27900,
      status: RefurbishedStatus.REFURBISHMENT,
      featured: false,
      imageUrls: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80'],
      inspection: {
        inspectorName: 'Mahesh R. (Diagnostics Tech)',
        screenCheck: 'Pass',
        keyboardTrackpad: 'Scheduled for palmrest replacement',
        portsConnectivity: 'Pass',
        thermalsFan: 'Pass',
        batteryHealthReport: '78% — scheduled for new OEM battery',
        storageSmartHealth: '100% Pass',
        overallVerdict: 'In Refurbishment Stage before Quality Check',
        passed: true,
      },
    },
    {
      deviceCode: 'REF-2026-008',
      slug: 'refurb-dell-latitude-5410-i5-10th-sold',
      title: 'Dell Latitude 5410 (Core i5-10210U / 16GB / 512GB NVMe)',
      brand: 'Dell',
      model: 'Latitude 5410',
      serialNumber: '9K4L112',
      processor: 'Intel Core i5-10210U',
      ram: '16GB DDR4',
      storage: '512GB NVMe SSD',
      display: '14.0" FHD Anti-Glare',
      batteryHealthPct: 88,
      batteryCycles: 130,
      conditionGrade: ConditionGrade.GRADE_A_EXCELLENT,
      cosmeticNotes: 'Clean Grade-A unit (Sold).',
      workPerformed: 'Full 40-point certification completed.',
      warrantyMonths: 6,
      warrantyTerms: "6-Month Kiran's Infotech Hardware Carry-In Warranty",
      acquisitionSource: 'Corporate Lease Return',
      acquisitionCost: 19000,
      refurbishmentCost: 1500,
      sellingPrice: 27500,
      status: RefurbishedStatus.SOLD,
      featured: false,
      imageUrls: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80'],
      inspection: {
        inspectorName: 'Suresh K. (Lead Hardware Tech)',
        screenCheck: 'Pass',
        keyboardTrackpad: 'Pass',
        portsConnectivity: 'Pass',
        thermalsFan: 'Pass',
        batteryHealthReport: '88% capacity',
        storageSmartHealth: '98% health',
        overallVerdict: 'Certified Grade-A (Sold)',
        passed: true,
      },
    },
  ];

  const createdRefurbished = [];
  for (const r of refurbishedSeeds) {
    const { inspection, ...deviceData } = r;
    const dev = await prisma.refurbishedDevice.create({
      data: {
        ...deviceData,
        isDemo: true,
        inspections: {
          create: [inspection],
        },
      },
    });
    createdRefurbished.push(dev);
  }

  // 6. Service Categories & 10 Hardware Services
  const [laptopSvcCat, desktopSvcCat, upgradeSvcCat, printerSvcCat] = await Promise.all([
    prisma.serviceCategory.create({
      data: { name: 'Laptop Repair & Maintenance', slug: 'laptop-repair', description: 'Chip-level motherboard repair, screen/hinge replacement, and thermal servicing.', iconName: 'Laptop', sortOrder: 1 },
    }),
    prisma.serviceCategory.create({
      data: { name: 'Desktop & Workstation Service', slug: 'desktop-service', description: 'SMPS, motherboard, graphics card diagnostics, and custom PC assembly.', iconName: 'Cpu', sortOrder: 2 },
    }),
    prisma.serviceCategory.create({
      data: { name: 'SSD & RAM Performance Upgrades', slug: 'hardware-upgrades', description: 'Same-day NVMe/SATA SSD upgrades, OS cloning, and dual-channel RAM installation.', iconName: 'HardDrive', sortOrder: 3 },
    }),
    prisma.serviceCategory.create({
      data: { name: 'Printer Repair & Troubleshooting', slug: 'printer-repair', description: 'LaserJet fuser/pickup roller repair and ink-tank head cleaning.', iconName: 'Printer', sortOrder: 4 },
    }),
  ]);

  const serviceSeeds = [
    {
      categoryId: laptopSvcCat.id,
      slug: 'laptop-hardware-repair-diagnostics',
      title: 'Laptop Chip-Level Motherboard & Power Repair',
      shortSummary: 'Dead laptop recovery, charging IC repair, liquid damage cleaning, and power rail diagnostics.',
      description: 'Comprehensive schematic-assisted motherboard diagnostics and BGA/SMD component repair for Dell, HP, Lenovo, ASUS, Acer, and Apple MacBooks.',
      iconName: 'Wrench',
      pricingType: ServicePricingType.STARTING_FROM,
      basePrice: 1200,
      estimatedTurnaround: '2–4 Business Days',
      featured: true,
    },
    {
      categoryId: laptopSvcCat.id,
      slug: 'laptop-screen-hinge-keyboard-replacement',
      title: 'Laptop Screen, Hinge & Keyboard Replacement',
      shortSummary: 'Genuine FHD/QHD IPS display panels, backlit keyboards, and broken hinge fabrication.',
      description: 'Fast replacement of cracked laptop screens, worn keyboards, and broken brass hinge mounts using OEM-grade components with 90-day warranty.',
      iconName: 'Monitor',
      pricingType: ServicePricingType.STARTING_FROM,
      basePrice: 1500,
      estimatedTurnaround: 'Same Day – 24 Hours',
      featured: true,
    },
    {
      categoryId: laptopSvcCat.id,
      slug: 'laptop-thermal-maintenance-cleaning',
      title: 'Laptop Preventive Thermal Servicing & Overheating Fix',
      shortSummary: 'Ultrasonic heatsink cleaning, fan lubrication, and high-conductivity thermal paste application.',
      description: 'Drops CPU/GPU temperatures by 10–18°C, stops thermal throttling, and eliminates loud fan noise.',
      iconName: 'Thermometer',
      pricingType: ServicePricingType.FIXED,
      basePrice: 799,
      estimatedTurnaround: '2–3 Hours (Same Day)',
      featured: true,
    },
    {
      categoryId: upgradeSvcCat.id,
      slug: 'hdd-to-ssd-upgrade-with-os-migration',
      title: 'HDD to SSD Upgrade with Lossless OS & Data Cloning',
      shortSummary: 'Convert slow mechanical hard drive laptops to fast SATA or NVMe SSDs without losing files.',
      description: 'Includes compatibility check, SSD installation, full Windows/partition cloning, TRIM optimization, and converting your old HDD into an external USB drive.',
      iconName: 'Zap',
      pricingType: ServicePricingType.FIXED,
      basePrice: 599,
      estimatedTurnaround: '2 Hours (Same Day)',
      featured: true,
    },
    {
      categoryId: upgradeSvcCat.id,
      slug: 'ram-memory-upgrade-installation',
      title: 'Laptop & Desktop RAM Upgrade & MemTest86 Validation',
      shortSummary: 'DDR4/DDR5 dual-channel memory upgrade with full stability verification.',
      description: 'We match exact JEDEC/XMP frequency and rank timings to guarantee zero blue-screen errors and maximum dual-channel bandwidth.',
      iconName: 'Cpu',
      pricingType: ServicePricingType.FIXED,
      basePrice: 350,
      estimatedTurnaround: '45 Minutes',
      featured: false,
    },
    {
      categoryId: upgradeSvcCat.id,
      slug: 'nvme-ssd-fresh-installation-windows-setup',
      title: 'M.2 NVMe SSD Installation & Clean OS Configuration',
      shortSummary: 'Install PCIe Gen3/Gen4 NVMe SSD with OEM driver calibration and BIOS update.',
      description: 'Ideal for adding secondary high-speed storage or performing a clean factory-fresh OS setup.',
      iconName: 'HardDrive',
      pricingType: ServicePricingType.FIXED,
      basePrice: 499,
      estimatedTurnaround: '1–2 Hours',
      featured: false,
    },
    {
      categoryId: upgradeSvcCat.id,
      slug: 'hdd-replacement-data-transfer',
      title: 'Failing HDD Replacement & Accessible Data Transfer',
      shortSummary: 'Replace clicking or SMART-failing hard drives and migrate readable user folders.',
      description: 'Prevents catastrophic data loss when SMART warnings appear by cloning readable sectors to a new drive.',
      iconName: 'Database',
      pricingType: ServicePricingType.STARTING_FROM,
      basePrice: 899,
      estimatedTurnaround: '24 Hours',
      featured: false,
    },
    {
      categoryId: desktopSvcCat.id,
      slug: 'desktop-cpu-hardware-repair',
      title: 'Desktop / CPU No-Display, SMPS & Motherboard Repair',
      shortSummary: 'Full tower and SFF desktop troubleshooting, PSU testing, and component replacement.',
      description: 'Covers boot loops, beep codes, faulty RAM slots, dead power supplies, and workstation graphics diagnostics.',
      iconName: 'Server',
      pricingType: ServicePricingType.STARTING_FROM,
      basePrice: 650,
      estimatedTurnaround: '24–48 Hours',
      featured: true,
    },
    {
      categoryId: printerSvcCat.id,
      slug: 'laserjet-inktank-printer-repair',
      title: 'LaserJet & Ink-Tank Printer Hardware Repair',
      shortSummary: 'Paper jam fix, fuser film replacement, Teflon sleeve repair, and ink-system purging.',
      description: 'Expert servicing for HP LaserJet, Canon LBP/imageCLASS, and Epson/HP/Brother ink-tank multifunction printers.',
      iconName: 'Printer',
      pricingType: ServicePricingType.STARTING_FROM,
      basePrice: 699,
      estimatedTurnaround: '1–2 Business Days',
      featured: true,
    },
    {
      categoryId: printerSvcCat.id,
      slug: 'printer-network-driver-troubleshooting',
      title: 'Printer Connectivity, Scanner & Print-Quality Troubleshooting',
      shortSummary: 'Resolve faded prints, horizontal lines, Wi-Fi spooler drops, and SMB network scanning.',
      description: 'Complete roller cleaning, printhead alignment, firmware recovery, and multi-PC office sharing setup.',
      iconName: 'Settings',
      pricingType: ServicePricingType.FIXED,
      basePrice: 450,
      estimatedTurnaround: 'Same Day',
      featured: false,
    },
  ];

  const createdServices = [];
  for (const s of serviceSeeds) {
    const svc = await prisma.service.create({
      data: { ...s, isDemo: true },
    });
    createdServices.push(svc);
  }

  // 7. Repair Bookings (8 Demo Bookings with status histories & quotations)
  const repairBookingSeeds = [
    {
      reference: 'REP-20261117-A101',
      customer: customers[0],
      service: createdServices[0],
      deviceType: 'Laptop',
      brand: 'Dell',
      model: 'Inspiron 5502',
      serialNumber: '7M8K912',
      issueCategory: 'Power / No Boot',
      issueDescription: 'Laptop does not power on when pressing power button; charging LED blinks amber 3 times.',
      diagnosticSummary: 'Shorted 19V main power rail capacitor near DC-in MOSFET; battery healthy.',
      internalNotes: 'Technician Ramesh: Replace 2x 10uF 25V MLCC caps on PQ301 rail. Parts cost ₹180.',
      status: RepairBookingStatus.QUOTATION_SENT,
      updates: [
        { status: RepairBookingStatus.SUBMITTED, customerVisibleMessage: 'Repair booking received and logged at Kiran’s Infotech service desk.', internalNote: 'Intake completed.' },
        { status: RepairBookingStatus.DIAGNOSING, customerVisibleMessage: 'Device assigned to senior motherboard technician for power-rail diagnostics.', internalNote: 'Bench #2.' },
        { status: RepairBookingStatus.QUOTATION_SENT, customerVisibleMessage: 'Diagnosis complete: 19V input rail short identified. Repair quotation prepared for your approval.', internalNote: 'Waiting for Rahul approval before soldering.' },
      ],
      quotation: {
        quotationNumber: 'QUO-20261117-A101',
        diagnosisDetails: '19V primary power rail short-circuit repair + preventive thermal repaste.',
        partsBreakdownJson: JSON.stringify([
          { item: 'Power Rail SMD Capacitor & MOSFET Kit', cost: 650 },
          { item: 'Arctic MX-6 Thermal Compound', cost: 250 },
        ]),
        partsCost: 900,
        labourCost: 1100,
        taxAmount: 360,
        totalAmount: 2360,
        status: QuotationStatus.PENDING_APPROVAL,
      },
    },
    {
      reference: 'REP-20261117-A102',
      customer: customers[0],
      service: createdServices[3],
      deviceType: 'Laptop',
      brand: 'HP',
      model: 'Pavilion 15-ec',
      serialNumber: '5CD0192XYZ',
      issueCategory: 'SSD & RAM Upgrade',
      issueDescription: 'Need 500GB SSD upgrade and Windows cloning from existing 1TB HDD.',
      diagnosticSummary: 'M.2 NVMe slot verified free; cloned OS to Crucial 500GB SSD.',
      internalNotes: 'Completed in 90 mins.',
      status: RepairBookingStatus.COMPLETED,
      updates: [
        { status: RepairBookingStatus.SUBMITTED, customerVisibleMessage: 'Upgrade booking logged.', internalNote: null },
        { status: RepairBookingStatus.IN_REPAIR, customerVisibleMessage: 'SSD installed and OS cloning in progress.', internalNote: null },
        { status: RepairBookingStatus.COMPLETED, customerVisibleMessage: 'Upgrade completed and verified. Boot time reduced from 78s to 9s.', internalNote: 'Delivered to customer.' },
      ],
    },
    {
      reference: 'REP-20261117-A103',
      customer: customers[1],
      service: createdServices[1],
      deviceType: 'Laptop',
      brand: 'Lenovo',
      model: 'ThinkPad E14 Gen 2',
      serialNumber: 'PF2X9910',
      issueCategory: 'Screen & Hinge',
      issueDescription: 'Left hinge feels stiff and bottom bezel is separating slightly when opening lid.',
      diagnosticSummary: 'Brass insert nut detached from A-cover; requires epoxy reinforcement and hinge torque loosening.',
      internalNotes: 'Common E14 hinge mount repair.',
      status: RepairBookingStatus.IN_REPAIR,
      updates: [
        { status: RepairBookingStatus.SUBMITTED, customerVisibleMessage: 'Booking created.', internalNote: null },
        { status: RepairBookingStatus.APPROVED, customerVisibleMessage: 'Estimate approved by customer. Hinge reinforcement started.', internalNote: 'Curing 12h.' },
        { status: RepairBookingStatus.IN_REPAIR, customerVisibleMessage: 'Hinge mount rebuilt and tension calibrated; undergoing open/close stress test.', internalNote: null },
      ],
    },
    {
      reference: 'REP-20261117-A104',
      customer: customers[2],
      service: createdServices[8],
      deviceType: 'Printer',
      brand: 'HP',
      model: 'LaserJet M1005 MFP',
      serialNumber: 'CNF1K22910',
      issueCategory: 'Paper Jam / Fuser',
      issueDescription: 'Paper jams halfway near rear exit roller and makes grinding sound.',
      diagnosticSummary: 'Torn fuser Teflon sleeve and worn pickup roller pad.',
      internalNotes: 'Standard M1005 fuser kit in stock.',
      status: RepairBookingStatus.READY_FOR_PICKUP,
      updates: [
        { status: RepairBookingStatus.SUBMITTED, customerVisibleMessage: 'Printer logged for inspection.', internalNote: null },
        { status: RepairBookingStatus.IN_REPAIR, customerVisibleMessage: 'Replacing fuser Teflon sleeve and pickup roller.', internalNote: null },
        { status: RepairBookingStatus.READY_FOR_PICKUP, customerVisibleMessage: 'Printer tested with 25-page continuous print job. Ready for collection.', internalNote: 'Shelf B3.' },
      ],
    },
    {
      reference: 'REP-20261117-A105',
      customer: customers[3],
      service: createdServices[2],
      deviceType: 'Laptop',
      brand: 'ASUS',
      model: 'TUF Gaming F15',
      serialNumber: 'M6NRKD00192',
      issueCategory: 'Overheating / Fan Noise',
      issueDescription: 'CPU hits 95C during work and right fan rattles.',
      diagnosticSummary: 'Heatsink fins clogged with dust; right GPU fan bearing worn.',
      internalNotes: 'Order OEM 5V fan.',
      status: RepairBookingStatus.DIAGNOSING,
      updates: [
        { status: RepairBookingStatus.SUBMITTED, customerVisibleMessage: 'Service request submitted.', internalNote: null },
        { status: RepairBookingStatus.DIAGNOSING, customerVisibleMessage: 'Thermal inspection underway.', internalNote: 'Checking fan part number.' },
      ],
    },
    {
      reference: 'REP-20261117-A106',
      customer: customers[4],
      service: createdServices[7],
      deviceType: 'Desktop',
      brand: 'Custom PC',
      model: 'Core i5 Office Tower',
      serialNumber: 'KI-PC-882',
      issueCategory: 'No Display / Boot Loop',
      issueDescription: 'Fans spin for 5 seconds then restart repeatedly, no signal on monitor.',
      diagnosticSummary: null,
      internalNotes: 'Just dropped off.',
      status: RepairBookingStatus.SUBMITTED,
      updates: [
        { status: RepairBookingStatus.SUBMITTED, customerVisibleMessage: 'Repair booking registered. Technician will inspect within 4 business hours.', internalNote: null },
      ],
    },
    {
      reference: 'REP-20261117-A107',
      customer: customers[5],
      service: createdServices[4],
      deviceType: 'Laptop',
      brand: 'Dell',
      model: 'Vostro 3510',
      serialNumber: '4P2M881',
      issueCategory: 'RAM Upgrade',
      issueDescription: 'Upgrade from 8GB to 16GB DDR4.',
      diagnosticSummary: 'Installed Crucial 8GB DDR4 3200MHz module; passed MemTest86.',
      internalNotes: null,
      status: RepairBookingStatus.COMPLETED,
      updates: [
        { status: RepairBookingStatus.SUBMITTED, customerVisibleMessage: 'Booking received.', internalNote: null },
        { status: RepairBookingStatus.COMPLETED, customerVisibleMessage: '16GB dual-channel upgrade completed.', internalNote: null },
      ],
    },
    {
      reference: 'REP-20261117-A108',
      customer: customers[6],
      service: createdServices[9],
      deviceType: 'Printer',
      brand: 'Epson',
      model: 'EcoTank L3150',
      serialNumber: 'X5EY019283',
      issueCategory: 'Print Quality',
      issueDescription: 'Black ink missing lines even after standard head clean.',
      diagnosticSummary: 'Air lock in black damper tube purged; nozzle check 100%.',
      internalNotes: null,
      status: RepairBookingStatus.QUALITY_TESTING,
      updates: [
        { status: RepairBookingStatus.SUBMITTED, customerVisibleMessage: 'Printer received.', internalNote: null },
        { status: RepairBookingStatus.QUALITY_TESTING, customerVisibleMessage: 'Ink damper purged; running 24-hour printhead rest test.', internalNote: null },
      ],
    },
  ];

  for (const rb of repairBookingSeeds) {
    await prisma.repairBooking.create({
      data: {
        reference: rb.reference,
        customerId: rb.customer.id,
        serviceId: rb.service.id,
        customerName: rb.customer.name,
        customerEmail: rb.customer.email,
        customerPhone: rb.customer.phone || '+919820100100',
        deviceType: rb.deviceType,
        brand: rb.brand,
        model: rb.model,
        serialNumber: rb.serialNumber,
        issueCategory: rb.issueCategory,
        issueDescription: rb.issueDescription,
        diagnosticSummary: rb.diagnosticSummary,
        internalNotes: rb.internalNotes,
        status: rb.status,
        isDemo: true,
        updates: {
          create: rb.updates.map((u) => ({
            status: u.status,
            customerVisibleMessage: u.customerVisibleMessage,
            internalNote: u.internalNote,
            actorId: adminUser.id,
          })),
        },
        ...(rb.quotation
          ? {
              quotations: {
                create: [rb.quotation],
              },
            }
          : {}),
      },
    });
  }

  // 8. Enquiries (10 Demo Enquiries)
  const enquirySeeds = [
    { ref: 'ENQ-20261117-B201', customer: customers[0], product: createdProducts[0], subject: 'Bulk quote for 5x Dell Latitude 3440', message: 'We are expanding our Pune office and need 5 units of Dell Latitude 3440 with GST invoice. Can you share corporate pricing?', status: EnquiryStatus.IN_PROGRESS, internalNotes: 'Offered ₹59,900/unit for 5+ qty.' },
    { ref: 'ENQ-20261117-B202', customer: customers[1], refurbished: createdRefurbished[0], subject: 'Battery backup & dock compatibility on ThinkPad T490', message: 'Is the ThinkPad T490REF-2026-001 available for in-store inspection today?', status: EnquiryStatus.NEW, internalNotes: null },
    { ref: 'ENQ-20261117-B203', customer: customers[2], product: createdProducts[8], subject: 'Samsung 990 EVO compatibility with HP Pavilion 15', message: 'Will the Samsung 990 EVO 1TB work in my HP Pavilion 15-ec1050AX?', status: EnquiryStatus.FOLLOWED_UP, internalNotes: 'Confirmed M.2 2280 NVMe slot compatibility.' },
    { ref: 'ENQ-20261117-B204', customer: customers[3], product: createdProducts[6], subject: 'Dual Dell P2422H monitor setup with USB-C hub', message: 'Looking for two Dell 24-inch IPS monitors plus a dual-HDMI dock.', status: EnquiryStatus.CONVERTED, internalNotes: 'Converted to Order ORD-20261117-C304.' },
    { ref: 'ENQ-20261117-B205', customer: customers[4], service: createdServices[3], subject: 'Same-day SSD upgrade for office desktop', message: 'Can I bring our accounting desktop at 11 AM and collect by evening?', status: EnquiryStatus.FOLLOWED_UP, internalNotes: 'Slot confirmed.' },
    { ref: 'ENQ-20261117-B206', customer: customers[5], product: createdProducts[12], subject: '16GB DDR4 RAM installation charges', message: 'If I buy the Crucial 16GB DDR4 RAM from your store, is installation included?', status: EnquiryStatus.CLOSED, internalNotes: 'Informed free installation on in-store RAM purchase.' },
    { ref: 'ENQ-20261117-B207', customer: customers[6], refurbished: createdRefurbished[3], subject: 'MacBook Air M1 cycle count verification', message: 'Does the MacBook Air M1 come with original Apple 30W charger?', status: EnquiryStatus.NEW, internalNotes: null },
    { ref: 'ENQ-20261117-B208', customer: customers[7], product: createdProducts[17], subject: 'HP LaserJet M126nw toner availability', message: 'Do you also stock original HP 88A toner cartridges?', status: EnquiryStatus.IN_PROGRESS, internalNotes: 'Checking bundle price.' },
    { ref: 'ENQ-20261117-B209', customer: customers[8], product: createdProducts[5], subject: 'Custom workstation GPU customization', message: 'Can we add an RTX 4060 8GB to the Kiran ProBuild WS-1470 workstation?', status: EnquiryStatus.NEW, internalNotes: null },
    { ref: 'ENQ-20261117-B210', customer: customers[9], service: createdServices[0], subject: 'MacBook Pro liquid spill check', message: 'Spilled coffee near trackpad yesterday; powered off immediately. Can you inspect?', status: EnquiryStatus.FOLLOWED_UP, internalNotes: 'Advised immediate drop-off without plugging charger.' },
  ];

  for (const eq of enquirySeeds) {
    await prisma.enquiry.create({
      data: {
        reference: eq.ref,
        customerId: eq.customer.id,
        productId: eq.product?.id ?? null,
        refurbishedDeviceId: eq.refurbished?.id ?? null,
        serviceId: eq.service?.id ?? null,
        subject: eq.subject,
        message: eq.message,
        contactPhone: eq.customer.phone,
        status: eq.status,
        internalNotes: eq.internalNotes,
        isDemo: true,
      },
    });
  }

  // 9. Orders (10 Demo Orders with price snapshots)
  const orderSeeds = [
    { ref: 'ORD-20261117-C301', customer: customers[0], product: createdProducts[8], qty: 2, status: OrderStatus.COMPLETED, paymentStatus: PaymentStatus.PAID, fulfilment: FulfilmentType.STORE_PICKUP },
    { ref: 'ORD-20261117-C302', customer: customers[0], product: createdProducts[12], qty: 2, status: OrderStatus.PENDING_CONFIRMATION, paymentStatus: PaymentStatus.PENDING, fulfilment: FulfilmentType.DELIVERY },
    { ref: 'ORD-20261117-C303', customer: customers[1], product: createdProducts[0], qty: 1, status: OrderStatus.CONFIRMED, paymentStatus: PaymentStatus.PAID, fulfilment: FulfilmentType.DELIVERY },
    { ref: 'ORD-20261117-C304', customer: customers[3], product: createdProducts[6], qty: 2, status: OrderStatus.COMPLETED, paymentStatus: PaymentStatus.PAID, fulfilment: FulfilmentType.DELIVERY },
    { ref: 'ORD-20261117-C305', customer: customers[2], product: createdProducts[9], qty: 1, status: OrderStatus.READY_FOR_PICKUP, paymentStatus: PaymentStatus.PENDING, fulfilment: FulfilmentType.STORE_PICKUP },
    { ref: 'ORD-20261117-C306', customer: customers[4], product: createdProducts[14], qty: 3, status: OrderStatus.COMPLETED, paymentStatus: PaymentStatus.PAID, fulfilment: FulfilmentType.STORE_PICKUP },
    { ref: 'ORD-20261117-C307', customer: customers[5], product: createdProducts[18], qty: 1, status: OrderStatus.PROCESSING, paymentStatus: PaymentStatus.PARTIALLY_PAID, fulfilment: FulfilmentType.DELIVERY },
    { ref: 'ORD-20261117-C308', customer: customers[6], product: createdProducts[19], qty: 1, status: OrderStatus.COMPLETED, paymentStatus: PaymentStatus.PAID, fulfilment: FulfilmentType.DELIVERY },
    { ref: 'ORD-20261117-C309', customer: customers[7], product: createdProducts[2], qty: 1, status: OrderStatus.PENDING_CONFIRMATION, paymentStatus: PaymentStatus.PENDING, fulfilment: FulfilmentType.STORE_PICKUP },
    { ref: 'ORD-20261117-C310', customer: customers[8], product: createdProducts[4], qty: 1, status: OrderStatus.CONFIRMED, paymentStatus: PaymentStatus.PAID, fulfilment: FulfilmentType.DELIVERY },
  ];

  for (const ord of orderSeeds) {
    const unitPrice = Number(ord.product.sellingPrice);
    const lineTotal = unitPrice * ord.qty;
    const subtotal = Math.round((lineTotal / 1.18) * 100) / 100;
    const taxAmount = Math.round((lineTotal - subtotal) * 100) / 100;

    await prisma.order.create({
      data: {
        reference: ord.ref,
        customerId: ord.customer.id,
        status: ord.status,
        paymentStatus: ord.paymentStatus,
        fulfilmentType: ord.fulfilment,
        subtotal,
        discountAmount: 0,
        taxAmount,
        totalAmount: lineTotal,
        shippingRecipient: ord.customer.name,
        shippingPhone: ord.customer.phone || '+919820100100',
        shippingAddressText: 'Tech Park Road, Pune, Maharashtra - 411038',
        isDemo: true,
        items: {
          create: [
            {
              productId: ord.product.id,
              itemType: 'PRODUCT',
              productName: ord.product.name,
              productSku: ord.product.sku,
              unitPrice,
              costPriceSnapshot: Number(ord.product.costPrice),
              quantity: ord.qty,
              lineTotal,
            },
          ],
        },
        payments: {
          create: [
            {
              provider: 'OFFLINE_OR_PAY_AT_STORE',
              amount: lineTotal,
              status: ord.paymentStatus,
              paidAt: ord.paymentStatus === PaymentStatus.PAID ? new Date() : null,
            },
          ],
        },
      },
    });
  }

  // 10. Used-Device Submissions (Customer Sell-to-Us Requests)
  await prisma.usedDeviceSubmission.createMany({
    data: [
      {
        reference: 'SELL-20261117-D401',
        customerId: customers[0].id,
        brand: 'Dell',
        model: 'Latitude 5400',
        processor: 'Intel Core i5-8365U',
        ram: '8GB DDR4',
        storage: '256GB SSD',
        ageMonths: 38,
        conditionSummary: 'Good working condition, original charger included, minor lid scratches.',
        knownIssues: 'Battery lasts around 2.5 hours.',
        expectedPrice: 15000,
        offeredPrice: 13500,
        contactPhone: customers[0].phone || '+919820100101',
        status: UsedDeviceSubmissionStatus.OFFER_MADE,
        adminNotes: 'Clean corporate model, good candidate for 16GB/512GB refurbishment.',
        isDemo: true,
      },
      {
        reference: 'SELL-20261117-D402',
        customerId: customers[1].id,
        brand: 'HP',
        model: 'EliteBook 840 G6',
        processor: 'Intel Core i7-8565U',
        ram: '16GB DDR4',
        storage: '512GB NVMe',
        ageMonths: 34,
        conditionSummary: 'Excellent condition, used on desk with external keyboard.',
        knownIssues: 'None',
        expectedPrice: 21000,
        contactPhone: customers[1].phone || '+919820100102',
        status: UsedDeviceSubmissionStatus.SUBMITTED,
        isDemo: true,
      },
    ],
  });

  // 11. Site Content (Admin-editable Homepage & Business Configuration)
  const siteContents = [
    {
      key: 'hero_banner',
      title: 'Homepage Hero Configuration',
      contentJson: JSON.stringify({
        badge: 'Authorized Hardware Sales • Certified Refurbished • Chip-Level Service Lab',
        headline: 'Enterprise-Grade Computers, Certified Refurbished Laptops & Precision Hardware Repairs.',
        subheadline:
          'From brand-new business laptops and NVMe/RAM upgrades to 40-point inspected refurbished notebooks and transparent chip-level repairs — backed by Kiran’s Infotech warranty.',
        primaryCtaText: 'Explore Hardware Catalogue',
        primaryCtaHref: '/products',
        secondaryCtaText: 'Book a Hardware Repair',
        secondaryCtaHref: '/services#book-repair',
      }),
    },
    {
      key: 'business_info',
      title: 'Business Contact & Showroom Details',
      contentJson: JSON.stringify({
        businessName: "Kiran's Infotech",
        tagline: 'Your Trusted Partner for Computer Sales, Refurbished Laptops & IT Hardware Care',
        phone: '+91 90000 00000',
        whatsappNumber: '919000000000',
        email: 'contact@kiransinfotech.example.com',
        address: 'Shop 14 & 15, Ground Floor, Sai Cyber Plaza, Kothrud, Pune, Maharashtra 411038 (Sample Demo Address)',
        operatingHours: 'Monday – Saturday: 10:00 AM – 8:30 PM | Sunday: 11:00 AM – 5:00 PM',
        gstNote: 'GST Tax Invoice available on eligible products & services (Subject to client policy confirmation)',
      }),
    },
    {
      key: 'why_choose_us',
      title: 'Why Choose Kiran’s Infotech',
      contentJson: JSON.stringify([
        {
          title: '40-Point Certified Refurbished Lab',
          description: 'Every refurbished ThinkPad, Latitude, EliteBook, and MacBook undergoes thermal stress testing, SMART storage verification, and battery health grading.',
        },
        {
          title: 'Transparent Repair Quotations',
          description: 'Track your repair live with a unique booking reference. We provide clear diagnosis and digital quotations before any chargeable work begins.',
        },
        {
          title: 'Genuine Components & Upgrade Advisory',
          description: 'Authorized SSDs, RAM modules, monitors, and peripherals with verified laptop compatibility and same-day installation.',
        },
        {
          title: 'Direct Used-Laptop Buyback',
          description: 'Upgrade your old laptop effortlessly—submit your device specs online for a fair technical evaluation and trade-in offer.',
        },
      ]),
    },
    {
      key: 'testimonials',
      title: 'Sample Customer Testimonials (Demo Data)',
      contentJson: JSON.stringify([
        {
          name: 'Rahul Sharma (Sample Review)',
          role: 'Founder, Sharma Design Studio',
          quote: 'Purchased 4 certified refurbished ThinkPads and upgraded our office workstations with 1TB NVMe SSDs. Zero downtime and transparent pricing.',
          rating: 5,
          isSample: true,
        },
        {
          name: 'Priya Patel (Sample Review)',
          role: 'Chartered Accountant',
          quote: 'Brought in a dead Dell Latitude that another shop said needed a full board replacement. Kiran’s Infotech repaired the power rail in 48 hours for a fraction of the cost.',
          rating: 5,
          isSample: true,
        },
        {
          name: 'Vikram Joshi (Sample Review)',
          role: 'Operations Manager',
          quote: 'The live repair tracking reference and digital quotation approval made managing our office printer and laptop servicing effortless.',
          rating: 5,
          isSample: true,
        },
      ]),
    },
  ];

  for (const sc of siteContents) {
    await prisma.siteContent.create({
      data: {
        ...sc,
        published: true,
        updatedBy: adminUser.id,
      },
    });
  }
}

async function main() {
  await ensurePostgresAvailable();
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    await seedDatabase(prisma);
    console.log('✅ Kiran’s Infotech demo seed completed successfully.');
  } finally {
    await prisma.$disconnect();
    await stopEmbeddedPostgres();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
}
