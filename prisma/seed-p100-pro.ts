import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const prisma = new PrismaClient();

// All P100 Pro products collected from RaptorDynamic
const rawProducts = [
  // === FUSELAGE - FRAME ===
  { name: "P100P Main Fuselage", sku: "14-005-00021", priceUSD: 365.58, image: "14-005-00021_de5cc464-1707-4d95-804b-a3a32168f065.jpg" },
  { name: "P100P Rear Arm Holder (Arm 3)", sku: "02-001-09030", priceUSD: 79.65, image: "02-001-09030.jpg" },
  { name: "P100P Rear Arm Holder (Arm 4)", sku: "02-001-09029", priceUSD: 79.65, image: "02-001-09029.jpg" },
  { name: "P100P Front Arm Holder (Arm 1)", sku: "02-001-09027", priceUSD: 79.65, image: "02-001-09027.jpg" },
  { name: "P100P Front Arm Holder (Arm 2)", sku: "02-001-09028", priceUSD: 79.65, image: "02-001-09028.jpg" },
  { name: "P100P Arm Lock Socket", sku: "02-001-08007", priceUSD: 3.96, image: "02-001-08007.jpg" },
  { name: "P100P Arm Lock Hook", sku: "02-001-08470", priceUSD: 5.89, image: "02-001-08470.jpg" },
  { name: "P100P Arm Lock Knob", sku: "02-001-09034", priceUSD: 5.50, image: "02-001-09034.jpg" },
  { name: "P100P Arm Lock Rod Spring", sku: "02-001-06594", priceUSD: 0.43, image: "02-001-06594.jpg" },
  { name: "P100P Arm Lock Rod", sku: "02-002-09134", priceUSD: 6.30, image: "02-002-09134.jpg" },
  { name: "P100P Fuselage Platform Rear Cover", sku: "02-001-09024", priceUSD: 30.45, image: "02-001-09024.jpg" },
  { name: "P100P Fuselage Platform Front Cover", sku: "02-001-09023", priceUSD: 30.45, image: "02-001-09023.jpg" },
  { name: "P100P Fuselage Arm Holder Foam Seal", sku: "02-001-08465", priceUSD: 5.93, image: "02-001-08465.jpg" },
  { name: "P100P Arm Lock Rod Seal Bushing", sku: "02-001-08284", priceUSD: 0.86, image: "02-001-08284.jpg" },
  { name: "P100P Arm Lock Rod Pin", sku: "02-002-09097", priceUSD: 0.86, image: "02-002-09097.jpg" },
  { name: "P100P M5*16*10 Screw Kit", sku: "02-004-00939", priceUSD: 1.26, image: "02-004-00939.jpg" },
  { name: "P100P M3*8*6 Screw Kit", sku: "02-004-00937", priceUSD: 0.86, image: "02-004-00937.jpg" },
  { name: "P100P M4*12*8 Screw Kit", sku: "02-004-00834", priceUSD: 0.86, image: "02-004-00834.jpg" },
  { name: "P100P M3*6*6 Screw Kit", sku: "02-004-00928", priceUSD: 0.86, image: "02-004-00928.jpg" },
  { name: "P100P Fuselage Platform Rear Cover Seal", sku: "02-001-08455", priceUSD: 2.93, image: "02-001-08455.jpg" },
  { name: "P100P Fuselage Platform Front Cover Seal", sku: "02-001-08454", priceUSD: 2.93, image: "02-001-08454.jpg" },
  { name: "P100P ST4.2*8 Tapping Screw", sku: "02-004-00918", priceUSD: 0.86, image: "02-004-00918.webp" },
  { name: "P100P Fuselage Platform Rear Mounting Bracket", sku: "02-001-09453", priceUSD: 5.50, image: "02-001-09453.jpg" },
  { name: "P100P M4*16*8 Screw Kit", sku: "02-004-00836", priceUSD: 0.86, image: "02-004-00836.png" },

  // === FUSELAGE - FRONT COMPARTMENT - FLIGHT CONTROL ===
  { name: "P100P SuperX4 Pro Flight Controller", sku: "05-002-01880", priceUSD: 3359.07, image: "05-002-01880.jpg" },
  { name: "P100P Fuselage Front Compartment Landing Gear Mounting Bracket", sku: "02-002-09218", priceUSD: 5.07, image: "02-002-09218.jpg" },
  { name: "P100P Fuselage Front Compartment Landing Gear", sku: "14-005-00008", priceUSD: 72.50, image: "14-005-00008.jpg" },
  { name: "P100P Landing Gear Torsion Spring", sku: "02-001-08471", priceUSD: 2.12, image: "02-001-08471.jpg" },
  { name: "P100P M5*12*10 Screw Kit", sku: "02-004-00670", priceUSD: 1.18, image: "02-004-00670.jpg" },
  { name: "P100P Fuselage Front Compartment Landing Gear Mounting Bracket Spring", sku: "02-001-08197", priceUSD: 0.43, image: "02-001-08197.jpg" },

  // === FUSELAGE - FRONT COMPARTMENT - MAIN ===
  { name: "P100P Fuselage Front Compartment Frame (Lower)", sku: "02-001-09021", priceUSD: 124.50, image: "02-001-09021.jpg" },
  { name: "P100P Fuselage Front Compartment Frame (Upper)", sku: "02-001-09022", priceUSD: 124.50, image: "02-001-09022.jpg" },
  { name: "P100P Front Cover Latch Lock", sku: "05-002-01357", priceUSD: 8.19, image: "05-002-01357.jpg" },
  { name: "P100P Fuselage Front Compartment Frame Foam Seal (Lower)", sku: "02-001-08286", priceUSD: 7.29, image: "02-001-08286.jpg" },
  { name: "P100P Fuselage Front Compartment Frame Foam Seal (Upper)", sku: "02-001-08461", priceUSD: 7.29, image: "02-001-08461.jpg" },
  { name: "P100P USB Cover", sku: "02-001-08505", priceUSD: 2.93, image: "02-001-08505.jpg" },
  { name: "P100P Fuselage Front Compartment Latch Holder", sku: "02-002-09135", priceUSD: 7.13, image: "02-002-09135.jpg" },
  { name: "P100P Fuselage Front Compartment Frame Hinge Insert", sku: "02-002-09133", priceUSD: 4.23, image: "02-002-09133.jpg" },
  { name: "P100P Fuselage Front Compartment Frame Hinge", sku: "14-005-00010", priceUSD: 14.65, image: "14-005-00010.jpg" },
  { name: "P100P Fuselage Front Compartment Frame Hinge Pin", sku: "02-002-09136", priceUSD: 2.96, image: "02-002-09136.jpg" },
  { name: "P100P ST2.9*8 Tapping Screw", sku: "02-004-00942", priceUSD: 1.18, image: "02-004-00942.webp" },
  { name: "P100P Fuselage Front Compartment Frame Holder Cover Foam Seal", sku: "02-001-08200", priceUSD: 0.43, image: "02-001-08200.jpg" },
  { name: "P100P Fuselage Front Compartment Frame Holder Cover", sku: "02-001-08459", priceUSD: 3.37, image: "02-001-08459.jpg" },

  // === FUSELAGE - BROADCASTING SYSTEM ===
  { name: "P100P V2 RTK Antenna", sku: "05-002-01873", priceUSD: 333.30, image: "05-002-01873.jpg" },
  { name: "P100P V2 RTK Antenna Cable (Short)", sku: "01-027-02643", priceUSD: 114.35, image: "01-027-02643.jpg" },
  { name: "P100P V2 RTK Antenna Cable (Long)", sku: "01-027-02644", priceUSD: 126.80, image: "01-027-02644.jpg" },
  { name: "P100P RTK Antenna Bracket", sku: "02-002-12100", priceUSD: 11.75, image: "02-002-12100.jpg" },

  // === FUSELAGE - POWER SYSTEM ===
  { name: "P100P Power Distribution Coax Cable", sku: "01-027-02501", priceUSD: 193.65, image: "01-027-02501.jpg" },
  { name: "P100P Power Distribution Coax Cover", sku: "02-001-08484", priceUSD: 5.50, image: "02-001-08484.jpg" },
  { name: "P100P Power Distribution Board", sku: "05-002-01774", priceUSD: 1040.00, image: "05-002-01774.jpg" },
  { name: "P100P Power Cable (Power Distribution Board - ESC)", sku: "01-027-02503", priceUSD: 64.48, image: "01-027-02503.jpg" },
  { name: "P100P M4*8*8 Screw Kit", sku: "02-004-00780", priceUSD: 0.86, image: "02-004-00780.png" },
  { name: "P100P M4*25 Countersunk Screw", sku: "02-004-00993", priceUSD: 0.86, image: "02-004-00993.png" },

  // === FUSELAGE - FLIGHT CONTROL AND RADAR ===
  { name: "P100P Fuselage Camera and Radar Mounting Bracket", sku: "02-002-09217", priceUSD: 22.19, image: "02-002-09217.jpg" },
  { name: "P100P Omni Radar II", sku: "05-002-01879", priceUSD: 1556.00, image: "05-002-01879.jpg" },
  { name: "P100P Tripod Camera", sku: "05-002-01790", priceUSD: 432.90, image: "05-002-01790.jpg" },
  { name: "P100P Tripod Camera Cable", sku: "01-027-02467", priceUSD: 73.65, image: "01-027-02467.jpg" },
  { name: "P100P Omni Radar Bracket Rubber Seal", sku: "02-001-08250", priceUSD: 0.43, image: "02-001-08250.jpg" },
  { name: "P100P Omni Radar Cable", sku: "01-027-02493", priceUSD: 138.30, image: "01-027-02493.jpg" },
  { name: "P100P M3*14*6 Screw Kit", sku: "02-004-00777", priceUSD: 0.86, image: "02-004-00777.jpg" },

  // === ARM - FRAME - ARM 1 ===
  { name: "P100P Arm (Arm 1)", sku: "14-006-00034", priceUSD: 390.45, image: "14-006-00034.jpg" },
  { name: "P100P Arm Lock Insert (for Arm 1)", sku: "02-001-08468", priceUSD: 5.07, image: "02-001-08468.jpg" },
  { name: "P100P Arm Frame (Rear Section, Arm 1)", sku: "02-002-09215", priceUSD: 18.41, image: "02-002-09215.jpg" },
  { name: "P100P Arm Frame (Middle Section, Arm 1)", sku: "02-002-09211", priceUSD: 74.45, image: "02-002-09211.jpg" },
  { name: "P100P Arm Frame (Front Section, Arm 1)", sku: "02-002-09213", priceUSD: 23.23, image: "02-002-09213.jpg" },
  { name: "P100P Arm Motor Holder (Arm 1)", sku: "02-001-09010", priceUSD: 64.95, image: "02-001-09010.jpg" },
  { name: "P100P Arm Wire Clamp", sku: "02-001-08488", priceUSD: 1.26, image: "02-001-08488.jpg" },
  { name: "P100P Arm Frame End Cover", sku: "02-001-09017", priceUSD: 3.37, image: "02-001-09017.jpg" },
  { name: "P100P Arm Frame Hinge Pin", sku: "02-002-09219", priceUSD: 5.07, image: "02-002-09219.jpg" },
  { name: "P100P Arm Frame Hinge Rod Lock Pin", sku: "02-002-09226", priceUSD: 2.55, image: "02-002-09226.jpg" },
  { name: "P100P Arm Frame Connection Seal (Front Section)", sku: "02-001-08508", priceUSD: 1.26, image: "02-001-08508.jpg" },
  { name: "P100P Arm Frame Hinge", sku: "02-002-09224", priceUSD: 3.37, image: "02-002-09224.jpg" },
  { name: "P100P Arm Lock Mechanism Cover", sku: "02-001-08469", priceUSD: 5.07, image: "02-001-08469.jpg" },
  { name: "P100P Arm Frame Connection Seal (Middle Section)", sku: "02-001-08509", priceUSD: 1.26, image: "02-001-08509.jpg" },
  { name: "P100P Arm Frame Hinge Lock Ring", sku: "02-002-09225", priceUSD: 1.69, image: "02-002-09225.jpg" },
  { name: "P100P M6*20*12 Screw Kit", sku: "02-004-01189", priceUSD: 3.15, image: "02-004-01189.jpg" },
  { name: "P100P M6*40*12 Screw Kit", sku: "02-004-00824", priceUSD: 1.26, image: "02-004-00824.png" },

  // === ARM - FRAME - ARM 2 ===
  { name: "P100P Arm (Arm 2)", sku: "14-006-00035", priceUSD: 390.45, image: "14-006-00035.jpg" },
  { name: "P100P Arm Lock Insert (for Arm 2)", sku: "02-001-08467", priceUSD: 5.07, image: "02-001-08467.jpg" },
  { name: "P100P Arm Frame (Rear Section, Arm 2)", sku: "02-002-09216", priceUSD: 18.41, image: "02-002-09216.jpg" },
  { name: "P100P Arm Frame (Middle Section, Arm 2)", sku: "02-002-09212", priceUSD: 74.45, image: "02-002-09212.jpg" },
  { name: "P100P Arm Frame (Front Section, Arm 2)", sku: "02-002-09214", priceUSD: 23.23, image: "02-002-09214.jpg" },
  { name: "P100P Arm Motor Holder (Arm 2)", sku: "02-001-09011", priceUSD: 64.95, image: "02-001-09011.jpg" },

  // === ARM - FRAME - ARM 3 ===
  { name: "P100P Arm (Arm 3)", sku: "14-006-00036", priceUSD: 440.50, image: "14-006-00036.jpg" },
  { name: "P100P Arm Lock Insert (for Arm 3)", sku: "02-001-08285", priceUSD: 5.07, image: "02-001-08285.jpg" },
  { name: "P100P Arm Frame (Rear Section, Arm 3)", sku: "02-002-12157", priceUSD: 18.41, image: "02-002-12157.jpg" },
  { name: "P100P Arm Frame (Middle Section, Arm 3)", sku: "02-002-12159", priceUSD: 86.95, image: "02-002-12159.jpg" },
  { name: "P100P Arm Frame (Front Section, Arm 3)", sku: "02-002-12155", priceUSD: 23.23, image: "02-002-12155.jpg" },
  { name: "P100P Arm Motor Holder (Arm 3)", sku: "02-001-09488", priceUSD: 68.50, image: "02-001-09488.jpg" },

  // === ARM - FRAME - ARM 4 ===
  { name: "P100P Arm (Arm 4)", sku: "14-006-00037", priceUSD: 440.50, image: "14-006-00037.jpg" },
  { name: "P100P Arm Lock Insert (for Arm 4)", sku: "02-001-08096", priceUSD: 5.07, image: "02-001-08096.jpg" },
  { name: "P100P Arm Frame (Rear Section, Arm 4)", sku: "02-002-12158", priceUSD: 18.41, image: "02-002-12158.jpg" },
  { name: "P100P Arm Frame (Middle Section, Arm 4)", sku: "02-002-12160", priceUSD: 86.95, image: "02-002-12160.jpg" },
  { name: "P100P Arm Frame (Front Section, Arm 4)", sku: "02-002-12156", priceUSD: 23.23, image: "02-002-12156.jpg" },
  { name: "P100P Arm Motor Holder (Arm 4)", sku: "02-001-09489", priceUSD: 68.50, image: "02-001-09489.jpg" },

  // === ARM - POWER SYSTEM (ALL ARMS) ===
  { name: "P100P 55\" Foldable Propeller Blades Kit (CW)", sku: "14-006-00002", priceUSD: 149.00, image: "14-006-00002.jpg" },
  { name: "P100P 55\" Foldable Propeller Blades Kit (CCW)", sku: "14-006-00001", priceUSD: 149.00, image: "14-006-00001.jpg" },
  { name: "P100P ESC", sku: "05-002-01767", priceUSD: 729.33, image: "05-002-01767.jpg" },
  { name: "P100P 55\" Foldable Propeller Clamp", sku: "14-006-00010", priceUSD: 207.13, image: "14-006-00010.jpg" },
  { name: "P100 Pro 55\" High Performance Propellers", sku: "14-007-00134", priceUSD: 219.00, image: "P100Pro55HighPerformancePropellers.png" },
  { name: "P100P 55\" Foldable Propeller Gasket (CW)", sku: "02-001-09042", priceUSD: 8.60, image: "02-001-09042.jpg" },
  { name: "P100P 55\" Foldable Propeller Gasket (CCW)", sku: "02-001-09634", priceUSD: 8.60, image: "02-001-09634.jpg" },
  { name: "P100P Motor", sku: "02-005-00420", priceUSD: 2127.90, image: "02-005-00420.jpg" },
  { name: "P100P 55\" Foldable Propeller Clamp Bracket Pin", sku: "02-002-12103", priceUSD: 5.50, image: "02-002-12103.jpg" },
  { name: "P100P 55\" Foldable Propeller Clamp Bracket", sku: "02-002-12102", priceUSD: 135.20, image: "02-002-12102.jpg" },
  { name: "P100P 55\" Foldable Propeller Clamp Bracket Pin Bushing", sku: "02-002-12104", priceUSD: 2.35, image: "02-002-12104.jpg" },
  { name: "P100P 55\" Foldable Propeller Clamp Pin", sku: "02-002-12169", priceUSD: 5.50, image: "02-002-12169.jpg" },

  // === ARM - REVOSPRAY SYSTEM ===
  { name: "P100P Nozzle Disc", sku: "02-001-09449", priceUSD: 4.99, image: "02-001-09449.jpg" },
  { name: "P100P Nozzle", sku: "05-002-01768", priceUSD: 508.37, image: "05-002-01768.jpg" },
  { name: "P100P Short Liquid Tube (Arm - Nozzle)", sku: "14-006-00029", priceUSD: 16.45, image: "14-006-00029.jpg" },
  { name: "P100P Nozzle Extension Cable", sku: "01-027-02539", priceUSD: 122.70, image: "01-027-02539.jpg" },
  { name: "P100P Nozzle Adaptor Cable", sku: "01-027-02538", priceUSD: 71.10, image: "01-027-02538.jpg" },
  { name: "P100P Liquid Tube (for Arms)", sku: "14-006-00015", priceUSD: 109.40, image: "14-006-00015.jpg" },
  { name: "P100P M2.5*8*4.5 Screw Kit", sku: "02-004-00523", priceUSD: 0.86, image: "02-004-00523.jpg" },

  // === TAIL FRAME ===
  { name: "P100P Tail Frame", sku: "02-001-09692", priceUSD: 229.49, image: "02-001-09692.png" },
  { name: "P100P Tail Frame Beam", sku: "02-002-09098", priceUSD: 16.75, image: "02-002-09098.jpg" },
  { name: "P100P Battery Guide Kit (incl Rubber Buffers)", sku: "14-005-00006", priceUSD: 7.96, image: "14-005-00006.jpg" },
  { name: "P100P Battery Socket Upper Housing", sku: "02-001-08009", priceUSD: 3.03, image: "02-001-08009.jpg" },
  { name: "P100P Battery Socket Lower Housing", sku: "02-001-08462", priceUSD: 8.61, image: "02-001-08462.jpg" },
  { name: "P100P M4*12 Countersunk Screw", sku: "02-004-00994", priceUSD: 0.86, image: "02-004-00994.png" },
  { name: "P100P Battery Guide Rubber Buffer", sku: "02-001-08078", priceUSD: 0.86, image: "02-001-08078.jpg" },

  // === REVOSPRAY SYSTEM - MAIN BODY ===
  { name: "P100P Peristaltic Pump Tube Kit", sku: "14-006-00007", priceUSD: 31.25, image: "14-006-00007.jpg" },
  { name: "P100P Landing Skid (for Liquid Container, Right)", sku: "02-002-10890", priceUSD: 333.30, image: "02-002-10890.jpg" },
  { name: "P100P Landing Skid (for Liquid Container, Left)", sku: "02-002-10891", priceUSD: 333.30, image: "02-002-10891.jpg" },
  { name: "P100P Application System Upper Frame", sku: "02-001-09245", priceUSD: 229.49, image: "02-001-09245.jpg" },
  { name: "P100P Application System Landing Skid Clamp", sku: "02-001-08764", priceUSD: 8.39, image: "02-001-08764.jpg" },
  { name: "P100P Liquid Container Lid", sku: "14-005-00003", priceUSD: 11.05, image: "14-005-00003.jpg" },
  { name: "P100P 3-Way Tube Fitting (incl. Pulsation Damper)", sku: "05-002-01749", priceUSD: 24.25, image: "05-002-01749.jpg" },
  { name: "P100P Liquid Container Bottom Outlet Tube Fitting Seal", sku: "02-001-06593", priceUSD: 0.86, image: "02-001-06593.jpg" },
  { name: "P100P Liquid Container -50L", sku: "02-001-09424", priceUSD: 156.25, image: "02-001-09424.jpg" },
  { name: "P100P Liquid Container Bottom Outlet 4-Way Tube Fitting Kit", sku: "14-006-00030", priceUSD: 23.45, image: "14-006-00030.jpg" },
  { name: "P100P Spraying System Cable Hub", sku: "05-002-01736", priceUSD: 355.10, image: "05-002-01736.jpg" },
  { name: "P100P Peristaltic Pump (Type A)-11L", sku: "14-006-00079", priceUSD: 76.38, image: "14-006-00022.jpg" },
  { name: "P100P Spraying Container Landing Skid Clamp", sku: "02-002-12226", priceUSD: 16.45, image: "02-002-12226.jpg" },
  { name: "P100P Short Liquid Tube (Pulsation Damper - L-Type)", sku: "14-006-00032", priceUSD: 10.95, image: "14-006-00032.jpg" },
  { name: "P100P Granule Container Landing Skid Clamp Rubber Pad", sku: "02-001-08449", priceUSD: 1.26, image: "02-001-08449.jpg" },
  { name: "P100P Peristaltic Pump (Type B)-11L", sku: "14-006-00023", priceUSD: 76.38, image: "14-006-00023.jpg" },
  { name: "P100P Pump Motor (incl. Gearbox) -11L", sku: "14-006-00021", priceUSD: 1176.35, image: "14-006-00021.jpg" },
  { name: "P100P L-Type Tube Fitting (for Pump)", sku: "02-001-08036", priceUSD: 2.12, image: "02-001-08036.jpg" },
  { name: "P100P Short Liquid Tube (for Pump Inlet)", sku: "14-006-00031", priceUSD: 7.05, image: "14-006-00031.jpg" },
  { name: "P100P Container Level Detector", sku: "05-002-01728", priceUSD: 470.43, image: "05-002-01728.jpg" },
  { name: "P100P Liquid Container Bottom Outlet Tube Fitting Nut", sku: "02-001-06717", priceUSD: 1.69, image: "02-001-06717.jpg" },
  { name: "P100P Container Level Detector Seal", sku: "02-001-08883", priceUSD: 3.15, image: "02-001-08883.jpg" },
  { name: "P100P Liquid Container Inlet Filter", sku: "02-001-05108", priceUSD: 12.57, image: "02-001-05108.jpg" },
  { name: "P100P Short Liquid Tube (Liquid Container Bottom Outlet - Pump)", sku: "14-006-00014", priceUSD: 48.45, image: "14-006-00014.jpg" },
  { name: "P100P Container Interior Bracket (Upper)", sku: "02-001-08693", priceUSD: 16.45, image: "02-001-08693.jpg" },
  { name: "P100P Application System Upper Frame Screw Destproof Cover", sku: "02-001-07952", priceUSD: 1.69, image: "02-001-07952.jpg" },
  { name: "P100P Liquid Container Tube Fitting Bracket", sku: "02-001-08357", priceUSD: 4.61, image: "02-001-08357.jpg" },
  { name: "P100P Container Level Detector Cable Clip", sku: "02-001-08725", priceUSD: 3.15, image: "02-001-08725.jpg" },
  { name: "P100P Container Interior Upper Bracket Seal", sku: "02-001-08724", priceUSD: 3.95, image: "02-001-08724.jpg" },
  { name: "P100P Application System Cable Organizer", sku: "02-001-08110", priceUSD: 2.12, image: "02-001-08110.jpg" },

  // === REVOCAST - MAIN BODY ===
  { name: "P100P Landing Skid (for Granule Container, Right)", sku: "02-002-10845", priceUSD: 333.30, image: "02-002-10845.jpg" },
  { name: "P100P Granule Container Lid", sku: "02-001-08726", priceUSD: 18.00, image: "02-001-08726.jpg" },
  { name: "P100P Landing Skid (for Granule Container, Left)", sku: "02-002-10846", priceUSD: 333.30, image: "02-002-10846.jpg" },
  { name: "P100P Granule Container -80L", sku: "02-001-08692", priceUSD: 171.10, image: "02-001-08692.jpg" },
  { name: "P100P Small Cable Clip", sku: "02-001-08200-small", priceUSD: 0.43, image: "02-001-08200.jpg" },
  { name: "P100P Cable Clip", sku: "02-001-08737", priceUSD: 3.15, image: "02-001-08737.jpg" },
  { name: "P100P Granule Container Interior Bracket (Lower)", sku: "02-002-10599", priceUSD: 12.17, image: "02-002-10599.jpg" },
  { name: "P100P Granule Container Landing Skid Clamp", sku: "02-002-10303", priceUSD: 15.52, image: "02-002-10303.jpg" },
  { name: "P100P Spreading System Cable Hub", sku: "05-002-01729", priceUSD: 402.21, image: "05-002-01729.jpg" },

  // === REVOCAST - SPREADER ===
  { name: "P100P Spreader Disc Flange", sku: "02-001-08496", priceUSD: 12.57, image: "02-001-08496.jpg" },
  { name: "P100P Spreader Disc (Right)", sku: "02-001-08769", priceUSD: 32.27, image: "02-001-08769.jpg" },
  { name: "P100P Spreader Disc (Left)", sku: "02-001-08768", priceUSD: 32.27, image: "02-001-08768.jpg" },
  { name: "P100P Spreader Disc Casing (Outer, Right)", sku: "02-001-08771", priceUSD: 60.73, image: "02-001-08771.jpg" },
  { name: "P100P Spreader Disc Casing Interior Flap (Left)", sku: "02-001-08330", priceUSD: 2.52, image: "02-001-08330.jpg" },
  { name: "P100P Spreader Disc Casing (Outer, Left)", sku: "02-001-08772", priceUSD: 60.73, image: "02-001-08772.jpg" },
  { name: "P100P Spreader Disc Casing (Inner, Left)", sku: "02-001-08909", priceUSD: 69.95, image: "02-001-08909.jpg" },
  { name: "P100P Spiral Feeder Main Frame", sku: "02-001-08767", priceUSD: 277.22, image: "02-001-08767.jpg" },
  { name: "P100P Spiral Feeder Motor Interial Seal", sku: "02-001-07801", priceUSD: 0.43, image: "02-001-07801.jpg" },
  { name: "P100P Spiral Feeder Motor Gear Shaft Seal", sku: "02-001-08068", priceUSD: 0.43, image: "02-001-08068.jpg" },
  { name: "P100P Spiral Feeder Outlet End Pin Seal", sku: "02-001-08067", priceUSD: 0.43, image: "02-001-08067.jpg" },
  { name: "P100P M4x8 Screw", sku: "02-004-01031", priceUSD: 1.46, image: "02-004-01031.png" },
  { name: "P100P ST4.2*14 Tapping Screw", sku: "02-004-00891", priceUSD: 0.86, image: "02-004-00891.png" },
  { name: "P100P ST2.9*10 Tapping Screw", sku: "02-004-00890", priceUSD: 0.86, image: "02-004-00890.png" },
  { name: "P100P M5*10*10 Screw Kit", sku: "02-004-00747", priceUSD: 0.86, image: "02-004-00747.png" },
  { name: "P100P Spiral Feeder Foam Cable Holder EVA", sku: "02-001-08287", priceUSD: 3.35, image: "02-001-08287.jpg" },
  { name: "P100P Spiral Feeder Casing Clamp Pin", sku: "02-002-09245", priceUSD: 4.21, image: "02-002-09245.jpg" },
  { name: "P100P Spiral Feeder Gear Shaft Gasket", sku: "02-002-09700", priceUSD: 6.30, image: "02-002-09700.jpg" },
  { name: "P100P Spiral Feeder Transfer Case Outer Casing", sku: "02-001-08766", priceUSD: 9.65, image: "02-001-08766.jpg" },
  { name: "P100P Sprial Feeder Motor Housing", sku: "02-001-09370", priceUSD: 34.40, image: "02-001-09370.jpg" },
  { name: "P100P Spiral Feeder Spline Coupling", sku: "02-002-09919", priceUSD: 30.15, image: "02-002-09919.jpg" },
  { name: "P100P Spreader Motor Cable", sku: "01-027-02200", priceUSD: 35.19, image: "01-027-02200.jpg" },
  { name: "P100P Spiral Feeder Motor Gear (Driving)", sku: "02-001-08560", priceUSD: 101.36, image: "02-001-08560.jpg" },
  { name: "P100P Spiral Feeder Gear (Driven)", sku: "02-001-08064", priceUSD: 134.43, image: "02-001-08064.jpg" },
  { name: "P100P Spreader Disc Casing Interior Flap (Right)", sku: "02-001-08329", priceUSD: 2.52, image: "02-001-08329.jpg" },
  { name: "P100P Spiral Feeder Bearing Seal", sku: "02-001-07800", priceUSD: 3.78, image: "02-001-07800.jpg" },
  { name: "P100P Sprial Feeder Casing Clamp", sku: "05-002-01389", priceUSD: 40.20, image: "05-002-01389.jpg" },
  { name: "P100P Spiral Feeder Casing", sku: "02-001-09233", priceUSD: 100.93, image: "02-001-09233.jpg" },
  { name: "P100P Spiral Feeder (Extra Large, right)", sku: "14-006-00020", priceUSD: 177.35, image: "14-006-00020.jpg" },
  { name: "P100P Spiral Feeder (Extra Large, left)", sku: "14-006-00019", priceUSD: 177.35, image: "14-006-00019.jpg" },
  { name: "P100P Spiral Feeder Motor Cable", sku: "01-027-02520", priceUSD: 199.25, image: "01-027-02520.jpg" },
  { name: "P100P Spreader Motor", sku: "14-005-00033", priceUSD: 288.53, image: "14-005-00033.jpg" },
  { name: "P100P Spiral Feeder Motor (incl. Primary Gearbox)", sku: "14-006-00011", priceUSD: 1094.81, image: "14-006-00011.jpg" },
];

