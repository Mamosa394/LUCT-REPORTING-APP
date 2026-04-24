//principal lecturer dashboard
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore';
import { ScreenContainer, StatsCard, LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { db } from '../../config/firebase';
import { useFocusEffect } from '@react-navigation/native';

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

  // Refresh when screen comes into focus after returning from report detail
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
      return () => {};
    }, [])
  );

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetching stats in parallel for speed
      const [sSnap, lSnap, pSnap] = await Promise.all([
        getCountFromServer(query(collection(db, 'users'), where('role', '==', 'student'))),
        getCountFromServer(query(collection(db, 'users'), where('role', '==', 'lecturer'))),
        getCountFromServer(query(collection(db, 'reports'), where('status', 'in', ['pending', 'submitted'])))
      ]);
      const qRecent = query(
        collection(db, 'reports'),
        where('status', 'in', ['pending', 'submitted'])
      );
      const recentSnap = await getDocs(qRecent);
      const reports = recentSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      })).sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

      setStats({
        totalStudents: sSnap.data().count,
        totalLecturers: lSnap.data().count,
        reportsToReview: pSnap.data().count
      });
      setRecentReports(reports);
    } catch (error) {
      console.error(' [PRLDashboard] Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportPress = (report) => {
    navigation.navigate('PrlReports', { 
      reportId: report.id 
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  if (isLoading && !refreshing) return <LoadingSpinner fullScreen />;

  return (
    <ScreenContainer scrollable={false}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.userName}>{user?.name || 'Principal Lecturer'}</Text>
          
          {/* Employee ID and Role Section */}
          <View style={styles.userDetailsContainer}>
            <View style={styles.userDetailBadge}>
              <Ionicons name="id-card-outline" size={16} color={COLORS.primary} />
              <Text style={styles.userDetailText}>ID: {user?.employeeId || user?.id || 'Not assigned'}</Text>
            </View>
            <View style={styles.userDetailBadge}>
              <Ionicons name="briefcase-outline" size={16} color={COLORS.primary} />
              <Text style={styles.userDetailText}>Role: {user?.role || 'PRL'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatsCard icon={<Ionicons name="people-outline" size={15} color={COLORS.primary} />} title="Students" value={stats.totalStudents} color={COLORS.primary} />
          <StatsCard title="Lecturers" value={stats.totalLecturers} icon={<Ionicons name="id-card-outline" size={15} color={COLORS.primary} />} color={COLORS.success} />
          <StatsCard title="Pending Reviews" value={stats.reportsToReview} icon={<Ionicons name="documents-outline" size={15} color={COLORS.info} />} color={COLORS.warning} />
        </View>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Recent Pending Reports</Text>
          {recentReports.length > 0 ? (
            recentReports.map((report) => (
              <TouchableOpacity key={report.id} style={styles.reportItem} onPress={() => handleReportPress(report)}>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle}>{report.courseName || 'Untitled Report'}</Text>
                  <Text style={styles.reportMeta}>{report.lecturerName} • {report.createdAt.toLocaleDateString()}</Text>
                  <Text style={styles.reportStatus}>Status: {report.status}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No pending reports to show.</Text>
          )}
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  welcomeSection: { 
    padding: spacing.lg, 
    backgroundColor: COLORS.cardBackground, 
    marginBottom: spacing.md 
  },
  welcomeText: { 
    ...typography.body, 
    color: COLORS.textSecondary 
  },
  userName: { 
    ...typography.h2, 
    color: COLORS.text,
    marginBottom: spacing.sm
  },
  userRole: { 
    ...typography.caption, 
    color: COLORS.primary, 
    fontWeight: 'bold' 
  },
  userDetailsContainer: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  userDetailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    gap: 6,
  },
  userDetailText: {
    ...typography.caption,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  statsRow: { 
    flexDirection: 'row', 
    paddingHorizontal: spacing.md, 
    marginBottom: spacing.md, 
    paddingRight: spacing.xs, 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  sectionCard: { 
    marginHorizontal: spacing.md, 
    padding: spacing.md, 
    marginBottom: spacing.md 
  },
  sectionTitle: { 
    ...typography.h4, 
    marginBottom: spacing.md 
  },
  reportItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: spacing.sm, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.border 
  },
  reportInfo: { 
    flex: 1 
  },
  reportTitle: { 
    fontWeight: 'bold', 
    color: COLORS.text 
  },
  reportMeta: { 
    fontSize: 12, 
    color: COLORS.textSecondary 
  },
  reportStatus: { 
    fontSize: 11, 
    color: COLORS.primary, 
    marginTop: 2 
  },
  emptyText: { 
    textAlign: 'center', 
    color: COLORS.textSecondary, 
    padding: spacing.md 
  }
});