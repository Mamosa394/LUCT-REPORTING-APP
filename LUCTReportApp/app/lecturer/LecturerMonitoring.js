// app/lecturer/Monitoring.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchCourseMonitoring } from '../../src/store/monitoringSlice';
import { fetchCourses } from '../../src/store/courseSlice';

export default function LecturerMonitoring({ navigation }) {
  const dispatch = useDispatch();
  const { courseMonitoring, isLoading } = useSelector(state => state.monitoring);
  const { courses } = useSelector(state => state.courses);
  const { user } = useSelector(state => state.auth);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await dispatch(fetchCourses({ lecturerId: user?.id }));
  };

  const handleCourseSelect = async (course) => {
    setSelectedCourse(course);
    await dispatch(fetchCourseMonitoring({ courseId: course.id }));
  };

  const myCourses = courses?.filter(c => c.lecturerId === user?.id) || [];

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.headerTitle}>Class Monitoring</Text>
        
        {/* Course Selection */}
        <Card style={styles.courseCard}>
          <Text style={styles.sectionTitle}>Select Course</Text>
          {myCourses.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={[
                styles.courseItem,
                selectedCourse?.id === course.id && styles.courseItemActive
              ]}
              onPress={() => handleCourseSelect(course)}
            >
              <View>
                <Text style={styles.courseName}>{course.name}</Text>
                <Text style={styles.courseCode}>{course.code}</Text>
              </View>
              <View style={styles.courseStats}>
                <Text style={styles.statText}>
                  {course.students?.length || 0} Students
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Monitoring Data */}
        {selectedCourse && courseMonitoring && (
          <Card style={styles.monitoringCard}>
            <Text style={styles.sectionTitle}>{selectedCourse.name} - Overview</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {courseMonitoring.attendanceRate || 0}%
                </Text>
                <Text style={styles.statLabel}>Avg Attendance</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {courseMonitoring.participation || 0}%
                </Text>
                <Text style={styles.statLabel}>Participation</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {courseMonitoring.assignmentsSubmitted || 0}
                </Text>
                <Text style={styles.statLabel}>Assignments</Text>
              </View>
            </View>

            {/* Student List with Performance */}
            <Text style={styles.subsectionTitle}>Student Performance</Text>
            {courseMonitoring.students?.slice(0, 10).map((student) => (
              <View key={student.id} style={styles.studentRow}>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{student.name}</Text>
                  <Text style={styles.studentId}>{student.studentId}</Text>
                </View>
                <View style={styles.studentStats}>
                  <Text style={[
                    styles.attendanceRate,
                    { color: student.attendance >= 75 ? COLORS.success : COLORS.warning }
                  ]}>
                    {student.attendance}%
                  </Text>
                </View>
              </View>
            ))}
            
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('CourseDetails', { courseId: selectedCourse.id })}
            >
              <Text style={styles.viewAllText}>View Full Details</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </Card>
        )}
      </ScrollView>
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
  courseItemActive: {
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
  },
  courseName: {
    ...typography.body,
    color: COLORS.text,
  },
  courseCode: {
    ...typography.caption,
    color: COLORS.primary,
  },
  courseStats: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statText: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  monitoringCard: {
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: COLORS.primary,
  },
  statLabel: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  subsectionTitle: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    ...typography.bodySmall,
    color: COLORS.text,
  },
  studentId: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  studentStats: {
    alignItems: 'flex-end',
  },
  attendanceRate: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  viewAllText: {
    ...typography.bodySmall,
    color: COLORS.primary,
    marginRight: spacing.xs,
  },
});