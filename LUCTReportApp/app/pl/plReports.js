// app/pl/Reports.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchReports } from '../../src/store/monitoringSlice';

export default function PLReports({ navigation }) {
  const dispatch = useDispatch();
  const { reports, reportsLoading } = useSelector(state => state.monitoring);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    dispatch(fetchReports());
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return COLORS.success;
      case 'rejected': return COLORS.error;
      case 'pending': return COLORS.warning;
      default: return COLORS.textSecondary;
    }
  };

  if (reportsLoading && reports.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  if (selectedReport) {
    return (
      <ScreenContainer scrollable={true}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedReport(null)}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            <Text style={styles.backText}>Back to Reports</Text>
          </TouchableOpacity>

          <Card style={styles.detailCard}>
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedReport.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(selectedReport.status) }]}>
                  {selectedReport.status?.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.dateText}>
                {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleDateString() : ''}
              </Text>
            </View>

            <Text style={styles.reportTitle}>{selectedReport.title || 'Untitled Report'}</Text>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Course</Text>
                <Text style={styles.infoValue}>{selectedReport.courseName || 'N/A'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Course Code</Text>
                <Text style={styles.infoValue}>{selectedReport.courseCode || 'N/A'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Lecturer</Text>
                <Text style={styles.infoValue}>{selectedReport.lecturerName || 'N/A'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Week</Text>
                <Text style={styles.infoValue}>{selectedReport.weekOfReporting || 'N/A'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Students Present</Text>
                <Text style={styles.infoValue}>
                  {selectedReport.actualStudentsPresent}/{selectedReport.totalRegisteredStudents}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Attendance Rate</Text>
                <Text style={styles.infoValue}>{selectedReport.attendanceRate}%</Text>
              </View>
            </View>

            {selectedReport.topicTaught && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Topic Taught</Text>
                <Text style={styles.sectionText}>{selectedReport.topicTaught}</Text>
              </View>
            )}

            {selectedReport.learningOutcomes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Learning Outcomes</Text>
                <Text style={styles.sectionText}>{selectedReport.learningOutcomes}</Text>
              </View>
            )}

            {selectedReport.description && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.sectionText}>{selectedReport.description}</Text>
              </View>
            )}
          </Card>

          {/* PRL Feedback */}
          {selectedReport.feedback && (
            <Card style={styles.feedbackCard}>
              <Text style={styles.feedbackTitle}>PRL Feedback</Text>
              <Text style={styles.feedbackText}>{selectedReport.feedback}</Text>
              {selectedReport.reviewedByName && (
                <Text style={styles.feedbackBy}>Reviewed by: {selectedReport.reviewedByName}</Text>
              )}
              {selectedReport.reviewedAt && (
                <Text style={styles.feedbackDate}>
                  {new Date(selectedReport.reviewedAt).toLocaleDateString()}
                </Text>
              )}
            </Card>
          )}

          {!selectedReport.feedback && (
            <Card style={styles.noFeedbackCard}>
              <Ionicons name="information-circle-outline" size={24} color={COLORS.textSecondary} />
              <Text style={styles.noFeedbackText}>No PRL feedback yet</Text>
            </Card>
          )}
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={true}>
      <View style={styles.container}>
        <Text style={styles.headerTitle}>Reports</Text>
        <Text style={styles.subtitle}>{reports.length} reports</Text>

        {reports.map((report) => (
          <TouchableOpacity
            key={report.id}
            style={styles.reportCard}
            onPress={() => setSelectedReport(report)}
          >
            <View style={styles.reportHeader}>
              <View style={styles.reportInfo}>
                <Text style={styles.reportName}>{report.courseName || report.title || 'Untitled'}</Text>
                <Text style={styles.reportCode}>{report.courseCode}</Text>
                <Text style={styles.reportLecturer}>{report.lecturerName}</Text>
              </View>
              <View style={styles.reportRight}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                    {report.status?.toUpperCase()}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </View>
            </View>
            <View style={styles.reportMeta}>
              <Text style={styles.reportDate}>
                Week {report.weekOfReporting} • {report.actualStudentsPresent}/{report.totalRegisteredStudents} students
              </Text>
              <Text style={styles.reportDate}>
                {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : ''}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {reports.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={COLORS.textDisabled} />
            <Text style={styles.emptyText}>No reports yet</Text>
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
  },
  subtitle: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.lg,
  },
  reportCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportInfo: {
    flex: 1,
  },
  reportName: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  reportCode: {
    ...typography.caption,
    color: COLORS.primary,
  },
  reportLecturer: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  reportRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  reportMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  reportDate: {
    ...typography.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  backText: {
    ...typography.body,
    color: COLORS.primary,
  },
  detailCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dateText: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  reportTitle: {
    ...typography.h3,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  infoItem: {
    width: '50%',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    ...typography.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  infoValue: {
    ...typography.bodySmall,
    color: COLORS.text,
  },
  section: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  sectionTitle: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  sectionText: {
    ...typography.body,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  feedbackCard: {
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
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
    lineHeight: 20,
  },
  feedbackBy: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.sm,
  },
  feedbackDate: {
    ...typography.caption,
    color: COLORS.textDisabled,
    marginTop: spacing.xs,
  },
  noFeedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  noFeedbackText: {
    ...typography.body,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginTop: spacing.md,
  },
});