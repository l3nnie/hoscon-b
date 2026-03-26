import { supabase, supabaseAdmin } from '../config/supabase.js';
import { generateSlug, ensureUniqueSlug } from '../utils/slugify.js';

class HostelModel {
  /**
   * Get all hostels with filters, sorting, and pagination
   */
  static async findAll(filters = {}) {
    try {
      let query = supabase
        .from('hostels')
        .select('*, room_types(*)');
      
      // Apply filters
      if (filters.city) {
        query = query.eq('city', filters.city);
      }
      
      if (filters.gender) {
        query = query.eq('gender', filters.gender);
      }
      
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      
      if (filters.priceMin) {
        query = query.gte('price_min', filters.priceMin);
      }
      
      if (filters.priceMax) {
        query = query.lte('price_max', filters.priceMax);
      }
      
      if (filters.amenities && filters.amenities.length > 0) {
        query = query.contains('amenities', filters.amenities);
      }
      
      // Apply sorting
      switch (filters.sort) {
        case 'price-asc':
          query = query.order('price_min', { ascending: true });
          break;
        case 'price-desc':
          query = query.order('price_min', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        default:
          // Default: featured first, then by rating
          query = query.order('featured', { ascending: false })
            .order('rating', { ascending: false });
      }
      
      // Apply pagination
      const page = filters.page || 1;
      const limit = Math.min(filters.limit || 6, 50); // Max 50 items per page
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error, count } = await query
        .range(from, to)
        .select('*, room_types(*)', { count: 'exact' });
      
      if (error) throw error;
      
      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error in HostelModel.findAll:', error);
      throw error;
    }
  }
  
  /**
   * Find hostel by slug
   */
  static async findBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('hostels')
        .select('*, room_types(*)')
        .eq('slug', slug)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error in HostelModel.findBySlug:', error);
      throw error;
    }
  }
  
  /**
   * Find hostel by ID
   */
  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('hostels')
        .select('*, room_types(*)')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error in HostelModel.findById:', error);
      throw error;
    }
  }
  
  /**
   * Get featured hostels
   */
  static async findFeatured(limit = 6) {
    try {
      const { data, error } = await supabase
        .from('hostels')
        .select('*, room_types(*)')
        .eq('featured', true)
        .order('rating', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in HostelModel.findFeatured:', error);
      throw error;
    }
  }
  
  /**
   * Get nearby hostels (same city, excluding current)
   */
  static async findNearby(city, excludeSlug, limit = 3) {
    try {
      const { data, error } = await supabase
        .from('hostels')
        .select('*, room_types(*)')
        .eq('city', city)
        .neq('slug', excludeSlug)
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in HostelModel.findNearby:', error);
      throw error;
    }
  }
  
  /**
   * Create new hostel
   */
  static async create(hostelData) {
    try {
      const { roomTypes, ...hostelBasicData } = hostelData;
      
      // Generate unique slug
      const slug = await ensureUniqueSlug(hostelData.name);
      
      // Calculate total rooms
      const totalRooms = roomTypes.reduce((sum, rt) => sum + rt.available, 0);
      
      // Create hostel
      const { data: newHostel, error: hostelError } = await supabaseAdmin
        .from('hostels')
        .insert({
          ...hostelBasicData,
          slug,
          total_rooms: totalRooms,
          occupancy: 0,
          rating: hostelData.rating || 0
        })
        .select()
        .single();
      
      if (hostelError) throw hostelError;
      
      // Create room types
      if (roomTypes && roomTypes.length > 0) {
        const roomTypesData = roomTypes.map(rt => ({
          ...rt,
          hostel_id: newHostel.id
        }));
        
        const { error: roomsError } = await supabaseAdmin
          .from('room_types')
          .insert(roomTypesData);
        
        if (roomsError) throw roomsError;
      }
      
      // Return complete hostel with room types
      return await this.findBySlug(slug);
    } catch (error) {
      console.error('Error in HostelModel.create:', error);
      throw error;
    }
  }
  
  /**
   * Update existing hostel
   */
  static async update(id, hostelData) {
    try {
      const { roomTypes, ...hostelBasicData } = hostelData;
      
      // Check if hostel exists
      const existingHostel = await this.findById(id);
      if (!existingHostel) {
        throw new Error('Hostel not found');
      }
      
      // Update slug if name changed
      let slug = existingHostel.slug;
      if (hostelData.name && hostelData.name !== existingHostel.name) {
        slug = await ensureUniqueSlug(hostelData.name, id);
      }
      
      // Calculate total rooms if room types are provided
      let totalRooms = existingHostel.total_rooms;
      if (roomTypes) {
        totalRooms = roomTypes.reduce((sum, rt) => sum + rt.available, 0);
      }
      
      // Update hostel
      const { data: updatedHostel, error: hostelError } = await supabaseAdmin
        .from('hostels')
        .update({
          ...hostelBasicData,
          slug,
          total_rooms: totalRooms,
          updated_at: new Date()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (hostelError) throw hostelError;
      
      // Update room types if provided
      if (roomTypes) {
        // Delete existing room types
        const { error: deleteError } = await supabaseAdmin
          .from('room_types')
          .delete()
          .eq('hostel_id', id);
        
        if (deleteError) throw deleteError;
        
        // Insert new room types
        const roomTypesData = roomTypes.map(rt => ({
          ...rt,
          hostel_id: id
        }));
        
        const { error: insertError } = await supabaseAdmin
          .from('room_types')
          .insert(roomTypesData);
        
        if (insertError) throw insertError;
      }
      
      // Return complete hostel with room types
      return await this.findById(id);
    } catch (error) {
      console.error('Error in HostelModel.update:', error);
      throw error;
    }
  }
  
  /**
   * Delete hostel
   */
  static async delete(id) {
    try {
      // Check if hostel exists
      const existingHostel = await this.findById(id);
      if (!existingHostel) {
        throw new Error('Hostel not found');
      }
      
      // Delete hostel (room types will cascade delete)
      const { error } = await supabaseAdmin
        .from('hostels')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { success: true, message: 'Hostel deleted successfully' };
    } catch (error) {
      console.error('Error in HostelModel.delete:', error);
      throw error;
    }
  }
  
  /**
   * Get hostel statistics for dashboard
   */
  static async getStats() {
    try {
      const { data, error } = await supabase
        .from('hostels')
        .select('id, total_rooms, occupancy, rating');
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return {
          total: 0,
          totalRooms: 0,
          avgOccupancy: 0,
          avgRating: 0
        };
      }
      
      const total = data.length;
      const totalRooms = data.reduce((sum, h) => sum + (h.total_rooms || 0), 0);
      const totalOccupancy = data.reduce((sum, h) => sum + (h.occupancy || 0), 0);
      const totalRating = data.reduce((sum, h) => sum + (h.rating || 0), 0);
      
      return {
        total,
        totalRooms,
        avgOccupancy: Math.round(totalOccupancy / total),
        avgRating: totalRating / total
      };
    } catch (error) {
      console.error('Error in HostelModel.getStats:', error);
      throw error;
    }
  }
  
  /**
   * Update occupancy rate
   */
  static async updateOccupancy(id, occupancy) {
    try {
      const { error } = await supabaseAdmin
        .from('hostels')
        .update({ occupancy, updated_at: new Date() })
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error in HostelModel.updateOccupancy:', error);
      throw error;
    }
  }
}

export default HostelModel;