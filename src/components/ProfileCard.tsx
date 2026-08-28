import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Dumbbell, Info, ChevronUp, ShieldCheck } from 'lucide-react-native';
import { UserProfile } from '../types';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { ProfileDetailsModal } from './ProfileDetailsModal';
import { CURRENT_USER } from '../data/mockData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.68;

interface ProfileCardProps {
  profile: UserProfile;
  isTopCard?: boolean;
  onRequestSpot?: () => void;
  onConnect?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onRequestSpot,
  onConnect,
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const nextPhoto = () => {
    if (photoIndex < profile.photos.length - 1) {
      setPhotoIndex(photoIndex + 1);
    } else {
      setPhotoIndex(0);
    }
  };

  const prevPhoto = () => {
    if (photoIndex > 0) {
      setPhotoIndex(photoIndex - 1);
    } else {
      setPhotoIndex(profile.photos.length - 1);
    }
  };

  const isSameGym = profile.primaryGym.brand === CURRENT_USER.primaryGym.brand;
  const currentPhoto = profile.photos[photoIndex];
  const imageSource = typeof currentPhoto === 'string' ? { uri: currentPhoto } : currentPhoto;

  return (
    <View style={styles.card}>
      <Image source={imageSource} style={styles.image} resizeMode="cover" />

      {/* Full-Card Left/Right Photo Tap Zones */}
      <View style={styles.touchOverlay}>
        <TouchableOpacity
          style={styles.touchLeft}
          onPress={prevPhoto}
          activeOpacity={0.9}
        />
        <TouchableOpacity
          style={styles.touchRight}
          onPress={nextPhoto}
          activeOpacity={0.9}
        />
      </View>

      {/* Pagination Bar */}
      {profile.photos.length > 1 && (
        <View style={styles.pagination} pointerEvents="none">
          {profile.photos.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.pageDot,
                idx === photoIndex && styles.pageDotActive,
              ]}
            />
          ))}
        </View>
      )}

      {/* Clean, Minimal Bottom Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(9, 10, 15, 0.45)', 'rgba(9, 10, 15, 0.95)']}
        locations={[0, 0.4, 1.0]}
        style={styles.bottomGradient}
        pointerEvents="box-none"
      >
        <View style={styles.infoContainer} pointerEvents="box-none">
          {/* Top Row: Name, Age, Coach Badge + Expand Info Button */}
          <View style={styles.nameRow} pointerEvents="box-none">
            <View style={styles.nameCol} pointerEvents="none">
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.name}>
                  {profile.name}, <Text style={styles.age}>{profile.age}</Text>
                </Text>
                {profile.isCoach && profile.coachVerificationStatus === 'verified' && profile.coachModeEnabled !== false && (
                  <View style={styles.coachCardBadge}>
                    <Text style={styles.coachCardBadgeText}>🏅 COACH</Text>
                  </View>
                )}
              </View>
              {profile.isCoach && profile.coachModeEnabled !== false && profile.coachTitle && (
                <Text style={styles.coachSubtitle} numberOfLines={1}>
                  {profile.coachTitle}
                </Text>
              )}
            </View>

            {/* Expand Details Button */}
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => setDetailsVisible(true)}
              activeOpacity={0.8}
            >
              <Info size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
              <ChevronUp size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Second Row: Gym, Distance & Recurring Cadence Pill */}
          <View style={styles.pillRow} pointerEvents="none">
            <View style={[styles.gymPill, isSameGym && styles.sameGymPill]}>
              <View style={[styles.gymDot, isSameGym && styles.sameGymDot]} />
              <Text style={[styles.gymPillText, isSameGym && styles.sameGymPillText]}>
                {isSameGym ? `${profile.primaryGym.brand} (Same Gym)` : profile.primaryGym.brand}
              </Text>
            </View>

            {profile.cadenceCommitment && (
              <View style={styles.cadencePill}>
                <Text style={styles.cadencePillText}>🔄 {profile.cadenceCommitment}</Text>
              </View>
            )}

            <View style={styles.distancePill}>
              <MapPin size={11} color={COLORS.textSecondary} style={{ marginRight: 3 }} />
              <Text style={styles.distancePillText}>
                {profile.privacy.distanceFuzzing ? profile.fuzzedDistanceText : profile.distanceMiles + ' mi'}
              </Text>
            </View>
          </View>

          {/* Third Row: Split & Reliability Badges */}
          <View style={styles.statsPillRow} pointerEvents="none">
            <View style={styles.splitPill}>
              <Dumbbell size={12} color={COLORS.primary} style={{ marginRight: 4, flexShrink: 0 }} />
              <Text style={styles.splitPillText} numberOfLines={1} ellipsizeMode="tail">
                {profile.workoutSplit} • {profile.experienceLevel}
              </Text>
            </View>

            <View style={styles.reliabilityPill}>
              <ShieldCheck size={12} color="#FBBF24" style={{ marginRight: 4, flexShrink: 0 }} />
              <Text style={styles.reliabilityPillText}>{profile.reliabilityScore.toFixed(0)}%</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Expanded Profile Dossier Modal */}
      <ProfileDetailsModal
        visible={detailsVisible}
        profile={profile}
        onClose={() => setDetailsVisible(false)}
        onRequestSpot={onRequestSpot}
        onConnect={onConnect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  coachCardBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  coachCardBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  coachSubtitle: {
    color: '#FDE68A',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 1,
  },
  cadencePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  cadencePillText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    width: SCREEN_WIDTH - 24,
    height: CARD_HEIGHT,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.cardBackground,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  touchOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 2,
  },
  touchLeft: {
    flex: 1,
    height: '100%',
  },
  touchRight: {
    flex: 1,
    height: '100%',
  },
  pagination: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    flexDirection: 'row',
    zIndex: 10,
  },
  pageDot: {
    flex: 1,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    marginHorizontal: 3,
  },
  pageDotActive: {
    backgroundColor: '#FFFFFF',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '35%',
    justifyContent: 'flex-end',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    zIndex: 5,
  },
  infoContainer: {
    width: '100%',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  nameCol: {
    flex: 1,
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  age: {
    fontSize: 24,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 20,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  gymPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  sameGymPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  gymDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.textMuted,
    marginRight: 6,
  },
  sameGymDot: {
    backgroundColor: '#10B981',
  },
  gymPillText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  sameGymPillText: {
    color: '#34D399',
    fontWeight: '700',
  },
  distancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  distancePillText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  statsPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '100%',
  },
  splitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    flex: 1,
    minWidth: 0,
  },
  splitPillText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
  },
  reliabilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    flexShrink: 0,
  },
  reliabilityPillText: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '700',
  },
});
