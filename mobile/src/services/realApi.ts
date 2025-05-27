import { Event, Comment, User, QRWristband } from '../types';
import { get, post, put, del } from './httpClient';

// API endpoints - these should match your FastAPI backend routes
const ENDPOINTS = {
  // Events
  events: '/events',
  event: (id: string) => `/events/${id}`,
  eventLike: (id: string) => `/events/${id}/like`,
  eventSave: (id: string) => `/events/${id}/save`,
  
  // Comments
  eventComments: (eventId: string) => `/events/${eventId}/comments`,
  comment: (id: string) => `/comments/${id}`,
  commentLike: (id: string) => `/comments/${id}/like`,
  
  // QR Wristbands
  wristbands: '/wristbands',
  wristbandValidate: '/wristbands/validate',
  
  // Users/Auth
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    me: '/auth/me',
  },
};

export const EventApi = {
  // Get all events with optional filters
  getEvents: async (filters?: {
    category?: string;
    isPrivate?: boolean;
    organizationId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Event[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }
    
    const url = `${ENDPOINTS.events}${params.toString() ? `?${params.toString()}` : ''}`;
    return await get<Event[]>(url);
  },

  // Get event by ID
  getEventById: async (id: string): Promise<Event> => {
    return await get<Event>(ENDPOINTS.event(id));
  },

  // Toggle like for an event
  toggleLike: async (id: string): Promise<Event> => {
    return await post<Event>(ENDPOINTS.eventLike(id));
  },

  // Toggle saved status
  toggleSaved: async (id: string): Promise<Event> => {
    return await post<Event>(ENDPOINTS.eventSave(id));
  },

  // Create a new event (for organization users)
  createEvent: async (eventData: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    category: string;
    isPrivate: boolean;
    imageUrl?: string;
    capacity?: number;
  }): Promise<Event> => {
    return await post<Event>(ENDPOINTS.events, eventData);
  },

  // Update an event
  updateEvent: async (id: string, eventData: Partial<Event>): Promise<Event> => {
    return await put<Event>(ENDPOINTS.event(id), eventData);
  },

  // Delete an event
  deleteEvent: async (id: string): Promise<void> => {
    return await del<void>(ENDPOINTS.event(id));
  },
};

export const CommentApi = {
  // Get comments for an event
  getCommentsByEventId: async (eventId: string): Promise<Comment[]> => {
    return await get<Comment[]>(ENDPOINTS.eventComments(eventId));
  },

  // Add a comment to an event
  addComment: async (eventId: string, text: string): Promise<Comment> => {
    return await post<Comment>(ENDPOINTS.eventComments(eventId), { text });
  },

  // Update a comment
  updateComment: async (commentId: string, text: string): Promise<Comment> => {
    return await put<Comment>(ENDPOINTS.comment(commentId), { text });
  },

  // Delete a comment
  deleteComment: async (commentId: string): Promise<void> => {
    return await del<void>(ENDPOINTS.comment(commentId));
  },

  // Toggle like for a comment
  toggleCommentLike: async (commentId: string): Promise<Comment> => {
    return await post<Comment>(ENDPOINTS.commentLike(commentId));
  },
};

export const QRWristbandApi = {
  // Generate a QR wristband for a private event
  generateWristband: async (eventId: string): Promise<QRWristband> => {
    return await post<QRWristband>(ENDPOINTS.wristbands, { eventId });
  },
  
  // Validate a QR wristband (for event check-ins)
  validateWristband: async (code: string): Promise<{
    isValid: boolean;
    eventId?: string;
    userId?: string;
    message?: string;
  }> => {
    return await post(ENDPOINTS.wristbandValidate, { code });
  },

  // Get user's wristbands
  getUserWristbands: async (): Promise<QRWristband[]> => {
    return await get<QRWristband[]>(ENDPOINTS.wristbands);
  },
};

export const AuthApi = {
  // Login with Stanford CAS (returns JWT token)
  login: async (casTicket: string): Promise<{
    token: string;
    user: User;
  }> => {
    return await post(ENDPOINTS.auth.login, { casTicket });
  },

  // Logout
  logout: async (): Promise<void> => {
    return await post<void>(ENDPOINTS.auth.logout);
  },

  // Get current user info
  getCurrentUser: async (): Promise<User> => {
    return await get<User>(ENDPOINTS.auth.me);
  },

  // Register/update user profile
  updateProfile: async (profileData: {
    username?: string;
    email?: string;
    profileImageUrl?: string;
    isOrganization?: boolean;
    organizationName?: string;
  }): Promise<User> => {
    return await put<User>(ENDPOINTS.auth.me, profileData);
  },
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}; 