import HostelModel from '../models/Hostel.js';
import InquiryModel from '../models/Inquiry.js';

class DashboardService {
  /**
   * Get all dashboard statistics
   */
  static async getDashboardStats() {
    try {
      // Get hostel statistics
      const hostelStats = await HostelModel.getStats();
      
      // Get inquiry statistics
      const inquiryStats = await InquiryModel.getStats();
      
      // Get recent inquiries (last 5)
      const recentInquiries = await InquiryModel.getRecent(5);
      
      // Get recent hostels (last 5)
      const { data: recentHostels } = await HostelModel.findAll({ limit: 5, page: 1 });
      
      // Calculate monthly trends (last 6 months)
      const trends = await this.getMonthlyTrends();
      
      return {
        hostels: {
          total: hostelStats.total,
          totalRooms: hostelStats.totalRooms,
          avgOccupancy: hostelStats.avgOccupancy,
          avgRating: hostelStats.avgRating
        },
        inquiries: inquiryStats,
        recentInquiries: recentInquiries.map(inquiry => ({
          id: inquiry.id,
          name: inquiry.name,
          hostelName: inquiry.hostel_name,
          status: inquiry.status,
          createdAt: inquiry.created_at
        })),
        recentHostels: recentHostels.map(hostel => ({
          id: hostel.id,
          name: hostel.name,
          city: hostel.city,
          occupancy: hostel.occupancy,
          totalRooms: hostel.total_rooms,
          rating: hostel.rating
        })),
        trends
      };
    } catch (error) {
      console.error('Error in DashboardService.getDashboardStats:', error);
      throw error;
    }
  }
  
  /**
   * Get monthly trends for the last 6 months
   */
  static async getMonthlyTrends() {
    try {
      const { data: inquiries } = await InquiryModel.findAll({ limit: 1000 });
      
      const months = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const monthKey = `${year}-${date.getMonth() + 1}`;
        
        const monthInquiries = inquiries.filter(inquiry => {
          const inquiryDate = new Date(inquiry.created_at);
          return inquiryDate.getFullYear() === year && 
                 inquiryDate.getMonth() === date.getMonth();
        });
        
        months.push({
          month: `${monthName} ${year}`,
          monthKey,
          inquiries: monthInquiries.length,
          pending: monthInquiries.filter(i => i.status === 'pending').length,
          contacted: monthInquiries.filter(i => i.status === 'contacted').length,
          closed: monthInquiries.filter(i => i.status === 'closed').length
        });
      }
      
      return months;
    } catch (error) {
      console.error('Error in DashboardService.getMonthlyTrends:', error);
      return [];
    }
  }
  
  /**
   * Get occupancy report
   */
  static async getOccupancyReport() {
    try {
      const { data: hostels } = await HostelModel.findAll({ limit: 1000 });
      
      const report = {
        highOccupancy: [], // > 80%
        mediumOccupancy: [], // 50-80%
        lowOccupancy: [], // < 50%
        average: 0,
        total: hostels.length
      };
      
      let totalOccupancy = 0;
      
      hostels.forEach(hostel => {
        totalOccupancy += hostel.occupancy;
        
        const hostelData = {
          id: hostel.id,
          name: hostel.name,
          city: hostel.city,
          occupancy: hostel.occupancy,
          totalRooms: hostel.total_rooms
        };
        
        if (hostel.occupancy >= 80) {
          report.highOccupancy.push(hostelData);
        } else if (hostel.occupancy >= 50) {
          report.mediumOccupancy.push(hostelData);
        } else {
          report.lowOccupancy.push(hostelData);
        }
      });
      
      report.average = hostels.length > 0 ? totalOccupancy / hostels.length : 0;
      
      return report;
    } catch (error) {
      console.error('Error in DashboardService.getOccupancyReport:', error);
      throw error;
    }
  }
  
  /**
   * Get city-wise statistics
   */
  static async getCityStats() {
    try {
      const { data: hostels } = await HostelModel.findAll({ limit: 1000 });
      
      const cityStats = {};
      
      hostels.forEach(hostel => {
        if (!cityStats[hostel.city]) {
          cityStats[hostel.city] = {
            count: 0,
            totalRooms: 0,
            avgOccupancy: 0,
            avgRating: 0,
            totalRating: 0
          };
        }
        
        cityStats[hostel.city].count++;
        cityStats[hostel.city].totalRooms += hostel.total_rooms || 0;
        cityStats[hostel.city].totalRating += hostel.rating || 0;
      });
      
      // Calculate averages
      Object.keys(cityStats).forEach(city => {
        cityStats[city].avgOccupancy = cityStats[city].totalRooms > 0 
          ? Math.round(cityStats[city].totalRooms / cityStats[city].count)
          : 0;
        cityStats[city].avgRating = cityStats[city].count > 0
          ? cityStats[city].totalRating / cityStats[city].count
          : 0;
        delete cityStats[city].totalRating;
      });
      
      return cityStats;
    } catch (error) {
      console.error('Error in DashboardService.getCityStats:', error);
      throw error;
    }
  }
}

export default DashboardService;