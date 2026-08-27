import React, { useState } from 'react';
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
import { ArrowLeft, Dumbbell, Send, ShieldCheck, CheckCircle } from 'lucide-react-native';
import { Match, ChatMessage } from '../types';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';
import { CURRENT_USER } from '../data/mockData';

interface ChatDetailScreenProps {
  match: Match;
  onBack: () => void;
}

export const ChatDetailScreen: React.FC<ChatDetailScreenProps> = ({ match, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      senderId: match.partner.id,
      text: `Hey Dave! Saw you train at ${match.partner.primaryGym.brand} too. What are you hitting this week?`,
      timestamp: 'Yesterday 4:15 PM',
    },
    {
      id: '2',
      senderId: CURRENT_USER.id,
      text: "Hey! Doing heavy Push day tomorrow at 6 PM. Going for a heavy bench single, need someone on lift-off.",
      timestamp: 'Yesterday 4:30 PM',
    },
    {
      id: '3',
      senderId: match.partner.id,
      text: "Awesome, see you on bench station 3 at 6 PM!",
      timestamp: '5:12 PM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [checkedIn, setCheckedIn] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: String(Date.now()),
      senderId: CURRENT_USER.id,
      text: inputText.trim(),
      timestamp: 'Just now',
    };

    setMessages([...messages, newMsg]);
    setInputText('');
  };

  const partnerPhotoSrc = typeof match.partner.photos[0] === 'string' ? { uri: match.partner.photos[0] } : match.partner.photos[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Image source={partnerPhotoSrc} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{match.partner.name}</Text>
          <Text style={styles.gymName}>📍 {match.partner.primaryGym.branchName}</Text>
        </View>
        <View style={styles.reliabilityPill}>
          <ShieldCheck size={12} color="#FBBF24" />
          <Text style={styles.reliabilityText}>{match.partner.reliabilityScore.toFixed(0)}%</Text>
        </View>
      </View>

      <View style={styles.workoutBanner}>
        <View style={styles.bannerLeft}>
          <Dumbbell size={18} color={COLORS.primary} />
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.bannerTitle}>Thursday Push Day @ 6:00 PM</Text>
            <Text style={styles.bannerSub}>${match.partner.primaryGym.brand} - Station 3 • In-Gym Geofence Active</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.checkInBtn, checkedIn && styles.checkInBtnDone]}
          onPress={() => setCheckedIn(true)}
        >
          <CheckCircle size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.checkInBtnText}>{checkedIn ? 'Checked In' : 'I Am Here'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.messagesList} showsVerticalScrollIndicator={false}>
        {messages.map((msg) => {
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

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type workout details or split questions..."
            placeholderTextColor={COLORS.textMuted}
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Send size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  bannerSub: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  checkInBtnDone: {
    backgroundColor: '#059669',
  },
  checkInBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  messagesList: {
    padding: SPACING.lg,
    paddingBottom: 20,
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
