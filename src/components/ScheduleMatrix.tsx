import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Clock, Zap } from 'lucide-react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { ScheduleDay, TimeSlot } from '../types';

interface ScheduleMatrixProps {
  userSchedule: ScheduleDay[];
  partnerSchedule?: ScheduleDay[];
  isMasked?: boolean;
  overlapScore?: number;
}

const DAYS: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS: { id: TimeSlot; label: string; time: string }[] = [
  { id: 'early_morning', label: 'Morning', time: '5–8 AM' },
  { id: 'midday', label: 'Midday', time: '11 AM–1 PM' },
  { id: 'evening', label: 'Evening', time: '5–8 PM' },
  { id: 'night', label: 'Night', time: '8 PM+' },
];

export const ScheduleMatrix: React.FC<ScheduleMatrixProps> = ({
  userSchedule,
  partnerSchedule,
  isMasked = false,
  overlapScore = 85,
}) => {
  if (isMasked) {
    return (
      <View style={styles.maskedContainer}>
        <View style={styles.overlapHeader}>
          <Zap size={15} color={COLORS.primary} />
          <Text style={styles.overlapHeaderText}>{overlapScore}% Schedule Compatibility</Text>
        </View>
        <Text style={styles.maskedSubtext}>
          ⚡ 3 overlapping workout windows (Mornings & Weekends). Exact calendar unlocks upon mutual match.
        </Text>
      </View>
    );
  }

  const hasSlot = (schedule: ScheduleDay[], day: string, slotId: TimeSlot) => {
    const dayObj = schedule.find((d) => d.day === day);
    return dayObj ? dayObj.slots.includes(slotId) : false;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Clock size={16} color={COLORS.textPrimary} style={{ marginRight: 6 }} />
        <Text style={styles.title}>Weekly Workout Availability</Text>
        {overlapScore > 0 && (
          <View style={styles.scorePill}>
            <Text style={styles.scorePillText}>{overlapScore}% Match</Text>
          </View>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matrixScroll}>
        <View>
          <View style={styles.row}>
            <View style={[styles.cell, styles.headerCell, { width: 65 }]}>
              <Text style={styles.slotHeaderText}>Slot</Text>
            </View>
            {DAYS.map((day) => (
              <View key={day} style={[styles.cell, styles.headerCell]}>
                <Text style={styles.dayHeaderText}>{day}</Text>
              </View>
            ))}
          </View>

          {TIME_SLOTS.map((slot) => (
            <View key={slot.id} style={styles.row}>
              <View style={[styles.cell, { width: 65, alignItems: 'flex-start' }]}>
                <Text style={styles.slotLabel}>{slot.label}</Text>
                <Text style={styles.slotTime}>{slot.time}</Text>
              </View>

              {DAYS.map((day) => {
                const userActive = hasSlot(userSchedule, day, slot.id);
                const partnerActive = partnerSchedule ? hasSlot(partnerSchedule, day, slot.id) : false;
                const isOverlap = userActive && partnerActive;

                let cellBg = 'rgba(255, 255, 255, 0.03)';
                let borderCol = 'rgba(255, 255, 255, 0.05)';
                let label = '';

                if (isOverlap) {
                  cellBg = 'rgba(16, 185, 129, 0.35)';
                  borderCol = COLORS.primary;
                  label = '⚡';
                } else if (userActive) {
                  cellBg = 'rgba(59, 130, 246, 0.25)';
                  borderCol = 'rgba(59, 130, 246, 0.4)';
                  label = '✓';
                }

                return (
                  <View
                    key={day}
                    style={[
                      styles.cell,
                      styles.slotCell,
                      { backgroundColor: cellBg, borderColor: borderCol },
                    ]}
                  >
                    <Text style={styles.cellLabel}>{label}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {partnerSchedule && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: 'rgba(16, 185, 129, 0.4)', borderColor: COLORS.primary }]} />
            <Text style={styles.legendText}>Shared Overlap</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: 'rgba(59, 130, 246, 0.3)', borderColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>Active Day</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  maskedContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginVertical: SPACING.xs,
  },
  overlapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  overlapHeaderText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 6,
  },
  maskedSubtext: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  scorePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  scorePillText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  matrixScroll: {
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cell: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  headerCell: {
    height: 22,
  },
  dayHeaderText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  slotHeaderText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  slotLabel: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  slotTime: {
    color: COLORS.textMuted,
    fontSize: 9,
  },
  slotCell: {
    borderRadius: 6,
    borderWidth: 1,
  },
  cellLabel: {
    fontSize: 11,
    color: COLORS.textPrimary,
  },
  legend: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 2,
    borderWidth: 1,
    marginRight: 6,
  },
  legendText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
});
