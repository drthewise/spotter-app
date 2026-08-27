import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Flame, Radio, MessageSquare, User } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { DiscoveryScreen } from './src/screens/DiscoveryScreen';
import { BeaconScreen } from './src/screens/BeaconScreen';
import { MatchesScreen } from './src/screens/MatchesScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ChatDetailScreen } from './src/screens/ChatDetailScreen';
import { MOCK_MATCHES } from './src/data/mockData';
import { Match } from './src/types';
import { COLORS } from './src/constants/theme';

type TabType = 'discover' | 'beacon' | 'matches' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('discover');
  const [activeChatMatch, setActiveChatMatch] = useState<Match | null>(null);

  const handleNavigateToChat = (matchId: string) => {
    const found = MOCK_MATCHES.find((m) => m.id === matchId) || MOCK_MATCHES[0];
    setActiveChatMatch(found);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Main Content View */}
      <View style={styles.screenArea}>
        {activeChatMatch ? (
          <ChatDetailScreen
            key={activeChatMatch.id}
            match={activeChatMatch}
            onBack={() => setActiveChatMatch(null)}
          />
        ) : (
          <>
            {activeTab === 'discover' && <DiscoveryScreen onNavigateToChat={handleNavigateToChat} />}
            {activeTab === 'beacon' && <BeaconScreen />}
            {activeTab === 'matches' && (
              <MatchesScreen onSelectMatch={(match) => setActiveChatMatch(match)} />
            )}
            {activeTab === 'profile' && <ProfileScreen />}
          </>
        )}
      </View>

      {/* Bottom Tab Bar (Hidden when inside active 1-on-1 chat) */}
      {!activeChatMatch && (
        <View style={styles.tabBar}>
          {/* Discover Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('discover')}
          >
            <Flame
              size={22}
              color={activeTab === 'discover' ? COLORS.primary : COLORS.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'discover' && styles.tabLabelActive,
              ]}
            >
              Discover
            </Text>
          </TouchableOpacity>

          {/* Gym Beacon Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('beacon')}
          >
            <Radio
              size={22}
              color={activeTab === 'beacon' ? COLORS.primary : COLORS.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'beacon' && styles.tabLabelActive,
              ]}
            >
              Beacon
            </Text>
          </TouchableOpacity>

          {/* Matches Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('matches')}
          >
            <MessageSquare
              size={22}
              color={activeTab === 'matches' ? COLORS.primary : COLORS.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'matches' && styles.tabLabelActive,
              ]}
            >
              Matches
            </Text>
          </TouchableOpacity>

          {/* Profile Tab */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('profile')}
          >
            <User
              size={22}
              color={activeTab === 'profile' ? COLORS.primary : COLORS.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === 'profile' && styles.tabLabelActive,
              ]}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenArea: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0F121A',
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    paddingTop: 10,
    paddingBottom: 24,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
