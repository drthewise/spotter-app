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
  EyeOff,
  MapPin,
  Dumbbell,
  Clock,
  Settings,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react-native';
import { CURRENT_USER } from '../data/mockData';
import { ScheduleMatrix } from '../components/ScheduleMatrix';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';

export const ProfileScreen: React.FC = () => {
  const [ghostMode, setGhostMode] = useState(CURRENT_USER.privacy.ghostMode);
  const [womenOnly, setWomenOnly] = useState(CURRENT_USER.privacy.womenOnlyMode);
  const [distanceFuzzing, setDistanceFuzzing] = useState(CURRENT_USER.privacy.distanceFuzzing);
  const [gymTier, setGymTier] = useState(CURRENT_USER.privacy.gymVisibility);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Fitness DNA & Privacy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.userCard}>
          <Image source={{ uri: CURRENT_USER.photos[0] }} style={styles.avatar} />
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
              <Text style={styles.settingTitle}>Women-Only Discovery Mode</Text>
              <Text style={styles.settingDesc}>
                Only discover and be visible to verified female workout partners.
              </Text>
            </View>
            <Switch
              value={womenOnly}
              onValueChange={setWomenOnly}
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

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Clock size={16} color={COLORS.primary} />
            <Text style={styles.sectionHeading}>MY WEEKLY SCHEDULE MATRIX</Text>
          </View>
          <ScheduleMatrix userSchedule={CURRENT_USER.schedule} />
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
    marginRight: 10,
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
    lineHeight: 16,
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
