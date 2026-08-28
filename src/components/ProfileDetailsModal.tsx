import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {
  X,
  MapPin,
  Dumbbell,
  ShieldCheck,
  Zap,
  Heart,
  ChevronDown,
  ShieldAlert,
} from 'lucide-react-native';
import { UserProfile } from '../types';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { GymBadge } from './GymBadge';
import { ReliabilityBadge } from './ReliabilityBadge';
import { ScheduleMatrix } from './ScheduleMatrix';
import { ReportUserModal } from './ReportUserModal';
import { CURRENT_USER } from '../data/mockData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ProfileDetailsModalProps {
  visible: boolean;
  profile: UserProfile;
  onClose: () => void;
  onRequestSpot?: () => void;
  onConnect?: () => void;
}

export const ProfileDetailsModal: React.FC<ProfileDetailsModalProps> = ({
  visible,
  profile,
  onClose,
  onRequestSpot,
  onConnect,
}) => {
  const [reportModalVisible, setReportModalVisible] = useState(false);

  const isSameGym = profile.primaryGym.brand === CURRENT_USER.primaryGym.brand;
  const avatarPhoto = profile.photos[1] || profile.photos[0];
  const avatarSource = typeof avatarPhoto === 'string' ? { uri: avatarPhoto } : avatarPhoto;

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Top Handle / Header Bar */}
          <View style={styles.headerBar}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <ChevronDown size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>

            <View style={styles.dragPill} />

            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={styles.reportBtn}
                onPress={() => setReportModalVisible(true)}
                activeOpacity={0.7}
              >
                <ShieldAlert size={18} color="#F87171" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeRoundBtn} onPress={onClose}>
                <X size={18} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header Info Card */}
            <View style={styles.topProfileRow}>
              <Image source={avatarSource} style={styles.avatar} />
              <View style={styles.topProfileInfo}>
                <Text style={styles.name}>
                  {profile.name}, <Text style={styles.age}>{profile.age}</Text>
                </Text>
                <View style={styles.distanceBadge}>
                  <MapPin size={13} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                  <Text style={styles.distanceText}>
                    {profile.privacy.distanceFuzzing ? profile.fuzzedDistanceText : profile.distanceMiles + ' miles away'}
                  </Text>
                </View>
                <View style={styles.gymRow}>
                  <GymBadge
                    brand={profile.primaryGym.brand}
                    branchName={profile.primaryGym.branchName}
                    isSameGym={isSameGym}
                    visibilityTier={profile.privacy.gymVisibility}
                  />
                </View>
              </View>
            </View>

            {/* Reliability & Experience Badges */}
            <View style={styles.statGrid}>
              <View style={styles.statBox}>
                <ShieldCheck size={18} color="#FBBF24" style={{ marginBottom: 4 }} />
                <Text style={styles.statBoxTitle}>{profile.reliabilityScore}% Reliable</Text>
                <Text style={styles.statBoxSub}>{profile.completedWorkoutsCount} workouts done</Text>
              </View>
              <View style={styles.statBox}>
                <Dumbbell size={18} color={COLORS.primary} style={{ marginBottom: 4 }} />
                <Text style={styles.statBoxTitle}>{profile.workoutSplit}</Text>
                <Text style={styles.statBoxSub}>{profile.experienceLevel}</Text>
              </View>
            </View>

            {/* About / Bio */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ABOUT MY TRAINING</Text>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>

            {/* Modalities Tags */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>FOCUS AREAS & MODALITIES</Text>
              <View style={styles.tagWrap}>
                {profile.primaryModalities.map((mod) => (
                  <View key={mod} style={styles.tag}>
                    <Text style={styles.tagText}>{mod}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Spotting & Energy Vibe */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>GYM VIBE & SPOTTING STYLE</Text>
              <View style={styles.vibeCard}>
                <View style={styles.vibeBlock}>
                  <Text style={styles.vibeLabel}>🎯 Spotting Style</Text>
                  <Text style={styles.vibeVal}>{profile.spottingStyle}</Text>
                </View>
                <View style={[styles.vibeBlock, { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 10, marginTop: 10 }]}>
                  <Text style={styles.vibeLabel}>⚡ Gym Energy</Text>
                  <Text style={styles.vibeVal}>{profile.gymEnergy}</Text>
                </View>
              </View>
            </View>

            {/* Weekly Schedule Overlap */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SCHEDULE OVERLAP</Text>
              <ScheduleMatrix
                userSchedule={CURRENT_USER.schedule}
                partnerSchedule={profile.schedule}
                isMasked={profile.privacy.scheduleVisibility === 'overlap_only'}
                overlapScore={88}
                editable={false}
              />
            </View>

            {/* Modal Quick Actions */}
            <View style={styles.actionRow}>
              {onRequestSpot && (
                <TouchableOpacity
                  style={styles.superSpotActionBtn}
                  onPress={() => {
                    onClose();
                    onRequestSpot();
                  }}
                >
                  <Zap size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.superSpotActionText}>Propose Workout</Text>
                </TouchableOpacity>
              )}

              {onConnect && (
                <TouchableOpacity
                  style={styles.connectActionBtn}
                  onPress={() => {
                    onClose();
                    onConnect();
                  }}
                >
                  <Heart size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.connectActionText}>Connect</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Report & Block Lifter Button */}
            <TouchableOpacity
              style={styles.reportRowBtn}
              onPress={() => setReportModalVisible(true)}
              activeOpacity={0.7}
            >
              <ShieldAlert size={15} color="#F87171" style={{ marginRight: 6 }} />
              <Text style={styles.reportRowText}>Report or Block {profile.name}</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Report User Modal */}
          <ReportUserModal
            visible={reportModalVisible}
            user={profile}
            onClose={() => setReportModalVisible(false)}
            onReportSubmitted={() => {
              setReportModalVisible(false);
              onClose();
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    height: SCREEN_HEIGHT * 0.84,
    backgroundColor: '#11141F',
    borderTopLeftRadius: BORDER_RADIUS.xl + 4,
    borderTopRightRadius: BORDER_RADIUS.xl + 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  closeBtn: {
    padding: 6,
  },
  dragPill: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reportBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  closeRoundBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  topProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  topProfileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  age: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 6,
  },
  distanceText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  gymRow: {
    flexDirection: 'row',
  },
  statGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
  },
  statBoxTitle: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  statBoxSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#E2E8F0',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  tagText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  vibeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  vibeBlock: {},
  vibeLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 3,
  },
  vibeVal: {
    color: COLORS.textPrimary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
  },
  superSpotActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentPurple,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
  },
  superSpotActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  connectActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
  },
  connectActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  reportRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  reportRowText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '700',
  },
});
