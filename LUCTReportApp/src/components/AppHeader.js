// src/components/AppHeader.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { COLORS } from '../../config/theme';
import { spacing, typography, shadows } from '../../config/theme';

export default function AppHeader({ title, navigation, showBack = false, showNotifications = true, showSearch = false, onSearch }) {
  const { unreadCount } = useSelector((s) => s.notifications || { unreadCount: 0 });

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => navigation?.openDrawer?.()} style={styles.iconBtn}>
            <Ionicons name="menu" size={26} color={COLORS.text} />
          </TouchableOpacity>
        )}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      <View style={styles.right}>
        {showSearch && (
          <TouchableOpacity onPress={onSearch} style={styles.iconBtn}>
            <Ionicons name="search-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        )}
        {showNotifications && (
          <TouchableOpacity
            onPress={() => navigation?.navigate?.('Notifications')}
            style={styles.iconBtn}
          >
            <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
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
    backgroundColor: COLORS.headerBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.headerBorder,
    ...shadows.small,
  },
  left: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  right: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  title: { 
    ...typography.h4, 
    color: COLORS.headerText, 
    marginLeft: spacing.sm, 
    flex: 1 
  },
  iconBtn: { 
    padding: spacing.xs, 
    marginHorizontal: 2, 
    position: 'relative' 
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { 
    color: COLORS.buttonPrimaryText, 
    fontSize: 10, 
    fontWeight: '700' 
  },
});