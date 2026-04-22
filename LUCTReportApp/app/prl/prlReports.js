// app/prl/prlReports.js (your PRLReportReview file)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useSelector } from 'react-redux';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ScreenContainer, LoadingSpinner, Card, Button } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { Ionicons } from '@expo/vector-icons';

export default function PRLReportReview({ route, navigation }) {
  // ✅ DEBUG: Log the entire route object
  console.log('🔵 [PRLReportReview] Route object:', JSON.stringify(route, null, 2));
  
  // ✅ SAFE: Handle undefined route.params
  const reportId = route?.params?.reportId;
  
  console.log('🔵 [PRLReportReview] Extracted reportId:', reportId);
  
  const { user } = useSelector(state => state.auth);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔵 [PRLReportReview] useEffect triggered with reportId:', reportId);
    
    // ✅ Check if reportId exists
    if (!reportId) {
      console.error('❌ [PRLReportReview] No reportId provided');
      setError('No report ID provided');
      setLoading(false);
      return;
    }
    
    fetchReport();
  }, [reportId]);

  const fetchReport = async () => {
    try {
      console.log('🔵 [PRLReportReview] Fetching report with ID:', reportId);
      setLoading(true);
      setError(null);
      
      const reportRef = doc(db, 'reports', reportId);
      const reportSnap = await getDoc(reportRef);
      
      if (reportSnap.exists()) {
        const reportData = reportSnap.data();
        console.log('✅ [PRLReportReview] Report found:', reportData);
        
        setReport({
          id: reportSnap.id,
          ...reportData,
          createdAt: reportData.createdAt?.toDate?.() || new Date(),
        });
        
        // Pre-fill existing feedback
        if (reportData.prlFeedback) {
          setFeedback(reportData.prlFeedback);
        }
      } else {
        console.error('❌ [PRLReportReview] Report not found');
        setError('Report not found');
      }
    } catch (error) {
      console.error('❌ [PRLReportReview] Error fetching report:', error);
      setError('Failed to load report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) {
      Alert.alert('Error', 'Please provide feedback before submitting');
      return;
    }

    Alert.alert(
      'Submit Review',
      'Are you sure you want to submit this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: async () => {
            try {
              setSubmitting(true);
              
              const reportRef = doc(db, 'reports', reportId);
              
              await updateDoc(reportRef, {
                status: 'reviewed',
                prlFeedback: feedback.trim(),
                prlReviewedBy: user?.name || 'Principal Lecturer',
                prlReviewedById: user?.uid,
                prlReviewedAt: serverTimestamp(),
              });

              Alert.alert(
                'Success', 
                'Report reviewed successfully',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              console.error('Error submitting review:', error);
              Alert.alert('Error', 'Failed to submit review');
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };

  // ✅ Show error state
  if (error) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            style={styles.errorButton}
          />
        </View>
      </ScreenContainer>
    );
  }

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  // ✅ Check if report exists
  if (!report) {
    return (
      <ScreenContainer>
        <View style={styles.errorContainer}>
          <Ionicons name="document-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.errorTitle}>Report Not Found</Text>
          <Text style={styles.errorMessage}>The requested report could not be found.</Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            style={styles.errorButton}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Report Header - Minimal */}
          <Card style={styles.headerCard}>
            <Text style={styles.reportTitle}>Report Review</Text>
            <View style={styles.lecturerInfo}>
              <Ionicons name="person-circle-outline" size={24} color={COLORS.primary} />
              <Text style={styles.lecturerName}>
                {report?.lecturerName || report?.submittedBy?.name || 'Unknown Lecturer'}
              </Text>
            </View>
            <View style={styles.dateInfo}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
              <Text style={styles.dateText}>
                Submitted: {report?.createdAt?.toLocaleDateString() || 'Unknown date'}
              </Text>
            </View>
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report?.status) }]}>
                <Text style={styles.statusText}>{report?.status || 'pending'}</Text>
              </View>
            </View>
          </Card>

          {/* Feedback Section */}
          <Card style={styles.feedbackCard}>
            <Text style={styles.sectionTitle}>Your Feedback</Text>
            
            <Text style={styles.feedbackLabel}>Feedback Comments:</Text>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Enter your feedback, comments, or suggestions for the lecturer..."
              placeholderTextColor={COLORS.textSecondary}
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              editable={!submitting && report?.status !== 'reviewed'}
            />

            {report?.status === 'reviewed' && (
              <View style={styles.reviewedNotice}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                <Text style={styles.reviewedText}>
                  This report has already been reviewed
                </Text>
                {report?.prlReviewedBy && (
                  <Text style={styles.reviewedBy}>
                    Reviewed by: {report.prlReviewedBy} on{' '}
                    {report.prlReviewedAt?.toDate?.().toLocaleDateString() || 'Unknown date'}
                  </Text>
                )}
              </View>
            )}
          </Card>

          {/* Action Button */}
          {report?.status !== 'reviewed' && (
            <View style={styles.actions}>
              <Button
                title="Submit Review"
                onPress={handleSubmitFeedback}
                loading={submitting}
                style={styles.submitButton}
                icon={<Ionicons name="checkmark-circle" size={20} color={COLORS.buttonPrimaryText} />}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
    case 'reviewed':
      return COLORS.success;
    case 'rejected':
      return COLORS.error;
    case 'pending':
      return COLORS.warning;
    default:
      return COLORS.textSecondary;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  reportTitle: {
    ...typography.h3,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  lecturerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  lecturerName: {
    ...typography.body,
    color: COLORS.text,
    marginLeft: spacing.sm,
    fontWeight: '600',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  dateText: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginLeft: spacing.xs,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.caption,
    color: COLORS.buttonPrimaryText,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  feedbackCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.lg,
  },
  feedbackLabel: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.sm,
  },
  feedbackInput: {
    ...typography.body,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: spacing.md,
    minHeight: 150,
    backgroundColor: COLORS.surfaceLight,
  },
  reviewedNotice: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  reviewedText: {
    ...typography.body,
    color: COLORS.success,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  reviewedBy: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  actions: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  // ✅ Error styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    ...typography.h3,
    color: COLORS.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  errorButton: {
    minWidth: 150,
  },
});