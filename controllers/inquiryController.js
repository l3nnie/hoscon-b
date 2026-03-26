import { db } from '../config/database.js';

export const createInquiry = async (req, res, next) => {
  try {
    const inquiryData = req.validatedData;
    
    // Verify hostel exists
    const hostel = await db.hostels.findBySlug(inquiryData.hostelId);
    if (!hostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }
    
    const newInquiry = await db.inquiries.create({
      ...inquiryData,
      hostel_id: hostel.id
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Inquiry submitted successfully',
      inquiryId: newInquiry.id 
    });
  } catch (error) {
    next(error);
  }
};

export const getInquiries = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search
    };
    
    const inquiries = await db.inquiries.findAll(filters);
    res.json(inquiries);
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
    
    res.json(updatedInquiry);
  } catch (error) {
    next(error);
  }
};