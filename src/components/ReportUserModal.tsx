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
  Alert,
} from 'react-native';
import { X, ShieldAlert, Check, AlertTriangle, UserX, MessageSquareX, EyeOff } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { UserProfile } from '../types';

interface ReportUserModalProps {
  visible: boolean;
  user: UserProfile;
  onClose: () => void;
  onReportSubmitted?: (reason: string, details: string) => void;
}

const REPORT_REASONS = [
  {
    id: 'unsafe_spotting',
    icon: AlertTriangle,
    title: 'Unsafe Spotting / Gym Endangerment',
    desc: 'Reckless spotting, dropped weights, or unsafe form advice',
  },
  {
    id: 'harassment',
    icon: MessageSquareX,
    title: 'Harassment / Inappropriate Messages',
    desc: 'Unsolicited romantic advances, offensive comments, or bullying',
  },
  {
    id: 'no_show',
    icon: EyeOff,
    title: 'No-Show / Flaked on Scheduled Workout',
    desc: 'Confirmed a workout session and failed to show up',
  },
  {
    id: 'fake_profile',
    icon: UserX,
    title: 'Fake Profile / Catfish / Stolen Photos',
    desc: 'Impersonating someone else or using AI/stock photos deceptively',
  },
  {
    id: 'inappropriate_photos',
    icon: ShieldAlert,
    title: 'Inappropriate Profile Photos',
    desc: 'Explicit, offensive, or prohibited imagery',
  },
  {
    id: 'other',
    icon: ShieldAlert,
    title: 'Other Issue',
    desc: 'Another safety or community guidelines violation',
  },
];

export const ReportUserModal: React.FC<ReportUserModalProps> = ({
  visible,
  user,
  onClose,
  onReportSubmitted,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('unsafe_spotting');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {}

    setSubmitted(true);

    if (onReportSubmitted) {
      onReportSubmitted(selectedReason, additionalDetails);
    }

    setTimeout(() => {
      setSubmitted(false);
      setSelectedReason('unsafe_spotting');
      setAdditionalDetails('');
      onClose();
    }, 1800);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <ShieldAlert size={22} color="#EF4444" style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.title}>Report {user.name}</Text>
                <Text style={styles.subtitle}>Help keep the Spotter lifting community safe</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {submitted ? (
            <View style={styles.successContainer}>
              <View style={styles.successIconCircle}>
                <Check size={32} color="#10B981" strokeWidth={3} />
              </View>
              <Text style={styles.successTitle}>Report Submitted & User Blocked</Text>
              <Text style={styles.successSubtitle}>
                Thank you for helping protect the community. {user.name} has been blocked and will no longer appear in your feed or messages. Our safety team will review this report.
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              <Text style={styles.sectionHeader}>SELECT A REASON</Text>

              {REPORT_REASONS.map((item) => {
                const isSelected = selectedReason === item.id;
                const IconComponent = item.icon;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.reasonCard, isSelected && styles.reasonCardSelected]}
                    onPress={() => {
                      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                      setSelectedReason(item.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.reasonIconCircle, isSelected && styles.reasonIconCircleSelected]}>
                      <IconComponent size={18} color={isSelected ? '#EF4444' : COLORS.textSecondary} />
                    </View>
                    <View style={styles.reasonInfo}>
                      <Text style={[styles.reasonTitle, isSelected && styles.reasonTitleSelected]}>
                        {item.title}
                      </Text>
                      <Text style={styles.reasonDesc}>{item.desc}</Text>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Additional Details Text Box */}
              <Text style={styles.sectionHeader}>ADDITIONAL DETAILS (OPTIONAL)</Text>
              <TextInput
                style={styles.detailsInput}
                placeholder="Provide any additional context or incident details..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={3}
                value={additionalDetails}
                onChangeText={setAdditionalDetails}
              />

              <View style={styles.disclaimerBox}>
                <Text style={styles.disclaimerText}>
                  🛡️ Reporting a user will immediately block them from contacting you or seeing your profile, and flags their account for safety moderation.
                </Text>
              </View>

              {/* Action Buttons */}
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} activeOpacity={0.8}>
                <ShieldAlert size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.submitBtnText}>Submit Report & Block Lifter</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#11141F',
    borderTopLeftRadius: BORDER_RADIUS.xl + 4,
    borderTopRightRadius: BORDER_RADIUS.xl + 4,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
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
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  reasonCardSelected: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  reasonIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reasonIconCircleSelected: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  reasonInfo: {
    flex: 1,
  },
  reasonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  reasonTitleSelected: {
    color: '#F87171',
  },
  reasonDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  radioCircleSelected: {
    borderColor: '#EF4444',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
  },
  detailsInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: SPACING.md,
  },
  disclaimerBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginBottom: SPACING.lg,
  },
  disclaimerText: {
    color: '#FCA5A5',
    fontSize: 11,
    lineHeight: 16,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  successContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
