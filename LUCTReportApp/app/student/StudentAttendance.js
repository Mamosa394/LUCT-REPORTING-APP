// student Attendance

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, Card, Button } from '../../src/components/UI';
import { AttendanceCalendar, AttendanceLegend  } from '../../src/components/Attendance';
import { COLORS, spacing, typography } from '../../config/theme';
import {
  fetchAttendance,
  fetchStudentAttendanceSummary,
  markAttendance
} from '../../src/store/attendanceSlice';
import { fetchCourses } from '../../src/store/courseSlice';

export default function StudentAttendance({ navigation }) {
  const dispatch = useDispatch();
  const { records = [], stats: studentSummary, loading, marking } = useSelector(state => state.attendance);
  const { courses = [] } = useSelector(state => state.courses);
  const { user } = useSelector(state => state.auth);
  
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);

  const studentId = user?.uid || user?.id || user?.studentId || user?.employeeId;
  const studentName = user?.name || user?.displayName || 'Student';

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
    } else if (isToday(day.dateString)) {
      setAttendanceStatus(null);
      setShowMarkModal(true);
    } else {
      Alert.alert('No Record', 'No attendance record for this date. Attendance can only be marked for today.');
    }
  };

  const isToday = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const handleMarkAttendance = async (status) => {
    if (!selectedCourse) {
      Alert.alert('Select Course', 'Please select a course first');
      return;
    }

    if (!studentId) {
      Alert.alert('Error', 'Student ID not found. Please log in again.');
      return;
    }

    if (!selectedDate || !isToday(selectedDate)) {
      Alert.alert('Invalid Date', 'Attendance can only be marked for today');
      return;
    }

    const finalStatus = status || 'present';

    try {
      const attendanceData = {
        courseId: selectedCourse.id,
        courseCode: selectedCourse.code || 'N/A',
        courseName: selectedCourse.name || 'Unnamed Course',
        studentId: studentId, // ✅ Now guaranteed to be defined
        studentName: studentName,
        date: new Date().toISOString(),
        status: finalStatus,
        lecturerId: selectedCourse.lecturerId || null,
        lecturerName: selectedCourse.lecturerName || null
      };

      await dispatch(markAttendance(attendanceData)).unwrap();
      
      setShowMarkModal(false);
      Alert.alert(
        'Success',
        `Attendance marked as ${finalStatus.toUpperCase()}`,
        [{ text: 'OK' }]
      );
      
      // Refresh attendance data
      if (studentId) {
        dispatch(fetchAttendance({
          moduleId: selectedCourse.id,
          studentId: studentId,
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        }));
        
        dispatch(fetchStudentAttendanceSummary({ studentId: studentId }));
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to mark attendance');
    }
  };

  const handleQuickMark = () => {
    if (!selectedCourse) {
      Alert.alert('Select Course', 'Please select a course first');
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = records?.find(r => r.date?.split('T')[0] === today);
    
    if (todayRecord) {
      Alert.alert(
        'Already Marked',
        `You have already marked attendance for today as ${todayRecord.status?.toUpperCase()}`,
        [{ text: 'OK' }]
      );
    } else {
      setSelectedDate(today);
      setShowMarkModal(true);
    }
  };

  const getTodayAttendanceStatus = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = records?.find(r => r.date?.split('T')[0] === today);
    return todayRecord?.status;
  };

  const todayStatus = getTodayAttendanceStatus();
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
        {/* Active Session Banner */}
        {currentSession?.isActive && !todayStatus && (
          <Card style={styles.activeSessionCard}>
            <View style={styles.activeSessionHeader}>
              <Ionicons name="radio" size={20} color={COLORS.success} />
              <Text style={styles.activeSessionText}>Attendance Open</Text>
            </View>
            <Text style={styles.activeSessionSubtext}>
              {currentSession.courseName} • Expires in {currentSession.expiresIn}
            </Text>
            <TouchableOpacity
              style={styles.markNowButton}
              onPress={handleQuickMark}
            >
              <Text style={styles.markNowText}>Mark Attendance Now</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.primary} />
            </TouchableOpacity>
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
                  <View>
                    <Text style={styles.noRecordText}>No attendance record</Text>
                    {isToday(selectedDate) && (
                      <TouchableOpacity
                        style={styles.markButton}
                        onPress={() => setShowMarkModal(true)}
                      >
                        <Text style={styles.markButtonText}>Mark Attendance</Text>
                      </TouchableOpacity>
                    )}
                  </View>
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

      {/* Mark Attendance Modal */}
      <Modal
        visible={showMarkModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMarkModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mark Attendance</Text>
              <TouchableOpacity onPress={() => setShowMarkModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>
              {selectedCourse?.name} ({selectedCourse?.code})
            </Text>
            <Text style={styles.modalDate}>
              {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              }) : new Date().toLocaleDateString()}
            </Text>

            <Text style={styles.modalLabel}>Select your status:</Text>

            <TouchableOpacity
              style={[styles.statusOption, attendanceStatus === 'present' && styles.statusOptionSelected]}
              onPress={() => setAttendanceStatus('present')}
            >
              <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.statusOptionText}>Present</Text>
              {attendanceStatus === 'present' && (
                <Ionicons name="checkmark" size={20} color={COLORS.success} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusOption, attendanceStatus === 'late' && styles.statusOptionSelected]}
              onPress={() => setAttendanceStatus('late')}
            >
              <View style={[styles.statusDot, { backgroundColor: COLORS.warning }]} />
              <Text style={styles.statusOptionText}>Late</Text>
              {attendanceStatus === 'late' && (
                <Ionicons name="checkmark" size={20} color={COLORS.warning} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.statusOption, attendanceStatus === 'absent' && styles.statusOptionSelected]}
              onPress={() => setAttendanceStatus('absent')}
            >
              <View style={[styles.statusDot, { backgroundColor: COLORS.error }]} />
              <Text style={styles.statusOptionText}>Absent</Text>
              {attendanceStatus === 'absent' && (
                <Ionicons name="checkmark" size={20} color={COLORS.error} />
              )}
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setShowMarkModal(false)}
                style={styles.modalButton}
              />
              <Button
                title={marking ? "Marking..." : "Confirm"}
                onPress={() => handleMarkAttendance(attendanceStatus || 'present')}
                disabled={marking}
                style={styles.modalButton}
              />
            </View>

            {marking && (
              <ActivityIndicator style={styles.modalLoader} color={COLORS.primary} />
            )}
          </View>
        </View>
      </Modal>
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
    marginBottom: spacing.md,
  },
  markNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceLight,
    padding: spacing.sm,
    borderRadius: 8,
  },
  markNowText: {
    ...typography.bodySmall,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  todayStatusCard: {
    marginBottom: spacing.md,
    alignItems: 'center',
    borderLeftWidth: 4,
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
    marginBottom: spacing.md,
  },
  markButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  markButtonText: {
    ...typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: COLORS.text,
  },
  modalSubtitle: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  modalDate: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginBottom: spacing.lg,
  },
  modalLabel: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.md,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  statusOptionSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
  },
  statusOptionText: {
    ...typography.body,
    color: COLORS.text,
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
  modalLoader: {
    marginTop: spacing.md,
  },
});