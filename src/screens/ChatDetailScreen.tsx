import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ArrowLeft, Dumbbell, Send, ShieldCheck, CheckCircle, ShieldAlert, Star } from 'lucide-react-native';
import { Match, ChatMessage, WorkoutReview } from '../types';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { ReportUserModal } from '../components/ReportUserModal';
import { PostWorkoutReviewModal } from '../components/PostWorkoutReviewModal';
import { CURRENT_USER } from '../data/mockData';

interface ChatDetailScreenProps {
  match: Match;
  onBack: () => void;
}

export const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ match, onBack }) => {
  const getInitialMessages = (m: Match): ChatMessage[] => {
    if (m.messages && m.messages.length > 0) {
      return m.messages;
    }
    return [
      {
        id: 'init_' + m.id,
        senderId: m.partner.id,
        text: 'Hey Dave! Saw you train at ' + m.partner.primaryGym.brand + '. What split are you running this week?',
        timestamp: 'Yesterday',
      },
    ];
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => getInitialMessages(match));
  const [inputText, setInputText] = useState('');
  const [checkedIn, setCheckedIn] = useState(match.activeSession?.userCheckedIn || false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [sessionReviewed, setSessionReviewed] = useState(match.activeSession?.reviewed || false);

  useEffect(() => {
    setMessages(getInitialMessages(match));
    setCheckedIn(match.activeSession?.userCheckedIn || false);
    setSessionReviewed(match.activeSession?.reviewed || false);
    setInputText('');
  }, [match.id]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: String(Date.now()),
      senderId: CURRENT_USER.id,
      text: inputText.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
  };

  const handleReviewSubmitted = (review: WorkoutReview) => {
    setSessionReviewed(true);
    const systemMsg: ChatMessage = {
      id: 'sys_' + Date.now(),
      senderId: 'system',
      text: '⭐️ Workout completed! You gave ' + match.partner.name + ' a 5-star review (' + review.badges.join(', ') + ').',
      timestamp: 'Just now',
      isSystemEvent: true,
    };
    setMessages((prev) => [...prev, systemMsg]);
  };

  const partnerPhotoSrc = typeof match.partner.photos[0] === 'string' ? { uri: match.partner.photos[0] } : match.partner.photos[0];
  const session = match.activeSession;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Image source={partnerPhotoSrc} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{match.partner.name}</Text>
          <Text style={styles.gymName}>📍 {match.partner.primaryGym.branchName}</Text>
        </View>

        <View style={styles.headerActions}>
          <View style={styles.reliabilityPill}>
            <ShieldCheck size={12} color="#FBBF24" />
            <Text style={styles.reliabilityText}>{match.partner.reliabilityScore.toFixed(0)}%</Text>
          </View>
          <TouchableOpacity
            style={styles.reportBtn}
            onPress={() => setReportModalVisible(true)}
            activeOpacity={0.7}
          >
            <ShieldAlert size={16} color="#F87171" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Workout Session Banner */}
      {session ? (
        <View style={styles.workoutBanner}>
          <View style={styles.bannerLeft}>
            <Dumbbell size={18} color={COLORS.primary} />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.bannerTitle}>{session.scheduledDate} @ {session.scheduledTime}</Text>
              <Text style={styles.bannerSub}>{session.splitFocus} • {session.gymName}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              style={[styles.checkInBtn, checkedIn && styles.checkInBtnDone]}
              onPress={() => setCheckedIn(!checkedIn)}
            >
              <CheckCircle size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.checkInBtnText}>{checkedIn ? 'Checked In' : 'I Am Here'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.reviewBtn, sessionReviewed && styles.reviewBtnDone]}
              onPress={() => setReviewModalVisible(true)}
            >
              <Star size={13} color="#FFFFFF" style={{ marginRight: 3 }} />
              <Text style={styles.reviewBtnText}>{sessionReviewed ? 'Reviewed' : 'Review'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[styles.workoutBanner, styles.noSessionBanner]}>
          <View style={styles.bannerLeft}>
            <Dumbbell size={16} color={COLORS.textSecondary} />
            <View style={{ marginLeft: 8 }}>
              <Text style={styles.noSessionTitle}>No Locked-In Session Yet</Text>
              <Text style={styles.bannerSub}>Coordinate a workout time below or propose a spot</Text>
            </View>
          </View>
        </View>
      )}

      {/* Messages List */}
      <ScrollView contentContainerStyle={styles.messagesList} showsVerticalScrollIndicator={false}>
        {messages.map((msg) => {
          if (msg.isSystemEvent) {
            return (
              <View key={msg.id} style={styles.systemMessageContainer}>
                <Text style={styles.systemMessageText}>{msg.text}</Text>
              </View>
            );
          }

          const isMe = msg.senderId === CURRENT_USER.id;
          return (
            <View
              key={msg.id}
              style={[styles.messageBubble, isMe ? styles.myBubble : styles.partnerBubble]}
            >
              <Text style={[styles.messageText, isMe ? styles.myText : styles.partnerText]}>
                {msg.text}
              </Text>
              <Text style={[styles.timestamp, isMe ? styles.myTimestamp : styles.partnerTimestamp]}>
                {msg.timestamp}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Input Field */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={'Message ' + match.partner.name + '...'}
            placeholderTextColor={COLORS.textMuted}
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Send size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Report & Block User Modal */}
      <ReportUserModal
        visible={reportModalVisible}
        user={match.partner}
        onClose={() => setReportModalVisible(false)}
        onReportSubmitted={() => {
          setReportModalVisible(false);
          onBack();
        }}
      />

      {/* Post-Workout Review Modal */}
      <PostWorkoutReviewModal
        visible={reviewModalVisible}
        partner={match.partner}
        onClose={() => setReviewModalVisible(false)}
        onSubmitReview={handleReviewSubmitted}
      />
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    padding: 6,
    marginRight: 6,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  gymName: {
    fontSize: 11,
    color: COLORS.badgeGymText,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reliabilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  reliabilityText: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '700',
  },
  reportBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  workoutBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.25)',
  },
  noSessionBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bannerTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  noSessionTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  bannerSub: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  checkInBtnDone: {
    backgroundColor: '#059669',
  },
  checkInBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  reviewBtnDone: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  reviewBtnText: {
    color: '#FBBF24',
    fontSize: 10,
    fontWeight: '700',
  },
  messagesList: {
    padding: SPACING.lg,
    paddingBottom: 20,
  },
  systemMessageContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm + 2,
    marginVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  systemMessageText: {
    color: '#FDE68A',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 2,
  },
  partnerBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 19,
  },
  myText: {
    color: '#FFFFFF',
  },
  partnerText: {
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  partnerTimestamp: {
    color: COLORS.textMuted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 13,
    marginRight: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
