import { Event, User, QRWristband } from '../types';
import { get, post, put, del } from './httpClient';

// Backend API response types (different from our frontend types)
interface BackendEvent {
  event_id?: number;
  org_id?: number;
  name?: string;
  event_date?: string;
  event_time?: string;
  location?: string;
  description?: string;
  participant_count?: number;
  image_url?: string;
  is_public?: boolean;
  passcode?: string | null;
  created_at?: string;
  // Legacy fields for backward compatibility
  eventId?: string;
  orgId?: string;
  orgName?: string;
  timeLocation?: string;
  pullUpCount?: number;
  userPulledUp?: boolean;
  isPrivate?: boolean;
  imageUrl?: string;
}

// Transform backend event response to frontend Event type
const transformBackendEvent = (backendEvent: BackendEvent): Event => {
  // Handle both new API format and legacy format
  const eventId = backendEvent.event_id || backendEvent.eventId || String(Date.now());
  const orgId = backendEvent.org_id || backendEvent.orgId || '';
  const name = backendEvent.name || 'Untitled Event';
  const description = backendEvent.description || '';
  const location = backendEvent.location || backendEvent.timeLocation || 'TBD';
  const imageUrl = backendEvent.image_url || backendEvent.imageUrl || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94';
  const isPublic = backendEvent.is_public !== undefined ? backendEvent.is_public : !backendEvent.isPrivate;
  const participantCount = backendEvent.participant_count || backendEvent.pullUpCount || 0;
  const createdAt = backendEvent.created_at || String(Math.floor(Date.now() / 1000));
  
  // Construct date time from separate date and time fields
  let dateTime = new Date().toISOString();
  if (backendEvent.event_date && backendEvent.event_time) {
    try {
      // Convert "12/12/2022" and "12:12 AM" to ISO string
      const dateParts = backendEvent.event_date.split('/');
      if (dateParts.length === 3) {
        const month = dateParts[0].padStart(2, '0');
        const day = dateParts[1].padStart(2, '0');
        const year = dateParts[2];
        const dateStr = `${year}-${month}-${day}`;
        
        // Parse time (handle AM/PM)
        let timeStr = backendEvent.event_time;
        const date = new Date(`${dateStr} ${timeStr}`);
        if (!isNaN(date.getTime())) {
          dateTime = date.toISOString();
        }
      }
    } catch (error) {
      console.warn('Failed to parse event date/time:', error);
    }
  }

  return {
    id: String(eventId),
    title: name,
    description: description,
    organizerId: String(orgId),
    organizerName: backendEvent.orgName || 'Organization',
    organizerImageUrl: backendEvent.orgName 
      ? `https://logo.clearbit.com/${backendEvent.orgName.toLowerCase().replace(/\s+/g, '')}.edu`
      : 'https://logo.clearbit.com/stanford.edu',
    location: location,
    dateTime: dateTime,
    imageUrl: imageUrl,
    isPrivate: !isPublic,
    pullUpCount: participantCount,
    userPulledUp: backendEvent.userPulledUp || false,
    eventPassword: backendEvent.passcode || undefined,
    created_at: createdAt,
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
  
  // Organization Events
  orgEvents: '/orgs/org',
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
    org_id: number;
    name: string;
    event_date?: string;
    event_time?: string;
    location?: string;
    description?: string;
    participant_count?: number;
    image_url?: string;
    is_public?: boolean;
    passcode?: string;
  }): Promise<Event> => {
    try {
      console.log('Creating event with data:', eventData);
      
      const response = await post<any>(ENDPOINTS.events, eventData);
      
      console.log('Event creation API response:', response);
      console.log('Type of response:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      // Handle the actual backend response structure: { "message": "Event created successfully", "event_id": 1 }
      let eventId = '';
      if (response && typeof response === 'object') {
        eventId = String(response.event_id || response.eventId || response.id || Date.now());
        console.log('Extracted event_id:', eventId);
      }
      
      // Return Event object with proper structure
      const createdEvent: Event = {
        id: eventId,
        title: eventData.name,
        description: eventData.description || '',
        organizerId: String(eventData.org_id),
        organizerName: 'Organization', // TODO: Get from backend response
        organizerImageUrl: 'https://logo.clearbit.com/stanford.edu',
        location: eventData.location || '',
        dateTime: eventData.event_date && eventData.event_time ? `${eventData.event_date} ${eventData.event_time}` : new Date().toISOString(),
        imageUrl: eventData.image_url || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94',
        isPrivate: !eventData.is_public,
        pullUpCount: 0,
        userPulledUp: false,
        eventPassword: eventData.passcode,
        created_at: String(Math.floor(Date.now() / 1000)),
      };
      
      console.log('Returning created event:', createdEvent);
      return createdEvent;
      
    } catch (error: any) {
      console.error('Event creation error details:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      console.error('Error status:', error.response?.status);
      
      // Add specific handling for 500 errors
      if (error.response?.status === 500) {
        console.error('Server error (500) - Backend issue with event creation');
        console.error('Request data that caused error:', eventData);
      }
      
      throw error;
    }
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
  getOrganizationEvents: async (orgId: number): Promise<Event[]> => {
    try {
      console.log('Fetching organization events for org_id:', orgId);
      
      const response = await post<any>(ENDPOINTS.orgEvents, { org_id: orgId });
      
      console.log('Organization events API response:', response);
      console.log('Type of response:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      // Handle the API response structure: { "events": [...], "count": 0 }
      if (response && typeof response === 'object' && Array.isArray(response.events)) {
        console.log('Found organization events array with length:', response.events.length);
        console.log('Events count:', response.count);
        return response.events.map(transformBackendEvent);
      }
      
      console.log('No events array found in organization events response, returning empty array');
      return [];
      
    } catch (error: any) {
      console.error('Error fetching organization events:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      
      return [];
    }
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