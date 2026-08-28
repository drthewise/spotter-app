import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  Zap,
  X,
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { UserProfile } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface SpotProposalDetails {
  day: string;
  time: string;
  split: string;
  note: string;
  isRecurring?: boolean;
  recurringDays?: string[];
}

interface RequestSpotModalProps {
  visible: boolean;
  profile: UserProfile | null;
  onClose: () => void;
  onSubmit: (details: SpotProposalDetails) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const SPLIT_CHOICES = [
  'Push / Chest Day',
  'Pull / Back & Biceps',
  'Legs / Quads & Glutes',
  'Heavy Compounds (Squat/Bench)',
  'HYROX / Conditioning',
  'Full Body Hypertrophy',
];

const TIME_PRESETS = ['6:00 AM', '7:30 AM', '12:00 PM', '5:30 PM', '6:30 PM', '7:30 PM'];

export const RequestSpotModal: React.FC<RequestSpotModalProps> = ({
  visible,
  profile,
  onClose,
  onSubmit,
}) => {
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(7); // 7 = August (0-indexed)
  const [selectedDayNum, setSelectedDayNum] = useState(28); // Tomorrow (Aug 28)
  const [formattedDateText, setFormattedDateText] = useState('Friday, Aug 28');
  const [showCalendarGrid, setShowCalendarGrid] = useState(false);

  // Mode state: One-Time Session vs Standing Recurring Partner
  const [proposalType, setProposalType] = useState<'single' | 'recurring'>('single');
  const [recurringDays, setRecurringDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);

  // Time state
  const [selectedTime, setSelectedTime] = useState('6:00 PM');
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customHour, setCustomHour] = useState('6');
  const [customMinute, setCustomMinute] = useState('00');
  const [customAmPm, setCustomAmPm] = useState<'AM' | 'PM'>('PM');

  const [selectedSplit, setSelectedSplit] = useState('Push / Chest Day');
  const [note, setNote] = useState('');

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

  if (!profile || !visible) return null;

