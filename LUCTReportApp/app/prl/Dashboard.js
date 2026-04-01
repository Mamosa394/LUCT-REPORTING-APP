// app/prl/Dashboard.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, StatsCard, LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../src/config/theme';
import { fetchDashboardStats } from '../../src/store/monitoringslice';
import { fetchCourses } from '../../src/store/courseSlice';
import { fetchReports } from '../../src/store/monitoringslice';

export default function PRLDashboard({ navigation }) {
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
      dispatch(fetchReports({ status: 'pending' })),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const pendingReports = reports?.filter(r => r.status === 'pending') || [];

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
          <Text style={styles.userRole}>Programme Leader</Text>
          <Text style={styles.department}>{user?.department}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <StatsCard
            title="Total Courses"
            value={stats?.totalCourses || 0}
            icon="📚"
            trend="up"
            trendValue={courses?.length || 0}
            color={COLORS.primary}
          />
          <StatsCard
            title="Total Lecturers"
            value={stats?.totalLecturers || 0}
            icon="👨‍🏫"
            trend="up"
            trendValue="Active"
          />
        </View>

        <View style={styles.statsRow}>
          <StatsCard
            title="Pending Reports"
            value={pendingReports.length}
            icon="📄"
            color={pendingReports.length > 0 ? COLORS.warning : COLORS.success}
          />
          <StatsCard
            title="Avg Attendance"
            value={`${stats?.averageAttendance?.toFixed(1) || 0}%`}
            icon="📊"
            trend={stats?.averageAttendance >= 75 ? 'up' : 'down'}
            trendValue="This month"
          />
        </View>

        {/* Quick Actions */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Reports')}
            >
              <Ionicons name="document-text-outline" size={32} color={COLORS.primary} />
              <Text style={styles.actionText}>Review Reports</Text>
              {pendingReports.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pendingReports.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Courses')}
            >
              <Ionicons name="book-outline" size={32} color={COLORS.primary} />
              <Text style={styles.actionText}>Manage Courses</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Monitoring')}
            >
              <Ionicons name="analytics-outline" size={32} color={COLORS.primary} />
              <Text style={styles.actionText}>Monitoring</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Pending Reports */}
        {pendingReports.length > 0 && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Pending Reports</Text>
            {pendingReports.slice(0, 3).map((report) => (
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
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))}
            {pendingReports.length > 3 && (
              <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
                <Text style={styles.viewAllText}>View All Pending Reports →</Text>
              </TouchableOpacity>
            )}
          </Card>
        )}

        {/* Course Overview */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Course Overview</Text>
          {courses?.slice(0, 3).map((course) => (
            <TouchableOpacity
              key={course.id}
              style={styles.courseItem}
              onPress={() => navigation.navigate('CourseDetails', { courseId: course.id })}
            >
              <View>
                <Text style={styles.courseName}>{course.name}</Text>
                <Text style={styles.courseCode}>{course.code}</Text>
              </View>
              <View style={styles.courseStats}>
                <Text style={styles.studentCount}>{course.students?.length || 0} students</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </Card>
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    position: 'relative',
  },
  actionText: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
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
    fontWeight: '600',
  },
  reportMeta: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  viewAllText: {
    ...typography.bodySmall,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  courseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  courseName: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  courseCode: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentCount: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginRight: spacing.sm,
  },
});