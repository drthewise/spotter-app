import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { Radio, Plus, Clock, Dumbbell, MapPin, Users, Send, AlertCircle, Shield } from 'lucide-react-native';
import { MOCK_BEACONS, CURRENT_USER } from '../data/mockData';
import { GymBeacon } from '../types';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';

export const BeaconScreen: React.FC = () => {
  const [beacons, setBeacons] = useState<GymBeacon[]>(MOCK_BEACONS);
  const [modalVisible, setModalVisible] = useState(false);
  const [focus, setFocus] = useState('');
  const [timeText, setTimeText] = useState('Today @ 6:30 PM');
  const [desc, setDesc] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handlePostBeacon = () => {
    if (!focus.trim()) return;

    const newBeacon: GymBeacon = {
      id: 'beacon_' + Date.now(),
      userId: CURRENT_USER.id,
      userName: isAnonymous ? 'Anonymous Lifter' : CURRENT_USER.name,
      userPhoto: isAnonymous
        ? 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200'
        : CURRENT_USER.photos[0],
      gymName: CURRENT_USER.primaryGym.branchName,
      targetFocus: focus,
      timeWindowText: timeText,
      description: desc || 'Need a spotter for working sets.',
      responsesCount: 0,
      isUrgent: true,
      postedAt: 'Just now',
    };

    setBeacons([newBeacon, ...beacons]);
    setFocus('');
    setDesc('');
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.liveDot} />
          <Text style={styles.title}>Gym Beacon</Text>
        </View>
        <TouchableOpacity style={styles.postBtn} onPress={() => setModalVisible(true)}>
          <Plus size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.postBtnText}>Post Beacon</Text>
        </TouchableOpacity>
      </View>

      {/* Subtitle & Privacy Shield Notice */}
      <View style={styles.noticeBanner}>
        <Radio size={15} color={COLORS.primary} style={{ marginRight: 8 }} />
        <Text style={styles.noticeText}>
          Live same-day spotter requests from lifters at your gym right now.
        </Text>
      </View>

      {/* Feed List */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {beacons.map((beacon) => (
          <View key={beacon.id} style={styles.beaconCard}>
            <View style={styles.cardHeader}>
              <Image source={{ uri: beacon.userPhoto }} style={styles.avatar} />
              <View style={styles.headerInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{beacon.userName}</Text>
                  {beacon.isUrgent && (
                    <View style={styles.urgentBadge}>
                      <Text style={styles.urgentText}>URGENT SPOT</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.gymName}>📍 {beacon.gymName}</Text>
              </View>
              <Text style={styles.timeAgo}>{beacon.postedAt}</Text>
            </View>

            {/* Target Lift Focus */}
            <View style={styles.focusContainer}>
              <Dumbbell size={15} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.focusText}>{beacon.targetFocus}</Text>
            </View>

            {/* Time Window */}
            <View style={styles.timeWindowContainer}>
              <Clock size={13} color={COLORS.badgeScheduleText} style={{ marginRight: 6 }} />
              <Text style={styles.timeWindowText}>{beacon.timeWindowText}</Text>
            </View>

            {/* Description */}
            <Text style={styles.description}>{beacon.description}</Text>

            {/* Action Bar */}
            <View style={styles.cardFooter}>
              <View style={styles.responseCount}>
                <Users size={14} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                <Text style={styles.responseText}>{beacon.responsesCount} lifters responded</Text>
              </View>
              <TouchableOpacity
                style={styles.spotMeBtn}
                onPress={() => alert('Sent spot response to ' + beacon.userName + '!')}
              >
                <Send size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.spotMeText}>I Can Spot</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Post Beacon Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Broadcast a Gym Beacon</Text>
            <Text style={styles.modalSubtitle}>
              Sends an urgent alert to members currently at {CURRENT_USER.primaryGym.brand}.
            </Text>

            <Text style={styles.inputLabel}>What do you need a spot on?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Heavy Barbell Bench Press (275 lbs)"
              placeholderTextColor={COLORS.textMuted}
              value={focus}
              onChangeText={setFocus}
            />

            <Text style={styles.inputLabel}>Time Window</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Today @ 5:30 PM (in 30 mins)"
              placeholderTextColor={COLORS.textMuted}
              value={timeText}
              onChangeText={setTimeText}
            />

            <Text style={styles.inputLabel}>Notes / Details</Text>
            <TextInput
              style={[styles.input, { minHeight: 60 }]}
              placeholder="e.g. Working up to a heavy triple, need solid lift-off."
              placeholderTextColor={COLORS.textMuted}
              value={desc}
              onChangeText={setDesc}
              multiline
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handlePostBeacon}>
              <Radio size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.submitBtnText}>Broadcast Live Beacon</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  postBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BORDER_RADIUS.full,
  },
  postBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.2)',
  },
  noticeText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    flex: 1,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  beaconCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  urgentBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  urgentText: {
    color: '#F87171',
    fontSize: 9,
    fontWeight: '800',
  },
  gymName: {
    fontSize: 12,
    color: COLORS.badgeGymText,
    marginTop: 2,
  },
  timeAgo: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  focusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  focusText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  timeWindowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  timeWindowText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: SPACING.sm,
  },
  responseCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responseText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  spotMeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  spotMeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 4,
    marginTop: 4,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: SPACING.md,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.sm,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.textMuted,
    fontSize: 13,
  },
});
