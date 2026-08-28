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
  Image,
} from 'react-native';
import {
  ShieldCheck,
  X,
  FileCheck,
  Upload,
  CheckCircle,
  AlertCircle,
  Award,
  ChevronDown,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const ACCREDITING_BODIES = [
  { id: 'NSCA', name: 'NSCA (CSCS / CPT)' },
  { id: 'NASM', name: 'NASM (CPT / CES / PES)' },
  { id: 'USAW', name: 'USA Weightlifting (L1 / L2)' },
  { id: 'ACE', name: 'ACE Fitness' },
  { id: 'ACSM', name: 'ACSM Exercise Physiologist' },
  { id: 'CrossFit', name: 'CrossFit (L1 / L2 / L3)' },
  { id: 'ISSA', name: 'ISSA Strength & Conditioning' },
];

interface CoachVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmitted: (verificationData: {
    accreditationBody: string;
    credentialIdNumber: string;
    hasCpr: boolean;
    hasInsurance: boolean;
  }) => void;
}

export const CoachVerificationModal: React.FC<CoachVerificationModalProps> = ({
  visible,
  onClose,
  onSubmitted,
}) => {
  const [selectedBody, setSelectedBody] = useState('NSCA');
  const [credentialId, setCredentialId] = useState('');
  const [certificateUploaded, setCertificateUploaded] = useState(false);
  const [cprUploaded, setCprUploaded] = useState(false);
  const [hasInsurance, setHasInsurance] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(SCREEN_HEIGHT);
      backdropOpacity.setValue(0);
      setSubmissionSuccess(false);

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

  const handleSubmit = () => {
    if (!credentialId.trim()) {
      try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch (e) {}
      return;
    }

    try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) {}
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmissionSuccess(true);
      onSubmitted({
        accreditationBody: selectedBody,
        credentialIdNumber: credentialId.trim(),
        hasCpr: cprUploaded,
        hasInsurance,
      });

      setTimeout(() => {
        handleDismiss();
      }, 1400);
    }, 800);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: backdropOpacity }]}>
        <TouchableWithoutFeedback onPress={handleDismiss}>
          <View style={styles.backdropTouchArea} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          {/* Header Bar */}
          <View style={styles.header} {...panResponder.panHandlers}>
            <View style={styles.dragPill} />
            <View style={styles.headerRow}>
              <View style={styles.headerTitleGroup}>
                <View style={styles.shieldIconCircle}>
                  <ShieldCheck size={20} color="#000000" />
                </View>
                <View>
                  <Text style={styles.title}>Coach Credential Verification</Text>
                  <Text style={styles.subTitle}>Upload documentation for the Verified Coach badge</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleDismiss} style={styles.closeBtn}>
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {submissionSuccess ? (
              <View style={styles.successBox}>
                <CheckCircle size={48} color={COLORS.primary} style={{ marginBottom: 12 }} />
                <Text style={styles.successTitle}>Credentials Submitted!</Text>
                <Text style={styles.successSub}>
                  Our safety & compliance team will verify your {selectedBody} certification (ID #{credentialId}) within 24 hours.
                </Text>
              </View>
            ) : (
              <>
                {/* Notice Banner */}
                <View style={styles.noticeCard}>
                  <Award size={18} color="#F59E0B" style={{ marginRight: 8 }} />
                  <Text style={styles.noticeText}>
                    Spotter only awards the <Text style={{ fontWeight: '800', color: '#FDE68A' }}>VERIFIED COACH</Text> badge to lifters with accredited certifications to protect member safety.
                  </Text>
                </View>

                {/* Step 1: Accrediting Body */}
                <Text style={styles.sectionTitle}>1. SELECT ACCREDITING ORGANIZATION</Text>
                <View style={styles.bodyGrid}>
                  {ACCREDITING_BODIES.map((body) => {
                    const isSelected = selectedBody === body.id;
                    return (
                      <TouchableOpacity
                        key={body.id}
                        style={[styles.bodyPill, isSelected && styles.bodyPillActive]}
                        onPress={() => {
                          try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                          setSelectedBody(body.id);
                        }}
                      >
                        <Text style={[styles.bodyPillText, isSelected && styles.bodyPillTextActive]}>
                          {body.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Step 2: License / Credential ID */}
                <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>
                  2. CERTIFICATION LICENSE / ID NUMBER
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. CSCS-72491028 or NASM-1948201"
                  placeholderTextColor={COLORS.textMuted}
                  value={credentialId}
                  onChangeText={setCredentialId}
                  autoCapitalize="characters"
                />

                {/* Step 3: Certificate Upload Simulation */}
                <Text style={[styles.sectionTitle, { marginTop: SPACING.sm }]}>
                  3. UPLOAD CERTIFICATE PROOF (PDF OR PHOTO)
                </Text>
                <TouchableOpacity
                  style={[styles.uploadBox, certificateUploaded && styles.uploadBoxDone]}
                  onPress={() => {
                    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
                    setCertificateUploaded(!certificateUploaded);
                  }}
                  activeOpacity={0.8}
                >
                  {certificateUploaded ? (
                    <View style={styles.uploadDoneRow}>
                      <FileCheck size={20} color="#34D399" style={{ marginRight: 8 }} />
                      <Text style={styles.uploadDoneText}>{selectedBody}_Certificate_Official.pdf (Attached)</Text>
                    </View>
                  ) : (
                    <View style={styles.uploadPromptRow}>
                      <Upload size={18} color="#F59E0B" style={{ marginRight: 8 }} />
                      <Text style={styles.uploadPromptText}>Tap to upload Certificate from Camera / Files</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Step 4: CPR / AED Verification */}
                <Text style={[styles.sectionTitle, { marginTop: SPACING.md }]}>
                  4. CURRENT CPR / AED VERIFICATION
                </Text>
                <TouchableOpacity
                  style={[styles.uploadBox, cprUploaded && styles.uploadBoxDone]}
                  onPress={() => {
                    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
                    setCprUploaded(!cprUploaded);
                  }}
                  activeOpacity={0.8}
                >
                  {cprUploaded ? (
                    <View style={styles.uploadDoneRow}>
                      <FileCheck size={20} color="#34D399" style={{ marginRight: 8 }} />
                      <Text style={styles.uploadDoneText}>RedCross_CPR_AED_Card.jpg (Attached)</Text>
                    </View>
                  ) : (
                    <View style={styles.uploadPromptRow}>
                      <Upload size={18} color="#F59E0B" style={{ marginRight: 8 }} />
                      <Text style={styles.uploadPromptText}>Upload American Red Cross / AHA CPR Card</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Step 5: Trainer Liability Insurance */}
                <TouchableOpacity
                  style={[styles.insuranceRow, hasInsurance && styles.insuranceRowActive]}
                  onPress={() => {
                    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
                    setHasInsurance(!hasInsurance);
                  }}
                  activeOpacity={0.85}
                >
                  <View style={[styles.checkbox, hasInsurance && styles.checkboxActive]}>
                    {hasInsurance && <CheckCircle size={14} color="#FFFFFF" />}
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.insuranceTitle}>Active Trainer Liability Insurance Policy</Text>
                    <Text style={styles.insuranceSub}>Verified professional coverage for in-person gym lift clinics</Text>
                  </View>
                </TouchableOpacity>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitBtn, !credentialId.trim() && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={!credentialId.trim() || isSubmitting}
                >
                  <ShieldCheck size={18} color="#000000" style={{ marginRight: 8 }} />
                  <Text style={styles.submitBtnText}>
                    {isSubmitting ? 'Submitting Credentials...' : 'Submit Documentation for Review'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
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
    maxHeight: '92%',
    borderTopWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shieldIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subTitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  closeBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingBottom: 40,
  },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  noticeText: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: SPACING.xs + 2,
  },
  bodyGrid: {
    gap: 6,
    marginBottom: SPACING.sm,
  },
  bodyPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  bodyPillActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  bodyPillText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  bodyPillTextActive: {
    color: '#FDE68A',
    fontWeight: '800',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: SPACING.md,
  },
  uploadBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderStyle: 'dashed',
    marginBottom: SPACING.sm,
  },
  uploadBoxDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderStyle: 'solid',
  },
  uploadPromptRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadPromptText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '700',
  },
  uploadDoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadDoneText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
  },
  insuranceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  insuranceRowActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  insuranceTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  insuranceSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 15,
    borderRadius: BORDER_RADIUS.lg,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  successBox: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: SPACING.lg,
  },
  successTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  successSub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});
