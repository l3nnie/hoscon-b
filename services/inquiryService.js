import InquiryModel from '../models/Inquiry.js';
import HostelModel from '../models/Hostel.js';

class InquiryService {
  /**
   * Get all inquiries with filters
   */
  static async getAllInquiries(filters = {}) {
    try {
      const result = await InquiryModel.findAll(filters);
      
      // Format dates for better display
      const inquiriesWithFormattedDates = result.data.map(inquiry => ({
        ...inquiry,
        formattedDate: new Date(inquiry.created_at).toLocaleDateString('en-KE'),
        formattedMoveInDate: new Date(inquiry.move_in_date).toLocaleDateString('en-KE'),
        statusBadge: this.getStatusBadge(inquiry.status)
      }));
      
      return {
        ...result,
        data: inquiriesWithFormattedDates
      };
    } catch (error) {
      console.error('Error in InquiryService.getAllInquiries:', error);
      throw error;
    }
  }
  
  /**
   * Get inquiry by ID
   */
  static async getInquiryById(id) {
    try {
      const inquiry = await InquiryModel.findById(id);
      
      if (!inquiry) {
        throw new Error('Inquiry not found');
      }
      
      return {
        ...inquiry,
        formattedDate: new Date(inquiry.created_at).toLocaleDateString('en-KE'),
        formattedMoveInDate: new Date(inquiry.move_in_date).toLocaleDateString('en-KE')
      };
    } catch (error) {
      console.error('Error in InquiryService.getInquiryById:', error);
      throw error;
    }
  }
  
  /**
   * Create new inquiry
   */
  static async createInquiry(inquiryData) {
    try {
      // Validate data
      this.validateInquiryData(inquiryData);
      
      // Verify hostel exists and get details
      const hostel = await HostelModel.findById(inquiryData.hostelId);
      if (!hostel) {
        throw new Error('Hostel not found');
      }
      
      // Create inquiry
      const newInquiry = await InquiryModel.create({
        ...inquiryData,
        hostelName: hostel.name
      });
      
      // Here you could send email notification to hostel manager
      // await this.sendInquiryNotification(newInquiry, hostel);
      
      return newInquiry;
    } catch (error) {
      console.error('Error in InquiryService.createInquiry:', error);
      throw error;
    }
  }
  
  /**
   * Update inquiry status
   */
  static async updateInquiryStatus(id, status) {
    try {
      const validStatuses = ['pending', 'contacted', 'closed'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status');
      }
      
      const inquiry = await InquiryModel.updateStatus(id, status);
      
      if (!inquiry) {
        throw new Error('Inquiry not found');
      }
      
      return inquiry;
    } catch (error) {
      console.error('Error in InquiryService.updateInquiryStatus:', error);
      throw error;
    }
  }
  
  /**
   * Delete inquiry
   */
  static async deleteInquiry(id) {
    try {
      const result = await InquiryModel.delete(id);
      return result;
    } catch (error) {
      console.error('Error in InquiryService.deleteInquiry:', error);
      throw error;
    }
  }
  
  /**
   * Get inquiries by hostel
   */
  static async getInquiriesByHostel(hostelId) {
    try {
      const { data } = await InquiryModel.findAll({ 
        search: hostelId,
        limit: 100 
      });
      
      // Filter by hostel_id
      const hostelInquiries = data.filter(inquiry => inquiry.hostel_id === hostelId);
      
      return hostelInquiries;
    } catch (error) {
      console.error('Error in InquiryService.getInquiriesByHostel:', error);
      throw error;
    }
  }
  
  /**
   * Get inquiry statistics
   */
  static async getInquiryStats() {
    try {
      const stats = await InquiryModel.getStats();
      
      return {
        ...stats,
        pendingPercentage: stats.total > 0 ? (stats.pending / stats.total * 100).toFixed(1) : 0,
        contactedPercentage: stats.total > 0 ? (stats.contacted / stats.total * 100).toFixed(1) : 0,
        closedPercentage: stats.total > 0 ? (stats.closed / stats.total * 100).toFixed(1) : 0
      };
    } catch (error) {
      console.error('Error in InquiryService.getInquiryStats:', error);
      throw error;
    }
  }
  
  /**
   * Validate inquiry data
   */
  static validateInquiryData(data) {
    const errors = [];
    
    if (!data.name || data.name.length < 2) {
      errors.push('Name must be at least 2 characters');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      errors.push('Valid email address is required');
    }
    
    if (!data.phone || data.phone.length < 10) {
      errors.push('Valid phone number is required');
    }
    
    if (!data.message || data.message.length < 10) {
      errors.push('Message must be at least 10 characters');
    }
    
    if (!data.moveInDate) {
      errors.push('Move-in date is required');
    } else {
      const moveInDate = new Date(data.moveInDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (moveInDate < today) {
        errors.push('Move-in date cannot be in the past');
      }
    }
    
    if (!data.hostelId) {
      errors.push('Hostel ID is required');
    }
    
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }
  
  /**
   * Get status badge configuration
   */
  static getStatusBadge(status) {
    const badges = {
      pending: {
        text: 'Pending',
        color: 'yellow',
        icon: 'clock'
      },
      contacted: {
        text: 'Contacted',
        color: 'blue',
        icon: 'phone'
      },
      closed: {
        text: 'Closed',
        color: 'green',
        icon: 'check'
      }
    };
    
    return badges[status] || badges.pending;
  }
  
  /**
   * Send inquiry notification (placeholder - implement with email service)
   */
  static async sendInquiryNotification(inquiry, hostel) {
    // This is a placeholder for email/sms notification
    // You can implement this using services like SendGrid, Twilio, etc.
    console.log(`New inquiry from ${inquiry.name} for ${hostel.name}`);
    console.log(`Email: ${inquiry.email}, Phone: ${inquiry.phone}`);
    
    // Example email content:
    // Subject: New Inquiry for ${hostel.name}
    // Body: ${inquiry.name} is interested in ${hostel.name}
    // Move-in date: ${inquiry.move_in_date}
    // Message: ${inquiry.message}
    
    return true;
  }
}

export default InquiryService;