import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput } from 'react-native';
import { Zap, X } from 'lucide-react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { UserProfile } from '../types';

export interface SpotProposalDetails {
  day: string;
  time: string;
  split: string;
  note: string;
}

interface RequestSpotModalProps {
  visible: boolean;
  profile: UserProfile | null;
  onClose: () => void;
  onSubmit: (details: SpotProposalDetails) => void;
}

export const RequestSpotModal: React.FC<RequestSpotModalProps> = ({
  visible,
  profile,
  onClose,
  onSubmit,
}) => {
  const [selectedDay, setSelectedDay] = useState('Tomorrow');
  const [selectedTime, setSelectedTime] = useState('6:00 PM');
  const [selectedSplit, setSelectedSplit] = useState('Push / Chest Day');
  const [note, setNote] = useState('');

  if (!profile) return null;

  const handleSend = () => {
    onSubmit({
      day: selectedDay,
      time: selectedTime,
      split: selectedSplit,
      note,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.superSpotIcon}>
                <Zap size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.title}>Request a Spot</Text>
                <Text style={styles.subtitle}>Direct workout proposal to {profile.name}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>When are you training?</Text>
          <View style={styles.pillRow}>
            {['Today', 'Tomorrow', 'This Friday', 'Weekend'].map((day) => (
              <TouchableOpacity
                key={day}
                style={[styles.pill, selectedDay === day && styles.pillActive]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={[styles.pillText, selectedDay === day && styles.pillTextActive]}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Target Time Window</Text>
          <View style={styles.pillRow}>
            {['6:30 AM', '12:00 PM', '5:30 PM', '7:00 PM'].map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.pill, selectedTime === t && styles.pillActive]}
                onPress={() => setSelectedTime(t)}
              >
                <Text style={[styles.pillText, selectedTime === t && styles.pillTextActive]}>
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Workout Focus</Text>
          <View style={styles.pillRow}>
            {['Push / Chest', 'Pull / Back', 'Leg Day', 'Functional / Cardio'].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.pill, selectedSplit === s && styles.pillActive]}
                onPress={() => setSelectedSplit(s)}
              >
                <Text style={[styles.pillText, selectedSplit === s && styles.pillTextActive]}>
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Add a Note (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Going for a heavy bench PR, need someone on lift-off!"
            placeholderTextColor={COLORS.textMuted}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={2}
          />

          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Zap size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.sendButtonText}>Send Spot Proposal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    borderTopWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  closeBtn: {
    padding: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: 4,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.md,
  },
  pill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
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
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: SPACING.lg,
    minHeight: 60,
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
    fontSize: 15,
    fontWeight: '700',
  },
});
