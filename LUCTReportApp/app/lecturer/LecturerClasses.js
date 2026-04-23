// app/lecturer/Classes.js - Complete fixed version
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
  Alert 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchCoursesByLecturer, fetchCourses } from '../../src/store/courseSlice';
import { fetchAttendanceByCourse } from '../../src/store/attendanceSlice';

export default function LecturerClasses({ navigation }) {
  const dispatch = useDispatch();
  const { courses = [], loading: coursesLoading } = useSelector(state => state.courses);
  const { attendanceRecords } = useSelector(state => state.attendance);
  const { user } = useSelector(state => state.auth);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // Get the correct lecturer identifier
  const lecturerId = user?.employeeId || user?.id || user?.uid;
  
  console.log('🔑 Lecturer ID:', lecturerId);

  const loadCourses = async () => {
    if (!lecturerId) {
      console.error('❌ Cannot load courses: No lecturer ID');
      return;
    }
    
    try {
      console.log('📚 Loading courses for lecturer:', lecturerId);
      
      // Try to fetch courses by lecturer first
      const result = await dispatch(fetchCoursesByLecturer(lecturerId)).unwrap();
      console.log(`✅ Loaded ${result.courses?.length || 0} courses`);
      
      // If no courses found with the thunk, try fetching all and filtering
      if (!result.courses || result.courses.length === 0) {
        console.log('📚 No courses found with lecturer filter, trying all courses...');
        const allResult = await dispatch(fetchCourses({})).unwrap();
        
        // Filter locally for this lecturer
        const filteredCourses = allResult.courses?.filter(course => {
          return course.lecturerId === lecturerId ||
                 course.employeeId === lecturerId ||
                 course.assignedLecturerId === lecturerId ||
                 course.lecturerEmployeeId === lecturerId;
        }) || [];
        
        console.log(`📚 Found ${filteredCourses.length} courses after local filtering`);
        
        // If we found courses locally, we might want to store them
        if (filteredCourses.length > 0) {
          // You could dispatch an action to set these courses in state
          // For now, we'll just log them
          filteredCourses.forEach(course => {
            console.log(`  - ${course.code}: ${course.name} (lecturerId: ${course.lecturerId})`);
          });
        }
      }
      
      setInitialLoadDone(true);
    } catch (error) {
      console.error('❌ Error loading courses:', error);
      
      // Fallback: Try to fetch all courses without filter
      try {
        console.log('📚 Fallback: Fetching all courses...');
        const fallbackResult = await dispatch(fetchCourses({})).unwrap();
        const filtered = fallbackResult.courses?.filter(course => {
          return course.lecturerId === lecturerId ||
                 course.employeeId === lecturerId ||
                 course.assignedLecturerId === lecturerId;
        }) || [];
        console.log(`📚 Fallback found ${filtered.length} courses`);
      } catch (fallbackError) {
        console.error('❌ Fallback failed:', fallbackError);
        Alert.alert('Error', 'Failed to load courses. Please try again.');
      } finally {
        setInitialLoadDone(true);
      }
    }
  };

  useEffect(() => {
    if (lecturerId) {
      loadCourses();
    } else {
      console.warn('⚠️ No lecturer ID available');
    }
  }, [lecturerId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  const handleCourseSelect = async (course) => {
    setSelectedCourse(course);
    
    // Fetch attendance for this course
    try {
      await dispatch(fetchAttendanceByCourse({ courseId: course.id })).unwrap();
      
      // Check if attendance already marked for today
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = attendanceRecords?.find(r => {
        const recordDate = r.date?.split('T')[0] || r.createdAt?.split('T')[0];
        return recordDate === today && r.courseId === course.id;
      });
      
      setTodayAttendance(prev => ({
        ...prev,
        [course.id]: todayRecord
      }));
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleViewAttendance = (course) => {
    navigation.navigate('CourseAttendance', { 
      courseId: course.id,
      courseName: course.name 
    });
  };

  // Get student count for each course
  const getStudentCount = (course) => {
    if (course.students && Array.isArray(course.students)) {
      return course.students.length;
    }
    if (course.studentCount) {
      return course.studentCount;
    }
    if (course.totalStudents) {
      return course.totalStudents;
    }
    return 0;
  };

  // Check if attendance is marked for today
  const isAttendanceMarkedToday = (courseId) => {
    return !!todayAttendance[courseId];
  };

  // Only show loading spinner on initial load when no courses exist
  if (coursesLoading && !initialLoadDone && courses.length === 0) {
    return <LoadingSpinner fullScreen text="Loading your classes..." />;
  }

  // Filter courses to ensure we only show the lecturer's courses
  const myCourses = courses.filter(course => {
    return course.lecturerId === lecturerId ||
           course.employeeId === lecturerId ||
           course.assignedLecturerId === lecturerId ||
           course.lecturerEmployeeId === lecturerId;
  });

  console.log(`📊 Displaying ${myCourses.length} courses for lecturer ${lecturerId}`);

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Classes</Text>
            <Text style={styles.courseCount}>
              {myCourses.length} {myCourses.length === 1 ? 'Course' : 'Courses'}
            </Text>
          </View>

          {/* Course List */}
          {myCourses.map((course) => (
            <Card 
              key={course.id} 
              style={[
                styles.courseCard,
                isAttendanceMarkedToday(course.id) && styles.courseCardAttended
              ]}
            >
              <TouchableOpacity
                onPress={() => handleCourseSelect(course)}
                activeOpacity={0.7}
              >
                <View style={styles.courseHeader}>
                  <View style={styles.courseTitleContainer}>
                    <Text style={styles.courseName}>{course.name}</Text>
                    <Text style={styles.courseCode}>{course.code}</Text>
                  </View>
                  <View style={styles.courseStats}>
                    <Ionicons name="people-outline" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.studentCount}>
                      {getStudentCount(course)} Students
                    </Text>
                  </View>
                </View>
                <View style={styles.courseDetails}>
                  <View style={styles.detailItem}>
                  </View>
                  {course.department && (
                    <View style={styles.detailItem}>
                      <Ionicons name="business-outline" size={16} color={COLORS.primary} />
                      <Text style={styles.detailText}>
                        {course.department}
                      </Text>
                    </View>
                  )}
                  {course.semester && (
                    <View style={styles.detailItem}>
                      <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                      <Text style={styles.detailText}>
                        Semester {course.semester} {course.year && `• ${course.year}`}
                      </Text>
                    </View>
                  )}
                </View>

                {isAttendanceMarkedToday(course.id) && (
                  <View style={styles.attendanceStatus}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.attendanceText}>
                      Attendance marked for today
                    </Text>
                    <TouchableOpacity 
                      onPress={() => handleViewAttendance(course)}
                      style={styles.viewLink}
                    >
                      <Text style={styles.viewLinkText}>View</Text>
                    </TouchableOpacity>
                  </View>
                )}                
              </TouchableOpacity>
            </Card>
          ))}

          {myCourses.length === 0 && !coursesLoading && (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="book-outline" size={64} color={COLORS.primary} />
              </View>
              <Text style={styles.emptyTitle}>No Classes Assigned</Text>
              <Text style={styles.emptyText}>
                You don't have any classes assigned yet. Once courses are assigned to you, they will appear here.
              </Text>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={onRefresh}
              >
                <Ionicons name="refresh-outline" size={20} color={COLORS.primary} />
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.h2,
    color: COLORS.text,
    marginBottom: spacing.xs,
  },
  courseCount: {
    ...typography.body,
    color: COLORS.textSecondary,
  },
  courseCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  courseCardAttended: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  courseTitleContainer: {
    flex: 1,
  },
  courseName: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: 2,
  },
  courseCode: {
    ...typography.bodySmall,
    color: COLORS.primary,
    fontWeight: '600',
  },
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  studentCount: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginLeft: spacing.xs,
  },
  courseDetails: {
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailText: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: spacing.sm,
  },
  attendanceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: COLORS.success + '10',
    borderRadius: 8,
  },
  attendanceText: {
    ...typography.bodySmall,
    color: COLORS.success,
    marginLeft: spacing.xs,
    flex: 1,
  },
  viewLink: {
    paddingHorizontal: spacing.sm,
  },
  viewLinkText: {
    ...typography.bodySmall,
    color: COLORS.primary,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    ...typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  secondaryButton: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    ...typography.bodySmall,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: COLORS.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 20,
  },
  refreshButtonText: {
    ...typography.bodySmall,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
});