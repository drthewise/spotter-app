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
  womenOnlyMode: boolean;
  gymVisibility: GymVisibilityTier;
  scheduleVisibility: 'full' | 'overlap_only' | 'match_only';
  distanceFuzzing: boolean;
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
}

export interface ChatMessage {
  id: string;
  senderId: string;
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
}
