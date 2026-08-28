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
} from 'react-native';
import { X, Search, MapPin, Check, Building2, Plus, ArrowLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS, BORDER_RADIUS, SPACING } from '../constants/theme';

export interface GymOption {
  id: string;
  brand: string;
  branchName: string;
  neighborhood: string;
  distanceMiles: number;
}

export const POPULAR_GYMS: GymOption[] = [
  {
    id: 'retro_garfield',
    brand: 'Retro Fitness',
    branchName: 'Retro Fitness - Garfield',
    neighborhood: 'Outwater Ln, Garfield, NJ',
    distanceMiles: 0.2,
  },
  {
    id: 'la_clifton',
    brand: 'LA Fitness',
    branchName: 'LA Fitness - Clifton Rt 3',
    neighborhood: 'Rt 3 East, Clifton, NJ',
    distanceMiles: 1.4,
  },
  {
    id: 'pf_garfield',
    brand: 'Planet Fitness',
    branchName: 'Planet Fitness - Garfield',
    neighborhood: 'Passaic St, Garfield, NJ',
    distanceMiles: 0.5,
  },
  {
    id: 'crossfit_gsp',
    brand: 'CrossFit GSP',
    branchName: 'CrossFit GSP - Saddle Brook',
    neighborhood: 'Market St, Saddle Brook, NJ',
    distanceMiles: 2.1,
  },
  {
    id: 'crunch_passaic',
    brand: 'Crunch Fitness',
    branchName: 'Crunch Fitness - Passaic',
    neighborhood: 'Main Ave, Passaic, NJ',
    distanceMiles: 1.8,
  },
  {
    id: '24hr_hackensack',
    brand: '24 Hour Fitness',
    branchName: '24 Hour Fitness - Hackensack',
    neighborhood: 'Hackensack Ave, Hackensack, NJ',
    distanceMiles: 5.4,
  },
  {
    id: 'lifetime_paramus',
    brand: 'Lifetime Fitness',
    branchName: 'Lifetime - Paramus',
    neighborhood: 'E Ridgewood Ave, Paramus, NJ',
    distanceMiles: 6.2,
  },
  {
    id: 'equinox_hoboken',
    brand: 'Equinox',
    branchName: 'Equinox - Hoboken',
    neighborhood: 'Frank Sinatra Dr, Hoboken, NJ',
    distanceMiles: 12.8,
  },
  {
    id: 'blink_clifton',
    brand: 'Blink Fitness',
    branchName: 'Blink Fitness - Clifton',
    neighborhood: 'Clifton Ave, Clifton, NJ',
    distanceMiles: 2.3,
  },
  {
    id: 'ufc_saddlebrook',
    brand: 'UFC Gym',
    branchName: 'UFC Gym - Saddle Brook',
    neighborhood: 'US-46, Saddle Brook, NJ',
    distanceMiles: 2.5,
  },
];

interface GymPickerModalProps {
  visible: boolean;
  currentGym: { brand: string; branchName: string; neighborhood: string };
  onClose: () => void;
  onSelectGym: (gym: { brand: string; branchName: string; neighborhood: string }) => void;
}

