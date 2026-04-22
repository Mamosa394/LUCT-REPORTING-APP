// app/prl/Dashboard.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { ScreenContainer, StatsCard, LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { db } from '../../config/firebase';

export default function PRLDashboard({ navigation }) {
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalLecturers: 0,
    reportsToReview: 0
  });
  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    console.log('🔵 [PRLDashboard] Component mounted');
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('🔵 [PRLDashboard] Loading dashboard data...');
      setIsLoading(true);
      
      const [
        studentsCount,
        lecturersCount,
        pendingReportsCount,
        recentReportsData
      ] = await Promise.all([
        getTotalStudents(),
        getTotalLecturers(),
        getReportsToReviewCount(),
        getRecentReportsToReview()
      ]);

      console.log('✅ [PRLDashboard] Data loaded:', {
        students: studentsCount,
        lecturers: lecturersCount,
        reportsToReview: pendingReportsCount,
        recentReportsCount: recentReportsData.length
      });

      setStats({
        totalStudents: studentsCount,
        totalLecturers: lecturersCount,
        reportsToReview: pendingReportsCount
      });
      
      setRecentReports(recentReportsData);
    } catch (error) {
      console.error('❌ [PRLDashboard] Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalStudents = async () => {
    try {
      console.log('🔵 [PRLDashboard] Fetching total students...');
      const studentsRef = collection(db, 'users');
      const q = query(studentsRef, where('role', '==', 'student'));
      const snapshot = await getCountFromServer(q);
      console.log('✅ [PRLDashboard] Students count:', snapshot.data().count);
      return snapshot.data().count;
    } catch (error) {
      console.error('❌ [PRLDashboard] Error fetching students count:', error);
      return 0;
    }
  };

  const getTotalLecturers = async () => {
    try {
      console.log('🔵 [PRLDashboard] Fetching total lecturers...');
      const lecturersRef = collection(db, 'users');
      const q = query(lecturersRef, where('role', '==', 'lecturer'));
      const snapshot = await getCountFromServer(q);
      console.log('✅ [PRLDashboard] Lecturers count:', snapshot.data().count);
      return snapshot.data().count;
    } catch (error) {
      console.error('❌ [PRLDashboard] Error fetching lecturers count:', error);
      return 0;
    }
  };

  const getReportsToReviewCount = async () => {
    try {
      console.log('🔵 [PRLDashboard] Fetching reports to review count...');
      const reportsRef = collection(db, 'reports');
      const q = query(
        reportsRef, 
        where('status', 'in', ['pending', 'submitted', 'needs_review'])
      );
      const snapshot = await getCountFromServer(q);
      console.log('✅ [PRLDashboard] Reports to review count:', snapshot.data().count);
      return snapshot.data().count;
    } catch (error) {
      console.error('❌ [PRLDashboard] Error fetching reports count:', error);
      return 0;
    }
  };

  const getRecentReportsToReview = async () => {
    try {
      console.log('🔵 [PRLDashboard] Fetching recent reports...');
      const reportsRef = collection(db, 'reports');
      const q = query(
        reportsRef,
        where('status', 'in', ['pending', 'submitted', 'needs_review'])
      );
      
      const querySnapshot = await getDocs(q);
      const reports = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reports.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date()
        });
      });
      
      reports.sort((a, b) => b.createdAt - a.createdAt);
      
      console.log('✅ [PRLDashboard] Recent reports fetched:', reports.length);
      reports.forEach((r, i) => {
        console.log(`  Report ${i+1}:`, { id: r.id, title: r.title, status: r.status });
      });
      
      return reports.slice(0, 5);
    } catch (error) {
      console.error('❌ [PRLDashboard] Error fetching recent reports:', error);
      return [];
    }
  };

  const onRefresh = async () => {
    console.log('🔄 [PRLDashboard] Refreshing...');
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // ✅ DEBUG: Handle report navigation
  const handleReportPress = (report) => {
    console.log('🔵 [PRLDashboard] Navigating to report:', {
      id: report.id,
      title: report.title,
      status: report.status
    });
    
    // ✅ Navigate to PRLReportReview screen
    navigation.navigate('prlReports', { 
      reportId: report.id 
    });
  };

  if (isLoading && !refreshing) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer scrollable={false}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.userName}>{user?.name || 'Principal Lecturer'}</Text>
          <Text style={styles.userRole}>Principal Lecturer</Text>
          {user?.department && (
            <Text style={styles.department}>{user.department}</Text>
          )}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <StatsCard
            title="Total Students"
            value={stats.totalStudents}
            icon="👨‍🎓"
            color={COLORS.primary}
          />
          <StatsCard
            title="Total Lecturers"
            value={stats.totalLecturers}
            icon="👨‍🏫"
            color={COLORS.success}
          />
        </View>

        <View style={styles.statsRow}>
          <StatsCard
            title="Reports to Review"
            value={stats.reportsToReview}
            icon="📋"
            color={stats.reportsToReview > 0 ? COLORS.warning : COLORS.success}
          />
        </View>

        {/* Quick Actions */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                console.log('🔵 [PRLDashboard] Quick action: Review Reports');
                navigation.navigate('prlReportsList'); // Or wherever your reports list is
              }}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="document-text-outline" size={32} color={COLORS.primary} />
                {stats.reportsToReview > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{stats.reportsToReview}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.actionText}>Review Reports</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                console.log('🔵 [PRLDashboard] Quick action: View Students');
                navigation.navigate('Students');
              }}
            >
              <Ionicons name="people-outline" size={32} color={COLORS.primary} />
              <Text style={styles.actionText}>View Students</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                console.log('🔵 [PRLDashboard] Quick action: View Lecturers');
                navigation.navigate('Lecturers');
              }}
            >
              <Ionicons name="school-outline" size={32} color={COLORS.primary} />
              <Text style={styles.actionText}>View Lecturers</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Reports to Review */}
        {recentReports.length > 0 && (
          <Card style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reports to Review</Text>
              {stats.reportsToReview > 5 && (
                <TouchableOpacity onPress={() => {
                  console.log('🔵 [PRLDashboard] View all reports');
                  navigation.navigate('prlReportsList');
                }}>
                  <Text style={styles.viewAllLink}>View All</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {recentReports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={styles.reportItem}
                onPress={() => handleReportPress(report)}
              >
                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle}>
                    {report.title || report.courseName || 'Untitled Report'}
                  </Text>
                  <Text style={styles.reportMeta}>
                    {report.submittedBy?.name || report.lecturerName || 'Unknown'} • 
                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'Unknown date'}
                  </Text>
                  {report.courseCode && (
                    <Text style={styles.courseCode}>{report.courseCode}</Text>
                  )}
                </View>
                <View style={styles.reportStatus}>
                  <View style={[
                    styles.statusBadge, 
                    { backgroundColor: getStatusColor(report.status) }
                  ]}>
                    <Text style={styles.statusText}>{report.status}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
            
            {stats.reportsToReview > 5 && (
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => {
                  console.log('🔵 [PRLDashboard] View all reports (bottom button)');
                  navigation.navigate('prlReportsList');
                }}
              >
                <Text style={styles.viewAllText}>
                  View All {stats.reportsToReview} Reports →
                </Text>
              </TouchableOpacity>
            )}
          </Card>
        )}

        {/* Empty State for Reports */}
        {recentReports.length === 0 && !isLoading && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Reports to Review</Text>
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.success} />
              <Text style={styles.emptyStateText}>No reports waiting for review</Text>
              <Text style={styles.emptyStateSubtext}>Great job! All reports have been reviewed</Text>
            </View>
          </Card>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return COLORS.warning;
    case 'submitted':
      return COLORS.info;
    case 'needs_review':
      return COLORS.error;
    default:
      return COLORS.textSecondary;
  }
};

