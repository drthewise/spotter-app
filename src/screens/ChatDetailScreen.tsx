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
  Modal,
} from 'react-native';
import {
  ArrowLeft,
  Dumbbell,
  Send,
  ShieldCheck,
  CheckCircle,
  ShieldAlert,
  Star,
  ChevronRight,
  Zap,
  Calendar,
  X,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Match, ChatMessage, WorkoutReview, WorkoutSession } from '../types';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { ReportUserModal } from '../components/ReportUserModal';
import { PostWorkoutReviewModal } from '../components/PostWorkoutReviewModal';
import { ProfileDetailsModal } from '../components/ProfileDetailsModal';
import { RequestSpotModal, SpotProposalDetails } from '../components/RequestSpotModal';
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
  const [currentSession, setCurrentSession] = useState<WorkoutSession | undefined>(match.activeSession);
  const [inputText, setInputText] = useState('');
  const [checkedIn, setCheckedIn] = useState(match.activeSession?.userCheckedIn || false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [sessionDetailsModalVisible, setSessionDetailsModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [requestSpotModalVisible, setRequestSpotModalVisible] = useState(false);
  const [sessionReviewed, setSessionReviewed] = useState(match.activeSession?.reviewed || false);

  useEffect(() => {
    setMessages(getInitialMessages(match));
    setCurrentSession(match.activeSession);
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

  const handleProposeSpotSubmitted = (details: SpotProposalDetails) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {}

    const newSession: WorkoutSession = {
      id: 'session_' + Date.now(),
      matchId: match.id,
      scheduledDate: details.day,
      scheduledTime: details.time,
      gymName: match.partner.primaryGym.branchName,
      splitFocus: details.split,
      userCheckedIn: false,
      partnerCheckedIn: false,
      status: 'scheduled',
      isRecurring: details.isRecurring,
      recurringDays: details.recurringDays,
      streakWeeks: details.isRecurring ? 1 : undefined,
      totalSessionsCompleted: details.isRecurring ? 1 : undefined,
    };

    setCurrentSession(newSession);
    match.activeSession = newSession;

    const proposalMsg: ChatMessage = {
      id: 'prop_' + Date.now(),
      senderId: CURRENT_USER.id,
      text: (details.isRecurring ? '🔄 Standing Partnership Locked In: ' : '⚡ Workout Locked In for ') + details.day + ' @ ' + details.time + ' (' + details.split + ') at ' + match.partner.primaryGym.branchName + (details.note ? ': "' + details.note + '"' : ''),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, proposalMsg]);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>

        {/* Tappable Profile Avatar & Name */}
        <TouchableOpacity
          style={styles.partnerProfileTouch}
          onPress={() => {
            try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
            setProfileModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <Image source={partnerPhotoSrc} style={styles.avatar} />
          <View style={styles.headerInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.name}>{match.partner.name}</Text>
              <ChevronRight size={13} color={COLORS.textMuted} style={{ marginLeft: 2 }} />
            </View>
            <Text style={styles.gymName} numberOfLines={1}>📍 {match.partner.primaryGym.branchName}</Text>
          </View>
        </TouchableOpacity>

        {/* Header Actions */}
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

      {/* Clean Pinned Workout Session Banner */}
      {currentSession ? (
        <TouchableOpacity
          style={[styles.workoutBanner, currentSession.isRecurring && styles.workoutBannerRecurring]}
          onPress={() => {
            try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
            setSessionDetailsModalVisible(true);
          }}
          activeOpacity={0.75}
        >
          <View style={styles.bannerLeft}>
            <View style={[styles.sessionIconCircle, currentSession.isRecurring && styles.sessionIconCircleRecurring]}>
              <Dumbbell size={16} color={currentSession.isRecurring ? '#FBBF24' : COLORS.primary} />
            </View>
            <View style={styles.bannerTextCol}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.bannerTitle} numberOfLines={1} ellipsizeMode="tail">
                  {currentSession.isRecurring ? '🔄 ' + (currentSession.recurringDays ? currentSession.recurringDays.join('/') : 'Standing') + ' @ ' + currentSession.scheduledTime : currentSession.scheduledDate + ' @ ' + currentSession.scheduledTime}
                </Text>
                {currentSession.isRecurring && (
                  <View style={styles.streakBadge}>
                    <Text style={styles.streakBadgeText}>🔥 {currentSession.streakWeeks || 3}w Streak</Text>
                  </View>
                )}
              </View>
              <Text style={styles.bannerSub} numberOfLines={1} ellipsizeMode="tail">
                {currentSession.splitFocus} • {currentSession.gymName}
              </Text>
            </View>
          </View>
          
          <View style={styles.managePill}>
            <Text style={[styles.managePillText, checkedIn && styles.managePillTextDone]}>
              {checkedIn ? '✓ Arrived' : 'Session'}
            </Text>
            <ChevronRight size={13} color={checkedIn ? '#34D399' : COLORS.textSecondary} style={{ marginLeft: 2 }} />
          </View>
        </TouchableOpacity>
      ) : (
        /* Banner when No Locked-In Session (Only pill is selectable) */
        <View style={[styles.workoutBanner, styles.noSessionBanner]}>
          <View style={styles.bannerLeft}>
            <View style={styles.proposeIconCircle}>
              <Calendar size={15} color={COLORS.accentPurple} />
            </View>
            <View style={{ marginLeft: 8, flex: 1 }}>
              <Text style={styles.noSessionTitle}>No Locked-In Session Yet</Text>
              <Text style={styles.bannerSub}>Coordinate in chat or tap to lock in a time</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.proposeActionPill}
            onPress={() => {
              try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
              setRequestSpotModalVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Zap size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.proposeActionText}>Propose Time</Text>
          </TouchableOpacity>
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

      {/* Propose Workout Session Modal */}
      <RequestSpotModal
        visible={requestSpotModalVisible}
        profile={match.partner}
        onClose={() => setRequestSpotModalVisible(false)}
        onSubmit={handleProposeSpotSubmitted}
      />

      {/* Profile Details Modal when tapping avatar/name */}
      <ProfileDetailsModal
        visible={profileModalVisible}
        profile={match.partner}
        onClose={() => setProfileModalVisible(false)}
      />

      {/* Report & Block User Modal */}
      
      {/* Dedicated Session Management Sheet with Check-in & Review */}
      <Modal visible={sessionDetailsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdropTouch}
            onPress={() => setSessionDetailsModalVisible(false)}
            activeOpacity={1}
          />
          <View style={styles.sessionSheet}>
            <View style={styles.sheetDragPill} />
            <View style={styles.sessionSheetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.sessionIconCircle, { backgroundColor: currentSession?.isRecurring ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)' }]}>
                  <Dumbbell size={18} color={currentSession?.isRecurring ? '#FBBF24' : COLORS.primary} />
                </View>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.sheetTitle}>
                    {currentSession?.isRecurring ? 'Standing Partnership' : 'Scheduled Workout'}
                  </Text>
                  <Text style={styles.sheetSub}>with {match.partner.name}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setSessionDetailsModalVisible(false)} style={styles.sheetCloseBtn}>
                <X size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Session Info Details */}
            <View style={styles.sessionDetailBox}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>TIME & CADENCE</Text>
                <Text style={styles.detailValue}>
                  {currentSession?.isRecurring ? currentSession?.recurringDays?.join(' / ') + ' @ ' + currentSession?.scheduledTime : currentSession?.scheduledDate + ' @ ' + currentSession?.scheduledTime}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>LOCATION</Text>
                <Text style={styles.detailValue}>{currentSession?.gymName}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>SPLIT FOCUS</Text>
                <Text style={styles.detailValue}>{currentSession?.splitFocus}</Text>
              </View>
              {currentSession?.isRecurring && (
                <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                  <Text style={styles.detailLabel}>CONSISTENCY STREAK</Text>
                  <Text style={[styles.detailValue, { color: '#FBBF24', fontWeight: '800' }]}>
                    🔥 {currentSession?.streakWeeks || 3}-Week Streak ({currentSession?.totalSessionsCompleted || 9} completed)
                  </Text>
                </View>
              )}
            </View>

            {/* Action Buttons: Big, Spacious & Dedicated */}
            <View style={styles.sheetActionsStack}>
              {/* Check In Action */}
              <TouchableOpacity
                style={[styles.bigCheckInBtn, checkedIn && styles.bigCheckInBtnDone]}
                onPress={() => {
                  try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
                  setCheckedIn(!checkedIn);
                }}
                activeOpacity={0.85}
              >
                <CheckCircle size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.bigCheckInBtnText}>
                  {checkedIn ? '✓ You Are Checked In (I Am Here)' : 'Check In at Front Desk'}
                </Text>
              </TouchableOpacity>

              {/* Post Workout Review Action */}
              <TouchableOpacity
                style={[styles.bigReviewBtn, sessionReviewed && styles.bigReviewBtnDone]}
                onPress={() => {
                  setSessionDetailsModalVisible(false);
                  setTimeout(() => setReviewModalVisible(true), 200);
                }}
                activeOpacity={0.85}
              >
                <Star size={18} color={sessionReviewed ? '#FFFFFF' : '#FBBF24'} fill={sessionReviewed ? '#FFFFFF' : 'none'} style={{ marginRight: 8 }} />
                <Text style={[styles.bigReviewBtnText, sessionReviewed && { color: '#FFFFFF' }]}>
                  {sessionReviewed ? '✓ Reviewed (' + match.partner.name + ')' : 'Leave Post-Workout Review'}
                </Text>
              </TouchableOpacity>

              {/* Reschedule / Propose New Time */}
              <TouchableOpacity
                style={styles.rescheduleBtn}
                onPress={() => {
                  setSessionDetailsModalVisible(false);
                  setTimeout(() => setRequestSpotModalVisible(true), 200);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.rescheduleBtnText}>🔄 Reschedule / Propose Different Time</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  managePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  managePillText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  managePillTextDone: {
    color: '#34D399',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalBackdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  sessionSheet: {
    backgroundColor: '#11141F',
    borderTopLeftRadius: BORDER_RADIUS.xl + 4,
    borderTopRightRadius: BORDER_RADIUS.xl + 4,
    padding: SPACING.xl,
    paddingTop: 10,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sheetDragPill: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  sessionSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sheetSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  sheetCloseBtn: {
    padding: 6,
  },
  sessionDetailBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  sheetActionsStack: {
    gap: 10,
  },
  bigCheckInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
  },
  bigCheckInBtnDone: {
    backgroundColor: '#059669',
  },
  bigCheckInBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  bigReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  bigReviewBtnDone: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  bigReviewBtnText: {
    color: '#FBBF24',
    fontSize: 14,
    fontWeight: '700',
  },
  rescheduleBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  rescheduleBtnText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  workoutBannerRecurring: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderBottomColor: 'rgba(245, 158, 11, 0.3)',
  },
  sessionIconCircleRecurring: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  streakBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#FBBF24',
  },
  streakBadgeText: {
    color: '#FBBF24',
    fontSize: 9,
    fontWeight: '800',
  },
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
    marginRight: 4,
  },
  partnerProfileTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 2,
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
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.25)',
    gap: 8,
  },
  noSessionBanner: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderBottomColor: 'rgba(139, 92, 246, 0.25)',
    paddingVertical: 10,
  },
  sessionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    marginRight: 4,
  },
  bannerTextCol: {
    flex: 1,
    minWidth: 0,
  },
  proposeIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTitle: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  noSessionTitle: {
    color: '#DDD6FE',
    fontSize: 13,
    fontWeight: '700',
  },
  bannerSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  bannerActionsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  proposeActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentPurple,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    flexShrink: 0,
  },
  proposeActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
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
    paddingHorizontal: 8,
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
