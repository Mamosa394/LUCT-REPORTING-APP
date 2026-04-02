import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { COLORS, spacing, typography } from '../../config/theme';

export default function AdminPanel({ navigation }) {
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalLecturers: 0,
    totalPRL: 0,
    totalPL: 0,
    recentRegistrations: [],
    recentLogins: [],
    systemHealth: 'Healthy',
  });
  const [activeTab, setActiveTab] = useState('overview'); // overview, registrations, logins, users

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Import Firebase
      const { db } = require('../../src/firebase');
      
      // Fetch user counts by role
      const usersSnapshot = await db.collection('users').get();
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const totalStudents = users.filter(u => u.role === 'student').length;
      const totalLecturers = users.filter(u => u.role === 'lecturer').length;
      const totalPRL = users.filter(u => u.role === 'prl').length;
      const totalPL = users.filter(u => u.role === 'pl').length;
      
      // Fetch recent registrations
      const registrationsSnapshot = await db.collection('registration_logs')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();
      const recentRegistrations = registrationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Fetch recent logins
      const loginsSnapshot = await db.collection('login_logs')
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();
      const recentLogins = loginsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setStats({
        totalUsers: users.length,
        totalStudents,
        totalLecturers,
        totalPRL,
        totalPL,
        recentRegistrations,
        recentLogins,
        systemHealth: 'Healthy',
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
      Alert.alert('Error', 'Failed to load admin data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAdminData();
    setRefreshing(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'student': return COLORS.info || '#2196F3';
      case 'lecturer': return COLORS.success || '#4CAF50';
      case 'prl': return COLORS.warning || '#FF9800';
      case 'pl': return COLORS.primary || '#C0C0C0';
      default: return COLORS.textSecondary;
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statCardContent}>
        <Ionicons name={icon} size={32} color={color} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Admin Panel</Text>
        <Text style={styles.subtitle}>System Administration Dashboard</Text>
        <View style={styles.adminBadge}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.primary} />
          <Text style={styles.adminBadgeText}>Program Leader Access</Text>
        </View>
      </View>

      {/* System Health */}
      <View style={styles.healthCard}>
        <Ionicons name="checkmark-circle" size={24} color={COLORS.success || '#4CAF50'} />
        <Text style={styles.healthText}>System Status: {stats.systemHealth}</Text>
        <Text style={styles.healthTimestamp}>Last updated: {new Date().toLocaleString()}</Text>
      </View>

      {/* Statistics Overview */}
      <Text style={styles.sectionTitle}>System Overview</Text>
      <View style={styles.statsGrid}>
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon="people-outline"
          color={COLORS.primary}
        />
        <StatCard 
          title="Students" 
          value={stats.totalStudents} 
          icon="school-outline"
          color={COLORS.info || '#2196F3'}
        />
        <StatCard 
          title="Lecturers" 
          value={stats.totalLecturers} 
          icon="person-outline"
          color={COLORS.success || '#4CAF50'}
        />
        <StatCard 
          title="Principal Lecturers" 
          value={stats.totalPRL} 
          icon="star-outline"
          color={COLORS.warning || '#FF9800'}
        />
        <StatCard 
          title="Program Leaders" 
          value={stats.totalPL} 
          icon="flag-outline"
          color={COLORS.primary}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'registrations' && styles.activeTab]}
          onPress={() => setActiveTab('registrations')}
        >
          <Text style={[styles.tabText, activeTab === 'registrations' && styles.activeTabText]}>
            Registrations
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'logins' && styles.activeTab]}
          onPress={() => setActiveTab('logins')}
        >
          <Text style={[styles.tabText, activeTab === 'logins' && styles.activeTabText]}>
            Login Logs
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <View style={styles.tabContent}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
            <Text style={styles.infoTitle}>Admin Privileges</Text>
            <Text style={styles.infoText}>
              As a Program Leader, you have full administrative access to:
            </Text>
            <View style={styles.permissionsList}>
              <View style={styles.permissionItem}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                <Text style={styles.permissionText}>Monitor user registrations</Text>
              </View>
              <View style={styles.permissionItem}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                <Text style={styles.permissionText}>Track login activities</Text>
              </View>
              <View style={styles.permissionItem}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                <Text style={styles.permissionText}>View system analytics</Text>
              </View>
              <View style={styles.permissionItem}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                <Text style={styles.permissionText}>Manage courses and modules</Text>
              </View>
              <View style={styles.permissionItem}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                <Text style={styles.permissionText}>Assign lecturers to courses</Text>
              </View>
              <View style={styles.permissionItem}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                <Text style={styles.permissionText}>Generate system reports</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {activeTab === 'registrations' && (
        <View style={styles.tabContent}>
          <Text style={styles.listTitle}>Recent Registrations</Text>
          {stats.recentRegistrations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyStateText}>No registrations found</Text>
            </View>
          ) : (
            stats.recentRegistrations.map((registration, index) => (
              <View key={registration.id || index} style={styles.logItem}>
                <View style={styles.logHeader}>
                  <Ionicons name="person-add-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.logEmail}>{registration.email}</Text>
                </View>
                <View style={styles.logDetails}>
                  <Text style={styles.logRole}>
                    Role: {registration.role?.toUpperCase()}
                  </Text>
                  <Text style={styles.logStatus}>
                    Status: {registration.success ? 'Success' : 'Failed'}
                  </Text>
                  <Text style={styles.logTime}>
                    Time: {formatDate(registration.timestamp)}
                  </Text>
                  {registration.errorMessage && (
                    <Text style={styles.logError}>Error: {registration.errorMessage}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {activeTab === 'logins' && (
        <View style={styles.tabContent}>
          <Text style={styles.listTitle}>Recent Login Activity</Text>
          {stats.recentLogins.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="log-in-outline" size={48} color={COLORS.textSecondary} />
              <Text style={styles.emptyStateText}>No login records found</Text>
            </View>
          ) : (
            stats.recentLogins.map((login, index) => (
              <View key={login.id || index} style={styles.logItem}>
                <View style={styles.logHeader}>
                  <Ionicons name="log-in-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.logEmail}>{login.email}</Text>
                </View>
                <View style={styles.logDetails}>
                  <Text style={styles.logRole}>
                    Role: {login.role?.toUpperCase() || 'Unknown'}
                  </Text>
                  <Text style={styles.logStatus}>
                    Status: {login.success ? 'Success' : 'Failed'}
                  </Text>
                  <Text style={styles.logTime}>
                    Time: {formatDate(login.timestamp)}
                  </Text>
                  <Text style={styles.logDevice}>
                    Device: {login.userAgent || 'Unknown'}
                  </Text>
                  <Text style={styles.logIP}>
                    IP: {login.ipAddress || 'Unknown'}
                  </Text>
                  {login.errorMessage && (
                    <Text style={styles.logError}>Error: {login.errorMessage}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Courses')}
          >
            <Ionicons name="book-outline" size={32} color={COLORS.primary} />
            <Text style={styles.actionText}>Manage Courses</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Modules')}
          >
            <Ionicons name="layers-outline" size={32} color={COLORS.primary} />
            <Text style={styles.actionText}>Manage Modules</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Lecturers')}
          >
            <Ionicons name="people-outline" size={32} color={COLORS.primary} />
            <Text style={styles.actionText}>Manage Lecturers</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Reports')}
          >
            <Ionicons name="document-text-outline" size={32} color={COLORS.primary} />
            <Text style={styles.actionText}>Generate Reports</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    ...typography.h1,
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  adminBadgeText: {
    ...typography.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  healthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '15',
    padding: spacing.md,
    margin: spacing.lg,
    borderRadius: 12,
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  healthText: {
    ...typography.body,
    color: COLORS.success,
    fontWeight: '600',
    flex: 1,
  },
  healthTimestamp: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    ...typography.h3,
    color: COLORS.text,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    fontSize: 18,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.xs,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  statCardContent: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: spacing.xs,
  },
  statTitle: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    ...typography.body,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.buttonPrimaryText,
  },
  tabContent: {
    padding: spacing.lg,
  },
  listTitle: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  logItem: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  logEmail: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
  },
  logDetails: {
    marginLeft: spacing.lg,
  },
  logRole: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginBottom: spacing.xs,
  },
  logStatus: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginBottom: spacing.xs,
  },
  logTime: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginBottom: spacing.xs,
  },
  logDevice: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginBottom: spacing.xs,
  },
  logIP: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginBottom: spacing.xs,
  },
  logError: {
    ...typography.caption,
    color: COLORS.error || '#F44336',
    marginTop: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginTop: spacing.md,
  },
  infoCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
  },
  infoTitle: {
    ...typography.h3,
    color: COLORS.text,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  permissionsList: {
    width: '100%',
    gap: spacing.sm,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  permissionText: {
    ...typography.body,
    color: COLORS.text,
  },
  quickActions: {
    marginBottom: spacing.xl,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionText: {
    ...typography.caption,
    color: COLORS.text,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});