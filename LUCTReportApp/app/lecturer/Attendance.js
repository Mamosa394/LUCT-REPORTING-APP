// app/lecturer/Attendance.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, Card, Button, Input } from '../../src/components/UI';
import { MarkAttendanceRow } from '../../src/components/Attendance';
import { COLORS, spacing, typography } from '../../src/config/theme';
import { fetchCourses } from '../../src/store/courseSlice';
import { markAttendance, fetchAttendanceByCourse } from '../../src/store/attendanceSlice';

export default function LecturerAttendance({ navigation, route }) {
  const dispatch = useDispatch();
  const { courses, isLoading: coursesLoading } = useSelector(state => state.courses);
  const { attendanceRecords } = useSelector(state => state.attendance);
  const { user } = useSelector(state => state.auth);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await dispatch(fetchCourses({ lecturerId: user?.id }));
  };

  const handleCourseSelect = async (course) => {
    setSelectedCourse(course);
    setStudents(course.students || []);
    
    // Initialize attendance data
    const initialData = {};
    (course.students || []).forEach(student => {
      initialData[student.id] = 'present';
    });
    setAttendanceData(initialData);
    
    // Check if attendance already exists for today
    const today = new Date().toISOString().split('T')[0];
    await dispatch(fetchAttendanceByCourse({ courseId: course.id }));
    const existingRecord = attendanceRecords?.find(r => r.date?.split('T')[0] === today);
    if (existingRecord) {
      Alert.alert('Info', 'Attendance has already been marked for today');
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSubmitAttendance = async () => {
    const studentsList = Object.keys(attendanceData).map(studentId => ({
      studentId,
      status: attendanceData[studentId]
    }));
    
    setSubmitting(true);
    try {
      await dispatch(markAttendance({
        courseId: selectedCourse.id,
        students: studentsList,
        date,
        type: 'lecture'
      })).unwrap();
      Alert.alert('Success', 'Attendance marked successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const myCourses = courses?.filter(c => c.lecturerId === user?.id) || [];

  if (coursesLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!selectedCourse) {
    return (
      <ScreenContainer scrollable={true}>
        <View style={styles.container}>
          <Text style={styles.headerTitle}>Mark Attendance</Text>
          <Text style={styles.subtitle}>Select a course to mark attendance</Text>
          
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
        
        <Card style={styles.dateCard}>
          <Text style={styles.dateLabel}>Date</Text>
          <Text style={styles.dateValue}>{new Date(date).toLocaleDateString()}</Text>
        </Card>
        
        <Text style={styles.studentsTitle}>Students ({students.length})</Text>
        
        <ScrollView style={styles.studentsList}>
          {students.map((student) => (
            <MarkAttendanceRow
              key={student.id}
              student={student}
              status={attendanceData[student.id]}
              onStatusChange={(status) => handleStatusChange(student.id, status)}
            />
          ))}
        </ScrollView>
        
        <Button
          title={submitting ? 'Submitting...' : 'Submit Attendance'}
          onPress={handleSubmitAttendance}
          loading={submitting}
          style={styles.submitButton}
        />
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
  studentsTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  studentsList: {
    maxHeight: 500,
    marginBottom: spacing.lg,
  },
  submitButton: {
    marginTop: spacing.md,
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