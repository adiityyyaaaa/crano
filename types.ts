
export interface Teacher {
  id: string;
  name: string;
  subject: string;
  rating: number;
  reviews: number;
  price: number;
  avatar: string;
  bio: string;
  videoUrl: string;
  experience: string;
  youtubeSubscribers?: string;
  isVerified: boolean;
  tags: string[];
  grades?: string[]; // e.g. ["8", "9", "10"]
  isAllSubjects?: boolean; // For generalist school teachers
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
