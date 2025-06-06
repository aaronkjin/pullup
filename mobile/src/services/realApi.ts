import { Event, User, QRWristband } from '../types';
import { get, post, put, del } from './httpClient';
import { AuthTokenManager } from '../config/api';

// Backend API response types
interface BackendEvent {
  event_id: number;
  org_id: number;
  name: string;
  event_date?: string;
  event_time?: string;
  location?: string;
  description?: string;
  participant_count?: number;
  image_url?: string;
  is_public?: boolean;
  passcode?: string | null;
  created_at?: string;
  org_name?: string;
}

// Transform backend event response to frontend Event type
const transformBackendEvent = (backendEvent: BackendEvent): Event => {
  const eventId = backendEvent.event_id;
  const orgId = backendEvent.org_id;
  const name = backendEvent.name || 'Untitled Event';
  const description = backendEvent.description || '';
  const location = backendEvent.location || 'TBD';
  const imageUrl = backendEvent.image_url || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94';
  const isPublic = backendEvent.is_public !== undefined ? backendEvent.is_public : true;
  const participantCount = backendEvent.participant_count || 0;
  const createdAt = backendEvent.created_at || String(Math.floor(Date.now() / 1000));
  const organizerName = backendEvent.org_name || 'Organization';
  
  // Construct date time from separate date and time fields
  let dateTime = new Date().toISOString();
  if (backendEvent.event_date && backendEvent.event_time) {
    try {
      console.log('Parsing date/time:', backendEvent.event_date, backendEvent.event_time);
      
      // Convert "12/12/2022" and "12:12AM" (no space) to ISO string
      const dateParts = backendEvent.event_date.split('/');
      if (dateParts.length === 3) {
        const month = parseInt(dateParts[0]) - 1; // JavaScript months are 0-based
        const day = parseInt(dateParts[1]);
        const year = parseInt(dateParts[2]);
        
        // Parse time manually - handle formats like "12:12AM" and "9:00PM"
        let timeStr = backendEvent.event_time.trim();
        console.log('Original time string:', timeStr);
        console.log('Time string length:', timeStr.length);
        console.log('Time string characters:', timeStr.split('').map(c => `'${c}' (${c.charCodeAt(0)})`));
        
        // Extract time components manually - make regex more flexible
        const timeRegex = /^(\d{1,2}):(\d{1,2})\s*(AM|PM)$/i;
        const timeMatch = timeStr.match(timeRegex);
        
        console.log('Regex match result:', timeMatch);
        
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          const period = timeMatch[3].toUpperCase();
          
          console.log('Parsed time components:', { hours, minutes, period });
          
          // Convert to 24-hour format
          if (period === 'AM') {
            if (hours === 12) hours = 0; // 12:xx AM = 0:xx
          } else { // PM
            if (hours !== 12) hours += 12; // x:xx PM = (x+12):xx, except 12:xx PM stays 12:xx
          }
          
          console.log('Converted to 24-hour format:', { hours, minutes });
          
          // Create date object with manual components
          const date = new Date(year, month, day, hours, minutes, 0, 0);
          console.log('Created date object:', date);
          
          if (!isNaN(date.getTime())) {
            dateTime = date.toISOString();
            console.log('Successfully parsed to ISO:', dateTime);
          } else {
            console.warn('Manual date construction failed, using current time as fallback');
          }
        } else {
          console.warn('Time string does not match expected format (H:MM AM/PM)');
          console.log('Trying alternative parsing approaches...');
          
          const altPatterns = [
            /^(\d{1,2}):(\d{1,2})(AM|PM)$/i,  // No space before AM/PM
            /^(\d{1,2}):(\d{1,2})\s+(AM|PM)$/i, // Multiple spaces
            /^(\d{1,2}):(\d{1,2})\s*(A\.M\.|P\.M\.)$/i, // With periods
          ];
          
          for (let i = 0; i < altPatterns.length; i++) {
            const altMatch = timeStr.match(altPatterns[i]);
            console.log(`Alternative pattern ${i + 1} result:`, altMatch);
            
            if (altMatch) {
              let hours = parseInt(altMatch[1]);
              const minutes = parseInt(altMatch[2]);
              const period = altMatch[3].toUpperCase().replace(/\./g, ''); // Remove periods
              
              console.log('Alternative parsed components:', { hours, minutes, period });
              
              // Convert to 24-hour format
              if (period === 'AM') {
                if (hours === 12) hours = 0;
              } else { // PM
                if (hours !== 12) hours += 12;
              }
              
              const date = new Date(year, month, day, hours, minutes, 0, 0);
              if (!isNaN(date.getTime())) {
                dateTime = date.toISOString();
                console.log('Successfully parsed with alternative pattern to ISO:', dateTime);
                break;
              }
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to parse event date/time:', error);
      // Keep default current time
    }
  } else if (backendEvent.event_date) {
    // If only date is provided, use it with default time
    try {
      const dateParts = backendEvent.event_date.split('/');
      if (dateParts.length === 3) {
        const month = parseInt(dateParts[0]) - 1; // JavaScript months are 0-based
        const day = parseInt(dateParts[1]);
        const year = parseInt(dateParts[2]);
        const date = new Date(year, month, day, 12, 0, 0, 0); // Default to noon
        if (!isNaN(date.getTime())) {
          dateTime = date.toISOString();
        }
      }
    } catch (error) {
      console.warn('Failed to parse event date:', error);
    }
  }

  return {
    id: String(eventId),
    title: name,
    description: description,
    organizerId: String(orgId),
    organizerName: organizerName,
    organizerImageUrl: 'https://logo.clearbit.com/stanford.edu',
    location: location,
    dateTime: dateTime,
    imageUrl: imageUrl,
    isPrivate: !isPublic,
    pullUpCount: participantCount,
    userPulledUp: false, // This will be set based on student registration status
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
  studentEventPullUp: '/students-events/pu',
  
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
        
        // Transform backend events to frontend format
        let events = response.events.map(transformBackendEvent);
        
        // Check if user is logged in as a student
        try {
          const token = await AuthTokenManager.getToken();
          
          if (token && token.startsWith('student_')) {
            // Parse token format: student_${student_id}_${timestamp}
            const parts = token.split('_');
            if (parts.length >= 2) {
              const studentId = parseInt(parts[1]);
              
              if (!isNaN(studentId)) {
                console.log('Fetching registered events for student:', studentId);
                
                // Get student's registered events
                const registeredEventsResponse = await post<any>(ENDPOINTS.studentEvents, { student_id: studentId });
                
                if (registeredEventsResponse && Array.isArray(registeredEventsResponse.events)) {
                  console.log('Student is registered for', registeredEventsResponse.events.length, 'events');
                  
                  // Create a set of registered event IDs for quick lookup
                  const registeredEventIds = new Set(
                    registeredEventsResponse.events.map((event: any) => String(event.event_id))
                  );
                  
                  console.log('Registered event IDs:', Array.from(registeredEventIds));
                  
                  // Mark events as userPulledUp if student is registered (instead of filtering them out)
                  events = events.map((event: Event) => ({
                    ...event,
                    userPulledUp: registeredEventIds.has(event.id)
                  }));
                  
                  console.log('Updated events with registration status');
                }
              }
            }
          } else {
            console.log('User not logged in as student, showing all events');
          }
        } catch (registrationError) {
          console.warn('Failed to fetch student registration status:', registrationError);
          // Continue showing all events if we can't check registration status
        }
        
        return events;
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

  // Get attendees for a specific event
  getEventAttendees: async (eventId: string): Promise<{
    id: string;
    name: string;
    email: string;
    checkedIn: boolean;
  }[]> => {
    try {
      console.log('Fetching attendees for event_id:', eventId);
      
      const response = await post<any>('/students-events/event', { 
        event_id: parseInt(eventId) 
      });
      
      console.log('Event attendees API response:', response);
      console.log('Type of response:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      // Handle the API response structure
      if (response && typeof response === 'object' && Array.isArray(response.students)) {
        console.log('Found attendees array with length:', response.students.length);
        
        // Transform backend student data to frontend attendee format
        return response.students.map((student: any) => ({
          id: String(student.student_id || student.id),
          name: student.name || 'Unknown Student',
          email: student.email || '',
          checkedIn: student.registered === true, // Use registered field to determine check-in status
        }));
      }
      
      console.log('No students array found in attendees response, returning empty array');
      return [];
      
    } catch (error: any) {
      console.error('Error fetching event attendees:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      
      return [];
    }
  },

  // Update attendee registration status
  updateAttendeeRegistration: async (studentId: string, eventId: string, registered: boolean): Promise<void> => {
    try {
      console.log('Updating attendee registration:', { studentId, eventId, registered });
      
      const response = await put<any>('/students-events/update', {
        student_id: parseInt(studentId),
        event_id: parseInt(eventId),
        registered: registered
      });
      
      console.log('Update attendee registration API response:', response);
      console.log('Registration updated successfully');
      
    } catch (error: any) {
      console.error('Error updating attendee registration:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      console.error('Error status:', error.response?.status);
      
      // Handle specific error responses
      if (error.response?.status === 404) {
        throw new Error("Student or event not found");
      } else if (error.response?.status === 400) {
        throw new Error("Invalid request data");
      } else if (error.response?.status === 403) {
        throw new Error("Permission denied - unable to update registration");
      }
      
      // Extract error message from response if available
      let errorMessage = "Failed to update registration status";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
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
    try {
      console.log('Deleting event with ID:', id);
      
      const response = await del<any>(ENDPOINTS.events, {
        data: { event_id: parseInt(id) } // DELETE requests send data in the body via config.data
      });
      
      console.log('Event deletion API response:', response);
      console.log('Event deleted successfully');
      
    } catch (error: any) {
      console.error('Error deleting event:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      console.error('Error status:', error.response?.status);
      
      // Handle specific error responses
      if (error.response?.status === 404) {
        throw new Error("Event not found");
      } else if (error.response?.status === 400) {
        throw new Error("Invalid event ID");
      }
      
      // Extract error message from response if available
      let errorMessage = "Failed to delete event";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  // Toggle pull up for an event (register/unregister student)
  togglePullUp: async (id: string, currentlyRegistered: boolean, password?: string): Promise<Event> => {
    try {
      // Extract student_id from auth token
      const token = await AuthTokenManager.getToken();
      
      if (!token || !token.startsWith("student_")) {
        throw new Error("Must be logged in as a student to pull up to events");
      }

      // Parse token format: student_${student_id}_${timestamp}
      const parts = token.split("_");
      if (parts.length < 2) {
        throw new Error("Invalid authentication token");
      }

      const studentId = parseInt(parts[1]);
      if (isNaN(studentId)) {
        throw new Error("Invalid student ID");
      }

      // API request structure
      const requestData = {
        student_id: studentId,
        event_id: parseInt(id),
        reg_code: password || null
      };

      let response: any;
      
      if (currentlyRegistered) {
        // Student is currently registered, so unregister (DELETE)
        console.log('Unregistering student with data:', requestData);
        response = await del<any>(ENDPOINTS.studentEventPullUp, {
          data: requestData // DELETE requests send data in the body via config.data
        });
      } else {
        // Student is not registered, so register (POST)
        console.log('Registering student with data:', requestData);
        response = await post<any>(ENDPOINTS.studentEventPullUp, requestData);
      }
      
      console.log('Pull up API response:', response);
      console.log('Response message:', response?.message);

      // Handle the expected response
      if (response && typeof response === 'object' && response.message) {
        const action = currentlyRegistered ? 'unregistered' : 'registered';
        console.log(`Student ${action} successfully:`, response.message);
        
        // Return a simple success event object
        return {
          id: id,
          title: 'Event Updated',
          description: '',
          organizerId: '',
          organizerName: 'Organization',
          organizerImageUrl: 'https://logo.clearbit.com/stanford.edu',
          location: 'TBD',
          dateTime: new Date().toISOString(),
          imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94',
          isPrivate: false,
          pullUpCount: 1,
          userPulledUp: !currentlyRegistered, // Toggle the status
          eventPassword: password,
          created_at: String(Math.floor(Date.now() / 1000)),
        };
      }
      
      throw new Error("Unexpected response format from pull up API");
      
    } catch (error: any) {
      console.error('Pull up error details:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      console.error('Error status:', error.response?.status);
      
      // Handle specific error responses
      if (error.response?.status === 403) {
        throw new Error("Invalid password for this private event");
      } else if (error.response?.status === 400) {
        throw new Error("Invalid request - check event ID and student status");
      } else if (error.response?.status === 404) {
        throw new Error("Registration not found");
      } else if (error.response?.status === 409) {
        throw new Error("Already registered for this event");
      }
      
      // Extract error message from response if available
      const action = currentlyRegistered ? 'unregister from' : 'register for';
      let errorMessage = `Failed to ${action} event`;
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
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
        
        // Transform and mark all events as userPulledUp since these are the student's registered events
        const transformedEvents = response.events.map(transformBackendEvent);
        return transformedEvents.map((event: Event) => ({
          ...event,
          userPulledUp: true // Student is registered for all events in their "My Events"
        }));
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