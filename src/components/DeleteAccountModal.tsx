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
} from 'react-native';
import { X, Trash2, AlertTriangle, Check, ShieldAlert, HeartHandshake } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { CURRENT_USER } from '../data/mockData';

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
}

const DELETE_REASONS = [
  'Found regular lifting partners / spotters',
  'Switched gym chains or relocated',
  'Taking a temporary break from the gym',
  'Privacy / security concerns',
  'App not active enough in my local gym',
  'Other reason',
];

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  visible,
  onClose,
  onConfirmDelete,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(DELETE_REASONS[0]);
  const [feedback, setFeedback] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const handleDelete = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {}

    setIsDeleted(true);

    setTimeout(() => {
      onConfirmDelete();
      setIsDeleted(false);
      onClose();
    }, 2200);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Trash2 size={22} color="#EF4444" style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.title}>Delete Account</Text>
                <Text style={styles.subtitle}>Permanent action • Cannot be undone</Text>
              </View>
            </View>
            {!isDeleted && (
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {isDeleted ? (
            <View style={styles.deletedContent}>
              <View style={styles.trashCircle}>
                <Trash2 size={36} color="#EF4444" />
              </View>
              <Text style={styles.deletedTitle}>Account Successfully Deleted</Text>
              <Text style={styles.deletedSub}>
                Your profile, photos, lifting history, chats, and personal data have been permanently wiped from Spotter. We're sorry to see you go and wish you good luck with your lifting journey!
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
              {/* Critical Warning Box */}
              <View style={styles.warningBox}>
                <AlertTriangle size={20} color="#EF4444" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.warningTitle}>Warning: Permanent Erasure</Text>
                  <Text style={styles.warningText}>
                    Deleting your account permanently erases:
                  </Text>
                  <Text style={styles.warningBullet}>• Your profile photos & Fitness DNA</Text>
                  <Text style={styles.warningBullet}>• All mutual matches & active workout chats</Text>
                  <Text style={styles.warningBullet}>• Workout history & {CURRENT_USER.reliabilityScore}% reliability score</Text>
                  <Text style={styles.warningBullet}>• Home gym beacon access & schedule matrix</Text>
                </View>
              </View>

              {/* Pause Alternative Suggestion */}
              <View style={styles.pauseAlternativeCard}>
                <HeartHandshake size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                <Text style={styles.pauseAltText}>
                  Just taking a break? You can <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Pause Your Account</Text> instead to hide your profile while preserving all matches and chats.
                </Text>
              </View>

              {/* Reason Selection */}
              <Text style={styles.sectionHeader}>WHY ARE YOU LEAVING? (OPTIONAL)</Text>
              {DELETE_REASONS.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    style={[styles.reasonCard, isSelected && styles.reasonCardSelected]}
                    onPress={() => {
                      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                      setSelectedReason(reason);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.reasonText, isSelected && styles.reasonTextSelected]}>
                      {reason}
                    </Text>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Additional Feedback */}
              <Text style={styles.sectionHeader}>HOW COULD WE HAVE DONE BETTER?</Text>
              <TextInput
                style={styles.feedbackInput}
                placeholder="Share any feedback or suggestions before leaving..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={2}
                value={feedback}
                onChangeText={setFeedback}
              />

              {/* Confirmation Checkbox */}
              <TouchableOpacity
                style={styles.confirmCheckRow}
                onPress={() => {
                  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                  setConfirmed(!confirmed);
                }}
                activeOpacity={0.8}
              >
                <View style={[styles.checkboxSquare, confirmed && styles.checkboxSquareActive]}>
                  {confirmed && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                </View>
                <Text style={styles.confirmCheckLabel}>
                  I understand that this action is irreversible and all my data will be permanently deleted.
                </Text>
              </TouchableOpacity>

              {/* Action Buttons */}
              <TouchableOpacity
                style={[styles.deleteBtn, !confirmed && styles.deleteBtnDisabled]}
                onPress={handleDelete}
                disabled={!confirmed}
                activeOpacity={0.8}
              >
                <Trash2 size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.deleteBtnText}>Permanently Delete Account</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Keep My Account</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#11141F',
    borderTopLeftRadius: BORDER_RADIUS.xl + 4,
    borderTopRightRadius: BORDER_RADIUS.xl + 4,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
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
    color: '#EF4444',
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
  warningBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: SPACING.md,
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EF4444',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 11,
    color: '#FCA5A5',
    marginBottom: 4,
  },
  warningBullet: {
    fontSize: 11,
    color: '#E2E8F0',
    lineHeight: 16,
  },
  pauseAlternativeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    marginBottom: SPACING.lg,
  },
  pauseAltText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
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
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  reasonCardSelected: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  reasonText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  reasonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  feedbackInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 12,
    minHeight: 50,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: SPACING.lg,
  },
  confirmCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  checkboxSquare: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxSquareActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  confirmCheckLabel: {
    flex: 1,
    fontSize: 12,
    color: '#F87171',
    fontWeight: '600',
    lineHeight: 16,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  deleteBtnDisabled: {
    opacity: 0.4,
  },
  deleteBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
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
  deletedContent: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 320,
  },
  trashCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  deletedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  deletedSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
