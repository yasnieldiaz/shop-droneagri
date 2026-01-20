'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const keyMetrics = [
  { value: '80L', label: 'Spraying Tank', icon: '💧' },
  { value: '46L/min', label: 'Max Flow Rate', icon: '⚡' },
  { value: '115L', label: 'Spreading Tank', icon: '🌾' },
  { value: '300kg/min', label: 'Max Spread Rate', icon: '📊' },
  { value: '80kg', label: 'Lifting Capacity', icon: '🏋️' },
  { value: '20ha', label: 'Coverage/Flight', icon: '🗺️' },
];

const features = [
  {
    title: 'Real-Time 3D Terrain Mapping',
    description: 'Map-free autonomous flight with live terrain analysis',
    image: '/images/products/p150-max/map-free-flight.webp',
  },
  {
    title: 'Swarm Operation',
    description: '1 controller, 2 aircraft - double your efficiency',
    image: '/images/products/p150-max/swarm.avif',
  },
  {
    title: '80kg Payload Capacity',
    description: 'Industry-leading lifting power for any task',
    image: '/images/products/p150-max/payload.avif',
  },
  {
    title: 'Lightweight Design',
    description: 'Only 32kg - portable by a single person',
    image: '/images/products/p150-max/light-weight.avif',
  },
  {
    title: 'Max Operation Speed',
    description: '20 m/s for rapid field coverage',
    image: '/images/products/p150-max/max-speed.avif',
  },
  {
    title: 'Easy Setup',
    description: 'Get flying in minutes with intuitive controls',
    image: '/images/products/p150-max/easy-setup.avif',
  },
];

const sprayingFeatures = [
  {
    title: 'Flexible Impeller Pumps',
    description: '300+ hour service life with self-priming capability',
    image: '/images/products/p150-max/impeller-pumps.avif',
  },
  {
    title: 'Intelligent Centrifugal Nozzles',
    description: 'Droplet size 60-500μm for precision application',
    image: '/images/products/p150-max/nozzles.webp',
  },
  {
    title: 'Smart Liquid Tank',
    description: 'Real-time monitoring with automatic return when low',
    image: '/images/products/p150-max/tank.avif',
  },
];

