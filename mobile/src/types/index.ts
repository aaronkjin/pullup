export interface User {
  id: string;
  username: string;
  displayName: string;
  isOrganization: boolean;
  profileImageUrl?: string;
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
  category: string;
  isPrivate: boolean;
  likes: number;
  userLiked: boolean;
  saved: boolean;
}

export interface QRWristband {
  id: string;
  eventId: string;
  userId: string;
  code: string;
  createdAt: string;
  isActive: boolean;
}

export type RootStackParamList = {
  Main: undefined;
  EventDetails: { eventId: string };
  CreateEvent: undefined;
  Profile: undefined;
  QRWristband: { eventId: string };
  ScanQR: undefined;
}; 