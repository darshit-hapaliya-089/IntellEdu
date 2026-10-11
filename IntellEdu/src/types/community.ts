export type PresenceStatus = 'online' | 'offline' | 'studying';

export interface Friend {
  id: string;
  name: string;
  grade: string;
  avatar: string;
  points: number;
  streak: number;
  status: PresenceStatus;
  subjectFocus: string;
  added: boolean;
  mutualFriends: number;
  location?: string;
  isNearby?: boolean;
}

export interface WorldMember {
  id: string;
  rank: number;
  name: string;
  country: string;
  countryCode: string;
  grade: string;
  points: number;
  streak: number;
  avatar: string;
}

export type PostType = 'quiz' | 'achievement' | 'streak' | 'doubt' | 'note';
export type FeedScope = 'friends' | 'world';

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  scope: FeedScope;
  type: PostType;
  subject?: string;
  content: string;
  likes: number;
  comments: number;
  likedByMe: boolean;
  createdAt: string;
}

export interface StudyRoom {
  id: string;
  name: string;
  subject: string;
  topic: string;
  membersOnline: number;
  capacity: number;
  country: string;
  hostName: string;
  isLive: boolean;
}

export interface CommunityStats {
  friendsOnline: number;
  worldLearners: string;
  liveRooms: number;
  requestsCount: number;
}