const safetyFeatures = [
  {
    title: '4D Imaging Radar',
    description: 'Obstacle detection from 1.5m to 100m range, works day and night',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
  },
  {
    title: 'Terrain Following',
    description: 'Automatic height adjustment without pre-mapping required',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    title: 'AI Obstacle Recognition',
    description: 'Smart detection of people, vehicles, and obstacles',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    title: 'AR Smart Assistance',
    description: 'Augmented reality overlays for real-time hazard visualization',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const controllerFeatures = [
  { step: '01', title: 'Quick Device Binding', description: 'Connect in seconds with automatic pairing' },
  { step: '02', title: 'Easy Field Planning', description: 'Draw boundaries and set routes with touch' },
  { step: '03', title: 'One-Click Operation', description: 'Start autonomous missions instantly' },
  { step: '04', title: 'Smart Return-to-Home', description: 'Automatic return when low on battery or liquid' },
];

const powerSystem = [
  {
    title: 'B141050 Smart Battery',
    specs: '1050Wh capacity, 1500 charge cycles',
    image: '/images/products/p150-max/battery.avif',
  },
  {
    title: 'CM13600S Charger',
    specs: 'AC input, 3400W fast charging',
    image: '/images/products/battery-chargers/09-017-00069-1.jpg',
  },
  {
    title: 'Parallel Charging Kit',
    specs: '6800W input for multi-battery charging',
    image: '/images/products/battery-chargers/pc-pck-10000-1.jpg',
  },
];

const testimonials = [
  {
    name: 'Autonomous Ag Solutions',
    quote: 'The P150 Max has transformed how we approach large-scale spraying operations.',
    video: 'O15x3tS9snI',
  },
  {
    name: 'Cotton Grower Case Study',
    quote: 'Efficiency gains of over 40% compared to traditional methods.',
    video: '_svAOAXirac',
  },
  {
    name: 'Wickham Farms',
    quote: 'The swarm capability means we can cover twice the ground in half the time.',
    video: 'LC6MG8xdE88',
  },
];

export default function P150MaxPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-navy text-white min-h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          >
            <source src="/videos/hero-video.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-transparent z-10" />

        <div className="container relative z-20 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block bg-brand-red px-4 py-1 rounded-full text-sm font-medium mb-6">
              NEW 2024 MODEL
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              Fly Max.<br />
              <span className="text-brand-red">Performance to the Max.</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              The all-purpose agricultural drone that redefines what one operator can achieve.
              Spraying, spreading, and logistics - all in one platform.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a href="#specs" className="btn-primary">
                View Specs
              </a>
              <a href="#contact" className="btn-secondary bg-white/10 border-white/30 text-white hover:bg-white/20">
                Order Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics - "One Drone for ALL" */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-navy mb-4">One Drone for ALL</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From precision spraying to heavy-duty spreading and logistics, the P150 Max handles it all.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {keyMetrics.map((metric) => (
              <div key={metric.label} className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-lg transition-shadow">
                <div className="text-3xl mb-2">{metric.icon}</div>
                <div className="text-3xl font-bold text-brand-red mb-1">{metric.value}</div>
                <div className="text-sm text-gray-600">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="group relative rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3]">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold mb-1">{feature.title}</h3>
                  <p className="text-gray-300 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spraying System */}
      <section id="specs" className="py-20 bg-navy text-white">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <span className="text-brand-red font-medium mb-2 block">REVOSPRAY P5</span>
              <h2 className="text-4xl font-bold mb-6">Precision Spraying System</h2>
              <p className="text-gray-300 mb-8">
                The RevoSpray P5 delivers unmatched spraying precision with an 80L tank capacity
                and intelligent centrifugal nozzles that produce droplets from 60-500μm.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-2xl font-bold text-brand-red">80L</div>
                  <div className="text-sm text-gray-400">Tank Capacity</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-2xl font-bold text-brand-red">46L/min</div>
                  <div className="text-sm text-gray-400">Max Flow Rate</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-2xl font-bold text-brand-red">5-10m</div>
                  <div className="text-sm text-gray-400">Spray Width</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-2xl font-bold text-brand-red">60-500μm</div>
                  <div className="text-sm text-gray-400">Droplet Size</div>
                </div>
              </div>
            </div>

            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <Image
                src="/images/products/p150-max/nozzles.webp"
                alt="RevoSpray P5"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {sprayingFeatures.map((feature) => (
              <div key={feature.title} className="bg-white/5 rounded-2xl overflow-hidden">
                <div className="aspect-video relative">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Spreading System */}
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <Image
                src="/images/products/p150-max/spreading.avif"
                alt="RevoCast P5"
                fill
                className="object-cover"
              />
            </div>

            <div>
              <span className="text-brand-red font-medium mb-2 block">REVOCAST P5</span>
              <h2 className="text-4xl font-bold text-navy mb-6">Heavy-Duty Spreading System</h2>
              <p className="text-gray-600 mb-8">
                The RevoCast P5 features Vertical Waving Spreader technology for uniform distribution
                of fertilizers, seeds, and granules up to 10mm in size.
              </p>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-brand-red">115L</div>
                  <div className="text-sm text-gray-500">Container</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-brand-red">300kg/min</div>
                  <div className="text-sm text-gray-500">Spread Rate</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-brand-red">9m</div>
                  <div className="text-sm text-gray-500">Swath Width</div>
                </div>
              </div>

              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Vertical Waving Spreader for uniform distribution</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Three interchangeable screw feeders for different materials</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-600">Handles materials up to 10mm in size</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Logistics - RevoSling */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <span className="text-brand-red font-medium mb-2 block">REVOSLING</span>
            <h2 className="text-4xl font-bold text-navy mb-4">Field Logistics System</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              80kg payload capacity for transporting farm inputs, produce, seedling trays, and more.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-video rounded-2xl overflow-hidden">
              <Image
                src="/images/products/p150-max/lift.avif"
                alt="RevoSling"
                fill
                className="object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl mb-3">📦</div>
                <h4 className="font-bold text-navy mb-1">Farm Inputs</h4>
                <p className="text-sm text-gray-500">Seeds, fertilizers, chemicals</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl mb-3">🥬</div>
                <h4 className="font-bold text-navy mb-1">Farm Produce</h4>
                <p className="text-sm text-gray-500">Harvest transport</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl mb-3">🌱</div>
                <h4 className="font-bold text-navy mb-1">Seedling Trays</h4>
                <p className="text-sm text-gray-500">Nursery logistics</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-3xl mb-3">🌳</div>
                <h4 className="font-bold text-navy mb-1">Saplings</h4>
                <p className="text-sm text-gray-500">Tree planting support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety System */}
      <section className="py-20 bg-navy text-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Intelligent Safety System</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Autonomy without limits. Advanced 4D radar and AI-powered obstacle detection
              keeps your operation safe day and night.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {safetyFeatures.map((feature) => (
              <div key={feature.title} className="bg-white/5 rounded-2xl p-6 text-center">
                <div className="w-16 h-16 bg-brand-red/20 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-red">
                  {feature.icon}
                </div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden">
            <Image
              src="/images/products/p150-max/radar.jpg"
              alt="4D Imaging Radar"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy/80 to-transparent flex items-center">
              <div className="p-8 lg:p-12 max-w-xl">
                <h3 className="text-3xl font-bold mb-4">4D Imaging Radar</h3>
                <p className="text-gray-300">
                  Detection range from 1.5m to 100m. Works in complete darkness, dust,
                  and challenging weather conditions. Real-time 3D terrain mapping
                  without pre-loaded maps.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SRC5 Remote Controller */}
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-brand-red font-medium mb-2 block">SRC5 CONTROLLER</span>
              <h2 className="text-4xl font-bold text-navy mb-6">
                Effortless Setup. Smarter Farming From Day One.
              </h2>
              <p className="text-gray-600 mb-8">
                The SRC5 features a 7.02" high-brightness display, 20,000mAh battery,
                and XLINK HD transmission for crystal-clear FPV with AR overlays.
              </p>

              <div className="space-y-4">
                {controllerFeatures.map((feature) => (
                  <div key={feature.step} className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-brand-red text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {feature.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-navy">{feature.title}</h4>
                      <p className="text-gray-500 text-sm">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <Image
                src="/images/products/p150-max/src5-controller.avif"
                alt="SRC5 Controller"
                fill
                className="object-contain p-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Power System */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-navy mb-4">
              High Capacity. High Performance. Zero Compromise.
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The B141050 smart battery delivers 1050Wh of power with 1500 charge cycles warranty.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {powerSystem.map((item) => (
              <div key={item.title} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="aspect-square relative bg-gray-50">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-contain p-8"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-navy mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.specs}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-navy mb-4">Why Choose XAG?</h2>
            <p className="text-gray-600">Hear from farmers who have transformed their operations.</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="aspect-video rounded-2xl overflow-hidden mb-6">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${testimonials[activeTestimonial].video}`}
                title={testimonials[activeTestimonial].name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>

            <div className="flex justify-center gap-4">
              {testimonials.map((testimonial, index) => (
                <button
                  key={testimonial.name}
                  onClick={() => setActiveTestimonial(index)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTestimonial === index
                      ? 'bg-brand-red text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {testimonial.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-20 bg-navy text-white">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Interested in the P150 Max?</h2>
              <p className="text-gray-300">Contact our expert team for pricing and availability in Poland.</p>
            </div>

            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red"
                  placeholder="+48 123 456 789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red"
                  placeholder="Tell us about your farming needs..."
                ></textarea>
              </div>

              <button type="submit" className="w-full btn-primary justify-center py-4">
                Send Inquiry
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Back to Products */}
      <section className="py-12 bg-gray-50">
        <div className="container text-center">
          <Link href="/products?category=airborne" className="btn-secondary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to All Drones
          </Link>
        </div>
      </section>
    </div>
  );
}
