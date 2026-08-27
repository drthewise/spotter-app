import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Dumbbell } from 'lucide-react-native';
import { UserProfile } from '../types';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { GymBadge } from './GymBadge';
import { ReliabilityBadge } from './ReliabilityBadge';
import { ScheduleMatrix } from './ScheduleMatrix';
import { CURRENT_USER } from '../data/mockData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.68;

interface ProfileCardProps {
  profile: UserProfile;
  isTopCard?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const [photoIndex, setPhotoIndex] = useState(0);

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

      {/* Full-card left/right touch zones for cycling photos across top, middle, and bottom of card */}
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

      <LinearGradient
        colors={['transparent', 'rgba(9, 10, 15, 0.35)', 'rgba(9, 10, 15, 0.92)', '#090A0F']}
        locations={[0, 0.35, 0.72, 1.0]}
        style={styles.gradient}
        pointerEvents="none"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          pointerEvents="none"
        >
          <View style={styles.badgeRow}>
            <GymBadge
              brand={profile.primaryGym.brand}
              branchName={profile.primaryGym.branchName}
              isSameGym={isSameGym}
              visibilityTier={profile.privacy.gymVisibility}
            />
            <ReliabilityBadge
              score={profile.reliabilityScore}
              completedWorkouts={profile.completedWorkoutsCount}
            />
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.name}>
              {profile.name}, <Text style={styles.age}>{profile.age}</Text>
            </Text>
            <View style={styles.distanceBadge}>
              <MapPin size={12} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.distanceText}>
                {profile.privacy.distanceFuzzing ? profile.fuzzedDistanceText : profile.distanceMiles + ' mi'}
              </Text>
            </View>
          </View>

          <View style={styles.fitnessRow}>
            <View style={styles.splitBadge}>
              <Dumbbell size={13} color={COLORS.primary} style={{ marginRight: 5 }} />
              <Text style={styles.splitText}>{profile.workoutSplit}</Text>
            </View>
            <View style={styles.experienceBadge}>
              <Text style={styles.experienceText}>{profile.experienceLevel}</Text>
            </View>
          </View>

          <Text style={styles.bio}>
            {profile.bio}
          </Text>

          <View style={styles.tagContainer}>
            {profile.primaryModalities.map((mod) => (
              <View key={mod} style={styles.tag}>
                <Text style={styles.tagText}>{mod}</Text>
              </View>
            ))}
          </View>

          <View style={styles.vibeCard}>
            <View style={styles.vibeRow}>
              <Text style={styles.vibeLabel}>🎯 Spotting Style:</Text>
              <Text style={styles.vibeValue}>{profile.spottingStyle}</Text>
            </View>
            <View style={styles.vibeRow}>
              <Text style={styles.vibeLabel}>⚡ Gym Energy:</Text>
              <Text style={styles.vibeValue}>{profile.gymEnergy}</Text>
            </View>
          </View>

          <ScheduleMatrix
            userSchedule={CURRENT_USER.schedule}
            partnerSchedule={profile.schedule}
            isMasked={profile.privacy.scheduleVisibility === 'overlap_only'}
            overlapScore={88}
          />
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
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
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '75%',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    justifyContent: 'flex-end',
    zIndex: 3,
  },
  scrollContent: {
    paddingTop: 40,
    paddingBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  age: {
    fontSize: 22,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  distanceText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  fitnessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  splitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  splitText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  experienceBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  experienceText: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '600',
  },
  bio: {
    fontSize: 13,
    lineHeight: 18,
    color: '#E2E8F0',
    marginBottom: SPACING.sm,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  tagText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  vibeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm + 2,
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  vibeRow: {
    marginBottom: 4,
  },
  vibeLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 1,
  },
  vibeValue: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '500',
  },
});
