import { supabaseAdmin } from '../src/config/supabase.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const cities = ['Nairobi', 'Mombasa', 'Kisumu', 'Eldoret'];
const amenities = [
  'Wi-Fi', 'Hot Water', 'Study Room', 'Laundry', 'Security', 'Parking',
  'CCTV', 'Gym', 'Rooftop Lounge', 'Backup Power', 'Kitchen', 'Water Tank',
  'Common Room', 'Study Pods', 'Library', 'Cafeteria', 'Swimming Pool', 'Concierge'
];

const roomTypeOptions = [
  'Single', 'Double', 'Triple', 'Dormitory (6-bed)', 'Single (En-suite)', 'Studio (En-suite)'
];

const hostels = [
  {
    name: 'Premier Heights',
    description: 'Modern student accommodation with premium amenities. Located just a 5-minute walk from the university campus.',
    address: '123 University Way',
    city: 'Nairobi',
    distanceToUni: '0.5 km from UoN',
    priceMin: 12000,
    priceMax: 25000,
    gender: 'mixed',
    amenities: ['Wi-Fi', 'Hot Water', 'Security', 'CCTV', 'Backup Power', 'Study Room'],
    images: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'
    ],
    contactPhone: '+254 712 345 678',
    contactWhatsApp: '+254712345678',
    contactEmail: 'premier@hostelconnect.co.ke',
    featured: true,
    rating: 4.8,
    roomTypes: [
      { type: 'Single', price: 18000, available: 8 },
      { type: 'Double', price: 25000, available: 12 },
      { type: 'Studio (En-suite)', price: 22000, available: 5 }
    ]
  },
  {
    name: 'Campus View',
    description: 'Affordable student housing with stunning campus views. Perfect for students who want comfort at a budget-friendly price.',
    address: '45 Campus Road',
    city: 'Nairobi',
    distanceToUni: '1.2 km from KU',
    priceMin: 8000,
    priceMax: 15000,
    gender: 'mixed',
    amenities: ['Wi-Fi', 'Hot Water', 'Laundry', 'Security', 'Common Room'],
    images: [
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'
    ],
    contactPhone: '+254 723 456 789',
    contactWhatsApp: '+254723456789',
    contactEmail: 'campusview@hostelconnect.co.ke',
    featured: true,
    rating: 4.5,
    roomTypes: [
      { type: 'Single', price: 12000, available: 10 },
      { type: 'Double', price: 15000, available: 15 },
      { type: 'Triple', price: 8000, available: 20 }
    ]
  },
  {
    name: 'Ocean Breeze',
    description: 'Coastal living experience near TUM. Enjoy ocean views and cool breezes while studying.',
    address: '78 Beachfront Avenue',
    city: 'Mombasa',
    distanceToUni: '2.0 km from TUM',
    priceMin: 10000,
    priceMax: 20000,
    gender: 'mixed',
    amenities: ['Wi-Fi', 'Hot Water', 'Swimming Pool', 'Security', 'CCTV', 'Rooftop Lounge'],
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa'
    ],
    contactPhone: '+254 734 567 890',
    contactWhatsApp: '+254734567890',
    contactEmail: 'oceanbreeze@hostelconnect.co.ke',
    featured: true,
    rating: 4.7,
    roomTypes: [
      { type: 'Single (En-suite)', price: 20000, available: 6 },
      { type: 'Double', price: 15000, available: 10 },
      { type: 'Dormitory (6-bed)', price: 10000, available: 24 }
    ]
  },
  {
    name: 'Lakeside Suites',
    description: 'Serene accommodation near Lake Victoria. Ideal for students seeking a peaceful study environment.',
    address: '234 Lakeside Drive',
    city: 'Kisumu',
    distanceToUni: '1.5 km from Maseno',
    priceMin: 9000,
    priceMax: 18000,
    gender: 'mixed',
    amenities: ['Wi-Fi', 'Hot Water', 'Water Tank', 'Security', 'Study Room', 'Cafeteria'],
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
      'https://images.unsplash.com/photo-1560185009-5f9b67a2f8f0'
    ],
    contactPhone: '+254 745 678 901',
    contactWhatsApp: '+254745678901',
    contactEmail: 'lakeside@hostelconnect.co.ke',
    featured: false,
    rating: 4.3,
    roomTypes: [
      { type: 'Single', price: 12000, available: 8 },
      { type: 'Double', price: 18000, available: 12 },
      { type: 'Triple', price: 9000, available: 18 }
    ]
  },
  {
    name: 'Highland Residences',
    description: 'Comfortable living in the highlands. Close to Moi University with modern amenities.',
    address: '567 Highland Avenue',
    city: 'Eldoret',
    distanceToUni: '1.0 km from Moi',
    priceMin: 8500,
    priceMax: 16000,
    gender: 'mixed',
    amenities: ['Wi-Fi', 'Hot Water', 'Backup Power', 'Security', 'Gym', 'Laundry'],
    images: [
      'https://images.unsplash.com/photo-1560185009-5f9b67a2f8f0',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af'
    ],
    contactPhone: '+254 756 789 012',
    contactWhatsApp: '+254756789012',
    contactEmail: 'highland@hostelconnect.co.ke',
    featured: true,
    rating: 4.6,
    roomTypes: [
      { type: 'Single', price: 12000, available: 10 },
      { type: 'Double', price: 16000, available: 14 },
      { type: 'Studio (En-suite)', price: 15000, available: 7 }
    ]
  },
  {
    name: 'Strathmore Heights',
    description: 'Premium student accommodation near Strathmore University. Modern facilities and 24/7 security.',
    address: '89 Strathmore Lane',
    city: 'Nairobi',
    distanceToUni: '0.3 km from Strathmore',
    priceMin: 15000,
    priceMax: 28000,
    gender: 'mixed',
    amenities: ['Wi-Fi', 'Hot Water', 'Gym', 'Security', 'CCTV', 'Study Pods', 'Library', 'Cafeteria'],
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2',
      'https://images.unsplash.com/photo-1554995207-c18c203602cb'
    ],
    contactPhone: '+254 767 890 123',
    contactWhatsApp: '+254767890123',
    contactEmail: 'strathmore@hostelconnect.co.ke',
    featured: true,
    rating: 4.9,
    roomTypes: [
      { type: 'Single (En-suite)', price: 22000, available: 5 },
      { type: 'Double', price: 28000, available: 8 },
      { type: 'Studio (En-suite)', price: 25000, available: 4 }
    ]
  },
  {
    name: 'Mombasa Central',
    description: 'Conveniently located in the heart of Mombasa city. Easy access to all amenities.',
    address: '123 Central Avenue',
    city: 'Mombasa',
    distanceToUni: '2.5 km from TUM',
    priceMin: 7000,
    priceMax: 14000,
    gender: 'male',
    amenities: ['Wi-Fi', 'Security', 'Laundry', 'Common Room', 'Water Tank'],
    images: [
      'https://images.unsplash.com/photo-1554995207-c18c203602cb',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'
    ],
    contactPhone: '+254 778 901 234',
    contactWhatsApp: '+254778901234',
    contactEmail: 'mombasacentral@hostelconnect.co.ke',
    featured: false,
    rating: 4.1,
    roomTypes: [
      { type: 'Single', price: 10000, available: 12 },
      { type: 'Double', price: 14000, available: 8 },
      { type: 'Triple', price: 7000, available: 15 }
    ]
  },
  {
    name: 'Kisumu Gardens',
    description: 'Beautiful garden setting with modern amenities. Perfect for students who love nature.',
    address: '456 Garden Road',
    city: 'Kisumu',
    distanceToUni: '2.0 km from JOOUST',
    priceMin: 8000,
    priceMax: 15000,
    gender: 'female',
    amenities: ['Wi-Fi', 'Hot Water', 'Security', 'Garden', 'Study Room', 'Kitchen'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf'
    ],
    contactPhone: '+254 789 012 345',
    contactWhatsApp: '+254789012345',
    contactEmail: 'kisumugardens@hostelconnect.co.ke',
    featured: false,
    rating: 4.4,
    roomTypes: [
      { type: 'Single', price: 12000, available: 6 },
      { type: 'Double', price: 15000, available: 10 },
      { type: 'Dormitory (6-bed)', price: 8000, available: 18 }
    ]
  },
  {
    name: 'Eldoret Elite',
    description: 'Top-tier accommodation near University of Eldoret. Fully furnished with premium amenities.',
    address: '789 Elite Way',
    city: 'Eldoret',
    distanceToUni: '0.8 km from UoE',
    priceMin: 12000,
    priceMax: 22000,
    gender: 'mixed',
    amenities: ['Wi-Fi', 'Hot Water', 'Gym', 'Swimming Pool', 'Security', 'CCTV', 'Backup Power'],
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb'
    ],
    contactPhone: '+254 790 123 456',
    contactWhatsApp: '+254790123456',
    contactEmail: 'eldoretelite@hostelconnect.co.ke',
    featured: true,
    rating: 4.7,
    roomTypes: [
      { type: 'Single (En-suite)', price: 18000, available: 4 },
      { type: 'Double', price: 22000, available: 6 },
      { type: 'Studio (En-suite)', price: 20000, available: 3 }
    ]
  },
  {
    name: 'USIU Gardens',
    description: 'Modern student housing right next to USIU. Safe, secure, and student-friendly environment.',
    address: '234 USIU Road',
    city: 'Nairobi',
    distanceToUni: '0.2 km from USIU',
    priceMin: 14000,
    priceMax: 24000,
    gender: 'mixed',
    amenities: ['Wi-Fi', 'Hot Water', 'Security', 'Study Room', 'Cafeteria', 'Laundry', 'Parking'],
    images: [
      'https://images.unsplash.com/photo-1560185009-5f9b67a2f8f0',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af'
    ],
    contactPhone: '+254 701 234 567',
    contactWhatsApp: '+254701234567',
    contactEmail: 'usiu@hostelconnect.co.ke',
    featured: false,
    rating: 4.5,
    roomTypes: [
      { type: 'Single', price: 18000, available: 7 },
      { type: 'Double', price: 24000, available: 9 },
      { type: 'Triple', price: 14000, available: 12 }
    ]
  }
];

