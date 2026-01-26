import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

const prisma = new PrismaClient();

// P150 Max spare parts data
const p150MaxParts = [
  // Fuselage Front Compartment Frame
  { sku: '02-001-11140', name: 'P150 Arm (Motor Side)', image: 'https://raptordynamic.com/cdn/shop/files/Spare_parts_51130fec-9b49-4f3e-8384-0cae2eb251dc.png' },
  { sku: '14-007-00034', name: 'P150 Arm (Fuselage Side)', image: 'https://raptordynamic.com/cdn/shop/files/Arm_Fuselage_Side_697d76f3-0a25-43c2-9e5a-9fb4077ee6bd.png' },
  { sku: '02-001-11502', name: 'P150 Fixed inserts for motor base', image: 'https://raptordynamic.com/cdn/shop/files/Fixed_inserts_for_motor_base.jpg' },
  { sku: '14-006-00049', name: 'P150 Arm Clamp Clip Kit', image: 'https://raptordynamic.com/cdn/shop/files/Arm_Clamp_Clip_Kit_7b520d4e-df2e-4bd1-addd-7ee422a9c693.png' },
  { sku: '02-001-12041', name: 'P150 Arm folding fixed seat', image: 'https://raptordynamic.com/cdn/shop/files/Arm_folding_fixed_seat_07dab039-7ab1-42d9-8cfa-83a00b895465.png' },
  { sku: '02-001-10796', name: 'P150 Arm folding buckle seat', image: 'https://raptordynamic.com/cdn/shop/files/Arm_folding_buckle_seat_7ac3b56a-9d60-471e-a887-30847ea57657.png' },
  { sku: '05-002-02069', name: 'P150 Anti drip valve', image: 'https://raptordynamic.com/cdn/shop/files/Anti_drip_valve_b389d69b-7bb2-434f-bcde-12e7aaf38540.png' },
  { sku: '02-001-11010', name: 'P150 ESC base seat upper shell', image: 'https://raptordynamic.com/cdn/shop/files/ESC_base_seat_upper_shell_5d0a7cf3-624c-47e2-83de-761cc0df49c6.png' },
  { sku: '02-001-11016', name: 'P150 ESC base seat lower shell', image: 'https://raptordynamic.com/cdn/shop/files/ESC_base_seat_lower_shell_e6ee2b95-175e-499d-9a4d-5be942400f43.png' },
  { sku: '14-006-00044', name: 'P150 Arm Clamp Clip Pin', image: 'https://raptordynamic.com/cdn/shop/files/Arm_Clamp_Clip_Pin_c3dad6fc-d4ea-4bab-8463-3ccb341d28f1.png' },
  { sku: '02-001-08857', name: 'P150 Boom Fixing Part', image: 'https://raptordynamic.com/cdn/shop/files/22P008_Boom_Fixing_Part_A2_e5f3ccaa-52e8-4a68-b7c6-6d8fed5229dc.png' },
  { sku: '02-001-10871', name: 'P150 ESC cable trunking', image: 'https://raptordynamic.com/cdn/shop/files/ESC_cable_trunking_5ed5d73d-5070-43d9-9ae2-119453138e3a.png' },
  { sku: '02-001-10954', name: 'P150 L-shaped water pipe adapter', image: 'https://raptordynamic.com/cdn/shop/files/L-shaped_water_pipe_adapter_at_the_motor_side_19ace3f8-89cb-47e0-a990-d89fa60b8934.png' },
  { sku: '02-001-10861', name: 'P150 ESC hole anti-wear component', image: 'https://raptordynamic.com/cdn/shop/files/ESC_hole_anti-wear_component_3005c2c6-134d-4bf5-934f-404979c2fd7a.png' },
  { sku: '14-007-00024', name: 'P150 Cover Plug', image: 'https://raptordynamic.com/cdn/shop/files/Cover_Plug_076275ae-3556-436c-aaf5-4d8975259a45.png' },

  // Power System
  { sku: '05-002-02094', name: 'P150 Motor', image: 'https://raptordynamic.com/cdn/shop/files/Motor_c84eb830-f33b-4574-96b6-996f4d7bdb05.png' },
  { sku: '01-027-02826', name: 'P150 ESC power supply cable', image: 'https://raptordynamic.com/cdn/shop/files/ESC_power_supply_cable_842e1aa1-a281-4bc3-8ed2-dc99bc02dc44.png' },
  { sku: '05-002-02291', name: 'P150 ESC', image: 'https://raptordynamic.com/cdn/shop/files/Spare_parts_ad1846e0-ae4f-49c8-a38e-2fc629b3ed60.png' },
  { sku: '02-001-11012', name: 'P150 CW propeller blade gasket', image: 'https://raptordynamic.com/cdn/shop/files/Spare_parts_6611c451-7f97-4508-9078-01c7f11c61fd.png' },
  { sku: '01-027-02864', name: 'P150 3&4 ESC power supply cable', image: 'https://raptordynamic.com/cdn/shop/files/3_4_ESC_power_supply_cable_8923c5f1-4e1f-4c56-8519-402b73123dc5.png' },
  { sku: '02-001-11013', name: 'P150 CCW propeller blade gasket', image: 'https://raptordynamic.com/cdn/shop/files/Spare_parts_6611c451-7f97-4508-9078-01c7f11c61fd.png' },
  { sku: '02-002-13256', name: 'P150 Motor Bearing', image: 'https://raptordynamic.com/cdn/shop/files/Motor_Bearing_a89c35ee-de55-461d-8a6c-6bd1c8cbd7b8.png' },
  { sku: '02-001-10870', name: 'P150 ESC lamp housing', image: 'https://raptordynamic.com/cdn/shop/files/ESC_lamp_housing_083e41c1-bae0-40e2-9cf2-f08e1dd968d0.png' },
  { sku: '02-002-14279', name: 'P150 48.5" propeller clamp fixing seat', image: 'https://raptordynamic.com/cdn/shop/files/Spare_parts_a3e22c16-678a-44df-9767-c90363565d3c.png' },
  { sku: '01-027-02863', name: 'P150 1&2 ESC signal cable', image: 'https://raptordynamic.com/cdn/shop/files/1_2_ESC_signal_cable_ab435a8e-0cc8-45d8-8c9b-dba24d0b1693.png' },

  // Arm Frame
  { sku: '05-002-02051', name: 'P150 Front Hood', image: 'https://raptordynamic.com/cdn/shop/files/Front_Hood_f1879976-1bbb-426d-a17f-abe84c833778.png' },
  { sku: '02-001-10854', name: 'P150 Nose mount', image: 'https://raptordynamic.com/cdn/shop/files/Nose_mount_3d3b60d5-141c-4e87-9f08-43ccea7ee6da.png' },
  { sku: '02-001-10855', name: 'P150 Head cable trunking', image: 'https://raptordynamic.com/cdn/shop/files/Head_cable_trunking_48b2bd60-4eb0-486a-85de-f9a686503621.png' },

  // FC and Sensing System
  { sku: '14-007-00174', name: 'P150 Central Cable Hub', image: 'https://raptordynamic.com/cdn/shop/files/Spare_parts_969c4e2e-cff6-47df-b0ce-1b7423ac650a.png' },
  { sku: '14-007-00025', name: 'P150 Sensing System Cover', image: 'https://raptordynamic.com/cdn/shop/files/Sensing_System_Cover_fba679ab-0742-4480-bbfa-b6581ad33176.png' },
  { sku: '01-027-02861', name: 'P150 Sensing system communication cable', image: 'https://raptordynamic.com/cdn/shop/files/Sensing_system_communication_cable_3d83bc61-11b4-4487-9a09-db32a2dbb12b.png' },
  { sku: '14-007-00101', name: 'P150 Terrain Module PCBA', image: 'https://raptordynamic.com/cdn/shop/files/Terrain_Module_PCBA_791f10d5-b967-411e-9d6c-7561b87a0751.png' },
  { sku: '14-007-00009', name: 'P150 Terrain following radar cable', image: 'https://raptordynamic.com/cdn/shop/files/Terrain_following_radar_cable_d9c4355b-48dd-4276-a175-a8ce1e0527c7.png' },
  { sku: '05-002-02304', name: 'P150 Sensing System - Overseas Version', image: 'https://raptordynamic.com/cdn/shop/files/Spare_parts_7e455ae0-07d6-4697-bf4e-5d8f49f3cb96.png' },
  { sku: '01-027-02862', name: 'P150 Flight Control & Cable Hub Communication Cable', image: 'https://raptordynamic.com/cdn/shop/files/Flight_Control_Cable_Hub_Communication_Cable_d29172e0-3e44-4429-9bf8-765bdf7a1228.png' },
  { sku: '14-007-00010', name: 'P150 Terrain following radar shell', image: 'https://raptordynamic.com/cdn/shop/files/Terrain_following_radar_shell_22921622-c9b7-4b1f-9229-112510580400.png' },
  { sku: '14-007-00007', name: 'P150 Sensing system heat dissipation cover', image: 'https://raptordynamic.com/cdn/shop/files/Sensing_system_heat_dissipation_cover_7de93388-2ae6-4c96-b2de-09056aeee481.png' },
  { sku: '05-002-02194', name: 'P150 Flight Controller', image: 'https://raptordynamic.com/cdn/shop/files/Spare_parts_3f0188d2-8414-4463-a64a-98247fd65371.png' },
  { sku: '01-027-02830', name: 'P150 Flight control feeder - gray', image: 'https://raptordynamic.com/cdn/shop/files/Spare_parts_7124d95e-3fff-4c90-b875-5634848b262f.png' },
  { sku: '01-027-02829', name: 'P150 Flight control feeder - black', image: 'https://raptordynamic.com/cdn/shop/files/Spare_parts_b73ba53f-5960-41c2-bfa0-43cf9838acc2.png' },

  // Power System - Fuselage
  { sku: '14-007-00022', name: 'P150 Battery Socket', image: 'https://raptordynamic.com/cdn/shop/files/Battery_Socket_916b7a5c-4578-4266-bb84-11ed7883e528.png' },
  { sku: '02-001-11028', name: 'P150 Front shell of busbar', image: 'https://raptordynamic.com/cdn/shop/files/Front_shell_of_busbar_e23ec15b-d494-4450-9ddb-a4c24455804e.png' },
  { sku: '02-001-11193', name: 'P150 Battery tail plug rear case', image: 'https://raptordynamic.com/cdn/shop/files/Battery_tail_plug_rear_case_87d052e1-3839-454a-9998-4ebb3ace62b7.png' },
  { sku: '02-001-11192', name: 'P150 Battery tail plug front case', image: 'https://raptordynamic.com/cdn/shop/files/Battery_tail_plug_front_case_3d3bc33e-6e37-4715-bdd8-f489da87f440.png' },
  { sku: '02-002-13612', name: 'P150 Tail plug copper bar - single', image: 'https://raptordynamic.com/cdn/shop/files/Tail_plug_copper_bar_-_single_30707345-133e-4430-acc5-978431d7272a.png' },
  { sku: '02-002-13613', name: 'P150 Tail plug copper bar - double', image: 'https://raptordynamic.com/cdn/shop/files/Tail_plug_copper_bar_-_double_2551d843-8ff4-4822-83b6-8cce9d651c46.png' },
  { sku: '02-001-10739', name: 'P150 Rear shell of busbar', image: 'https://raptordynamic.com/cdn/shop/files/Rear_shell_of_busbar_ccd7bfe3-fec6-4fec-8c72-3205c0995a96.png' },
  { sku: '01-027-02865', name: 'P150 Battery communication cable', image: 'https://raptordynamic.com/cdn/shop/files/Battery_communication_cable_59480fef-a0ab-4145-9b54-8d3e06002d08.png' },
  { sku: '01-027-02780', name: 'P150 Cable Hub power supply cable', image: 'https://raptordynamic.com/cdn/shop/files/Cable_Hub_power_supply_cable_b8709547-7cdd-414e-9de2-dd81ba9af8b1.png' },

  // FC and Sensing - Antennas
  { sku: '01-003-00411', name: 'P150 RTK Antenna (Left)', image: 'https://raptordynamic.com/cdn/shop/files/RTK_Antenna_Left_823d5294-bbd1-4107-b908-799696e8c6e3.png' },
  { sku: '14-007-00018', name: 'P150 Radio Antenna (Right)', image: 'https://raptordynamic.com/cdn/shop/files/Radio_Antenna_Right_2e4a39fb-15da-4a03-87eb-207ed83db61e.png' },
  { sku: '01-003-00410', name: 'P150 RTK Antenna (Right)', image: 'https://raptordynamic.com/cdn/shop/files/RTK_Antenna_Right_25ca3437-5b34-4bb2-bc37-2649d3f814e2.png' },
  { sku: '14-007-00021', name: 'P150 Radio Antenna (Left)', image: 'https://raptordynamic.com/cdn/shop/files/Radio_Antenna_Left_5cc38fe3-30f9-47f9-8657-99cf374717fe.png' },
  { sku: '01-003-00412', name: 'P150 4G Antenna', image: 'https://raptordynamic.com/cdn/shop/files/4G_Antenna_01b535cb-322d-4833-a7da-705c12c325e6.png' },

  // Revospray/Revocast System
  { sku: '14-007-00019', name: 'P150 Water pipe adapter - right', image: 'https://raptordynamic.com/cdn/shop/files/Water_pipe_adapter_-_right_e96ac87c-f4f3-46ac-b152-85413461a7e6.png' },
  { sku: '14-007-00017', name: 'P150 Water pipe adapter - left', image: 'https://raptordynamic.com/cdn/shop/files/Water_pipe_adapter_-_left_84b5980d-3ddb-4aff-860a-650a9dc3def7.png' },
  { sku: '01-027-02867', name: 'P150 Application System Main Connect Cable', image: 'https://raptordynamic.com/cdn/shop/files/Application_System_Main_Connect_Cable_a28e7066-4cc2-40f2-a8ee-f17aa39bd74b.png' },

  // RealTerra
  { sku: '14-007-00116', name: 'P150 Application System tube connector', image: 'https://raptordynamic.com/cdn/shop/files/Spare_parts_67f717cd-64d9-4f40-ba4d-37e6ba920959.png' },
  { sku: '02-002-13943', name: 'P150 Spray Tripod Pipe', image: 'https://raptordynamic.com/cdn/shop/files/Spray_Tripod_Pipe_602cdec5-b9b5-4857-98e2-4538846be223.png' },
  { sku: '02-002-14300', name: 'P150 Long Application System tube', image: 'https://raptordynamic.com/cdn/shop/files/Long_Application_System_tube_828179d5-9a10-45f7-96ad-4be04e253918.png' },
  { sku: '14-007-00046', name: 'P150 Ground contact component tripod No.2', image: 'https://raptordynamic.com/cdn/shop/files/Ground_contact_component_of_tripod_No.2_ebafc138-3bd2-4f8b-bade-7b7b3d789a9d.png' },
  { sku: '14-007-00047', name: 'P150 Ground contact component tripod No.1', image: 'https://raptordynamic.com/cdn/shop/files/Ground_contact_component_of_tripod_No.1_5469102f-0919-4aa7-83e4-79bdd38cbc47.png' },
  { sku: '05-002-02213', name: 'P150 RealTerra Module', image: 'https://raptordynamic.com/cdn/shop/files/Spare_parts_4e2b52f6-385d-49e8-8f59-e77e25647f10.png' },
  { sku: '02-002-14301', name: 'P150 Short Application System tube', image: 'https://raptordynamic.com/cdn/shop/files/Short_Application_System_tube_b253e932-4bba-422f-b052-7403516d528b.png' },

  // Revospray System
  { sku: '02-002-13935', name: 'P150 Tripod Crossbar', image: 'https://raptordynamic.com/cdn/shop/files/Tripod_Crossbar_00213d50-19d0-4bd0-a5c7-075b13ef7440.png' },
  { sku: '02-001-11098', name: 'P150 Medicine Box Embedded Parts', image: 'https://raptordynamic.com/cdn/shop/files/Spare_parts_f87e74c5-8fd6-4c40-b4e7-6cadda1a693e.png' },
  { sku: '02-001-11273', name: 'P150 Bottom Fixing Seat for Material Box', image: 'https://raptordynamic.com/cdn/shop/files/Spare_parts_f8dbb0d9-4575-4d38-9209-70c495462508.png' },

  // Revospray Mainbody
  { sku: '02-001-11744', name: 'P150 Flexible Impeller', image: 'https://raptordynamic.com/cdn/shop/files/Spare_parts_a51e07ba-7e46-43e8-a9ed-1c5740943bae.png' },
  { sku: '05-002-02066', name: 'P150 Air Pressure Gauge', image: 'https://raptordynamic.com/cdn/shop/files/Air_Pressure_Gauge_d5430a78-1634-4057-81e2-fb6ce57d4e17.png' },
  { sku: '14-007-00050', name: 'P150 Flexible Impeller Pump Motor', image: 'https://raptordynamic.com/cdn/shop/files/Flexible_Impeller_Pump_Motor_42ca5608-81ee-4be0-8e91-efacb0d44e5d.png' },
  { sku: '02-001-10417', name: 'P150 Impeller Pump Head Gasket', image: 'https://raptordynamic.com/cdn/shop/files/Impeller_Pump_Head_Gasket_18735149-57c4-4700-a283-f97d50c7c34c.png' },
  { sku: '02-001-10886', name: 'P150 Air Pressure Gauge Sealing Ring', image: 'https://raptordynamic.com/cdn/shop/files/Air_Pressure_Gauge_Radar_Sealing_Ring_01bdc5f8-a931-4a4c-9026-eb30b6370afb.png' },
  { sku: '02-001-11024', name: 'P150 70L Smart Medicine Box', image: 'https://raptordynamic.com/cdn/shop/files/70L-_Smart_Medicine_Box_bf23d0c4-8d54-4f53-bbce-9cedc3b76d08.png' },
  { sku: '14-007-00074', name: 'P150 Impeller Pump Support Frame', image: 'https://raptordynamic.com/cdn/shop/files/Impeller_Pump_Support_Frame_e32c880a-1fab-4745-ab97-2191c1d30d99.png' },
  { sku: '14-007-00051', name: 'P150 Flexible Impeller Pump Body', image: 'https://raptordynamic.com/cdn/shop/files/Flexible_Impeller_Pump_Body_d00670a9-5fa7-4b7a-82b7-f87b6b5daac9.png' },
  { sku: '14-007-00039', name: 'P150 Air Pressure Gauge Hose', image: 'https://raptordynamic.com/cdn/shop/files/Air_Pressure_Gauge_Hose_b956f0de-f3d0-409b-83b4-796a01cc48cb.png' },
  { sku: '02-001-10996', name: 'P150 Impeller Pump Output Shaft Seal', image: 'https://raptordynamic.com/cdn/shop/files/Impeller_Pump_Output_Shaft_Seal_af4eba4b-2dfc-4d90-ad18-20032edfdf96.png' },
  { sku: '02-002-13680', name: 'P150 Flexible Impeller Pump Cover', image: 'https://raptordynamic.com/cdn/shop/files/Flexible_Impeller_Pump_Cover_e3de7341-c4d7-40cc-9c62-51e12ba8d55e.png' },
  { sku: '14-007-00052', name: 'P150 Air Pressure Gauge Base', image: 'https://raptordynamic.com/cdn/shop/files/Air_Pressure_Gauge_Base_0a884d6b-a8ec-44b0-937e-cd3cc952c197.png' },
  { sku: '14-007-00016', name: 'P150 L-Type Connector & Bend Pipe', image: 'https://raptordynamic.com/cdn/shop/files/L-Type_Connector_Aircraft_End_Bend_Pipe_Medicine_Liquid_Transfer_Pipe_7c79b9ee-0817-4fff-af74-e58df7af6cae.png' },
  { sku: '02-001-11201', name: 'P150 Impeller Pump Gear Ring', image: 'https://raptordynamic.com/cdn/shop/files/Impeller_Pump_Gear_Ring_6c98d02d-88c4-4839-b8e3-66af67382874.png' },
  { sku: '14-007-00040', name: 'P150 Impeller Pump Y-Type Connector', image: 'https://raptordynamic.com/cdn/shop/files/Impeller_Pump_Y-Type_Connector_Head_Medicine_Liquid_Transfer_Pipe_17911480-aa3e-41b7-a16b-6da18e122edd.png' },
  { sku: '05-002-02210', name: 'P150 Application System Collection Box', image: 'https://raptordynamic.com/cdn/shop/files/Spare_parts_f0b6a093-dd25-4417-ab67-d3136b2ed076.png' },
  { sku: '01-027-02868', name: 'P150 Application System Collection Board Signal Line', image: 'https://raptordynamic.com/cdn/shop/files/Application_System_Collection_Board_Signal_Line_91d89fe6-5606-44fa-bb5a-88b626304c20.png' },

  // Nozzle System
  { sku: '02-001-09892', name: 'P150 Nozzle Disc', image: 'https://raptordynamic.com/cdn/shop/files/Nozzle_Disc_d66fca89-f775-4e10-8bbd-44b832b9f120.png' },
  { sku: '01-027-02866', name: 'P150 Nozzle Adaptor Cable', image: 'https://raptordynamic.com/cdn/shop/files/Nozzle_Adaptor_Cable_ca797cbe-1666-45b1-aef9-b38c11f983e6.png' },
  { sku: '05-002-02065', name: 'P150 Nozzle', image: 'https://raptordynamic.com/cdn/shop/files/Nozzle_9220508a-4e4d-45ff-b60d-beb89eaa561f.png' },
  { sku: '14-007-00023', name: 'P150 Fuselage Side Liquid Transfer Tube', image: 'https://raptordynamic.com/cdn/shop/files/fuselage_side_motor_side_liquid_transfer_tube_c830e8a9-e1c4-4720-866f-102e4dc99965.png' },
  { sku: '14-007-00133', name: 'P150 Nozzle Motor Guide Cover Assembly', image: 'https://raptordynamic.com/cdn/shop/files/Spare_parts_053d1eb0-609c-494c-9a13-c4f539b9b36b.png' },
  { sku: '14-007-00098', name: 'P150 Nozzle ESC Board', image: 'https://raptordynamic.com/cdn/shop/files/Nozzle_ESC_board_4215094c-e062-429c-a8ef-fcc82f493957.png' },
  { sku: '14-007-00013', name: 'P150 Unidirectional Valve Nozzle Transfer Pipe', image: 'https://raptordynamic.com/cdn/shop/files/Unidirectional_valve_nozzle_liquid_transfer_pipe_6b7cd448-cfdb-4908-a8e5-a6fe262efabd.png' },
  { sku: '14-007-00012', name: 'P150 Motor Side One-Way Valve Transfer Pipe', image: 'https://raptordynamic.com/cdn/shop/files/Motor_side_one-way_valve_liquid_transfer_pipe_298cfb27-490f-4400-a28c-01c60eba3e04.png' },

  // RevoCast
  { sku: '14-007-00076', name: 'P150 Middle Connecting Rod Assembly', image: 'https://raptordynamic.com/cdn/shop/files/Middle_Connecting_Rod_Assembly_1b15945a-70e2-42b1-9018-e580a29e83c9.png' },
  { sku: '02-002-09459', name: 'P150 Magnetic Steel', image: 'https://raptordynamic.com/cdn/shop/files/Magnetic_Steel_03db2328-5e9e-419f-8500-f8e9732e53ff.png' },
  { sku: '01-027-02869', name: 'P150 Hall Sensor Wire', image: 'https://raptordynamic.com/cdn/shop/files/Hall_Sensor_Wire_c94a369d-a2ef-4981-830f-ad2b446820be.png' },
  { sku: '02-001-07784', name: 'P150 Gearbox Silicone O-Ring', image: 'https://raptordynamic.com/cdn/shop/files/Gearbox_Silicone_O-Ring_f6b5b20d-629a-4ed4-acf3-a33502f36f8b.png' },
  { sku: '14-007-00090', name: 'P150 Eccentric Connecting Rod Fixed Component', image: 'https://raptordynamic.com/cdn/shop/files/Eccentric_Connecting_Rod_Opposite_Side_Fixed_Component_fcda43f3-9cf7-4b76-bb0f-cf66f3cfb5f7.png' },
  { sku: '02-001-10505', name: 'P150 Eccentric Connecting Rod Sealing Ring', image: 'https://raptordynamic.com/cdn/shop/files/Eccentric_Connecting_Rod_Inner_Support_Cover_Sealing_Ring_e3e98bdf-1081-4b9d-a9d5-9f46b5fea0ab.png' },
  { sku: '02-002-14441', name: 'P150 Eccentric Connecting Rod', image: 'https://raptordynamic.com/cdn/shop/files/Spare_parts_62438d9a-3140-49d7-bc23-2133abab709e.png' },
  { sku: '02-002-14111', name: 'P150 Connecting Rod Pin Shaft', image: 'https://raptordynamic.com/cdn/shop/files/Connecting_Rod_Pin_Shaft_af330a93-d40a-4092-ba21-78bc69a1a230.png' },
  { sku: '02-001-10540', name: 'P150 Female Seat Material Box Cover Buckle', image: 'https://raptordynamic.com/cdn/shop/files/Female_Seat_Material_Box_Cover_Buckle_78a49e9e-0385-4645-9b0d-429bba17c900.png' },
  { sku: '02-002-14194', name: 'P150 External Hexagonal Copper Column', image: 'https://raptordynamic.com/cdn/shop/files/External_Hexagonal_Copper_Column_96cd6d77-631f-41fc-a2cc-4147a6f41459.png' },
  { sku: '02-001-10529', name: 'P150 Application System Cable Organizer', image: 'https://raptordynamic.com/cdn/shop/files/Application_System_Cable_Organizer_6f0fc5dc-e67f-4da5-9904-7be357556653.png' },
  { sku: '02-001-10407', name: 'P150 Fixed Embedded Components Material Box Tripod', image: 'https://raptordynamic.com/cdn/shop/files/Fixed_Embedded_Components_for_the_Material_Box_Tripod_b1355665-4ff7-4de0-9510-eef1231aaf2e.png' },
  { sku: '02-002-14198', name: 'P150 Application System hook', image: 'https://raptordynamic.com/cdn/shop/files/Application_System_hook_957bebb2-a729-47ef-9f34-059896df15c6.png' },
  { sku: '02-001-10385', name: 'P150 Application System convex point', image: 'https://raptordynamic.com/cdn/shop/files/Application_System_convex_point_component_15a4616a-911e-4486-bedf-b2547fc945c8.png' },
];

