import { db } from '../config/database.js';
import ApiResponse from '../utils/response.js';
import { transformInquiry } from '../utils/transform.js';

export const createInquiry = async (req, res, next) => {
  try {
    const inquiryData = req.validatedData;
    console.log('Creating inquiry with data:', inquiryData);
    
    // Verify hostel exists
    const hostel = await db.hostels.findById(inquiryData.hostelId);
    console.log('Found hostel:', hostel ? hostel.name : 'Not found');
    
    if (!hostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    
    const createData = {
      hostelId: hostel.id,
      hostelName: hostel.name,
      name: inquiryData.name,
      email: inquiryData.email,
      phone: inquiryData.phone,
      message: inquiryData.message,
      moveInDate: inquiryData.moveInDate
    };
    //console.log('Data to create:', createData);
    
    const newInquiry = await db.inquiries.create(createData);
    console.log('Created inquiry:', newInquiry);
    
    ApiResponse.success(res, transformInquiry(newInquiry), 'Inquiry submitted successfully', 201);
  } catch (error) {
    console.error('Create inquiry error:', error);
    next(error);
  }
};

export const getInquiries = async (req, res, next) => {
  try {
    const filters = req.validatedQuery || {
      status: req.query.status,
      search: req.query.search
    };
    
    const { data, count, page, limit } = await db.inquiries.findAll(filters);
    
    res.json({
      data: data.map(transformInquiry),
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    next(error);
  }
};

export const updateInquiryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'contacted', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const updatedInquiry = await db.inquiries.updateStatus(id, status);
    
    if (!updatedInquiry) {
      return res.status(404).json({ error: 'Inquiry not found' });
    }
    
    ApiResponse.success(res, transformInquiry(updatedInquiry), 'Inquiry status updated');
  } catch (error) {
    next(error);
  }
};