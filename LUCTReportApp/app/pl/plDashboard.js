// app/pl/Dashboard.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, StatsCard, LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchDashboardStats } from '../../src/store/monitoringSlice';
import { fetchCourses } from '../../src/store/courseSlice';
import { fetchReports } from '../../src/store/monitoringSlice';
import { fetchLecturers } from '../../src/store/authSlice';

export default function PLDashboard({ navigation }) {
  const dispatch = useDispatch();
  const { stats, isLoading } = useSelector(state => state.monitoring);
  const { courses } = useSelector(state => state.courses);
  const { reports } = useSelector(state => state.monitoring);
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    await Promise.all([
      dispatch(fetchDashboardStats()),
      dispatch(fetchCourses()),
      dispatch(fetchReports()),
      dispatch(fetchLecturers()),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Get lecturers from auth state
  const lecturers = useSelector(state => state.auth?.lecturers || []);
  const totalLecturers = lecturers.length;
  const activeCourses = courses?.filter(c => c.isActive !== false).length || 0;

  if (isLoading && !refreshing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer scrollable={true}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>Program Leader</Text>
          <Text style={styles.department}>{user?.department}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
       
          <StatsCard
            title="Total Lecturers"
            value={totalLecturers}
            icon="👨‍🏫"
          />
        </View>

        <View style={styles.statsRow}>
          <StatsCard
            title="Active Courses"
            value={activeCourses}
            icon="📚"
          />
         
        </View>

        {/* Quick Actions */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Courses')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="book-outline" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>Manage Courses</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Lecturers')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="people-outline" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>Manage Lecturers</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Ratings')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="star-outline" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>View Ratings</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* System Alerts */}
        {stats?.systemAlerts?.length > 0 && (
          <Card style={styles.alertsCard}>
            <Text style={styles.sectionTitle}>System Alerts</Text>
            {stats.systemAlerts.map((alert, index) => (
              <View key={index} style={styles.alertItem}>
                <Ionicons name="warning-outline" size={20} color={COLORS.warning} />
                <Text style={styles.alertText}>{alert.message}</Text>
              </View>
            ))}
          </Card>
        )}

      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  welcomeSection: {
    padding: spacing.lg,
    backgroundColor: COLORS.cardBackground,
    marginBottom: spacing.md,
  },
  welcomeText: {
    ...typography.body,
    color: COLORS.textSecondary,
  },
  userName: {
    ...typography.h2,
    color: COLORS.text,
    marginTop: spacing.xs,
  },
  userRole: {
    ...typography.body,
    color: COLORS.primary,
    marginTop: spacing.xs,
  },
  department: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
statsRow: {
  flexDirection: 'row',
  paddingHorizontal: spacing.md,
  marginBottom: spacing.md,
  gap: spacing.sm,
  flex: 1,
},
  sectionCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewAll: {
    ...typography.bodySmall,
    color: COLORS.primary,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '30%',
    alignItems: 'center',
    marginBottom: spacing.md,
    position: 'relative',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actionText: {
    ...typography.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  actionBadge: {
    position: 'absolute',
    top: -5,
    right: 5,
    backgroundColor: COLORS.error,
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
    fontWeight: '700',
  },
  alertsCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: COLORS.warning + '10',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  alertText: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  reportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  reportMeta: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  reportStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  lecturerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lecturerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  rankNumber: {
    ...typography.body,
    color: COLORS.primary,
    fontWeight: '700',
  },
  lecturerInfo: {
    flex: 1,
  },
  lecturerName: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  lecturerDept: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  lecturerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    ...typography.body,
    color: COLORS.text,
    marginLeft: spacing.xs,
  },
});