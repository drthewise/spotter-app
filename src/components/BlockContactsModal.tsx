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
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  X,
  UserX,
  Plus,
  Phone,
  Mail,
  Shield,
  Trash2,
  Check,
  Search,
  Lock,
  Users,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';

export interface BlockedContact {
  id: string;
  name?: string;
  type: 'phone' | 'email';
  identifier: string; // Phone number or email
  addedAt: string;
}

const INITIAL_BLOCKED: BlockedContact[] = [
  {
    id: 'blk_1',
    name: 'Ex-Partner',
    type: 'phone',
    identifier: '+1 (201) 555-0194',
    addedAt: 'Aug 12',
  },
  {
    id: 'blk_2',
    name: 'Former Coworker',
    type: 'email',
    identifier: 'kevin.work@company.com',
    addedAt: 'Aug 20',
  },
];

interface BlockContactsModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdateCount?: (count: number) => void;
}

export const BlockContactsModal: React.FC<BlockContactsModalProps> = ({
  visible,
  onClose,
  onUpdateCount,
}) => {
  const [blockedList, setBlockedList] = useState<BlockedContact[]>(INITIAL_BLOCKED);
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');
  const [inputVal, setInputVal] = useState('');
  const [labelVal, setLabelVal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddBlocked = () => {
    if (!inputVal.trim()) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    const newContact: BlockedContact = {
      id: 'blk_' + Date.now(),
      name: labelVal.trim() || undefined,
      type: activeTab,
      identifier: inputVal.trim(),
      addedAt: 'Just now',
    };

    const updated = [newContact, ...blockedList];
    setBlockedList(updated);
    if (onUpdateCount) onUpdateCount(updated.length);

    setInputVal('');
    setLabelVal('');
    setShowAddForm(false);
  };

  const handleRemove = (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    const updated = blockedList.filter((b) => b.id !== id);
    setBlockedList(updated);
    if (onUpdateCount) onUpdateCount(updated.length);
  };

  const filteredList = blockedList.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (b.name && b.name.toLowerCase().includes(q)) ||
      b.identifier.toLowerCase().includes(q)
    );
  });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconCircle}>
              <UserX size={18} color="#EF4444" />
            </View>
            <View>
              <Text style={styles.title}>Block Contacts & Specific People</Text>
              <Text style={styles.subtitle}>Prevent acquaintances, exes, or coworkers from finding you</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Privacy Note Banner */}
        <View style={styles.privacyBanner}>
          <Lock size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
          <Text style={styles.privacyBannerText}>
            Contacts are hashed privately. Blocked people will never be notified or see your profile.
          </Text>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Add Contact Card / Toggle */}
            {!showAddForm ? (
              <TouchableOpacity
                style={styles.openAddBtn}
                onPress={() => setShowAddForm(true)}
                activeOpacity={0.8}
              >
                <Plus size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                <Text style={styles.openAddBtnText}>+ Block Someone by Phone Number or Email</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.addFormCard}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Add Person to Block List</Text>
                  <TouchableOpacity onPress={() => setShowAddForm(false)}>
                    <X size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* Tabs: Phone vs Email */}
                <View style={styles.tabRow}>
                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'phone' && styles.tabActive]}
                    onPress={() => setActiveTab('phone')}
                  >
                    <Phone size={13} color={activeTab === 'phone' ? COLORS.primary : COLORS.textMuted} style={{ marginRight: 4 }} />
                    <Text style={[styles.tabText, activeTab === 'phone' && styles.tabTextActive]}>Phone Number</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.tab, activeTab === 'email' && styles.tabActive]}
                    onPress={() => setActiveTab('email')}
                  >
                    <Mail size={13} color={activeTab === 'email' ? COLORS.primary : COLORS.textMuted} style={{ marginRight: 4 }} />
                    <Text style={[styles.tabText, activeTab === 'email' && styles.tabTextActive]}>Email Address</Text>
                  </TouchableOpacity>
                </View>

                {/* Identifier Input */}
                <TextInput
                  style={styles.input}
                  placeholder={activeTab === 'phone' ? 'e.g. (201) 555-0194' : 'e.g. coworker@gym.com'}
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType={activeTab === 'phone' ? 'phone-pad' : 'email-address'}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={inputVal}
                  onChangeText={setInputVal}
                />

                {/* Nickname / Label Input */}
                <TextInput
                  style={styles.input}
                  placeholder="Optional Name or Label (e.g. Coworker, Ex)"
                  placeholderTextColor={COLORS.textMuted}
                  value={labelVal}
                  onChangeText={setLabelVal}
                />

                {/* Submit Add */}
                <View style={styles.formBtnRow}>
                  <TouchableOpacity
                    style={styles.cancelFormBtn}
                    onPress={() => setShowAddForm(false)}
                  >
                    <Text style={styles.cancelFormText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.submitAddBtn, !inputVal.trim() && styles.submitBtnDisabled]}
                    onPress={handleAddBlocked}
                    disabled={!inputVal.trim()}
                  >
                    <Shield size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.submitAddText}>Block Contact</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Search Filter for Blocked List */}
            {blockedList.length > 2 && (
              <View style={styles.searchContainer}>
                <Search size={16} color={COLORS.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search blocked numbers or emails..."
                  placeholderTextColor={COLORS.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            )}

            {/* Blocked List Items */}
            <Text style={styles.sectionHeader}>
              BLOCKED LIST ({blockedList.length})
            </Text>

            {filteredList.map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={styles.contactIconCircle}>
                  {contact.type === 'phone' ? (
                    <Phone size={14} color="#EF4444" />
                  ) : (
                    <Mail size={14} color="#EF4444" />
                  )}
                </View>

                <View style={styles.contactInfo}>
                  {contact.name && (
                    <Text style={styles.contactName}>{contact.name}</Text>
                  )}
                  <Text style={styles.contactIdentifier}>{contact.identifier}</Text>
                  <Text style={styles.contactDate}>Blocked {contact.addedAt}</Text>
                </View>

                <TouchableOpacity
                  style={styles.unblockBtn}
                  onPress={() => handleRemove(contact.id)}
                  activeOpacity={0.7}
                >
                  <Trash2 size={13} color={COLORS.textSecondary} style={{ marginRight: 3 }} />
                  <Text style={styles.unblockText}>Unblock</Text>
                </TouchableOpacity>
              </View>
            ))}

            {filteredList.length === 0 && (
              <View style={styles.emptyState}>
                <Shield size={32} color={COLORS.textMuted} style={{ marginBottom: 8 }} />
                <Text style={styles.emptyTitle}>No Blocked Contacts Yet</Text>
                <Text style={styles.emptySub}>
                  Add phone numbers or emails above to ensure specific people can never encounter your profile.
                </Text>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0D14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(16, 185, 129, 0.2)',
  },
  privacyBannerText: {
    fontSize: 11,
    color: '#6EE7B7',
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  openAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  openAddBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  addFormCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: SPACING.lg,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  tabActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: SPACING.sm,
  },
  formBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelFormBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  cancelFormText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  submitAddBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#DC2626',
    paddingVertical: 10,
  },
  submitBtnDisabled: {
    opacity: 0.4,
  },
  submitAddText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  searchInput: {
    flex: 1,
    color: COLORS.textPrimary,
    fontSize: 12,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  contactIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  contactIdentifier: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginTop: 1,
  },
  contactDate: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  unblockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.sm,
  },
  unblockText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
