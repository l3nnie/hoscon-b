import HostelModel from '../models/Hostel.js';

class HostelService {
  /**
   * Get all hostels with filters
   */
  static async getAllHostels(filters) {
    try {
      const result = await HostelModel.findAll(filters);
      
      // Add computed fields if needed
      const hostelsWithComputed = result.data.map(hostel => ({
        ...hostel,
        priceRange: `KSh ${hostel.price_min.toLocaleString()} - ${hostel.price_max.toLocaleString()}`,
        occupancyPercentage: hostel.occupancy,
        isFull: hostel.occupancy >= 95,
        isLowAvailability: hostel.occupancy >= 80
      }));
      
      return {
        ...result,
        data: hostelsWithComputed
      };
    } catch (error) {
      console.error('Error in HostelService.getAllHostels:', error);
      throw error;
    }
  }
  
  /**
   * Get hostel by slug
   */
  static async getHostelBySlug(slug) {
    try {
      const hostel = await HostelModel.findBySlug(slug);
      
      if (!hostel) {
        throw new Error('Hostel not found');
      }
      
      // Add computed fields
      return {
        ...hostel,
        priceRange: `KSh ${hostel.price_min.toLocaleString()} - ${hostel.price_max.toLocaleString()}`,
        totalAvailableRooms: hostel.room_types.reduce((sum, rt) => sum + rt.available, 0),
        occupancyPercentage: hostel.occupancy,
        roomTypesWithAvailability: hostel.room_types.map(rt => ({
          ...rt,
          isAvailable: rt.available > 0,
          availabilityStatus: rt.available === 0 ? 'full' : 
                              rt.available <= 2 ? 'limited' : 'available'
        }))
      };
    } catch (error) {
      console.error('Error in HostelService.getHostelBySlug:', error);
      throw error;
    }
  }
  
  /**
   * Create new hostel
   */
  static async createHostel(hostelData) {
    try {
      // Validate data
      this.validateHostelData(hostelData);
      
      // Create hostel
      const newHostel = await HostelModel.create(hostelData);
      
      return newHostel;
    } catch (error) {
      console.error('Error in HostelService.createHostel:', error);
      throw error;
    }
  }
  
  /**
   * Update hostel
   */
  static async updateHostel(id, hostelData) {
    try {
      // Validate data
      this.validateHostelData(hostelData, true);
      
      // Update hostel
      const updatedHostel = await HostelModel.update(id, hostelData);
      
      return updatedHostel;
    } catch (error) {
      console.error('Error in HostelService.updateHostel:', error);
      throw error;
    }
  }
  
  /**
   * Delete hostel
   */
  static async deleteHostel(id) {
    try {
      const result = await HostelModel.delete(id);
      return result;
    } catch (error) {
      console.error('Error in HostelService.deleteHostel:', error);
      throw error;
    }
  }
  
  /**
   * Get featured hostels
   */
  static async getFeaturedHostels(limit = 6) {
    try {
      const hostels = await HostelModel.findFeatured(limit);
      
      return hostels.map(hostel => ({
        ...hostel,
        priceRange: `KSh ${hostel.price_min.toLocaleString()} - ${hostel.price_max.toLocaleString()}`
      }));
    } catch (error) {
      console.error('Error in HostelService.getFeaturedHostels:', error);
      throw error;
    }
  }
  
  /**
   * Get nearby hostels
   */
  static async getNearbyHostels(city, excludeSlug, limit = 3) {
    try {
      const hostels = await HostelModel.findNearby(city, excludeSlug, limit);
      
      return hostels.map(hostel => ({
        ...hostel,
        priceRange: `KSh ${hostel.price_min.toLocaleString()} - ${hostel.price_max.toLocaleString()}`
      }));
    } catch (error) {
      console.error('Error in HostelService.getNearbyHostels:', error);
      throw error;
    }
  }
  
  /**
   * Validate hostel data
   */
  static validateHostelData(data, isUpdate = false) {
    const errors = [];
    
    if (!isUpdate || data.name) {
      if (!data.name || data.name.length < 3) {
        errors.push('Name must be at least 3 characters');
      }
    }
    
    if (!isUpdate || data.description) {
      if (!data.description || data.description.length < 20) {
        errors.push('Description must be at least 20 characters');
      }
    }
    
    if (!isUpdate || data.address) {
      if (!data.address || data.address.length < 5) {
        errors.push('Address must be at least 5 characters');
      }
    }
    
    if (!isUpdate || data.city) {
      const validCities = ['Nairobi', 'Mombasa', 'Kisumu', 'Eldoret'];
      if (!data.city || !validCities.includes(data.city)) {
        errors.push('Invalid city');
      }
    }
    
    if (!isUpdate || data.priceMin) {
      if (data.priceMin && data.priceMin <= 0) {
        errors.push('Minimum price must be positive');
      }
    }
    
    if (!isUpdate || data.priceMax) {
      if (data.priceMax && data.priceMax <= 0) {
        errors.push('Maximum price must be positive');
      }
    }
    
    if (data.priceMin && data.priceMax && data.priceMin > data.priceMax) {
      errors.push('Minimum price cannot be greater than maximum price');
    }
    
    if (!isUpdate || data.gender) {
      const validGenders = ['any', 'ladies'];
      if (data.gender && !validGenders.includes(data.gender)) {
        errors.push('Invalid gender');
      }
    }
    
    if (!isUpdate || data.contactPhone) {
      if (data.contactPhone && data.contactPhone.length < 10) {
        errors.push('Invalid phone number');
      }
    }
    
    if (!isUpdate || data.contactWhatsApp) {
      if (data.contactWhatsApp && data.contactWhatsApp.length < 10) {
        errors.push('Invalid WhatsApp number');
      }
    }
    
    if (!isUpdate || data.contactEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (data.contactEmail && !emailRegex.test(data.contactEmail)) {
        errors.push('Invalid email address');
      }
    }
    
    if (!isUpdate && (!data.roomTypes || data.roomTypes.length === 0)) {
      errors.push('At least one room type is required');
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }
  
  /**
   * Search hostels by query
   */
  static async searchHostels(query, filters = {}) {
    try {
      const searchFilters = {
        ...filters,
        search: query
      };
      
      return await this.getAllHostels(searchFilters);
    } catch (error) {
      console.error('Error in HostelService.searchHostels:', error);
      throw error;
    }
  }
}

export default HostelService;