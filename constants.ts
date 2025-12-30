
import { Teacher } from './types';

export const TEACHERS: Teacher[] = [
  {
    id: '1',
    name: 'Dr. Sameer Verma',
    subject: 'Physics',
    rating: 4.9,
    reviews: 128,
    price: 800,
    avatar: 'https://picsum.photos/seed/sameer/200/200',
    bio: 'Ex-IITian with 10+ years of experience in teaching Quantum Mechanics and Classical Physics. My goal is to make physics intuitive.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    experience: '10 Years',
    youtubeSubscribers: '50K',
    isVerified: true,
    tags: ['JEE Prep', 'Conceptual Physics', 'Interactive'],
    grades: ['11', '12', 'College']
  },
  {
    id: '2',
    name: 'Anjali Sharma',
    subject: 'Mathematics',
    rating: 4.8,
    reviews: 240,
    price: 600,
    avatar: 'https://picsum.photos/seed/anjali/200/200',
    bio: 'Love helping students crack Calculus and Algebra. My teaching style focuses on mental math and quick problem-solving techniques.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    experience: '6 Years',
    youtubeSubscribers: '12K',
    isVerified: true,
    tags: ['Calculus', 'Linear Algebra', 'Exam Prep'],
    grades: ['8', '9', '10']
  },
  {
    id: '3',
    name: 'Pritam Singh',
    subject: 'Computer Science',
    rating: 4.7,
    reviews: 89,
    price: 1200,
    avatar: 'https://picsum.photos/seed/pritam/200/200',
    bio: 'Software Engineer turned educator. I teach Python, Java, and Data Structures through real-world projects.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    experience: '8 Years',
    youtubeSubscribers: '100K',
    isVerified: true,
    tags: ['Python', 'DSA', 'Web Dev'],
    grades: ['9', '10', '11', '12', 'College']
  },
  {
    id: '4',
    name: 'Meera Kapur',
    subject: 'All Subjects',
    rating: 4.9,
    reviews: 310,
    price: 500,
    avatar: 'https://picsum.photos/seed/meera/200/200',
    bio: 'Passionate school teacher specializing in Grades 5-9. I handle all core subjects including Science, Math, and Social Studies.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    experience: '12 Years',
    isVerified: true,
    tags: ['School Help', 'Homework Support', 'All Subjects'],
    grades: ['5', '6', '7', '8', '9'],
    isAllSubjects: true
  }
];

export const SUBJECTS = [
  // Core Academics
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Economics', 'Psychology', 'Sociology', 'Accountancy', 'Statistics',
  // Technology
  'Python Programming', 'Java', 'Web Development', 'Data Science', 'AI & ML', 'Cybersecurity', 'Cloud Computing', 'UI/UX Design', 'Digital Marketing',
  // Creative Arts
  'Guitar', 'Piano', 'Vocal Training', 'Digital Art', 'Photography', 'Creative Writing', 'Film Making', 'Acting', 'Interior Design', 'Dance',
  // Life Skills & Niche
  'Vedic Maths', 'Financial Literacy', 'Public Speaking', 'Chess', 'Yoga', 'Mindfulness', 'Speed Cubing', 'Cooking', 'Language Learning', 'Entrepreneurship'
];

export const GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'College', 'All Students'];
