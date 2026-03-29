/**
 * Standard API response formatter
 */
class ApiResponse {
  /**
   * Success response
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    const response = {
      success: true,
      message,
      timestamp: new Date().toISOString()
    };
    
    if (data !== null) {
      response.data = data;
    }
    
    return res.status(statusCode).json(response);
  }
  
  /**
   * Success response with pagination
   */
  static paginated(res, data, pagination, message = 'Success', statusCode = 200) {
    const response = {
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString()
    };
    
    return res.status(statusCode).json(response);
  }
  
  /**
   * Error response
   */
  static error(res, message = 'Internal server error', statusCode = 500, details = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };
    
    if (details && process.env.NODE_ENV === 'development') {
      response.details = details;
    }
    
    return res.status(statusCode).json(response);
  }
  
  /**
   * Validation error response
   */
  static validationError(res, errors, message = 'Validation failed', statusCode = 400) {
    const response = {
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    };
    
    return res.status(statusCode).json(response);
  }
  
  /**
   * Not found response
   */
  static notFound(res, resource = 'Resource', statusCode = 404) {
    return this.error(res, `${resource} not found`, statusCode);
  }
  
  /**
   * Unauthorized response
   */
  static unauthorized(res, message = 'Unauthorized access', statusCode = 401) {
    return this.error(res, message, statusCode);
  }
  
  /**
   * Forbidden response
   */
  static forbidden(res, message = 'Access forbidden', statusCode = 403) {
    return this.error(res, message, statusCode);
  }
  
  /**
   * Created response (201)
   */
  static created(res, data = null, message = 'Resource created successfully') {
    return this.success(res, data, message, 201);
  }
  
  /**
   * Updated response (200)
   */
  static updated(res, data = null, message = 'Resource updated successfully') {
    return this.success(res, data, message, 200);
  }
  
  /**
   * Deleted response (200)
   */
  static deleted(res, message = 'Resource deleted successfully') {
    return this.success(res, null, message, 200);
  }
}

/**
 * Helper to format hostel data for response
 */
export const formatHostelResponse = (hostel) => {
  if (!hostel) return null;
  
  return {
    id: hostel.id,
    slug: hostel.slug,
    name: hostel.name,
    description: hostel.description,
    address: hostel.address,
    city: hostel.city,
    distanceToUni: hostel.distance_to_uni,
    priceMin: hostel.price_min,
    priceMax: hostel.price_max,
    priceRange: `KSh ${hostel.price_min.toLocaleString()} - ${hostel.price_max.toLocaleString()}`,
    gender: hostel.gender,
    amenities: hostel.amenities,
    images: hostel.images,
    roomTypes: hostel.room_types?.map(rt => ({
      type: rt.type,
      price: rt.price,
      total: rt.total,
      available: rt.available
    })) || [],
    contactPhone: hostel.contact_phone,
    contactWhatsApp: hostel.contact_whatsapp,
    contactEmail: hostel.contact_email,
    featured: hostel.featured,
    rating: hostel.rating,
    totalRooms: hostel.total_rooms,
    occupancy: hostel.occupancy,
    createdAt: hostel.created_at,
    updatedAt: hostel.updated_at
  };
};

/**
 * Helper to format inquiry data for response
 */
export const formatInquiryResponse = (inquiry) => {
  if (!inquiry) return null;
  
  return {
    id: inquiry.id,
    hostelId: inquiry.hostel_id,
    hostelName: inquiry.hostel_name,
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    message: inquiry.message,
    moveInDate: inquiry.move_in_date,
    status: inquiry.status,
    createdAt: inquiry.created_at,
    formattedDate: new Date(inquiry.created_at).toLocaleDateString('en-KE'),
    formattedMoveInDate: new Date(inquiry.move_in_date).toLocaleDateString('en-KE')
  };
};

/**
 * Helper to format user data for response
 */
export const formatUserResponse = (user) => {
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    createdAt: user.created_at,
    lastLogin: user.last_login
  };
};

/**
 * Helper to format dashboard stats
 */
export const formatDashboardResponse = (stats) => {
  return {
    hostels: {
      total: stats.hostels.total,
      totalRooms: stats.hostels.totalRooms,
      avgOccupancy: stats.hostels.avgOccupancy,
      avgRating: stats.hostels.avgRating
    },
    inquiries: {
      total: stats.inquiries.total,
      pending: stats.inquiries.pending,
      contacted: stats.inquiries.contacted,
      closed: stats.inquiries.closed,
      pendingPercentage: stats.inquiries.pendingPercentage,
      contactedPercentage: stats.inquiries.contactedPercentage,
      closedPercentage: stats.inquiries.closedPercentage
    },
    recentActivity: {
      inquiries: stats.recentInquiries,
      hostels: stats.recentHostels
    },
    trends: stats.trends
  };
};

export default ApiResponse;