import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { X, Bell, Zap, Radio, MessageSquare, Clock, AlertTriangle, ShieldCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { NotificationPreferences } from '../types';

interface NotificationSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  visible,
  onClose,
}) => {
  const [spotRequests, setSpotRequests] = useState(true);
  const [beaconAlerts, setBeaconAlerts] = useState(true);
  const [chatMessages, setChatMessages] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [emergencyPulse, setEmergencyPulse] = useState(true);

  const testPush = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    Alert.alert(
      '🔔 Test Notification Sent',
      'Spotter: "Marcus checked into Retro Fitness - Garfield for Heavy Squats. Tap to join!"'
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Bell size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.title}>Push Notifications & Spot Alerts</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Beacon Proximity Alerts */}
          <View style={styles.settingCard}>
            <View style={styles.settingTextCol}>
              <View style={styles.titleRow}>
                <Radio size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                <Text style={styles.settingTitle}>Live Gym Beacon Alerts</Text>
              </View>
              <Text style={styles.settingDesc}>
                Instant push when a matched lifter checks into your home gym right now.
              </Text>
            </View>
            <Switch
              value={beaconAlerts}
              onValueChange={setBeaconAlerts}
              trackColor={{ false: '#334155', true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Super-Spots & Match Requests */}
          <View style={styles.settingCard}>
            <View style={styles.settingTextCol}>
              <View style={styles.titleRow}>
                <Zap size={16} color={COLORS.accentPurple} style={{ marginRight: 6 }} />
                <Text style={styles.settingTitle}>Super-Spot & Workout Invites</Text>
              </View>
              <Text style={styles.settingDesc}>
                Notifications when someone proposes a workout or sends a Super-Spot.
              </Text>
            </View>
            <Switch
              value={spotRequests}
              onValueChange={setSpotRequests}
              trackColor={{ false: '#334155', true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Chat Messages */}
          <View style={styles.settingCard}>
            <View style={styles.settingTextCol}>
              <View style={styles.titleRow}>
                <MessageSquare size={16} color="#60A5FA" style={{ marginRight: 6 }} />
                <Text style={styles.settingTitle}>Direct & Crew Messages</Text>
              </View>
              <Text style={styles.settingDesc}>
                New chat messages from matched lifters and your Gym Crews.
              </Text>
            </View>
            <Switch
              value={chatMessages}
              onValueChange={setChatMessages}
              trackColor={{ false: '#334155', true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Workout Reminders */}
          <View style={styles.settingCard}>
            <View style={styles.settingTextCol}>
              <View style={styles.titleRow}>
                <Clock size={16} color="#FBBF24" style={{ marginRight: 6 }} />
                <Text style={styles.settingTitle}>Workout 2-Hour Countdown</Text>
              </View>
              <Text style={styles.settingDesc}>
                Reminds you 2 hours before a scheduled session to prevent flaking.
              </Text>
            </View>
            <Switch
              value={workoutReminders}
              onValueChange={setWorkoutReminders}
              trackColor={{ false: '#334155', true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* SOS Emergency Spotter Pulse */}
          <View style={styles.settingCard}>
            <View style={styles.settingTextCol}>
              <View style={styles.titleRow}>
                <AlertTriangle size={16} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={styles.settingTitle}>SOS Emergency Spotter Pulse</Text>
              </View>
              <Text style={styles.settingDesc}>
                Urgent pulse when a lifter at your gym needs an immediate 1RM spot.
              </Text>
            </View>
            <Switch
              value={emergencyPulse}
              onValueChange={setEmergencyPulse}
              trackColor={{ false: '#334155', true: COLORS.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Test Push Button */}
          <TouchableOpacity style={styles.testPushBtn} onPress={testPush}>
            <Bell size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.testPushText}>Send Test Gym Notification</Text>
          </TouchableOpacity>
        </ScrollView>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: 6,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  settingTextCol: {
    flex: 1,
    marginRight: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  settingDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  testPushBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginTop: SPACING.lg,
  },
  testPushText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
});
