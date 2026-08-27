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
  ghostMode: boolean; // Only visible to profiles you swipe right on first
  womenOnlyMode: boolean; // Only visible to and browsing female lifters
  gymVisibility: GymVisibilityTier; // How gym appears on public card
  scheduleVisibility: 'full' | 'overlap_only' | 'match_only';
  distanceFuzzing: boolean; // Display fuzzed bucket instead of exact distance
}

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary';
  bio: string;
  photos: string[];
  formCheckVideoUrl?: string;
  
  // Gym Logistics
  primaryGym: {
    brand: string;
    branchName: string;
    neighborhood: string;
  };
  distanceMiles: number;
  fuzzedDistanceText: string;
  
  // Fitness DNA
  experienceLevel: ExperienceLevel;
  primaryModalities: Modality[];
  workoutSplit: WorkoutSplit;
  schedule: ScheduleDay[];
  spottingStyle: string;
  gymEnergy: string;
  intent: 'platonic_only' | 'open_to_dating';
  
  // Accountability Metrics
  reliabilityScore: number;
  completedWorkoutsCount: number;
  
  // Privacy
  privacy: PrivacySettings;
}

export interface GymBeacon {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
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
