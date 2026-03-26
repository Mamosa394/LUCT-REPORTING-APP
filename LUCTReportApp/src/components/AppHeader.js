import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { COLORS } from '../../styles/colors';
import { SPACING, TYPOGRAPHY, SHADOWS } from '../../styles/typography';

export default function AppHeader({ title, navigation, showBack = false, showNotifications = true, showSearch = false, onSearch }) {
  const { unreadCount } = useSelector((s) => s.notifications);

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => navigation?.openDrawer?.()} style={styles.iconBtn}>
            <Ionicons name="menu" size={26} color={COLORS.white} />
          </TouchableOpacity>
        )}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      <View style={styles.right}>
        {showSearch && (
          <TouchableOpacity onPress={onSearch} style={styles.iconBtn}>
            <Ionicons name="search-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
        )}
        {showNotifications && (
          <TouchableOpacity
            onPress={() => navigation?.navigate?.('Notifications')}
            style={styles.iconBtn}
          >
            <Ionicons name="notifications-outline" size={22} color={COLORS.white} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    ...SHADOWS.md,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  right: { flexDirection: 'row', alignItems: 'center' },
  title: { ...TYPOGRAPHY.h5, color: COLORS.white, marginLeft: SPACING.sm, flex: 1 },
  iconBtn: { padding: SPACING.xs, marginHorizontal: 2, position: 'relative' },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
});