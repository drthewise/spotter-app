export type ExperienceLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Elite Athlete';

export type Modality = 
  | 'Bodybuilding' 
  | 'Powerlifting' 
  | 'CrossFit' 
  | 'HYROX' 
  | 'Calisthenics' 
  | 'Olympic Lifting' 
  | 'Running / Cardio' 
  | 'General Fitness';

export type WorkoutSplit = 
  | 'Push / Pull / Legs (PPL)' 
  | 'Upper / Lower' 
  | 'Full Body' 
  | 'Bro Split' 
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

export interface StrengthBenchmarks {
  benchWorkingWeight?: string; // e.g. "225 lbs"
  squatWorkingWeight?: string; // e.g. "315 lbs"
  deadliftWorkingWeight?: string; // e.g. "405 lbs"
  dumbbellPress?: string; // e.g. "90 lb DBs"
  tierCategory?: 'Beginner (<135)' | 'Intermediate (135–225)' | 'Advanced (225–315)' | 'Elite (315+)';
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
  rating: number; // 1-5
  badges: string[];
  notes?: string;
  createdAt: string;
}
