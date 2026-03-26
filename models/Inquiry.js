import { supabase, supabaseAdmin } from '../config/supabase.js';

class InquiryModel {
  /**
   * Get all inquiries with filters
   */
  static async findAll(filters = {}) {
    try {
      let query = supabaseAdmin
        .from('inquiries')
        .select('*');
      
      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,` +
          `email.ilike.%${filters.search}%,` +
          `hostel_name.ilike.%${filters.search}%,` +
          `phone.ilike.%${filters.search}%`
        );
      }
      
      // Apply sorting (newest first)
      query = query.order('created_at', { ascending: false });
      
      // Apply pagination
      const page = filters.page || 1;
      const limit = Math.min(filters.limit || 20, 100);
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error, count } = await query
        .range(from, to)
        .select('*', { count: 'exact' });
      
      if (error) throw error;
      
      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };
    } catch (error) {
      console.error('Error in InquiryModel.findAll:', error);
      throw error;
    }
  }
  
  /**
   * Find inquiry by ID
   */
  static async findById(id) {
    try {
      const { data, error } = await supabaseAdmin
        .from('inquiries')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error in InquiryModel.findById:', error);
      throw error;
    }
  }
  
  /**
   * Create new inquiry
   */
  static async create(inquiryData) {
    try {
      // Verify hostel exists
      const { data: hostel, error: hostelError } = await supabase
        .from('hostels')
        .select('id')
        .eq('id', inquiryData.hostelId)
        .single();
      
      if (hostelError || !hostel) {
        throw new Error('Hostel not found');
      }
      
      const { data, error } = await supabase
        .from('inquiries')
        .insert({
          hostel_id: inquiryData.hostelId,
          hostel_name: inquiryData.hostelName,
          name: inquiryData.name,
          email: inquiryData.email,
          phone: inquiryData.phone,
          message: inquiryData.message,
          move_in_date: inquiryData.moveInDate,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error in InquiryModel.create:', error);
      throw error;
    }
  }
  
  /**
   * Update inquiry status
   */
  static async updateStatus(id, status) {
    try {
      // Validate status
      const validStatuses = ['pending', 'contacted', 'closed'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }
      
      const { data, error } = await supabaseAdmin
        .from('inquiries')
        .update({ 
          status, 
          updated_at: new Date() 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error in InquiryModel.updateStatus:', error);
      throw error;
    }
  }
  
  /**
   * Delete inquiry
   */
  static async delete(id) {
    try {
      const { error } = await supabaseAdmin
        .from('inquiries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Error in InquiryModel.delete:', error);
      throw error;
    }
  }
  
  /**
   * Get inquiry statistics
   */
  static async getStats() {
    try {
      const { data, error } = await supabaseAdmin
        .from('inquiries')
        .select('status');
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        pending: 0,
        contacted: 0,
        closed: 0
      };
      
      data.forEach(inquiry => {
        switch (inquiry.status) {
          case 'pending':
            stats.pending++;
            break;
          case 'contacted':
            stats.contacted++;
            break;
          case 'closed':
            stats.closed++;
            break;
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Error in InquiryModel.getStats:', error);
      throw error;
    }
  }
  
  /**
   * Get recent inquiries (for dashboard)
   */
  static async getRecent(limit = 5) {
    try {
      const { data, error } = await supabaseAdmin
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in InquiryModel.getRecent:', error);
      throw error;
    }
  }
}

export default InquiryModel;