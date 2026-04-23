// app/lecturer/Attendance.js - Updated to properly access state

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchCoursesByLecturer } from '../../src/store/courseSlice';
import { 
  fetchAttendanceByCourse,
  fetchStudentsByCourse
} from '../../src/store/attendanceSlice';

export default function LecturerAttendance({ navigation, route }) {
  const dispatch = useDispatch();
  const { courses, isLoading: coursesLoading } = useSelector(state => state.courses);
  const attendanceState = useSelector(state => state.attendance);
  const { user } = useSelector(state => state.auth);
  
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentAttendance, setStudentAttendance] = useState({});

  // Get lecturer's employee ID
  const lecturerId = user?.employeeId || user?.id || user?.uid;

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    if (lecturerId) {
      await dispatch(fetchCoursesByLecturer(lecturerId));
    }
  };

  const handleCourseSelect = async (course) => {
    console.log('📚 Selected course:', course.id, course.name);
    setSelectedCourse(course);
    
    // Fetch students from attendance records
    const studentsResult = await dispatch(fetchStudentsByCourse(course.id)).unwrap();
    console.log('📚 Students result:', studentsResult);
    
    // Fetch today's attendance
    const today = new Date().toISOString().split('T')[0];
    const attendanceResult = await dispatch(fetchAttendanceByCourse({ courseId: course.id, date: today })).unwrap();
    console.log('📚 Attendance result:', attendanceResult);
    
    // Build student attendance map from the result
    const records = attendanceResult?.records || [];
    const attendanceMap = {};
    records.forEach(record => {
      attendanceMap[record.studentId] = record.status;
    });
    
    setStudentAttendance(attendanceMap);
    console.log('📚 Attendance map:', attendanceMap);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'present': return COLORS.success;
      case 'absent': return COLORS.error;
      case 'late': return COLORS.warning;
      case 'excused': return COLORS.info;
      default: return COLORS.textDisabled;
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'present': return 'checkmark-circle';
      case 'absent': return 'close-circle';
      case 'late': return 'time';
      case 'excused': return 'help-circle';
      default: return 'help-circle';
    }
  };

  const myCourses = courses || [];
  
  // ✅ Get students directly from state
  const courseStudents = selectedCourse 
    ? (attendanceState?.courseStudents?.[selectedCourse.id] || [])
    : [];
  
  console.log('📚 Course students from state:', courseStudents.length);

  // Calculate attendance summary
  const totalStudents = courseStudents.length;
  const presentCount = Object.values(studentAttendance).filter(s => s === 'present').length;
  const absentCount = Object.values(studentAttendance).filter(s => s === 'absent').length;
  const lateCount = Object.values(studentAttendance).filter(s => s === 'late').length;

  if (coursesLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!selectedCourse) {
    return (
      <ScreenContainer scrollable={true}>
        <View style={styles.container}>
          <Text style={styles.headerTitle}>View Attendance</Text>
          <Text style={styles.subtitle}>Select a course to view attendance</Text>
          
          {myCourses.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={styles.courseSelectCard}
              onPress={() => handleCourseSelect(course)}
            >
              <View>
                <Text style={styles.courseName}>{course.name}</Text>
                <Text style={styles.courseCode}>{course.code}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          ))}
          
          {myCourses.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={48} color={COLORS.textDisabled} />
              <Text style={styles.emptyText}>No courses assigned</Text>
            </View>
          )}
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={true}>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setSelectedCourse(null)}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          <Text style={styles.backText}>Back to Courses</Text>
        </TouchableOpacity>
        
        <Text style={styles.courseTitle}>{selectedCourse.name}</Text>
        <Text style={styles.courseSubtitle}>{selectedCourse.code}</Text>
        
        {/* Date Display */}
        <Card style={styles.dateCard}>
          <Text style={styles.dateLabel}>Date</Text>
          <Text style={styles.dateValue}>{new Date(selectedDate).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}</Text>
        </Card>
        
        {/* Attendance Summary */}
        {totalStudents > 0 && (
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Attendance Summary</Text>
            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{totalStudents}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: COLORS.success }]}>{presentCount}</Text>
                <Text style={styles.statLabel}>Present</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: COLORS.error }]}>{absentCount}</Text>
                <Text style={styles.statLabel}>Absent</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: COLORS.warning }]}>{lateCount}</Text>
                <Text style={styles.statLabel}>Late</Text>
              </View>
            </View>
            <View style={styles.percentageBar}>
              <View 
                style={[
                  styles.percentageFill, 
                  { 
                    width: `${totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0}%`,
                    backgroundColor: COLORS.success 
                  }
                ]} 
              />
            </View>
            <Text style={styles.percentageText}>
              {totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0}% Attendance Rate
            </Text>
          </Card>
        )}
        
        <Text style={styles.studentsTitle}>Students ({totalStudents})</Text>
        
        {attendanceState?.loading ? (
          <LoadingSpinner />
        ) : (
          <ScrollView style={styles.studentsList}>
            {courseStudents.map((student) => {
              const studentId = student.id || student.studentId;
              const status = studentAttendance[studentId] || 'unknown';
              
              return (
                <View key={studentId} style={styles.studentCard}>
                  <View style={styles.studentInfo}>
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarText}>
                        {student.name?.charAt(0)?.toUpperCase() || 'S'}
                      </Text>
                    </View>
                    <View style={styles.studentDetails}>
                      <Text style={styles.studentName}>{student.name}</Text>
                      <Text style={styles.studentId}>{student.studentId || studentId}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '20' }]}>
                    <Ionicons 
                      name={getStatusIcon(status)} 
                      size={20} 
                      color={getStatusColor(status)} 
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
                      {status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              );
            })}
            
            {courseStudents.length === 0 && !attendanceState?.loading && (
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={48} color={COLORS.textDisabled} />
                <Text style={styles.emptyText}>No students found for this course</Text>
              </View>
            )}
          </ScrollView>
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.lg,
  },
  courseSelectCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  courseName: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  courseCode: {
    ...typography.caption,
    color: COLORS.primary,
    marginTop: 2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backText: {
    ...typography.body,
    color: COLORS.primary,
    marginLeft: spacing.xs,
  },
  courseTitle: {
    ...typography.h3,
    color: COLORS.text,
  },
  courseSubtitle: {
    ...typography.caption,
    color: COLORS.primary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  dateCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dateLabel: {
    ...typography.body,
    color: COLORS.textSecondary,
  },
  dateValue: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  summaryCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  summaryTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: COLORS.text,
  },
  statLabel: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  percentageBar: {
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 4,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  percentageFill: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    ...typography.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  studentsTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  studentsList: {
    marginBottom: spacing.xl,
  },
  studentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    ...typography.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  studentId: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
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