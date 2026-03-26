import { db } from '../config/database.js';
import { generateSlug, ensureUniqueSlug } from '../utils/slugify.js';

export const getHostels = async (req, res, next) => {
  try {
    const filters = req.validatedQuery;
    const { data, count, page, limit } = await db.hostels.findAll(filters);
    
    res.json({
      hostels: data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getHostelBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const hostel = await db.hostels.findBySlug(slug);
    
    if (!hostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    
    res.json(hostel);
  } catch (error) {
    next(error);
  }
};

export const getFeaturedHostels = async (req, res, next) => {
  try {
    const hostels = await db.hostels.findFeatured();
    res.json(hostels);
  } catch (error) {
    next(error);
  }
};

export const getNearbyHostels = async (req, res, next) => {
  try {
    const { city, excludeSlug } = req.query;
    const hostels = await db.hostels.findNearby(city, excludeSlug);
    res.json(hostels);
  } catch (error) {
    next(error);
  }
};

export const createHostel = async (req, res, next) => {
  try {
    const hostelData = req.validatedData;
    const { roomTypes, ...hostelBasicData } = hostelData;
    
    // Generate unique slug
    const slug = await ensureUniqueSlug(hostelData.name);
    
    // Calculate total rooms
    const totalRooms = roomTypes.reduce((sum, rt) => sum + rt.available, 0);
    
    // Calculate occupancy (default to 0 for new hostels)
    const occupancy = 0;
    
    // Create hostel
    const newHostel = await db.hostels.create({
      ...hostelBasicData,
      slug,
      total_rooms: totalRooms,
      occupancy,
      rating: hostelData.rating || 0
    });
    
    // Create room types
    if (roomTypes && roomTypes.length) {
      for (const roomType of roomTypes) {
        await db.roomTypes.create({
          ...roomType,
          hostel_id: newHostel.id
        });
      }
    }
    
    // Fetch complete hostel with room types
    const completeHostel = await db.hostels.findBySlug(slug);
    
    res.status(201).json(completeHostel);
  } catch (error) {
    next(error);
  }
};

export const updateHostel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hostelData = req.validatedData;
    const { roomTypes, ...hostelBasicData } = hostelData;
    
    // Check if hostel exists
    const existingHostel = await db.hostels.findBySlug(id);
    if (!existingHostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    
    // Update slug if name changed
    let slug = existingHostel.slug;
    if (hostelData.name && hostelData.name !== existingHostel.name) {
      slug = await ensureUniqueSlug(hostelData.name, existingHostel.id);
    }
    
    // Calculate total rooms
    const totalRooms = roomTypes.reduce((sum, rt) => sum + rt.available, 0);
    
    // Update hostel
    const updatedHostel = await db.hostels.update(id, {
      ...hostelBasicData,
      slug,
      total_rooms: totalRooms,
      updated_at: new Date()
    });
    
    // Update room types (delete existing and recreate)
    if (roomTypes) {
      await db.roomTypes.deleteByHostel(id);
      for (const roomType of roomTypes) {
        await db.roomTypes.create({
          ...roomType,
          hostel_id: id
        });
      }
    }
    
    // Fetch complete hostel with room types
    const completeHostel = await db.hostels.findBySlug(slug);
    
    res.json(completeHostel);
  } catch (error) {
    next(error);
  }
};

export const deleteHostel = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if hostel exists
    const existingHostel = await db.hostels.findBySlug(id);
    if (!existingHostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    
    // Delete room types first (cascade should handle this, but explicit for safety)
    await db.roomTypes.deleteByHostel(existingHostel.id);
    
    // Delete hostel
    await db.hostels.delete(existingHostel.id);
    
    res.json({ success: true, message: 'Hostel deleted successfully' });
  } catch (error) {
    next(error);
  }
};