const imagesDir = path.join(process.cwd(), 'public', 'images', 'products', 'p150-max');

async function downloadImage(url: string, filename: string): Promise<boolean> {
  return new Promise((resolve) => {
    const fullUrl = url.startsWith('//') ? `https:${url}` : url;
    const filePath = path.join(imagesDir, filename);

    if (fs.existsSync(filePath)) {
      console.log(`  Skipped (exists): ${filename}`);
      resolve(true);
      return;
    }

    const file = fs.createWriteStream(filePath);
    https.get(fullUrl, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`  Downloaded: ${filename}`);
          resolve(true);
        });
      } else {
        file.close();
        fs.unlinkSync(filePath);
        console.log(`  Failed (${response.statusCode}): ${filename}`);
        resolve(false);
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      console.log(`  Error: ${filename} - ${err.message}`);
      resolve(false);
    });
  });
}

async function main() {
  console.log('Creating images directory...');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  console.log(`\nProcessing ${p150MaxParts.length} P150 Max spare parts...\n`);

  for (const part of p150MaxParts) {
    const ext = part.image.includes('.jpg') ? '.jpg' : '.png';
    const filename = `${part.sku}${ext}`;
    const localImage = `/images/products/p150-max/${filename}`;

    // Download image
    await downloadImage(part.image, filename);

    // Check if product exists
    const existing = await prisma.product.findFirst({
      where: { sku: part.sku }
    });

    if (existing) {
      console.log(`  Updated: ${part.sku}`);
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: part.name,
          mainImage: localImage,
          category: 'P150 Max',
        }
      });
    } else {
      console.log(`  Created: ${part.sku}`);
      await prisma.product.create({
        data: {
          sku: part.sku,
          slug: part.sku.toLowerCase(),
          name: part.name,
          description: `P150 Max spare part - ${part.name}`,
          price: 10000, // Default price 100 PLN - update later
          priceEUR: 2300, // Default price ~23 EUR
          stock: 10,
          category: 'P150 Max',
          mainImage: localImage,
          isActive: true,
        }
      });
    }
  }

  console.log('\nDone!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
