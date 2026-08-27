import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';

interface ReliabilityBadgeProps {
  score: number;
  completedWorkouts: number;
}

export const ReliabilityBadge: React.FC<ReliabilityBadgeProps> = ({ score, completedWorkouts }) => {
  return (
    <View style={styles.container}>
      <ShieldCheck size={13} color="#FBBF24" style={styles.icon} />
      <Text style={styles.scoreText}>{score.toFixed(0)}% Reliable</Text>
      <Text style={styles.divider}>•</Text>
      <Text style={styles.countText}>{completedWorkouts} completed</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(69, 26, 3, 0.75)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 5,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FBBF24',
  },
  divider: {
    color: '#D97706',
    marginHorizontal: 5,
    fontSize: 11,
  },
  countText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FDE68A',
  },
});
