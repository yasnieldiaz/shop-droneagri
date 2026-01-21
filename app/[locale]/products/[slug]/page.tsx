'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { useCartStore } from '@/lib/store/cart';
import { useTranslations, useLocale } from 'next-intl';

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
  compareAtPrice: number | null;
  currency: 'PLN' | 'EUR';
  stock: number;
  category: string;
  type: string;
  specifications: { label: string; value: string }[];
};

const mockProducts: Record<string, Product> = {
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

  // ==================== AIRBORNE (DRONES) ====================
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
  const product = mockProducts[slug];

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

  // Get translations for current locale, fallback to English
  const translation = product.translations[locale] || product.translations.en;

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
      name: translation.name,
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
                      alt={`${translation.name} ${idx + 1}`}
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
                {translation.name}
              </h1>
              {translation.tagline && (
                <p className="text-lg text-gray-600 mt-2">{translation.tagline}</p>
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
                {translation.description.split('\n').map((paragraph, i) => (
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
