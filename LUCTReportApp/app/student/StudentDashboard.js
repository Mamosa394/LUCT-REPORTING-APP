// app/student/StudentDashboard.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ScreenContainer, StatsCard, LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchDashboardStats } from '../../src/store/monitoringSlice';
import { fetchCourses } from '../../src/store/courseSlice';
import { fetchStudentAttendanceSummary } from '../../src/store/attendanceSlice';

export default function StudentDashboard({ navigation }) {
  const dispatch = useDispatch();

  // Safe selectors with error handling
  const monitoringState = useSelector(state => state.monitoring);
  const coursesState = useSelector(state => state.courses);
  const attendanceState = useSelector(state => state.attendance);
  const authState = useSelector(state => state.auth);

  // Safe data extraction with defaults
  const { stats, isLoading: monitoringLoading } = monitoringState || { stats: {}, isLoading: false };
  const { courses = [], isLoading: coursesLoading } = coursesState || { courses: [], isLoading: false };
  const { studentSummary = {}, isLoading: attendanceLoading } = attendanceState || { studentSummary: {}, isLoading: false };
  const { user } = authState || { user: null };
  
  const isLoading = monitoringLoading || coursesLoading || attendanceLoading;
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await Promise.allSettled([
        dispatch(fetchDashboardStats()),
        dispatch(fetchCourses()),
        dispatch(fetchStudentAttendanceSummary({ studentId: user?.id })),
      ]);
    } catch (error) {
      console.error('❌ [StudentDashboard] Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (isLoading && !refreshing) {
    return <LoadingSpinner fullScreen />;
  }

  const attendancePercentage = studentSummary?.percentage || 0;
  const attendancePresent = studentSummary?.present || 0;
  const attendanceTotal = studentSummary?.totalClasses || 0;

  return (
    <ScreenContainer scrollable={true}>
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Student'}</Text>
          <Text style={styles.userId}>ID: {user?.studentId || 'N/A'}</Text>
        </View>

        {/* Stats Cards - Row 1 */}
        <View style={styles.statsRow}>
          <View style={styles.statsCardWrapper}>
            <StatsCard
              title="Attendance"
              value={`${attendancePercentage}%`}
              icon={<Text style={styles.iconEmoji}>📊</Text>}
              trend={attendancePercentage >= 75 ? 'up' : 'down'}
              trendValue={`${attendancePresent}/${attendanceTotal} classes`}
              color={attendancePercentage >= 75 ? COLORS.success : COLORS.warning}
            />
          </View>
          <View style={styles.statsCardWrapper}>
            <StatsCard
              title="Courses"
              value={courses?.length || 0}
              icon={<Text style={styles.iconEmoji}>📚</Text>}
              trend="up"
              trendValue="Active"
              color={COLORS.primary}
            />
          </View>
        </View>

        {/* Stats Cards - Row 2 */}
        <View style={styles.statsRow}>
          <View style={styles.statsCardWrapper}>
            <StatsCard
              title="Reports"
              value={stats?.totalReports || 0}
              icon={<Text style={styles.iconEmoji}>📄</Text>}
              color={COLORS.primary}
            />
          </View>
          <View style={styles.statsCardWrapper}>
            <StatsCard
              title="Ratings"
              value={stats?.totalRatings || 0}
              icon={<Text style={styles.iconEmoji}>⭐</Text>}
              color={COLORS.primary}
            />
          </View>
        </View>

        {/* Recent Courses Section */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>My Courses</Text>
          {courses && courses.length > 0 ? (
            <View>
              {courses.slice(0, 3).map((course, index) => (
                <TouchableOpacity
                  key={course.id || index}
                  style={styles.courseItem}
                  onPress={() => navigation.navigate('CourseDetails', { courseId: course.id })}
                >
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseName}>{course.name || 'Unnamed Course'}</Text>
                    <Text style={styles.courseCode}>{course.code || 'N/A'}</Text>
                  </View>
                  <Text style={styles.viewText}>View →</Text>
                </TouchableOpacity>
              ))}
              {courses.length > 3 ? (
                <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
                  <Text style={styles.viewAllText}>View All Courses →</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No courses enrolled</Text>
            </View>
          )}
        </Card>

        {/* Quick Actions Section */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Attendance')}
            >
              <Text style={styles.actionEmoji}>📋</Text>
              <Text style={styles.actionText}>Attendance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Courses')}
            >
              <Text style={styles.actionEmoji}>📚</Text>
              <Text style={styles.actionText}>Courses</Text>
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  welcomeSection: {
    padding: spacing.lg,
    backgroundColor: COLORS.cardBackground,
    marginBottom: spacing.md,
    borderRadius: 12,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
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
    gap: spacing.md,
  },
  statsCardWrapper: {
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
  courseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  courseInfo: {
    flex: 1,
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
    marginLeft: spacing.md,
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
    padding: spacing.sm,
  },
  actionEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  actionText: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  emptyState: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyStateText: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  iconEmoji: {
    fontSize: 24,
  },
});