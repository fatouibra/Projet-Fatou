import { z } from 'zod'

// Restaurant validation
export const restaurantSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Nom trop long'),
  description: z.string().optional(),
  address: z.string().min(1, 'L\'adresse est requise'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  email: z.string().email('Email invalide'),
  cuisine: z.string().min(1, 'Type de cuisine requis'),
  deliveryFee: z.number().min(0, 'Les frais de livraison ne peuvent pas être négatifs'),
  minOrderAmount: z.number().min(0, 'Le montant minimum ne peut pas être négatif'),
  openingHours: z.string().min(1, 'Les heures d\'ouverture sont requises'),
})

// Product validation
export const productSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Nom trop long'),
  description: z.string().optional(),
  price: z.number().min(0.01, 'Le prix doit être supérieur à 0'),
  categoryId: z.string().min(1, 'Catégorie requise'),
  restaurantId: z.string().min(1, 'Restaurant requis'),
  isVegetarian: z.boolean().default(false),
  featured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isPopular: z.boolean().default(false),
})

// Category validation
export const categorySchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(50, 'Nom trop long'),
  description: z.string().optional(),
  order: z.number().min(0, 'L\'ordre ne peut pas être négatif'),
})

// Order validation
export const orderSchema = z.object({
  customerName: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  customerPhone: z.string().min(9, 'Numéro de téléphone invalide (min 9 chiffres)').max(15, 'Numéro trop long'),
  customerEmail: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.string().min(1, 'Adresse de livraison requise'),
  notes: z.string().optional(),
  deliveryType: z.enum(['DELIVERY', 'PICKUP']).default('DELIVERY'),
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'ONLINE']).default('CASH_ON_DELIVERY'),
  restaurantId: z.string().min(1, 'Restaurant requis'),
})

// Admin login validation
export const adminLoginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court (min 6 caractères)'),
})

// Admin creation validation
export const adminCreateSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe trop court (min 8 caractères)')
    .regex(/[A-Z]/, 'Au moins une majuscule requise')
    .regex(/[a-z]/, 'Au moins une minuscule requise')
    .regex(/[0-9]/, 'Au moins un chiffre requis'),
})

// Search validation
export const searchSchema = z.object({
  q: z.string().optional(),
  cuisine: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  rating: z.number().min(0).max(5).optional(),
  deliveryFee: z.number().min(0).optional(),
  vegetarian: z.boolean().optional(),
})

// Contact/Support validation
export const contactSchema = z.object({
  name: z.string().min(1, 'Nom requis').max(100, 'Nom trop long'),
  email: z.string().email('Email invalide'),
  subject: z.string().min(1, 'Sujet requis').max(200, 'Sujet trop long'),
  message: z.string().min(10, 'Message trop court (min 10 caractères)').max(1000, 'Message trop long'),
})

export type RestaurantInput = z.infer<typeof restaurantSchema>
export type ProductInput = z.infer<typeof productSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type OrderInput = z.infer<typeof orderSchema>
export type AdminLoginInput = z.infer<typeof adminLoginSchema>
export type AdminCreateInput = z.infer<typeof adminCreateSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type ContactInput = z.infer<typeof contactSchema>