export const GymPickerModal: React.FC<GymPickerModalProps> = ({
  visible,
  currentGym,
  onClose,
  onSelectGym,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customGymName, setCustomGymName] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  const filteredGyms = POPULAR_GYMS.filter((g) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      g.brand.toLowerCase().includes(q) ||
      g.branchName.toLowerCase().includes(q) ||
      g.neighborhood.toLowerCase().includes(q)
    );
  });

  const handleSelect = (gym: GymOption) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    onSelectGym({
      brand: gym.brand,
      branchName: gym.branchName,
      neighborhood: gym.neighborhood,
    });
    setSearchQuery('');
    onClose();
  };

  const handleAddCustom = () => {
    if (!customGymName.trim()) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}

    const name = customGymName.trim();
    const city = customCity.trim() || 'Local Area';

    onSelectGym({
      brand: name,
      branchName: name + ' - ' + city,
      neighborhood: city,
    });

    setCustomGymName('');
    setCustomCity('');
    setShowCustomForm(false);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.safeArea}>
        {/* Fixed Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <ArrowLeft size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>Select Home Gym</Text>
            <Text style={styles.subtitle}>Primary base for spot matching & geofence</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.doneBtn} activeOpacity={0.7}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* Fixed Top Search Bar (NEVER gets pushed under keyboard) */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by gym name, brand, or city..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && Platform.OS !== 'ios' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Scrollable Results Area with Keyboard Avoidance */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.sectionHeader}>
              {searchQuery.trim() ? `SEARCH RESULTS (${filteredGyms.length})` : 'NEARBY & POPULAR GYMS'}
            </Text>

            {filteredGyms.map((gym) => {
              const isSelected = currentGym.branchName === gym.branchName;
              return (
                <TouchableOpacity
                  key={gym.id}
                  style={[styles.gymCard, isSelected && styles.gymCardSelected]}
                  onPress={() => handleSelect(gym)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.gymIconCircle, isSelected && styles.gymIconCircleSelected]}>
                    <Building2 size={18} color={isSelected ? '#FFFFFF' : COLORS.primary} />
                  </View>

                  <View style={styles.gymInfo}>
                    <Text style={[styles.gymName, isSelected && styles.gymNameSelected]}>
                      {gym.branchName}
                    </Text>
                    <View style={styles.gymMetaRow}>
                      <MapPin size={11} color={COLORS.textMuted} style={{ marginRight: 3 }} />
                      <Text style={styles.gymAddress}>{gym.neighborhood}</Text>
                      <Text style={styles.gymDistance}>• {gym.distanceMiles} mi</Text>
                    </View>
                  </View>

                  <View style={[styles.checkCircle, isSelected && styles.checkCircleSelected]}>
                    {isSelected && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                </TouchableOpacity>
              );
            })}

            {filteredGyms.length === 0 && (
              <View style={styles.emptyResults}>
                <Text style={styles.emptyTitle}>No gyms matching "{searchQuery}"</Text>
                <Text style={styles.emptySub}>Don't worry, you can add your gym below!</Text>
              </View>
            )}

            {/* Custom Gym Addition */}
            <View style={styles.customSection}>
              {!showCustomForm ? (
                <TouchableOpacity
                  style={styles.addCustomBtn}
                  onPress={() => setShowCustomForm(true)}
                  activeOpacity={0.8}
                >
                  <Plus size={16} color={COLORS.primary} style={{ marginRight: 6 }} />
                  <Text style={styles.addCustomBtnText}>Can't find your gym? Enter custom gym</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.customFormCard}>
                  <Text style={styles.customFormTitle}>Add Custom Gym</Text>
                  <TextInput
                    style={styles.customInput}
                    placeholder="Gym Name (e.g. Iron Addicts Powerlifting)"
                    placeholderTextColor={COLORS.textMuted}
                    value={customGymName}
                    onChangeText={setCustomGymName}
                  />
                  <TextInput
                    style={styles.customInput}
                    placeholder="City / Location (e.g. Garfield, NJ)"
                    placeholderTextColor={COLORS.textMuted}
                    value={customCity}
                    onChangeText={setCustomCity}
                  />
                  <View style={styles.customBtnRow}>
                    <TouchableOpacity
                      style={styles.cancelCustomBtn}
                      onPress={() => setShowCustomForm(false)}
                    >
                      <Text style={styles.cancelCustomText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveCustomBtn, !customGymName.trim() && styles.saveBtnDisabled]}
                      onPress={handleAddCustom}
                      disabled={!customGymName.trim()}
                    >
                      <Text style={styles.saveCustomText}>Save & Set Gym</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
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
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  closeBtn: {
    padding: 6,
  },
  headerCenter: {
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  doneBtn: {
    padding: 6,
  },
  doneText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  searchSection: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#0B0D14',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 11,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  keyboardContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  gymCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  gymCardSelected: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: COLORS.primary,
  },
  gymIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  gymIconCircleSelected: {
    backgroundColor: COLORS.primary,
  },
  gymInfo: {
    flex: 1,
  },
  gymName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  gymNameSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  gymMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  gymAddress: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  gymDistance: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  checkCircleSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  emptyResults: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  emptySub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  customSection: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  addCustomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  addCustomBtnText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  customFormCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  customFormTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  customInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 13,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  customBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelCustomBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  cancelCustomText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  saveCustomBtn: {
    flex: 2,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primary,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveCustomText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
