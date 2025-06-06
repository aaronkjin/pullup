/**
 * Mock API services (for dev + testing) 
 * Switch between mock/real APIs in apiProvider.ts by changing USE_MOCK_API flag
 */
import { Event, User } from '../types';
import { mockEvents, mockUsers } from './mockData';

// Current user simulation for mock API
let currentMockUser: User | null = null;

// Helper to get current mock user
const getCurrentMockUser = (): User | null => {
  if (!currentMockUser) {
    // Default to the first org for testing
    currentMockUser = mockUsers.find(user => user.userType === 'organization') || mockUsers[0];
  }
  return currentMockUser;
};

// Helper to set current mock user (for testing different user types)
export const setCurrentMockUser = (user: User) => {
  currentMockUser = user;
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const EventApi = {
  // Get all events
  getEvents: async (): Promise<Event[]> => {
    await delay(500); // Simulate network delay
    return [...mockEvents];
  },

  // Get event by ID
  getEventById: async (id: string): Promise<Event | null> => {
    await delay(300);
    const event = mockEvents.find(event => event.id === id);
    return event || null;
  },

  // Toggle pull up for event
  togglePullUp: async (id: string, password?: string): Promise<Event> => {
    await delay(200);
    const eventIndex = mockEvents.findIndex(event => event.id === id);
    if (eventIndex === -1) throw new Error('Event not found');
    
    const event = {...mockEvents[eventIndex]};
    
    // For private events, validate password
    if (event.isPrivate && event.eventPassword) {
      if (!password) {
        throw new Error('Password required for private event');
      }
      if (password !== event.eventPassword) {
        throw new Error('Invalid password');
      }
    }
    
    // Toggle pull up status
    if (event.userPulledUp) {
      event.pullUpCount--;
      event.userPulledUp = false;
    } else {
      event.pullUpCount++;
      event.userPulledUp = true;
    }
    
    // Update source data so changes persist
    mockEvents[eventIndex] = event;
    
    return event;
  },

  // Get events for current user (students - their registered events)
  getUserEvents: async (): Promise<Event[]> => {
    await delay(400);
    // Return events where user has pulled up
    return mockEvents.filter(event => event.userPulledUp);
  },

  // Get events for organization (their created events)
  getOrganizationEvents: async (): Promise<Event[]> => {
    await delay(400);
    const currentUser = getCurrentMockUser();
    if (!currentUser || currentUser.userType !== 'organization') {
      return [];
    }
    // Filter events created by current organization
    return mockEvents.filter(event => event.organizerId === currentUser.id);
  },

  // Create new event (for org users)
  createEvent: async (eventData: Omit<Event, 'id' | 'pullUpCount' | 'userPulledUp' | 'created_at'>): Promise<Event> => {
    await delay(800);
    const created_at = String(Math.floor(Date.now() / 1000));
    const newEvent: Event = {
      ...eventData,
      id: `event${mockEvents.length + 1}`,
      pullUpCount: 0,
      userPulledUp: false,
      created_at,
    };
    
    // Add to mock data
    mockEvents.push(newEvent);
    
    return newEvent;
  },

  // Get attendees for a specific event (mock implementation)
  getEventAttendees: async (eventId: string): Promise<{
    id: string;
    name: string;
    email: string;
    checkedIn: boolean;
  }[]> => {
    await delay(500);
    const event = mockEvents.find(e => e.id === eventId);
    if (!event) return [];
    
    // Generate mock attendees based on pullUpCount
    const mockAttendees = [];
    for (let i = 1; i <= event.pullUpCount; i++) {
      mockAttendees.push({
        id: `attendee_${eventId}_${i}`,
        name: `Student ${i}`,
        email: `student${i}@stanford.edu`,
        checkedIn: Math.random() > 0.7, // 30% chance of being checked in
      });
    }
    
    return mockAttendees;
  },

  // Update attendee registration status (mock implementation)
  updateAttendeeRegistration: async (studentId: string, eventId: string, registered: boolean): Promise<void> => {
    await delay(300);
    console.log(`Mock: Updated student ${studentId} registration for event ${eventId} to ${registered}`);
    // In a real mock implementation, we could store this state and reflect it in getEventAttendees
    return;
  },

  // Legacy methods (keeping for backward compatibility during transition)
  toggleLike: async (id: string, password?: string): Promise<Event> => {
    // Redirect to togglePullUp for backward compatibility
    return EventApi.togglePullUp(id, password);
  },

  toggleSaved: async (id: string): Promise<Event> => {
    await delay(200);
    const eventIndex = mockEvents.findIndex(event => event.id === id);
    if (eventIndex === -1) throw new Error('Event not found');
    
    const event = {...mockEvents[eventIndex]};
    // For now, saved functionality is removed, but keeping method for compatibility
    // Could be repurposed for bookmarking in the future
    
    return event;
  },
}; 