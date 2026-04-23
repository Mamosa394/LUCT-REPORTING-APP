// app/student/Attendance.js - Simplified version

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, Card } from '../../src/components/UI';
import { AttendanceCalendar, AttendanceLegend } from '../../src/components/Attendance';
import { COLORS, spacing, typography } from '../../config/theme';
import {
  fetchAttendance,
  fetchStudentAttendanceSummary
} from '../../src/store/attendanceSlice';
import { fetchCourses } from '../../src/store/courseSlice';

export default function StudentAttendance({ navigation }) {
  const dispatch = useDispatch();
  const { records = [], stats: studentSummary, loading } = useSelector(state => state.attendance);
  const { courses = [] } = useSelector(state => state.courses);
  const { user } = useSelector(state => state.auth);
  
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);

  // Get the correct student ID
  const studentId = user?.uid || user?.id || user?.studentId || user?.employeeId;

  useEffect(() => {
    loadData();
    checkActiveSession();
  }, []);

  useEffect(() => {
    if (selectedCourse && studentId) {
      dispatch(fetchAttendance({
        moduleId: selectedCourse.id,
        studentId: studentId,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      }));
    }
  }, [selectedCourse, studentId]);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchCourses()),
        studentId && dispatch(fetchStudentAttendanceSummary({ studentId: studentId })),
      ].filter(Boolean));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Check if there's an active attendance session for today
  const checkActiveSession = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour >= 8 && currentHour <= 17) {
      setCurrentSession({
        isActive: true,
        courseName: 'Current Session',
        expiresIn: '15 minutes'
      });
    }
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    const record = records?.find(r => r.date?.split('T')[0] === day.dateString);
    
    if (record) {
      Alert.alert(
        'Attendance Record',
        `Date: ${new Date(day.dateString).toLocaleDateString()}\nStatus: ${record.status?.toUpperCase()}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('No Record', 'No attendance record for this date.');
    }
  };

  const getTodayAttendanceStatus = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = records?.find(r => r.date?.split('T')[0] === today);
    return todayRecord?.status;
  };

  const todayStatus = getTodayAttendanceStatus();

  // Show error if student ID is missing
  if (!studentId) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <Text style={styles.errorText}>Unable to load student information</Text>
          <Text style={styles.errorSubtext}>Please log out and log in again</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (loading && courses.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer scrollable={true}>
      <View style={styles.container}>
        {/* Active Session Banner - Only shows notice, no button */}
        {currentSession?.isActive && !todayStatus && (
          <Card style={styles.activeSessionCard}>
            <View style={styles.activeSessionHeader}>
              <Ionicons name="radio" size={20} color={COLORS.success} />
              <Text style={styles.activeSessionText}>Attendance Open</Text>
            </View>
            <Text style={styles.activeSessionSubtext}>
              {currentSession.courseName} • Expires in {currentSession.expiresIn}
            </Text>
            <Text style={styles.activeSessionNote}>
              Please wait for your lecturer to mark your attendance
            </Text>
          </Card>
        )}

        {/* Today's Status */}
        {todayStatus && (
          <Card style={[styles.todayStatusCard, { borderLeftColor: getStatusColor(todayStatus) }]}>
            <View style={styles.todayStatusHeader}>
              <Ionicons 
                name="checkmark-circle" 
                size={24} 
                color={getStatusColor(todayStatus)} 
              />
              <Text style={styles.todayStatusTitle}>Today's Attendance</Text>
            </View>
            <Text style={[styles.todayStatusValue, { color: getStatusColor(todayStatus) }]}>
              {todayStatus.toUpperCase()}
            </Text>
            <Text style={styles.todayStatusDate}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </Card>
        )}

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
          {selectedCourse && (
            <Text style={styles.selectedCourseName}>{selectedCourse.name}</Text>
          )}
        </Card>

        {/* Legend */}
        <AttendanceLegend />

        {/* Calendar */}
        {selectedCourse && (
          <>
            <AttendanceCalendar
              records={records}
              onDayPress={handleDayPress}
            />
            
            {selectedDate && (
              <Card style={styles.dateInfo}>
                <Text style={styles.dateText}>
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                {records?.find(r => r.date?.split('T')[0] === selectedDate) ? (
                  <View style={styles.statusContainer}>
                    <Text style={styles.statusLabel}>Status:</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(records.find(r => r.date?.split('T')[0] === selectedDate).status) + '20' }
                    ]}>
                      <Text style={[
                        styles.statusValue,
                        { color: getStatusColor(records.find(r => r.date?.split('T')[0] === selectedDate).status) }
                      ]}>
                        {records.find(r => r.date?.split('T')[0] === selectedDate).status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.noRecordText}>No attendance record for this date</Text>
                )}
              </Card>
            )}
          </>
        )}

        {!selectedCourse && (
          <Card style={styles.selectPrompt}>
            <Ionicons name="arrow-up" size={32} color={COLORS.textDisabled} />
            <Text style={styles.selectPromptText}>
              Select a course above to view attendance calendar
            </Text>
          </Card>
        )}
      </View>
    </ScreenContainer>
  );
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'present': return COLORS.success;
    case 'absent': return COLORS.error;
    case 'late': return COLORS.warning;
    case 'excused': return COLORS.info;
    default: return COLORS.textSecondary;
  }
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    ...typography.h4,
    color: COLORS.error,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  errorSubtext: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  activeSessionCard: {
    marginBottom: spacing.md,
    backgroundColor: COLORS.primary + '10',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
    padding: spacing.md,
  },
  activeSessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  activeSessionText: {
    ...typography.body,
    color: COLORS.success,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  activeSessionSubtext: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginBottom: spacing.xs,
  },
  activeSessionNote: {
    ...typography.caption,
    color: COLORS.textDisabled,
    fontStyle: 'italic',
  },
  todayStatusCard: {
    marginBottom: spacing.md,
    alignItems: 'center',
    borderLeftWidth: 4,
    padding: spacing.md,
  },
  todayStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  todayStatusTitle: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginLeft: spacing.xs,
  },
  todayStatusValue: {
    ...typography.h2,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  todayStatusDate: {
    ...typography.caption,
    color: COLORS.textSecondary,
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
  selectedCourseName: {
    ...typography.bodySmall,
    color: COLORS.primary,
    marginTop: spacing.xs,
  },
  dateInfo: {
    marginTop: spacing.md,
    alignItems: 'center',
    padding: spacing.md,
  },
  dateText: {
    ...typography.body,
    color: COLORS.text,
    marginBottom: spacing.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  statusValue: {
    ...typography.bodySmall,
    fontWeight: '700',
  },
  noRecordText: {
    ...typography.bodySmall,
    color: COLORS.textDisabled,
  },
  selectPrompt: {
    marginTop: spacing.xl,
    alignItems: 'center',
    padding: spacing.xl,
  },
  selectPromptText: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});