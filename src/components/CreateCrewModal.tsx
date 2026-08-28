import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Users, Dumbbell, MapPin, Calendar, Clock, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { GymCrew, Modality } from '../types';
import { CURRENT_USER } from '../data/mockData';

interface CreateCrewModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateCrew: (newCrew: GymCrew) => void;
}

const MODALITY_CHOICES: Modality[] = [
  'Powerlifting',
  'Bodybuilding',
  'CrossFit',
  'HYROX',
  'Calisthenics',
  'General Fitness',
];

export const CreateCrewModal: React.FC<CreateCrewModalProps> = ({
  visible,
  onClose,
  onCreateCrew,
}) => {
  const [crewName, setCrewName] = useState('');
  const [tagline, setTagline] = useState('');
  const [modality, setModality] = useState<Modality>('Powerlifting');
  const [splitFocus, setSplitFocus] = useState('Heavy Bench & Upper');
  const [sessionDay, setSessionDay] = useState('Saturday');
  const [sessionTime, setSessionTime] = useState('9:00 AM');

  const handleCreate = () => {
    if (!crewName.trim()) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {}

    const newCrew: GymCrew = {
      id: 'crew_' + Date.now(),
      name: crewName.trim(),
      tagline: tagline.trim() || 'Weekly spot group and shared compound sessions',
      gymName: CURRENT_USER.primaryGym.branchName,
      modality,
      splitFocus,
      memberCount: 1,
      members: [
        {
          id: CURRENT_USER.id,
          name: CURRENT_USER.name,
          photo: CURRENT_USER.photos[0],
          role: 'Leader',
        },
      ],
      nextSession: {
        date: sessionDay,
        time: sessionTime,
        title: splitFocus + ' Session',
      },
      messages: [
        {
          id: 'cm_init',
          senderId: CURRENT_USER.id,
          senderName: CURRENT_USER.name,
          text: 'Crew created! Welcome to ' + crewName.trim() + '. Let coordinate our next group session.',
          timestamp: 'Just now',
        },
      ],
    };

    onCreateCrew(newCrew);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create a Gym Crew</Text>
          <TouchableOpacity
            onPress={handleCreate}
            style={[styles.createBtn, !crewName.trim() && styles.createBtnDisabled]}
            disabled={!crewName.trim()}
          >
            <Text style={styles.createText}>Create</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Crew Name */}
            <Text style={styles.sectionHeader}>CREW NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Saturday Heavy Bench Squad"
              placeholderTextColor={COLORS.textMuted}
              value={crewName}
              onChangeText={setCrewName}
            />

            {/* Tagline / Vibe */}
            <Text style={styles.sectionHeader}>TAGLINE & LIFTING VIBE</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 3-plate working sets, lift-offs & heavy compounds"
              placeholderTextColor={COLORS.textMuted}
              value={tagline}
              onChangeText={setTagline}
            />

            {/* Primary Gym */}
            <Text style={styles.sectionHeader}>HOME GYM LOCATION</Text>
            <View style={styles.gymCard}>
              <MapPin size={16} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.gymName}>{CURRENT_USER.primaryGym.branchName}</Text>
            </View>

            {/* Modality */}
            <Text style={styles.sectionHeader}>DISCIPLINE / MODALITY</Text>
            <View style={styles.pillsRow}>
              {MODALITY_CHOICES.map((m) => {
                const isSelected = modality === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[styles.pill, isSelected && styles.pillActive]}
                    onPress={() => setModality(m)}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Regular Training Window */}
            <Text style={styles.sectionHeader}>REGULAR CREW SESSION TIME</Text>
            <View style={styles.sessionRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subLabel}>Day</Text>
                <TextInput
                  style={styles.subInput}
                  placeholder="e.g. Saturday"
                  placeholderTextColor={COLORS.textMuted}
                  value={sessionDay}
                  onChangeText={setSessionDay}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.subLabel}>Time</Text>
                <TextInput
                  style={styles.subInput}
                  placeholder="e.g. 9:00 AM"
                  placeholderTextColor={COLORS.textMuted}
                  value={sessionTime}
                  onChangeText={setSessionTime}
                />
              </View>
            </View>

            {/* Focus */}
            <Text style={styles.sectionHeader}>SESSION FOCUS</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Heavy Flat Bench & Incline DBs"
              placeholderTextColor={COLORS.textMuted}
              value={splitFocus}
              onChangeText={setSplitFocus}
            />

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, !crewName.trim() && styles.submitBtnDisabled]}
              onPress={handleCreate}
              disabled={!crewName.trim()}
            >
              <Users size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.submitBtnText}>Launch Gym Crew</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0D14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  cancelBtn: {
    padding: 6,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  createBtn: {
    padding: 6,
  },
  createBtnDisabled: {
    opacity: 0.4,
  },
  createText: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 15,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 11,
    color: COLORS.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  gymCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  gymName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
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
  sessionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  subLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  subInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 9,
    color: COLORS.textPrimary,
    fontSize: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.xl,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
