import { Event, Comment, User, QRWristband } from '../types';

// Both mock and real API services (for testing)
import { EventApi as MockEventApi, CommentApi as MockCommentApi, QRWristbandApi as MockQRWristbandApi } from './api';
import { EventApi as RealEventApi, CommentApi as RealCommentApi, QRWristbandApi as RealQRWristbandApi, AuthApi as RealAuthApi } from './realApi';

// Config flag: false for real APIs, true for mock APIs during dev
const USE_MOCK_API = false;

// Event API interface
interface IEventApi {
  getEvents: (filters?: any) => Promise<Event[]>;
  getEventById: (id: string) => Promise<Event | null>;
  toggleLike: (id: string) => Promise<Event>;
  toggleSaved: (id: string) => Promise<Event>;
  createEvent: (eventData: any) => Promise<Event>;
}

// Comment API interface
interface ICommentApi {
  getCommentsByEventId: (eventId: string) => Promise<Comment[]>;
  addComment: (eventId: string, text: string) => Promise<Comment>;
  toggleCommentLike: (commentId: string) => Promise<Comment>;
}

// QR Wristband API interface
interface IQRWristbandApi {
  generateWristband: (eventId: string) => Promise<QRWristband>;
  validateWristband: (code: string) => Promise<{ isValid: boolean; eventId?: string; userId?: string; message?: string }>;
}

// Auth API interface (only available for real API)
interface IAuthApi {
  login: (casTicket: string) => Promise<{ token: string; user: User }>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User>;
  updateProfile: (profileData: any) => Promise<User>;
}

// Wrapper for Event API
class EventApiProvider implements IEventApi {
  async getEvents(filters?: any): Promise<Event[]> {
    if (USE_MOCK_API) {
      return MockEventApi.getEvents();
    }
    return RealEventApi.getEvents(filters);
  }

  async getEventById(id: string): Promise<Event | null> {
    if (USE_MOCK_API) {
      return MockEventApi.getEventById(id);
    }
    try {
      return await RealEventApi.getEventById(id);
    } catch (error) {
      return null;
    }
  }

  async toggleLike(id: string): Promise<Event> {
    if (USE_MOCK_API) {
      return MockEventApi.toggleLike(id);
    }
    return RealEventApi.toggleLike(id);
  }

  async toggleSaved(id: string): Promise<Event> {
    if (USE_MOCK_API) {
      return MockEventApi.toggleSaved(id);
    }
    return RealEventApi.toggleSaved(id);
  }

  async createEvent(eventData: any): Promise<Event> {
    if (USE_MOCK_API) {
      return MockEventApi.createEvent(eventData);
    }
    return RealEventApi.createEvent(eventData);
  }
}

// Wrapper for Comment API
class CommentApiProvider implements ICommentApi {
  async getCommentsByEventId(eventId: string): Promise<Comment[]> {
    if (USE_MOCK_API) {
      return MockCommentApi.getCommentsByEventId(eventId);
    }
    return RealCommentApi.getCommentsByEventId(eventId);
  }

  async addComment(eventId: string, text: string): Promise<Comment> {
    if (USE_MOCK_API) {
      return MockCommentApi.addComment(eventId, text);
    }
    return RealCommentApi.addComment(eventId, text);
  }

  async toggleCommentLike(commentId: string): Promise<Comment> {
    if (USE_MOCK_API) {
      return MockCommentApi.toggleCommentLike(commentId);
    }
    return RealCommentApi.toggleCommentLike(commentId);
  }
}

// Wrapper for QR Wristband API
class QRWristbandApiProvider implements IQRWristbandApi {
  async generateWristband(eventId: string): Promise<QRWristband> {
    if (USE_MOCK_API) {
      return MockQRWristbandApi.generateWristband(eventId);
    }
    return RealQRWristbandApi.generateWristband(eventId);
  }

  async validateWristband(code: string): Promise<{ isValid: boolean; eventId?: string; userId?: string; message?: string }> {
    if (USE_MOCK_API) {
      return MockQRWristbandApi.validateWristband(code);
    }
    return RealQRWristbandApi.validateWristband(code);
  }
}

// Auth API Provider (only real API available)
class AuthApiProvider implements IAuthApi {
  async login(casTicket: string): Promise<{ token: string; user: User }> {
    if (USE_MOCK_API) {
      // For mock API, simulate a successful login
      return {
        token: 'mock-jwt-token',
        user: {
          id: 'user1',
          username: 'johndoe',
          displayName: 'John Doe',
          profileImageUrl: 'https://via.placeholder.com/100',
          isOrganization: false,
        } as User,
      };
    }
    return RealAuthApi.login(casTicket);
  }

  async logout(): Promise<void> {
    if (USE_MOCK_API) {
      // For mock API, just clear local storage
      const { AuthTokenManager } = await import('../config/api');
      await AuthTokenManager.removeToken();
      return;
    }
    return RealAuthApi.logout();
  }

  async getCurrentUser(): Promise<User> {
    if (USE_MOCK_API) {
      // Return mock user data
      return {
        id: 'user1',
        username: 'johndoe',
        displayName: 'John Doe',
        profileImageUrl: 'https://via.placeholder.com/100',
        isOrganization: false,
      } as User;
    }
    return RealAuthApi.getCurrentUser();
  }

  async updateProfile(profileData: any): Promise<User> {
    if (USE_MOCK_API) {
      // Return updated mock user data
      return {
        id: 'user1',
        username: profileData.username || 'johndoe',
        displayName: profileData.displayName || 'John Doe',
        profileImageUrl: profileData.profileImageUrl || 'https://via.placeholder.com/100',
        isOrganization: profileData.isOrganization || false,
      } as User;
    }
    return RealAuthApi.updateProfile(profileData);
  }
}

// Export config API providers
export const EventApi = new EventApiProvider();
export const CommentApi = new CommentApiProvider();
export const QRWristbandApi = new QRWristbandApiProvider();
export const AuthApi = new AuthApiProvider();

// Export config flag for components that need to know
export { USE_MOCK_API };

// Utility func to switch API mode (for development)
export const setApiMode = (useMock: boolean) => {
  console.log(`API mode will be switched to ${useMock ? 'MOCK' : 'REAL'} on next app restart`);
}; 