import { Event, User } from '../types';

// Both mock and real API services (for testing)
import { EventApi as MockEventApi, setCurrentMockUser } from './api';
import { EventApi as RealEventApi, AuthApi as RealAuthApi, QRWristbandApi as RealQRWristbandApi } from './realApi';
import { mockUsers } from './mockData';

// Config flag: false for real APIs, true for mock APIs during dev
const USE_MOCK_API = false;

// Event API interface
interface IEventApi {
  getEvents: (filters?: any) => Promise<Event[]>;
  getEventById: (id: string) => Promise<Event | null>;
  togglePullUp: (id: string) => Promise<Event>;
  getUserEvents: () => Promise<Event[]>;
  getOrganizationEvents: (userInfo?: any) => Promise<Event[]>;
  createEvent: (eventData: any) => Promise<Event>;
  // Legacy methods
  toggleLike: (id: string) => Promise<Event>;
  toggleSaved: (id: string) => Promise<Event>;
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
  // Sync current user context with mock API (for testing)
  private syncMockUser(userInfo?: any) {
    if (USE_MOCK_API && userInfo) {
      // Try to find matching mock user based on userType and name
      const mockUser = mockUsers.find(user => {
        if (userInfo.userType === 'organization') {
          return user.userType === 'organization' && 
                 (user.displayName.toLowerCase().includes(userInfo.organizationName?.toLowerCase() || '') ||
                  user.username.toLowerCase().includes(userInfo.organizationName?.toLowerCase() || ''));
        } else {
          return user.userType === 'student';
        }
      });
      
      if (mockUser) {
        setCurrentMockUser(mockUser);
      }
    }
  }

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

  async togglePullUp(id: string): Promise<Event> {
    if (USE_MOCK_API) {
      return MockEventApi.togglePullUp(id);
    }
    // Use real API implementation
    return RealEventApi.togglePullUp(id);
  }

  async getUserEvents(): Promise<Event[]> {
    if (USE_MOCK_API) {
      return MockEventApi.getUserEvents();
    }
    // Use real API implementation
    return RealEventApi.getUserEvents();
  }

  async getOrganizationEvents(userInfo?: any): Promise<Event[]> {
    this.syncMockUser(userInfo);
    if (USE_MOCK_API) {
      return MockEventApi.getOrganizationEvents();
    }
    // Use real API implementation
    return RealEventApi.getOrganizationEvents();
  }

  async createEvent(eventData: any): Promise<Event> {
    if (USE_MOCK_API) {
      return MockEventApi.createEvent(eventData);
    }
    return RealEventApi.createEvent(eventData);
  }

  // Legacy methods for backward compatibility
  async toggleLike(id: string): Promise<Event> {
    return this.togglePullUp(id);
  }

  async toggleSaved(id: string): Promise<Event> {
    if (USE_MOCK_API) {
      return MockEventApi.toggleSaved(id);
    }
    return RealEventApi.toggleSaved(id);
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
          userType: 'student',
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
        userType: 'student',
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
        userType: profileData.userType || 'student',
      } as User;
    }
    return RealAuthApi.updateProfile(profileData);
  }
}

// Export config API providers
export const EventApi = new EventApiProvider();
export const AuthApi = new AuthApiProvider();

// QRWristband API - use real API only since it's a specialized feature
export const QRWristbandApi = RealQRWristbandApi;

// Export config flag for components that need to know
export { USE_MOCK_API };

// Utility func to switch API mode (for development)
export const setApiMode = (useMock: boolean) => {
  console.log(`API mode will be switched to ${useMock ? 'MOCK' : 'REAL'} on next app restart`);
}; 