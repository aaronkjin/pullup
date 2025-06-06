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
  pullUpCount?: number;
  userPulledUp?: boolean;
  isPrivate?: boolean;
  imageUrl?: string;
  created_at?: string;
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
    imageUrl: backendEvent.imageUrl || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94', // Default event image
    isPrivate: backendEvent.isPrivate || false, // TODO: Add privacy setting to backend
    pullUpCount: backendEvent.pullUpCount || 0, // TODO: Add pullUpCount to backend
    userPulledUp: backendEvent.userPulledUp || false, // TODO: Add user pull up status to backend
    eventPassword: undefined, // TODO: Add event password for private events
    created_at: backendEvent.created_at || String(Math.floor(Date.now() / 1000)), // Use backend timestamp or current time
  };
};

// API endpoints
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
  
  // Students
  students: {
    create: '/students/create',
    login: '/students/login',
  },
  
  // Organizations
  orgs: {
    create: '/orgs/create',
    login: '/orgs/login',
  },
  
  // Student Events
  studentEvents: '/students-events/student',
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
    
    try {
      console.log('Fetching events from:', url);
      
      const response = await get<any>(url);
      
      console.log('Events API response:', response);
      console.log('Type of response:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      // Handle the API response structure: { "events": [...] }
      if (response && typeof response === 'object' && Array.isArray(response.events)) {
        console.log('Found events array with length:', response.events.length);
        return response.events.map(transformBackendEvent);
      }
      
      console.log('No events array found in response, returning empty array');
      return [];
      
    } catch (error: any) {
      console.error('Error fetching events:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      
      return [];
    }
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

  // Toggle pull up for an event (new method)
  togglePullUp: async (id: string): Promise<Event> => {
    const backendEvent = await post<BackendEvent>(`${ENDPOINTS.event(id)}/pullup`);
    return transformBackendEvent(backendEvent);
  },

  // Get events for current user (students - their registered events)
  getUserEvents: async (studentId: number): Promise<Event[]> => {
    try {
      console.log('Fetching user events for student_id:', studentId);
      
      const response = await post<any>(ENDPOINTS.studentEvents, { student_id: studentId });
      
      console.log('User events API response:', response);
      console.log('Type of response:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      // Handle the API response structure: { "events": [...], "count": 0 }
      if (response && typeof response === 'object' && Array.isArray(response.events)) {
        console.log('Found user events array with length:', response.events.length);
        console.log('Events count:', response.count);
        return response.events.map(transformBackendEvent);
      }
      
      console.log('No events array found in user events response, returning empty array');
      return [];
      
    } catch (error: any) {
      console.error('Error fetching user events:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      
      return [];
    }
  },

  // Get events for organization (their created events)
  getOrganizationEvents: async (): Promise<Event[]> => {
    const backendEvents = await get<BackendEvent[]>(`${ENDPOINTS.events}/organization`);
    return backendEvents.map(transformBackendEvent);
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

  // Create a new student
  createStudent: async (studentData: {
    name: string;
    email: string;
    password: string;
  }): Promise<{
    message: string;
    student_id: number;
  }> => {
    try {
      console.log('Creating student with data:', studentData);
      
      const response = await post<any>(ENDPOINTS.students.create, studentData);
      
      console.log('Student creation API response:', response);
      console.log('Type of response:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      // Handle different possible response structures
      if (response && typeof response === 'object') {
        return {
          message: response.message || 'Student created successfully',
          student_id: response.student_id || response.studentId || response.id || 0
        };
      }
      
      // Fallback response
      return {
        message: 'Student created successfully',
        student_id: 0
      };
      
    } catch (error: any) {
      console.error('Student creation error details:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      
      // Re-throw the error so the LoginScreen can handle it
      throw error;
    }
  },

  // Login student
  loginStudent: async (loginData: {
    email: string;
    password: string;
  }): Promise<{
    message: string;
    student_id: number;
    name: string;
    email: string;
  }> => {
    try {
      console.log('Logging in student with data:', { email: loginData.email, password: '[HIDDEN]' });
      
      const response = await post<any>(ENDPOINTS.students.login, loginData);
      
      console.log('Student login API response:', response);
      console.log('Type of response:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      if (response && typeof response === 'object') {
        return {
          message: response.message || 'Login successful',
          student_id: response.student_id || response.studentId || response.id || 0,
          name: response.name || '',
          email: response.email || loginData.email
        };
      }
      return {
        message: 'Login successful',
        student_id: 0,
        name: '',
        email: loginData.email
      };
      
    } catch (error: any) {
      console.error('Student login error details:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      
      throw error;
    }
  },

  // Create a new organization
  createOrganization: async (orgData: {
    name: string;
    email: string;
    password: string;
  }): Promise<{
    message: string;
    org_id: number;
  }> => {
    try {
      console.log('Creating organization with data:', orgData);
      
      const response = await post<any>(ENDPOINTS.orgs.create, orgData);
      
      console.log('Organization creation API response:', response);
      console.log('Type of response:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      // Handle different possible response structures
      if (response && typeof response === 'object') {
        return {
          message: response.message || 'Organization created successfully',
          org_id: response.org_id || response.orgId || response.id || 0
        };
      }
      
      // Fallback response
      return {
        message: 'Organization created successfully',
        org_id: 0
      };
      
    } catch (error: any) {
      console.error('Organization creation error details:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      
      // Re-throw the error so the LoginScreen can handle it
      throw error;
    }
  },

  // Login organization
  loginOrganization: async (loginData: {
    email: string;
    password: string;
  }): Promise<{
    message: string;
    org_id: number;
    name: string;
    email: string;
  }> => {
    try {
      console.log('Logging in organization with data:', { email: loginData.email, password: '[HIDDEN]' });
      
      const response = await post<any>(ENDPOINTS.orgs.login, loginData);
      
      console.log('Organization login API response:', response);
      console.log('Type of response:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      if (response && typeof response === 'object') {
        return {
          message: response.message || 'Login successful',
          org_id: response.org_id || response.orgId || response.id || 0,
          name: response.name || '',
          email: response.email || loginData.email
        };
      }
      return {
        message: 'Login successful',
        org_id: 0,
        name: '',
        email: loginData.email
      };
      
    } catch (error: any) {
      console.error('Organization login error details:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      
      throw error;
    }
  },
};

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