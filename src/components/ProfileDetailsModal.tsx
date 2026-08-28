import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
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
  ChevronLeft,
  ChevronRight,
  Maximize2,
  CheckCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { UserProfile } from '../types';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { GymBadge } from './GymBadge';
import { ReliabilityBadge } from './ReliabilityBadge';
import { ScheduleMatrix } from './ScheduleMatrix';
import { ReportUserModal } from './ReportUserModal';
import { CURRENT_USER } from '../data/mockData';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const [fullscreenPhotoVisible, setFullscreenPhotoVisible] = useState(false);
  const [fullscreenPhotoIdx, setFullscreenPhotoIdx] = useState(0);

  const lightboxScrollRef = useRef<ScrollView>(null);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Single unified entrance animation
  useEffect(() => {
    if (visible) {
      translateY.setValue(SCREEN_HEIGHT);
      backdropOpacity.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Clean single exit animation without double slide
  const handleDismiss = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 3,
      onMoveShouldSetPanResponderCapture: (_, gestureState) => gestureState.dy > 3,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.4) {
          handleDismiss();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            bounciness: 4,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const isSameGym = profile.primaryGym.brand === CURRENT_USER.primaryGym.brand;
  const primaryAvatar = profile.photos[0];
  const avatarSource = typeof primaryAvatar === 'string' ? { uri: primaryAvatar } : primaryAvatar;
  const benchmarks = profile.strengthBenchmarks;

  const openFullscreen = (idx: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    setFullscreenPhotoIdx(idx);
    setFullscreenPhotoVisible(true);
    setTimeout(() => {
      lightboxScrollRef.current?.scrollTo({ x: idx * SCREEN_WIDTH, animated: false });
    }, 80);
  };

  const goToPhoto = (idx: number) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    const safeIdx = Math.max(0, Math.min(idx, profile.photos.length - 1));
    setFullscreenPhotoIdx(safeIdx);
    lightboxScrollRef.current?.scrollTo({ x: safeIdx * SCREEN_WIDTH, animated: true });
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="none" transparent={true}>
      <Animated.View style={[styles.overlay, { opacity: backdropOpacity }]}>
        {/* Backdrop tap to dismiss */}
        <TouchableWithoutFeedback onPress={handleDismiss}>
          <View style={styles.backdropTouchArea} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.sheetContainer, { transform: [{ translateY }] }]}>
          {/* Top Handle / Header Bar with PanResponder for Swipe Down */}
          <View style={styles.headerBar} {...panResponder.panHandlers}>
            <TouchableOpacity style={styles.closeBtn} onPress={handleDismiss}>
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
              <TouchableOpacity style={styles.closeRoundBtn} onPress={handleDismiss}>
                <X size={18} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header Info Card with Clean Static Avatar */}
            <View style={styles.topProfileRow}>
              <View style={styles.avatarContainer}>
                <Image source={avatarSource} style={styles.avatar} />
              </View>

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

            {/* Photos & Gym Fit Checks Gallery Reel */}
            {profile.photos.length > 0 && (
              <View style={styles.section}>
                <View style={styles.photoSectionHeader}>
                  <Text style={styles.sectionTitle}>PHOTOS & GYM FIT CHECKS ({profile.photos.length})</Text>
                  <Text style={styles.tapToExpandText}>Tap photo to expand</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoGalleryRow}>
                  {profile.photos.map((p, idx) => {
                    const src = typeof p === 'string' ? { uri: p } : p;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={styles.galleryCard}
                        onPress={() => openFullscreen(idx)}
                        activeOpacity={0.85}
                      >
                        <Image source={src} style={styles.galleryImage} />
                        <View style={styles.galleryExpandIcon}>
                          <Maximize2 size={12} color="#FFFFFF" />
                        </View>
                        <View style={styles.photoIndexTag}>
                          <Text style={styles.photoIndexTagText}>#{idx + 1}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

                        {/* Standing Partnership Cadence & Availability */}
            {profile.cadenceCommitment && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>STANDING PARTNERSHIP CADENCE</Text>
                <View style={styles.cadenceBox}>
                  <View style={styles.cadenceHeaderRow}>
                    <Text style={styles.cadenceTitle}>🔄 {profile.partnershipCadence || 'Consistent Weekly Partner'}</Text>
                    <View style={styles.streakBadgeDossier}>
                      <Text style={styles.streakBadgeDossierText}>🔥 94% Overlap</Text>
                    </View>
                  </View>
                  <Text style={styles.cadenceCommitmentText}>⏰ {profile.cadenceCommitment}</Text>
                  <Text style={styles.cadenceSub}>
                    Looking for a dedicated partner to hold each other accountable on regular compound days.
                  </Text>
                </View>
              </View>
            )}

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

            {/* Working Weights & Strength Benchmarks */}
            {benchmarks && benchmarks.benchmarks && benchmarks.benchmarks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>TRAINING BENCHMARKS & WORKING STATS</Text>
                <View style={styles.benchmarksGrid}>
                  {benchmarks.benchmarks.map((b) => (
                    <View key={b.id || b.name} style={styles.benchmarkBox}>
                      <Text style={styles.benchmarkLabel} numberOfLines={1}>{b.name.toUpperCase()}</Text>
                      <Text style={styles.benchmarkVal} numberOfLines={1}>{b.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Certified Coach & Trainer Credentials */}
            {profile.isCoach && (
              <View style={styles.section}>
                {profile.coachModeEnabled === false ? (
                  /* Coach Mode Paused / Personal Workout Mode */
                  <View style={styles.coachPausedCard}>
                    <View style={styles.coachDossierHeader}>
                      <View style={[styles.coachBadgeBig, { backgroundColor: '#475569' }]}>
                        <Text style={[styles.coachBadgeBigText, { color: '#FFFFFF' }]}>🏅 CREDENTIALED COACH</Text>
                      </View>
                      <View style={styles.pausedBadge}>
                        <Text style={styles.pausedBadgeText}>⚪ Personal Workout Mode</Text>
                      </View>
                    </View>
                    <Text style={styles.coachPausedText}>
                      {profile.name} is a certified {profile.accreditationBody || 'CSCS'} coach, but is currently in personal training mode (not actively taking clients).
                    </Text>
                  </View>
                ) : (
                  /* Coach Mode Active */
                  <View style={styles.coachDossierCard}>
                    <View style={styles.coachDossierHeader}>
                      <View style={styles.coachBadgeBig}>
                        <Text style={styles.coachBadgeBigText}>🏅 VERIFIED COACH</Text>
                      </View>
                      {profile.acceptingClients && (
                        <View style={styles.acceptingBadge}>
                          <Text style={styles.acceptingBadgeText}>✓ Taking Clients</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.coachDossierTitle}>{profile.coachTitle}</Text>
                    {profile.hourlyRate && (
                      <Text style={styles.coachRateText}>💰 {profile.hourlyRate}</Text>
                    )}

                    {/* Audited Credential Verification Stamp */}
                    {profile.coachVerificationStatus === 'verified' && (
                      <View style={styles.auditStampBox}>
                        <View style={styles.auditStampRow}>
                          <ShieldCheck size={14} color="#10B981" style={{ marginRight: 6 }} />
                          <Text style={styles.auditStampText}>
                            Verified {profile.accreditationBody} License #{profile.credentialIdNumber || 'AUDITED'}
                          </Text>
                        </View>
                        <View style={styles.auditStampRow}>
                          <CheckCircle size={13} color="#10B981" style={{ marginRight: 6 }} />
                          <Text style={styles.auditStampSubText}>Current Red Cross CPR / AED on file</Text>
                        </View>
                        {profile.liabilityInsuranceVerified && (
                          <View style={styles.auditStampRow}>
                            <CheckCircle size={13} color="#10B981" style={{ marginRight: 6 }} />
                            <Text style={styles.auditStampSubText}>Professional Trainer Liability Insurance verified</Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Certifications Row */}
                    {profile.certifications && (
                      <View style={styles.certRow}>
                        {profile.certifications.map((cert) => (
                          <View key={cert} style={styles.certPill}>
                            <Text style={styles.certPillText}>📜 {cert}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Coaching Specialties */}
                    {profile.coachingSpecialties && (
                      <View style={{ marginTop: 8 }}>
                        <Text style={styles.coachSpecialtyLabel}>SPECIALTIES & FORM CHECKS</Text>
                        <View style={styles.specialtyWrap}>
                          {profile.coachingSpecialties.map((s) => (
                            <View key={s} style={styles.specialtyPill}>
                              <Text style={styles.specialtyPillText}>🎯 {s}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}

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
                    handleDismiss();
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
                    handleDismiss();
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

          {/* Fullscreen Photo Lightbox with Horizontal Paging Swipe */}
          <Modal visible={fullscreenPhotoVisible} animationType="fade" transparent={false}>
            <SafeAreaView style={styles.fullscreenContainer}>
              {/* Top Controls */}
              <View style={styles.fullscreenHeader}>
                <TouchableOpacity onPress={() => setFullscreenPhotoVisible(false)} style={styles.fullscreenCloseBtn}>
                  <X size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.fullscreenCounter}>
                  {fullscreenPhotoIdx + 1} of {profile.photos.length}
                </Text>
                <View style={{ width: 40 }} />
              </View>

              {/* Native Paginated Horizontal Swipeable Photo Carousel */}
              <View style={styles.fullscreenMainPhotoArea}>
                <ScrollView
                  ref={lightboxScrollRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onMomentumScrollEnd={(e) => {
                    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                    setFullscreenPhotoIdx(idx);
                  }}
                  style={{ flex: 1 }}
                >
                  {profile.photos.map((p, idx) => {
                    const src = typeof p === 'string' ? { uri: p } : p;
                    return (
                      <View key={idx} style={styles.fullscreenSlide}>
                        <Image source={src} style={styles.fullscreenImage} resizeMode="contain" />
                      </View>
                    );
                  })}
                </ScrollView>

                {/* Left / Right Nav Touch Overlays */}
                {profile.photos.length > 1 && (
                  <>
                    {fullscreenPhotoIdx > 0 && (
                      <TouchableOpacity
                        style={styles.leftNavTouch}
                        onPress={() => goToPhoto(fullscreenPhotoIdx - 1)}
                      >
                        <View style={styles.navArrowCircle}>
                          <ChevronLeft size={24} color="#FFFFFF" />
                        </View>
                      </TouchableOpacity>
                    )}

                    {fullscreenPhotoIdx < profile.photos.length - 1 && (
                      <TouchableOpacity
                        style={styles.rightNavTouch}
                        onPress={() => goToPhoto(fullscreenPhotoIdx + 1)}
                      >
                        <View style={styles.navArrowCircle}>
                          <ChevronRight size={24} color="#FFFFFF" />
                        </View>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>

              {/* Bottom Thumbnail Strip */}
              <View style={styles.fullscreenThumbStrip}>
                {profile.photos.map((p, idx) => {
                  const src = typeof p === 'string' ? { uri: p } : p;
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => goToPhoto(idx)}
                      style={[
                        styles.fullscreenThumb,
                        fullscreenPhotoIdx === idx && styles.fullscreenThumbActive,
                      ]}
                    >
                      <Image source={src} style={styles.thumbImage} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </SafeAreaView>
          </Modal>

          {/* Report User Modal */}
          <ReportUserModal
            visible={reportModalVisible}
            user={profile}
            onClose={() => setReportModalVisible(false)}
            onReportSubmitted={() => {
              setReportModalVisible(false);
              handleDismiss();
            }}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  coachPausedCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pausedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  pausedBadgeText: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
  },
  coachPausedText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
  },
  auditStampBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm + 2,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    gap: 4,
  },
  auditStampRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  auditStampText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '800',
  },
  auditStampSubText: {
    color: '#A7F3D0',
    fontSize: 10,
    fontWeight: '600',
  },
  coachDossierCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  coachDossierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  coachBadgeBig: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  coachBadgeBigText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  acceptingBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  acceptingBadgeText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
  },
  coachDossierTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  coachRateText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  certRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  certPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
  },
  certPillText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '700',
  },
  coachSpecialtyLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  specialtyWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specialtyPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  specialtyPillText: {
    color: '#FDE68A',
    fontSize: 11,
    fontWeight: '600',
  },
  cadenceBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  cadenceHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cadenceTitle: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '800',
  },
  streakBadgeDossier: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  streakBadgeDossierText: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '800',
  },
  cadenceCommitmentText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  cadenceSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  backdropTouchArea: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    height: SCREEN_HEIGHT * 0.86,
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
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
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
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
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
  photoSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tapToExpandText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
  },
  photoGalleryRow: {
    gap: 10,
    paddingVertical: 4,
  },
  galleryCard: {
    width: 120,
    height: 160,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryExpandIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoIndexTag: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  photoIndexTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  statGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.lg,
    marginTop: SPACING.sm,
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
  benchmarksGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  benchmarkBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  benchmarkLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    marginBottom: 3,
  },
  benchmarkVal: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
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
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullscreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  fullscreenCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenCounter: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  fullscreenMainPhotoArea: {
    flex: 1,
    position: 'relative',
  },
  fullscreenSlide: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  leftNavTouch: {
    position: 'absolute',
    left: 10,
    top: '45%',
    padding: 10,
  },
  rightNavTouch: {
    position: 'absolute',
    right: 10,
    top: '45%',
    padding: 10,
  },
  navArrowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  fullscreenThumbStrip: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: SPACING.lg,
    backgroundColor: '#000000',
  },
  fullscreenThumb: {
    width: 50,
    height: 50,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  fullscreenThumbActive: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
});
