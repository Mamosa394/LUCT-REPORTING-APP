// app/student/Courses.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchCourses } from '../../src/store/courseSlice';
import { 
  fetchCourseMonitoring, 
  fetchCourseProgress,
  selectCourseMonitoring,
  selectCourseProgress 
} from '../../src/store/monitoringSlice';

export default function StudentCourses({ navigation }) {
  const dispatch = useDispatch();
  const { courses = [], isLoading } = useSelector(state => state.courses || { courses: [], isLoading: false });
  const { user } = useSelector(state => state.auth || { user: null });
  const courseMonitoring = useSelector(selectCourseMonitoring);
  const courseProgress = useSelector(selectCourseProgress);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [loadingMonitoring, setLoadingMonitoring] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      await dispatch(fetchCourses()).unwrap();
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  const handleCoursePress = async (course) => {
    if (expandedCourseId === course.id) {
      setExpandedCourseId(null);
    } else {
      setExpandedCourseId(course.id);
      setLoadingMonitoring(true);
      
      // Fetch monitoring data for this course
      try {
        await Promise.all([
          dispatch(fetchCourseMonitoring({ 
            courseId: course.id, 
            studentId: user?.id 
          })).unwrap(),
          dispatch(fetchCourseProgress({ 
            courseId: course.id, 
            studentId: user?.id 
          })).unwrap()
        ]);
      } catch (error) {
        console.error('Error fetching monitoring:', error);
      } finally {
        setLoadingMonitoring(false);
      }
    }
  };

  const navigateToMonitoring = (course) => {
    navigation.navigate('CourseMonitoring', { 
      courseId: course.id, 
      courseName: course.name 
    });
  };

  const navigateToAttendance = (course) => {
    navigation.navigate('Attendance', { 
      courseId: course.id, 
      courseName: course.name 
    });
  };

  const navigateToRatings = (course) => {
    navigation.navigate('Ratings', { 
      courseId: course.id, 
      lecturerId: course.lecturer?.id 
    });
  };

  const filteredCourses = courses.filter(course => 
    course.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.lecturer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCourseMonitoringData = (courseId) => {
    // Use real monitoring data if available, otherwise use defaults
    if (courseMonitoring && expandedCourseId === courseId) {
      return {
        attendanceRate: courseMonitoring.attendance || 75,
        progressPercentage: courseMonitoring.overallProgress || 60,
        assignments: courseMonitoring.assignments || 80,
        participation: courseMonitoring.participation || 70
      };
    }
    
    // If we have progress data separately
    if (courseProgress && expandedCourseId === courseId) {
      return {
        attendanceRate: courseProgress.attendanceRate || 75,
        progressPercentage: courseProgress.overallProgress || 60,
        assignments: courseProgress.assignmentCompletion || 80,
        participation: courseProgress.participation || 70
      };
    }
    
    // Find course-specific data or use defaults
    const course = courses.find(c => c.id === courseId);
    return {
      attendanceRate: course?.attendanceRate || 75,
      progressPercentage: course?.progress || 60,
      assignments: course?.assignmentScore || 80,
      participation: course?.participation || 70
    };
  };

  const renderCourseItem = ({ item: course }) => {
    const isExpanded = expandedCourseId === course.id;
    const monitoringData = getCourseMonitoringData(course.id);
    const attendanceRate = monitoringData.attendanceRate;
    const progressPercentage = monitoringData.progressPercentage;

    return (
      <Card style={styles.courseCard}>
        <TouchableOpacity
          style={styles.courseHeader}
          onPress={() => handleCoursePress(course)}
          activeOpacity={0.7}
          disabled={loadingMonitoring}
        >
          <View style={styles.courseInfo}>
            <View style={styles.courseCodeContainer}>
              <Text style={styles.courseCode}>{course.code || 'N/A'}</Text>
            </View>
            <Text style={styles.courseName}>{course.name || 'Unnamed Course'}</Text>
            <Text style={styles.lecturerName}>
              {course.lecturer?.name || 'Lecturer not assigned'}
            </Text>
          </View>
          <View style={styles.expandIconContainer}>
            {loadingMonitoring && isExpanded ? (
              <LoadingSpinner size="small" />
            ) : (
              <Ionicons 
                name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color={COLORS.textSecondary} 
              />
            )}
          </View>
        </TouchableOpacity>

        {/* Quick Stats Row */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: attendanceRate >= 75 ? COLORS.success : COLORS.warning }]}>
              {attendanceRate}%
            </Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{course.credits || 3}</Text>
            <Text style={styles.statLabel}>Credits</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: progressPercentage >= 70 ? COLORS.success : COLORS.warning }]}>
              {progressPercentage}%
            </Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[
            styles.progressBar, 
            { 
              width: `${progressPercentage}%`,
              backgroundColor: progressPercentage >= 70 ? COLORS.success : 
                             progressPercentage >= 50 ? COLORS.warning : COLORS.error
            }
          ]} />
        </View>

        {/* Expanded Content - Monitoring Integration */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />
            
            {/* Monitoring Summary */}
            <View style={styles.monitoringSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Course Monitoring</Text>
                {loadingMonitoring && <LoadingSpinner size="small" />}
              </View>
              
              <TouchableOpacity 
                style={styles.monitoringItem}
                onPress={() => navigateToMonitoring(course)}
              >
                <View style={styles.monitoringIcon}>
                  <Ionicons name="analytics-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.monitoringContent}>
                  <Text style={styles.monitoringTitle}>View Full Analytics</Text>
                  <Text style={styles.monitoringSubtitle}>
                    Track your progress and performance
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.monitoringItem}
                onPress={() => navigateToAttendance(course)}
              >
                <View style={styles.monitoringIcon}>
                  <Ionicons name="calendar-outline" size={20} color={COLORS.success} />
                </View>
                <View style={styles.monitoringContent}>
                  <Text style={styles.monitoringTitle}>Attendance Tracker</Text>
                  <Text style={styles.monitoringSubtitle}>
                    Current: {attendanceRate}% attendance rate
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.monitoringItem}
                onPress={() => navigateToRatings(course)}
              >
                <View style={styles.monitoringIcon}>
                  <Ionicons name="star-outline" size={20} color={COLORS.warning} />
                </View>
                <View style={styles.monitoringContent}>
                  <Text style={styles.monitoringTitle}>Rate This Course</Text>
                  <Text style={styles.monitoringSubtitle}>
                    Share your feedback on this course
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Performance Metrics Preview */}
            {!loadingMonitoring && courseMonitoring && (
              <View style={styles.performancePreview}>
                <Text style={styles.sectionTitle}>Performance Overview</Text>
                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{monitoringData.assignments}%</Text>
                    <Text style={styles.metricLabel}>Assignments</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{monitoringData.participation}%</Text>
                    <Text style={styles.metricLabel}>Participation</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{course.quizzes || 0}</Text>
                    <Text style={styles.metricLabel}>Quizzes</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Course Schedule */}
            <View style={styles.scheduleSection}>
              <Text style={styles.sectionTitle}>Schedule</Text>
              <View style={styles.scheduleItem}>
                <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.scheduleText}>
                  {course.schedule || 'Mon, Wed 10:00 AM - 11:30 AM'}
                </Text>
              </View>
              <View style={styles.scheduleItem}>
                <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.scheduleText}>
                  {course.location || 'Room 301, Main Building'}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.primaryButton]}
                onPress={() => navigation.navigate('CourseMaterials', { courseId: course.id })}
              >
                <Text style={styles.primaryButtonText}>View Materials</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={() => navigation.navigate('Assignments', { courseId: course.id })}
              >
                <Text style={styles.secondaryButtonText}>Assignments</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Card>
    );
  };

  if (isLoading && !refreshing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Courses</Text>
          <Text style={styles.headerSubtitle}>
            {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} enrolled
          </Text>
        </View>

        {/* Search Bar - Extra Credit Feature */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses by name, code, or lecturer..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Course List */}
        <FlatList
          data={filteredCourses}
          renderItem={renderCourseItem}
          keyExtractor={(item) => item.id || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={64} color={COLORS.textDisabled} />
              <Text style={styles.emptyStateTitle}>No Courses Found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'Try adjusting your search' : 'You are not enrolled in any courses yet'}
              </Text>
            </View>
          }
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: COLORS.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: COLORS.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: COLORS.text,
    paddingVertical: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  courseCard: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  courseInfo: {
    flex: 1,
  },
  courseCodeContainer: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  courseCode: {
    ...typography.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  courseName: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.xs,
  },
  lecturerName: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
  },
  expandIconContainer: {
    marginLeft: spacing.sm,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: COLORS.surfaceLight,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h4,
    color: COLORS.text,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  progressContainer: {
    height: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  expandedContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: spacing.md,
  },
  monitoringSection: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  monitoringItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  monitoringIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  monitoringContent: {
    flex: 1,
  },
  monitoringTitle: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  monitoringSubtitle: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  performancePreview: {
    marginBottom: spacing.md,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    padding: spacing.md,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    ...typography.h4,
    color: COLORS.text,
    fontWeight: '600',
  },
  metricLabel: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  scheduleSection: {
    marginBottom: spacing.md,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  scheduleText: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: spacing.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    ...typography.bodySmall,
    color: COLORS.buttonPrimaryText,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    ...typography.bodySmall,
    color: COLORS.text,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyStateText: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});