// ... rest of your styles remain the same ...
const styles = StyleSheet.create({
  welcomeSection: {
    padding: spacing.lg,
    backgroundColor: COLORS.cardBackground,
    marginBottom: spacing.md,
  },
  welcomeText: {
    ...typography.body,
    color: COLORS.textSecondary,
  },
  userName: {
    ...typography.h2,
    color: COLORS.text,
    marginTop: spacing.xs,
  },
  userRole: {
    ...typography.body,
    color: COLORS.primary,
    marginTop: spacing.xs,
  },
  department: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  viewAllLink: {
    ...typography.bodySmall,
    color: COLORS.primary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIconContainer: {
    position: 'relative',
  },
  actionText: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.buttonPrimaryText,
    fontSize: 10,
    fontWeight: '700',
  },
  reportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  reportMeta: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  courseCode: {
    ...typography.caption,
    color: COLORS.primary,
    marginTop: 2,
  },
  reportStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  statusText: {
    ...typography.caption,
    color: COLORS.buttonPrimaryText,
    fontWeight: '600',
    fontSize: 10,
  },
  viewAllButton: {
    marginTop: spacing.md,
  },
  viewAllText: {
    ...typography.bodySmall,
    color: COLORS.primary,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    ...typography.body,
    color: COLORS.text,
    marginTop: spacing.md,
    fontWeight: '600',
  },
  emptyStateSubtext: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
});