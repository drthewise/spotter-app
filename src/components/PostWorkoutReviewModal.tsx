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
  Image,
} from 'react-native';
import { X, Star, ShieldCheck, Dumbbell, Flame, HeartHandshake, Check, ThumbsUp } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { UserProfile, WorkoutReview } from '../types';

interface PostWorkoutReviewModalProps {
  visible: boolean;
  partner: UserProfile;
  onClose: () => void;
  onSubmitReview: (review: WorkoutReview) => void;
}

const REVIEW_TAGS = [
  { id: 'on_time', label: '⏰ Showed Up On Time', positive: true },
  { id: 'safe_spotter', label: '💪 Great / Safe Spotter', positive: true },
  { id: 'high_energy', label: '🔥 High Energy & Motivation', positive: true },
  { id: 'respectful', label: '🤝 Respectful & Friendly', positive: true },
  { id: 'late', label: '⏳ Showed Up Late', positive: false },
  { id: 'flaked', label: '👻 Flaked / No Show', positive: false },
];

export const PostWorkoutReviewModal: React.FC<PostWorkoutReviewModalProps> = ({
  visible,
  partner,
  onClose,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>(['on_time', 'safe_spotter', 'high_energy']);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (id: string) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    if (selectedTags.includes(id)) {
      setSelectedTags(selectedTags.filter((t) => t !== id));
    } else {
      setSelectedTags([...selectedTags, id]);
    }
  };

  const handleSubmit = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch (e) {}
    setSubmitted(true);

    const review: WorkoutReview = {
      id: 'rev_' + Date.now(),
      partnerId: partner.id,
      partnerName: partner.name,
      rating,
      badges: selectedTags,
      notes: notes.trim() || undefined,
      createdAt: 'Just now',
    };

    onSubmitReview(review);

    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  const partnerPhotoSrc = typeof partner.photos[0] === 'string' ? { uri: partner.photos[0] } : partner.photos[0];

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Workout Completed!</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {submitted ? (
            <View style={styles.successContainer}>
              <View style={styles.checkCircle}>
                <Check size={36} color="#10B981" strokeWidth={3} />
              </View>
              <Text style={styles.successTitle}>Review Submitted!</Text>
              <Text style={styles.successSub}>
                Thanks for keeping the Spotter gym community accountable! {partner.name}'s reliability score was updated to 99%.
              </Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              {/* Partner Card */}
              <View style={styles.partnerRow}>
                <Image source={partnerPhotoSrc} style={styles.avatar} />
                <View>
                  <Text style={styles.partnerName}>How was your session with {partner.name}?</Text>
                  <Text style={styles.partnerGym}>📍 {partner.primaryGym.branchName}</Text>
                </View>
              </View>

              {/* Star Rating */}
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => {
                      try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
                      setRating(star);
                    }}
                    style={styles.starTouch}
                  >
                    <Star
                      size={32}
                      color={star <= rating ? '#FBBF24' : 'rgba(255,255,255,0.2)'}
                      fill={star <= rating ? '#FBBF24' : 'none'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Badges / Feedback Tags */}
              <Text style={styles.sectionHeader}>SELECT WORKOUT HIGHLIGHTS</Text>
              <View style={styles.tagsGrid}>
                {REVIEW_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <TouchableOpacity
                      key={tag.id}
                      style={[
                        styles.tagCard,
                        isSelected && (tag.positive ? styles.tagCardPositive : styles.tagCardNegative),
                      ]}
                      onPress={() => toggleTag(tag.id)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.tagText,
                          isSelected && (tag.positive ? styles.tagTextPositive : styles.tagTextNegative),
                        ]}
                      >
                        {tag.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Private Notes */}
              <Text style={styles.sectionHeader}>ADDITIONAL COMMENTS (OPTIONAL)</Text>
              <TextInput
                style={styles.input}
                placeholder="Great spotter on 225 bench, stayed off the bar until failure..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                numberOfLines={2}
                value={notes}
                onChangeText={setNotes}
              />

              {/* Submit */}
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <ThumbsUp size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.submitText}>Submit Review & Boost Score</Text>
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
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#11141F',
    borderTopLeftRadius: BORDER_RADIUS.xl + 4,
    borderTopRightRadius: BORDER_RADIUS.xl + 4,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  title: {
    fontSize: 18,
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
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  partnerName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  partnerGym: {
    fontSize: 11,
    color: COLORS.badgeGymText,
    marginTop: 2,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: SPACING.md,
  },
  starTouch: {
    padding: 4,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tagCardPositive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: COLORS.primary,
  },
  tagCardNegative: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  tagText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tagTextPositive: {
    color: '#34D399',
    fontWeight: '700',
  },
  tagTextNegative: {
    color: '#F87171',
    fontWeight: '700',
  },
  input: {
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
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  successContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
  },
  checkCircle: {
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
    marginBottom: 6,
  },
  successSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
