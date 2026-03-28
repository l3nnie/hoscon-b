import { db } from '../config/database.js';
import ApiResponse from '../utils/response.js';
import { transformHostel, transformInquiry } from '../utils/transform.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    //console.log('Getting dashboard stats...');
    
    // Get hostel stats
    const hostels = await db.hostels.getStats();
    //console.log('Hostels stats:', hostels);
    const totalHostels = hostels.length;
    const totalRooms = hostels.reduce((sum, h) => sum + (h.total_rooms || 0), 0);
    const totalOccupancy = hostels.reduce((sum, h) => sum + (h.occupancy || 0), 0);
    const avgOccupancy = totalHostels > 0 ? Math.round(totalOccupancy / totalHostels) : 0;
    
    // Get inquiry stats
    const inquiryStats = await db.inquiries.getStats();
    //console.log('Inquiry stats:', inquiryStats);
    
    // Get recent inquiries (last 5)
    const recentInquiries = await db.inquiries.findAll();
    //console.log('Recent inquiries:', recentInquiries);
    const latestInquiries = recentInquiries.data.slice(0, 5);
    
    // Get recent hostels (last 5)
    const allHostels = await db.hostels.findAll({ limit: 100 });
    //console.log('All hostels result:', allHostels);
    const recentHostels = allHostels.data.slice(0, 5);
    
    //console.log('About to transform data...');
    const responseData = {
      hostels: {
        total: totalHostels,
        totalRooms,
        avgOccupancy
      },
      inquiries: inquiryStats,
      recentInquiries: latestInquiries.map(transformInquiry),
      recentHostels: recentHostels.map(transformHostel)
    };
    //console.log('Response data prepared:', responseData);
    
    ApiResponse.success(res, responseData, 'Dashboard stats retrieved');
  } catch (error) {
    console.error('Dashboard stats error:', error);
    next(error);
  }
};