// Exchange rates
const USD_TO_EUR = 0.92;
const VAT_RATE = 1.23; // 23% VAT
const EUR_TO_PLN = 4.30;

// Download image function with better error handling
async function downloadImage(imageFilename: string, sourceImage: string, destDir: string): Promise<boolean> {
  const filePath = path.join(destDir, imageFilename);

  // Check if file already exists
  if (fs.existsSync(filePath)) {
    return true;
  }

  // Try different URL patterns
  const urls = [
    `https://raptordynamic.com/cdn/shop/products/${sourceImage}`,
    `https://raptordynamic.com/cdn/shop/files/${sourceImage}`,
  ];

  for (const url of urls) {
    try {
      await new Promise<void>((resolve, reject) => {
        const file = fs.createWriteStream(filePath);
        https.get(url, (response) => {
          if (response.statusCode === 200) {
            response.pipe(file);
            file.on('finish', () => {
              file.close();
              resolve();
            });
          } else if (response.statusCode === 301 || response.statusCode === 302) {
            file.close();
            fs.unlinkSync(filePath);
            const redirectUrl = response.headers.location;
            if (redirectUrl) {
              https.get(redirectUrl, (redirectResponse) => {
                if (redirectResponse.statusCode === 200) {
                  const newFile = fs.createWriteStream(filePath);
                  redirectResponse.pipe(newFile);
                  newFile.on('finish', () => {
                    newFile.close();
                    resolve();
                  });
                } else {
                  reject(new Error(`Redirect failed: ${redirectResponse.statusCode}`));
                }
              }).on('error', reject);
            } else {
              reject(new Error('No redirect URL'));
            }
          } else {
            file.close();
            fs.unlinkSync(filePath);
            reject(new Error(`HTTP ${response.statusCode}`));
          }
        }).on('error', (err) => {
          file.close();
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          reject(err);
        });
      });
      return true;
    } catch (e) {
      // Try next URL
      continue;
    }
  }
  return false;
}

// Generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Convert prices
function convertPrices(priceUSD: number): { priceEURCents: number; pricePLNCents: number } {
  const priceEUR = priceUSD * USD_TO_EUR * VAT_RATE;
  const pricePLN = priceEUR * EUR_TO_PLN;

  return {
    priceEURCents: Math.round(priceEUR * 100),
    pricePLNCents: Math.round(pricePLN * 100),
  };
}

async function main() {
  console.log('='.repeat(60));
  console.log('P100 Pro Spare Parts Seeder');
  console.log('='.repeat(60));
  console.log(`Total products to process: ${rawProducts.length}`);

  // Create images directory
  const imagesDir = path.join(process.cwd(), 'public', 'images', 'products', 'p100-pro');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
  console.log(`\nImages directory: ${imagesDir}`);

  // Process products
  let created = 0;
  let skipped = 0;
  let errors = 0;
  let imagesFailed = 0;

  console.log('\n--- Processing Products ---\n');

  for (const product of rawProducts) {
    try {
      // Check if product already exists by SKU
      const existing = await prisma.product.findUnique({
        where: { sku: product.sku }
      });

      if (existing) {
        console.log(`SKIP: ${product.sku} - already exists`);
        skipped++;
        continue;
      }

      // Determine file extension
      const ext = product.image.split('.').pop()?.split('?')[0] || 'jpg';
      const imageFilename = `${product.sku}.${ext}`;

      // Download image
      const downloaded = await downloadImage(imageFilename, product.image, imagesDir);
      if (!downloaded) {
        console.log(`  Warning: Could not download image for ${product.sku}`);
        imagesFailed++;
      }

      // Convert prices
      const { priceEURCents, pricePLNCents } = convertPrices(product.priceUSD);

      // Create product
      const slug = generateSlug(product.name);
      const mainImage = `/images/products/p100-pro/${imageFilename}`;

      await prisma.product.create({
        data: {
          name: product.name,
          slug: slug,
          sku: product.sku,
          description: `Original spare part for XAG P100 Pro: ${product.name}`,
          price: pricePLNCents,
          priceEUR: priceEURCents,
          stock: 10,
          mainImage: mainImage,
          images: JSON.stringify([mainImage]),
          category: 'P100 Pro',
          type: 'SPARE_PART',
          isActive: true,
        }
      });

      console.log(`ADD: ${product.sku} - ${product.name}`);
      console.log(`     USD: $${product.priceUSD.toFixed(2)} -> EUR: €${(priceEURCents/100).toFixed(2)} -> PLN: ${(pricePLNCents/100).toFixed(2)} zł`);
      created++;

      // Small delay to be nice to the server
      await new Promise(resolve => setTimeout(resolve, 50));

    } catch (err: any) {
      console.error(`ERROR: ${product.sku} - ${product.name}:`, err.message);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Created: ${created}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Errors:  ${errors}`);
  console.log(`Images failed: ${imagesFailed}`);
  console.log(`Total:   ${rawProducts.length}`);

  await prisma.$disconnect();
}

main().catch(console.error);
