import { Event, Comment, User, QRWristband } from '../types';
import { mockEvents, mockComments, mockUsers } from './mockData';

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

  // Toggle like for an event
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
    
    // Update the source data so changes persist
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
    
    // Update the source data so changes persist
    mockEvents[eventIndex] = event;
    
    return event;
  },

  // Create a new event (for organization users)
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

export const CommentApi = {
  // Get comments for an event
  getCommentsByEventId: async (eventId: string): Promise<Comment[]> => {
    await delay(400);
    return mockComments.filter(comment => comment.eventId === eventId);
  },

  // Add a comment to an event
  addComment: async (eventId: string, text: string): Promise<Comment> => {
    await delay(300);
    
    // In a real app, we'd get this from the authenticated user
    const currentUser = mockUsers[0];
    
    const newComment: Comment = {
      id: `comment${mockComments.length + 1}`,
      eventId,
      userId: currentUser.id,
      username: currentUser.username,
      userImageUrl: currentUser.profileImageUrl,
      text,
      createdAt: new Date().toISOString(),
      likes: 0,
      userLiked: false,
    };
    
    return newComment;
  },

  // Toggle like for a comment
  toggleCommentLike: async (commentId: string): Promise<Comment> => {
    await delay(200);
    
    // Find the comment in mockComments and update it
    const commentIndex = mockComments.findIndex(comment => comment.id === commentId);
    if (commentIndex === -1) throw new Error('Comment not found');
    
    const comment = {...mockComments[commentIndex]};
    
    // Toggle like status
    if (comment.userLiked) {
      comment.likes--;
      comment.userLiked = false;
    } else {
      comment.likes++;
      comment.userLiked = true;
    }
    
    // Update the source data so changes persist
    mockComments[commentIndex] = comment;
    
    return comment;
  },
};

export const QRWristbandApi = {
  // Generate a QR wristband for a private event
  generateWristband: async (eventId: string): Promise<QRWristband> => {
    await delay(500);
    
    // In a real app, we'd get this from the authenticated user
    const currentUser = mockUsers[0];
    
    // Generate a random code (in real app, this would be more secure)
    const code = Math.random().toString(36).substring(2, 15);
    
    const wristband: QRWristband = {
      eventId,
      userId: currentUser.id,
      code,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Expires in 24 hours
    };
    
    return wristband;
  },
  
  // Validate a QR wristband (for event check-ins)
  validateWristband: async (code: string): Promise<{ isValid: boolean; eventId?: string; userId?: string }> => {
    await delay(700);
    
    // In a real app, this would check against the database
    // For demo purposes, we'll just return valid for any code
    return {
      isValid: true,
      eventId: 'event3', // Assuming it's for the private mixer event
      userId: 'user1',
    };
  },
}; 