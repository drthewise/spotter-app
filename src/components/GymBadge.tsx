import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dumbbell } from 'lucide-react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { GymVisibilityTier } from '../types';

interface GymBadgeProps {
  brand: string;
  branchName?: string;
  isSameGym?: boolean;
  visibilityTier?: GymVisibilityTier;
  isMatched?: boolean;
}

export const GymBadge: React.FC<GymBadgeProps> = ({
  brand,
  branchName,
  isSameGym = true,
  visibilityTier = 'match_only',
  isMatched = false,
}) => {
  const displayTitle = React.useMemo(() => {
    if (visibilityTier === 'exact' || isMatched) {
      return branchName || brand;
    }
    if (visibilityTier === 'brand_only') {
      return brand + ' Member';
    }
    if (isSameGym) {
      return '🟢 Goes to your home gym';
    }
    return brand + ' Member';
  }, [visibilityTier, isMatched, branchName, brand, isSameGym]);

  return (
    <View style={[styles.container, isSameGym && styles.sameGymContainer]}>
      <Dumbbell size={14} color={isSameGym ? '#34D399' : COLORS.badgeGymText} style={styles.icon} />
      <Text style={[styles.text, isSameGym && styles.sameGymText]} numberOfLines={1}>
        {displayTitle}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    alignSelf: 'flex-start',
  },
  sameGymContainer: {
    backgroundColor: 'rgba(6, 78, 59, 0.85)',
    borderColor: 'rgba(52, 211, 153, 0.4)',
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.badgeGymText,
  },
  sameGymText: {
    color: '#34D399',
  },
});
