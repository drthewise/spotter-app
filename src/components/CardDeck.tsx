import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import { X, Heart, Zap, RotateCcw, SlidersHorizontal } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { UserProfile } from '../types';
import { ProfileCard } from './ProfileCard';
import { RequestSpotModal, SpotProposalDetails } from './RequestSpotModal';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;

interface CardDeckProps {
  profiles: UserProfile[];
  onSwipeLeft: (profile: UserProfile) => void;
  onSwipeRight: (profile: UserProfile) => void;
  onSuperSpot: (profile: UserProfile, details: SpotProposalDetails) => void;
  onOpenFilter?: () => void;
}

export const CardDeck: React.FC<CardDeckProps> = ({
  profiles,
  onSwipeLeft,
  onSwipeRight,
  onSuperSpot,
  onOpenFilter,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [superSpotModalVisible, setSuperSpotModalVisible] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 12 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
      onMoveShouldSetPanResponderCapture: () => false,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      },
      onPanResponderTerminate: () => {
        resetPosition();
      },
    })
  ).current;

  const forceSwipe = (direction: 'left' | 'right') => {
    const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const onSwipeComplete = (direction: 'left' | 'right') => {
    const item = profiles[currentIndex];
    if (direction === 'right') {
      onSwipeRight(item);
    } else {
      onSwipeLeft(item);
    }
    position.setValue({ x: 0, y: 0 });
    setCurrentIndex((prev) => prev + 1);
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false,
    }).start();
  };

  const undoSwipe = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      position.setValue({ x: 0, y: 0 });
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
  };

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
    outputRange: ['-20deg', '0deg', '20deg'],
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [10, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const passOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, -10],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const currentProfile = profiles[currentIndex];

  if (currentIndex >= profiles.length) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Zap size={36} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyTitle}>You've seen everyone nearby!</Text>
        <Text style={styles.emptySubtitle}>
          Adjust your gym filters, distance radius, or post a live Gym Beacon to find someone right now.
        </Text>
        <TouchableOpacity style={styles.resetButton} onPress={() => setCurrentIndex(0)}>
          <RotateCcw size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.resetButtonText}>Refresh Lifters Deck</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardArea}>
        {currentIndex + 1 < profiles.length && (
          <View style={[styles.cardContainer, styles.nextCard]}>
            <ProfileCard
              profile={profiles[currentIndex + 1]}
              onRequestSpot={() => setSuperSpotModalVisible(true)}
              onConnect={() => forceSwipe('right')}
            />
          </View>
        )}

        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [{ translateX: position.x }, { translateY: position.y }, { rotate }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <Animated.View style={[styles.stamp, styles.likeStamp, { opacity: likeOpacity }]} pointerEvents="none">
            <Text style={styles.likeStampText}>CONNECT</Text>
          </Animated.View>

          <Animated.View style={[styles.stamp, styles.passStamp, { opacity: passOpacity }]} pointerEvents="none">
            <Text style={styles.passStampText}>PASS</Text>
          </Animated.View>

          <ProfileCard
            profile={currentProfile}
            isTopCard
            onRequestSpot={() => setSuperSpotModalVisible(true)}
            onConnect={() => forceSwipe('right')}
          />
        </Animated.View>
      </View>

      <View style={styles.actionsBar}>
        <TouchableOpacity
          style={[styles.smallActionBtn, currentIndex === 0 && styles.btnDisabled]}
          onPress={undoSwipe}
          disabled={currentIndex === 0}
        >
          <RotateCcw size={18} color={currentIndex === 0 ? COLORS.textMuted : COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.mainActionBtn, styles.passBtn]} onPress={() => forceSwipe('left')}>
          <X size={28} color={COLORS.pass} strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.mainActionBtn, styles.superSpotBtn]}
          onPress={() => setSuperSpotModalVisible(true)}
        >
          <Zap size={26} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.mainActionBtn, styles.connectBtn]} onPress={() => forceSwipe('right')}>
          <Heart size={28} color={COLORS.connect} strokeWidth={2.5} fill={COLORS.connect} />
        </TouchableOpacity>
      </View>

      <RequestSpotModal
        visible={superSpotModalVisible}
        profile={currentProfile}
        onClose={() => setSuperSpotModalVisible(false)}
        onSubmit={(details: SpotProposalDetails) => {
          onSuperSpot(currentProfile, details);
          forceSwipe('right');
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  cardArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: SCREEN_WIDTH,
  },
  cardContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextCard: {
    transform: [{ scale: 0.95 }, { translateY: 10 }],
    opacity: 0.7,
  },
  stamp: {
    position: 'absolute',
    top: 50,
    zIndex: 100,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 3,
  },
  likeStamp: {
    right: 24,
    borderColor: COLORS.connect,
    transform: [{ rotate: '15deg' }],
  },
  likeStampText: {
    color: COLORS.connect,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  passStamp: {
    left: 24,
    borderColor: COLORS.pass,
    transform: [{ rotate: '-15deg' }],
  },
  passStampText: {
    color: COLORS.pass,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: SCREEN_WIDTH * 0.9,
    paddingVertical: SPACING.md,
  },
  smallActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  mainActionBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  passBtn: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  connectBtn: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  superSpotBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.accentPurple,
    borderColor: '#A78BFA',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.xl,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.full,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
