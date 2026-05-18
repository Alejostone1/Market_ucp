export type Role = 'STUDENT' | 'ALLY' | 'ADMIN';
export type PublicationType = 'PRODUCT' | 'SERVICE' | 'EVENT' | 'CALL';
export type PublicStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PriceType = 'FIXED' | 'PER_HOUR' | 'FREE' | 'NEGOTIABLE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  faculty?: string;
  semester?: number;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  isVerified: boolean;
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Publication {
  id: string;
  title: string;
  description: string;
  type: PublicationType;
  status: PublicStatus;
  price?: number;
  priceType?: PriceType;
  images: string[];
  category: string;
  tags: string[];
  faculty?: string;
  eventDate?: Date;
  eventLocation?: string;
  deadline?: Date;
  slots?: number;
  authorId: string;
  author: User;
  views: number;
  rejectionNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Favorite {
  id: string;
  userId: string;
  publicationId: string;
  publication: Publication;
  createdAt: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  sender: User;
  receiver: User;
  isRead: boolean;
  createdAt: Date;
}
