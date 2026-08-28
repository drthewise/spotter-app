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
  Switch,
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
  ChevronDown,
  Camera,
  Plus,
  Trash2,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { UserProfile, ExperienceLevel, Modality, WorkoutSplit, BenchmarkItem } from '../types';
import { PROFILE_IMAGES } from '../constants/images';
import { CoachVerificationModal } from './CoachVerificationModal';

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

const QUICK_WEIGHT_PRESETS = [
  { label: '45 lbs (Bar)', val: 45 },
  { label: '95 lbs', val: 95 },
  { label: '135 lbs (1 Plate)', val: 135 },
  { label: '185 lbs', val: 185 },
  { label: '225 lbs (2 Plates)', val: 225 },
  { label: '275 lbs', val: 275 },
  { label: '315 lbs (3 Plates)', val: 315 },
  { label: '365 lbs', val: 365 },
  { label: '405 lbs (4 Plates)', val: 405 },
  { label: '495 lbs (5 Plates)', val: 495 },
  { label: '585 lbs (6 Plates)', val: 585 },
];

const WEIGHT_NUMBERS: number[] = [];
for (let w = 5; w <= 650; w += 5) {
  WEIGHT_NUMBERS.push(w);
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  user,
  onClose,
  onSave,
}) => {
  const [photos, setPhotos] = useState<(string | any)[]>(user.photos && user.photos.length > 0 ? [...user.photos] : [PROFILE_IMAGES.anthony_full, PROFILE_IMAGES.anthony_face]);
  const [photoPickerVisible, setPhotoPickerVisible] = useState(false);
  const [bio, setBio] = useState(user.bio);
  const [workoutSplit, setWorkoutSplit] = useState<WorkoutSplit>(user.workoutSplit);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(user.experienceLevel);
  const [primaryModalities, setPrimaryModalities] = useState<Modality[]>(user.primaryModalities);
  const [spottingStyle, setSpottingStyle] = useState(user.spottingStyle);
  const [gymEnergy, setGymEnergy] = useState(user.gymEnergy);
  
  // Cadence State
  const [cadence, setCadence] = useState<string>(user.partnershipCadence || 'Consistent Weekly Partner (3-4x/week)');
  const [cadenceCommitmentText, setCadenceCommitmentText] = useState<string>(user.cadenceCommitment || 'Mon / Wed / Fri @ 6:30 AM');

  // Coach State
  const [isCoach, setIsCoach] = useState<boolean>(user.isCoach ?? false);
  const [coachModeActive, setCoachModeActive] = useState<boolean>(user.coachModeEnabled ?? true);
  const [verificationStatus, setVerificationStatus] = useState<string>(user.coachVerificationStatus || 'none');
  const [verificationModalVisible, setVerificationModalVisible] = useState(false);
  const [coachTitle, setCoachTitle] = useState<string>(user.coachTitle ?? '');
  const [hourlyRate, setHourlyRate] = useState<string>(user.hourlyRate ?? '');

  // Custom Benchmarks
  const initialBenchmarks: BenchmarkItem[] = user.strengthBenchmarks?.benchmarks && user.strengthBenchmarks.benchmarks.length > 0
    ? user.strengthBenchmarks.benchmarks
    : [
        { id: 'b1', name: 'Barbell Hip Thrust / Bench', value: '225 lbs (3x8)' },
        { id: 'b2', name: 'Squat / Leg Press', value: '315 lbs (3x8)' },
        { id: 'b3', name: 'Deadlift / RDL', value: '405 lbs (1RM)' },
        { id: 'b4', name: 'Dumbbell Working Weight', value: '90 lb DBs (3x8)' },
      ];

  const [benchmarks, setBenchmarks] = useState<BenchmarkItem[]>(initialBenchmarks);
  
  // Weight & Number Dialer State
  const [dialerVisible, setDialerVisible] = useState(false);
  const [editingBenchmarkIdx, setEditingBenchmarkIdx] = useState<number>(0);
  const [selectedWeightNumber, setSelectedWeightNumber] = useState<number>(225);
  const [selectedUnit, setSelectedUnit] = useState<'lbs' | 'kg' | 'reps' | 's'>('lbs');
  const [selectedScheme, setSelectedScheme] = useState<string>('(3x8)');

  const setAsPrimaryPhoto = (index: number) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    if (index === 0) return;
    const newPhotos = [...photos];
    const [selected] = newPhotos.splice(index, 1);
    newPhotos.unshift(selected);
    setPhotos(newPhotos);
  };

  const removePhoto = (index: number) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    if (photos.length <= 1) {
      Alert.alert('Cannot Remove', 'You must have at least one profile photo.');
      return;
    }
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const setPrimaryFromPicker = (imageSrc: any) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    const existingIdx = photos.findIndex((p) => p === imageSrc);
    if (existingIdx >= 0) {
      setAsPrimaryPhoto(existingIdx);
    } else {
      setPhotos((prev) => [imageSrc, ...prev]);
    }
    setPhotoPickerVisible(false);
  };

  const applyPreset = (preset: typeof BENCHMARK_PRESETS[0]) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    const newItems = preset.items.map((item, idx) => ({
      id: 'b_' + Date.now() + '_' + idx,
      name: item.name,
      value: item.value,
    }));
    setBenchmarks(newItems);
  };

  const openWeightDialer = (idx: number, item: BenchmarkItem) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    setEditingBenchmarkIdx(idx);

    const matchNum = item.value.match(/\d+/);
    if (matchNum) {
      setSelectedWeightNumber(parseInt(matchNum[0], 10));
    } else {
      setSelectedWeightNumber(225);
    }

    if (item.value.includes('kg')) setSelectedUnit('kg');
    else if (item.value.includes('rep')) setSelectedUnit('reps');
    else if (item.value.includes('s') && !item.value.includes('lbs')) setSelectedUnit('s');
    else setSelectedUnit('lbs');

    if (item.value.includes('3x8')) setSelectedScheme('(3x8)');
    else if (item.value.includes('3x10')) setSelectedScheme('(3x10)');
    else if (item.value.includes('5x5')) setSelectedScheme('(5x5)');
    else if (item.value.includes('1RM')) setSelectedScheme('(1RM)');
    else if (item.value.includes('reps')) setSelectedScheme('reps');
    else setSelectedScheme('');

    setDialerVisible(true);
  };

  const applyWeightFromDialer = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    let formattedVal = '';
    if (selectedUnit === 'reps') {
      formattedVal = `${selectedWeightNumber} reps`;
    } else if (selectedUnit === 's') {
      formattedVal = `${selectedWeightNumber}s hold`;
    } else {
      formattedVal = `${selectedWeightNumber} ${selectedUnit} ${selectedScheme}`.trim();
    }

    const updated = [...benchmarks];
    updated[editingBenchmarkIdx].value = formattedVal;
    setBenchmarks(updated);
    setDialerVisible(false);
  };

  const updateBenchmarkName = (idx: number, name: string) => {
    const updated = [...benchmarks];
    updated[idx].name = name;
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
      photos,
      bio,
      workoutSplit,
      experienceLevel,
      primaryModalities,
      partnershipCadence: cadence as any,
      cadenceCommitment: cadenceCommitmentText.trim(),
      isCoach,
      coachModeEnabled: coachModeActive,
      coachVerificationStatus: verificationStatus as any,
      coachTitle: coachTitle.trim(),
      hourlyRate: hourlyRate.trim(),
      spottingStyle,
      gymEnergy,
      strengthBenchmarks: {
        benchmarks,
      },
    });
    onClose();
  };

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
            {/* Profile Avatar Header with Interactive Change */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                onPress={() => setPhotoPickerVisible(true)}
                activeOpacity={0.85}
                style={styles.avatarTouchWrapper}
              >
                <Image
                  source={typeof photos[0] === 'string' ? { uri: photos[0] } : photos[0]}
                  style={styles.avatar}
                />
                <View style={styles.avatarCameraBadge}>
                  <Camera size={14} color="#FFFFFF" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.changePhotoPill}
                onPress={() => setPhotoPickerVisible(true)}
                activeOpacity={0.8}
              >
                <Camera size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                <Text style={styles.changePhotoText}>Change Primary Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Photos & Gym Fit Checks Gallery Reel */}
            <View style={styles.section}>
              <View style={styles.photoSectionHeader}>
                <Text style={styles.sectionHeader}>PHOTOS & GYM FIT CHECKS ({photos.length})</Text>
                <TouchableOpacity onPress={() => setPhotoPickerVisible(true)}>
                  <Text style={styles.addPhotoText}>+ Add Photo</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryRow}>
                {photos.map((p, idx) => {
                  const isPrimary = idx === 0;
                  const src = typeof p === 'string' ? { uri: p } : p;
                  return (
                    <View key={idx} style={[styles.galleryCard, isPrimary && styles.galleryCardPrimary]}>
                      <Image source={src} style={styles.galleryImage} />
                      
                      <View style={[styles.photoTag, isPrimary && styles.photoTagPrimary]}>
                        <Text style={styles.photoTagText}>{isPrimary ? '★ Primary' : `#${idx + 1}`}</Text>
                      </View>

                      <View style={styles.cardActionsOverlay}>
                        {!isPrimary && (
                          <TouchableOpacity
                            style={styles.setPrimaryBtn}
                            onPress={() => setAsPrimaryPhoto(idx)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.setPrimaryBtnText}>Make Primary</Text>
                          </TouchableOpacity>
                        )}
                        {photos.length > 1 && (
                          <TouchableOpacity
                            style={styles.deletePhotoBtn}
                            onPress={() => removePhoto(idx)}
                            activeOpacity={0.8}
                          >
                            <Trash2 size={13} color="#FFFFFF" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })}

                <TouchableOpacity
                  style={styles.addPhotoCard}
                  onPress={() => setPhotoPickerVisible(true)}
                  activeOpacity={0.8}
                >
                  <View style={styles.addPhotoIconCircle}>
                    <Plus size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.addPhotoCardText}>Add Fit Check</Text>
                </TouchableOpacity>
              </ScrollView>
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

            {/* Working Weights & Benchmarks with Scrollable Weight Dialer */}
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
                  <TouchableOpacity
                    style={styles.benchmarkSelectorBtn}
                    onPress={() => openWeightDialer(idx, item)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.benchmarkSelectorVal} numberOfLines={1}>
                      {item.value || 'Set Weight'}
                    </Text>
                    <ChevronDown size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
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

            {/* Partnership Cadence & Availability */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PARTNERSHIP CADENCE COMMITMENT</Text>
              <View style={styles.optionWrap}>
                {[
                  'Consistent Weekly Partner (3-4x/week)',
                  'Weekly Anchor Partner (1-2x/week)',
                  'Drop-In / As-Needed Spots',
                  'Flexible / Open to Both',
                ].map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.optionPill, cadence === c && styles.optionPillActive]}
                    onPress={() => {
                      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                      setCadence(c);
                    }}
                  >
                    <Text style={[styles.optionPillText, cadence === c && styles.optionPillTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.subLabel, { marginTop: 10 }]}>STANDING DAYS & TIME COMMITMENT</Text>
              <TextInput
                style={styles.singleLineInput}
                value={cadenceCommitmentText}
                onChangeText={setCadenceCommitmentText}
                placeholder="e.g. Mon / Wed / Fri @ 6:30 AM"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            {/* Certified Coach & Trainer Toggle */}
            <View style={styles.section}>
              <View style={styles.toggleCard}>
                <View style={styles.toggleTextCol}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.toggleTitle}>Certified Coach / Personal Trainer</Text>
                    <View style={styles.coachBadgeSmall}>
                      <Text style={styles.coachBadgeSmallText}>PRO</Text>
                    </View>
                  </View>
                  <Text style={styles.toggleSub}>Display verified coaching credentials and form check clinics</Text>
                </View>
                <Switch
                  value={isCoach}
                  onValueChange={(val) => {
                    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
                    setIsCoach(val);
                  }}
                  trackColor={{ false: '#334155', true: '#F59E0B' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {isCoach && (
                <View style={styles.coachFormBox}>
                  {/* Coach Mode Active / Paused Switch */}
                  <View style={styles.coachModeToggleRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.coachModeTitle}>
                        {coachModeActive ? '🟢 Coach Mode: ACTIVE' : '⚪ Coach Mode: PAUSED'}
                      </Text>
                      <Text style={styles.coachModeSub}>
                        {coachModeActive ? 'Showing verified badge & taking client inquiries' : 'Browsing as regular lifter for personal workouts'}
                      </Text>
                    </View>
                    <Switch
                      value={coachModeActive}
                      onValueChange={(val) => {
                        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
                        setCoachModeActive(val);
                      }}
                      trackColor={{ false: '#334155', true: '#F59E0B' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>

                  {/* Verification Status Banner */}
                  <View style={styles.verificationStatusBanner}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={styles.verificationStatusLabel}>CREDENTIAL STATUS</Text>
                      <View style={[
                        styles.statusTag,
                        verificationStatus === 'verified' && styles.statusTagVerified,
                        verificationStatus === 'pending' && styles.statusTagPending,
                      ]}>
                        <Text style={[
                          styles.statusTagText,
                          verificationStatus === 'verified' && styles.statusTagTextVerified,
                          verificationStatus === 'pending' && styles.statusTagTextPending,
                        ]}>
                          {verificationStatus === 'verified' ? '🛡️ Verified Active' : verificationStatus === 'pending' ? '⏳ Under Review' : '⚠️ Unverified'}
                        </Text>
                      </View>
                    </View>

                    {verificationStatus !== 'verified' && (
                      <TouchableOpacity
                        style={styles.submitDocBtn}
                        onPress={() => setVerificationModalVisible(true)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.submitDocBtnText}>
                          {verificationStatus === 'pending' ? 'Update Uploaded Documents' : '📜 Submit Credentials & Certs'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <Text style={[styles.subLabel, { marginTop: 10 }]}>COACH TITLE & SPECIALTIES</Text>
                  <TextInput
                    style={styles.singleLineInput}
                    value={coachTitle}
                    onChangeText={setCoachTitle}
                    placeholder="e.g. CSCS Strength Coach & Barbell Specialist"
                    placeholderTextColor={COLORS.textMuted}
                  />

                  <Text style={[styles.subLabel, { marginTop: 10 }]}>RATES & CLINIC OFFERINGS</Text>
                  <TextInput
                    style={styles.singleLineInput}
                    value={hourlyRate}
                    onChangeText={setHourlyRate}
                    placeholder="e.g. $45 / 30-min Form Check or Free Spot"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              )}
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

        {/* 1. Scrollable Number & Weight Selector Dial Modal */}
        <Modal visible={dialerVisible} transparent animationType="slide">
          <View style={styles.dialerOverlay}>
            <TouchableOpacity
              style={styles.dialerBackdropTouch}
              onPress={() => setDialerVisible(false)}
              activeOpacity={1}
            />
            <View style={styles.dialerSheet}>
              <View style={styles.dialerDragPill} />
              <View style={styles.dialerHeader}>
                <View>
                  <Text style={styles.dialerTitle}>Select Working Weight & Reps</Text>
                  <Text style={styles.dialerSub}>
                    {benchmarks[editingBenchmarkIdx]?.name || 'Lift Benchmark'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setDialerVisible(false)} style={styles.dialerCloseBtn}>
                  <X size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Big Formatted Display */}
              <View style={styles.dialerDisplayCard}>
                <Text style={styles.dialerDisplayValue}>
                  {selectedUnit === 'reps'
                    ? `${selectedWeightNumber} reps`
                    : selectedUnit === 's'
                    ? `${selectedWeightNumber}s hold`
                    : `${selectedWeightNumber} ${selectedUnit} ${selectedScheme}`.trim()}
                </Text>
                <Text style={styles.dialerDisplaySub}>Live Benchmark Preview</Text>
              </View>

              {/* Unit Selector: lbs vs kg vs reps vs sec */}
              <View style={styles.unitSelectorRow}>
                {(['lbs', 'kg', 'reps', 's'] as const).map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[styles.unitBtn, selectedUnit === unit && styles.unitBtnActive]}
                    onPress={() => {
                      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                      setSelectedUnit(unit);
                    }}
                  >
                    <Text style={[styles.unitBtnText, selectedUnit === unit && styles.unitBtnTextActive]}>
                      {unit.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Scrollable Horizontal Number Wheel / Ruler */}
              <Text style={styles.dialerSectionLabel}>SCROLL TO SELECT WEIGHT / REPS</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.numberWheelContent}
              >
                {WEIGHT_NUMBERS.map((num) => {
                  const isSelected = selectedWeightNumber === num;
                  return (
                    <TouchableOpacity
                      key={num}
                      style={[styles.numberCell, isSelected && styles.numberCellSelected]}
                      onPress={() => {
                        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                        setSelectedWeightNumber(num);
                      }}
                    >
                      <Text style={[styles.numberCellText, isSelected && styles.numberCellTextSelected]}>
                        {num}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Quick Jump Barbell Presets */}
              <Text style={styles.dialerSectionLabel}>POPULAR BARBELL & DB PRESETS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetJumpRow}>
                {QUICK_WEIGHT_PRESETS.map((p) => (
                  <TouchableOpacity
                    key={p.label}
                    style={[styles.presetJumpBtn, selectedWeightNumber === p.val && styles.presetJumpBtnActive]}
                    onPress={() => {
                      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                      setSelectedWeightNumber(p.val);
                    }}
                  >
                    <Text style={[styles.presetJumpText, selectedWeightNumber === p.val && styles.presetJumpTextActive]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Working Scheme (3x8, 5x5, 1RM, 3x10) */}
              {selectedUnit !== 'reps' && selectedUnit !== 's' && (
                <>
                  <Text style={styles.dialerSectionLabel}>SET & REP SCHEME</Text>
                  <View style={styles.schemeRow}>
                    {['(3x8)', '(3x10)', '(5x5)', '(1RM)', '(3x12)', ''].map((scheme) => (
                      <TouchableOpacity
                        key={scheme || 'None'}
                        style={[styles.schemeBtn, selectedScheme === scheme && styles.schemeBtnActive]}
                        onPress={() => {
                          try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                          setSelectedScheme(scheme);
                        }}
                      >
                        <Text style={[styles.schemeBtnText, selectedScheme === scheme && styles.schemeBtnTextActive]}>
                          {scheme || 'Weight Only'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Apply Button */}
              <TouchableOpacity style={styles.applyWeightBtn} onPress={applyWeightFromDialer}>
                <Check size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.applyWeightBtnText}>Apply to {benchmarks[editingBenchmarkIdx]?.name || 'Lift'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 2. Interactive Photo Selection & Preset Library Modal */}
        <Modal visible={photoPickerVisible} transparent animationType="slide">
          <View style={styles.pickerOverlay}>
            <TouchableOpacity
              style={styles.pickerBackdropTouch}
              onPress={() => setPhotoPickerVisible(false)}
              activeOpacity={1}
            />
            <View style={styles.pickerSheet}>
              <View style={styles.pickerDragPill} />
              <View style={styles.pickerHeader}>
                <View>
                  <Text style={styles.pickerTitle}>Choose Profile & Fit Check Photos</Text>
                  <Text style={styles.pickerSub}>Select from gym presets or tap to set as primary</Text>
                </View>
                <TouchableOpacity onPress={() => setPhotoPickerVisible(false)} style={styles.pickerCloseBtn}>
                  <X size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pickerGrid}>
                {Object.entries(PROFILE_IMAGES).map(([key, img]) => (
                  <TouchableOpacity
                    key={key}
                    style={styles.pickerGridItem}
                    onPress={() => setPrimaryFromPicker(img)}
                    activeOpacity={0.85}
                  >
                    <Image source={img} style={styles.pickerGridImg} />
                    <View style={styles.pickerSelectOverlay}>
                      <Text style={styles.pickerSelectText}>Select</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* 3. Coach Documentation Submission Modal */}
        <CoachVerificationModal
          visible={verificationModalVisible}
          onClose={() => setVerificationModalVisible(false)}
          onSubmitted={(data) => {
            setVerificationStatus('pending');
            try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) {}
          }}
        />
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
  cancelBtn: {
    padding: 6,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarTouchWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#11141F',
  },
  changePhotoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    marginTop: 10,
  },
  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: SPACING.xs + 2,
    marginTop: SPACING.xs,
  },
  photoSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  addPhotoText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  galleryRow: {
    gap: 12,
    paddingVertical: 4,
  },
  galleryCard: {
    width: 120,
    height: 165,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  galleryCardPrimary: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  photoTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  photoTagPrimary: {
    backgroundColor: COLORS.primary,
  },
  photoTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  cardActionsOverlay: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  setPrimaryBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  setPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  deletePhotoBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoCard: {
    width: 110,
    height: 165,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.sm,
  },
  addPhotoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  addPhotoCardText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  bioInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: SPACING.lg,
    minHeight: 70,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.lg,
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
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  presetScroll: {
    gap: 8,
    marginBottom: SPACING.sm,
    paddingVertical: 2,
  },
  presetBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  presetBtnText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  benchmarksContainer: {
    gap: 8,
    marginBottom: SPACING.lg,
  },
  benchmarkCard: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  benchmarkNameInput: {
    flex: 1.2,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  benchmarkSelectorBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  benchmarkSelectorVal: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  optionWrap: {
    gap: 6,
    marginBottom: SPACING.sm,
  },
  optionPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  optionPillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: COLORS.primary,
  },
  optionPillText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  optionPillTextActive: {
    color: '#34D399',
    fontWeight: '700',
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
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  toggleTextCol: {
    flex: 1,
    marginRight: 10,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  toggleSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
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
  coachModeToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  coachModeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  coachModeSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  verificationStatusBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  verificationStatusLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  statusTag: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  statusTagPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  statusTagVerified: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusTagText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '800',
  },
  statusTagTextPending: {
    color: '#FBBF24',
  },
  statusTagTextVerified: {
    color: '#34D399',
  },
  submitDocBtn: {
    backgroundColor: '#F59E0B',
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: 4,
  },
  submitDocBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '800',
  },
  optionsList: {
    gap: 8,
    marginBottom: SPACING.lg,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  optionCardActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: COLORS.primary,
  },
  optionText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  radioCircleActive: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  singleInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: SPACING.xl,
  },
  bottomSaveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: 40,
  },
  bottomSaveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  dialerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  dialerBackdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  dialerSheet: {
    backgroundColor: '#11141F',
    borderTopLeftRadius: BORDER_RADIUS.xl + 4,
    borderTopRightRadius: BORDER_RADIUS.xl + 4,
    maxHeight: '90%',
    padding: SPACING.xl,
    paddingTop: 10,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  dialerDragPill: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  dialerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  dialerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  dialerSub: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  dialerCloseBtn: {
    padding: 6,
  },
  dialerDisplayCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  dialerDisplayValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  dialerDisplaySub: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  unitSelectorRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    padding: 3,
    gap: 4,
    marginBottom: SPACING.md,
  },
  unitBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  unitBtnActive: {
    backgroundColor: COLORS.primary,
  },
  unitBtnText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  unitBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  dialerSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 4,
  },
  numberWheelContent: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: SPACING.md,
  },
  numberCell: {
    width: 60,
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  numberCellSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  numberCellText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  numberCellTextSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  presetJumpRow: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: SPACING.md,
  },
  presetJumpBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  presetJumpBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderColor: COLORS.primary,
  },
  presetJumpText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  presetJumpTextActive: {
    color: '#34D399',
    fontWeight: '800',
  },
  schemeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.lg,
  },
  schemeBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  schemeBtnActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderColor: COLORS.primary,
  },
  schemeBtnText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  schemeBtnTextActive: {
    color: '#34D399',
    fontWeight: '800',
  },
  applyWeightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: 4,
  },
  applyWeightBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  pickerBackdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  pickerSheet: {
    backgroundColor: '#11141F',
    borderTopLeftRadius: BORDER_RADIUS.xl + 4,
    borderTopRightRadius: BORDER_RADIUS.xl + 4,
    maxHeight: '85%',
    padding: SPACING.xl,
    paddingTop: 10,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerDragPill: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  pickerSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  pickerCloseBtn: {
    padding: 6,
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 20,
  },
  pickerGridItem: {
    width: '31%',
    height: 140,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  pickerGridImg: {
    width: '100%',
    height: '100%',
  },
  pickerSelectOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 4,
    alignItems: 'center',
  },
  pickerSelectText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
