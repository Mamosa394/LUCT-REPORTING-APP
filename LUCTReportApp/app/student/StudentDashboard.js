// app/student/StudentDashboard.js - Simplified attendance overview

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, Card } from '../../src/components/UI';
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
  const { stats: monitoringStats, isLoading: monitoringLoading } = monitoringState || { stats: {}, isLoading: false };
  const { courses = [], isLoading: coursesLoading } = coursesState || { courses: [], isLoading: false };
  const { stats: attendanceStats, loading: attendanceLoading } = attendanceState || { stats: null, loading: false };
  const { user } = authState || { user: null };
  
  const isLoading = monitoringLoading || coursesLoading || attendanceLoading;
  const [refreshing, setRefreshing] = useState(false);

  // Get the correct student ID
  const studentId = user?.uid || user?.id || user?.studentId;

  useEffect(() => {
    loadDashboardData();
  }, [studentId]);

  const loadDashboardData = async () => {
    if (!studentId) return;
    
    try {
      await Promise.allSettled([
        dispatch(fetchDashboardStats()),
        dispatch(fetchCourses()),
        dispatch(fetchStudentAttendanceSummary({ studentId: studentId })),
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

  // Handle navigation to course details
  const handleCoursePress = (course) => {
    navigation.navigate('StudentDashboard', {
      screen: 'StudentTabs',
      params: {
        screen: 'Courses',
        params: {
          selectedCourseId: course.id,
          courseName: course.name,
          courseCode: course.code
        }
      }
    });
  };

  // Handle navigation to Courses tab
  const handleViewAllCourses = () => {
    navigation.navigate('StudentDashboard', {
      screen: 'StudentTabs',
      params: {
        screen: 'Courses'
      }
    });
  };

  // Handle quick action navigation
  const handleQuickAction = (screen) => {
    navigation.navigate('StudentDashboard', {
      screen: 'StudentTabs',
      params: { screen }
    });
  };

  // Extract real attendance data from stats
  const attendancePresent = attendanceStats?.present || 0;
  const attendanceTotal = attendanceStats?.total || 0;
  const attendancePercentage = attendanceStats?.percentage || 0;

  // Determine attendance color based on percentage
  const getAttendanceColor = (percentage) => {
    if (percentage >= 75) return COLORS.success;
    if (percentage >= 60) return COLORS.warning;
    return COLORS.error;
  };

  if (isLoading && !refreshing) {
    return <LoadingSpinner fullScreen />;
  }

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
          <Text style={styles.userId}>ID: {user?.studentId || studentId || 'N/A'}</Text>
        </View>

        {/* Attendance Overview Card - Simple Version */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Attendance Overview</Text>
            <TouchableOpacity onPress={() => handleQuickAction('Attendance')}>
              <Text style={styles.viewAllText}>View Details →</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.attendanceOverview}>
            <View style={styles.attendanceStat}>
              <Text style={styles.attendanceValue}>{attendancePresent}/{attendanceTotal}</Text>
              <Text style={styles.attendanceLabel}>Classes Attended</Text>
            </View>
            <View style={styles.attendanceDivider} />
            <View style={styles.attendanceStat}>
              <Text style={[
                styles.attendancePercentage,
                { color: getAttendanceColor(attendancePercentage) }
              ]}>
                {attendancePercentage}%
              </Text>
              <Text style={styles.attendanceLabel}>Attendance Rate</Text>
            </View>
          </View>
        </Card>

        {/* Recent Courses Section */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>My Courses</Text>
            {courses.length > 3 && (
              <TouchableOpacity onPress={handleViewAllCourses}>
                <Text style={styles.viewAllText}>View All ({courses.length}) →</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {courses && courses.length > 0 ? (
            <View>
              {courses.slice(0, 3).map((course, index) => (
                <TouchableOpacity
                  key={course.id || index}
                  style={styles.courseItem}
                  onPress={() => handleCoursePress(course)}
                >
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseName}>{course.name || 'Unnamed Course'}</Text>
                    <Text style={styles.courseCode}>{course.code || 'N/A'}</Text>
                    <Text style={styles.courseLecturer}>
                      {course.lecturerName || 'Lecturer not assigned'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={40} color={COLORS.textDisabled} />
              <Text style={styles.emptyStateText}>No courses enrolled</Text>
            </View>
          )}
        </Card>

        {/* Quick Actions Section */}
        <Card style={[styles.sectionCard, styles.lastCard]}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleQuickAction('Attendance')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name="calendar-outline" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>Attendance</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleQuickAction('Courses')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.info + '15' }]}>
                <Ionicons name="book-outline" size={28} color={COLORS.info} />
              </View>
              <Text style={styles.actionText}>Courses</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleQuickAction('Ratings')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.warning + '15' }]}>
                <Ionicons name="star-outline" size={28} color={COLORS.warning} />
              </View>
              <Text style={styles.actionText}>Rate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleQuickAction('Profile')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.success + '15' }]}>
                <Ionicons name="person-outline" size={28} color={COLORS.success} />
              </View>
              <Text style={styles.actionText}>Profile</Text>
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
  sectionCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  lastCard: {
    marginBottom: spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: COLORS.text,
  },
  viewAllText: {
    ...typography.caption,
    color: COLORS.primary,
    fontWeight: '500',
  },
  attendanceOverview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  attendanceStat: {
    alignItems: 'center',
    flex: 1,
  },
  attendanceValue: {
    ...typography.h3,
    color: COLORS.text,
    marginBottom: spacing.xs,
  },
  attendancePercentage: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  attendanceLabel: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  attendanceDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
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
    color: COLORS.primary,
    marginTop: 2,
  },
  courseLecturer: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actionText: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});