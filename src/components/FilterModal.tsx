import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { X, Check, Shield, MapPin, Dumbbell } from 'lucide-react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, onApply }) => {
  const [sameGymOnly, setSameGymOnly] = useState(true);
  const [genderFilter, setGenderFilter] = useState<'all' | 'men' | 'women'>('all');
  const [maxDistance, setMaxDistance] = useState(5);
  const [experienceLevel, setExperienceLevel] = useState<string>('All');
  const [modality, setModality] = useState<string>('All');

  const handleApply = () => {
    onApply({
      sameGymOnly,
      genderFilter,
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
                <Text style={styles.toggleTitle}>Exact Home Gym Only</Text>
                <Text style={styles.toggleSub}>Only show lifters at Equinox - Williamsburg</Text>
              </View>
              <Switch
                value={sameGymOnly}
                onValueChange={setSameGymOnly}
                trackColor={{ false: '#334155', true: COLORS.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Gender Filter */}
            <Text style={styles.sectionHeader}>I'm Looking To Train With</Text>
            <View style={styles.pillRow}>
              {[
                { id: 'all', label: 'Everyone' },
                { id: 'men', label: 'Men Only' },
                { id: 'women', label: 'Women Only' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.pill, genderFilter === item.id && styles.pillActive]}
                  onPress={() => setGenderFilter(item.id as any)}
                >
                  <Text style={[styles.pillText, genderFilter === item.id && styles.pillTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Max Distance */}
            <Text style={styles.sectionHeader}>Max Distance Radius</Text>
            <View style={styles.pillRow}>
              {[2, 5, 10, 25].map((miles) => (
                <TouchableOpacity
                  key={miles}
                  style={[styles.pill, maxDistance === miles && styles.pillActive]}
                  onPress={() => setMaxDistance(miles)}
                >
                  <Text style={[styles.pillText, maxDistance === miles && styles.pillTextActive]}>
                    {miles} miles
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Experience Level */}
            <Text style={styles.sectionHeader}>Experience Level</Text>
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
            <Text style={styles.sectionHeader}>Training Modality</Text>
            <View style={styles.pillRow}>
              {['All', 'Powerlifting', 'Bodybuilding', 'CrossFit', 'HYROX', 'Calisthenics'].map((m) => (
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
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
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
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
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
