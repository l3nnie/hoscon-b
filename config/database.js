import { supabase, supabaseAdmin } from './supabase.js';

export const db = {
  // Hostel queries
  hostels: {
    async findAll(filters = {}) {
      let query = supabase
        .from('hostels')
        .select('*, room_types(*)');
      
      // Apply filters
      if (filters.city) query = query.eq('city', filters.city);
      if (filters.gender) query = query.eq('gender', filters.gender);
      if (filters.search) query = query.ilike('name', `%${filters.search}%`);
      if (filters.priceMin) query = query.gte('price_min', filters.priceMin);
      if (filters.priceMax) query = query.lte('price_max', filters.priceMax);
      if (filters.amenities?.length) query = query.contains('amenities', filters.amenities);
      
      // Apply sorting
      if (filters.sort === 'price-asc') query = query.order('price_min', { ascending: true });
      else if (filters.sort === 'price-desc') query = query.order('price_min', { ascending: false });
      else if (filters.sort === 'rating') query = query.order('rating', { ascending: false });
      else if (filters.sort === 'name') query = query.order('name', { ascending: true });
      else query = query.order('featured', { ascending: false }).order('rating', { ascending: false });
      
      // Apply pagination
      const page = filters.page || 1;
      const limit = filters.limit || 6;
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error, count } = await query
        .range(from, to)
        .select('*, room_types(*)', { count: 'exact' });
      
      if (error) throw error;
      return { data, count, page, limit };
    },
    
    async findBySlug(slug) {
      const { data, error } = await supabase
        .from('hostels')
        .select('*, room_types(*)')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data;
    },
    
    async findFeatured(limit = 6) {
      const { data, error } = await supabase
        .from('hostels')
        .select('*, room_types(*)')
        .eq('featured', true)
        .order('rating', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    },
    
    async findNearby(city, excludeSlug, limit = 3) {
      const { data, error } = await supabase
        .from('hostels')
        .select('*, room_types(*)')
        .eq('city', city)
        .neq('slug', excludeSlug)
        .limit(limit);
      
      if (error) throw error;
      return data;
    },
    
    async create(hostelData) {
      const { data, error } = await supabaseAdmin
        .from('hostels')
        .insert(hostelData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    async update(id, hostelData) {
      const { data, error } = await supabaseAdmin
        .from('hostels')
        .update(hostelData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    async delete(id) {
      const { error } = await supabaseAdmin
        .from('hostels')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    },
    
    async getStats() {
      const { data, error } = await supabase
        .from('hostels')
        .select('id, total_rooms, occupancy');
      
      if (error) throw error;
      return data;
    }
  },
  
  // Room types queries
  roomTypes: {
    async findByHostel(hostelId) {
      const { data, error } = await supabase
        .from('room_types')
        .select('*')
        .eq('hostel_id', hostelId);
      
      if (error) throw error;
      return data;
    },
    
    async create(roomTypeData) {
      const { data, error } = await supabaseAdmin
        .from('room_types')
        .insert(roomTypeData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    async update(id, roomTypeData) {
      const { data, error } = await supabaseAdmin
        .from('room_types')
        .update(roomTypeData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    async delete(id) {
      const { error } = await supabaseAdmin
        .from('room_types')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    },
    
    async deleteByHostel(hostelId) {
      const { error } = await supabaseAdmin
        .from('room_types')
        .delete()
        .eq('hostel_id', hostelId);
      
      if (error) throw error;
      return { success: true };
    }
  },
  
  // Inquiries queries
  inquiries: {
    async findAll(filters = {}) {
      let query = supabaseAdmin
        .from('inquiries')
        .select('*');
      
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,hostel_name.ilike.%${filters.search}%`);
      }
      
      const { data, error } = await query
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    
    async findById(id) {
      const { data, error } = await supabaseAdmin
        .from('inquiries')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    
    async create(inquiryData) {
      const { data, error } = await supabase
        .from('inquiries')
        .insert(inquiryData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    async updateStatus(id, status) {
      const { data, error } = await supabaseAdmin
        .from('inquiries')
        .update({ status, updated_at: new Date() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    async getStats() {
      const { data, error } = await supabaseAdmin
        .from('inquiries')
        .select('status');
      
      if (error) throw error;
      
      const total = data.length;
      const pending = data.filter(i => i.status === 'pending').length;
      const contacted = data.filter(i => i.status === 'contacted').length;
      const closed = data.filter(i => i.status === 'closed').length;
      
      return { total, pending, contacted, closed };
    }
  },
  
  // Admin users queries
  adminUsers: {
    async findByEmail(email) {
      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    
    async updateLastLogin(id) {
      const { error } = await supabaseAdmin
        .from('admin_users')
        .update({ last_login: new Date() })
        .eq('id', id);
      
      if (error) throw error;
    }
  }
};