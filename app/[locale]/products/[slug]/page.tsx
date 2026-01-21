'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart';
import { useTranslations } from 'next-intl';

// Product data - will be moved to database
const mockProducts: Record<string, {
  id: string;
  sku: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string;
  mainImage: string | null;
  images: string[];
  price: number;
  compareAtPrice: number | null;
  currency: 'PLN' | 'EUR';
  stock: number;
  category: string;
  type: string;
  specifications: { label: string; value: string }[];
}> = {
  // ==================== SMART BATTERY ====================
  '09-017-00064': {
    id: '09-017-00064',
    sku: '09-017-00064',
    slug: '09-017-00064',
    name: 'XAG Smart Battery B13970S',
    tagline: 'High-capacity smart battery for P150 series',
    description: `The XAG B13970S Smart Battery is a high-capacity lithium polymer battery designed for XAG P150 agricultural drones. Features intelligent battery management system for optimal performance and longevity.

Key Features:
- High energy density for extended flight time
- Smart battery management system (BMS)
- Real-time status monitoring
- Temperature protection
- Compatible with XAG P150 series drones`,
    mainImage: '/images/products/smart-battery/09-017-00064-1.jpg',
    images: [
      '/images/products/smart-battery/09-017-00064-1.jpg',
      '/images/products/smart-battery/09-017-00064-2.jpg',
    ],
    price: 743600,
    compareAtPrice: null,
    currency: 'PLN',
    stock: 0,
    category: 'Smart Battery',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '09-017-00064' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Compatibility', value: 'P150 Series' },
      { label: 'Battery Type', value: 'Lithium Polymer' },
    ],
  },
  '09-017-00025': {
    id: '09-017-00025',
    sku: '09-017-00025',
    slug: '09-017-00025',
    name: 'XAG Smart Battery B13960S',
    tagline: '20,000 mAh / 962 Wh - IP65 rated lithium polymer',
    description: `A lithium polymer smart battery designed for XAG agricultural drones, featuring 20,000 mAh capacity and 962 Wh energy output. The device supports intelligent battery management with IP65 weather resistance rating.

Key Features:
- 20,000 mAh high capacity
- 962 Wh energy output
- IP65 weather resistance
- Intelligent battery management
- Quick charge support
- Temperature monitoring`,
    mainImage: '/images/products/smart-battery/09-017-00025-1.png',
    images: [
      '/images/products/smart-battery/09-017-00025-1.png',
      '/images/products/smart-battery/09-017-00025-2.png',
      '/images/products/smart-battery/09-017-00025-3.png',
    ],
    price: 494000,
    compareAtPrice: 743600,
    currency: 'PLN',
    stock: 0,
    category: 'Smart Battery',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '09-017-00025' },
      { label: 'Capacity', value: '20,000 mAh' },
      { label: 'Energy', value: '962 Wh' },
      { label: 'Rated Output', value: '48.1V / 120A' },
      { label: 'Charging Voltage', value: '56.55V' },
      { label: 'Dimensions', value: '189 × 139 × 317 mm' },
      { label: 'Weight', value: '~6.7 kg' },
      { label: 'Operating Temp', value: '10°C to 45°C' },
      { label: 'IP Rating', value: 'IP65' },
      { label: 'Battery Type', value: 'Lithium Polymer' },
    ],
  },
  '01-027-01895': {
    id: '01-027-01895',
    sku: '01-027-01895',
    slug: '01-027-01895',
    name: 'B13960S Battery Outlet Socket',
    tagline: 'Battery outlet socket component',
    description: `Original XAG battery outlet socket component for B13960S smart batteries. Essential replacement part for maintaining your XAG drone battery system.

Features:
- Original XAG part
- Direct replacement for B13960S batteries
- High-quality construction
- Easy installation`,
    mainImage: '/images/products/smart-battery/01-027-01895-1.png',
    images: [
      '/images/products/smart-battery/01-027-01895-1.png',
      '/images/products/smart-battery/01-027-01895-2.png',
      '/images/products/smart-battery/01-027-01895-3.png',
    ],
    price: 57200,
    compareAtPrice: null,
    currency: 'PLN',
    stock: 0,
    category: 'Smart Battery',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '01-027-01895' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Compatibility', value: 'B13960S Battery' },
      { label: 'Type', value: 'Outlet Socket' },
    ],
  },
  '05-002-00759': {
    id: '05-002-00759',
    sku: '05-002-00759',
    slug: '05-002-00759',
    name: 'B13860S V4 Smart Battery PCBA',
    tagline: 'Smart battery control board',
    description: `XAG B13860S V4 Smart Battery PCBA (Printed Circuit Board Assembly). This is the control board component for smart batteries, essential for battery management functions.

Features:
- Original XAG component
- V4 revision with improved performance
- Complete PCBA assembly
- For B13860S battery systems`,
    mainImage: '/images/products/smart-battery/05-002-00759.jpg',
    images: [
      '/images/products/smart-battery/05-002-00759.jpg',
    ],
    price: 74100,
    compareAtPrice: null,
    currency: 'PLN',
    stock: 0,
    category: 'Smart Battery',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '05-002-00759' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Compatibility', value: 'B13860S Battery' },
      { label: 'Type', value: 'PCBA / Control Board' },
      { label: 'Version', value: 'V4' },
    ],
  },

  // ==================== BATTERY CHARGERS ====================
  'PC-PCK-10000': {
    id: 'PC-PCK-10000',
    sku: 'PC-PCK-10000',
    slug: 'PC-PCK-10000',
    name: 'XAG Parallel Charging Kit Combo',
    tagline: '6KW parallel charging kit with mounting bracket',
    description: `The XAG Parallel Charging Kit Combo is a complete solution for parallel battery charging. This bundle includes one 6KW capacity parallel charging kit and one mounting bracket for easy installation.

Package Includes:
- 1x XAG Parallel Charging Kit (6KW)
- 1x Mounting Bracket

Features:
- 6KW charging capacity
- Parallel charging capability
- Complete mounting solution
- Compatible with XAG battery systems`,
    mainImage: '/images/products/battery-chargers/pc-pck-10000-1.jpg',
    images: [
      '/images/products/battery-chargers/pc-pck-10000-1.jpg',
      '/images/products/battery-chargers/pc-pck-10000-2.jpg',
      '/images/products/battery-chargers/pc-pck-10000-3.jpg',
      '/images/products/battery-chargers/pc-pck-10000-4.jpg',
    ],
    price: 88400,
    compareAtPrice: 96200,
    currency: 'PLN',
    stock: 0,
    category: 'Battery Chargers',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: 'PC-PCK-10000' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Power', value: '6KW' },
      { label: 'Type', value: 'Parallel Charging Kit' },
      { label: 'Includes', value: 'Charging Kit + Mounting Bracket' },
    ],
  },
  '09-017-00069': {
    id: '09-017-00069',
    sku: '09-017-00069',
    slug: '09-017-00069',
    name: 'XAG Battery S-Charger CM13600S',
    tagline: 'Forced air-cooling charger for B13960S/B13970S/B141050',
    description: `The XAG Battery S-Charger CM13600S is a professional battery charging solution featuring forced air-cooling technology. Compatible with multiple XAG smart battery models.

Features:
- Forced air-cooling technology
- Wide operating temperature range
- Dual voltage input support
- High charging output
- Compatible with B13960S, B13970S, B141050 batteries`,
    mainImage: '/images/products/battery-chargers/09-017-00069-1.jpg',
    images: [
      '/images/products/battery-chargers/09-017-00069-1.jpg',
      '/images/products/battery-chargers/09-017-00069-2.jpg',
      '/images/products/battery-chargers/09-017-00069-3.jpg',
    ],
    price: 494000,
    compareAtPrice: null,
    currency: 'PLN',
    stock: 0,
    category: 'Battery Chargers',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '09-017-00069' },
      { label: 'Model', value: 'M2CM13600CH' },
      { label: 'Dimensions', value: '346 × 109 × 73 mm' },
      { label: 'Weight', value: '~3.9 kg' },
      { label: 'Cooling', value: 'Forced air-cooling' },
      { label: 'Operating Temp', value: '-20°C to 40°C' },
      { label: 'Input (110V)', value: '100-120V~ 50/60Hz 15.0A' },
      { label: 'Input (220V)', value: '220-240V~ 50/60Hz 16.0A' },
      { label: 'Output', value: '59.92V ⎓ 21A or 59.92V ⎓ 55A' },
      { label: 'Compatible Batteries', value: 'B13960S, B13970S, B141050' },
    ],
  },
  '09-017-00059': {
    id: '09-017-00059',
    sku: '09-017-00059',
    slug: '09-017-00059',
    name: 'XAG Battery E-Charger CM15300D',
    tagline: 'High-power battery charging solution',
    description: `The XAG Battery E-Charger CM15300D is a high-power charging solution designed for professional XAG agricultural drone operations.

Features:
- High-power charging capability
- Professional grade construction
- Efficient charging technology
- Compatible with XAG battery systems`,
    mainImage: '/images/products/battery-chargers/09-017-00059-1.jpg',
    images: [
      '/images/products/battery-chargers/09-017-00059-1.jpg',
    ],
    price: 600600,
    compareAtPrice: 772200,
    currency: 'PLN',
    stock: 0,
    category: 'Battery Chargers',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '09-017-00059' },
      { label: 'Model', value: 'CM15300D' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Type', value: 'E-Charger' },
    ],
  },
  '09-017-00065': {
    id: '09-017-00065',
    sku: '09-017-00065',
    slug: '09-017-00065',
    name: 'XAG Mist-Cooling Charging Station',
    tagline: 'Cooling and charging station for XAG batteries',
    description: `The XAG Mist-Cooling Charging Station provides an innovative cooling solution for battery charging. Uses mist-cooling technology to maintain optimal battery temperature during charging.

Features:
- Mist-cooling technology
- Prevents battery overheating
- Extends battery lifespan
- Compatible with XAG charging systems`,
    mainImage: '/images/products/battery-chargers/09-017-00065-1.jpg',
    images: [
      '/images/products/battery-chargers/09-017-00065-1.jpg',
      '/images/products/battery-chargers/09-017-00065-2.png',
      '/images/products/battery-chargers/09-017-00065-3.png',
      '/images/products/battery-chargers/09-017-00065-4.png',
    ],
    price: 92300,
    compareAtPrice: null,
    currency: 'PLN',
    stock: 0,
    category: 'Battery Chargers',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '09-017-00065' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Cooling Type', value: 'Mist-Cooling' },
      { label: 'Type', value: 'Charging Station' },
    ],
  },
  '09-017-00028': {
    id: '09-017-00028',
    sku: '09-017-00028',
    slug: '09-017-00028',
    name: 'XAG 2022 Mod Water-Cool Charging Tank',
    tagline: 'Water-cooling charging tank for efficient battery charging',
    description: `The XAG 2022 Model Water-Cool Charging Tank is designed for efficient battery cooling during the charging process. Uses water-cooling technology to maintain optimal charging temperatures.

Features:
- Water-cooling technology
- 2022 model with improvements
- Efficient heat dissipation
- Compatible with XAG battery systems
- Durable construction`,
    mainImage: '/images/products/battery-chargers/09-017-00028-3.png',
    images: [
      '/images/products/battery-chargers/09-017-00028-3.png',
      '/images/products/battery-chargers/09-017-00028-4.png',
      '/images/products/battery-chargers/09-017-00028-1.png',
      '/images/products/battery-chargers/09-017-00028-2.png',
    ],
    price: 85800,
    compareAtPrice: null,
    currency: 'PLN',
    stock: 0,
    category: 'Battery Chargers',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '09-017-00028' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Model Year', value: '2022' },
      { label: 'Cooling Type', value: 'Water-Cooling' },
      { label: 'Type', value: 'Charging Tank' },
    ],
  },

  // ==================== TASK SYSTEM ====================
  '09-023-00025': {
    id: '09-023-00025',
    sku: '09-023-00025',
    slug: '09-023-00025',
    name: 'XAG P100 Pro RevoSpray P3',
    tagline: '50L spray system with centrifugal atomizing nozzles',
    description: `The XAG P100 Pro RevoSpray P3 is a professional 50L spray system designed for the P100 Pro agricultural drone. Features advanced centrifugal atomizing nozzles for precise liquid application.

Features:
- 50L tank capacity
- Centrifugal atomizing nozzles
- Precision flow control
- Quick-release design
- Compatible with P100 Pro platform
- Adjustable spray width
- Real-time flow monitoring`,
    mainImage: '/images/products/task-system/09-023-00025-1.jpg',
    images: [
      '/images/products/task-system/09-023-00025-1.jpg',
    ],
    price: 910000,
    compareAtPrice: null,
    currency: 'PLN',
    stock: 0,
    category: 'Task System',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '09-023-00025' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Capacity', value: '50L' },
      { label: 'Compatibility', value: 'P100 Pro' },
      { label: 'Nozzle Type', value: 'Centrifugal Atomizing' },
      { label: 'Type', value: 'Spray System' },
    ],
  },
  '09-023-00055': {
    id: '09-023-00055',
    sku: '09-023-00055',
    slug: '09-023-00055',
    name: 'XAG P150 RevoSpray P4',
    tagline: 'Advanced spray system for P150 platform',
    description: `The XAG P150 RevoSpray P4 is an advanced spray system designed for the P150 agricultural drone platform. Offers enhanced spraying capabilities with improved atomization technology.

Features:
- Designed for P150 platform
- Advanced atomization technology
- High-efficiency spraying
- Precision application
- Durable construction
- Easy maintenance`,
    mainImage: '/images/products/task-system/09-023-00055.jpg',
    images: [
      '/images/products/task-system/09-023-00055.jpg',
    ],
    price: 910000,
    compareAtPrice: null,
    currency: 'PLN',
    stock: 0,
    category: 'Task System',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '09-023-00055' },
      { label: 'Model', value: 'RevoSpray P4' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Compatibility', value: 'P150' },
      { label: 'Type', value: 'Spray System' },
    ],
  },
  '09-023-00054': {
    id: '09-023-00054',
    sku: '09-023-00054',
    slug: '09-023-00054',
    name: 'XAG P150 RevoCast P4',
    tagline: 'Spreading system for P150 platform',
    description: `The XAG P150 RevoCast P4 is a professional spreading system designed for the P150 agricultural drone platform. Ideal for fertilizer and seed application with precise distribution control.

Features:
- Designed for P150 platform
- Variable rate spreading
- Dry material compatible (1-6mm particles)
- Precision distribution
- Large hopper capacity
- Weather-resistant design`,
    mainImage: '/images/products/task-system/09-023-00054.jpg',
    images: [
      '/images/products/task-system/09-023-00054.jpg',
    ],
    price: 1040000,
    compareAtPrice: 1170000,
    currency: 'PLN',
    stock: 0,
    category: 'Task System',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '09-023-00054' },
      { label: 'Model', value: 'RevoCast P4' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Compatibility', value: 'P150' },
      { label: 'Type', value: 'Spreading System' },
    ],
  },
  '05-002-02262': {
    id: '05-002-02262',
    sku: '05-002-02262',
    slug: '05-002-02262',
    name: 'XAG P100 Pro Upgrade Kit - 60L Container',
    tagline: '60L Smart Tank with Sub-Cover Refill Design',
    description: `The XAG P100 Pro Upgrade Kit upgrades your P100 Pro to a 60L capacity with the innovative Sub-Cover Refill Design. Increases operational efficiency with larger tank capacity.

Features:
- 60L tank capacity (upgrade from 50L)
- Sub-Cover Refill Design
- Quick refill capability
- Compatible with P100 Pro
- Durable construction
- Easy installation`,
    mainImage: '/images/products/task-system/05-002-02262.jpg',
    images: [
      '/images/products/task-system/05-002-02262.jpg',
    ],
    price: 743600,
    compareAtPrice: null,
    currency: 'PLN',
    stock: 0,
    category: 'Task System',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '05-002-02262' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Capacity', value: '60L' },
      { label: 'Compatibility', value: 'P100 Pro' },
      { label: 'Type', value: 'Upgrade Kit / Tank' },
    ],
  },
  '09-023-00023': {
    id: '09-023-00023',
    sku: '09-023-00023',
    slug: '09-023-00023',
    name: 'XAG P100 Pro RevoCast P3',
    tagline: '80L spreader system for dry solids 1-6mm',
    description: `The XAG P100 Pro RevoCast P3 is an 80L spreading system designed for the P100 Pro agricultural drone. Optimized for spreading dry solids in the 1-6mm particle range including fertilizers and seeds.

Features:
- 80L hopper capacity
- Optimized for 1-6mm dry solids
- Variable rate application
- Precision distribution
- Compatible with P100 Pro
- Durable construction
- Easy maintenance`,
    mainImage: '/images/products/task-system/09-023-00023-1.png',
    images: [
      '/images/products/task-system/09-023-00023-1.png',
    ],
    price: 1170000,
    compareAtPrice: null,
    currency: 'PLN',
    stock: 0,
    category: 'Task System',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '09-023-00023' },
      { label: 'Model', value: 'RevoCast P3' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Capacity', value: '80L' },
      { label: 'Particle Size', value: '1-6mm' },
      { label: 'Compatibility', value: 'P100 Pro' },
      { label: 'Type', value: 'Spreading System' },
    ],
  },

  // ==================== REMOTE CONTROLLER ====================
  '09-016-00085': {
    id: '09-016-00085',
    sku: '09-016-00085',
    slug: '09-016-00085',
    name: 'XAG Remote Controller SRC5',
    tagline: '7.02" display, 20000mAh, 2km range',
    description: `The XAG Remote Controller SRC5 is the latest professional-grade controller for XAG agricultural drones. Features a large 7.02" high-brightness display, massive 20,000mAh battery, and 2km transmission range.

Features:
- 7.02" high-brightness display
- 20,000mAh built-in battery
- 2km transmission range
- Sunlight-readable screen
- Intuitive touch interface
- Real-time flight telemetry
- Mission planning capability
- Weather-resistant design (IP54)`,
    mainImage: '/images/products/remote-controller/09-016-00085-2.png',
    images: [
      '/images/products/remote-controller/09-016-00085-2.png',
    ],
    price: 598000,
    compareAtPrice: null,
    currency: 'PLN',
    stock: 0,
    category: 'Remote Controller',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '09-016-00085' },
      { label: 'Model', value: 'SRC5' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Display', value: '7.02"' },
      { label: 'Battery', value: '20,000mAh' },
      { label: 'Range', value: '2km' },
      { label: 'Type', value: 'Remote Controller' },
    ],
  },
  '09-016-00053': {
    id: '09-016-00053',
    sku: '09-016-00053',
    slug: '09-016-00053',
    name: 'XAG RC ARC3 Pro',
    tagline: 'Compact controller with RTK positioning',
    description: `The XAG RC ARC3 Pro is a compact professional controller with integrated RTK positioning support. Designed for precision agricultural operations with advanced connectivity features.

Features:
- Compact ergonomic design
- RTK positioning support
- High-precision control
- Long-range transmission
- Built-in display
- Multiple connectivity options
- Weather-resistant construction`,
    mainImage: '/images/products/remote-controller/09-016-00053-2.png',
    images: [
      '/images/products/remote-controller/09-016-00053-2.png',
    ],
    price: 546000,
    compareAtPrice: null,
    currency: 'PLN',
    stock: 0,
    category: 'Remote Controller',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '09-016-00053' },
      { label: 'Model', value: 'ARC3 Pro' },
      { label: 'Brand', value: 'XAG' },
      { label: 'RTK Support', value: 'Yes' },
      { label: 'Type', value: 'Remote Controller' },
    ],
  },

  // ==================== GNSS RTK ====================
  '09-016-00083': {
    id: '09-016-00083',
    sku: '09-016-00083',
    slug: '09-016-00083',
    name: 'XAG GNSS XRTK7 Mobile Station',
    tagline: 'Portable RTK with <5cm accuracy, 2km range',
    description: `The XAG GNSS XRTK7 Mobile Station is a portable high-precision RTK positioning system with less than 5cm accuracy and 2km transmission range. Ideal for field operations requiring centimeter-level precision.

Features:
- <5cm positioning accuracy
- 2km transmission range
- Portable mobile design
- Quick setup and deployment
- Multi-constellation support
- Long battery life
- Weather-resistant (IP54)
- Real-time correction data`,
    mainImage: '/images/products/gnss-rtk/09-016-00083-1.png',
    images: [
      '/images/products/gnss-rtk/09-016-00083-1.png',
    ],
    price: 475800,
    compareAtPrice: 603200,
    currency: 'PLN',
    stock: 0,
    category: 'GNSS RTK',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '09-016-00083' },
      { label: 'Model', value: 'XRTK7' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Accuracy', value: '<5cm' },
      { label: 'Range', value: '2km' },
      { label: 'Type', value: 'Mobile RTK Station' },
    ],
  },
  '09-010-00019': {
    id: '09-010-00019',
    sku: '09-010-00019',
    slug: '09-010-00019',
    name: 'XAG GNSS RTK Fix Station',
    tagline: 'High-precision RTK module ±10mm accuracy',
    description: `The XAG GNSS RTK Fix Station is a high-precision fixed base station with ±10mm accuracy. Provides continuous RTK correction signals for maximum positioning precision across your operation area.

Features:
- ±10mm positioning accuracy
- Fixed station design
- Continuous RTK corrections
- Wide coverage area
- Multi-constellation GNSS
- Weather-resistant enclosure
- Multiple mounting options
- Professional grade construction`,
    mainImage: '/images/products/gnss-rtk/09-010-00019-1.png',
    images: [
      '/images/products/gnss-rtk/09-010-00019-1.png',
    ],
    price: 1154400,
    compareAtPrice: null,
    currency: 'PLN',
    stock: 0,
    category: 'GNSS RTK',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '09-010-00019' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Accuracy', value: '±10mm' },
      { label: 'Type', value: 'RTK Fix Station' },
    ],
  },
  '09-010-00036': {
    id: '09-010-00036',
    sku: '09-010-00036',
    slug: '09-010-00036',
    name: 'XAG GNSS XRTK4 Rover',
    tagline: 'RTK positioning module for agricultural use',
    description: `The XAG GNSS XRTK4 Rover is a high-precision RTK positioning module designed for agricultural drone and robot applications. Provides reliable centimeter-level positioning.

Features:
- High-precision RTK positioning
- Rover configuration
- Multi-constellation support
- Fast convergence time
- Compact design
- Agricultural optimized
- Easy integration`,
    mainImage: '/images/products/gnss-rtk/09-010-00036-1.jpg',
    images: [
      '/images/products/gnss-rtk/09-010-00036-1.jpg',
    ],
    price: 1144000,
    compareAtPrice: null,
    currency: 'PLN',
    stock: 0,
    category: 'GNSS RTK',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '09-010-00036' },
      { label: 'Model', value: 'XRTK4' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Configuration', value: 'Rover' },
      { label: 'Type', value: 'RTK Module' },
    ],
  },
  '13-001-00056': {
    id: '13-001-00056',
    sku: '13-001-00056',
    slug: '13-001-00056',
    name: 'XAG Station Tripod',
    tagline: 'Tripod for GNSS RTK stations',
    description: `The XAG Station Tripod is a professional tripod designed for mounting GNSS RTK base stations. Provides stable support for accurate positioning operations.

Features:
- Professional grade construction
- Adjustable height
- Stable platform
- Quick setup
- Compatible with XAG RTK stations
- Lightweight and portable
- Durable materials`,
    mainImage: '/images/products/gnss-rtk/13-001-00056-1.png',
    images: [
      '/images/products/gnss-rtk/13-001-00056-1.png',
    ],
    price: 67600,
    compareAtPrice: null,
    currency: 'PLN',
    stock: 0,
    category: 'GNSS RTK',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '13-001-00056' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Type', value: 'Tripod / Mount' },
    ],
  },

  // ==================== AIRBORNE (DRONES) ====================
  'AU-XAG-PROP4': {
    id: 'AU-XAG-PROP4',
    sku: 'AU-XAG-PROP4',
    slug: 'AU-XAG-PROP4',
    name: 'XAG P100 Pro Basic Package',
    tagline: 'Complete spray package with 50L tank, 4 batteries, 2 chargers',
    description: `The XAG P100 Pro Basic Package is a complete agricultural drone solution for professional spraying operations. This package includes everything you need to start precision agriculture operations.

Package Includes:
- 1x XAG P100 Pro Agricultural Drone
- 1x 50L Spray Tank
- 4x Smart Batteries B13960S
- 2x Battery S-Chargers CM13600S
- 1x Remote Controller RC Pro
- 1x Control Terminal CT2

Features:
- 50L payload capacity
- 50m spray width
- Precision spraying system
- Intelligent flight planning
- Terrain following radar
- IP67 water resistance
- Ready to fly package`,
    mainImage: '/images/products/drones/au-xag-prop4-1.png',
    images: [
      '/images/products/drones/au-xag-prop4-1.png',
      '/images/products/drones/au-xag-prop4-2.png',
      '/images/products/drones/au-xag-prop4-3.png',
    ],
    price: 10920000,
    compareAtPrice: 12896000,
    currency: 'PLN',
    stock: 0,
    category: 'Airborne',
    type: 'PRODUCT',
    specifications: [
      { label: 'SKU', value: 'AU-XAG-PROP4' },
      { label: 'Model', value: 'P100 Pro' },
      { label: 'Payload', value: '50L' },
      { label: 'Spray Width', value: '50m' },
      { label: 'Batteries Included', value: '4x B13960S' },
      { label: 'Chargers Included', value: '2x CM13600S' },
      { label: 'Controller', value: 'RC Pro + CT2' },
      { label: 'IP Rating', value: 'IP67' },
    ],
  },
  '09-007-00136': {
    id: '09-007-00136',
    sku: '09-007-00136',
    slug: '09-007-00136',
    name: 'XAG P100 Pro',
    tagline: 'Professional agricultural drone for precision spraying',
    description: `The XAG P100 Pro is a professional-grade agricultural drone designed for precision spraying operations. Features advanced flight control and spraying technology for maximum efficiency.

Features:
- 50L payload capacity
- Precision spraying nozzles
- Terrain following radar
- Intelligent route planning
- All-weather operation capability
- IP67 water resistance
- Modular design for easy maintenance`,
    mainImage: '/images/products/drones/09-007-00136-1.png',
    images: [
      '/images/products/drones/09-007-00136-1.png',
      '/images/products/drones/09-007-00136-2.png',
    ],
    price: 7280000,
    compareAtPrice: null,
    currency: 'PLN',
    stock: 0,
    category: 'Airborne',
    type: 'PRODUCT',
    specifications: [
      { label: 'SKU', value: '09-007-00136' },
      { label: 'Model', value: 'P100 Pro' },
      { label: 'Payload', value: '50L' },
      { label: 'IP Rating', value: 'IP67' },
      { label: 'Type', value: 'Agricultural Drone' },
    ],
  },
  'AU-XAG-PROP5': {
    id: 'AU-XAG-PROP5',
    sku: 'AU-XAG-PROP5',
    slug: 'AU-XAG-PROP5',
    name: 'XAG P100 Pro Spreader Package',
    tagline: 'Complete spreading solution with JetSeed spreading system',
    description: `The XAG P100 Pro Spreader Package is designed for precision spreading operations. Includes the JetSeed spreading system for efficient fertilizer and seed application.

Package Includes:
- 1x XAG P100 Pro Agricultural Drone
- 1x JetSeed Spreading System (80L capacity)
- 4x Smart Batteries B13960S
- 2x Battery S-Chargers CM13600S
- 1x Remote Controller RC Pro
- 1x Control Terminal CT2

Features:
- 80L spreading hopper
- Variable rate spreading
- Precision application technology
- Intelligent flight planning
- Real-time flow monitoring`,
    mainImage: '/images/products/drones/au-xag-prop5-1.png',
    images: [
      '/images/products/drones/au-xag-prop5-1.png',
      '/images/products/drones/au-xag-prop5-2.png',
      '/images/products/drones/au-xag-prop5-3.png',
    ],
    price: 11700000,
    compareAtPrice: 13520000,
    currency: 'PLN',
    stock: 0,
    category: 'Airborne',
    type: 'PRODUCT',
    specifications: [
      { label: 'SKU', value: 'AU-XAG-PROP5' },
      { label: 'Model', value: 'P100 Pro + JetSeed' },
      { label: 'Spreading Capacity', value: '80L' },
      { label: 'Batteries Included', value: '4x B13960S' },
      { label: 'Chargers Included', value: '2x CM13600S' },
      { label: 'Controller', value: 'RC Pro + CT2' },
      { label: 'Application', value: 'Fertilizer & Seeds' },
    ],
  },
  'AU-XAG-PROP6': {
    id: 'AU-XAG-PROP6',
    sku: 'AU-XAG-PROP6',
    slug: 'AU-XAG-PROP6',
    name: 'XAG P100 Pro Package + RTK',
    tagline: 'Complete spray package with GNSS RTK precision positioning',
    description: `The XAG P100 Pro Package + RTK is the ultimate precision agriculture solution. Includes full GNSS RTK system for centimeter-level positioning accuracy.

Package Includes:
- 1x XAG P100 Pro Agricultural Drone
- 1x 50L Spray Tank
- 4x Smart Batteries B13960S
- 2x Battery S-Chargers CM13600S
- 1x Remote Controller RC Pro
- 1x Control Terminal CT2
- 1x GNSS RTK Base Station
- 1x RTK Handheld Surveyor

Features:
- Centimeter-level positioning
- Complete RTK ecosystem
- Maximum spray precision
- Professional field surveying
- Full autonomous operation
- All accessories included`,
    mainImage: '/images/products/drones/au-xag-prop6-1.png',
    images: [
      '/images/products/drones/au-xag-prop6-1.png',
      '/images/products/drones/au-xag-prop6-2.png',
    ],
    price: 12480000,
    compareAtPrice: 14560000,
    currency: 'PLN',
    stock: 0,
    category: 'Airborne',
    type: 'PRODUCT',
    specifications: [
      { label: 'SKU', value: 'AU-XAG-PROP6' },
      { label: 'Model', value: 'P100 Pro + RTK System' },
      { label: 'Payload', value: '50L' },
      { label: 'Positioning', value: 'Centimeter-level RTK' },
      { label: 'Batteries Included', value: '4x B13960S' },
      { label: 'Chargers Included', value: '2x CM13600S' },
      { label: 'Controller', value: 'RC Pro + CT2' },
      { label: 'RTK Equipment', value: 'Base Station + Surveyor' },
    ],
  },
};

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = mockProducts[slug];
  const t = useTranslations('productDetail');

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications'>('description');
  const [activeImage, setActiveImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-16">
        <svg
          className="w-20 h-20 text-gray-200 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2 className="text-2xl font-bold text-navy mb-2">{t('productNotFound')}</h2>
        <p className="text-gray-500 mb-6">{t('productNotFoundDesc')}</p>
        <Link href="/products" className="btn-primary">
          {t('browseProducts')}
        </Link>
      </div>
    );
  }

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(product.currency === 'PLN' ? 'pl-PL' : 'de-DE', {
      style: 'currency',
      currency: product.currency,
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  const handleAddToCart = () => {
    setAddingToCart(true);

    useCartStore.getState().addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.mainImage,
      price: product.price,
      quantity,
      currency: product.currency,
    });

    setTimeout(() => {
      setAddingToCart(false);
    }, 500);
  };

  const currentImage = product.images[activeImage] || product.mainImage;

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="container py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-navy">{t('home')}</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/products" className="hover:text-navy">{t('products')}</Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-navy font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Detail */}
      <div className="container py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative">
              {currentImage ? (
                <Image
                  src={currentImage}
                  alt={product.name}
                  fill
                  className="object-contain p-8"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-32 h-32 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {hasDiscount && (
                  <span className="badge badge-sale">-{discountPercent}%</span>
                )}
                {product.stock === 0 && (
                  <span className="badge badge-out-of-stock">{t('outOfStock')}</span>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      activeImage === idx ? 'border-brand-red' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain bg-gray-50"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm text-gray-500 uppercase tracking-wide">
                  {product.category}
                </span>
                <span className="text-sm text-gray-400">|</span>
                <span className="text-sm text-gray-500 font-mono">
                  SKU: {product.sku}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-navy">
                {product.name}
              </h1>
              {product.tagline && (
                <p className="text-lg text-gray-600 mt-2">{product.tagline}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className={`text-3xl font-bold ${hasDiscount ? 'text-brand-red' : 'text-navy'}`}>
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-green-700 font-medium">{t('inStock')}</span>
                  <span className="text-gray-500">({product.stock} {t('available')})</span>
                </>
              ) : (
                <>
                  <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                  <span className="text-orange-700 font-medium">{t('backordered')}</span>
                </>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors"
                  disabled={quantity <= 1}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="px-6 py-3 font-medium min-w-[60px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="btn-primary flex-1 justify-center"
              >
                {addingToCart ? (
                  <>
                    <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('adding')}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {product.stock === 0 ? t('preOrder') : t('addToCart')}
                  </>
                )}
              </button>
            </div>

            {/* Contact for Stock */}
            {product.stock === 0 && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-orange-800 text-sm">
                  {t('backorderedMessage')}
                </p>
              </div>
            )}

            {/* Features */}
            <div className="border-t pt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{t('officialWarranty')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{t('freeShipping')}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{t('technicalSupport')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description & Specifications */}
        <div className="mt-16 border-t pt-8">
          <div className="flex gap-8 border-b">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-4 font-medium transition-colors relative ${
                activeTab === 'description'
                  ? 'text-navy'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('description')}
              {activeTab === 'description' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-red" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('specifications')}
              className={`pb-4 font-medium transition-colors relative ${
                activeTab === 'specifications'
                  ? 'text-navy'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('specifications')}
              {activeTab === 'specifications' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-red" />
              )}
            </button>
          </div>

          <div className="py-8">
            {activeTab === 'description' ? (
              <div className="prose prose-gray max-w-none">
                {product.description.split('\n').map((paragraph, i) => (
                  <p key={i} className="mb-4">{paragraph}</p>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    {product.specifications.map((spec, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="px-4 py-3 font-medium text-navy w-1/3">
                          {spec.label}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
