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

export interface Comment {
  id: string;
  eventId: string;
  userId: string;
  username: string;
  userImageUrl?: string;
  text: string;
  createdAt: string;
  likes: number;
  userLiked: boolean;
}

export interface QRWristband {
  eventId: string;
  userId: string;
  code: string;
  createdAt: string;
  expiresAt: string;
}

export type RootStackParamList = {
  Main: undefined;
  EventDetails: { eventId: string };
  CreateEvent: undefined;
  Profile: undefined;
  QRWristband: { eventId: string };
  ScanQR: undefined;
}; 