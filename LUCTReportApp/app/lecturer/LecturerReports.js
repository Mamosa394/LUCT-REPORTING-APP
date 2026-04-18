// app/lecturer/Reports.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, AppModal, Input, Button, Card } from '../../src/components/UI';
import { ReportList, ReportStats } from '../../src/components/Reports';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchReports, submitReport, updateReportStatus } from '../../src/store/monitoringSlice';
import { fetchCourses } from '../../src/store/courseSlice';

export default function LecturerReports({ navigation }) {
  const dispatch = useDispatch();
  const { reports, isLoading } = useSelector(state => state.monitoring);
  const { courses } = useSelector(state => state.courses);
  const { user } = useSelector(state => state.auth);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'weekly',
    courseId: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      dispatch(fetchReports({ submittedBy: user?.id })),
      dispatch(fetchCourses({ lecturerId: user?.id })),
    ]);
  };

  const handleSubmitReport = async () => {
    if (!formData.title || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    await dispatch(submitReport(formData));
    setShowSubmitModal(false);
    resetForm();
    loadData();
    Alert.alert('Success', 'Report submitted successfully');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'weekly',
      courseId: '',
      description: '',
    });
  };

  const myReports = reports?.filter(r => r.submittedBy === user?.id) || [];
  const myCourses = courses?.filter(c => c.lecturerId === user?.id) || [];

  const reportStats = {
    total: myReports.length,
    pending: myReports.filter(r => r.status === 'pending').length,
    approved: myReports.filter(r => r.status === 'approved').length,
    rejected: myReports.filter(r => r.status === 'rejected').length,
  };

  if (isLoading && !reports) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Reports</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.weeklyReportButton}
            onPress={() => navigation.navigate('LecturerReportingForm')}
          >
            <Ionicons name="document-text-outline" size={20} color={COLORS.buttonPrimaryText} />
            <Text style={styles.weeklyReportText}>Weekly Report</Text>
          </TouchableOpacity>
          <Button
            title="+ New"
            onPress={() => setShowSubmitModal(true)}
            size="sm"
          />
        </View>
      </View>
      
      <ReportStats stats={reportStats} />
      
      <ReportList
        reports={myReports}
        onReportPress={(report) => setSelectedReport(report)}
      />

      {/* Submit Report Modal */}
      <AppModal
        visible={showSubmitModal}
        onClose={() => {
          setShowSubmitModal(false);
          resetForm();
        }}
        title="Submit New Report"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Input
            label="Report Title *"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="Enter report title"
          />
          
          <View style={styles.typeSelector}>
            <Text style={styles.label}>Report Type *</Text>
            <View style={styles.typeButtons}>
              {['weekly', 'monthly', 'incident'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    formData.type === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, type })}
                >
                  <Text style={[
                    styles.typeText,
                    formData.type === type && styles.typeTextActive,
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.courseSelector}>
            <Text style={styles.label}>Course (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.courseChip,
                  !formData.courseId && styles.courseChipActive,
                ]}
                onPress={() => setFormData({ ...formData, courseId: '' })}
              >
                <Text style={[
                  styles.courseChipText,
                  !formData.courseId && styles.courseChipTextActive,
                ]}>
                  All
                </Text>
              </TouchableOpacity>
              {myCourses.map((course) => (
                <TouchableOpacity
                  key={course.id}
                  style={[
                    styles.courseChip,
                    formData.courseId === course.id && styles.courseChipActive,
                  ]}
                  onPress={() => setFormData({ ...formData, courseId: course.id })}
                >
                  <Text style={[
                    styles.courseChipText,
                    formData.courseId === course.id && styles.courseChipTextActive,
                  ]}>
                    {course.code}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <Input
            label="Description *"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Describe your report..."
            multiline
            numberOfLines={6}
          />
          
          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => {
                setShowSubmitModal(false);
                resetForm();
              }}
              style={styles.modalButton}
            />
            <Button
              title="Submit"
              onPress={handleSubmitReport}
              style={styles.modalButton}
            />
          </View>
        </ScrollView>
      </AppModal>

      {/* Report Details Modal */}
      <AppModal
        visible={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="Report Details"
      >
        {selectedReport && (
          <ScrollView>
            <Card style={styles.detailCard}>
              <Text style={styles.detailTitle}>{selectedReport.title}</Text>
              <Text style={styles.detailType}>Type: {selectedReport.type?.toUpperCase()}</Text>
              
              <View style={styles.metaInfo}>
                <Text style={styles.metaText}>
                  Submitted: {new Date(selectedReport.createdAt).toLocaleDateString()}
                </Text>
                <View style={styles.statusContainer}>
                  <Text style={styles.statusLabel}>Status:</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(selectedReport.status) + '20' }
                  ]}>
                    <Text style={[styles.statusText, { color: getStatusColor(selectedReport.status) }]}>
                      {selectedReport.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
              
              {selectedReport.course && (
                <Text style={styles.detailCourse}>
                  Course: {selectedReport.course.name}
                </Text>
              )}
              
              <Text style={styles.detailDescription}>{selectedReport.description}</Text>
              
              {selectedReport.feedback && (
                <View style={styles.feedbackContainer}>
                  <Text style={styles.feedbackTitle}>Feedback:</Text>
                  <Text style={styles.feedbackText}>{selectedReport.feedback}</Text>
                  <Text style={styles.feedbackBy}>
                    Reviewed by: {selectedReport.reviewedBy?.name}
                  </Text>
                </View>
              )}
            </Card>
          </ScrollView>
        )}
      </AppModal>
    </ScreenContainer>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return COLORS.warning;
    case 'approved': return COLORS.success;
    case 'rejected': return COLORS.error;
    default: return COLORS.textSecondary;
  }
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    ...typography.h2,
    color: COLORS.text,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weeklyReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    marginRight: spacing.sm,
  },
  weeklyReportText: {
    ...typography.bodySmall,
    color: COLORS.buttonPrimaryText,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  typeSelector: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.sm,
  },
  typeButtons: {
    flexDirection: 'row',
  },
  typeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: COLORS.surfaceLight,
    marginRight: spacing.sm,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  typeText: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
  },
  typeTextActive: {
    color: COLORS.buttonPrimaryText,
  },
  courseSelector: {
    marginBottom: spacing.md,
  },
  courseChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    marginRight: spacing.sm,
  },
  courseChipActive: {
    backgroundColor: COLORS.primary,
  },
  courseChipText: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
  },
  courseChipTextActive: {
    color: COLORS.buttonPrimaryText,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  detailCard: {
    marginBottom: spacing.md,
  },
  detailTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.sm,
  },
  detailType: {
    ...typography.caption,
    color: COLORS.primary,
    marginBottom: spacing.sm,
  },
  metaInfo: {
    marginVertical: spacing.sm,
  },
  metaText: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  statusLabel: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
    marginRight: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  detailCourse: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginVertical: spacing.sm,
  },
  detailDescription: {
    ...typography.body,
    color: COLORS.text,
    marginVertical: spacing.sm,
    lineHeight: 20,
  },
  feedbackContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
  },
  feedbackTitle: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  feedbackText: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.sm,
  },
  feedbackBy: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
});