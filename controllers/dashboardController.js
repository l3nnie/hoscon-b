import { db } from '../config/database.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    // Get hostel stats
    const hostels = await db.hostels.getStats();
    const totalHostels = hostels.length;
    const totalRooms = hostels.reduce((sum, h) => sum + (h.total_rooms || 0), 0);
    const totalOccupancy = hostels.reduce((sum, h) => sum + (h.occupancy || 0), 0);
    const avgOccupancy = totalHostels > 0 ? Math.round(totalOccupancy / totalHostels) : 0;
    
    // Get inquiry stats
    const inquiryStats = await db.inquiries.getStats();
    
    // Get recent inquiries (last 5)
    const recentInquiries = await db.inquiries.findAll();
    const latestInquiries = recentInquiries.slice(0, 5);
    
    // Get recent hostels (last 5)
    const allHostels = await db.hostels.findAll({ limit: 100 });
    const recentHostels = allHostels.data.slice(0, 5);
    
    res.json({
      hostels: {
        total: totalHostels,
        totalRooms,
        avgOccupancy
      },
      inquiries: inquiryStats,
      recentInquiries: latestInquiries,
      recentHostels: recentHostels.map(h => ({
        id: h.id,
        name: h.name,
        city: h.city,
        occupancy: h.occupancy,
        totalRooms: h.total_rooms
      }))
    });
  } catch (error) {
    next(error);
  }
};