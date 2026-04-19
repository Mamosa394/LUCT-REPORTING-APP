// app/lecturer/Reports.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, AppModal, Input, Button, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchReports, submitReport, updateReportStatus } from '../../src/store/monitoringSlice';
import { fetchCourses } from '../../src/store/courseSlice';

export default function LecturerReports({ navigation }) {
  const dispatch = useDispatch();
  const { reports = [], reportsLoading } = useSelector(state => state.monitoring);
  const { courses = [] } = useSelector(state => state.courses);
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
    try {
      await Promise.all([
        dispatch(fetchReports({ submittedBy: user?.id })),
        dispatch(fetchCourses({ lecturerId: user?.id })),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmitReport = async () => {
    if (!formData.title || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    try {
      await dispatch(submitReport(formData)).unwrap();
      setShowSubmitModal(false);
      resetForm();
      loadData();
      Alert.alert('Success', 'Report submitted successfully');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit report');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'weekly',
      courseId: '',
      description: '',
    });
  };

  const myReports = reports?.filter(r => r.submittedBy === user?.id || r.submittedBy === user?.uid) || [];
  const myCourses = courses?.filter(c => c.lecturerId === user?.id) || [];

  const reportStats = {
    total: myReports.length,
    pending: myReports.filter(r => r.status === 'pending').length,
    approved: myReports.filter(r => r.status === 'approved').length,
    rejected: myReports.filter(r => r.status === 'rejected').length,
  };

  // Format report for display
  const formatReportTitle = (report) => {
    if (report.title) return report.title;
    if (report.courseName && report.weekOfReporting) {
      return `${report.courseCode} - Week ${report.weekOfReporting}`;
    }
    if (report.courseName) return report.courseName;
    return 'Untitled Report';
  };

  const formatReportSubtitle = (report) => {
    if (report.description) return report.description;
    if (report.topicTaught) return `Topic: ${report.topicTaught}`;
    return '';
  };

  const renderReportItem = ({ item: report }) => (
    <TouchableOpacity 
      style={styles.reportItem}
      onPress={() => setSelectedReport(report)}
    >
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>{formatReportTitle(report)}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(report.status) + '20' }
        ]}>
          <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
            {report.status?.toUpperCase() || 'PENDING'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.reportSubtitle} numberOfLines={2}>
        {formatReportSubtitle(report)}
      </Text>
      
      {/* Show attendance if available */}
      {report.actualStudentsPresent && report.totalRegisteredStudents && (
        <View style={styles.attendanceRow}>
          <Ionicons name="people-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.attendanceText}>
            Attendance: {report.actualStudentsPresent}/{report.totalRegisteredStudents} ({report.attendanceRate}%)
          </Text>
        </View>
      )}
      
      <View style={styles.reportFooter}>
        <Text style={styles.reportDate}>
          {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const renderReportDetails = () => {
    if (!selectedReport) return null;
    
    const isWeeklyReport = selectedReport.topicTaught || selectedReport.learningOutcomes;
    
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={styles.detailCard}>
          <Text style={styles.detailTitle}>{formatReportTitle(selectedReport)}</Text>
          
          {selectedReport.type && (
            <Text style={styles.detailType}>Type: {selectedReport.type.toUpperCase()}</Text>
          )}
          
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>
              Submitted: {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleString() : 'N/A'}
            </Text>
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Status:</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(selectedReport.status) + '20' }
              ]}>
                <Text style={[styles.statusText, { color: getStatusColor(selectedReport.status) }]}>
                  {selectedReport.status?.toUpperCase() || 'PENDING'}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Weekly Report Specific Details */}
          {isWeeklyReport && (
            <>
              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Faculty:</Text>
                <Text style={styles.infoValue}>{selectedReport.facultyName}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Course:</Text>
                <Text style={styles.infoValue}>{selectedReport.courseCode} - {selectedReport.courseName}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Class:</Text>
                <Text style={styles.infoValue}>{selectedReport.className}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Venue:</Text>
                <Text style={styles.infoValue}>{selectedReport.venue}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Week:</Text>
                <Text style={styles.infoValue}>Week {selectedReport.weekOfReporting}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Lecture Date:</Text>
                <Text style={styles.infoValue}>
                  {selectedReport.dateOfLecture ? new Date(selectedReport.dateOfLecture).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Attendance:</Text>
                <Text style={styles.infoValue}>
                  {selectedReport.actualStudentsPresent}/{selectedReport.totalRegisteredStudents} ({selectedReport.attendanceRate}%)
                </Text>
              </View>
              
              <View style={styles.divider} />
              
              <Text style={styles.sectionLabel}>Topic Taught:</Text>
              <Text style={styles.sectionContent}>{selectedReport.topicTaught}</Text>
              
              <Text style={styles.sectionLabel}>Learning Outcomes:</Text>
              <Text style={styles.sectionContent}>{selectedReport.learningOutcomes}</Text>
              
              {selectedReport.lecturerRecommendations && (
                <>
                  <Text style={styles.sectionLabel}>Recommendations:</Text>
                  <Text style={styles.sectionContent}>{selectedReport.lecturerRecommendations}</Text>
                </>
              )}
            </>
          )}
          
          {/* Simple Report Details */}
          {!isWeeklyReport && selectedReport.description && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionLabel}>Description:</Text>
              <Text style={styles.detailDescription}>{selectedReport.description}</Text>
            </>
          )}
          
          {/* Feedback Section */}
          {selectedReport.feedback && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackTitle}>Feedback:</Text>
              <Text style={styles.feedbackText}>{selectedReport.feedback}</Text>
              {selectedReport.reviewedBy && (
                <Text style={styles.feedbackBy}>
                  Reviewed by: {selectedReport.reviewedBy?.name || selectedReport.reviewedBy}
                </Text>
              )}
            </View>
          )}
        </Card>
      </ScrollView>
    );
  };

  if (reportsLoading && reports.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer>
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
      
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{reportStats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, styles.statCardPending]}>
          <Text style={styles.statNumber}>{reportStats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={[styles.statCard, styles.statCardApproved]}>
          <Text style={styles.statNumber}>{reportStats.approved}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
        <View style={[styles.statCard, styles.statCardRejected]}>
          <Text style={styles.statNumber}>{reportStats.rejected}</Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </View>
      </View>
      
      {/* Reports List */}
      <FlatList
        data={myReports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={COLORS.textDisabled} />
            <Text style={styles.emptyTitle}>No Reports Yet</Text>
            <Text style={styles.emptyText}>
              Tap "Weekly Report" to submit your first lecture report
            </Text>
          </View>
        }
      />

      {/* Quick Submit Modal */}
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
        {renderReportDetails()}
      </AppModal>
    </ScreenContainer>
  );
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
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
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    padding: spacing.sm,
    alignItems: 'center',
  },
  statCardPending: {
    backgroundColor: COLORS.warning + '20',
  },
  statCardApproved: {
    backgroundColor: COLORS.success + '20',
  },
  statCardRejected: {
    backgroundColor: COLORS.error + '20',
  },
  statNumber: {
    ...typography.h4,
    color: COLORS.text,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  reportItem: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  reportTitle: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginLeft: spacing.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  reportSubtitle: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: spacing.sm,
  },
  attendanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  attendanceText: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginLeft: spacing.xs,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportDate: {
    ...typography.caption,
    color: COLORS.textDisabled,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginTop: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
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
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  infoLabel: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
  },
  infoValue: {
    ...typography.bodySmall,
    color: COLORS.text,
    fontWeight: '500',
  },
  sectionLabel: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  sectionContent: {
    ...typography.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  detailDescription: {
    ...typography.body,
    color: COLORS.textSecondary,
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