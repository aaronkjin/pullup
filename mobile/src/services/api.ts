/**
 * Mock API services (for dev + testing) 
 * Switch between mock/real APIs in apiProvider.ts by changing USE_MOCK_API flag
 */
import { Event, User, QRWristband } from '../types';
import { mockEvents, mockUsers } from './mockData';

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

  // Toggle like for event
  toggleLike: async (id: string): Promise<Event> => {
    await delay(200);
    const eventIndex = mockEvents.findIndex(event => event.id === id);
    if (eventIndex === -1) throw new Error('Event not found');
    
    const event = {...mockEvents[eventIndex]};
    
    // Toggle like status
    if (event.userLiked) {
      event.likes--;
      event.userLiked = false;
    } else {
      event.likes++;
      event.userLiked = true;
    }
    
    // Update source data so changes persist
    mockEvents[eventIndex] = event;
    
    return event;
  },

  // Toggle saved status
  toggleSaved: async (id: string): Promise<Event> => {
    await delay(200);
    const eventIndex = mockEvents.findIndex(event => event.id === id);
    if (eventIndex === -1) throw new Error('Event not found');
    
    const event = {...mockEvents[eventIndex]};
    event.saved = !event.saved;
    
    // Update source data so changes persist
    mockEvents[eventIndex] = event;
    
    return event;
  },

  // Create new event (for org users)
  createEvent: async (eventData: Omit<Event, 'id' | 'likes' | 'userLiked' | 'saved'>): Promise<Event> => {
    await delay(800);
    const newEvent: Event = {
      ...eventData,
      id: `event${mockEvents.length + 1}`,
      likes: 0,
      userLiked: false,
      saved: false,
    };
    
    return newEvent;
  },
};

export const QRWristbandApi = {
  // Generate QR wristband for private event
  generateWristband: async (eventId: string): Promise<QRWristband> => {
    await delay(500);
    
    // TODO: Need to get current user from auth context
    const currentUser = mockUsers[0];
    
    // Generate random code (TODO: Need to use more secure method)
    const code = Math.random().toString(36).substring(2, 15);
    
    const wristband: QRWristband = {
      id: `wristband${Date.now()}`,
      eventId,
      userId: currentUser.id,
      code,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    
    return wristband;
  },
  
  // Validate QR wristband (for event check-ins)
  validateWristband: async (code: string): Promise<{ isValid: boolean; eventId?: string; userId?: string }> => {
    await delay(700);
    
    // TODO: Need to check against database
    return {
      isValid: true,
      eventId: 'event3', // Assuming it's for private mixer event
      userId: 'user1',
    };
  },
}; 