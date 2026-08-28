import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import {
  Shield,
  Clock,
  Dumbbell,
  ShieldCheck,
  Check,
  Users,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { CURRENT_USER } from '../data/mockData';
import { ScheduleMatrix } from '../components/ScheduleMatrix';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { ScheduleDay, TimeSlot } from '../types';

export const ProfileScreen: React.FC = () => {
  const [ghostMode, setGhostMode] = useState(CURRENT_USER.privacy.ghostMode);
  const [showMen, setShowMen] = useState(true);
  const [showWomen, setShowWomen] = useState(true);
  const [distanceFuzzing, setDistanceFuzzing] = useState(CURRENT_USER.privacy.distanceFuzzing);
  const [gymTier, setGymTier] = useState(CURRENT_USER.privacy.gymVisibility);
  const [mySchedule, setMySchedule] = useState<ScheduleDay[]>(CURRENT_USER.schedule);

  const toggleMen = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    if (showMen && !showWomen) setShowWomen(true);
    setShowMen(!showMen);
  };

  const toggleWomen = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    if (showWomen && !showMen) setShowMen(true);
    setShowWomen(!showWomen);
  };

  const handleToggleSlot = (day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun', slotId: TimeSlot) => {
    setMySchedule((prev) => {
      const existingDay = prev.find((d) => d.day === day);
      if (existingDay) {
        const has = existingDay.slots.includes(slotId);
        const newSlots = has
          ? existingDay.slots.filter((s) => s !== slotId)
          : [...existingDay.slots, slotId];
        return prev.map((d) => (d.day === day ? { ...d, slots: newSlots } : d));
      } else {
        return [...prev, { day, slots: [slotId] }];
      }
    });
  };

  const userPhotoSrc = typeof CURRENT_USER.photos[0] === 'string' ? { uri: CURRENT_USER.photos[0] } : CURRENT_USER.photos[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Fitness DNA & Privacy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <Image source={userPhotoSrc} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{CURRENT_USER.name}, {CURRENT_USER.age}</Text>
            <Text style={styles.gymName}>📍 {CURRENT_USER.primaryGym.branchName}</Text>
            <View style={styles.statsRow}>
              <View style={styles.statPill}>
                <ShieldCheck size={12} color="#FBBF24" />
                <Text style={styles.statText}>{CURRENT_USER.reliabilityScore}% Reliability</Text>
              </View>
              <View style={styles.statPill}>
                <Dumbbell size={12} color={COLORS.primary} />
                <Text style={styles.statText}>{CURRENT_USER.completedWorkoutsCount} Workouts</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Weekly Schedule Availability Matrix */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Clock size={16} color={COLORS.primary} />
            <Text style={styles.sectionHeading}>MY WEEKLY WORKOUT AVAILABILITY</Text>
          </View>
          <ScheduleMatrix
            userSchedule={mySchedule}
            editable={true}
            onToggleSlot={handleToggleSlot}
          />
        </View>

        {/* Training Partner Gender Preference Filter */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Users size={16} color={COLORS.primary} />
            <Text style={styles.sectionHeading}>TRAINING PARTNER PREFERENCES</Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>I'm Looking to Train With</Text>
              <Text style={styles.settingDesc}>
                Select the lifters you want to discover in your feed:
              </Text>
              <View style={styles.genderCheckboxRow}>
                {/* Men Checkbox */}
                <TouchableOpacity
                  style={[styles.genderCheckbox, showMen && styles.genderCheckboxActive]}
                  onPress={toggleMen}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkCircle, showMen && styles.checkCircleActive]}>
                    {showMen && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                  <Text style={[styles.genderText, showMen && styles.genderTextActive]}>Men Only</Text>
                </TouchableOpacity>

                {/* Women Checkbox */}
                <TouchableOpacity
                  style={[styles.genderCheckbox, showWomen && styles.genderCheckboxActive]}
                  onPress={toggleWomen}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkCircle, showWomen && styles.checkCircleActive]}>
                    {showWomen && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                  <Text style={[styles.genderText, showWomen && styles.genderTextActive]}>Women Only</Text>
                </TouchableOpacity>

                {/* Everyone Checkbox */}
                <TouchableOpacity
                  style={[styles.genderCheckbox, showMen && showWomen && styles.genderCheckboxActive]}
                  onPress={() => {
                    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                    setShowMen(true);
                    setShowWomen(true);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkCircle, showMen && showWomen && styles.checkCircleActive]}>
                    {showMen && showWomen && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                  <Text style={[styles.genderText, showMen && showWomen && styles.genderTextActive]}>Everyone</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Privacy & Anti-Doxxing Controls */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Shield size={16} color={COLORS.primary} />
            <Text style={styles.sectionHeading}>PRIVACY & ANTI-DOXXING CONTROLS</Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Ghost / Stealth Mode</Text>
              <Text style={styles.settingDesc}>
                Hide your profile from public discovery. You are ONLY visible to people you swipe right on first.
              </Text>
            </View>
            <Switch
              value={ghostMode}
              onValueChange={setGhostMode}
              trackColor={{ false: '#334155', true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Distance Jitter & Fuzzing</Text>
              <Text style={styles.settingDesc}>
                Prevents trilateration. Shows general ranges (e.g. under 2 miles) instead of exact distances.
              </Text>
            </View>
            <Switch
              value={distanceFuzzing}
              onValueChange={setDistanceFuzzing}
              trackColor={{ false: '#334155', true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Public Gym Visibility</Text>
              <Text style={styles.settingDesc}>Control how specific your gym appears to strangers on swipe cards.</Text>
              <View style={styles.tierPillsRow}>
                {[
                  { id: 'match_only', label: 'Match-Only (Recommended)' },
                  { id: 'brand_only', label: 'Brand Only' },
                  { id: 'exact', label: 'Exact Branch' },
                ].map((tier) => (
                  <TouchableOpacity
                    key={tier.id}
                    style={[styles.tierPill, gymTier === tier.id && styles.tierPillActive]}
                    onPress={() => setGymTier(tier.id as any)}
                  >
                    <Text style={[styles.tierPillText, gymTier === tier.id && styles.tierPillTextActive]}>
                      {tier.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  gymName: {
    fontSize: 12,
    color: COLORS.badgeGymText,
    marginTop: 2,
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  statText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  settingTextCol: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  settingDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 3,
    marginBottom: 8,
    lineHeight: 16,
  },
  genderCheckboxRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  genderCheckbox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  genderCheckboxActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: COLORS.primary,
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  checkCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  genderTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  tierPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tierPill: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tierPillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: COLORS.primary,
  },
  tierPillText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tierPillTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
