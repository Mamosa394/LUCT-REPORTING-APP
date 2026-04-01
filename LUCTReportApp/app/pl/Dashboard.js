// app/pl/Dashboard.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, StatsCard, LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../src/config/theme';
import { fetchDashboardStats } from '../../src/store/monitoringslice';
import { fetchCourses } from '../../src/store/courseSlice';
import { fetchReports } from '../../src/store/monitoringslice';

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
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const pendingReports = reports?.filter(r => r.status === 'pending') || [];
  const totalRatings = stats?.totalRatings || 0;
  const avgAttendance = stats?.averageAttendance || 0;

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
          <Text style={styles.userRole}>Principal Lecturer</Text>
          <Text style={styles.department}>{user?.department}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <StatsCard
            title="Total Students"
            value={stats?.totalStudents || 0}
            icon="👨‍🎓"
            trend="up"
            trendValue="+15%"
            color={COLORS.primary}
          />
          <StatsCard
            title="Total Lecturers"
            value={stats?.totalLecturers || 0}
            icon="👨‍🏫"
            trend="up"
            trendValue="+8%"
          />
        </View>

        <View style={styles.statsRow}>
          <StatsCard
            title="Active Courses"
            value={stats?.totalCourses || 0}
            icon="📚"
            trend="up"
            trendValue="+12%"
          />
          <StatsCard
            title="Pending Reports"
            value={pendingReports.length}
            icon="📄"
            color={pendingReports.length > 0 ? COLORS.warning : COLORS.success}
          />
        </View>

        <View style={styles.statsRow}>
          <StatsCard
            title="Total Ratings"
            value={totalRatings}
            icon="⭐"
            color={COLORS.primary}
          />
          <StatsCard
            title="Avg Attendance"
            value={`${avgAttendance?.toFixed(1) || 0}%`}
            icon="📊"
            trend={avgAttendance >= 75 ? 'up' : 'down'}
            trendValue="This month"
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
              onPress={() => navigation.navigate('Modules')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="layers-outline" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>Manage Modules</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Reports')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="document-text-outline" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>Review Reports</Text>
              {pendingReports.length > 0 && (
                <View style={styles.actionBadge}>
                  <Text style={styles.badgeText}>{pendingReports.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Monitoring')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="analytics-outline" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>System Monitoring</Text>
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

        {/* Recent Reports */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {reports?.slice(0, 3).map((report) => (
            <TouchableOpacity
              key={report.id}
              style={styles.reportItem}
              onPress={() => navigation.navigate('ReportDetails', { reportId: report.id })}
            >
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <Text style={styles.reportMeta}>
                  {report.submittedBy?.name} • {new Date(report.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.reportStatus}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor(report.status) }]} />
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Top Performing Lecturers */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Top Performing Lecturers</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Lecturers')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {stats?.topLecturers?.slice(0, 3).map((lecturer, index) => (
            <View key={lecturer.id} style={styles.lecturerItem}>
              <View style={styles.lecturerRank}>
                <Text style={styles.rankNumber}>{index + 1}</Text>
              </View>
              <View style={styles.lecturerInfo}>
                <Text style={styles.lecturerName}>{lecturer.name}</Text>
                <Text style={styles.lecturerDept}>{lecturer.department}</Text>
              </View>
              <View style={styles.lecturerRating}>
                <Ionicons name="star" size={16} color="#FFC107" />
                <Text style={styles.ratingValue}>{lecturer.rating}</Text>
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return COLORS.warning;
    case 'approved': return COLORS.success;
    case 'rejected': return COLORS.error;
    default: return COLORS.textSecondary;
  }
};

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