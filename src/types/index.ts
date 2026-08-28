export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Elite Athlete';

export type Modality = 
  | 'Bodybuilding' 
  | 'Powerlifting' 
  | 'Glute & Lower Body'
  | 'CrossFit' 
  | 'HYROX' 
  | 'Calisthenics' 
  | 'Olympic Lifting' 
  | 'Running / Cardio' 
  | 'Pilates & Mobility'
  | 'General Fitness';

export type WorkoutSplit = 
  | 'Glute / Hamstrings / Upper (Lower Focus)'
  | 'Glutes & Quads / Upper Body'
  | 'Push / Pull / Legs (PPL)' 
  | 'Upper / Lower' 
  | 'Full Body Hypertrophy' 
  | 'Functional & HYROX Relays'
  | 'CrossFit & WODs'
  | 'Calisthenics & Skills'
  | 'General Fitness & Toning'
  | '5/3/1 Strength' 
  | 'Custom Split';

export type TimeSlot = 'early_morning' | 'midday' | 'evening' | 'night';

export interface ScheduleDay {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  slots: TimeSlot[];
}

export type GymVisibilityTier = 'exact' | 'brand_only' | 'match_only' | 'hidden';

export interface PrivacySettings {
  ghostMode: boolean;
  womenOnlyMode?: boolean;
  targetGenders?: ('male' | 'female' | 'non-binary')[];
  gymVisibility: GymVisibilityTier;
  scheduleVisibility: 'full' | 'overlap_only' | 'match_only';
  distanceFuzzing: boolean;
}

export interface BenchmarkItem {
  id: string;
  name: string; // e.g. "Barbell Hip Thrust", "Flat Bench", "Sled Push", "Max Pull-ups"
  value: string; // e.g. "275 lbs", "225 lbs (3x8)", "150 kg", "15 reps"
}

export interface StrengthBenchmarks {
  category?: 'Glute & Lower Body' | 'Barbell Compounds' | 'HYROX & Functional' | 'Calisthenics' | 'General Fitness';
  benchmarks: BenchmarkItem[];
  benchWorkingWeight?: string;
  squatWorkingWeight?: string;
  deadliftWorkingWeight?: string;
  dumbbellPress?: string;
}

export interface NotificationPreferences {
  spotRequests: boolean;
  beaconProximityAlerts: boolean;
  chatMessages: boolean;
  workoutReminders: boolean;
  emergencyPulse: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary';
  bio: string;
  photos: (string | any)[];
  formCheckVideoUrl?: string;
  
  primaryGym: {
    brand: string;
    branchName: string;
    neighborhood: string;
  };
  distanceMiles: number;
  fuzzedDistanceText: string;
  
  experienceLevel: ExperienceLevel;
  primaryModalities: Modality[];
  workoutSplit: WorkoutSplit;
  schedule: ScheduleDay[];
  spottingStyle: string;
  gymEnergy: string;
  intent: 'platonic_only' | 'open_to_dating';
  
  strengthBenchmarks?: StrengthBenchmarks;
  reliabilityScore: number;
  completedWorkoutsCount: number;
  
  privacy: PrivacySettings;
}

export interface GymBeacon {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string | any;
  gymName: string;
  targetFocus: string;
  timeWindowText: string;
  description: string;
  responsesCount: number;
  isUrgent: boolean;
  postedAt: string;
}

export interface WorkoutSession {
  id: string;
  matchId: string;
  scheduledDate: string;
  scheduledTime: string;
  gymName: string;
  splitFocus: string;
  userCheckedIn: boolean;
  partnerCheckedIn: boolean;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  reviewed?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName?: string;
  text: string;
  timestamp: string;
  isSystemEvent?: boolean;
}

export interface Match {
  id: string;
  partner: UserProfile;
  matchedAt: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  activeSession?: WorkoutSession;
  scheduleOverlapScore: number;
  messages?: ChatMessage[];
}

export interface GymCrew {
  id: string;
  name: string;
  tagline: string;
  gymName: string;
  modality: Modality;
  splitFocus: string;
  memberCount: number;
  members: {
    id: string;
    name: string;
    photo: any;
    role: 'Leader' | 'Member';
  }[];
  nextSession?: {
    date: string;
    time: string;
    title: string;
  };
  messages: ChatMessage[];
}

export interface WorkoutReview {
  id: string;
  partnerId: string;
  partnerName: string;
  rating: number;
  badges: string[];
  notes?: string;
  createdAt: string;
}
