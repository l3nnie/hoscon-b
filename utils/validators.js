import { z } from 'zod';

export const hostelSchema = z.object({
  slug: z.string().optional(),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.enum(['Ngomongo', 'Mjini', 'Diaspora']),
  distanceToUni: z.string().min(1, 'Distance to university is required'),
  priceMin: z.number().positive('Price must be positive'),
  priceMax: z.number().positive('Price must be positive'),
  gender: z.enum(['male', 'female', 'mixed']),
  amenities: z.array(z.string()),
  images: z.array(z.string().url('Must be a valid URL')),
  roomTypes: z.array(z.object({
    type: z.string(),
    price: z.number().positive(),
    total: z.number().int().nonnegative(),
    available: z.number().int().nonnegative()
  })),
  contactPhone: z.string().min(10, 'Valid phone number required'),
  contactWhatsApp: z.string().min(10, 'Valid WhatsApp number required'),
  contactEmail: z.string().email('Valid email required'),
  featured: z.boolean().optional(),
  rating: z.number().min(0).max(5).optional(),
  totalRooms: z.number().int().nonnegative().optional(),
  occupancy: z.number().int().min(0).max(100).optional()
});

export const inquirySchema = z.object({
  hostelId: z.string().uuid('Invalid hostel ID'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone number required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  moveInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
});

export const loginSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

export const filtersSchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  gender: z.string().optional(),
  priceMin: z.coerce.number().positive().optional(),
  priceMax: z.coerce.number().positive().optional(),
  amenities: z.array(z.string()).optional(),
  sort: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(50).optional()
});