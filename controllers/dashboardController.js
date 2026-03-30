import { db } from '../config/database.js';
import ApiResponse from '../utils/response.js';
import { transformHostel, transformInquiry } from '../utils/transform.js';
import HostelModel from '../models/Hostel.js';
import InquiryModel from '../models/Inquiry.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    //console.log('Getting dashboard stats...');
    
    // Get hostel stats
    const hostels = await HostelModel.getStats();
    //console.log('Hostels stats:', hostels);
    const totalHostels = hostels.total;
    const totalRooms = hostels.totalRooms;
    const avgOccupancy = hostels.avgOccupancy;
    
    // Get inquiry stats
    const inquiryStats = await InquiryModel.getStats();
    //console.log('Inquiry stats:', inquiryStats);
    
    // Get recent inquiries (last 5)
    const recentInquiries = await db.inquiries.findAll();
    //console.log('Recent inquiries:', recentInquiries);
    const latestInquiries = recentInquiries.data.slice(0, 5);
    
    // Get recent hostels (last 5) with real-time occupancy calculation
    const allHostels = await db.hostels.findAll({ limit: 100 });
    //console.log('All hostels result:', allHostels);
    const recentHostels = allHostels.data.slice(0, 5).map(hostel => {
      const roomTypes = hostel.room_types || [];
      const hostelTotalRooms = roomTypes.reduce((sum, rt) => sum + (rt.total || 0), 0);
      const currentAvailable = roomTypes.reduce((sum, rt) => sum + (rt.available || 0), 0);
      const occupied = Math.max(0, hostelTotalRooms - currentAvailable);
      const realTimeOccupancy = hostelTotalRooms > 0 ? Math.round((occupied / hostelTotalRooms) * 100) : 0;
      
      // Return transformed hostel with real-time occupancy
      return {
        ...transformHostel(hostel),
        occupancy: realTimeOccupancy
      };
    });
    
    //console.log('About to transform data...');
    const responseData = {
      hostels: {
        total: totalHostels,
        totalRooms,
        avgOccupancy
      },
      inquiries: inquiryStats,
      recentInquiries: latestInquiries.map(transformInquiry),
      recentHostels: recentHostels
    };
    //console.log('Response data prepared:', responseData);
    
    ApiResponse.success(res, responseData, 'Dashboard stats retrieved');
  } catch (error) {
    console.error('Dashboard stats error:', error);
    next(error);
  }
};