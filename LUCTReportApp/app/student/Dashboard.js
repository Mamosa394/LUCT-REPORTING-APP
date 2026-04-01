// app/student/Dashboard.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ScreenContainer, StatsCard, LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchDashboardStats } from '../../src/store/monitoringSlice';
import { fetchCourses } from '../../src/store/courseSlice';
import { fetchStudentAttendanceSummary } from '../../src/store/attendanceSlice';

export default function StudentDashboard({ navigation }) {
  const dispatch = useDispatch();
  const { stats, isLoading } = useSelector(state => state.monitoring);
  const { courses } = useSelector(state => state.courses);
  const { studentSummary } = useSelector(state => state.attendance);
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    await Promise.all([
      dispatch(fetchDashboardStats()),
      dispatch(fetchCourses()),
      dispatch(fetchStudentAttendanceSummary({ studentId: user?.id })),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

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
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userId}>{user?.studentId}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <StatsCard
            title="Attendance"
            value={`${studentSummary?.percentage || 0}%`}
            icon="📊"
            trend={studentSummary?.percentage >= 75 ? 'up' : 'down'}
            trendValue={`${studentSummary?.present || 0}/${studentSummary?.totalClasses || 0}`}
            color={studentSummary?.percentage >= 75 ? COLORS.success : COLORS.warning}
          />
          <StatsCard
            title="Courses"
            value={courses?.length || 0}
            icon="📚"
            trend="up"
            trendValue="Active"
          />
        </View>

        <View style={styles.statsRow}>
          <StatsCard
            title="Reports"
            value={stats?.totalReports || 0}
            icon="📄"
            color={COLORS.primary}
          />
          <StatsCard
            title="Ratings"
            value={stats?.totalRatings || 0}
            icon="⭐"
            color={COLORS.primary}
          />
        </View>

        {/* Recent Courses */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>My Courses</Text>
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
              <Text style={styles.viewText}>View →</Text>
            </TouchableOpacity>
          ))}
          {courses?.length > 3 && (
            <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
              <Text style={styles.viewAllText}>View All Courses →</Text>
            </TouchableOpacity>
          )}
        </Card>

        {/* Quick Actions */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Attendance')}
            >
              <Text style={styles.actionEmoji}>📋</Text>
              <Text style={styles.actionText}>Mark Attendance</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Courses')}
            >
              <Text style={styles.actionEmoji}>📚</Text>
              <Text style={styles.actionText}>My Courses</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Ratings')}
            >
              <Text style={styles.actionEmoji}>⭐</Text>
              <Text style={styles.actionText}>Rate Lecturer</Text>
            </TouchableOpacity>
          </View>
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
  userId: {
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
  viewText: {
    ...typography.caption,
    color: COLORS.primary,
  },
  viewAllText: {
    ...typography.bodySmall,
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  actionText: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
});