const inquiries = [
  {
    hostelName: 'Premier Heights',
    name: 'John Mwangi',
    email: 'john.mwangi@example.com',
    phone: '+254712345678',
    message: 'I am interested in a single room. Is it still available?',
    moveInDate: '2024-02-01',
    status: 'pending'
  },
  {
    hostelName: 'Campus View',
    name: 'Mary Wanjiku',
    email: 'mary.wanjiku@example.com',
    phone: '+254723456789',
    message: 'Do you have any discounts for semester-long stays?',
    moveInDate: '2024-01-15',
    status: 'contacted'
  },
  {
    hostelName: 'Ocean Breeze',
    name: 'James Otieno',
    email: 'james.otieno@example.com',
    phone: '+254734567890',
    message: 'Is the swimming pool available for residents?',
    moveInDate: '2024-02-10',
    status: 'closed'
  },
  {
    hostelName: 'Lakeside Suites',
    name: 'Sarah Kipchoge',
    email: 'sarah.kipchoge@example.com',
    phone: '+254745678901',
    message: 'I would like to view the rooms before moving in.',
    moveInDate: '2024-01-20',
    status: 'pending'
  },
  {
    hostelName: 'Highland Residences',
    name: 'Peter Njoroge',
    email: 'peter.njoroge@example.com',
    phone: '+254756789012',
    message: 'Is there parking available for students with cars?',
    moveInDate: '2024-02-05',
    status: 'pending'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database...');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await supabaseAdmin.from('room_types').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('hostels').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('inquiries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Seed hostels
    console.log('Seeding hostels...');
    for (const hostel of hostels) {
      const { roomTypes, ...hostelData } = hostel;
      
      // Generate slug
      const slug = hostelData.name.toLowerCase().replace(/\s+/g, '-');
      
      // Calculate total rooms
      const totalRooms = roomTypes.reduce((sum, rt) => sum + rt.available, 0);
      
      // Insert hostel
      const { data: newHostel, error: hostelError } = await supabaseAdmin
        .from('hostels')
        .insert({
          ...hostelData,
          slug,
          total_rooms: totalRooms,
          occupancy: Math.floor(Math.random() * 30) + 50 // Random occupancy between 50-80%
        })
        .select()
        .single();
      
      if (hostelError) throw hostelError;
      
      // Insert room types
      for (const roomType of roomTypes) {
        const { error: roomError } = await supabaseAdmin
          .from('room_types')
          .insert({
            ...roomType,
            hostel_id: newHostel.id
          });
        
        if (roomError) throw roomError;
      }
      
      console.log(`✅ Added hostel: ${hostel.name}`);
    }
    
    // Seed inquiries
    console.log('Seeding inquiries...');
    for (const inquiry of inquiries) {
      // Find hostel ID
      const { data: hostel } = await supabaseAdmin
        .from('hostels')
        .select('id')
        .eq('name', inquiry.hostelName)
        .single();
      
      if (hostel) {
        const { error: inquiryError } = await supabaseAdmin
          .from('inquiries')
          .insert({
            ...inquiry,
            hostel_id: hostel.id
          });
        
        if (inquiryError) throw inquiryError;
        console.log(`✅ Added inquiry from: ${inquiry.name}`);
      }
    }
    
    // Create admin user if not exists
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const { error: adminError } = await supabaseAdmin
      .from('admin_users')
      .upsert({
        email: 'admin@hostelconnect.co.ke',
        password_hash: hashedPassword,
        full_name: 'Admin User',
        role: 'admin'
      }, { onConflict: 'email' });
    
    if (adminError) throw adminError;
    console.log('✅ Admin user created/updated');
    
    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();