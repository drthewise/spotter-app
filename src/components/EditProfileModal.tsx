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
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { UserProfile, ExperienceLevel, Modality, WorkoutSplit } from '../types';

interface EditProfileModalProps {
  visible: boolean;
  user: UserProfile;
  onClose: () => void;
  onSave: (updatedUser: Partial<UserProfile>) => void;
}

const SPLIT_OPTIONS: WorkoutSplit[] = [
  'Push / Pull / Legs (PPL)',
  'Upper / Lower',
  'Full Body',
  'Bro Split',
  '5/3/1 Strength',
  'Custom Split',
];

const EXPERIENCE_OPTIONS: ExperienceLevel[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Elite Athlete',
];

const MODALITY_OPTIONS: Modality[] = [
  'Powerlifting',
  'Bodybuilding',
  'CrossFit',
  'HYROX',
  'Calisthenics',
  'Olympic Lifting',
  'Running / Cardio',
  'General Fitness',
];

const SPOTTING_STYLES = [
  'Lift-off only, touch only on failure',
  'Hands hovering near bar (guided spot)',
  'Assisted forced reps on last set',
  'Form check & audio hype motivation',
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
  
  // Strength Benchmarks
  const [bench, setBench] = useState(user.strengthBenchmarks?.benchWorkingWeight || '225 lbs (3x8)');
  const [squat, setSquat] = useState(user.strengthBenchmarks?.squatWorkingWeight || '315 lbs');
  const [deadlift, setDeadlift] = useState(user.strengthBenchmarks?.deadliftWorkingWeight || '405 lbs');
  const [dumbbell, setDumbbell] = useState(user.strengthBenchmarks?.dumbbellPress || '90 lb DBs');

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
        benchWorkingWeight: bench,
        squatWorkingWeight: squat,
        deadliftWorkingWeight: deadlift,
        dumbbellPress: dumbbell,
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
              placeholder="Describe your training goals, favorite compounds, or what you want in a spotter..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              value={bio}
              onChangeText={setBio}
            />

            {/* Strength Benchmarks ("Lifting DNA") */}
            <Text style={styles.sectionHeader}>WORKING WEIGHTS & BENCHMARKS</Text>
            <View style={styles.strengthCard}>
              <View style={styles.strengthRow}>
                <View style={styles.strengthCol}>
                  <Text style={styles.strengthLabel}>Flat Barbell Bench</Text>
                  <TextInput
                    style={styles.strengthInput}
                    placeholder="e.g. 225 lbs (3x8)"
                    placeholderTextColor={COLORS.textMuted}
                    value={bench}
                    onChangeText={setBench}
                  />
                </View>
                <View style={styles.strengthCol}>
                  <Text style={styles.strengthLabel}>Barbell Squat</Text>
                  <TextInput
                    style={styles.strengthInput}
                    placeholder="e.g. 315 lbs"
                    placeholderTextColor={COLORS.textMuted}
                    value={squat}
                    onChangeText={setSquat}
                  />
                </View>
              </View>

              <View style={styles.strengthRow}>
                <View style={styles.strengthCol}>
                  <Text style={styles.strengthLabel}>Barbell Deadlift</Text>
                  <TextInput
                    style={styles.strengthInput}
                    placeholder="e.g. 405 lbs"
                    placeholderTextColor={COLORS.textMuted}
                    value={deadlift}
                    onChangeText={setDeadlift}
                  />
                </View>
                <View style={styles.strengthCol}>
                  <Text style={styles.strengthLabel}>Incline DB Press</Text>
                  <TextInput
                    style={styles.strengthInput}
                    placeholder="e.g. 90 lb DBs"
                    placeholderTextColor={COLORS.textMuted}
                    value={dumbbell}
                    onChangeText={setDumbbell}
                  />
                </View>
              </View>
            </View>

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
            <Text style={styles.sectionHeader}>MODALITIES & DISCIPLINES</Text>
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
            <Text style={styles.sectionHeader}>SPOTTING PREFERENCE</Text>
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
              placeholder="e.g. Headphones on, locked in, high intensity"
              placeholderTextColor={COLORS.textMuted}
              value={gymEnergy}
              onChangeText={setGymEnergy}
            />

            {/* Save Button */}
            <TouchableOpacity style={styles.bottomSaveBtn} onPress={handleSave}>
              <Text style={styles.bottomSaveText}>Save Profile Changes</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  strengthCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  strengthRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  strengthCol: {
    flex: 1,
  },
  strengthLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  strengthInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: 8,
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
