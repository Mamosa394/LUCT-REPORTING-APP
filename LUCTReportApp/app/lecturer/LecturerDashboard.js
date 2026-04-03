// app/lecturer/Dashboard.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, StatsCard, LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchDashboardStats } from '../../src/store/monitoringSlice';
import { fetchCourses } from '../../src/store/courseSlice';
import { fetchReports } from '../../src/store/monitoringSlice';
import { fetchRatings } from '../../src/store/monitoringSlice';

export default function LecturerDashboard({ navigation }) {
  const dispatch = useDispatch();
  const { stats, isLoading } = useSelector(state => state.monitoring);
  const { courses } = useSelector(state => state.courses);
  const { reports } = useSelector(state => state.monitoring);
  const { ratings } = useSelector(state => state.monitoring);
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    await Promise.all([
      dispatch(fetchDashboardStats()),
      dispatch(fetchCourses({ lecturerId: user?.id })),
      dispatch(fetchReports({ submittedBy: user?.id })),
      dispatch(fetchRatings({ lecturerId: user?.id })),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const myCourses = courses?.filter(c => c.lecturerId === user?.id) || [];
  const myReports = reports?.filter(r => r.submittedBy === user?.id) || [];
  const myAverageRating = ratings?.length > 0 
    ? (ratings.reduce((sum, r) => sum + r.overall, 0) / ratings.length).toFixed(1)
    : 0;

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
          <Text style={styles.userRole}>Lecturer</Text>
          <Text style={styles.department}>{user?.department}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <StatsCard
            title="My Courses"
            value={myCourses.length}
            icon="📚"
            trend="up"
            trendValue="Active"
            color={COLORS.primary}
          />
          <StatsCard
            title="My Rating"
            value={myAverageRating}
            icon="⭐"
            trend={myAverageRating >= 4 ? 'up' : 'down'}
            trendValue="Average"
          />
        </View>

        <View style={styles.statsRow}>
          <StatsCard
            title="My Reports"
            value={myReports.length}
            icon="📄"
            color={COLORS.primary}
          />
          <StatsCard
            title="Total Students"
            value={myCourses.reduce((sum, c) => sum + (c.students?.length || 0), 0)}
            icon="👨‍🎓"
            color={COLORS.primary}
          />
        </View>

        {/* Quick Actions */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Attendance')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="calendar-outline" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>Mark Attendance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Classes')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="people-outline" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>My Classes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Reports')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="document-text-outline" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>Submit Report</Text>
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

        {/* Today's Classes */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Today's Classes</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Classes')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {myCourses.slice(0, 3).map((course) => (
            <TouchableOpacity
              key={course.id}
              style={styles.classItem}
              onPress={() => navigation.navigate('CourseDetails', { courseId: course.id })}
            >
              <View style={styles.classInfo}>
                <Text style={styles.className}>{course.name}</Text>
                <Text style={styles.classCode}>{course.code}</Text>
                <View style={styles.classMeta}>
                  <Text style={styles.classTime}>10:00 AM - 12:00 PM</Text>
                  <Text style={styles.classVenue}>Room {course.room || '301'}</Text>
                </View>
              </View>
              <View style={styles.classStatus}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Upcoming</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
          {myCourses.length === 0 && (
            <Text style={styles.emptyText}>No classes scheduled for today</Text>
          )}
        </Card>

        {/* Pending Reports */}
        {myReports.filter(r => r.status === 'pending').length > 0 && (
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Pending Reports</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            {myReports.filter(r => r.status === 'pending').slice(0, 2).map((report) => (
              <View key={report.id} style={styles.reportItem}>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <Text style={styles.reportMeta}>
                    Submitted: {new Date(report.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.reportStatus}>
                  <View style={[styles.statusDot, { backgroundColor: COLORS.warning }]} />
                  <Text style={styles.statusText}>Pending Review</Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* Recent Ratings */}
        {ratings && ratings.length > 0 && (
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.sectionTitle}>Recent Ratings</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Ratings')}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            {ratings.slice(0, 3).map((rating) => (
              <View key={rating.id} style={styles.ratingItem}>
                <View style={styles.ratingHeader}>
                  <Text style={styles.studentName}>{rating.student?.name}</Text>
                  <View style={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= rating.overall ? 'star' : 'star-outline'}
                        size={14}
                        color={star <= rating.overall ? '#FFC107' : COLORS.textDisabled}
                      />
                    ))}
                  </View>
                </View>
                {rating.comment && (
                  <Text style={styles.ratingComment}>"{rating.comment}"</Text>
                )}
                <Text style={styles.ratingDate}>
                  {new Date(rating.createdAt).toLocaleDateString()}
                </Text>
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
    width: '23%',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  classCode: {
    ...typography.caption,
    color: COLORS.primary,
    marginTop: 2,
  },
  classMeta: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  classTime: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginRight: spacing.md,
  },
  classVenue: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  classStatus: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginBottom: spacing.xs,
  },
  statusText: {
    ...typography.caption,
    color: COLORS.success,
    fontSize: 10,
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
    marginRight: spacing.xs,
  },
  ratingItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  studentName: {
    ...typography.bodySmall,
    color: COLORS.text,
    fontWeight: '500',
  },
  ratingStars: {
    flexDirection: 'row',
  },
  ratingComment: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginVertical: spacing.xs,
  },
  ratingDate: {
    ...typography.caption,
    color: COLORS.textDisabled,
  },
  emptyText: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
});