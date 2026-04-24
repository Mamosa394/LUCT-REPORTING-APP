import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ScreenContainer, LoadingSpinner, Card, Button } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { fetchReports, selectReports, selectReportsLoading } from '../../src/store/monitoringSlice';

export default function PrlReports({ route, navigation }) {
  const { reportId } = route.params || {};
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  
  // Get reports from Redux store
  const reduxReports = useSelector(selectReports);
  const reportsLoading = useSelector(selectReportsLoading);
  
  const [report, setReport] = useState(null);
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showReviewed, setShowReviewed] = useState(false);

  // Fetch reports using Redux thunk
  const fetchAllReports = useCallback(() => {
    dispatch(fetchReports({}));
  }, [dispatch]);

  const fetchReportById = useCallback(async (id) => {
    try {
      setLoading(true);
      const docSnap = await getDoc(doc(db, 'reports', id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setReport({ id: docSnap.id, ...data });
        setFeedback(data.prlFeedback || '');
      } else {
        Alert.alert('Error', 'Report not found');
        navigation.goBack();
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (!reportId) {
        fetchAllReports();
      }
    }, [reportId, fetchAllReports])
  );

  // Handle specific report view
  useEffect(() => {
    if (reportId) {
      fetchReportById(reportId);
    }
  }, [reportId, fetchReportById]);

  // Update local allReports when Redux reports change
  useEffect(() => {
    if (!reportId && reduxReports.length > 0) {
      
      let filteredReports = [...reduxReports];
      
      if (!showReviewed) {
        // Show only pending/submitted reports
        filteredReports = filteredReports.filter(r => 
          r.status === 'pending' || r.status === 'submitted'
        );
      }
      
      // Sort by createdAt (newest first) and put pending at top
      const sortedReports = filteredReports.sort((a, b) => {
        const statusOrder = { 'pending': 0, 'submitted': 1, 'reviewed': 2 };
        const statusDiff = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
        if (statusDiff !== 0) return statusDiff;
        
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });
      
      setAllReports(sortedReports);
      setLoading(false);
    } else if (!reportId && reportsLoading === false) {
      setLoading(false);
    }
  }, [reduxReports, showReviewed, reportId, reportsLoading]);

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      Alert.alert('Error', 'Please enter feedback');
      return;
    }
    
    try {
      setSubmitting(true);
      const reportRef = doc(db, 'reports', report.id);
      const updateData = {
        status: 'reviewed',
        prlFeedback: feedback.trim(),
        prlReviewedBy: user?.name || 'Unknown',
        prlReviewedAt: serverTimestamp(),
      };
      
      await updateDoc(reportRef, updateData);
      
      // Verify the update
      const verifySnap = await getDoc(reportRef);
      if (verifySnap.exists()) {
      }
      
      Alert.alert('Success', 'Review submitted successfully', [
        { 
          text: 'OK', 
          onPress: () => {
            navigation.goBack();
          }
        }
      ]);
    } catch (err) { 
      Alert.alert('Error', `Submission failed: ${err.message}`); 
    } finally { 
      setSubmitting(false); 
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'reviewed': return COLORS.success;
      case 'submitted': return COLORS.warning;
      case 'pending': return COLORS.info || '#FF9800';
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'reviewed': return 'checkmark-circle';
      case 'submitted': return 'time';
      case 'pending': return 'alert-circle';
      default: return 'document-text';
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  // --- TAB VIEW: Show list of all reports ---
  if (!reportId) {
    return (
      <ScreenContainer>
        <ScrollView style={{padding: spacing.md}}>
          {/* Header with toggle */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>
              {showReviewed ? 'Reports' : 'All Reports'}
            </Text>
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleLabel}>Show Reviewed</Text>
              <Switch
                value={showReviewed}
                onValueChange={setShowReviewed}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={showReviewed ? COLORS.primary : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Stats Summary */}
          <View style={styles.statsContainer}>
            <View style={styles.statBadge}>
              <Text style={styles.statNumber}>
                {allReports.filter(r => r.status === 'pending' || r.status === 'submitted').length}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statNumber}>
                {allReports.filter(r => r.status === 'reviewed').length}
              </Text>
              <Text style={styles.statLabel}>Reviewed</Text>
            </View>
            <View style={styles.statBadge}>
              <Text style={styles.statNumber}>{allReports.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
          
          {allReports.length === 0 ? (
            <View style={styles.center}>
              <Ionicons name="folder-open-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No reports found. Pull down to refresh or check your connection.</Text>
            </View>
          ) : (
            allReports.map(item => (
              <TouchableOpacity 
                key={item.id} 
                style={[
                  styles.listItem,
                  item.status === 'reviewed' && styles.reviewedListItem
                ]} 
                onPress={() => navigation.navigate('PrlReports', { reportId: item.id })}
              >
                <View style={{flex: 1}}>
                  <View style={styles.reportHeader}>
                    <Text style={styles.reportTitle}>{item.courseName || 'Untitled'}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                      <Ionicons name={getStatusIcon(item.status)} size={12} color={getStatusColor(item.status)} />
                      <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reportMeta}>{item.lecturerName}</Text>
                  {item.prlFeedback && (
                    <Text style={styles.reviewedHint} numberOfLines={1}>
                      ✓ Reviewed: {item.prlFeedback.substring(0, 50)}...
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Show specific report feedback form 
  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <ScrollView>
          <Card style={styles.card}>
            <Text style={styles.title}>Report Review</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Course:</Text>
              <Text style={styles.val}>{report.courseName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Lecturer:</Text>
              <Text style={styles.val}>{report.lecturerName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Topic:</Text>
              <Text style={styles.val}>{report.topicTaught}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Current Status:</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) + '20' }]}>
                <Ionicons name={getStatusIcon(report.status)} size={14} color={getStatusColor(report.status)} />
                <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                  {report.status.toUpperCase()}
                </Text>
              </View>
            </View>
            {report.prlReviewedBy && (
              <View style={styles.row}>
                <Text style={styles.label}>Reviewed By:</Text>
                <Text style={styles.val}>{report.prlReviewedBy}</Text>
              </View>
            )}
            {report.prlReviewedAt && (
              <View style={styles.row}>
                <Text style={styles.label}>Reviewed At:</Text>
                <Text style={styles.val}>
                  {report.prlReviewedAt?.toDate?.()?.toLocaleString() || 
                   (typeof report.prlReviewedAt === 'string' ? new Date(report.prlReviewedAt).toLocaleString() : 'N/A')}
                </Text>
              </View>
            )}
          </Card>
          
          <Card style={styles.card}>
            <Text style={styles.label}>Your Feedback</Text>
            <TextInput
              style={styles.input}
              value={feedback}
              onChangeText={setFeedback}
              multiline
              placeholder="Enter feedback for the lecturer..."
              editable={report.status !== 'reviewed'}
            />
            {report.status !== 'reviewed' ? (
              <Button title="Submit Feedback" onPress={handleSubmitFeedback} loading={submitting} />
            ) : (
              <View style={styles.reviewedContainer}>
                <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                <Text style={styles.reviewedText}>✓ Already reviewed</Text>
                {report.prlFeedback && (
                  <View style={styles.existingFeedback}>
                    <Text style={styles.existingFeedbackLabel}>Previous Feedback:</Text>
                    <Text style={styles.existingFeedbackText}>{report.prlFeedback}</Text>
                  </View>
                )}
              </View>
            )}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h3, marginBottom: spacing.md, color: COLORS.text },
  card: { margin: spacing.md, padding: spacing.md },
  row: { flexDirection: 'row', marginBottom: spacing.xs, alignItems: 'center' },
  label: { fontWeight: 'bold', width: 120, color: COLORS.textSecondary },
  val: { flex: 1, color: COLORS.text },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10, minHeight: 120, marginBottom: spacing.md, textAlignVertical: 'top', color: 'white' },
  
  // List view styles
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  toggleLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
    padding: spacing.sm,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
  },
  statBadge: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  listItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: COLORS.cardBackground, 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 10, 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  reviewedListItem: {
    opacity: 0.8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reportTitle: { 
    fontWeight: 'bold', 
    color: COLORS.text,
    flex: 1,
  },
  reportMeta: { 
    fontSize: 12, 
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  reportStatus: { 
    fontSize: 11, 
    color: COLORS.primary, 
    marginTop: 4 
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  reviewedHint: {
    fontSize: 11,
    color: COLORS.success,
    marginTop: 4,
    fontStyle: 'italic',
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 50,
    gap: spacing.md,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  reviewedContainer: {
    alignItems: 'center',
    padding: spacing.md,
  },
  reviewedText: { 
    textAlign: 'center', 
    color: COLORS.success, 
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: spacing.sm,
  },
  existingFeedback: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    width: '100%',
  },
  existingFeedbackLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  existingFeedbackText: {
    color: COLORS.text,
    fontSize: 14,
  },
});