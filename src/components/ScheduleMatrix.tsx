import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Clock, Zap, Check, Plus, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { ScheduleDay, TimeSlot } from '../types';

interface ScheduleMatrixProps {
  userSchedule: ScheduleDay[];
  partnerSchedule?: ScheduleDay[];
  isMasked?: boolean;
  overlapScore?: number;
  editable?: boolean;
  onToggleSlot?: (day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun', slotId: TimeSlot) => void;
}

const DAYS: ('Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun')[] = [
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
  'Sun',
];

const TIME_SLOTS: { id: TimeSlot; label: string; time: string }[] = [
  { id: 'early_morning', label: 'Morning', time: '5–8 AM' },
  { id: 'midday', label: 'Midday', time: '11 AM–1 PM' },
  { id: 'evening', label: 'Evening', time: '5–8 PM' },
  { id: 'night', label: 'Night', time: '8 PM+' },
];

export const ScheduleMatrix: React.FC<ScheduleMatrixProps> = ({
  userSchedule: initialUserSchedule,
  partnerSchedule,
  isMasked = false,
  overlapScore = 85,
  editable = true,
  onToggleSlot,
}) => {
  const [localSchedule, setLocalSchedule] = useState<ScheduleDay[]>(initialUserSchedule);

  // Sync with prop updates if any
  React.useEffect(() => {
    setLocalSchedule(initialUserSchedule);
  }, [initialUserSchedule]);

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

  const currentSchedule = onToggleSlot ? initialUserSchedule : localSchedule;

  const hasSlot = (schedule: ScheduleDay[], day: string, slotId: TimeSlot) => {
    const dayObj = schedule.find((d) => d.day === day);
    return dayObj ? dayObj.slots.includes(slotId) : false;
  };

  const handleToggle = (day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun', slotId: TimeSlot) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    if (onToggleSlot) {
      onToggleSlot(day, slotId);
      return;
    }

    if (editable) {
      setLocalSchedule((prev) => {
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
    }
  };

  const setPreset = (type: 'morning' | 'evening' | 'clear') => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    if (type === 'clear') {
      const cleared = DAYS.map((d) => ({ day: d, slots: [] as TimeSlot[] }));
      setLocalSchedule(cleared);
      return;
    }

    if (type === 'morning') {
      const morning = DAYS.map((d) => ({
        day: d,
        slots: d === 'Sat' || d === 'Sun' ? (['midday'] as TimeSlot[]) : (['early_morning'] as TimeSlot[]),
      }));
      setLocalSchedule(morning);
      return;
    }

    if (type === 'evening') {
      const evening = DAYS.map((d) => ({
        day: d,
        slots: d === 'Sat' || d === 'Sun' ? (['midday'] as TimeSlot[]) : (['evening'] as TimeSlot[]),
      }));
      setLocalSchedule(evening);
      return;
    }
  };

  // Calculate total active slots count
  const totalActiveSlots = currentSchedule.reduce((acc, d) => acc + d.slots.length, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Clock size={16} color={COLORS.textPrimary} style={{ marginRight: 6 }} />
        <Text style={styles.title}>Weekly Workout Availability</Text>
        {overlapScore > 0 && !editable && (
          <View style={styles.scorePill}>
            <Text style={styles.scorePillText}>{overlapScore}% Match</Text>
          </View>
        )}
      </View>

      {editable && (
        <View style={styles.helperRow}>
          <Text style={styles.helperText}>
            Tap any cell to toggle your workout availability ({totalActiveSlots} active windows):
          </Text>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.matrixScroll}>
        <View>
          {/* Header Row: Days */}
          <View style={styles.row}>
            <View style={[styles.cell, styles.headerCell, { width: 70 }]}>
              <Text style={styles.slotHeaderText}>TIME</Text>
            </View>
            {DAYS.map((day) => (
              <View key={day} style={[styles.cell, styles.headerCell]}>
                <Text style={styles.dayHeaderText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Time Slot Rows */}
          {TIME_SLOTS.map((slot) => (
            <View key={slot.id} style={styles.row}>
              <View style={[styles.cell, { width: 70, alignItems: 'flex-start' }]}>
                <Text style={styles.slotLabel}>{slot.label}</Text>
                <Text style={styles.slotTime}>{slot.time}</Text>
              </View>

              {DAYS.map((day) => {
                const userActive = hasSlot(currentSchedule, day, slot.id);
                const partnerActive = partnerSchedule ? hasSlot(partnerSchedule, day, slot.id) : false;
                const isOverlap = userActive && partnerActive;

                let cellBg = 'rgba(255, 255, 255, 0.03)';
                let borderCol = 'rgba(255, 255, 255, 0.08)';
                let icon = null;

                if (isOverlap) {
                  cellBg = 'rgba(16, 185, 129, 0.35)';
                  borderCol = COLORS.primary;
                  icon = <Zap size={14} color="#34D399" />;
                } else if (userActive) {
                  cellBg = 'rgba(16, 185, 129, 0.22)';
                  borderCol = 'rgba(16, 185, 129, 0.45)';
                  icon = <Check size={14} color={COLORS.primary} strokeWidth={3} />;
                } else if (partnerActive) {
                  cellBg = 'rgba(59, 130, 246, 0.2)';
                  borderCol = 'rgba(59, 130, 246, 0.4)';
                  icon = <Text style={styles.partnerDot}>•</Text>;
                }

                return (
                  <TouchableOpacity
                    key={day}
                    activeOpacity={0.7}
                    onPress={() => handleToggle(day, slot.id)}
                    style={[
                      styles.cell,
                      styles.slotCell,
                      { backgroundColor: cellBg, borderColor: borderCol },
                    ]}
                  >
                    {icon}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Preset Quick Actions when editable */}
      {editable && (
        <View style={styles.presetRow}>
          <Text style={styles.presetLabel}>Quick Presets:</Text>
          <TouchableOpacity style={styles.presetBtn} onPress={() => setPreset('morning')}>
            <Text style={styles.presetBtnText}>🌅 Mornings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.presetBtn} onPress={() => setPreset('evening')}>
            <Text style={styles.presetBtnText}>🌙 Evenings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.presetBtn, styles.clearBtn]} onPress={() => setPreset('clear')}>
            <RotateCcw size={11} color={COLORS.textMuted} style={{ marginRight: 3 }} />
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {partnerSchedule && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: 'rgba(16, 185, 129, 0.4)', borderColor: COLORS.primary }]} />
            <Text style={styles.legendText}>Shared Overlap ⚡</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: 'rgba(16, 185, 129, 0.22)', borderColor: COLORS.primary }]} />
            <Text style={styles.legendText}>Your Availability ✓</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: 'rgba(59, 130, 246, 0.2)', borderColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>Partner Availability</Text>
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
    marginBottom: SPACING.xs,
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
  helperRow: {
    marginBottom: SPACING.sm,
  },
  helperText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  matrixScroll: {
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cell: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  headerCell: {
    height: 22,
  },
  dayHeaderText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  slotHeaderText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
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
    borderRadius: BORDER_RADIUS.sm + 2,
    borderWidth: 1,
  },
  partnerDot: {
    color: '#60A5FA',
    fontSize: 18,
    fontWeight: '900',
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  presetLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginRight: 4,
  },
  presetBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  presetBtnText: {
    color: COLORS.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  clearBtnText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendBox: {
    width: 10,
    height: 10,
    borderRadius: 2,
    borderWidth: 1,
    marginRight: 5,
  },
  legendText: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
});
