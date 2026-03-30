import { db } from '../config/database.js';
import { generateSlug, ensureUniqueSlug } from '../utils/slugify.js';
import { transformHostel } from '../utils/transform.js';
import ApiResponse from '../utils/response.js';
import { supabaseAdmin } from '../config/supabase.js';
import imageService from '../services/imageService.js';

export const getHostels = async (req, res, next) => {
  try {
    const filters = req.validatedQuery;
    const { data, count, page, limit } = await db.hostels.findAll(filters);
    
    res.json({
      data: data.map(transformHostel),
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
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
    
    res.json(transformHostel(hostel));
  } catch (error) {
    next(error);
  }
};

export const getFeaturedHostels = async (req, res, next) => {
  try {
    const hostels = await db.hostels.findFeatured();
    res.json(hostels.map(transformHostel));
  } catch (error) {
    next(error);
  }
};

export const getNearbyHostels = async (req, res, next) => {
  try {
    const { city, excludeSlug } = req.query;
    const hostels = await db.hostels.findNearby(city, excludeSlug);
    res.json(hostels.map(transformHostel));
  } catch (error) {
    next(error);
  }
};

export const createHostel = async (req, res, next) => {
  try {
    const hostelData = req.validatedData;
    console.log('📝 Creating hostel with data:', JSON.stringify(hostelData, null, 2));
    
    const { roomTypes, ...hostelBasicData } = hostelData;
    
    // Generate unique slug
    const slug = await ensureUniqueSlug(hostelData.name);
    console.log('🏷️ Generated slug:', slug);
    
    // Calculate total rooms
    const totalRooms = roomTypes.reduce((sum, rt) => sum + rt.total, 0);
    console.log('🏠 Total rooms calculated:', totalRooms);
    
    // Calculate occupancy (default to 0 for new hostels)
    const occupancy = 0;
    
    // Prepare data for database (camelCase to snake_case will be handled by transform)
    const dbData = {
      ...hostelBasicData,
      roomTypes, // This will be handled separately
      slug,
      totalRooms,
      occupancy: 0
    };
    
    console.log('🔄 Data for DB transform:', JSON.stringify(dbData, null, 2));
    
    // Create hostel
    console.log('💾 Inserting hostel into database...');
    const newHostel = await db.hostels.create(dbData);
    
    if (!newHostel) {
      console.error('❌ Hostel creation returned null/undefined');
      throw new Error('Failed to create hostel - database returned no data');
    }
    
    console.log('✅ Hostel created:', newHostel);
    
    // Create room types
    console.log('🏨 Creating room types...');
    if (roomTypes && roomTypes.length) {
      for (const roomType of roomTypes) {
        console.log('  - Creating room type:', roomType);
        await db.roomTypes.create({
          ...roomType,
          hostel_id: newHostel.id
        });
      }
    }
    console.log('✅ Room types created');
    
    // Fetch complete hostel with room types
    console.log('📖 Fetching complete hostel data...');
    const completeHostel = await db.hostels.findBySlug(slug);
    
    console.log('🎉 Hostel creation complete!');
    ApiResponse.success(res, transformHostel(completeHostel), 'Hostel created successfully', 201);
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
    const existingHostel = await db.hostels.findById(id);
    if (!existingHostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    
    // Update slug if name changed
    let slug = existingHostel.slug;
    if (hostelData.name && hostelData.name !== existingHostel.name) {
      slug = await ensureUniqueSlug(hostelData.name, existingHostel.id);
    }
    
    // Calculate total rooms
    const totalRooms = roomTypes.reduce((sum, rt) => sum + rt.total, 0);
    
    // Map field names to match database columns (exclude images, handled separately)
    const mappedData = {
      name: hostelBasicData.name,
      description: hostelBasicData.description,
      address: hostelBasicData.address,
      city: hostelBasicData.city,
      distance_to_uni: hostelBasicData.distanceToUni,
      price_min: hostelBasicData.priceMin,
      price_max: hostelBasicData.priceMax,
      gender: hostelBasicData.gender,
      amenities: hostelBasicData.amenities,
      contact_phone: hostelBasicData.contactPhone,
      contact_whatsapp: hostelBasicData.contactWhatsApp,
      contact_email: hostelBasicData.contactEmail,
      featured: hostelBasicData.featured,
      rating: hostelData.rating || 0
    };
    
    // Update hostel
    const updatedHostel = await db.hostels.update(id, {
      ...mappedData,
      slug,
      total_rooms: totalRooms,
      updated_at: new Date()
    });
    
    // Handle image deletions first
    if (hostelBasicData.imagesToDelete && hostelBasicData.imagesToDelete.length > 0) {
      console.log('Deleting images:', hostelBasicData.imagesToDelete);
      for (const imageUrl of hostelBasicData.imagesToDelete) {
        try {
          await imageService.deleteImage(imageUrl);
        } catch (deleteError) {
          console.error('Error deleting image:', imageUrl, deleteError);
          // Continue with other deletions even if one fails
        }
      }
    }
    
    // Handle image replacements
    if (hostelBasicData.imagesToReplace && hostelBasicData.imagesToReplace.length > 0) {
      console.log('Replacing images:', hostelBasicData.imagesToReplace.length);
      for (const replacement of hostelBasicData.imagesToReplace) {
        try {
          // Delete the old image
          await imageService.deleteImage(replacement.oldUrl);
          // The new URL is already in the images array, no need to do anything else
        } catch (replaceError) {
          console.error('Error replacing image:', replacement.oldUrl, replaceError);
          // Continue with other replacements even if one fails
        }
      }
    }
    
    // Update images in database after processing deletions
    if (hostelBasicData.images) {
      const { error: imageUpdateError } = await supabaseAdmin
        .from('hostels')
        .update({ images: hostelBasicData.images })
        .eq('id', id);
      
      if (imageUpdateError) {
        console.error('Error updating images:', imageUpdateError);
      } else {
        console.log('Images updated successfully');
      }
    }
    
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
    
    ApiResponse.success(res, transformHostel(completeHostel), 'Hostel updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteHostel = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if hostel exists
    const existingHostel = await db.hostels.findById(id);
    if (!existingHostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    
    // Delete associated inquiries first
    await db.inquiries.deleteByHostel(id);
    
    // Delete room types first (cascade should handle this, but explicit for safety)
    await db.roomTypes.deleteByHostel(existingHostel.id);
    
    // Delete hostel
    await db.hostels.delete(existingHostel.id);
    
    ApiResponse.success(res, { success: true }, 'Hostel deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const uploadHostelImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const result = await imageService.uploadImage(req.file);

    ApiResponse.success(res, { imageUrl: result.url }, 'Image uploaded successfully');
  } catch (error) {
    next(error);
  }
};