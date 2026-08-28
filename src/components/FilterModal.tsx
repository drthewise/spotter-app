import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
} from 'react-native';
import { X, Check, Dumbbell, MapPin, Users } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { CURRENT_USER } from '../data/mockData';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface FilterSettings {
  sameGymOnly: boolean;
  showMen: boolean;
  showWomen: boolean;
  maxDistance: number;
  experienceLevel: string;
  modality: string;
}

interface FilterModalProps {
  visible: boolean;
  currentFilters?: FilterSettings;
  onClose: () => void;
  onApply: (filters: FilterSettings) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  currentFilters,
  onClose,
  onApply,
}) => {
  const [sameGymOnly, setSameGymOnly] = useState(currentFilters?.sameGymOnly ?? false);
  const [showMen, setShowMen] = useState(currentFilters?.showMen ?? true);
  const [showWomen, setShowWomen] = useState(currentFilters?.showWomen ?? true);
  const [maxDistance, setMaxDistance] = useState(currentFilters?.maxDistance ?? 25);
  const [experienceLevel, setExperienceLevel] = useState<string>(currentFilters?.experienceLevel ?? 'All');
  const [modality, setModality] = useState<string>(currentFilters?.modality ?? 'All');

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

  if (!visible) return null;

  const toggleMen = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    if (showMen && !showWomen) {
      setShowWomen(true);
    }
    setShowMen(!showMen);
  };

  const toggleWomen = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    if (showWomen && !showMen) {
      setShowMen(true);
    }
    setShowWomen(!showWomen);
  };

  const selectAllGenders = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    setShowMen(true);
    setShowWomen(true);
  };

  const handleApply = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    onApply({
      sameGymOnly,
      showMen,
      showWomen,
      maxDistance,
      experienceLevel,
      modality,
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
              <Text style={styles.title}>Discovery Filters</Text>
              <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn}>
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Same Gym Only Toggle */}
            <View style={styles.toggleCard}>
              <View style={styles.toggleTextCol}>
                <Text style={styles.toggleTitle}>Same Home Gym Only</Text>
                <Text style={styles.toggleSub}>Only show lifters at {CURRENT_USER.primaryGym.brand}</Text>
              </View>
              <Switch
                value={sameGymOnly}
                onValueChange={setSameGymOnly}
                trackColor={{ false: '#334155', true: COLORS.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Gender Filter Checkboxes */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>SHOW LIFTERS</Text>
                <TouchableOpacity onPress={selectAllGenders}>
                  <Text style={styles.selectAllText}>Select All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.checkboxRow}>
                <TouchableOpacity
                  style={[styles.checkboxCard, showMen && styles.checkboxCardActive]}
                  onPress={toggleMen}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, showMen && styles.checkboxActive]}>
                    {showMen && <Check size={14} color="#FFFFFF" />}
                  </View>
                  <View style={styles.checkboxLabelCol}>
                    <Text style={[styles.checkboxLabel, showMen && styles.checkboxLabelActive]}>Men</Text>
                    <Text style={styles.checkboxSub}>Male lifters</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.checkboxCard, showWomen && styles.checkboxCardActive]}
                  onPress={toggleWomen}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, showWomen && styles.checkboxActive]}>
                    {showWomen && <Check size={14} color="#FFFFFF" />}
                  </View>
                  <View style={styles.checkboxLabelCol}>
                    <Text style={[styles.checkboxLabel, showWomen && styles.checkboxLabelActive]}>Women</Text>
                    <Text style={styles.checkboxSub}>Female lifters</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Max Distance */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>MAX DISTANCE: {maxDistance} MILES</Text>
              <View style={styles.pillRow}>
                {[5, 10, 25, 50].map((dist) => (
                  <TouchableOpacity
                    key={dist}
                    style={[styles.pill, maxDistance === dist && styles.pillActive]}
                    onPress={() => {
                      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                      setMaxDistance(dist);
                    }}
                  >
                    <Text style={[styles.pillText, maxDistance === dist && styles.pillTextActive]}>
                      {dist} mi
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Experience Level */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>EXPERIENCE LEVEL</Text>
              <View style={styles.pillRow}>
                {['All', 'Beginner', 'Intermediate', 'Advanced', 'Elite Athlete'].map((exp) => (
                  <TouchableOpacity
                    key={exp}
                    style={[styles.pill, experienceLevel === exp && styles.pillActive]}
                    onPress={() => {
                      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                      setExperienceLevel(exp);
                    }}
                  >
                    <Text style={[styles.pillText, experienceLevel === exp && styles.pillTextActive]}>
                      {exp}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Primary Modality */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TRAINING FOCUS / MODALITY</Text>
              <View style={styles.pillRow}>
                {[
                  'All',
                  'Bodybuilding',
                  'Calisthenics',
                  'CrossFit',
                  'Glute & Lower Body',
                  'HYROX',
                  'Olympic Lifting',
                  'Powerlifting',
                  'General Fitness',
                ].map((mod) => (
                  <TouchableOpacity
                    key={mod}
                    style={[styles.pill, modality === mod && styles.pillActive]}
                    onPress={() => {
                      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                      setModality(mod);
                    }}
                  >
                    <Text style={[styles.pillText, modality === mod && styles.pillTextActive]}>
                      {mod}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Apply Button */}
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyBtnText}>Apply Discovery Filters</Text>
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
    padding: SPACING.xl,
    paddingTop: 10,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
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
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: 6,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  toggleTextCol: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  toggleSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  selectAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: 12,
  },
  checkboxCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  checkboxCardActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabelCol: {
    flex: 1,
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  checkboxLabelActive: {
    color: '#FFFFFF',
  },
  checkboxSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: SPACING.xs,
  },
  pill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
