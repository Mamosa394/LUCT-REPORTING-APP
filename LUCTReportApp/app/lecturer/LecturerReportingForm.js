// LecturerReportingForm
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingSpinner, Input, Button, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchCourses } from '../../src/store/courseSlice';
import { submitReport } from '../../src/store/monitoringSlice';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function LecturerReportingForm({ navigation, route }) {
  const dispatch = useDispatch();
  const { courses, isLoading } = useSelector(state => state.courses);
  const { user } = useSelector(state => state.auth);
  
  const [submitting, setSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Form state matching brief requirements
  const [formData, setFormData] = useState({
    facultyName: user?.department || '',
    className: '',
    weekOfReporting: '',
    dateOfLecture: new Date(),
    courseName: '',
    courseCode: '',
    lecturerName: user?.name || '',
    actualStudentsPresent: '',
    totalRegisteredStudents: '',
    venue: '',
    scheduledLectureTime: new Date(),
    topicTaught: '',
    learningOutcomes: '',
    lecturerRecommendations: '',
  });

  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    await dispatch(fetchCourses({ lecturerId: user?.id }));
  };

  // Auto-fill course details when course is selected
  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setFormData(prev => ({
      ...prev,
      courseName: course.name || '',
      courseCode: course.code || '',
      className: course.className || course.name || '',
      totalRegisteredStudents: course.students?.length?.toString() || prev.totalRegisteredStudents,
    }));
  };

  // Auto-calculate week of reporting from date
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        dateOfLecture: selectedDate,
        weekOfReporting: getWeekNumber(selectedDate).toString()
      }));
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setFormData(prev => ({
        ...prev,
        scheduledLectureTime: selectedTime
      }));
    }
  };

  const validateForm = () => {
    const required = [
      'facultyName', 'className', 'weekOfReporting', 'courseName', 
      'courseCode', 'lecturerName', 'actualStudentsPresent', 
      'totalRegisteredStudents', 'venue', 'topicTaught', 'learningOutcomes'
    ];
    
    for (let field of required) {
      if (!formData[field]) {
        Alert.alert('Validation Error', `${field.replace(/([A-Z])/g, ' $1').trim()} is required`);
        return false;
      }
    }
    
    if (parseInt(formData.actualStudentsPresent) > parseInt(formData.totalRegisteredStudents)) {
      Alert.alert('Validation Error', 'Actual students cannot exceed total registered students');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const reportData = {
        ...formData,
        submittedBy: user?.employeeId || user?.id || user?.uid,
        employeeId: user?.employeeId, 
        authorName: user?.name || 'Lecturer', 
        createdAt: new Date().toISOString(), 
        description: formData.topicTaught, 
        type: 'lecturer_weekly_report',
        status: 'pending',
        actualStudentsPresent: parseInt(formData.actualStudentsPresent),
        totalRegisteredStudents: parseInt(formData.totalRegisteredStudents),
        dateOfLecture: formData.dateOfLecture.toISOString(),
        scheduledLectureTime: formData.scheduledLectureTime.toISOString(),
        attendanceRate: ((parseInt(formData.actualStudentsPresent) / parseInt(formData.totalRegisteredStudents)) * 100).toFixed(1)
      };
      
      await dispatch(submitReport(reportData)).unwrap();
      Alert.alert(
        'Success', 
        'Report submitted successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const myCourses = courses?.filter(c => c.lecturerId === user?.id) || [];

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Weekly Lecture Report</Text>
            <Text style={styles.headerSubtitle}>Fill in all required fields (*)</Text>
          </View>

          {/* Course Selection */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Select Course</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courseList}>
              {myCourses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={[
                    styles.courseChip,
                    selectedCourse?.id === course.id && styles.courseChipActive
                  ]}
                  onPress={() => handleCourseSelect(course)}
                >
                  <Text style={[
                    styles.courseChipText,
                    selectedCourse?.id === course.id && styles.courseChipTextActive
                  ]}>
                    {course.code}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>

          {/* Faculty & Course Info */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Course Information</Text>
            
            <Input
              label="Faculty Name *"
              value={formData.facultyName}
              onChangeText={(text) => setFormData({...formData, facultyName: text})}
              placeholder="e.g., Faculty of Computing"
            />
            
            <Input
              label="Class Name *"
              value={formData.className}
              onChangeText={(text) => setFormData({...formData, className: text})}
              placeholder="e.g., MDP0000"
            />
            
            <Input
              label="Course Name *"
              value={formData.courseName}
              onChangeText={(text) => setFormData({...formData, courseName: text})}
              placeholder="e.g., Software Engineering"
            />
            
            <Input
              label="Course Code *"
              value={formData.courseCode}
              onChangeText={(text) => setFormData({...formData, courseCode: text})}
              placeholder="e.g., MDP0000"
            />
            
            <Input
              label="Lecturer's Name *"
              value={formData.lecturerName}
              onChangeText={(text) => setFormData({...formData, lecturerName: text})}
              placeholder="Enter lecturer name"
            />
          </Card>

          {/* Date & Time */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Schedule Information</Text>
            
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.datePickerContent}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                <Text style={styles.datePickerLabel}>Date of Lecture *</Text>
              </View>
              <Text style={styles.datePickerValue}>
                {formData.dateOfLecture.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowTimePicker(true)}
            >
              <View style={styles.datePickerContent}>
                <Ionicons name="time-outline" size={20} color={COLORS.primary} />
                <Text style={styles.datePickerLabel}>Scheduled Lecture Time *</Text>
              </View>
              <Text style={styles.datePickerValue}>
                {formData.scheduledLectureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
            
            <Input
              label="Week of Reporting *"
              value={formData.weekOfReporting}
              onChangeText={(text) => setFormData({...formData, weekOfReporting: text})}
              placeholder="e.g., Week 5"
              keyboardType="numeric"
            />
            
            <Input
              label="Venue of the Class *"
              value={formData.venue}
              onChangeText={(text) => setFormData({...formData, venue: text})}
              placeholder="Room 1"
            />
          </Card>

          {/* Attendance Information */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Attendance Information</Text>
            
            <Input
              label="Total Registered Students *"
              value={formData.totalRegisteredStudents}
              onChangeText={(text) => setFormData({...formData, totalRegisteredStudents: text})}
              placeholder="Enter total number"
              keyboardType="numeric"
            />
            
            <Input
              label="Actual Students Present *"
              value={formData.actualStudentsPresent}
              onChangeText={(text) => setFormData({...formData, actualStudentsPresent: text})}
              placeholder="Enter number present"
              keyboardType="numeric"
            />
            
            {formData.totalRegisteredStudents && formData.actualStudentsPresent && (
              <View style={styles.attendanceStats}>
                <Text style={styles.attendanceLabel}>Attendance Rate:</Text>
                <Text style={[
                  styles.attendanceValue,
                  { 
                    color: (parseInt(formData.actualStudentsPresent) / parseInt(formData.totalRegisteredStudents)) >= 0.75 
                      ? COLORS.success 
                      : COLORS.warning 
                  }
                ]}>
                  {((parseInt(formData.actualStudentsPresent) / parseInt(formData.totalRegisteredStudents)) * 100).toFixed(1)}%
                </Text>
              </View>
            )}
          </Card>

          {/* Teaching Content */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Teaching Content</Text>
            
            <Input
              label="Topic Taught *"
              value={formData.topicTaught}
              onChangeText={(text) => setFormData({...formData, topicTaught: text})}
              placeholder="e.g., Introduction to React Native"
            />
            
            <Input
              label="Learning Outcomes *"
              value={formData.learningOutcomes}
              onChangeText={(text) => setFormData({...formData, learningOutcomes: text})}
              placeholder="What students should be able to do after this lecture..."
              multiline
              numberOfLines={4}
            />
            
            <Input
              label="Lecturer's Recommendations"
              value={formData.lecturerRecommendations}
              onChangeText={(text) => setFormData({...formData, lecturerRecommendations: text})}
              placeholder="Any recommendations for improvement..."
              multiline
              numberOfLines={4}
            />
          </Card>

          {/* Submit Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
            />
            <Button
              title={submitting ? "Submitting..." : "Submit Report"}
              onPress={handleSubmit}
              loading={submitting}
              disabled={submitting}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={formData.dateOfLecture}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      {/* Time Picker Modal */}
      {showTimePicker && (
        <DateTimePicker
          value={formData.scheduledLectureTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    ...typography.h2,
    color: COLORS.text,
  },
  headerSubtitle: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  courseList: {
    marginBottom: spacing.sm,
  },
  courseChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  courseChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  courseChipText: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
  },
  courseChipTextActive: {
    color: COLORS.buttonPrimaryText,
    fontWeight: '600',
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: spacing.md,
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePickerLabel: {
    ...typography.body,
    color: COLORS.text,
    marginLeft: spacing.sm,
  },
  datePickerValue: {
    ...typography.body,
    color: COLORS.primary,
  },
  attendanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  attendanceLabel: {
    ...typography.body,
    color: COLORS.textSecondary,
  },
  attendanceValue: {
    ...typography.h4,
    fontWeight: '700',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  submitButton: {
    flex: 2,
  },
});