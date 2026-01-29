'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart';
import { useB2BStore } from '@/lib/store/b2b';
import { useTranslations, useLocale } from 'next-intl';

// Type for database prices
type DbPrices = {
  price: number;
  priceEUR: number;
  compareAtPrice: number | null;
  compareAtPriceEUR: number | null;
  stock: number;
  preorderEnabled: boolean;
  preorderLeadTime: string | null;
} | null;

type Locale = 'pl' | 'en' | 'es' | 'de' | 'cs' | 'nl';

type ProductTranslation = {
  name: string;
  tagline: string | null;
  description: string;
};

type Product = {
  id: string;
  sku: string;
  slug: string;
  translations: Record<Locale, ProductTranslation>;
  mainImage: string | null;
  images: string[];
  price: number;
  priceEUR: number;
  compareAtPrice: number | null;
  compareAtPriceEUR: number | null;
  currency: 'PLN' | 'EUR';
  stock: number;
  category: string;
  type: string;
  specifications: { label: string; value: string }[];
};

const mockProducts: Record<string, Product> = {
  // ==================== LANDBORNE (UGV) ====================
  'xag-r200': {
    id: 'XAG-R200',
    sku: 'XAG-R200',
    slug: 'xag-r200',
    translations: {
      pl: {
        name: 'XAG R200',
        tagline: 'Sześciokołowa platforma precyzyjnego oprysku dla sadów i szklarni',
        description: `Pakiet zawiera:
- 1x Robot Rolniczy XAG R200 z RevoSpray (09-020-00134)
- 1x Pilot Zdalnego Sterowania XAG SRC5 (05-002-02725)
- 2x Inteligentna Bateria XAG B141050 Smart Super Charge (09-017-00073)
- 2x Ładowarka XAG CM13600S z kablem zasilającym (09-017-00069)
- 2x Kabel Zasilający EU do Ładowarki CM13600S (01-027-02823)
- 2x Wieża Chłodząca Baterie XAG 2024 (09-017-00065)`,
      },
      en: {
        name: 'XAG R200',
        tagline: 'Six-wheel precision spraying platform for orchards and greenhouses',
        description: `Package includes:
- 1x XAG R200 Agricultural Rover RevoSpray (09-020-00134)
- 1x XAG SRC5 Smart Remote Controller (05-002-02725)
- 2x XAG B141050 Smart Super Charge Battery (09-017-00073)
- 2x XAG CM13600S Charger with Plug Power Cord (09-017-00069)
- 2x XAG Plug Power Cord-EU for CM13600S Charger (01-027-02823)
- 2x XAG 2024 Battery Cooling Tower (09-017-00065)`,
      },
      es: {
        name: 'XAG R200',
        tagline: 'Plataforma de pulverización de precisión de seis ruedas para huertos e invernaderos',
        description: `El paquete incluye:
- 1x XAG R200 Agricultural Rover RevoSpray (09-020-00134)
- 1x XAG SRC5 Smart Remote Controller (05-002-02725)
- 2x XAG B141050 Smart Super Charge Battery (09-017-00073)
- 2x XAG CM13600S Charger with Plug Power Cord (09-017-00069)
- 2x XAG Plug Power Cord-EU for CM13600S Charger (01-027-02823)
- 2x XAG 2024 Battery Cooling Tower (09-017-00065)`,
      },
      de: {
        name: 'XAG R200',
        tagline: 'Sechsrad-Präzisionssprühplattform für Obstgärten und Gewächshäuser',
        description: `Paket enthält:
- 1x XAG R200 Agricultural Rover RevoSpray (09-020-00134)
- 1x XAG SRC5 Smart Remote Controller (05-002-02725)
- 2x XAG B141050 Smart Super Charge Battery (09-017-00073)
- 2x XAG CM13600S Charger with Plug Power Cord (09-017-00069)
- 2x XAG Plug Power Cord-EU for CM13600S Charger (01-027-02823)
- 2x XAG 2024 Battery Cooling Tower (09-017-00065)`,
      },
      cs: {
        name: 'XAG R200',
        tagline: 'Šestikolová platforma pro přesné postřikování v sadech a sklenících',
        description: `Balení obsahuje:
- 1x XAG R200 Agricultural Rover RevoSpray (09-020-00134)
- 1x XAG SRC5 Smart Remote Controller (05-002-02725)
- 2x XAG B141050 Smart Super Charge Battery (09-017-00073)
- 2x XAG CM13600S Charger with Plug Power Cord (09-017-00069)
- 2x XAG Plug Power Cord-EU for CM13600S Charger (01-027-02823)
- 2x XAG 2024 Battery Cooling Tower (09-017-00065)`,
      },
      nl: {
        name: 'XAG R200',
        tagline: 'Zeswiel precisie-sproeiplatform voor boomgaarden en kassen',
        description: `Pakket bevat:
- 1x XAG R200 Agricultural Rover RevoSpray (09-020-00134)
- 1x XAG SRC5 Smart Remote Controller (05-002-02725)
- 2x XAG B141050 Smart Super Charge Battery (09-017-00073)
- 2x XAG CM13600S Charger with Plug Power Cord (09-017-00069)
- 2x XAG Plug Power Cord-EU for CM13600S Charger (01-027-02823)
- 2x XAG 2024 Battery Cooling Tower (09-017-00065)`,
      },
    },
    mainImage: '/images/products/ugv/r200.png',
    images: ['/images/products/ugv/r200.png'],
    price: 9815400,
    priceEUR: 2282000,
    compareAtPrice: null,
    compareAtPriceEUR: null,
    currency: 'PLN',
    stock: 2,
    category: 'Landborne',
    type: 'PRODUCT',
    specifications: [
      { label: 'SKU', value: 'XAG-R200' },
      { label: 'Width', value: '80 cm' },
      { label: 'Weight', value: '130 kg' },
      { label: 'Max Speed', value: '1.5 m/s' },
      { label: 'Tank Capacity', value: '240 L' },
      { label: 'Spray Range', value: '7 m per side' },
      { label: 'Battery', value: '1050 Wh' },
      { label: 'Operating Time', value: '15 min' },
    ],
  },

  // ==================== SMART BATTERY ====================
  'smart-battery-b13970s': {
    id: '09-017-00064',
    sku: '09-017-00064',
    slug: 'smart-battery-b13970s',
    translations: {
      pl: {
        name: 'Inteligentna Bateria XAG B13970S',
        tagline: 'Wysokowydajna bateria do serii P150',
        description: `Inteligentna Bateria XAG B13970S to wysokowydajna bateria litowo-polimerowa zaprojektowana dla dronów rolniczych XAG P150. Wyposażona w inteligentny system zarządzania baterią dla optymalnej wydajności i żywotności.

Kluczowe cechy:
- Wysoka gęstość energii dla wydłużonego czasu lotu
- Inteligentny system zarządzania baterią (BMS)
- Monitorowanie stanu w czasie rzeczywistym
- Ochrona temperaturowa
- Kompatybilna z dronami serii XAG P150`,
      },
      en: {
        name: 'XAG Smart Battery B13970S',
        tagline: 'High-capacity smart battery for P150 series',
        description: `The XAG B13970S Smart Battery is a high-capacity lithium polymer battery designed for XAG P150 agricultural drones. Features intelligent battery management system for optimal performance and longevity.

Key Features:
- High energy density for extended flight time
- Smart battery management system (BMS)
- Real-time status monitoring
- Temperature protection
- Compatible with XAG P150 series drones`,
      },
      es: {
        name: 'Batería Inteligente XAG B13970S',
        tagline: 'Batería de alta capacidad para la serie P150',
        description: `La Batería Inteligente XAG B13970S es una batería de polímero de litio de alta capacidad diseñada para drones agrícolas XAG P150. Cuenta con un sistema inteligente de gestión de batería para un rendimiento óptimo y longevidad.

Características principales:
- Alta densidad energética para mayor tiempo de vuelo
- Sistema inteligente de gestión de batería (BMS)
- Monitoreo de estado en tiempo real
- Protección térmica
- Compatible con drones de la serie XAG P150`,
      },
      de: {
        name: 'XAG Smart Batterie B13970S',
        tagline: 'Hochkapazitäts-Smartbatterie für die P150-Serie',
        description: `Die XAG B13970S Smart Batterie ist eine Hochkapazitäts-Lithium-Polymer-Batterie für XAG P150 Agrardrohnen. Mit intelligentem Batteriemanagementsystem für optimale Leistung und Langlebigkeit.

Hauptmerkmale:
- Hohe Energiedichte für verlängerte Flugzeit
- Intelligentes Batteriemanagementsystem (BMS)
- Echtzeit-Statusüberwachung
- Temperaturschutz
- Kompatibel mit XAG P150 Drohnen`,
      },
      cs: {
        name: 'Chytrá Baterie XAG B13970S',
        tagline: 'Vysokoúčinná baterie pro sérii P150',
        description: `Chytrá baterie XAG B13970S je vysokoúčinná lithium-polymerová baterie navržená pro zemědělské drony XAG P150. Vybavena inteligentním systémem správy baterie pro optimální výkon a životnost.

Klíčové vlastnosti:
- Vysoká energetická hustota pro prodloužený čas letu
- Inteligentní systém správy baterie (BMS)
- Sledování stavu v reálném čase
- Teplotní ochrana
- Kompatibilní s drony série XAG P150`,
      },
      nl: {
        name: 'XAG Slimme Batterij B13970S',
        tagline: 'Hoge capaciteit batterij voor P150 serie',
        description: `De XAG B13970S Slimme Batterij is een lithium-polymeer batterij met hoge capaciteit ontworpen voor XAG P150 landbouwdrones. Uitgerust met intelligent batterijbeheersysteem voor optimale prestaties en levensduur.

Belangrijkste kenmerken:
- Hoge energiedichtheid voor langere vliegtijd
- Slim batterijbeheersysteem (BMS)
- Real-time statusmonitoring
- Temperatuurbeveiliging
- Compatibel met XAG P150 serie drones`,
      },
    },
    mainImage: '/images/products/smart-battery/09-017-00064-1.jpg',
    images: [
      '/images/products/smart-battery/09-017-00064-1.jpg',
      '/images/products/smart-battery/09-017-00064-2.jpg',
    ],
    price: 743600,
    priceEUR: 172930,
    compareAtPrice: null,
    compareAtPriceEUR: null,
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
  'smart-battery-b13960s': {
    id: '09-017-00025',
    sku: '09-017-00025',
    slug: 'smart-battery-b13960s',
    translations: {
      pl: {
        name: 'Inteligentna Bateria XAG B13960S',
        tagline: '20 000 mAh / 962 Wh - bateria litowo-polimerowa IP65',
        description: `Bateria litowo-polimerowa zaprojektowana dla dronów rolniczych XAG, o pojemności 20 000 mAh i energii 962 Wh. Urządzenie obsługuje inteligentne zarządzanie baterią z certyfikatem odporności IP65.

Kluczowe cechy:
- Pojemność 20 000 mAh
- Energia 962 Wh
- Odporność pogodowa IP65
- Inteligentne zarządzanie baterią
- Wsparcie szybkiego ładowania
- Monitorowanie temperatury`,
      },
      en: {
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
      },
      es: {
        name: 'Batería Inteligente XAG B13960S',
        tagline: '20.000 mAh / 962 Wh - polímero de litio IP65',
        description: `Batería inteligente de polímero de litio diseñada para drones agrícolas XAG, con capacidad de 20.000 mAh y salida de energía de 962 Wh. El dispositivo soporta gestión inteligente de batería con clasificación de resistencia IP65.

Características principales:
- Alta capacidad de 20.000 mAh
- Salida de energía de 962 Wh
- Resistencia IP65
- Gestión inteligente de batería
- Soporte de carga rápida
- Monitoreo de temperatura`,
      },
      de: {
        name: 'XAG Smart Batterie B13960S',
        tagline: '20.000 mAh / 962 Wh - IP65 Lithium-Polymer',
        description: `Eine Lithium-Polymer-Smartbatterie für XAG-Agrardrohnen mit 20.000 mAh Kapazität und 962 Wh Energieausgang. Das Gerät unterstützt intelligentes Batteriemanagement mit IP65-Wetterschutz.

Hauptmerkmale:
- 20.000 mAh hohe Kapazität
- 962 Wh Energieausgang
- IP65 Wetterschutz
- Intelligentes Batteriemanagement
- Schnellladeunterstützung
- Temperaturüberwachung`,
      },
      cs: {
        name: 'Chytrá Baterie XAG B13960S',
        tagline: '20 000 mAh / 962 Wh - lithium-polymer IP65',
        description: `Lithium-polymerová chytrá baterie navržená pro zemědělské drony XAG s kapacitou 20 000 mAh a výstupem 962 Wh. Zařízení podporuje inteligentní správu baterie s odolností IP65.

Klíčové vlastnosti:
- Vysoká kapacita 20 000 mAh
- Výstup energie 962 Wh
- Odolnost IP65
- Inteligentní správa baterie
- Podpora rychlého nabíjení
- Monitorování teploty`,
      },
      nl: {
        name: 'XAG Slimme Batterij B13960S',
        tagline: '20.000 mAh / 962 Wh - IP65 lithium-polymeer',
        description: `Een lithium-polymeer slimme batterij ontworpen voor XAG landbouwdrones, met 20.000 mAh capaciteit en 962 Wh energieoutput. Het apparaat ondersteunt intelligent batterijbeheer met IP65 weerbestendigheid.

Belangrijkste kenmerken:
- 20.000 mAh hoge capaciteit
- 962 Wh energieoutput
- IP65 weerbestendigheid
- Intelligent batterijbeheer
- Snellaadondersteuning
- Temperatuurmonitoring`,
      },
    },
    mainImage: '/images/products/smart-battery/09-017-00025-1.png',
    images: [
      '/images/products/smart-battery/09-017-00025-1.png',
      '/images/products/smart-battery/09-017-00025-2.png',
      '/images/products/smart-battery/09-017-00025-3.png',
    ],
    price: 494000,
    priceEUR: 114884,
    compareAtPrice: 743600,
    compareAtPriceEUR: 172930,
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

  // ==================== SMART BATTERY PARTS ====================
  'battery-outlet-socket-b13960s': {
    id: '01-027-01895',
    sku: '01-027-01895',
    slug: 'battery-outlet-socket-b13960s',
    translations: {
      pl: {
        name: 'Gniazdo Wyjściowe Baterii B13960S',
        tagline: 'Komponent gniazda wyjściowego baterii',
        description: `Gniazdo wyjściowe baterii B13960S to oryginalny komponent zamienny dla inteligentnych baterii XAG. Zapewnia niezawodne połączenie elektryczne między baterią a urządzeniem.

Cechy:
- Oryginalna część XAG
- Wysoka jakość wykonania
- Niezawodne połączenie elektryczne
- Kompatybilność z baterią B13960S`,
      },
      en: {
        name: 'B13960S Battery Outlet Socket',
        tagline: 'Battery outlet socket component',
        description: `The B13960S Battery Outlet Socket is an original replacement component for XAG smart batteries. Provides reliable electrical connection between the battery and device.

Features:
- Original XAG part
- High quality construction
- Reliable electrical connection
- Compatible with B13960S battery`,
      },
      es: {
        name: 'Conector de Salida de Batería B13960S',
        tagline: 'Componente de conector de salida de batería',
        description: `El Conector de Salida de Batería B13960S es un componente de repuesto original para baterías inteligentes XAG. Proporciona conexión eléctrica confiable entre la batería y el dispositivo.

Características:
- Pieza original XAG
- Construcción de alta calidad
- Conexión eléctrica confiable
- Compatible con batería B13960S`,
      },
      de: {
        name: 'B13960S Batterie-Ausgangsbuchse',
        tagline: 'Batterie-Ausgangsbuchsen-Komponente',
        description: `Die B13960S Batterie-Ausgangsbuchse ist ein Original-Ersatzteil für XAG Smart-Batterien. Bietet zuverlässige elektrische Verbindung zwischen Batterie und Gerät.

Eigenschaften:
- Original XAG-Teil
- Hochwertige Konstruktion
- Zuverlässige elektrische Verbindung
- Kompatibel mit B13960S Batterie`,
      },
      cs: {
        name: 'Výstupní Konektor Baterie B13960S',
        tagline: 'Komponent výstupního konektoru baterie',
        description: `Výstupní konektor baterie B13960S je originální náhradní díl pro chytré baterie XAG. Poskytuje spolehlivé elektrické spojení mezi baterií a zařízením.

Vlastnosti:
- Originální díl XAG
- Vysoká kvalita zpracování
- Spolehlivé elektrické spojení
- Kompatibilní s baterií B13960S`,
      },
      nl: {
        name: 'B13960S Batterij Uitgangsaansluiting',
        tagline: 'Batterij uitgangsaansluiting component',
        description: `De B13960S Batterij Uitgangsaansluiting is een origineel vervangingsonderdeel voor XAG slimme batterijen. Biedt betrouwbare elektrische verbinding tussen batterij en apparaat.

Kenmerken:
- Origineel XAG-onderdeel
- Hoogwaardige constructie
- Betrouwbare elektrische verbinding
- Compatibel met B13960S batterij`,
      },
    },
    mainImage: '/images/products/smart-battery/01-027-01895-1.png',
    images: ['/images/products/smart-battery/01-027-01895-1.png'],
    price: 57200,
    priceEUR: 13302,
    compareAtPrice: null,
    compareAtPriceEUR: null,
    currency: 'PLN',
    stock: 0,
    category: 'Smart Battery',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '01-027-01895' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Compatibility', value: 'B13960S Battery' },
      { label: 'Type', value: 'Replacement Part' },
    ],
  },
  'smart-battery-pcba-b13860s': {
    id: '05-002-00759',
    sku: '05-002-00759',
    slug: 'smart-battery-pcba-b13860s',
    translations: {
      pl: {
        name: 'B13860S V4 Smart Battery PCBA',
        tagline: 'Płytka sterująca inteligentnej baterii',
        description: `Płytka PCBA B13860S V4 to zaawansowana płytka sterująca do inteligentnych baterii XAG. Odpowiada za zarządzanie ładowaniem, monitorowanie stanu i ochronę baterii.

Cechy:
- Zaawansowane zarządzanie baterią
- Monitorowanie stanu w czasie rzeczywistym
- Ochrona przed przeładowaniem
- Ochrona termiczna`,
      },
      en: {
        name: 'B13860S V4 Smart Battery PCBA',
        tagline: 'Smart battery control board',
        description: `The B13860S V4 PCBA is an advanced control board for XAG smart batteries. Responsible for charge management, status monitoring, and battery protection.

Features:
- Advanced battery management
- Real-time status monitoring
- Overcharge protection
- Thermal protection`,
      },
      es: {
        name: 'B13860S V4 Smart Battery PCBA',
        tagline: 'Placa de control de batería inteligente',
        description: `La PCBA B13860S V4 es una placa de control avanzada para baterías inteligentes XAG. Responsable de la gestión de carga, monitoreo de estado y protección de batería.

Características:
- Gestión avanzada de batería
- Monitoreo de estado en tiempo real
- Protección contra sobrecarga
- Protección térmica`,
      },
      de: {
        name: 'B13860S V4 Smart Battery PCBA',
        tagline: 'Smart-Batterie-Steuerplatine',
        description: `Die B13860S V4 PCBA ist eine fortschrittliche Steuerplatine für XAG Smart-Batterien. Verantwortlich für Lademanagement, Statusüberwachung und Batterieschutz.

Eigenschaften:
- Fortschrittliches Batteriemanagement
- Echtzeit-Statusüberwachung
- Überladeschutz
- Thermischer Schutz`,
      },
      cs: {
        name: 'B13860S V4 Smart Battery PCBA',
        tagline: 'Řídící deska chytré baterie',
        description: `PCBA B13860S V4 je pokročilá řídící deska pro chytré baterie XAG. Zodpovědná za správu nabíjení, monitorování stavu a ochranu baterie.

Vlastnosti:
- Pokročilá správa baterie
- Sledování stavu v reálném čase
- Ochrana proti přebití
- Tepelná ochrana`,
      },
      nl: {
        name: 'B13860S V4 Smart Battery PCBA',
        tagline: 'Slimme batterij besturingsprint',
        description: `De B13860S V4 PCBA is een geavanceerde besturingsprint voor XAG slimme batterijen. Verantwoordelijk voor laadbeheer, statusmonitoring en batterijbescherming.

Kenmerken:
- Geavanceerd batterijbeheer
- Real-time statusmonitoring
- Overlaadbeveiliging
- Thermische bescherming`,
      },
    },
    mainImage: '/images/products/smart-battery/05-002-00759.jpg',
    images: ['/images/products/smart-battery/05-002-00759.jpg'],
    price: 74100,
    priceEUR: 17233,
    compareAtPrice: null,
    compareAtPriceEUR: null,
    currency: 'PLN',
    stock: 0,
    category: 'Smart Battery',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '05-002-00759' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Version', value: 'V4' },
      { label: 'Type', value: 'PCBA Control Board' },
    ],
  },

  // ==================== BATTERY CHARGERS ====================
  'battery-s-charger-cm13600s': {
    id: '09-017-00069',
    sku: '09-017-00069',
    slug: 'battery-s-charger-cm13600s',
    translations: {
      pl: {
        name: 'Ładowarka XAG S-Charger CM13600S',
        tagline: 'Ładowarka z chłodzeniem wymuszonego powietrza dla B13960S/B13970S/B141050',
        description: `Ładowarka XAG Battery S-Charger CM13600S to profesjonalne rozwiązanie do ładowania baterii z technologią chłodzenia wymuszonego powietrza. Kompatybilna z wieloma modelami inteligentnych baterii XAG.

Cechy:
- Technologia chłodzenia wymuszonego powietrza
- Szeroki zakres temperatury pracy
- Obsługa dwóch napięć wejściowych
- Wysoki prąd ładowania
- Kompatybilna z bateriami B13960S, B13970S, B141050`,
      },
      en: {
        name: 'XAG Battery S-Charger CM13600S',
        tagline: 'Forced air-cooling charger for B13960S/B13970S/B141050',
        description: `The XAG Battery S-Charger CM13600S is a professional battery charging solution featuring forced air-cooling technology. Compatible with multiple XAG smart battery models.

Features:
- Forced air-cooling technology
- Wide operating temperature range
- Dual voltage input support
- High charging output
- Compatible with B13960S, B13970S, B141050 batteries`,
      },
      es: {
        name: 'Cargador XAG S-Charger CM13600S',
        tagline: 'Cargador con refrigeración forzada para B13960S/B13970S/B141050',
        description: `El Cargador XAG Battery S-Charger CM13600S es una solución de carga profesional con tecnología de refrigeración por aire forzado. Compatible con múltiples modelos de baterías inteligentes XAG.

Características:
- Tecnología de refrigeración por aire forzado
- Amplio rango de temperatura de operación
- Soporte de entrada de doble voltaje
- Alta salida de carga
- Compatible con baterías B13960S, B13970S, B141050`,
      },
      de: {
        name: 'XAG Batterie S-Charger CM13600S',
        tagline: 'Ladegerät mit Zwangsluftkühlung für B13960S/B13970S/B141050',
        description: `Das XAG Battery S-Charger CM13600S ist eine professionelle Batterieladelösung mit Zwangsluftkühlung. Kompatibel mit mehreren XAG Smart-Batteriemodellen.

Eigenschaften:
- Zwangsluftkühlung
- Breiter Betriebstemperaturbereich
- Dual-Spannungseingang
- Hoher Ladeausgang
- Kompatibel mit B13960S, B13970S, B141050 Batterien`,
      },
      cs: {
        name: 'Nabíječka XAG S-Charger CM13600S',
        tagline: 'Nabíječka s nuceným chlazením pro B13960S/B13970S/B141050',
        description: `Nabíječka XAG Battery S-Charger CM13600S je profesionální řešení pro nabíjení baterií s technologií nuceného vzduchového chlazení. Kompatibilní s více modely chytrých baterií XAG.

Vlastnosti:
- Technologie nuceného vzduchového chlazení
- Široký rozsah pracovních teplot
- Podpora dvou vstupních napětí
- Vysoký nabíjecí výkon
- Kompatibilní s bateriemi B13960S, B13970S, B141050`,
      },
      nl: {
        name: 'XAG Batterij S-Charger CM13600S',
        tagline: 'Lader met geforceerde luchtkoeling voor B13960S/B13970S/B141050',
        description: `De XAG Battery S-Charger CM13600S is een professionele batterijlaadoplossing met geforceerde luchtkoelingstechnologie. Compatibel met meerdere XAG slimme batterijmodellen.

Kenmerken:
- Geforceerde luchtkoeling
- Breed werkingstemperatuurbereik
- Dubbele spanningsinvoer
- Hoge laaduitgang
- Compatibel met B13960S, B13970S, B141050 batterijen`,
      },
    },
    mainImage: '/images/products/battery-chargers/09-017-00069-1.jpg',
    images: [
      '/images/products/battery-chargers/09-017-00069-1.jpg',
      '/images/products/battery-chargers/09-017-00069-2.jpg',
      '/images/products/battery-chargers/09-017-00069-3.jpg',
    ],
    price: 494000,
    priceEUR: 114884,
    compareAtPrice: null,
    compareAtPriceEUR: null,
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

  'parallel-charging-kit-combo': {
    id: 'PC-PCK-10000',
    sku: 'PC-PCK-10000',
    slug: 'parallel-charging-kit-combo',
    translations: {
      pl: {
        name: 'XAG Zestaw Ładowania Równoległego Combo',
        tagline: 'Zestaw ładowania równoległego 6KW z uchwytem montażowym',
        description: `Zestaw XAG Parallel Charging Kit Combo umożliwia równoległe ładowanie wielu baterii jednocześnie. Idealny do operacji wymagających szybkiego ładowania floty dronów.

Cechy:
- Moc 6KW
- Uchwyt montażowy w zestawie
- Ładowanie równoległe
- Kompatybilność z bateriami XAG`,
      },
      en: {
        name: 'XAG Parallel Charging Kit Combo',
        tagline: '6KW parallel charging kit with mounting bracket',
        description: `The XAG Parallel Charging Kit Combo enables parallel charging of multiple batteries simultaneously. Ideal for operations requiring fast fleet charging.

Features:
- 6KW power output
- Mounting bracket included
- Parallel charging capability
- Compatible with XAG batteries`,
      },
      es: {
        name: 'XAG Kit de Carga Paralela Combo',
        tagline: 'Kit de carga paralela 6KW con soporte de montaje',
        description: `El Kit de Carga Paralela XAG Combo permite la carga paralela de múltiples baterías simultáneamente. Ideal para operaciones que requieren carga rápida de flota.

Características:
- Potencia de salida 6KW
- Soporte de montaje incluido
- Capacidad de carga paralela
- Compatible con baterías XAG`,
      },
      de: {
        name: 'XAG Parallel-Ladekit Combo',
        tagline: '6KW Parallel-Ladekit mit Montagehalterung',
        description: `Das XAG Parallel-Ladekit Combo ermöglicht das parallele Laden mehrerer Batterien gleichzeitig. Ideal für Operationen, die schnelles Flottenaufladen erfordern.

Eigenschaften:
- 6KW Ausgangsleistung
- Montagehalterung enthalten
- Parallele Ladefähigkeit
- Kompatibel mit XAG-Batterien`,
      },
      cs: {
        name: 'XAG Sada pro Paralelní Nabíjení Combo',
        tagline: 'Sada pro paralelní nabíjení 6KW s montážním držákem',
        description: `Sada XAG Parallel Charging Kit Combo umožňuje paralelní nabíjení více baterií současně. Ideální pro operace vyžadující rychlé nabíjení flotily.

Vlastnosti:
- Výkon 6KW
- Montážní držák v ceně
- Schopnost paralelního nabíjení
- Kompatibilní s bateriemi XAG`,
      },
      nl: {
        name: 'XAG Parallel Laadkit Combo',
        tagline: '6KW parallel laadkit met montagebeugel',
        description: `De XAG Parallel Laadkit Combo maakt parallel laden van meerdere batterijen tegelijk mogelijk. Ideaal voor operaties die snel vlootladen vereisen.

Kenmerken:
- 6KW uitgangsvermogen
- Montagebeugel inbegrepen
- Parallel laadvermogen
- Compatibel met XAG-batterijen`,
      },
    },
    mainImage: '/images/products/battery-chargers/pc-pck-10000-1.jpg',
    images: ['/images/products/battery-chargers/pc-pck-10000-1.jpg'],
    price: 88400,
    priceEUR: 20558,
    compareAtPrice: 96200,
    compareAtPriceEUR: 22372,
    currency: 'PLN',
    stock: 0,
    category: 'Battery Chargers',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: 'PC-PCK-10000' },
      { label: 'Power', value: '6KW' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Type', value: 'Parallel Charging Kit' },
    ],
  },
  'e-charger-cm15300d': {
    id: '09-017-00059',
    sku: '09-017-00059',
    slug: 'e-charger-cm15300d',
    translations: {
      pl: {
        name: 'XAG Ładowarka E-Charger CM15300D',
        tagline: 'Wysokowydajna ładowarka baterii',
        description: `Ładowarka XAG E-Charger CM15300D to zaawansowane rozwiązanie do szybkiego ładowania baterii dronów rolniczych XAG.

Cechy:
- Wysoka moc ładowania
- Zaawansowane chłodzenie
- Kompatybilność z wieloma modelami baterii
- Ochrona przed przeładowaniem`,
      },
      en: {
        name: 'XAG Battery E-Charger CM15300D',
        tagline: 'High-power battery charging solution',
        description: `The XAG Battery E-Charger CM15300D is an advanced solution for fast charging of XAG agricultural drone batteries.

Features:
- High charging power
- Advanced cooling system
- Compatible with multiple battery models
- Overcharge protection`,
      },
      es: {
        name: 'XAG Cargador E-Charger CM15300D',
        tagline: 'Solución de carga de batería de alta potencia',
        description: `El XAG Battery E-Charger CM15300D es una solución avanzada para carga rápida de baterías de drones agrícolas XAG.

Características:
- Alta potencia de carga
- Sistema de enfriamiento avanzado
- Compatible con múltiples modelos de batería
- Protección contra sobrecarga`,
      },
      de: {
        name: 'XAG Batterie E-Charger CM15300D',
        tagline: 'Hochleistungs-Batterieladelösung',
        description: `Der XAG Battery E-Charger CM15300D ist eine fortschrittliche Lösung zum schnellen Laden von XAG-Agrardrohnen-Batterien.

Eigenschaften:
- Hohe Ladeleistung
- Fortschrittliches Kühlsystem
- Kompatibel mit mehreren Batteriemodellen
- Überladeschutz`,
      },
      cs: {
        name: 'XAG Nabíječka E-Charger CM15300D',
        tagline: 'Vysokovýkonné řešení pro nabíjení baterií',
        description: `XAG Battery E-Charger CM15300D je pokročilé řešení pro rychlé nabíjení baterií zemědělských dronů XAG.

Vlastnosti:
- Vysoký nabíjecí výkon
- Pokročilý chladicí systém
- Kompatibilní s více modely baterií
- Ochrana proti přebití`,
      },
      nl: {
        name: 'XAG Batterij E-Charger CM15300D',
        tagline: 'Hoogvermogen batterijlaadoplossing',
        description: `De XAG Battery E-Charger CM15300D is een geavanceerde oplossing voor snel laden van XAG landbouwdronebatterijen.

Kenmerken:
- Hoog laadvermogen
- Geavanceerd koelsysteem
- Compatibel met meerdere batterijmodellen
- Overlaadbeveiliging`,
      },
    },
    mainImage: '/images/products/battery-chargers/09-017-00059-1.jpg',
    images: ['/images/products/battery-chargers/09-017-00059-1.jpg'],
    price: 600600,
    priceEUR: 139674,
    compareAtPrice: 772200,
    compareAtPriceEUR: 179581,
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
  'mist-cooling-charging-station': {
    id: '09-017-00065',
    sku: '09-017-00065',
    slug: 'mist-cooling-charging-station',
    translations: {
      pl: {
        name: 'XAG Stacja Ładowania z Chłodzeniem Mgłą',
        tagline: 'Stacja chłodzenia i ładowania dla baterii XAG',
        description: `Stacja XAG Mist-Cooling Charging Station łączy ładowanie baterii z innowacyjnym systemem chłodzenia mgłą dla optymalnej wydajności.

Cechy:
- Chłodzenie mgłą
- Zoptymalizowane ładowanie
- Ochrona termiczna baterii
- Kompaktowa konstrukcja`,
      },
      en: {
        name: 'XAG Mist-Cooling Charging Station',
        tagline: 'Cooling and charging station for XAG batteries',
        description: `The XAG Mist-Cooling Charging Station combines battery charging with innovative mist cooling system for optimal performance.

Features:
- Mist cooling technology
- Optimized charging
- Battery thermal protection
- Compact design`,
      },
      es: {
        name: 'XAG Estación de Carga con Enfriamiento por Niebla',
        tagline: 'Estación de enfriamiento y carga para baterías XAG',
        description: `La Estación XAG Mist-Cooling combina carga de batería con innovador sistema de enfriamiento por niebla para rendimiento óptimo.

Características:
- Tecnología de enfriamiento por niebla
- Carga optimizada
- Protección térmica de batería
- Diseño compacto`,
      },
      de: {
        name: 'XAG Nebel-Kühl-Ladestation',
        tagline: 'Kühl- und Ladestation für XAG-Batterien',
        description: `Die XAG Nebel-Kühl-Ladestation kombiniert Batterieladung mit innovativem Nebelkühlsystem für optimale Leistung.

Eigenschaften:
- Nebelkühltechnologie
- Optimiertes Laden
- Thermischer Batterieschutz
- Kompaktes Design`,
      },
      cs: {
        name: 'XAG Nabíjecí Stanice s Mlhovým Chlazením',
        tagline: 'Chladicí a nabíjecí stanice pro baterie XAG',
        description: `Stanice XAG Mist-Cooling kombinuje nabíjení baterií s inovativním systémem mlhového chlazení pro optimální výkon.

Vlastnosti:
- Technologie mlhového chlazení
- Optimalizované nabíjení
- Tepelná ochrana baterie
- Kompaktní design`,
      },
      nl: {
        name: 'XAG Mist-Koeling Laadstation',
        tagline: 'Koel- en laadstation voor XAG-batterijen',
        description: `Het XAG Mist-Koeling Laadstation combineert batterijladen met innovatief mistkoelsysteem voor optimale prestaties.

Kenmerken:
- Mistkoelingstechnologie
- Geoptimaliseerd laden
- Thermische batterijbescherming
- Compact ontwerp`,
      },
    },
    mainImage: '/images/products/battery-chargers/09-017-00065-1.jpg',
    images: ['/images/products/battery-chargers/09-017-00065-1.jpg'],
    price: 92300,
    priceEUR: 21465,
    compareAtPrice: null,
    compareAtPriceEUR: null,
    currency: 'PLN',
    stock: 0,
    category: 'Battery Chargers',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '09-017-00065' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Cooling', value: 'Mist Cooling' },
      { label: 'Type', value: 'Charging Station' },
    ],
  },
  'water-cool-charging-tank': {
    id: '09-017-00028',
    sku: '09-017-00028',
    slug: 'water-cool-charging-tank',
    translations: {
      pl: {
        name: 'XAG 2022 Mod Zbiornik Ładowania z Chłodzeniem Wodnym',
        tagline: 'Zbiornik chłodzenia wodnego do wydajnego ładowania baterii',
        description: `Zbiornik XAG Water-Cool Charging Tank 2022 Mod to zaawansowane rozwiązanie do chłodzenia baterii podczas ładowania.

Cechy:
- Chłodzenie wodne
- Efektywne odprowadzanie ciepła
- Wydłużenie żywotności baterii
- Kompatybilność z systemem ładowania XAG`,
      },
      en: {
        name: 'XAG 2022 Mod Water-Cool Charging Tank',
        tagline: 'Water-cooling charging tank for efficient battery charging',
        description: `The XAG Water-Cool Charging Tank 2022 Mod is an advanced solution for cooling batteries during charging.

Features:
- Water cooling system
- Efficient heat dissipation
- Extended battery lifespan
- Compatible with XAG charging system`,
      },
      es: {
        name: 'XAG 2022 Mod Tanque de Carga con Enfriamiento por Agua',
        tagline: 'Tanque de enfriamiento por agua para carga eficiente de baterías',
        description: `El Tanque XAG Water-Cool 2022 Mod es una solución avanzada para enfriar baterías durante la carga.

Características:
- Sistema de enfriamiento por agua
- Disipación eficiente del calor
- Vida útil extendida de batería
- Compatible con sistema de carga XAG`,
      },
      de: {
        name: 'XAG 2022 Mod Wasserkühlung-Ladetank',
        tagline: 'Wasserkühl-Ladetank für effizientes Batterieladen',
        description: `Der XAG Wasserkühlung-Ladetank 2022 Mod ist eine fortschrittliche Lösung zum Kühlen von Batterien während des Ladens.

Eigenschaften:
- Wasserkühlsystem
- Effiziente Wärmeableitung
- Verlängerte Batterielebensdauer
- Kompatibel mit XAG-Ladesystem`,
      },
      cs: {
        name: 'XAG 2022 Mod Nádrž pro Nabíjení s Vodním Chlazením',
        tagline: 'Nádrž s vodním chlazením pro efektivní nabíjení baterií',
        description: `Nádrž XAG Water-Cool 2022 Mod je pokročilé řešení pro chlazení baterií během nabíjení.

Vlastnosti:
- Systém vodního chlazení
- Efektivní odvod tepla
- Prodloužená životnost baterie
- Kompatibilní s nabíjecím systémem XAG`,
      },
      nl: {
        name: 'XAG 2022 Mod Waterkoeling Laadtank',
        tagline: 'Waterkoeling laadtank voor efficiënt batterij laden',
        description: `De XAG Waterkoeling Laadtank 2022 Mod is een geavanceerde oplossing voor het koelen van batterijen tijdens het laden.

Kenmerken:
- Waterkoelsysteem
- Efficiënte warmteafvoer
- Verlengde batterijlevensduur
- Compatibel met XAG-laadsysteem`,
      },
    },
    mainImage: '/images/products/battery-chargers/09-017-00028-3.png',
    images: ['/images/products/battery-chargers/09-017-00028-3.png'],
    price: 85800,
    priceEUR: 19953,
    compareAtPrice: null,
    compareAtPriceEUR: null,
    currency: 'PLN',
    stock: 0,
    category: 'Battery Chargers',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '09-017-00028' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Cooling', value: 'Water Cooling' },
      { label: 'Type', value: 'Charging Tank' },
    ],
  },

  // ==================== GC4000+ GENERATOR SUPERCHARGER ====================
  'generator-supercharger-gc4000-plus': {
    id: '09-020-00016',
    sku: '09-020-00016',
    slug: 'generator-supercharger-gc4000-plus',
    translations: {
      pl: {
        name: 'XAG Generator SuperCharger GC4000+',
        tagline: 'Zintegrowany generator i ładowarka dla dronów i UGV XAG',
        description: `XAG Generator SuperCharger GC4000+ to kompleksowe rozwiązanie zasilające łączące generator i inteligentną ładowarkę w jednym urządzeniu. Zaprojektowany do operacji polowych, gdzie dostęp do sieci elektrycznej jest ograniczony.

Kluczowe cechy:
- Wbudowany generator o mocy 4000W
- Inteligentne ładowanie wielu baterii jednocześnie
- Kompatybilny z bateriami B13960S, B13970S, B141050
- Ciche działanie dzięki zaawansowanemu tłumieniu
- Zintegrowany system chłodzenia
- Kompaktowa konstrukcja do transportu terenowego
- Automatyczne zarządzanie mocą
- Wyświetlacz LCD z informacjami o stanie`,
      },
      en: {
        name: 'XAG Generator SuperCharger GC4000+',
        tagline: 'All-in-one generator and charger for XAG drones and UGVs',
        description: `The XAG Generator SuperCharger GC4000+ is a comprehensive power solution combining a generator and intelligent charger in one device. Designed for field operations where grid power access is limited.

Key Features:
- Built-in 4000W generator
- Intelligent multi-battery charging
- Compatible with B13960S, B13970S, B141050 batteries
- Quiet operation with advanced noise reduction
- Integrated cooling system
- Compact design for field transport
- Automatic power management
- LCD display with status information`,
      },
      es: {
        name: 'XAG Generator SuperCharger GC4000+',
        tagline: 'Generador y cargador todo en uno para drones y UGVs XAG',
        description: `El XAG Generator SuperCharger GC4000+ es una solución de energía integral que combina un generador y un cargador inteligente en un solo dispositivo. Diseñado para operaciones de campo donde el acceso a la red eléctrica es limitado.

Características principales:
- Generador integrado de 4000W
- Carga inteligente de múltiples baterías
- Compatible con baterías B13960S, B13970S, B141050
- Funcionamiento silencioso con reducción de ruido avanzada
- Sistema de enfriamiento integrado
- Diseño compacto para transporte de campo
- Gestión automática de energía
- Pantalla LCD con información de estado`,
      },
      de: {
        name: 'XAG Generator SuperCharger GC4000+',
        tagline: 'All-in-One Generator und Ladegerät für XAG Drohnen und UGVs',
        description: `Der XAG Generator SuperCharger GC4000+ ist eine umfassende Stromversorgungslösung, die einen Generator und ein intelligentes Ladegerät in einem Gerät vereint. Entwickelt für Feldeinsätze, wo der Netzzugang begrenzt ist.

Hauptmerkmale:
- Eingebauter 4000W Generator
- Intelligentes Multi-Batterie-Laden
- Kompatibel mit B13960S, B13970S, B141050 Batterien
- Leiser Betrieb mit fortschrittlicher Geräuschreduzierung
- Integriertes Kühlsystem
- Kompaktes Design für Feldtransport
- Automatisches Energiemanagement
- LCD-Display mit Statusinformationen`,
      },
      cs: {
        name: 'XAG Generator SuperCharger GC4000+',
        tagline: 'Vše v jednom generátor a nabíječka pro drony a UGV XAG',
        description: `XAG Generator SuperCharger GC4000+ je komplexní napájecí řešení kombinující generátor a inteligentní nabíječku v jednom zařízení. Navrženo pro polní operace, kde je omezený přístup k elektrické síti.

Klíčové vlastnosti:
- Vestavěný generátor 4000W
- Inteligentní nabíjení více baterií
- Kompatibilní s bateriemi B13960S, B13970S, B141050
- Tichý provoz s pokročilou redukcí hluku
- Integrovaný chladicí systém
- Kompaktní design pro polní přepravu
- Automatická správa energie
- LCD displej s informacemi o stavu`,
      },
      nl: {
        name: 'XAG Generator SuperCharger GC4000+',
        tagline: 'Alles-in-één generator en lader voor XAG drones en UGVs',
        description: `De XAG Generator SuperCharger GC4000+ is een uitgebreide stroomoplossing die een generator en intelligente lader in één apparaat combineert. Ontworpen voor veldoperaties waar netstroomtoegang beperkt is.

Belangrijkste kenmerken:
- Ingebouwde 4000W generator
- Intelligent meervoudig batterijen laden
- Compatibel met B13960S, B13970S, B141050 batterijen
- Stille werking met geavanceerde geluidsreductie
- Geïntegreerd koelsysteem
- Compact ontwerp voor veldtransport
- Automatisch energiebeheer
- LCD-display met statusinformatie`,
      },
    },
    mainImage: '/images/products/battery-chargers/09-020-00016-1.jpg',
    images: [
      '/images/products/battery-chargers/09-020-00016-1.jpg',
    ],
    price: 455000,
    priceEUR: 105814,
    compareAtPrice: null,
    compareAtPriceEUR: null,
    currency: 'PLN',
    stock: 5,
    category: 'Battery Chargers',
    type: 'ACCESSORY',
    specifications: [
      { label: 'SKU', value: '09-020-00016' },
      { label: 'Model', value: 'GC4000+' },
      { label: 'Brand', value: 'XAG' },
      { label: 'Power Output', value: '4000W' },
      { label: 'Compatible Batteries', value: 'B13960S, B13970S, B141050' },
      { label: 'Type', value: 'Generator SuperCharger' },
    ],
  },

  // ==================== TASK SYSTEM ====================
  'revospray-p3': {
    id: '09-023-00025',
    sku: '09-023-00025',
    slug: 'revospray-p3',
    translations: {
      pl: {
        name: 'XAG P100 Pro RevoSpray P3',
        tagline: 'System oprysku 50L z dyszami odśrodkowymi',
        description: `XAG P100 Pro RevoSpray P3 to profesjonalny system oprysku 50L zaprojektowany dla drona rolniczego P100 Pro. Wyposażony w zaawansowane dysze odśrodkowe dla precyzyjnej aplikacji cieczy.

Cechy:
- Pojemność zbiornika 50L
- Dysze odśrodkowe
- Precyzyjna kontrola przepływu
- Szybki montaż
- Kompatybilny z platformą P100 Pro
- Regulowana szerokość oprysku
- Monitorowanie przepływu w czasie rzeczywistym`,
      },
      en: {
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
      },
      es: {
        name: 'XAG P100 Pro RevoSpray P3',
        tagline: 'Sistema de pulverización 50L con boquillas centrífugas',
        description: `El XAG P100 Pro RevoSpray P3 es un sistema de pulverización profesional de 50L diseñado para el dron agrícola P100 Pro. Cuenta con boquillas de atomización centrífugas avanzadas para aplicación precisa de líquidos.

Características:
- Capacidad de tanque de 50L
- Boquillas de atomización centrífugas
- Control de flujo de precisión
- Diseño de liberación rápida
- Compatible con plataforma P100 Pro
- Ancho de pulverización ajustable
- Monitoreo de flujo en tiempo real`,
      },
      de: {
        name: 'XAG P100 Pro RevoSpray P3',
        tagline: '50L Sprühsystem mit Zentrifugaldüsen',
        description: `Das XAG P100 Pro RevoSpray P3 ist ein professionelles 50L-Sprühsystem für die P100 Pro Agrardrohne. Mit fortschrittlichen Zentrifugal-Zerstäubungsdüsen für präzise Flüssigkeitsausbringung.

Eigenschaften:
- 50L Tankkapazität
- Zentrifugal-Zerstäubungsdüsen
- Präzise Durchflusskontrolle
- Schnellwechseldesign
- Kompatibel mit P100 Pro
- Einstellbare Sprühbreite
- Echtzeit-Durchflussüberwachung`,
      },
      cs: {
        name: 'XAG P100 Pro RevoSpray P3',
        tagline: 'Postřikovací systém 50L s odstředivými tryskami',
        description: `XAG P100 Pro RevoSpray P3 je profesionální postřikovací systém 50L navržený pro zemědělský dron P100 Pro. Vybaven pokročilými odstředivými rozprašovacími tryskami pro přesnou aplikaci kapalin.

Vlastnosti:
- Kapacita nádrže 50L
- Odstředivé rozprašovací trysky
- Přesná kontrola průtoku
- Rychlé uvolnění
- Kompatibilní s platformou P100 Pro
- Nastavitelná šířka postřiku
- Sledování průtoku v reálném čase`,
      },
      nl: {
        name: 'XAG P100 Pro RevoSpray P3',
        tagline: '50L sproeiysteem met centrifugale verstuivers',
        description: `De XAG P100 Pro RevoSpray P3 is een professioneel 50L sproeiysteem ontworpen voor de P100 Pro landbouwdrone. Uitgerust met geavanceerde centrifugale verstuivers voor nauwkeurige vloeistoftoepassing.

Kenmerken:
- 50L tankinhoud
- Centrifugale verstuivers
- Nauwkeurige debietregeling
- Snelkoppelingsontwerp
- Compatibel met P100 Pro platform
- Verstelbare sproeibreedte
- Real-time debietmonitoring`,
      },
    },
    mainImage: '/images/products/task-system/09-023-00025-1.jpg',
    images: [
      '/images/products/task-system/09-023-00025-1.jpg',
    ],
    price: 910000,
    priceEUR: 211628,
    compareAtPrice: null,
    compareAtPriceEUR: null,
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

  // ==================== ADDITIONAL TASK SYSTEMS ====================
  'revospray-p4': {
    id: '09-023-00055',
    sku: '09-023-00055',
    slug: 'revospray-p4',
    translations: {
      pl: { name: 'XAG P150 RevoSpray P4', tagline: 'Zaawansowany system oprysku dla platformy P150', description: 'System oprysku RevoSpray P4 dla drona P150. Zaawansowane dysze i precyzyjna kontrola przepływu.' },
      en: { name: 'XAG P150 RevoSpray P4', tagline: 'Advanced spray system for P150 platform', description: 'The RevoSpray P4 spray system for P150 drone. Advanced nozzles and precision flow control.' },
      es: { name: 'XAG P150 RevoSpray P4', tagline: 'Sistema de pulverización avanzado para plataforma P150', description: 'Sistema de pulverización RevoSpray P4 para dron P150. Boquillas avanzadas y control de flujo de precisión.' },
      de: { name: 'XAG P150 RevoSpray P4', tagline: 'Fortschrittliches Sprühsystem für P150-Plattform', description: 'RevoSpray P4 Sprühsystem für P150 Drohne. Fortschrittliche Düsen und präzise Durchflusskontrolle.' },
      cs: { name: 'XAG P150 RevoSpray P4', tagline: 'Pokročilý postřikovací systém pro platformu P150', description: 'Postřikovací systém RevoSpray P4 pro dron P150. Pokročilé trysky a přesná kontrola průtoku.' },
      nl: { name: 'XAG P150 RevoSpray P4', tagline: 'Geavanceerd sproeiysteem voor P150-platform', description: 'RevoSpray P4 sproeiysteem voor P150 drone. Geavanceerde sproeiers en nauwkeurige debietregeling.' },
    },
    mainImage: '/images/products/task-system/09-023-00055.jpg',
    images: ['/images/products/task-system/09-023-00055.jpg'],
    price: 910000, priceEUR: 211628, compareAtPrice: null, compareAtPriceEUR: null, currency: 'PLN', stock: 0, category: 'Task System', type: 'ACCESSORY',
    specifications: [{ label: 'SKU', value: '09-023-00055' }, { label: 'Compatibility', value: 'P150' }, { label: 'Type', value: 'Spray System' }],
  },
  'revocast-p4': {
    id: '09-023-00054',
    sku: '09-023-00054',
    slug: 'revocast-p4',
    translations: {
      pl: { name: 'XAG P150 RevoCast P4', tagline: 'System rozsiewający dla platformy P150', description: 'System rozsiewający RevoCast P4 dla drona P150. Precyzyjne rozsiewanie nawozów i nasion.' },
      en: { name: 'XAG P150 RevoCast P4', tagline: 'Spreading system for P150 platform', description: 'The RevoCast P4 spreading system for P150 drone. Precision fertilizer and seed spreading.' },
      es: { name: 'XAG P150 RevoCast P4', tagline: 'Sistema de esparcimiento para plataforma P150', description: 'Sistema de esparcimiento RevoCast P4 para dron P150. Esparcimiento de precisión de fertilizantes y semillas.' },
      de: { name: 'XAG P150 RevoCast P4', tagline: 'Streusystem für P150-Plattform', description: 'RevoCast P4 Streusystem für P150 Drohne. Präzise Dünger- und Saatgutausbringung.' },
      cs: { name: 'XAG P150 RevoCast P4', tagline: 'Rozmetací systém pro platformu P150', description: 'Rozmetací systém RevoCast P4 pro dron P150. Přesné rozmetání hnojiv a semen.' },
      nl: { name: 'XAG P150 RevoCast P4', tagline: 'Strooiysteem voor P150-platform', description: 'RevoCast P4 strooiysteem voor P150 drone. Nauwkeurig meststof en zaad strooien.' },
    },
    mainImage: '/images/products/task-system/09-023-00054.jpg',
    images: ['/images/products/task-system/09-023-00054.jpg'],
    price: 1040000, priceEUR: 241860, compareAtPrice: 1170000, compareAtPriceEUR: 272093, currency: 'PLN', stock: 0, category: 'Task System', type: 'ACCESSORY',
    specifications: [{ label: 'SKU', value: '09-023-00054' }, { label: 'Compatibility', value: 'P150' }, { label: 'Type', value: 'Spreading System' }],
  },
  'p100-pro-60l-upgrade-kit': {
    id: '05-002-02262',
    sku: '05-002-02262',
    slug: 'p100-pro-60l-upgrade-kit',
    translations: {
      pl: { name: 'XAG P100 Pro Upgrade Kit - Zbiornik 60L', tagline: 'Inteligentny zbiornik 60L z systemem Sub-Cover Refill', description: 'Zestaw modernizacyjny z inteligentnym zbiornikiem 60L dla drona P100 Pro.' },
      en: { name: 'XAG P100 Pro Upgrade Kit - 60L Container', tagline: '60L Smart Tank with Sub-Cover Refill Design', description: 'Upgrade kit with 60L smart tank for P100 Pro drone.' },
      es: { name: 'XAG P100 Pro Kit de Actualización - Contenedor 60L', tagline: 'Tanque Inteligente 60L con Diseño de Recarga Sub-Cover', description: 'Kit de actualización con tanque inteligente de 60L para dron P100 Pro.' },
      de: { name: 'XAG P100 Pro Upgrade-Kit - 60L Behälter', tagline: '60L Smart-Tank mit Sub-Cover-Nachfülldesign', description: 'Upgrade-Kit mit 60L Smart-Tank für P100 Pro Drohne.' },
      cs: { name: 'XAG P100 Pro Upgrade Kit - 60L Nádrž', tagline: '60L chytrá nádrž s designem Sub-Cover Refill', description: 'Upgrade kit s 60L chytrou nádrží pro dron P100 Pro.' },
      nl: { name: 'XAG P100 Pro Upgrade Kit - 60L Container', tagline: '60L Smart Tank met Sub-Cover Refill Design', description: 'Upgrade kit met 60L smart tank voor P100 Pro drone.' },
    },
    mainImage: '/images/products/task-system/05-002-02262.jpg',
    images: ['/images/products/task-system/05-002-02262.jpg'],
    price: 743600, priceEUR: 172930, compareAtPrice: null, compareAtPriceEUR: null, currency: 'PLN', stock: 0, category: 'Task System', type: 'ACCESSORY',
    specifications: [{ label: 'SKU', value: '05-002-02262' }, { label: 'Capacity', value: '60L' }, { label: 'Compatibility', value: 'P100 Pro' }],
  },
  'revocast-p3': {
    id: '09-023-00023',
    sku: '09-023-00023',
    slug: 'revocast-p3',
    translations: {
      pl: { name: 'XAG P100 Pro RevoCast P3', tagline: 'System rozsiewający 80L dla substancji stałych 1-6mm', description: 'System rozsiewający RevoCast P3 o pojemności 80L dla drona P100 Pro. Idealny do rozsiewania nawozów i nasion o wielkości 1-6mm.' },
      en: { name: 'XAG P100 Pro RevoCast P3', tagline: '80L spreader system for dry solids 1-6mm', description: 'The RevoCast P3 spreading system with 80L capacity for P100 Pro drone. Ideal for spreading fertilizers and seeds 1-6mm in size.' },
      es: { name: 'XAG P100 Pro RevoCast P3', tagline: 'Sistema esparcidor 80L para sólidos secos 1-6mm', description: 'Sistema esparcidor RevoCast P3 con capacidad de 80L para dron P100 Pro. Ideal para esparcir fertilizantes y semillas de 1-6mm.' },
      de: { name: 'XAG P100 Pro RevoCast P3', tagline: '80L Streusystem für Trockenstoffe 1-6mm', description: 'RevoCast P3 Streusystem mit 80L Kapazität für P100 Pro Drohne. Ideal für Dünger und Saatgut 1-6mm.' },
      cs: { name: 'XAG P100 Pro RevoCast P3', tagline: '80L rozmetací systém pro suché látky 1-6mm', description: 'Rozmetací systém RevoCast P3 s kapacitou 80L pro dron P100 Pro. Ideální pro rozmetání hnojiv a semen 1-6mm.' },
      nl: { name: 'XAG P100 Pro RevoCast P3', tagline: '80L strooiysteem voor droge stoffen 1-6mm', description: 'RevoCast P3 strooiysteem met 80L capaciteit voor P100 Pro drone. Ideaal voor meststof en zaad 1-6mm.' },
    },
    mainImage: '/images/products/task-system/09-023-00023-1.png',
    images: ['/images/products/task-system/09-023-00023-1.png'],
    price: 1170000, priceEUR: 272093, compareAtPrice: null, compareAtPriceEUR: null, currency: 'PLN', stock: 0, category: 'Task System', type: 'ACCESSORY',
    specifications: [{ label: 'SKU', value: '09-023-00023' }, { label: 'Capacity', value: '80L' }, { label: 'Particle Size', value: '1-6mm' }, { label: 'Compatibility', value: 'P100 Pro' }],
  },

  // ==================== REMOTE CONTROLLER ====================
  'remote-controller-src5': {
    id: '09-016-00085',
    sku: '09-016-00085',
    slug: 'remote-controller-src5',
    translations: {
      pl: {
        name: 'Pilot Zdalnego Sterowania XAG SRC5',
        tagline: 'Wyświetlacz 7,02", bateria 20000mAh, zasięg 2km',
        description: `Pilot Zdalnego Sterowania XAG SRC5 to najnowszy profesjonalny kontroler dla dronów rolniczych XAG. Wyposażony w duży wyświetlacz 7,02" o wysokiej jasności, ogromną baterię 20 000mAh i zasięg transmisji 2km.

Cechy:
- Wyświetlacz 7,02" o wysokiej jasności
- Wbudowana bateria 20 000mAh
- Zasięg transmisji 2km
- Ekran czytelny w słońcu
- Intuicyjny interfejs dotykowy
- Telemetria lotu w czasie rzeczywistym
- Planowanie misji
- Odporna na warunki atmosferyczne konstrukcja (IP54)`,
      },
      en: {
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
      },
      es: {
        name: 'Control Remoto XAG SRC5',
        tagline: 'Pantalla 7,02", 20000mAh, alcance 2km',
        description: `El Control Remoto XAG SRC5 es el último controlador de grado profesional para drones agrícolas XAG. Con pantalla de alta luminosidad de 7,02", batería de 20.000mAh y alcance de transmisión de 2km.

Características:
- Pantalla de alta luminosidad de 7,02"
- Batería integrada de 20.000mAh
- Alcance de transmisión de 2km
- Pantalla legible bajo el sol
- Interfaz táctil intuitiva
- Telemetría de vuelo en tiempo real
- Capacidad de planificación de misiones
- Diseño resistente a la intemperie (IP54)`,
      },
      de: {
        name: 'XAG Fernbedienung SRC5',
        tagline: '7,02" Display, 20000mAh, 2km Reichweite',
        description: `Die XAG Fernbedienung SRC5 ist der neueste professionelle Controller für XAG-Agrardrohnen. Mit großem 7,02" High-Brightness-Display, 20.000mAh Akku und 2km Übertragungsreichweite.

Eigenschaften:
- 7,02" High-Brightness-Display
- 20.000mAh integrierter Akku
- 2km Übertragungsreichweite
- Sonnenlichtlesbarer Bildschirm
- Intuitive Touch-Oberfläche
- Echtzeit-Flugtelemetrie
- Missionsplanung
- Wetterfestes Design (IP54)`,
      },
      cs: {
        name: 'Dálkové Ovládání XAG SRC5',
        tagline: '7,02" displej, 20000mAh, dosah 2km',
        description: `Dálkové ovládání XAG SRC5 je nejnovější profesionální ovladač pro zemědělské drony XAG. S velkým 7,02" displejem s vysokou svítivostí, 20 000mAh baterií a 2km dosahem přenosu.

Vlastnosti:
- 7,02" displej s vysokou svítivostí
- Vestavěná baterie 20 000mAh
- Dosah přenosu 2km
- Obrazovka čitelná na slunci
- Intuitivní dotykové rozhraní
- Telemetrie letu v reálném čase
- Plánování misí
- Voděodolný design (IP54)`,
      },
      nl: {
        name: 'XAG Afstandsbediening SRC5',
        tagline: '7,02" scherm, 20000mAh, 2km bereik',
        description: `De XAG Afstandsbediening SRC5 is de nieuwste professionele controller voor XAG landbouwdrones. Met een groot 7,02" high-brightness display, 20.000mAh batterij en 2km zendbereik.

Kenmerken:
- 7,02" high-brightness display
- 20.000mAh ingebouwde batterij
- 2km zendbereik
- Zonlichtleesbaar scherm
- Intuïtieve touch-interface
- Real-time vluchttelemetrie
- Missieplanningmogelijkheid
- Weerbestendig ontwerp (IP54)`,
      },
    },
    mainImage: '/images/products/remote-controller/09-016-00085-2.png',
    images: [
      '/images/products/remote-controller/09-016-00085-2.png',
    ],
    price: 598000,
    priceEUR: 139070,
    compareAtPrice: null,
    compareAtPriceEUR: null,
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

  'rc-arc3-pro': {
    id: '09-016-00053',
    sku: '09-016-00053',
    slug: 'rc-arc3-pro',
    translations: {
      pl: { name: 'XAG RC ARC3 Pro', tagline: 'Kompaktowy kontroler z pozycjonowaniem RTK', description: 'Kompaktowy kontroler XAG RC ARC3 Pro z wbudowanym pozycjonowaniem RTK dla precyzyjnych operacji rolniczych.' },
      en: { name: 'XAG RC ARC3 Pro', tagline: 'Compact controller with RTK positioning', description: 'Compact XAG RC ARC3 Pro controller with built-in RTK positioning for precision agricultural operations.' },
      es: { name: 'XAG RC ARC3 Pro', tagline: 'Controlador compacto con posicionamiento RTK', description: 'Controlador compacto XAG RC ARC3 Pro con posicionamiento RTK integrado para operaciones agrícolas de precisión.' },
      de: { name: 'XAG RC ARC3 Pro', tagline: 'Kompakte Fernbedienung mit RTK-Positionierung', description: 'Kompakte XAG RC ARC3 Pro Fernbedienung mit integrierter RTK-Positionierung für präzise landwirtschaftliche Operationen.' },
      cs: { name: 'XAG RC ARC3 Pro', tagline: 'Kompaktní ovladač s RTK pozicováním', description: 'Kompaktní ovladač XAG RC ARC3 Pro s vestavěným RTK pozicováním pro přesné zemědělské operace.' },
      nl: { name: 'XAG RC ARC3 Pro', tagline: 'Compacte controller met RTK-positionering', description: 'Compacte XAG RC ARC3 Pro controller met ingebouwde RTK-positionering voor nauwkeurige landbouwoperaties.' },
    },
    mainImage: '/images/products/remote-controller/09-016-00053-2.png',
    images: ['/images/products/remote-controller/09-016-00053-2.png'],
    price: 546000, priceEUR: 126977, compareAtPrice: null, compareAtPriceEUR: null, currency: 'PLN', stock: 0, category: 'Remote Controller', type: 'ACCESSORY',
    specifications: [{ label: 'SKU', value: '09-016-00053' }, { label: 'Model', value: 'ARC3 Pro' }, { label: 'RTK', value: 'Built-in' }],
  },

  // ==================== GNSS RTK ====================
  'gnss-xrtk7-mobile-station': {
    id: '09-016-00083',
    sku: '09-016-00083',
    slug: 'gnss-xrtk7-mobile-station',
    translations: {
      pl: {
        name: 'Stacja Mobilna XAG GNSS XRTK7',
        tagline: 'Przenośny RTK z dokładnością <5cm, zasięg 2km',
        description: `Stacja Mobilna XAG GNSS XRTK7 to przenośny system pozycjonowania RTK o wysokiej precyzji, z dokładnością poniżej 5cm i zasięgiem transmisji 2km. Idealna do operacji polowych wymagających dokładności centymetrowej.

Cechy:
- Dokładność pozycjonowania <5cm
- Zasięg transmisji 2km
- Przenośny mobilny design
- Szybka konfiguracja i wdrożenie
- Obsługa wielu konstelacji
- Długi czas pracy baterii
- Odporność pogodowa (IP54)
- Dane korekcyjne w czasie rzeczywistym`,
      },
      en: {
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
      },
      es: {
        name: 'Estación Móvil XAG GNSS XRTK7',
        tagline: 'RTK portátil con precisión <5cm, alcance 2km',
        description: `La Estación Móvil XAG GNSS XRTK7 es un sistema de posicionamiento RTK portátil de alta precisión con menos de 5cm de precisión y 2km de alcance. Ideal para operaciones de campo que requieren precisión centimétrica.

Características:
- Precisión de posicionamiento <5cm
- Alcance de transmisión de 2km
- Diseño móvil portátil
- Configuración rápida
- Soporte multi-constelación
- Larga duración de batería
- Resistente a la intemperie (IP54)
- Datos de corrección en tiempo real`,
      },
      de: {
        name: 'XAG GNSS XRTK7 Mobilstation',
        tagline: 'Tragbares RTK mit <5cm Genauigkeit, 2km Reichweite',
        description: `Die XAG GNSS XRTK7 Mobilstation ist ein tragbares Hochpräzisions-RTK-Positionierungssystem mit weniger als 5cm Genauigkeit und 2km Reichweite. Ideal für Feldoperationen mit Zentimeter-Präzision.

Eigenschaften:
- <5cm Positionsgenauigkeit
- 2km Übertragungsreichweite
- Tragbares mobiles Design
- Schnelle Einrichtung
- Multi-Konstellations-Unterstützung
- Lange Akkulaufzeit
- Wetterfest (IP54)
- Echtzeit-Korrekturdaten`,
      },
      cs: {
        name: 'Mobilní Stanice XAG GNSS XRTK7',
        tagline: 'Přenosné RTK s přesností <5cm, dosah 2km',
        description: `Mobilní stanice XAG GNSS XRTK7 je přenosný vysokopřesný RTK poziční systém s přesností pod 5cm a dosahem 2km. Ideální pro polní operace vyžadující centimetrovou přesnost.

Vlastnosti:
- Přesnost pozicování <5cm
- Dosah přenosu 2km
- Přenosný mobilní design
- Rychlé nastavení
- Podpora více konstelací
- Dlouhá výdrž baterie
- Voděodolnost (IP54)
- Korekční data v reálném čase`,
      },
      nl: {
        name: 'XAG GNSS XRTK7 Mobiel Station',
        tagline: 'Draagbare RTK met <5cm nauwkeurigheid, 2km bereik',
        description: `Het XAG GNSS XRTK7 Mobiel Station is een draagbaar hoogprecisie RTK-positioneringssysteem met minder dan 5cm nauwkeurigheid en 2km bereik. Ideaal voor veldoperaties die centimeter-nauwkeurigheid vereisen.

Kenmerken:
- <5cm positioneringsnauwkeurigheid
- 2km zendbereik
- Draagbaar mobiel ontwerp
- Snelle installatie
- Multi-constellatie ondersteuning
- Lange batterijduur
- Weerbestendig (IP54)
- Real-time correctiedata`,
      },
    },
    mainImage: '/images/products/gnss-rtk/09-016-00083-1.png',
    images: [
      '/images/products/gnss-rtk/09-016-00083-1.png',
    ],
    price: 475800,
    priceEUR: 110651,
    compareAtPrice: 603200,
    compareAtPriceEUR: 140279,
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

  'gnss-rtk-fix-station': {
    id: '09-010-00019',
    sku: '09-010-00019',
    slug: 'gnss-rtk-fix-station',
    translations: {
      pl: { name: 'XAG GNSS RTK Fix Station', tagline: 'Wysokoprecyzyjny moduł RTK ±10mm dokładności', description: 'Stacja XAG GNSS RTK Fix Station zapewnia najwyższą precyzję pozycjonowania ±10mm dla profesjonalnych operacji rolniczych.' },
      en: { name: 'XAG GNSS RTK Fix Station', tagline: 'High-precision RTK module ±10mm accuracy', description: 'The XAG GNSS RTK Fix Station provides highest positioning precision of ±10mm for professional agricultural operations.' },
      es: { name: 'XAG GNSS RTK Fix Station', tagline: 'Módulo RTK de alta precisión ±10mm de precisión', description: 'La Estación XAG GNSS RTK Fix proporciona la mayor precisión de posicionamiento de ±10mm para operaciones agrícolas profesionales.' },
      de: { name: 'XAG GNSS RTK Fix Station', tagline: 'Hochpräzisions-RTK-Modul ±10mm Genauigkeit', description: 'Die XAG GNSS RTK Fix Station bietet höchste Positioniergenauigkeit von ±10mm für professionelle landwirtschaftliche Operationen.' },
      cs: { name: 'XAG GNSS RTK Fix Station', tagline: 'Vysokopřesný RTK modul ±10mm přesnost', description: 'Stanice XAG GNSS RTK Fix poskytuje nejvyšší přesnost pozicování ±10mm pro profesionální zemědělské operace.' },
      nl: { name: 'XAG GNSS RTK Fix Station', tagline: 'Hoge precisie RTK-module ±10mm nauwkeurigheid', description: 'Het XAG GNSS RTK Fix Station biedt de hoogste positioneringsnauwkeurigheid van ±10mm voor professionele landbouwoperaties.' },
    },
    mainImage: '/images/products/gnss-rtk/09-010-00019-1.png',
    images: ['/images/products/gnss-rtk/09-010-00019-1.png'],
    price: 1154400, priceEUR: 268465, compareAtPrice: null, compareAtPriceEUR: null, currency: 'PLN', stock: 0, category: 'GNSS RTK', type: 'ACCESSORY',
    specifications: [{ label: 'SKU', value: '09-010-00019' }, { label: 'Accuracy', value: '±10mm' }, { label: 'Type', value: 'Fix Station' }],
  },
  'gnss-xrtk4-rover': {
    id: '09-010-00036',
    sku: '09-010-00036',
    slug: 'gnss-xrtk4-rover',
    translations: {
      pl: { name: 'XAG GNSS XRTK4 Rover', tagline: 'Moduł pozycjonowania RTK do zastosowań rolniczych', description: 'Moduł XAG GNSS XRTK4 Rover zapewnia precyzyjne pozycjonowanie RTK dla dronów rolniczych.' },
      en: { name: 'XAG GNSS XRTK4 Rover', tagline: 'RTK positioning module for agricultural use', description: 'The XAG GNSS XRTK4 Rover module provides precision RTK positioning for agricultural drones.' },
      es: { name: 'XAG GNSS XRTK4 Rover', tagline: 'Módulo de posicionamiento RTK para uso agrícola', description: 'El módulo XAG GNSS XRTK4 Rover proporciona posicionamiento RTK de precisión para drones agrícolas.' },
      de: { name: 'XAG GNSS XRTK4 Rover', tagline: 'RTK-Positionierungsmodul für landwirtschaftliche Nutzung', description: 'Das XAG GNSS XRTK4 Rover Modul bietet präzise RTK-Positionierung für Agrardrohnen.' },
      cs: { name: 'XAG GNSS XRTK4 Rover', tagline: 'RTK poziční modul pro zemědělské použití', description: 'Modul XAG GNSS XRTK4 Rover poskytuje přesné RTK pozicování pro zemědělské drony.' },
      nl: { name: 'XAG GNSS XRTK4 Rover', tagline: 'RTK-positioneringsmodule voor landbouwgebruik', description: 'De XAG GNSS XRTK4 Rover module biedt nauwkeurige RTK-positionering voor landbouwdrones.' },
    },
    mainImage: '/images/products/gnss-rtk/09-010-00036-1.jpg',
    images: ['/images/products/gnss-rtk/09-010-00036-1.jpg'],
    price: 1144000, priceEUR: 266047, compareAtPrice: null, compareAtPriceEUR: null, currency: 'PLN', stock: 0, category: 'GNSS RTK', type: 'ACCESSORY',
    specifications: [{ label: 'SKU', value: '09-010-00036' }, { label: 'Model', value: 'XRTK4' }, { label: 'Type', value: 'Rover' }],
  },
  'station-tripod': {
    id: '13-001-00056',
    sku: '13-001-00056',
    slug: 'station-tripod',
    translations: {
      pl: { name: 'XAG Statyw Stacji', tagline: 'Statyw dla stacji GNSS RTK', description: 'Profesjonalny statyw XAG do montażu stacji GNSS RTK. Stabilna konstrukcja dla precyzyjnych pomiarów.' },
      en: { name: 'XAG Station Tripod', tagline: 'Tripod for GNSS RTK stations', description: 'Professional XAG tripod for mounting GNSS RTK stations. Stable construction for precise measurements.' },
      es: { name: 'XAG Trípode de Estación', tagline: 'Trípode para estaciones GNSS RTK', description: 'Trípode profesional XAG para montar estaciones GNSS RTK. Construcción estable para mediciones precisas.' },
      de: { name: 'XAG Stationsstativ', tagline: 'Stativ für GNSS RTK Stationen', description: 'Professionelles XAG-Stativ zur Montage von GNSS RTK-Stationen. Stabile Konstruktion für präzise Messungen.' },
      cs: { name: 'XAG Stativ Stanice', tagline: 'Stativ pro GNSS RTK stanice', description: 'Profesionální stativ XAG pro montáž GNSS RTK stanic. Stabilní konstrukce pro přesná měření.' },
      nl: { name: 'XAG Station Statief', tagline: 'Statief voor GNSS RTK-stations', description: 'Professioneel XAG-statief voor montage van GNSS RTK-stations. Stabiele constructie voor nauwkeurige metingen.' },
    },
    mainImage: '/images/products/gnss-rtk/13-001-00056-1.png',
    images: ['/images/products/gnss-rtk/13-001-00056-1.png'],
    price: 67600, priceEUR: 15721, compareAtPrice: null, compareAtPriceEUR: null, currency: 'PLN', stock: 0, category: 'GNSS RTK', type: 'ACCESSORY',
    specifications: [{ label: 'SKU', value: '13-001-00056' }, { label: 'Brand', value: 'XAG' }, { label: 'Type', value: 'Tripod' }],
  },

  // ==================== AIRBORNE (DRONES) ====================
  'p100-pro-rtk-package': {
    id: 'AU-XAG-PROP6',
    sku: 'AU-XAG-PROP6',
    slug: 'p100-pro-rtk-package',
    translations: {
      pl: { name: 'XAG P100 Pro Package + RTK', tagline: 'Pełny pakiet z RTK dla precyzji centymetrowej', description: 'Kompletny pakiet drona XAG P100 Pro z systemem RTK dla najwyższej precyzji pozycjonowania na poziomie centymetrów.' },
      en: { name: 'XAG P100 Pro Package + RTK', tagline: 'Full package with RTK for centimetre-level precision', description: 'Complete XAG P100 Pro drone package with RTK system for highest centimeter-level positioning precision.' },
      es: { name: 'XAG P100 Pro Package + RTK', tagline: 'Paquete completo con RTK para precisión centimétrica', description: 'Paquete completo de dron XAG P100 Pro con sistema RTK para la mayor precisión de posicionamiento a nivel de centímetros.' },
      de: { name: 'XAG P100 Pro Package + RTK', tagline: 'Komplettpaket mit RTK für Zentimeter-Präzision', description: 'Komplettes XAG P100 Pro Drohnenpaket mit RTK-System für höchste Zentimeter-Positioniergenauigkeit.' },
      cs: { name: 'XAG P100 Pro Package + RTK', tagline: 'Kompletní balíček s RTK pro centimetrovou přesnost', description: 'Kompletní balíček dronu XAG P100 Pro se systémem RTK pro nejvyšší centimetrovou přesnost pozicování.' },
      nl: { name: 'XAG P100 Pro Package + RTK', tagline: 'Compleet pakket met RTK voor centimeter-nauwkeurigheid', description: 'Compleet XAG P100 Pro dronepakket met RTK-systeem voor hoogste centimeter-positioneringsnauwkeurigheid.' },
    },
    mainImage: '/images/products/drones/au-xag-prop6-1.png',
    images: ['/images/products/drones/au-xag-prop6-1.png'],
    price: 12480000, priceEUR: 2902326, compareAtPrice: 15293200, compareAtPriceEUR: 3556558, currency: 'PLN', stock: 1, category: 'Airborne', type: 'PRODUCT',
    specifications: [{ label: 'SKU', value: 'AU-XAG-PROP6' }, { label: 'Model', value: 'P100 Pro + RTK' }, { label: 'Precision', value: 'Centimeter-level' }],
  },
  'p100-pro-basic-package': {
    id: 'AU-XAG-PROP4',
    sku: 'AU-XAG-PROP4',
    slug: 'p100-pro-basic-package',
    translations: {
      pl: {
        name: 'XAG P100 Pro - Pakiet Podstawowy',
        tagline: 'Kompletny pakiet opryskowy: zbiornik 50L, 4 baterie, 2 ładowarki',
        description: `Pakiet Podstawowy XAG P100 Pro to kompletne rozwiązanie dronowe dla profesjonalnych operacji opryskowych. Ten pakiet zawiera wszystko, czego potrzebujesz do rozpoczęcia precyzyjnego rolnictwa.

Pakiet zawiera:
- 1x Dron Rolniczy XAG P100 Pro
- 1x Zbiornik Opryskowy 50L
- 4x Inteligentne Baterie B13960S
- 2x Ładowarki S-Charger CM13600S
- 1x Pilot Zdalnego Sterowania RC Pro
- 1x Terminal Sterowania CT2

Cechy:
- Pojemność ładunku 50L
- Szerokość oprysku 50m
- System precyzyjnego oprysku
- Inteligentne planowanie lotu
- Radar śledzenia terenu
- Odporność na wodę IP67
- Gotowy do lotu`,
      },
      en: {
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
      },
      es: {
        name: 'XAG P100 Pro - Paquete Básico',
        tagline: 'Paquete completo de pulverización: tanque 50L, 4 baterías, 2 cargadores',
        description: `El Paquete Básico XAG P100 Pro es una solución completa de dron agrícola para operaciones de pulverización profesional. Este paquete incluye todo lo que necesitas para comenzar operaciones de agricultura de precisión.

El paquete incluye:
- 1x Dron Agrícola XAG P100 Pro
- 1x Tanque de Pulverización 50L
- 4x Baterías Inteligentes B13960S
- 2x Cargadores S-Charger CM13600S
- 1x Control Remoto RC Pro
- 1x Terminal de Control CT2

Características:
- Capacidad de carga de 50L
- Ancho de pulverización de 50m
- Sistema de pulverización de precisión
- Planificación de vuelo inteligente
- Radar de seguimiento de terreno
- Resistencia al agua IP67
- Listo para volar`,
      },
      de: {
        name: 'XAG P100 Pro - Basispaket',
        tagline: 'Komplettes Sprühpaket: 50L Tank, 4 Batterien, 2 Ladegeräte',
        description: `Das XAG P100 Pro Basispaket ist eine komplette Agrardrohnenlösung für professionelle Sprühoperationen. Dieses Paket enthält alles, was Sie für Präzisionslandwirtschaft benötigen.

Paketinhalt:
- 1x XAG P100 Pro Agrardrohne
- 1x 50L Sprühtank
- 4x Smart Batterien B13960S
- 2x Ladegeräte S-Charger CM13600S
- 1x Fernbedienung RC Pro
- 1x Steuerterminal CT2

Eigenschaften:
- 50L Nutzlastkapazität
- 50m Sprühbreite
- Präzisions-Sprühsystem
- Intelligente Flugplanung
- Terrain-Folge-Radar
- IP67 Wasserschutz
- Flugbereit`,
      },
      cs: {
        name: 'XAG P100 Pro - Základní Balíček',
        tagline: 'Kompletní postřikovací balíček: nádrž 50L, 4 baterie, 2 nabíječky',
        description: `Základní balíček XAG P100 Pro je kompletní řešení zemědělského dronu pro profesionální postřikové operace. Tento balíček obsahuje vše potřebné pro zahájení přesného zemědělství.

Obsah balíčku:
- 1x Zemědělský dron XAG P100 Pro
- 1x Postřiková nádrž 50L
- 4x Chytré baterie B13960S
- 2x Nabíječky S-Charger CM13600S
- 1x Dálkové ovládání RC Pro
- 1x Řídicí terminál CT2

Vlastnosti:
- Kapacita nákladu 50L
- Šířka postřiku 50m
- Přesný postřikovací systém
- Inteligentní plánování letu
- Radar sledování terénu
- Voděodolnost IP67
- Připraveno k letu`,
      },
      nl: {
        name: 'XAG P100 Pro - Basispakket',
        tagline: 'Compleet sproeiapakket: 50L tank, 4 batterijen, 2 laders',
        description: `Het XAG P100 Pro Basispakket is een complete landbouwdroneoplossing voor professionele sproeioperaties. Dit pakket bevat alles wat u nodig heeft om precisie-landbouw te starten.

Pakket bevat:
- 1x XAG P100 Pro Landbouwdrone
- 1x 50L Sproeitank
- 4x Slimme Batterijen B13960S
- 2x Batterijladers S-Charger CM13600S
- 1x Afstandsbediening RC Pro
- 1x Besturingsterminal CT2

Kenmerken:
- 50L laadvermogen
- 50m sproeibreedte
- Precisie sproeiysteem
- Intelligente vluchtplanning
- Terreinvolgende radar
- IP67 waterbestendigheid
- Klaar om te vliegen`,
      },
    },
    mainImage: '/images/products/drones/au-xag-prop4-1.png',
    images: [
      '/images/products/drones/au-xag-prop4-1.png',
      '/images/products/drones/au-xag-prop4-2.png',
      '/images/products/drones/au-xag-prop4-3.png',
    ],
    price: 10920000,
    priceEUR: 2539535,
    compareAtPrice: 12896000,
    compareAtPriceEUR: 2999070,
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
  'p100-pro': {
    id: '09-007-00136',
    sku: '09-007-00136',
    slug: 'p100-pro',
    translations: {
      pl: {
        name: 'XAG P100 Pro',
        tagline: 'Profesjonalny dron rolniczy do precyzyjnego oprysku',
        description: `XAG P100 Pro to profesjonalny dron rolniczy zaprojektowany do operacji precyzyjnego oprysku. Wyposażony w zaawansowaną kontrolę lotu i technologię oprysku dla maksymalnej wydajności.

Cechy:
- Pojemność ładunku 50L
- Precyzyjne dysze opryskowe
- Radar śledzenia terenu
- Inteligentne planowanie tras
- Możliwość pracy w każdych warunkach
- Odporność na wodę IP67
- Modułowa konstrukcja dla łatwej konserwacji`,
      },
      en: {
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
      },
      es: {
        name: 'XAG P100 Pro',
        tagline: 'Dron agrícola profesional para pulverización de precisión',
        description: `El XAG P100 Pro es un dron agrícola de grado profesional diseñado para operaciones de pulverización de precisión. Cuenta con control de vuelo avanzado y tecnología de pulverización para máxima eficiencia.

Características:
- Capacidad de carga de 50L
- Boquillas de pulverización de precisión
- Radar de seguimiento de terreno
- Planificación inteligente de rutas
- Capacidad de operación en todo clima
- Resistencia al agua IP67
- Diseño modular para fácil mantenimiento`,
      },
      de: {
        name: 'XAG P100 Pro',
        tagline: 'Professionelle Agrardrohne für Präzisionssprühen',
        description: `Die XAG P100 Pro ist eine professionelle Agrardrohne für Präzisions-Sprühoperationen. Mit fortschrittlicher Flugsteuerung und Sprühtechnologie für maximale Effizienz.

Eigenschaften:
- 50L Nutzlastkapazität
- Präzisions-Sprühdüsen
- Terrain-Folge-Radar
- Intelligente Routenplanung
- Allwetter-Betriebsfähigkeit
- IP67 Wasserschutz
- Modulares Design für einfache Wartung`,
      },
      cs: {
        name: 'XAG P100 Pro',
        tagline: 'Profesionální zemědělský dron pro přesné postřikování',
        description: `XAG P100 Pro je profesionální zemědělský dron navržený pro přesné postřikovací operace. Vybaven pokročilým řízením letu a postřikovací technologií pro maximální efektivitu.

Vlastnosti:
- Kapacita nákladu 50L
- Přesné postřikovací trysky
- Radar sledování terénu
- Inteligentní plánování tras
- Schopnost provozu za každého počasí
- Voděodolnost IP67
- Modulární design pro snadnou údržbu`,
      },
      nl: {
        name: 'XAG P100 Pro',
        tagline: 'Professionele landbouwdrone voor precisie spuiten',
        description: `De XAG P100 Pro is een professionele landbouwdrone ontworpen voor precisie sproeioperaties. Met geavanceerde vluchtbesturing en sproeitechnologie voor maximale efficiëntie.

Kenmerken:
- 50L laadvermogen
- Precisie sproeikoppen
- Terreinvolgende radar
- Intelligente routeplanning
- Alle weersomstandigheden
- IP67 waterbestendigheid
- Modulair ontwerp voor eenvoudig onderhoud`,
      },
    },
    mainImage: '/images/products/drones/09-007-00136-1.png',
    images: [
      '/images/products/drones/09-007-00136-1.png',
      '/images/products/drones/09-007-00136-2.png',
    ],
    price: 7280000,
    priceEUR: 1693023,
    compareAtPrice: null,
    compareAtPriceEUR: null,
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
  'p150-max': {
    id: 'XAG-P150-MAX',
    sku: '09-007-00158',
    slug: 'p150-max',
    translations: {
      pl: {
        name: 'XAG P150 Max',
        tagline: 'Ładowność 80kg, zbiornik 80L - maksymalna wydajność',
        description: `Pakiet zawiera:
- 1x Dron Rolniczy XAG P150 Max z RevoSpray 5 (09-007-00158)
- 1x Pilot Zdalnego Sterowania XAG SRC5 (05-002-02725)
- 4x Inteligentna Bateria XAG B141050 Smart Super Charge (09-017-00073)
- 2x Ładowarka XAG CM13600S (09-017-00069)
- 2x Kabel Zasilający EU do Ładowarki CM13600S (01-027-02823)
- 2x Wieża Chłodząca Baterie XAG 2024 (09-017-00065)`,
      },
      en: {
        name: 'XAG P150 Max',
        tagline: '80kg payload, 80L spray tank - maximum efficiency',
        description: `Package includes:
- 1x XAG P150 Max Agricultural Drone with RevoSpray 5 (09-007-00158)
- 1x XAG SRC5 Smart Remote Controller (05-002-02725)
- 4x XAG B141050 Smart Super Charge Battery (09-017-00073)
- 2x XAG CM13600S Charger (09-017-00069)
- 2x XAG Plug Power Cord-EU for CM13600S (01-027-02823)
- 2x XAG 2024 Battery Cooling Tower (09-017-00065)`,
      },
      es: {
        name: 'XAG P150 Max',
        tagline: '80kg de carga, tanque de 80L - máxima eficiencia',
        description: `El paquete incluye:
- 1x Dron Agrícola XAG P150 Max con RevoSpray 5 (09-007-00158)
- 1x Control Remoto XAG SRC5 (05-002-02725)
- 4x Batería XAG B141050 Smart Super Charge (09-017-00073)
- 2x Cargador XAG CM13600S (09-017-00069)
- 2x Cable de alimentación XAG EU para CM13600S (01-027-02823)
- 2x Torre de enfriamiento XAG 2024 Battery Cooling (09-017-00065)`,
      },
      de: {
        name: 'XAG P150 Max',
        tagline: '80kg Nutzlast, 80L Sprühtank - maximale Effizienz',
        description: `Paket enthält:
- 1x XAG P150 Max Agrardrohne mit RevoSpray 5 (09-007-00158)
- 1x XAG SRC5 Smart Remote Controller (05-002-02725)
- 4x XAG B141050 Smart Super Charge Battery (09-017-00073)
- 2x XAG CM13600S Ladegerät (09-017-00069)
- 2x XAG Netzkabel-EU für CM13600S (01-027-02823)
- 2x XAG 2024 Battery Cooling Tower (09-017-00065)`,
      },
      cs: {
        name: 'XAG P150 Max',
        tagline: '80kg náklad, 80L nádrž - maximální efektivita',
        description: `Balení obsahuje:
- 1x XAG P150 Max Agricultural Drone s RevoSpray 5 (09-007-00158)
- 1x XAG SRC5 Smart Remote Controller (05-002-02725)
- 4x XAG B141050 Smart Super Charge Battery (09-017-00073)
- 2x XAG CM13600S Nabíječka (09-017-00069)
- 2x XAG Napájecí kabel-EU pro CM13600S (01-027-02823)
- 2x XAG 2024 Battery Cooling Tower (09-017-00065)`,
      },
      nl: {
        name: 'XAG P150 Max',
        tagline: '80kg laadvermogen, 80L sproeitank - maximale efficiëntie',
        description: `Pakket bevat:
- 1x XAG P150 Max Agricultural Drone met RevoSpray 5 (09-007-00158)
- 1x XAG SRC5 Smart Remote Controller (05-002-02725)
- 4x XAG B141050 Smart Super Charge Battery (09-017-00073)
- 2x XAG CM13600S Lader (09-017-00069)
- 2x XAG Voedingskabel-EU voor CM13600S (01-027-02823)
- 2x XAG 2024 Battery Cooling Tower (09-017-00065)`,
      },
    },
    mainImage: '/images/products/drones/p150-max/p150-max-1.png',
    images: [
      '/images/products/drones/p150-max/p150-max-1.png',
    ],
    price: 11500000,
    priceEUR: 2674000,
    compareAtPrice: null,
    compareAtPriceEUR: null,
    currency: 'PLN',
    stock: 3,
    category: 'Airborne',
    type: 'PRODUCT',
    specifications: [
      { label: 'SKU', value: 'XAG-P150-MAX' },
      { label: 'Model', value: 'P150 Max' },
      { label: 'Payload', value: '80kg' },
      { label: 'Tank', value: '80L' },
      { label: 'IP Rating', value: 'IP67' },
      { label: 'Type', value: 'Agricultural Drone' },
    ],
  },
  'p100-pro-spreader-package': {
    id: 'AU-XAG-PROP5',
    sku: 'AU-XAG-PROP5',
    slug: 'p100-pro-spreader-package',
    translations: {
      pl: {
        name: 'XAG P100 Pro - Pakiet Rozsiewający',
        tagline: 'Kompletne rozwiązanie rozsiewające z systemem JetSeed',
        description: `Pakiet Rozsiewający XAG P100 Pro jest przeznaczony do precyzyjnych operacji rozsiewania. Zawiera system rozsiewający JetSeed do efektywnej aplikacji nawozów i nasion.

Pakiet zawiera:
- 1x Dron Rolniczy XAG P100 Pro
- 1x System Rozsiewający JetSeed (pojemność 80L)
- 4x Inteligentne Baterie B13960S
- 2x Ładowarki S-Charger CM13600S
- 1x Pilot Zdalnego Sterowania RC Pro
- 1x Terminal Sterowania CT2

Cechy:
- Lej rozsiewający 80L
- Zmienna dawka rozsiewu
- Technologia precyzyjnej aplikacji
- Inteligentne planowanie lotu
- Monitorowanie przepływu w czasie rzeczywistym`,
      },
      en: {
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
      },
      es: {
        name: 'XAG P100 Pro - Paquete Esparcidor',
        tagline: 'Solución completa de esparcimiento con sistema JetSeed',
        description: `El Paquete Esparcidor XAG P100 Pro está diseñado para operaciones de esparcimiento de precisión. Incluye el sistema de esparcimiento JetSeed para aplicación eficiente de fertilizantes y semillas.

El paquete incluye:
- 1x Dron Agrícola XAG P100 Pro
- 1x Sistema de Esparcimiento JetSeed (capacidad 80L)
- 4x Baterías Inteligentes B13960S
- 2x Cargadores S-Charger CM13600S
- 1x Control Remoto RC Pro
- 1x Terminal de Control CT2

Características:
- Tolva de esparcimiento de 80L
- Tasa de esparcimiento variable
- Tecnología de aplicación de precisión
- Planificación de vuelo inteligente
- Monitoreo de flujo en tiempo real`,
      },
      de: {
        name: 'XAG P100 Pro - Streupaket',
        tagline: 'Komplette Streulösung mit JetSeed-System',
        description: `Das XAG P100 Pro Streupaket ist für Präzisions-Streuoperationen konzipiert. Mit JetSeed-Streusystem für effiziente Dünger- und Saatgutausbringung.

Paketinhalt:
- 1x XAG P100 Pro Agrardrohne
- 1x JetSeed Streusystem (80L Kapazität)
- 4x Smart Batterien B13960S
- 2x Ladegeräte S-Charger CM13600S
- 1x Fernbedienung RC Pro
- 1x Steuerterminal CT2

Eigenschaften:
- 80L Streutrichter
- Variable Streurate
- Präzisions-Ausbringungstechnologie
- Intelligente Flugplanung
- Echtzeit-Durchflussüberwachung`,
      },
      cs: {
        name: 'XAG P100 Pro - Rozmetací Balíček',
        tagline: 'Kompletní rozmetací řešení se systémem JetSeed',
        description: `Rozmetací balíček XAG P100 Pro je určen pro přesné rozmetací operace. Obsahuje rozmetací systém JetSeed pro efektivní aplikaci hnojiv a semen.

Obsah balíčku:
- 1x Zemědělský dron XAG P100 Pro
- 1x Rozmetací systém JetSeed (kapacita 80L)
- 4x Chytré baterie B13960S
- 2x Nabíječky S-Charger CM13600S
- 1x Dálkové ovládání RC Pro
- 1x Řídicí terminál CT2

Vlastnosti:
- Rozmetací zásobník 80L
- Proměnlivá dávka rozmetání
- Přesná aplikační technologie
- Inteligentní plánování letu
- Sledování průtoku v reálném čase`,
      },
      nl: {
        name: 'XAG P100 Pro - Strooipakket',
        tagline: 'Complete strooioplossing met JetSeed systeem',
        description: `Het XAG P100 Pro Strooipakket is ontworpen voor precisie-strooioperaties. Inclusief het JetSeed strooiysteem voor efficiënte meststof- en zaadtoepassing.

Pakket bevat:
- 1x XAG P100 Pro Landbouwdrone
- 1x JetSeed Strooiysteem (80L capaciteit)
- 4x Slimme Batterijen B13960S
- 2x Batterijladers S-Charger CM13600S
- 1x Afstandsbediening RC Pro
- 1x Besturingsterminal CT2

Kenmerken:
- 80L strooitrechter
- Variabele strooihoeveelheid
- Precisie toepassingstechnologie
- Intelligente vluchtplanning
- Real-time debietmonitoring`,
      },
    },
    mainImage: '/images/products/drones/au-xag-prop5-1.png',
    images: [
      '/images/products/drones/au-xag-prop5-1.png',
      '/images/products/drones/au-xag-prop5-2.png',
      '/images/products/drones/au-xag-prop5-3.png',
    ],
    price: 11700000,
    priceEUR: 2720930,
    compareAtPrice: 13520000,
    compareAtPriceEUR: 3144186,
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
};

// Map old SKU slugs to new clean slugs for backward compatibility
const slugMapping: Record<string, string> = {
  '09-017-00064': 'smart-battery-b13970s',
  '09-017-00025': 'smart-battery-b13960s',
  '09-017-00069': 'battery-s-charger-cm13600s',
  '09-023-00025': 'revospray-p3',
  '09-016-00085': 'remote-controller-src5',
  '09-016-00083': 'gnss-xrtk7-mobile-station',
  'AU-XAG-PROP4': 'p100-pro-basic-package',
  '09-007-00136': 'p100-pro',
  'AU-XAG-PROP5': 'p100-pro-spreader-package',
};

export default function ProductDetailPage() {
  const params = useParams();
  const rawSlug = params.slug as string;
  const locale = useLocale() as Locale;
  const t = useTranslations('productDetail');

  // Handle old SKU-based URLs by redirecting to new clean slug
  const slug = slugMapping[rawSlug] || rawSlug;
  const staticProduct = mockProducts[slug];

  const [quantity, setQuantity] = useState(1);
  
  const [activeImage, setActiveImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  
  // B2B store - must be called at top level (React Hooks rules)
  const { isLoggedIn, getB2BPrice } = useB2BStore();

  // State for database prices
  const [dbPrices, setDbPrices] = useState<DbPrices>(null);
  
  // State for API product (full product from database)
  const [apiProduct, setApiProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch product from database
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products?slug=${slug}&locale=${locale}`);
        if (response.ok) {
          const data = await response.json();
          if (data.product) {
            const dbProduct = data.product;
            
            // Transform DB product to match the Product type
            const transformedProduct: Product = {
              id: dbProduct.id,
              sku: dbProduct.sku || slug,
              slug: dbProduct.slug,
              translations: {
                pl: {
                  name: dbProduct.name,
                  tagline: dbProduct.tagline || null,
                  description: dbProduct.description || '',
                },
                en: {
                  name: dbProduct.name,
                  tagline: dbProduct.tagline || null,
                  description: dbProduct.description || '',
                },
                es: {
                  name: dbProduct.name,
                  tagline: dbProduct.tagline || null,
                  description: dbProduct.description || '',
                },
                de: {
                  name: dbProduct.name,
                  tagline: dbProduct.tagline || null,
                  description: dbProduct.description || '',
                },
                cs: {
                  name: dbProduct.name,
                  tagline: dbProduct.tagline || null,
                  description: dbProduct.description || '',
                },
                nl: {
                  name: dbProduct.name,
                  tagline: dbProduct.tagline || null,
                  description: dbProduct.description || '',
                },
              },
              mainImage: dbProduct.mainImage || null,
              images: Array.isArray(dbProduct.images) ? dbProduct.images : (dbProduct.mainImage ? [dbProduct.mainImage] : []),
              price: dbProduct.price,
              priceEUR: dbProduct.priceEUR,
              compareAtPrice: dbProduct.compareAtPrice,
              compareAtPriceEUR: dbProduct.compareAtPriceEUR,
              currency: 'PLN',
              stock: dbProduct.stock,
              category: dbProduct.category || 'Uncategorized',
              type: dbProduct.type || 'PRODUCT',
              specifications: (dbProduct.specifications && dbProduct.specifications !== '') ? 
                (typeof dbProduct.specifications === 'string' ? 
                  (function() { try { return JSON.parse(dbProduct.specifications); } catch(e) { return []; } })() : 
                  (Array.isArray(dbProduct.specifications) ? dbProduct.specifications : [])) : 
                [],
            };
            
            setApiProduct(transformedProduct);
            setDbPrices({
              price: dbProduct.price,
              priceEUR: dbProduct.priceEUR,
              compareAtPrice: dbProduct.compareAtPrice,
              compareAtPriceEUR: dbProduct.compareAtPriceEUR,
              stock: dbProduct.stock,
              preorderEnabled: dbProduct.preorderEnabled ?? false,
              preorderLeadTime: dbProduct.preorderLeadTime ?? null,
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) {
      fetchProduct();
    }
  }, [slug]);
  
  // Use API product if available, otherwise fallback to static mockProducts
  const product = apiProduct || staticProduct;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy mb-4"></div>
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

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

  // Get translations for current locale, fallback to English
  const translation = product.translations[locale] || product.translations.en;

  // Use EUR for all languages except Polish
  const isPolish = locale === 'pl';

  // Use database prices if available, otherwise fallback to static prices
  const actualPrice = dbPrices?.price ?? product.price;
  const actualPriceEUR = dbPrices?.priceEUR ?? product.priceEUR;
  const actualCompareAtPrice = dbPrices?.compareAtPrice ?? product.compareAtPrice;
  const actualCompareAtPriceEUR = dbPrices?.compareAtPriceEUR ?? product.compareAtPriceEUR;
  const actualStock = dbPrices?.stock ?? product.stock;
  const actualPreorderEnabled = dbPrices?.preorderEnabled ?? false;
  const actualPreorderLeadTime = dbPrices?.preorderLeadTime ?? null;

  // Calculate B2B price now that we have the product
  const b2bPrice = isLoggedIn && product ? getB2BPrice(product.slug, actualPrice, actualPriceEUR) : null;

  // Use B2B price if available, otherwise use regular price
  const currency = b2bPrice ? b2bPrice.currency : (isPolish ? 'PLN' : 'EUR');
  const displayPrice = b2bPrice ? b2bPrice.price : (isPolish ? actualPrice : actualPriceEUR);
  const displayCompareAtPrice = b2bPrice
    ? (isPolish ? actualPrice : actualPriceEUR) // Show regular price as compare when B2B
    : (isPolish ? actualCompareAtPrice : actualCompareAtPriceEUR);
  const isB2BPrice = b2bPrice?.isB2BPrice || false;

  const hasDiscount = displayCompareAtPrice && displayCompareAtPrice > displayPrice;
  const discountPercent = hasDiscount
    ? Math.round((1 - displayPrice / displayCompareAtPrice!) * 100)
    : 0;

  const VAT_RATE = 0.23; // 23% VAT in Poland

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat(isPolish ? 'pl-PL' : 'de-DE', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  // Calculate Netto from Brutto (prices stored are Brutto with 23% VAT)
  const calculateNetto = (brutto: number) => {
    return Math.round(brutto / (1 + VAT_RATE));
  };

  const handleAddToCart = () => {
    setAddingToCart(true);

    const isPreorder = actualStock === 0 && actualPreorderEnabled;

    useCartStore.getState().addItem({
      productId: product.id,
      name: translation.name,
      slug: product.slug,
      image: product.mainImage,
      price: displayPrice,
      quantity,
      currency: currency as 'PLN' | 'EUR',
      isPreorder,
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
            <span className="text-navy font-medium">{translation.name}</span>
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
                  alt={translation.name}
                  fill
                  className="object-contain p-8" unoptimized
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
                {actualStock === 0 && (
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
                      alt={`${translation.name} ${idx + 1}`}
                      width={80}
                      height={80}
                      unoptimized
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
                {translation.name}
              </h1>
              {translation.tagline && (
                <p className="text-lg text-gray-600 mt-2">{translation.tagline}</p>
              )}
            </div>

            {/* Price - B2B shows only netto (reverse charge), regular shows netto & brutto */}
            <div className="space-y-2">
              {/* B2B Badge */}
              {isB2BPrice && (
                <span className="inline-block px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">
                  B2B Price
                </span>
              )}

              {isB2BPrice ? (
                /* B2B Customer - Show only netto price (reverse charge applies) */
                <>
                  <div className="flex items-baseline gap-4">
                    <span className="text-3xl font-bold text-green-600">
                      {formatPrice(displayPrice)}
                    </span>
                    <span className="text-sm text-gray-500">netto</span>
                    {hasDiscount && displayCompareAtPrice && (
                      <span className="text-xl text-gray-400 line-through">
                        {formatPrice(displayCompareAtPrice)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    VAT 0% - Reverse charge (intra-community)
                  </p>
                </>
              ) : (
                /* Regular Customer - Show netto & brutto */
                <>
                  <div className="flex items-baseline gap-4">
                    <span className={`text-3xl font-bold ${hasDiscount ? 'text-brand-red' : 'text-navy'}`}>
                      {formatPrice(calculateNetto(displayPrice))}
                    </span>
                    <span className="text-sm text-gray-500">netto</span>
                    {hasDiscount && displayCompareAtPrice && (
                      <span className="text-xl text-gray-400 line-through">
                        {formatPrice(calculateNetto(displayCompareAtPrice))}
                      </span>
                    )}
                  </div>
                  <div className="text-lg text-gray-600">
                    {formatPrice(displayPrice)} <span className="text-sm">{isPolish ? "brutto" : "incl. VAT"}</span>
                    {hasDiscount && displayCompareAtPrice && (
                      <span className="ml-2 text-gray-400 line-through">
                        {formatPrice(displayCompareAtPrice)}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {actualStock > 0 ? (
                <>
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-green-700 font-medium">{t('inStock')}</span>
                  <span className="text-gray-500">({actualStock} {t('available')})</span>
                </>
              ) : actualPreorderEnabled ? (
                <>
                  <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                  <span className="text-orange-700 font-medium">{t('preOrder')}</span>
                </>
              ) : (
                <>
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span className="text-red-700 font-medium">{t('outOfStock')}</span>
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
                disabled={addingToCart || (actualStock === 0 && !actualPreorderEnabled)}
                className={`flex-1 justify-center ${
                  actualStock === 0 && !actualPreorderEnabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed px-6 py-3 rounded-lg font-semibold flex items-center'
                    : actualStock === 0 && actualPreorderEnabled
                    ? 'bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center transition-colors'
                    : 'btn-primary'
                }`}
              >
                {addingToCart ? (
                  <>
                    <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('adding')}
                  </>
                ) : actualStock === 0 && !actualPreorderEnabled ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    {t('outOfStock')}
                  </>
                ) : actualStock === 0 && actualPreorderEnabled ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t('preOrder')}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {t('addToCart')}
                  </>
                )}
              </button>
            </div>

            {/* Preorder Info */}
            {actualStock === 0 && actualPreorderEnabled && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-orange-800 text-sm font-medium mb-1">{t('preOrderTitle')}</p>
                <p className="text-orange-700 text-sm">
                  {t('preOrderMessage')}
                </p>
                {actualPreorderLeadTime && (
                  <p className="text-orange-700 text-sm mt-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{t('estimatedDelivery')}:</span> {actualPreorderLeadTime}
                  </p>
                )}
              </div>
            )}

            {/* Out of Stock Info */}
            {actualStock === 0 && !actualPreorderEnabled && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-800 text-sm">
                  {t('outOfStockMessage')}
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

        {/* Description */}
        <div className="mt-16 border-t pt-8">
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: translation.description }}
          />
        </div>
      </div>
    </div>
  );
}
