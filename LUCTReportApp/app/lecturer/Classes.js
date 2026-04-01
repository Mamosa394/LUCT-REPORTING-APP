// app/lecturer/Classes.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, Card, Button } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchCourses } from '../../src/store/courseSlice';
import { fetchAttendanceByCourse } from '../../src/store/attendanceSlice';

export default function LecturerClasses({ navigation }) {
  const dispatch = useDispatch();
  const { courses, isLoading: coursesLoading } = useSelector(state => state.courses);
  const { attendanceRecords } = useSelector(state => state.attendance);
  const { user } = useSelector(state => state.auth);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await dispatch(fetchCourses({ lecturerId: user?.id }));
  };

  const handleCourseSelect = async (course) => {
    setSelectedCourse(course);
    await dispatch(fetchAttendanceByCourse({ courseId: course.id }));
    
    // Check if attendance already marked for today
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = attendanceRecords?.find(r => r.date?.split('T')[0] === today);
    setTodayAttendance(todayRecord);
  };

  const handleMarkAttendance = (course) => {
    navigation.navigate('MarkAttendance', { courseId: course.id });
  };

  const handleViewAttendance = (course) => {
    navigation.navigate('CourseAttendance', { courseId: course.id });
  };

  const myCourses = courses?.filter(c => c.lecturerId === user?.id) || [];

  if (coursesLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer scrollable={true}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>My Classes</Text>

        {/* Course List */}
        {myCourses.map((course) => (
          <Card key={course.id} style={styles.courseCard}>
            <View style={styles.courseHeader}>
              <View>
                <Text style={styles.courseName}>{course.name}</Text>
                <Text style={styles.courseCode}>{course.code}</Text>
              </View>
              <View style={styles.courseStats}>
                <Text style={styles.studentCount}>
                  {course.students?.length || 0} Students
                </Text>
              </View>
            </View>

            <View style={styles.courseDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>
                  {course.schedule || 'Mon & Wed, 10:00 AM - 12:00 PM'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>
                  {course.room || 'Room 301'}
                </Text>
              </View>
            </View>

            <View style={styles.actionButtons}>
              <Button
                title="Mark Attendance"
                onPress={() => handleMarkAttendance(course)}
                size="sm"
                style={styles.actionButton}
              />
              <Button
                title="View Attendance"
                variant="secondary"
                onPress={() => handleViewAttendance(course)}
                size="sm"
                style={styles.actionButton}
              />
            </View>

            {todayAttendance && (
              <View style={styles.attendanceStatus}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.attendanceText}>
                  Attendance marked for today
                </Text>
              </View>
            )}
          </Card>
        ))}

        {myCourses.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={48} color={COLORS.textDisabled} />
            <Text style={styles.emptyText}>No classes assigned yet</Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  courseCard: {
    marginBottom: spacing.md,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  courseName: {
    ...typography.h4,
    color: COLORS.text,
  },
  courseCode: {
    ...typography.caption,
    color: COLORS.primary,
    marginTop: 2,
  },
  courseStats: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  studentCount: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  courseDetails: {
    marginVertical: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailText: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  attendanceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  attendanceText: {
    ...typography.bodySmall,
    color: COLORS.success,
    marginLeft: spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginTop: spacing.md,
  },
});