import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Modal, Image } from 'react-native';
import { SlidersHorizontal, Dumbbell, Sparkles, MessageCircle } from 'lucide-react-native';
import { CardDeck } from '../components/CardDeck';
import { FilterModal } from '../components/FilterModal';
import { MOCK_PROFILES, CURRENT_USER } from '../data/mockData';
import { UserProfile } from '../types';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';

interface DiscoveryScreenProps {
  onNavigateToChat?: (matchId: string) => void;
}

export const DiscoveryScreen: React.FC<DiscoveryScreenProps> = ({ onNavigateToChat }) => {
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<UserProfile | null>(null);

  const handleSwipeLeft = (profile: UserProfile) => {
    console.log('Passed on:', profile.name);
  };

  const handleSwipeRight = (profile: UserProfile) => {
    console.log('Connected with:', profile.name);
    if (profile.id === 'user_maya' || Math.random() > 0.5) {
      setMatchedProfile(profile);
    }
  };

  const handleSuperSpot = (profile: UserProfile, details: any) => {
    console.log('Super-Spot sent to:', profile.name, details);
    setMatchedProfile(profile);
  };

  const myPhotoSrc = typeof CURRENT_USER.photos[0] === 'string' ? { uri: CURRENT_USER.photos[0] } : CURRENT_USER.photos[0];
  const partnerPhotoSrc = matchedProfile ? (typeof matchedProfile.photos[0] === 'string' ? { uri: matchedProfile.photos[0] } : matchedProfile.photos[0]) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Dumbbell size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.logoText}>SPOTTER</Text>
          <View style={styles.betaPill}>
            <Text style={styles.betaText}>BETA</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterModalVisible(true)}>
          <SlidersHorizontal size={18} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.gymContextBar}>
        <Text style={styles.gymContextLabel}>Home Base: </Text>
        <Text style={styles.gymContextName}>{CURRENT_USER.primaryGym.branchName}</Text>
      </View>

      <CardDeck
        profiles={MOCK_PROFILES}
        onSwipeLeft={handleSwipeLeft}
        onSwipeRight={handleSwipeRight}
        onSuperSpot={handleSuperSpot}
        onOpenFilter={() => setFilterModalVisible(true)}
      />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={(filters) => console.log('Applied filters:', filters)}
      />

      <Modal visible={!!matchedProfile} transparent animationType="fade">
        <View style={styles.matchOverlay}>
          <View style={styles.matchCard}>
            <View style={styles.matchSparkle}>
              <Sparkles size={32} color={COLORS.primary} />
            </View>

            <Text style={styles.matchHeading}>IT'S A SPOT MATCH!</Text>
            <Text style={styles.matchSub}>
              You and {matchedProfile?.name} both train at {CURRENT_USER.primaryGym.brand} with matching schedules.
            </Text>

            <View style={styles.matchAvatarsRow}>
              <Image source={myPhotoSrc} style={styles.matchAvatar} />
              <View style={styles.matchDumbbellDivider}>
                <Dumbbell size={18} color="#FFFFFF" />
              </View>
              {partnerPhotoSrc && <Image source={partnerPhotoSrc} style={styles.matchAvatar} />}
            </View>

            <TouchableOpacity
              style={styles.chatNowBtn}
              onPress={() => {
                setMatchedProfile(null);
                if (onNavigateToChat) onNavigateToChat('match_1');
              }}
            >
              <MessageCircle size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.chatNowText}>Lock in a Workout</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.keepSwipingBtn} onPress={() => setMatchedProfile(null)}>
              <Text style={styles.keepSwipingText}>Keep Browsing</Text>
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
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  betaPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  betaText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '800',
  },
  filterBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  gymContextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  gymContextLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  gymContextName: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  matchOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  matchCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  matchSparkle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  matchHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textPrimary,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 6,
  },
  matchSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.lg,
  },
  matchAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  matchAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  matchDumbbellDivider: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: -12,
    zIndex: 10,
  },
  chatNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  chatNowText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  keepSwipingBtn: {
    paddingVertical: 8,
  },
  keepSwipingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});
