import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Clock, CheckCircle2, Dumbbell } from 'lucide-react-native';
import { MOCK_MATCHES } from '../data/mockData';
import { Match } from '../types';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';

interface MatchesScreenProps {
  onSelectMatch: (match: Match) => void;
}

export const MatchesScreen: React.FC<MatchesScreenProps> = ({ onSelectMatch }) => {
  const activeSessions = MOCK_MATCHES.filter((m) => m.activeSession);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Matches & Workouts</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
      </ScrollView>
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
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
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
});
