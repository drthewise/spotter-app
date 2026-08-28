import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { X, Check, Dumbbell, MapPin, Users } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { CURRENT_USER } from '../data/mockData';

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

  const toggleMen = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    // Ensure at least one is selected
    if (showMen && !showWomen) {
      setShowWomen(true);
    }
    setShowMen(!showMen);
  };

  const toggleWomen = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    // Ensure at least one is selected
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
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Discovery Filters</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
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
            <Text style={styles.sectionHeader}>SHOW ME</Text>
            <View style={styles.checkboxRow}>
              {/* Men Checkbox */}
              <TouchableOpacity
                style={[styles.checkboxCard, showMen && styles.checkboxCardActive]}
                onPress={toggleMen}
                activeOpacity={0.8}
              >
                <View style={[styles.checkboxCircle, showMen && styles.checkboxCircleActive]}>
                  {showMen && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
                </View>
                <Text style={[styles.checkboxLabel, showMen && styles.checkboxLabelActive]}>
                  Men
                </Text>
              </TouchableOpacity>

              {/* Women Checkbox */}
              <TouchableOpacity
                style={[styles.checkboxCard, showWomen && styles.checkboxCardActive]}
                onPress={toggleWomen}
                activeOpacity={0.8}
              >
                <View style={[styles.checkboxCircle, showWomen && styles.checkboxCircleActive]}>
                  {showWomen && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
                </View>
                <Text style={[styles.checkboxLabel, showWomen && styles.checkboxLabelActive]}>
                  Women
                </Text>
              </TouchableOpacity>

              {/* All / Everyone Button */}
              <TouchableOpacity
                style={[
                  styles.checkboxCard,
                  showMen && showWomen && styles.checkboxCardActive,
                ]}
                onPress={selectAllGenders}
                activeOpacity={0.8}
              >
                <View style={[styles.checkboxCircle, showMen && showWomen && styles.checkboxCircleActive]}>
                  {showMen && showWomen && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
                </View>
                <Text style={[styles.checkboxLabel, showMen && showWomen && styles.checkboxLabelActive]}>
                  Everyone
                </Text>
              </TouchableOpacity>
            </View>

            {/* Max Distance */}
            <Text style={styles.sectionHeader}>MAX DISTANCE RADIUS</Text>
            <View style={styles.pillRow}>
              {[2, 5, 10, 20, 50].map((miles) => (
                <TouchableOpacity
                  key={miles}
                  style={[styles.pill, maxDistance === miles && styles.pillActive]}
                  onPress={() => setMaxDistance(miles)}
                >
                  <Text style={[styles.pillText, maxDistance === miles && styles.pillTextActive]}>
                    {miles} mi
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Experience Level */}
            <Text style={styles.sectionHeader}>EXPERIENCE LEVEL</Text>
            <View style={styles.pillRow}>
              {['All', 'Beginner', 'Intermediate', 'Advanced', 'Elite Athlete'].map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  style={[styles.pill, experienceLevel === lvl && styles.pillActive]}
                  onPress={() => setExperienceLevel(lvl)}
                >
                  <Text style={[styles.pillText, experienceLevel === lvl && styles.pillTextActive]}>
                    {lvl}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Primary Modality */}
            <Text style={styles.sectionHeader}>TRAINING MODALITY</Text>
            <View style={styles.pillRow}>
              {['All', 'Powerlifting', 'Bodybuilding', 'CrossFit', 'HYROX', 'General Fitness'].map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.pill, modality === m && styles.pillActive]}
                  onPress={() => setModality(m)}
                >
                  <Text style={[styles.pillText, modality === m && styles.pillTextActive]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Apply Button */}
            <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#11141F',
    borderTopLeftRadius: BORDER_RADIUS.xl + 4,
    borderTopRightRadius: BORDER_RADIUS.xl + 4,
    padding: SPACING.xl,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    paddingBottom: SPACING.sm,
  },
  title: {
    fontSize: 20,
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
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  toggleTextCol: {
    flex: 1,
    marginRight: 10,
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
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.xs,
  },
  checkboxCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  checkboxCardActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: COLORS.primary,
  },
  checkboxCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  checkboxLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: COLORS.primary,
  },
  pillText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  pillTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