  // Calendar logic
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  const handleSelectDate = (dayNum: number) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    setSelectedDayNum(dayNum);
    const dateObj = new Date(currentYear, currentMonth, dayNum);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[dateObj.getDay()];
    const monthShort = MONTH_NAMES[currentMonth].substring(0, 3);
    setFormattedDateText(`${dayName}, ${monthShort} ${dayNum}`);
  };

  const handleQuickPresetDate = (label: string, dayNum: number) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    setSelectedDayNum(dayNum);
    setCurrentMonth(7); // August
    setFormattedDateText(label);
  };

  const handlePrevMonth = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const toggleRecurringDay = (day: string) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    if (recurringDays.includes(day)) {
      if (recurringDays.length > 1) {
        setRecurringDays(recurringDays.filter((d) => d !== day));
      }
    } else {
      setRecurringDays([...recurringDays, day]);
    }
  };

  const applyCustomTime = (h: string, m: string, ap: 'AM' | 'PM') => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    setCustomHour(h);
    setCustomMinute(m);
    setCustomAmPm(ap);
    setSelectedTime(`${h}:${m} ${ap}`);
  };

  const handleSend = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch (e) {}
    onSubmit({
      day: proposalType === 'recurring' ? recurringDays.join(' / ') + ' (Standing)' : formattedDateText,
      time: selectedTime,
      split: selectedSplit,
      note: note.trim(),
      isRecurring: proposalType === 'recurring',
      recurringDays: proposalType === 'recurring' ? recurringDays : undefined,
    });
    handleDismiss();
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: backdropOpacity }]}>
        {/* Backdrop tap to dismiss */}
        <TouchableWithoutFeedback onPress={handleDismiss}>
          <View style={styles.backdropTouchArea} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          {/* Top Handle / Header with PanResponder for Swipe Down */}
          <View style={styles.header} {...panResponder.panHandlers}>
            <View style={styles.dragPill} />
            <View style={styles.headerContentRow}>
              <View style={styles.headerLeft}>
                <View style={styles.superSpotIcon}>
                  <Zap size={18} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.title}>Propose a Workout Session</Text>
                  <Text style={styles.subtitle}>Direct spot & training invite to {profile.name}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn}>
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Partnership Type Segmented Switch */}
            <View style={styles.proposalTypeRow}>
              <TouchableOpacity
                style={[styles.typeBtn, proposalType === 'single' && styles.typeBtnActive]}
                onPress={() => {
                  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                  setProposalType('single');
                }}
              >
                <Zap size={14} color={proposalType === 'single' ? '#FFFFFF' : COLORS.textMuted} style={{ marginRight: 4 }} />
                <Text style={[styles.typeBtnText, proposalType === 'single' && styles.typeBtnTextActive]}>
                  One-Time Session
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeBtn, proposalType === 'recurring' && styles.typeBtnActiveRecurring]}
                onPress={() => {
                  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                  setProposalType('recurring');
                }}
              >
                <Text style={[styles.typeBtnText, proposalType === 'recurring' && styles.typeBtnTextActiveRecurring]}>
                  🔄 Standing Partner (Weekly)
                </Text>
              </TouchableOpacity>
            </View>

            {proposalType === 'recurring' ? (
              /* Recurring Partnership Days Selector */
              <View style={styles.recurringSection}>
                <Text style={styles.sectionTitle}>SELECT RECURRING WORKOUT DAYS</Text>
                <View style={styles.pillRow}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                    const isSelected = recurringDays.includes(day);
                    return (
                      <TouchableOpacity
                        key={day}
                        style={[styles.pill, isSelected && styles.pillActiveRecurring]}
                        onPress={() => toggleRecurringDay(day)}
                      >
                        <Text style={[styles.pillText, isSelected && styles.pillTextActiveRecurring]}>
                          {isSelected ? '✓ ' + day : day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <View style={styles.recurringSummaryBox}>
                  <Text style={styles.recurringSummaryTitle}>
                    🔥 {recurringDays.length}x / Week Standing Commitment
                  </Text>
                  <Text style={styles.recurringSummarySub}>
                    Establishes a weekly consistency streak with {profile.name} at {profile.primaryGym.branchName}.
                  </Text>
                </View>
              </View>
            ) : (
              /* One-Time Date Picker */
              <>
                <View style={styles.sectionHeaderRow}>
                  <CalendarIcon size={15} color={COLORS.accentPurple} />
                  <Text style={styles.sectionTitle}>WHEN ARE YOU TRAINING?</Text>
                  <TouchableOpacity
                    style={styles.expandCalendarToggle}
                    onPress={() => {
                      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                      setShowCalendarGrid(!showCalendarGrid);
                    }}
                  >
                    <Text style={styles.expandCalendarText}>
                      {showCalendarGrid ? 'Hide Calendar' : '📅 Pick Date'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Quick Date Presets */}
                <View style={styles.pillRow}>
                  <TouchableOpacity
                    style={[styles.pill, formattedDateText.includes('Aug 27') && styles.pillActive]}
                    onPress={() => handleQuickPresetDate('Today, Aug 27', 27)}
                  >
                    <Text style={[styles.pillText, formattedDateText.includes('Aug 27') && styles.pillTextActive]}>
                      Today
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.pill, formattedDateText.includes('Aug 28') && styles.pillActive]}
                    onPress={() => handleQuickPresetDate('Tomorrow, Aug 28', 28)}
                  >
                    <Text style={[styles.pillText, formattedDateText.includes('Aug 28') && styles.pillTextActive]}>
                      Tomorrow
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.pill, formattedDateText.includes('Aug 29') && styles.pillActive]}
                    onPress={() => handleQuickPresetDate('Friday, Aug 29', 29)}
                  >
                    <Text style={[styles.pillText, formattedDateText.includes('Aug 29') && styles.pillTextActive]}>
                      This Friday
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.pill, formattedDateText.includes('Aug 30') && styles.pillActive]}
                    onPress={() => handleQuickPresetDate('Saturday, Aug 30', 30)}
                  >
                    <Text style={[styles.pillText, formattedDateText.includes('Aug 30') && styles.pillTextActive]}>
                      Saturday
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Expandable Interactive Calendar Grid */}
                {showCalendarGrid && (
                  <View style={styles.calendarContainer}>
                    <View style={styles.calendarHeader}>
                      <TouchableOpacity onPress={handlePrevMonth} style={styles.monthNavBtn}>
                        <ChevronLeft size={18} color={COLORS.textPrimary} />
                      </TouchableOpacity>
                      <Text style={styles.monthTitle}>
                        {MONTH_NAMES[currentMonth]} {currentYear}
                      </Text>
                      <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavBtn}>
                        <ChevronRight size={18} color={COLORS.textPrimary} />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.daysRow}>
                      {DAYS_OF_WEEK.map((d, i) => (
                        <Text key={i} style={styles.dayOfWeekText}>{d}</Text>
                      ))}
                    </View>

                    <View style={styles.daysGrid}>
                      {Array.from({ length: firstDayIndex }).map((_, i) => (
                        <View key={`empty_${i}`} style={styles.emptyDayCell} />
                      ))}

                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const isSelected = selectedDayNum === dayNum;
                        const isToday = currentMonth === 7 && dayNum === 27;

                        return (
                          <TouchableOpacity
                            key={dayNum}
                            style={[
                              styles.dayCell,
                              isSelected && styles.dayCellSelected,
                              isToday && !isSelected && styles.dayCellToday,
                            ]}
                            onPress={() => handleSelectDate(dayNum)}
                          >
                            <Text
                              style={[
                                styles.dayCellText,
                                isSelected && styles.dayCellTextSelected,
                                isToday && !isSelected && styles.dayCellTextToday,
                              ]}
                            >
                              {dayNum}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                <View style={styles.selectedDateBanner}>
                  <CalendarIcon size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.selectedDateText}>Selected: {formattedDateText}</Text>
                </View>
              </>
            )}

            {/* Target Time Window */}
            <View style={[styles.sectionHeaderRow, { marginTop: SPACING.md }]}>
              <Clock size={15} color={COLORS.accentPurple} />
              <Text style={styles.sectionTitle}>TARGET TIME WINDOW</Text>
              <TouchableOpacity
                style={styles.expandCalendarToggle}
                onPress={() => {
                  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                  setShowCustomTime(!showCustomTime);
                }}
              >
                <Text style={styles.expandCalendarText}>
                  {showCustomTime ? 'Presets' : '⏰ Exact Time'}
                </Text>
              </TouchableOpacity>
            </View>

            {showCustomTime ? (
              /* Custom Time Selector */
              <View style={styles.customTimeBox}>
                <Text style={styles.customTimeLabel}>SELECT HOUR & MINUTE</Text>
                
                {/* Hours */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeScrollRow}>
                  {['5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3', '4'].map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[styles.timeUnitBtn, customHour === h && styles.timeUnitBtnActive]}
                      onPress={() => applyCustomTime(h, customMinute, customAmPm)}
                    >
                      <Text style={[styles.timeUnitText, customHour === h && styles.timeUnitTextActive]}>
                        {h}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Minutes & AM/PM */}
                <View style={styles.minuteAndAmPmRow}>
                  <View style={styles.minuteGroup}>
                    {['00', '15', '30', '45'].map((m) => (
                      <TouchableOpacity
                        key={m}
                        style={[styles.timeUnitBtn, customMinute === m && styles.timeUnitBtnActive]}
                        onPress={() => applyCustomTime(customHour, m, customAmPm)}
                      >
                        <Text style={[styles.timeUnitText, customMinute === m && styles.timeUnitTextActive]}>
                          :{m}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.amPmGroup}>
                    {(['AM', 'PM'] as const).map((ap) => (
                      <TouchableOpacity
                        key={ap}
                        style={[styles.amPmBtn, customAmPm === ap && styles.amPmBtnActive]}
                        onPress={() => applyCustomTime(customHour, customMinute, ap)}
                      >
                        <Text style={[styles.amPmText, customAmPm === ap && styles.amPmTextActive]}>
                          {ap}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            ) : (
              /* Preset Time Pills */
              <View style={styles.pillRow}>
                {TIME_PRESETS.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.pill, selectedTime === t && styles.pillActive]}
                    onPress={() => {
                      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                      setSelectedTime(t);
                    }}
                  >
                    <Text style={[styles.pillText, selectedTime === t && styles.pillTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Selected Time Banner */}
            <View style={styles.selectedTimeBanner}>
              <Clock size={14} color="#FBBF24" style={{ marginRight: 6 }} />
              <Text style={styles.selectedTimeText}>Selected Time: {selectedTime}</Text>
            </View>

            {/* Workout Focus */}
            <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>WORKOUT SPLIT FOCUS</Text>
            <View style={styles.pillRow}>
              {SPLIT_CHOICES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.pill, selectedSplit === s && styles.pillActive]}
                  onPress={() => {
                    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                    setSelectedSplit(s);
                  }}
                >
                  <Text style={[styles.pillText, selectedSplit === s && styles.pillTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Note */}
            <Text style={[styles.sectionTitle, { marginTop: SPACING.sm }]}>ADD A NOTE / LIFT GOALS (OPTIONAL)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Going for heavy compound progression, let's keep each other consistent!"
              placeholderTextColor={COLORS.textMuted}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={2}
            />

            {/* Submit */}
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Zap size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.sendButtonText}>
                {proposalType === 'recurring' ? 'Lock In Standing Partnership' : 'Send Workout Proposal'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  backdropTouchArea: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: '#11141F',
    borderTopLeftRadius: BORDER_RADIUS.xl + 4,
    borderTopRightRadius: BORDER_RADIUS.xl + 4,
    maxHeight: '90%',
    borderTopWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 10,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
  },
  dragPill: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    marginBottom: 10,
  },
  headerContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  superSpotIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accentPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    padding: SPACING.xl,
    paddingBottom: 40,
  },
  proposalTypeRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BORDER_RADIUS.md,
    padding: 3,
    gap: 4,
    marginBottom: SPACING.md,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.sm,
  },
  typeBtnActive: {
    backgroundColor: COLORS.accentPurple,
  },
  typeBtnActiveRecurring: {
    backgroundColor: COLORS.primary,
  },
  typeBtnText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
  },
  typeBtnTextActiveRecurring: {
    color: '#FFFFFF',
  },
  recurringSection: {
    marginBottom: SPACING.md,
  },
  pillActiveRecurring: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderColor: COLORS.primary,
  },
  pillTextActiveRecurring: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  recurringSummaryBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    marginTop: 4,
  },
  recurringSummaryTitle: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  recurringSummarySub: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs + 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    flex: 1,
    marginLeft: 6,
  },
  expandCalendarToggle: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  expandCalendarText: {
    color: '#C4B5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.sm,
  },
  pill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    borderColor: COLORS.accentPurple,
  },
  pillText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#C4B5FD',
    fontWeight: '700',
  },
  calendarContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  monthNavBtn: {
    padding: 6,
  },
  monthTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dayOfWeekText: {
    width: 36,
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  emptyDayCell: {
    width: '14.28%',
    height: 36,
  },
  dayCell: {
    width: '14.28%',
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },
  dayCellSelected: {
    backgroundColor: COLORS.accentPurple,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  dayCellText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  dayCellTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dayCellTextToday: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  selectedDateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  selectedDateText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  customTimeBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  customTimeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  timeScrollRow: {
    gap: 6,
    marginBottom: 8,
  },
  timeUnitBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  timeUnitBtnActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderColor: COLORS.accentPurple,
  },
  timeUnitText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  timeUnitTextActive: {
    color: '#C4B5FD',
    fontWeight: '800',
  },
  minuteAndAmPmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  minuteGroup: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  amPmGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  amPmBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  amPmBtnActive: {
    backgroundColor: COLORS.accentPurple,
    borderColor: COLORS.accentPurple,
  },
  amPmText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  amPmTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  selectedTimeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  selectedTimeText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: SPACING.lg,
    minHeight: 50,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentPurple,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
