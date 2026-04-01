// app/student/Attendance.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ScreenContainer, LoadingSpinner, Card } from '../../src/components/UI';
import { AttendanceCalendar, AttendanceLegend, AttendanceSummaryCard } from '../../src/components/Attendance';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchAttendanceByCourse, fetchStudentAttendanceSummary } from '../../src/store/attendanceSlice';
import { fetchCourses } from '../../src/store/courseSlice';

export default function StudentAttendance({ navigation }) {
  const dispatch = useDispatch();
  const { attendanceRecords, studentSummary, isLoading } = useSelector(state => state.attendance);
  const { courses } = useSelector(state => state.courses);
  const { user } = useSelector(state => state.auth);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      dispatch(fetchCourses()),
      dispatch(fetchStudentAttendanceSummary({ studentId: user?.id })),
    ]);
  };

  useEffect(() => {
    if (selectedCourse) {
      dispatch(fetchAttendanceByCourse({ courseId: selectedCourse.id }));
    }
  }, [selectedCourse]);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    // Find attendance record for that day
    const record = attendanceRecords.find(r => r.date?.split('T')[0] === day.dateString);
    if (record && record.studentRecord) {
      // Show attendance details
      console.log('Attendance:', record.studentRecord);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer scrollable={true}>
      <View style={styles.container}>
        {/* Course Selector */}
        <Card style={styles.courseSelector}>
          <Text style={styles.label}>Select Course</Text>
          <View style={styles.courseButtons}>
            {courses?.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={[
                  styles.courseButton,
                  selectedCourse?.id === course.id && styles.courseButtonActive,
                ]}
                onPress={() => setSelectedCourse(course)}
              >
                <Text
                  style={[
                    styles.courseButtonText,
                    selectedCourse?.id === course.id && styles.courseButtonTextActive,
                  ]}
                >
                  {course.code}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Summary Card */}
        {studentSummary && (
          <AttendanceSummaryCard summary={studentSummary} />
        )}

        {/* Legend */}
        <AttendanceLegend />

        {/* Calendar */}
        {selectedCourse && (
          <>
            <AttendanceCalendar
              records={attendanceRecords}
              onDayPress={handleDayPress}
            />
            
            {selectedDate && (
              <Card style={styles.dateInfo}>
                <Text style={styles.dateText}>
                  Selected: {new Date(selectedDate).toLocaleDateString()}
                </Text>
                {attendanceRecords.find(r => r.date?.split('T')[0] === selectedDate)?.studentRecord ? (
                  <Text style={styles.statusText}>
                    Status:{' '}
                    <Text style={[
                      styles.statusValue,
                      { color: COLORS.success }
                    ]}>
                      {attendanceRecords.find(r => r.date?.split('T')[0] === selectedDate).studentRecord.status.toUpperCase()}
                    </Text>
                  </Text>
                ) : (
                  <Text style={styles.noRecordText}>No attendance record for this date</Text>
                )}
              </Card>
            )}
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  courseSelector: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.sm,
  },
  courseButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  courseButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  courseButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  courseButtonText: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
  },
  courseButtonTextActive: {
    color: COLORS.buttonPrimaryText,
  },
  dateInfo: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  dateText: {
    ...typography.body,
    color: COLORS.text,
    marginBottom: spacing.sm,
  },
  statusText: {
    ...typography.body,
    color: COLORS.textSecondary,
  },
  statusValue: {
    fontWeight: '700',
  },
  noRecordText: {
    ...typography.bodySmall,
    color: COLORS.textDisabled,
  },
});