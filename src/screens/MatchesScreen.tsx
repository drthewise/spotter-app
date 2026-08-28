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
} from 'react-native';
import { Clock, CheckCircle2, Dumbbell, Users, Plus, Calendar, MessageSquare, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { MOCK_MATCHES, MOCK_CREWS, CURRENT_USER } from '../data/mockData';
import { Match, GymCrew } from '../types';
import { CreateCrewModal } from '../components/CreateCrewModal';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';

interface MatchesScreenProps {
  onSelectMatch: (match: Match) => void;
}

export const MatchesScreen: React.FC<MatchesScreenProps> = ({ onSelectMatch }) => {
  const [activeTab, setActiveTab] = useState<'matches' | 'crews'>('matches');
  const [crewsList, setCrewsList] = useState<GymCrew[]>(MOCK_CREWS);
  const [createCrewVisible, setCreateCrewVisible] = useState(false);
  const [activeCrew, setActiveCrew] = useState<GymCrew | null>(null);

  const activeSessions = MOCK_MATCHES.filter((m) => m.activeSession);

  const handleCreateCrew = (newCrew: GymCrew) => {
    setCrewsList([newCrew, ...crewsList]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with Segmented Switch */}
      <View style={styles.header}>
        <Text style={styles.title}>Matches & Squads</Text>
        <View style={styles.tabToggleRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'matches' && styles.tabBtnActive]}
            onPress={() => {
              try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
              setActiveTab('matches');
            }}
          >
            <Text style={[styles.tabBtnText, activeTab === 'matches' && styles.tabBtnTextActive]}>
              1-on-1 Chats ({MOCK_MATCHES.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'crews' && styles.tabBtnActive]}
            onPress={() => {
              try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
              setActiveTab('crews');
            }}
          >
            <Text style={[styles.tabBtnText, activeTab === 'crews' && styles.tabBtnTextActive]}>
              Gym Crews ({crewsList.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'matches' ? (
          <>
            {/* Locked In Workout Sessions */}
            {activeSessions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🔒 LOCKED-IN WORKOUT SESSIONS</Text>
                {activeSessions.map((m) => {
                  const session = m.activeSession!;
                  const photoSrc = typeof m.partner.photos[0] === 'string' ? { uri: m.partner.photos[0] } : m.partner.photos[0];
                  return (
                    <TouchableOpacity
                      key={session.id}
                      style={styles.sessionCard}
                      onPress={() => onSelectMatch(m)}
                    >
                      <View style={styles.sessionHeader}>
                        <View style={styles.sessionPartnerRow}>
                          <Image source={photoSrc} style={styles.sessionAvatar} />
                          <View>
                            <Text style={styles.sessionWithText}>Training with {m.partner.name}</Text>
                            <Text style={styles.sessionGymText}>📍 {session.gymName}</Text>
                          </View>
                        </View>
                        <View style={styles.sessionTimeBadge}>
                          <Clock size={12} color="#10B981" style={{ marginRight: 4 }} />
                          <Text style={styles.sessionTimeText}>{session.scheduledDate}, {session.scheduledTime}</Text>
                        </View>
                      </View>

                      <View style={styles.sessionFocusRow}>
                        <Dumbbell size={13} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                        <Text style={styles.sessionFocusText}>Focus: {session.splitFocus}</Text>
                      </View>

                      <View style={styles.checkinStatusRow}>
                        <View style={styles.checkinPill}>
                          <CheckCircle2 size={13} color={session.userCheckedIn ? '#10B981' : COLORS.textMuted} />
                          <Text style={[styles.checkinPillText, session.userCheckedIn && styles.checkedInText]}>
                            {session.userCheckedIn ? 'You Checked In' : 'Pending Check-In'}
                          </Text>
                        </View>
                        <View style={styles.checkinPill}>
                          <CheckCircle2 size={13} color={session.partnerCheckedIn ? '#10B981' : COLORS.textMuted} />
                          <Text style={[styles.checkinPillText, session.partnerCheckedIn && styles.checkedInText]}>
                            {session.partnerCheckedIn ? `${m.partner.name} Checked In` : `Waiting for ${m.partner.name}`}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Direct Messages List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ALL CHATS</Text>
              {MOCK_MATCHES.map((match) => {
                const photoSrc = typeof match.partner.photos[0] === 'string' ? { uri: match.partner.photos[0] } : match.partner.photos[0];
                return (
                  <TouchableOpacity
                    key={match.id}
                    style={styles.chatRow}
                    onPress={() => onSelectMatch(match)}
                  >
                    <Image source={photoSrc} style={styles.chatAvatar} />
                    <View style={styles.chatInfo}>
                      <View style={styles.chatNameRow}>
                        <Text style={styles.chatName}>{match.partner.name}</Text>
                        <Text style={styles.chatTime}>{match.lastMessageTime}</Text>
                      </View>
                      <Text style={styles.lastMessage} numberOfLines={1}>
                        {match.lastMessage}
                      </Text>
                    </View>
                    {match.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{match.unreadCount}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : (
          /* Gym Crews Section */
          <View style={styles.section}>
            {/* Create Crew Header Button */}
            <TouchableOpacity
              style={styles.createCrewBanner}
              onPress={() => setCreateCrewVisible(true)}
              activeOpacity={0.8}
            >
              <View style={styles.createCrewIcon}>
                <Plus size={18} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.createCrewTitle}>Form a New Gym Crew</Text>
                <Text style={styles.createCrewSub}>Coordinate 3–5 lifters for Saturday leg days or group sessions</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>ACTIVE GYM CREWS & SQUADS</Text>

            {crewsList.map((crew) => (
              <View key={crew.id} style={styles.crewCard}>
                <View style={styles.crewTopRow}>
                  <View style={styles.crewIconBadge}>
                    <Users size={20} color={COLORS.primary} />
                  </View>
                  <View style={styles.crewTitleCol}>
                    <Text style={styles.crewName}>{crew.name}</Text>
                    <Text style={styles.crewGym}>📍 {crew.gymName} • {crew.modality}</Text>
                  </View>
                  <View style={styles.memberCountBadge}>
                    <Text style={styles.memberCountText}>{crew.members.length} lifters</Text>
                  </View>
                </View>

                <Text style={styles.crewTagline}>{crew.tagline}</Text>

                {/* Member Avatars Stack */}
                <View style={styles.membersRow}>
                  <View style={styles.avatarStack}>
                    {crew.members.map((member, idx) => {
                      const photoSrc = typeof member.photo === 'string' ? { uri: member.photo } : member.photo;
                      return (
                        <Image
                          key={member.id}
                          source={photoSrc}
                          style={[styles.stackedAvatar, { marginLeft: idx === 0 ? 0 : -10 }]}
                        />
                      );
                    })}
                  </View>
                  <Text style={styles.membersNames}>
                    {crew.members.map((m) => m.name).join(', ')}
                  </Text>
                </View>

                {/* Next Scheduled Session */}
                {crew.nextSession && (
                  <View style={styles.nextSessionBox}>
                    <Calendar size={13} color={COLORS.primary} style={{ marginRight: 6 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.nextSessionTitle}>
                        Next: {crew.nextSession.date} @ {crew.nextSession.time}
                      </Text>
                      <Text style={styles.nextSessionSub}>{crew.nextSession.title}</Text>
                    </View>
                  </View>
                )}

                {/* Last Chat Message Preview */}
                {crew.messages.length > 0 && (
                  <View style={styles.crewChatPreview}>
                    <MessageSquare size={12} color={COLORS.textMuted} style={{ marginRight: 6 }} />
                    <Text style={styles.crewChatPreviewText} numberOfLines={1}>
                      <Text style={{ fontWeight: '700', color: COLORS.textPrimary }}>
                        {crew.messages[crew.messages.length - 1].senderName}:{' '}
                      </Text>
                      {crew.messages[crew.messages.length - 1].text}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Crew Modal */}
      <CreateCrewModal
        visible={createCrewVisible}
        onClose={() => setCreateCrewVisible(false)}
        onCreateCrew={handleCreateCrew}
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BORDER_RADIUS.md,
    padding: 3,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  tabBtnActive: {
    backgroundColor: COLORS.surface,
  },
  tabBtnText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  content: {
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  sessionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  sessionPartnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  sessionWithText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sessionGymText: {
    fontSize: 11,
    color: COLORS.badgeGymText,
  },
  sessionTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  sessionTimeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  sessionFocusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sessionFocusText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  checkinStatusRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: SPACING.sm,
  },
  checkinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkinPillText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  checkedInText: {
    color: '#10B981',
    fontWeight: '600',
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  chatTime: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  lastMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  createCrewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  createCrewIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  createCrewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  createCrewSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  crewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  crewTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  crewIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  crewTitleCol: {
    flex: 1,
  },
  crewName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  crewGym: {
    fontSize: 11,
    color: COLORS.badgeGymText,
    marginTop: 1,
  },
  memberCountBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  memberCountText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  crewTagline: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 10,
    lineHeight: 16,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarStack: {
    flexDirection: 'row',
    marginRight: 8,
  },
  stackedAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: '#11141F',
  },
  membersNames: {
    fontSize: 11,
    color: COLORS.textMuted,
    flex: 1,
  },
  nextSessionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  nextSessionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  nextSessionSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  crewChatPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
  },
  crewChatPreviewText: {
    fontSize: 11,
    color: COLORS.textMuted,
    flex: 1,
  },
});
