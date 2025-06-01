import { Event, User, QRWristband } from '../types';
import { get, post, put, del } from './httpClient';

// Backend API response types (different from our frontend types)
interface BackendEvent {
  eventId: string;
  orgId: string;
  orgName: string;
  name: string;
  timeLocation: string;
  description: string;
}

// Transform backend event response to frontend Event type
const transformBackendEvent = (backendEvent: BackendEvent): Event => {
  return {
    id: backendEvent.eventId,
    title: backendEvent.name,
    description: backendEvent.description,
    organizerId: backendEvent.orgId,
    organizerName: backendEvent.orgName,
    organizerImageUrl: `https://logo.clearbit.com/${backendEvent.orgName.toLowerCase().replace(/\s+/g, '')}.edu`, // Default org image
    location: backendEvent.timeLocation, // Backend combines time and location
    dateTime: new Date().toISOString(), // TODO: Extract proper date from timeLocation or update backend
    imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94', // Default event image
    category: 'Other', // TODO: Add category to backend
    isPrivate: false, // TODO: Add privacy setting to backend
    likes: 0, // TODO: Add likes to backend
    userLiked: false, // TODO: Add user interaction to backend
    saved: false, // TODO: Add saved status to backend
  };
};

// API endpoints - these should match your FastAPI backend routes
const ENDPOINTS = {
  // Events
  events: '/events',
  event: (id: string) => `/events/${id}`,
  eventLike: (id: string) => `/events/${id}/like`,
  eventSave: (id: string) => `/events/${id}/save`,
  
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
    const backendEvents = await get<BackendEvent[]>(url);
    return backendEvents.map(transformBackendEvent);
  },

  // Get event by ID
  getEventById: async (id: string): Promise<Event> => {
    const backendEvent = await get<BackendEvent>(ENDPOINTS.event(id));
    return transformBackendEvent(backendEvent);
  },

  // Toggle like for an event
  toggleLike: async (id: string): Promise<Event> => {
    const backendEvent = await post<BackendEvent>(ENDPOINTS.eventLike(id));
    return transformBackendEvent(backendEvent);
  },

  // Toggle saved status
  toggleSaved: async (id: string): Promise<Event> => {
    const backendEvent = await post<BackendEvent>(ENDPOINTS.eventSave(id));
    return transformBackendEvent(backendEvent);
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
    // Transform frontend data to backend format
    const backendData = {
      name: eventData.title,
      description: eventData.description,
      timeLocation: `${eventData.date} ${eventData.time} at ${eventData.location}`,
      orgId: 'org1', // TODO: Get actual org ID from user context
    };
    const backendEvent = await post<BackendEvent>(ENDPOINTS.events, backendData);
    return transformBackendEvent(backendEvent);
  },

  // Update an event
  updateEvent: async (id: string, eventData: Partial<Event>): Promise<Event> => {
    // Transform frontend data to backend format
    const backendData: any = {};
    if (eventData.title) backendData.name = eventData.title;
    if (eventData.description) backendData.description = eventData.description;
    if (eventData.location || eventData.dateTime) {
      backendData.timeLocation = `${eventData.dateTime || ''} at ${eventData.location || ''}`;
    }
    
    const backendEvent = await put<BackendEvent>(ENDPOINTS.event(id), backendData);
    return transformBackendEvent(backendEvent);
  },

  // Delete an event
  deleteEvent: async (id: string): Promise<void> => {
    return await del<void>(ENDPOINTS.event(id));
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