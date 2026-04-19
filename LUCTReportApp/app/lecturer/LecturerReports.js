// app/lecturer/Reports.js
import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, 
  Modal, ScrollView, StatusBar 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchReports, submitReport } from '../../src/store/monitoringSlice';
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
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
    try {
      const referenceId = user?.employeeId || user?.id || user?.uid;
      
      await Promise.all([
        dispatch(fetchReports({ submittedBy: referenceId })),
        dispatch(fetchCourses({ lecturerId: referenceId })),
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
      const reportPayload = {
        ...formData,
        submittedBy: user?.employeeId || user?.id || user?.uid,
        employeeId: user?.employeeId,
        authorName: user?.name || 'Lecturer',
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      await dispatch(submitReport(reportPayload)).unwrap();
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

  const referenceId = user?.employeeId || user?.id || user?.uid;
  const myReports = reports?.filter(r => r.submittedBy === referenceId || r.employeeId === referenceId) || [];

  const reportStats = {
    total: myReports.length,
    pending: myReports.filter(r => r.status?.toLowerCase() === 'pending').length,
    approved: myReports.filter(r => r.status?.toLowerCase() === 'approved').length,
    rejected: myReports.filter(r => r.status?.toLowerCase() === 'rejected').length,
  };

  const formatReportTitle = (report) => {
    if (!report) return 'Untitled Report';
    if (report.title) return report.title;
    if (report.courseName && report.weekOfReporting) {
      return `${report.courseCode || ''} - Week ${report.weekOfReporting}`;
    }
    if (report.courseName) return report.courseName;
    return 'Untitled Report';
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
        {report.description || (report.topicTaught ? `Topic: ${report.topicTaught}` : 'No description provided')}
      </Text>
      
      <View style={styles.reportFooter}>
        <Text style={styles.reportDate}>
          {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
        </Text>
        <Text style={styles.viewDetailsText}>Tap to view</Text>
      </View>
    </TouchableOpacity>
  );

  // ✅ FIXED: Render report details with null check
  const renderReportDetails = () => {
    if (!selectedReport) return null;
    
    return (
      <ScrollView 
        style={styles.modalScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.modalScrollContent}
      >
        <Card style={styles.detailCard}>
          <Text style={styles.detailTitle}>{formatReportTitle(selectedReport)}</Text>
          
          <View style={styles.metaInfo}>
            <Text style={styles.metaText}>
              Submitted: {selectedReport?.createdAt ? new Date(selectedReport.createdAt).toLocaleString() : 'N/A'}
            </Text>
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Current Status:</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(selectedReport?.status) + '20' }
              ]}>
                <Text style={[styles.statusText, { color: getStatusColor(selectedReport?.status) }]}>
                  {selectedReport?.status?.toUpperCase() || 'PENDING'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>Description:</Text>
          <Text style={styles.detailDescription}>{selectedReport?.description || 'No description provided'}</Text>

          {selectedReport?.feedback && (
            <View style={styles.feedbackContainer}>
              <Text style={styles.feedbackTitle}>Admin Feedback:</Text>
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Reports</Text>
        </View>
        
        {/* Firebase Dynamic Stats Cards */}
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
        </View>
        
        {/* Reports List */}
        <FlatList
          data={myReports}
          renderItem={renderReportItem}
          keyExtractor={(item) => item.id || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color={COLORS.textDisabled} />
              <Text style={styles.emptyTitle}>No Reports Yet</Text>
              <Text style={styles.emptyText}>
                Tap the + button below to submit your first lecture report.
              </Text>
            </View>
          }
        />

        {/* Floating Action Button */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('LecturerReportingForm')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Report Details Modal */}
        <Modal
          visible={!!selectedReport}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setSelectedReport(null)}
        >
          <SafeAreaView style={styles.modalSafeArea} edges={['top']}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Details</Text>
              <TouchableOpacity onPress={() => setSelectedReport(null)} style={styles.closeButton}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            {renderReportDetails()}
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView>
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
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: spacing.md,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    ...typography.h2,
    color: COLORS.text,
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
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statCardPending: {
    backgroundColor: COLORS.warning + '10',
    borderColor: COLORS.warning + '30',
  },
  statCardApproved: {
    backgroundColor: COLORS.success + '10',
    borderColor: COLORS.success + '30',
  },
  statNumber: {
    ...typography.h3,
    color: COLORS.text,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl * 3,
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
    fontWeight: '700',
  },
  reportSubtitle: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: spacing.md,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: spacing.sm,
  },
  reportDate: {
    ...typography.caption,
    color: COLORS.textDisabled,
  },
  viewDetailsText: {
    ...typography.caption,
    color: COLORS.primary,
    fontWeight: '600',
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
  modalSafeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  modalTitle: {
    ...typography.h3,
    color: COLORS.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: spacing.md,
  },
  detailCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  detailTitle: {
    ...typography.h3,
    color: COLORS.text,
    marginBottom: spacing.sm,
  },
  metaInfo: {
    marginVertical: spacing.sm,
  },
  metaText: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  statusLabel: {
    ...typography.body,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: spacing.md,
  },
  sectionLabel: {
    ...typography.body,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: spacing.xs,
  },
  detailDescription: {
    ...typography.body,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  feedbackContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: COLORS.warning + '10',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  feedbackTitle: {
    ...typography.body,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: spacing.xs,
  },
  feedbackText: {
    ...typography.body,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  feedbackBy: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.sm,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});