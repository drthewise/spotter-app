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
  Alert,
} from 'react-native';
import {
  Shield,
  Clock,
  Dumbbell,
  ShieldCheck,
  Check,
  Users,
  MapPin,
  Building2,
  ChevronRight,
  PauseCircle,
  PlayCircle,
  Trash2,
  AlertCircle,
  UserCheck,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { CURRENT_USER } from '../data/mockData';
import { ScheduleMatrix } from '../components/ScheduleMatrix';
import { GymPickerModal } from '../components/GymPickerModal';
import { DeleteAccountModal } from '../components/DeleteAccountModal';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { ScheduleDay, TimeSlot } from '../types';

export const ProfileScreen: React.FC = () => {
  const [ghostMode, setGhostMode] = useState(CURRENT_USER.privacy.ghostMode);
  const [showMen, setShowMen] = useState(true);
  const [showWomen, setShowWomen] = useState(true);
  const [distanceFuzzing, setDistanceFuzzing] = useState(CURRENT_USER.privacy.distanceFuzzing);
  const [gymTier, setGymTier] = useState(CURRENT_USER.privacy.gymVisibility);
  const [mySchedule, setMySchedule] = useState<ScheduleDay[]>(CURRENT_USER.schedule);
  const [myGym, setMyGym] = useState(CURRENT_USER.primaryGym);
  const [gymPickerVisible, setGymPickerVisible] = useState(false);
  const [isAccountPaused, setIsAccountPaused] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

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

  const handleSelectNewGym = (gym: { brand: string; branchName: string; neighborhood: string }) => {
    setMyGym(gym);
    CURRENT_USER.primaryGym = gym;
  };

  const handleTogglePause = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    const newPausedState = !isAccountPaused;
    setIsAccountPaused(newPausedState);

    Alert.alert(
      newPausedState ? '⏸️ Account Paused' : '▶️ Account Active',
      newPausedState
        ? 'Your profile is now hidden from Discovery and Beacon. Your matches, active chats, and lifting history are safely preserved.'
        : 'Welcome back! Your profile is now visible again to lifters in your area.'
    );
  };

  const handleConfirmAccountDelete = () => {
    console.log('Account deleted permanently for user:', CURRENT_USER.id);
  };

  const userPhotoSrc = typeof CURRENT_USER.photos[0] === 'string' ? { uri: CURRENT_USER.photos[0] } : CURRENT_USER.photos[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Fitness DNA & Account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Paused Account Alert Banner */}
        {isAccountPaused && (
          <View style={styles.pausedBanner}>
            <PauseCircle size={20} color="#FBBF24" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.pausedBannerTitle}>Account Is Currently Paused</Text>
              <Text style={styles.pausedBannerSub}>
                You are hidden from Discover & Beacon. Matches and chats remain intact.
              </Text>
            </View>
            <TouchableOpacity style={styles.resumeBtn} onPress={handleTogglePause}>
              <PlayCircle size={14} color="#000000" style={{ marginRight: 4 }} />
              <Text style={styles.resumeBtnText}>Resume</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* User Profile Card */}
        <View style={styles.userCard}>
          <Image source={userPhotoSrc} style={styles.avatar} />
          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{CURRENT_USER.name}, {CURRENT_USER.age}</Text>
              {isAccountPaused && (
                <View style={styles.pausedBadge}>
                  <Text style={styles.pausedBadgeText}>PAUSED</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.gymClickPill}
              onPress={() => setGymPickerVisible(true)}
              activeOpacity={0.7}
            >
              <MapPin size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={styles.gymClickText} numberOfLines={1}>{myGym.branchName}</Text>
              <ChevronRight size={12} color={COLORS.primary} style={{ marginLeft: 2 }} />
            </TouchableOpacity>
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

        {/* Primary Home Gym Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Building2 size={16} color={COLORS.primary} />
            <Text style={styles.sectionHeading}>PRIMARY HOME GYM</Text>
          </View>

          <TouchableOpacity
            style={styles.gymSelectorCard}
            onPress={() => setGymPickerVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.gymIconBadge}>
              <Building2 size={22} color={COLORS.primary} />
            </View>

            <View style={styles.gymCardContent}>
              <Text style={styles.gymCardTitle}>{myGym.branchName}</Text>
              <Text style={styles.gymCardSub}>{myGym.neighborhood}</Text>
            </View>

            <View style={styles.changeGymPill}>
              <Text style={styles.changeGymText}>Change</Text>
            </View>
          </TouchableOpacity>
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

        {/* Account Management & Danger Zone */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <AlertCircle size={16} color="#EF4444" />
            <Text style={[styles.sectionHeading, { color: '#EF4444' }]}>ACCOUNT CONTROLS</Text>
          </View>

          {/* Pause / Snooze Account Card */}
          <View style={styles.settingCard}>
            <View style={styles.settingTextCol}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.settingTitle}>Pause Account</Text>
                {isAccountPaused && (
                  <View style={styles.activePausePill}>
                    <Text style={styles.activePauseText}>Active</Text>
                  </View>
                )}
              </View>
              <Text style={styles.settingDesc}>
                Take a break from gym matching. Hides your profile from Discovery and Beacon without losing matches, chats, or history.
              </Text>
            </View>
            <Switch
              value={isAccountPaused}
              onValueChange={handleTogglePause}
              trackColor={{ false: '#334155', true: '#FBBF24' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Delete Account Button */}
          <TouchableOpacity
            style={styles.deleteAccountCard}
            onPress={() => setDeleteModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.deleteIconBadge}>
              <Trash2 size={20} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.deleteCardTitle}>Delete Account</Text>
              <Text style={styles.deleteCardSub}>
                Permanently erase your Fitness DNA profile, photos, matches, and workout data.
              </Text>
            </View>
            <ChevronRight size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Change Gym Modal */}
      <GymPickerModal
        visible={gymPickerVisible}
        currentGym={myGym}
        onClose={() => setGymPickerVisible(false)}
        onSelectGym={handleSelectNewGym}
      />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirmDelete={handleConfirmAccountDelete}
      />
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
  pausedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    marginBottom: SPACING.md,
  },
  pausedBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FBBF24',
  },
  pausedBannerSub: {
    fontSize: 11,
    color: '#FDE68A',
    marginTop: 2,
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBBF24',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    marginLeft: 8,
  },
  resumeBtnText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 11,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
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
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  pausedBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  pausedBadgeText: {
    color: '#FBBF24',
    fontSize: 9,
    fontWeight: '800',
  },
  gymClickPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
    marginTop: 3,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  gymClickText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
    maxWidth: 180,
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
  gymSelectorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  gymIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  gymCardContent: {
    flex: 1,
  },
  gymCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  gymCardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  changeGymPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  changeGymText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
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
    marginRight: 8,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  activePausePill: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  activePauseText: {
    color: '#FBBF24',
    fontSize: 9,
    fontWeight: '800',
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
  deleteAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginTop: 4,
  },
  deleteIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deleteCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  deleteCardSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
});
