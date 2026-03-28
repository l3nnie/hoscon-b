/**
 * Transform database snake_case fields to camelCase for API responses
 */

export const transformHostel = (dbHostel) => {
  if (!dbHostel) return null;
  
  return {
    id: dbHostel.id,
    slug: dbHostel.slug,
    name: dbHostel.name,
    description: dbHostel.description,
    address: dbHostel.address,
    city: dbHostel.city,
    distanceToUni: dbHostel.distance_to_uni,
    priceMin: dbHostel.price_min,
    priceMax: dbHostel.price_max,
    gender: dbHostel.gender,
    amenities: dbHostel.amenities,
    images: dbHostel.images,
    roomTypes: dbHostel.room_types?.map(rt => ({
      type: rt.type,
      price: rt.price,
      available: rt.available
    })),
    contactPhone: dbHostel.contact_phone,
    contactWhatsApp: dbHostel.contact_whatsapp,
    contactEmail: dbHostel.contact_email,
    featured: dbHostel.featured,
    rating: dbHostel.rating,
    totalRooms: dbHostel.total_rooms,
    occupancy: dbHostel.occupancy,
    createdAt: dbHostel.created_at,
    updatedAt: dbHostel.updated_at
  };
};

export const transformInquiry = (dbInquiry) => {
  if (!dbInquiry) return null;
  
  return {
    id: dbInquiry.id,
    hostelId: dbInquiry.hostel_id,
    hostelName: dbInquiry.hostel_name,
    name: dbInquiry.name,
    email: dbInquiry.email,
    phone: dbInquiry.phone,
    message: dbInquiry.message,
    moveInDate: dbInquiry.move_in_date,
    status: dbInquiry.status,
    createdAt: dbInquiry.created_at,
    updatedAt: dbInquiry.updated_at
  };
};

// Transform camelCase to snake_case for database operations
export const transformHostelForDB = (hostelData) => {
  if (!hostelData) return null;
  
  return {
    id: hostelData.id,
    slug: hostelData.slug,
    name: hostelData.name,
    description: hostelData.description,
    address: hostelData.address,
    city: hostelData.city,
    distance_to_uni: hostelData.distanceToUni,
    price_min: hostelData.priceMin,
    price_max: hostelData.priceMax,
    gender: hostelData.gender,
    amenities: hostelData.amenities,
    images: hostelData.images,
    contact_phone: hostelData.contactPhone,
    contact_whatsapp: hostelData.contactWhatsApp,
    contact_email: hostelData.contactEmail,
    featured: hostelData.featured,
    rating: hostelData.rating,
    total_rooms: hostelData.totalRooms,
    occupancy: hostelData.occupancy,
    created_at: hostelData.createdAt,
    updated_at: hostelData.updatedAt
  };
};

export const transformRoomTypeForDB = (roomTypeData) => {
  if (!roomTypeData) return null;
  
  return {
    id: roomTypeData.id,
    hostel_id: roomTypeData.hostelId || roomTypeData.hostel_id,
    type: roomTypeData.type,
    price: roomTypeData.price,
    available: roomTypeData.available,
    created_at: roomTypeData.createdAt || roomTypeData.created_at
  };
};

export const transformInquiryForDB = (inquiryData) => {
  if (!inquiryData) return null;
  
  return {
    hostel_id: inquiryData.hostelId,
    hostel_name: inquiryData.hostelName,
    name: inquiryData.name,
    email: inquiryData.email,
    phone: inquiryData.phone,
    message: inquiryData.message,
    move_in_date: inquiryData.moveInDate,
    status: inquiryData.status || 'pending'
  };
};
