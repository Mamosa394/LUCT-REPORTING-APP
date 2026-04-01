// app/pl/Reports.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, AppModal, Button, Input, Card } from '../../src/components/UI';
import { ReportList, ReportFilter, ReportStats } from '../../src/components/Reports';
import { COLORS, spacing, typography } from '../../src/config/theme';
import { fetchReports, updateReportStatus, deleteReport } from '../../src/store/monitoringslice';

export default function PLReports({ navigation }) {
  const dispatch = useDispatch();
  const { reports, isLoading } = useSelector(state => state.monitoring);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadReports();
  }, [filters]);

  const loadReports = async () => {
    await dispatch(fetchReports(filters));
  };

  const handleStatusUpdate = async (reportId, status, feedbackText = '') => {
    await dispatch(updateReportStatus({ reportId, status, feedback: feedbackText }));
    setSelectedReport(null);
    setFeedback('');
    loadReports();
    Alert.alert('Success', `Report ${status} successfully`);
  };

  const handleDeleteReport = (report) => {
    Alert.alert(
      'Delete Report',
      `Are you sure you want to delete ${report.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await dispatch(deleteReport(report.id));
            loadReports();
            Alert.alert('Success', 'Report deleted successfully');
          },
        },
      ]
    );
  };

  const handleReportPress = (report) => {
    setSelectedReport(report);
  };

  const reportStats = {
    total: reports?.length || 0,
    pending: reports?.filter(r => r.status === 'pending').length || 0,
    approved: reports?.filter(r => r.status === 'approved').length || 0,
    rejected: reports?.filter(r => r.status === 'rejected').length || 0,
  };

  if (isLoading && !reports) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer scrollable={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
        <TouchableOpacity onPress={() => setShowFilter(true)} style={styles.filterButton}>
          <Ionicons name="filter-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      
      <ReportStats stats={reportStats} />
      
      <ReportList
        reports={reports}
        onReportPress={handleReportPress}
        onDelete={handleDeleteReport}
        showActions={true}
      />

      {/* Report Details Modal */}
      <AppModal
        visible={!!selectedReport}
        onClose={() => {
          setSelectedReport(null);
          setFeedback('');
        }}
        title="Report Details"
      >
        {selectedReport && (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Card style={styles.detailCard}>
              <Text style={styles.detailTitle}>{selectedReport.title}</Text>
              <Text style={styles.detailType}>Type: {selectedReport.type?.toUpperCase()}</Text>
              
              <View style={styles.metaInfo}>
                <Text style={styles.metaText}>
                  Submitted by: {selectedReport.submittedBy?.name}
                </Text>
                <Text style={styles.metaText}>
                  Date: {new Date(selectedReport.createdAt).toLocaleDateString()}
                </Text>
              </View>
              
              {selectedReport.course && (
                <Text style={styles.detailCourse}>
                  Course: {selectedReport.course.name} ({selectedReport.course.code})
                </Text>
              )}
              
              <Text style={styles.detailDescription}>{selectedReport.description}</Text>
              
              {selectedReport.attachments?.length > 0 && (
                <View style={styles.attachments}>
                  <Text style={styles.attachmentsTitle}>Attachments:</Text>
                  {selectedReport.attachments.map((file, index) => (
                    <TouchableOpacity key={index} style={styles.attachment}>
                      <Ionicons name="document-outline" size={16} color={COLORS.primary} />
                      <Text style={styles.attachmentText}>File {index + 1}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </Card>
            
            <View style={styles.feedbackSection}>
              <Input
                label="Feedback"
                value={feedback}
                onChangeText={setFeedback}
                placeholder="Provide feedback on this report..."
                multiline
                numberOfLines={4}
              />
              
              <View style={styles.actionButtons}>
                <Button
                  title="Delete"
                  variant="danger"
                  onPress={() => handleDeleteReport(selectedReport)}
                  style={styles.actionButton}
                />
                <Button
                  title="Reject"
                  variant="secondary"
                  onPress={() => handleStatusUpdate(selectedReport.id, 'rejected', feedback)}
                  style={styles.actionButton}
                />
                <Button
                  title="Approve"
                  variant="primary"
                  onPress={() => handleStatusUpdate(selectedReport.id, 'approved', feedback)}
                  style={styles.actionButton}
                />
              </View>
            </View>
            
            {selectedReport.feedback && (
              <Card style={styles.feedbackCard}>
                <Text style={styles.feedbackTitle}>Previous Feedback:</Text>
                <Text style={styles.feedbackText}>{selectedReport.feedback}</Text>
                <Text style={styles.feedbackBy}>
                  Reviewed by: {selectedReport.reviewedBy?.name}
                </Text>
              </Card>
            )}
          </ScrollView>
        )}
      </AppModal>

      {/* Filter Modal */}
      <AppModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        title="Filter Reports"
      >
        <ReportFilter
          filters={filters}
          onFilterChange={(key, value) => {
            setFilters({ ...filters, [key]: value });
            if (value === 'all') {
              const newFilters = { ...filters };
              delete newFilters[key];
              setFilters(newFilters);
            }
          }}
          onClose={() => setShowFilter(false)}
        />
        <Button
          title="Apply Filters"
          onPress={() => {
            loadReports();
            setShowFilter(false);
          }}
          style={styles.applyButton}
        />
      </AppModal>
    </ScreenContainer>
  );
}

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
  filterButton: {
    padding: spacing.sm,
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
  attachments: {
    marginTop: spacing.md,
  },
  attachmentsTitle: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.sm,
  },
  attachment: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  attachmentText: {
    ...typography.bodySmall,
    color: COLORS.primary,
    marginLeft: spacing.xs,
  },
  feedbackSection: {
    marginTop: spacing.md,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  feedbackCard: {
    marginTop: spacing.md,
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
  applyButton: {
    marginTop: spacing.lg,
  },
});