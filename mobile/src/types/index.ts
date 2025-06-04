export interface User {
  id: string;
  username: string;
  displayName: string;
  isOrganization: boolean;
  profileImageUrl?: string;
  userType: 'student' | 'organization';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  organizerName: string;
  organizerImageUrl?: string;
  location: string;
  dateTime: string;
  imageUrl?: string;
  isPrivate: boolean;
  pullUpCount: number;
  userPulledUp: boolean;
  eventPassword?: string;
  created_at: string;
}

export interface QRWristband {
  id: string;
  eventId: string;
  userId: string;
  code: string;
  createdAt: string;
  expiresAt: string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  username: string;
  displayName: string;
  isConfirmed: boolean;
  registeredAt: string;
  studentPassword?: string;
}

export type RootStackParamList = {
  Main: undefined;
  EventDetails: { eventId: string };
  CreateEvent: undefined;
  Profile: undefined;
  QRWristband: { eventId: string };
};

export type StudentTabParamList = {
  Home: undefined;
  MyEvents: undefined;
};

export type OrganizationTabParamList = {
  MyEvents: undefined;
  Create: undefined;
}; 