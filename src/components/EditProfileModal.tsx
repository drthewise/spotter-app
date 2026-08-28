import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import {
  X,
  Check,
  Dumbbell,
  Sparkles,
  Flame,
  Zap,
  ShieldCheck,
  ChevronRight,
  Camera,
  Plus,
  Trash2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { UserProfile, ExperienceLevel, Modality, WorkoutSplit, BenchmarkItem } from '../types';

interface EditProfileModalProps {
  visible: boolean;
  user: UserProfile;
  onClose: () => void;
  onSave: (updatedUser: Partial<UserProfile>) => void;
}

const SPLIT_OPTIONS: WorkoutSplit[] = [
  '5/3/1 Strength',
  'Calisthenics & Skills',
  'CrossFit & WODs',
  'Custom Split',
  'Full Body Hypertrophy',
  'Functional & HYROX Relays',
  'General Fitness & Toning',
  'Glute / Hamstrings / Upper (Lower Focus)',
  'Glutes & Quads / Upper Body',
  'Push / Pull / Legs (PPL)',
  'Upper / Lower',
];

const EXPERIENCE_OPTIONS: ExperienceLevel[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Elite Athlete',
];

const MODALITY_OPTIONS: Modality[] = [
  'Bodybuilding',
  'Calisthenics',
  'CrossFit',
  'General Fitness',
  'Glute & Lower Body',
  'HYROX',
  'Olympic Lifting',
  'Pilates & Mobility',
  'Powerlifting',
  'Running / Cardio',
];

const SPOTTING_STYLES = [
  'Lift-off only, touch only on failure',
  'Hands hovering near bar (guided spot)',
  'Assisted forced reps on last set',
  'Hip thrust bar setup & rack loading',
  'Form check, pacing & audio hype motivation',
];

const BENCHMARK_PRESETS = [
  {
    category: '🏋️ Barbell Compounds',
    items: [
      { name: 'Flat Barbell Bench', value: '225 lbs (3x8)' },
      { name: 'Barbell Squat', value: '315 lbs' },
      { name: 'Barbell Deadlift', value: '405 lbs' },
      { name: 'Incline DB Press', value: '90 lb DBs' },
    ],
  },
  {
    category: '🤸 Calisthenics & Bodyweight',
    items: [
      { name: 'Max Strict Pull-ups', value: '16 reps' },
      { name: 'Weighted Dips', value: '+45 lbs (3x8)' },
      { name: 'Handstand Push-ups', value: '8 reps' },
      { name: 'L-Sit Hold', value: '30s hold' },
    ],
  },
  {
    category: '✨ General Fitness & DBs',
    items: [
      { name: 'Goblet Squat', value: '45 lbs' },
      { name: 'Dumbbell Chest Press', value: '30 lb DBs' },
      { name: 'Lat Pulldown', value: '90 lbs' },
      { name: 'Dumbbell RDL', value: '40 lb DBs' },
    ],
  },
  {
    category: '🍑 Glute & Lower Body',
    items: [
      { name: 'Barbell Hip Thrust', value: '225 lbs (3x10)' },
      { name: 'Barbell / DB RDL', value: '165 lbs' },
      { name: 'Bulgarian Split Squat', value: '35 lb DBs' },
      { name: 'Leg Press', value: '270 lbs' },
    ],
  },
  {
    category: '⚡ HYROX & Functional',
    items: [
      { name: '1k Running Pace', value: '4:30/km' },
      { name: 'Sled Push (152kg)', value: '100m in 1:45' },
      { name: 'SkiErg 500m Split', value: '1:54/500m' },
      { name: 'Wall Balls', value: '14 lb (40 reps)' },
    ],
  },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  user,
  onClose,
  onSave,
}) => {
  const [bio, setBio] = useState(user.bio);
  const [workoutSplit, setWorkoutSplit] = useState<WorkoutSplit>(user.workoutSplit);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(user.experienceLevel);
  const [primaryModalities, setPrimaryModalities] = useState<Modality[]>(user.primaryModalities);
  const [spottingStyle, setSpottingStyle] = useState(user.spottingStyle);
  const [gymEnergy, setGymEnergy] = useState(user.gymEnergy);
  
  // Custom Benchmarks
  const initialBenchmarks: BenchmarkItem[] = user.strengthBenchmarks?.benchmarks && user.strengthBenchmarks.benchmarks.length > 0
    ? user.strengthBenchmarks.benchmarks
    : [
        { id: 'b1', name: 'Barbell Hip Thrust / Bench', value: '225 lbs' },
        { id: 'b2', name: 'Squat / Leg Press', value: '315 lbs' },
        { id: 'b3', name: 'Deadlift / RDL', value: '365 lbs' },
        { id: 'b4', name: 'Dumbbell Working Weight', value: '50 lb DBs' },
      ];

  const [benchmarks, setBenchmarks] = useState<BenchmarkItem[]>(initialBenchmarks);

  const applyPreset = (preset: typeof BENCHMARK_PRESETS[0]) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    const newItems = preset.items.map((item, idx) => ({
      id: 'b_' + Date.now() + '_' + idx,
      name: item.name,
      value: item.value,
    }));
    setBenchmarks(newItems);
  };

  const updateBenchmarkName = (idx: number, name: string) => {
    const updated = [...benchmarks];
    updated[idx].name = name;
    setBenchmarks(updated);
  };

  const updateBenchmarkVal = (idx: number, value: string) => {
    const updated = [...benchmarks];
    updated[idx].value = value;
    setBenchmarks(updated);
  };

  const toggleModality = (m: Modality) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    if (primaryModalities.includes(m)) {
      if (primaryModalities.length > 1) {
        setPrimaryModalities(primaryModalities.filter((item) => item !== m));
      }
    } else {
      setPrimaryModalities([...primaryModalities, m]);
    }
  };

  const handleSave = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    onSave({
      bio,
      workoutSplit,
      experienceLevel,
      primaryModalities,
      spottingStyle,
      gymEnergy,
      strengthBenchmarks: {
        benchmarks,
      },
    });
    onClose();
  };

  const userPhotoSrc = typeof user.photos[0] === 'string' ? { uri: user.photos[0] } : user.photos[0];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Fitness DNA</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Profile Avatar Header */}
            <View style={styles.avatarSection}>
              <Image source={userPhotoSrc} style={styles.avatar} />
              <TouchableOpacity
                style={styles.changePhotoPill}
                onPress={() => {
                  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                  Alert.alert('Photo Updated', 'Primary profile photo synced from gallery.');
                }}
              >
                <Camera size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Bio & Workout Goals */}
            <Text style={styles.sectionHeader}>BIO & TRAINING FOCUS</Text>
            <TextInput
              style={styles.bioInput}
              placeholder="Describe your training focus, favorite exercises, or what you look for in a spotter..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              value={bio}
              onChangeText={setBio}
            />

            {/* Workout Split */}
            <Text style={styles.sectionHeader}>WORKOUT SPLIT</Text>
            <View style={styles.pillsRow}>
              {SPLIT_OPTIONS.map((split) => {
                const isSelected = workoutSplit === split;
                return (
                  <TouchableOpacity
                    key={split}
                    style={[styles.pill, isSelected && styles.pillActive]}
                    onPress={() => {
                      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                      setWorkoutSplit(split);
                    }}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                      {split}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Working Weights & Benchmarks */}
            <Text style={styles.sectionHeader}>TRAINING BENCHMARKS & WORKING STATS</Text>
            
            {/* Preset Picker */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetScroll}>
              {BENCHMARK_PRESETS.map((preset) => (
                <TouchableOpacity
                  key={preset.category}
                  style={styles.presetBtn}
                  onPress={() => applyPreset(preset)}
                >
                  <Text style={styles.presetBtnText}>{preset.category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.benchmarksContainer}>
              {benchmarks.map((item, idx) => (
                <View key={item.id || idx} style={styles.benchmarkCard}>
                  <TextInput
                    style={styles.benchmarkNameInput}
                    placeholder="Lift / Exercise Name"
                    placeholderTextColor={COLORS.textMuted}
                    value={item.name}
                    onChangeText={(val) => updateBenchmarkName(idx, val)}
                  />
                  <TextInput
                    style={styles.benchmarkValInput}
                    placeholder="Working Weight / Stat"
                    placeholderTextColor={COLORS.textMuted}
                    value={item.value}
                    onChangeText={(val) => updateBenchmarkVal(idx, val)}
                  />
                </View>
              ))}
            </View>

            {/* Experience Level */}
            <Text style={styles.sectionHeader}>EXPERIENCE LEVEL</Text>
            <View style={styles.pillsRow}>
              {EXPERIENCE_OPTIONS.map((exp) => {
                const isSelected = experienceLevel === exp;
                return (
                  <TouchableOpacity
                    key={exp}
                    style={[styles.pill, isSelected && styles.pillActive]}
                    onPress={() => {
                      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                      setExperienceLevel(exp);
                    }}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                      {exp}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Training Modalities */}
            <Text style={styles.sectionHeader}>DISCIPLINES & MODALITIES</Text>
            <View style={styles.pillsRow}>
              {MODALITY_OPTIONS.map((m) => {
                const isSelected = primaryModalities.includes(m);
                return (
                  <TouchableOpacity
                    key={m}
                    style={[styles.pill, isSelected && styles.pillActive]}
                    onPress={() => toggleModality(m)}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                      {isSelected ? '✓ ' + m : m}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Preferred Spotting Style */}
            <Text style={styles.sectionHeader}>SPOTTING & GYM PREFERENCE</Text>
            <View style={styles.optionsList}>
              {SPOTTING_STYLES.map((style) => {
                const isSelected = spottingStyle === style;
                return (
                  <TouchableOpacity
                    key={style}
                    style={[styles.optionCard, isSelected && styles.optionCardActive]}
                    onPress={() => {
                      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                      setSpottingStyle(style);
                    }}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>
                      {style}
                    </Text>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Gym Energy Statement */}
            <Text style={styles.sectionHeader}>GYM VIBE / ENERGY</Text>
            <TextInput
              style={styles.singleInput}
              placeholder="e.g. Early mornings, aesthetic lifting, hype motivation"
              placeholderTextColor={COLORS.textMuted}
              value={gymEnergy}
              onChangeText={setGymEnergy}
            />

            {/* Save Button */}
            <TouchableOpacity style={styles.bottomSaveBtn} onPress={handleSave}>
              <Text style={styles.bottomSaveText}>Save Fitness Profile</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  coachBadgeSmall: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    marginLeft: 6,
  },
  coachBadgeSmallText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
  },
  coachFormBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    marginTop: 8,
  },
  subLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  singleLineInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0D14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  cancelBtn: {
    padding: 6,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  saveBtn: {
    padding: 6,
  },
  saveText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 15,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 50,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: 8,
  },
  changePhotoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  bioInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  singleInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 11,
    color: COLORS.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  presetScroll: {
    gap: 6,
    marginBottom: SPACING.sm,
  },
  presetBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  presetBtnText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  benchmarksContainer: {
    gap: 6,
  },
  benchmarkCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.md,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
  },
  benchmarkNameInput: {
    flex: 1.2,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 7,
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  benchmarkValInput: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 7,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: COLORS.primary,
  },
  pillText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  optionsList: {
    gap: 6,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  optionCardActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  radioCircleActive: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  bottomSaveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  bottomSaveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
