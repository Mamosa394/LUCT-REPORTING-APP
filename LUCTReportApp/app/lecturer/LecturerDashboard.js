// app/lecturer/Dashboard.js - Updated version
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatsCard, LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchDashboardStats } from '../../src/store/monitoringSlice';
import { fetchCourses, fetchCoursesByLecturer } from '../../src/store/courseSlice';
import { fetchReports } from '../../src/store/monitoringSlice';

export default function LecturerDashboard({ navigation }) {
  const dispatch = useDispatch();
  const { stats, isLoading } = useSelector(state => state.monitoring);
  const { courses = [], totalCourses } = useSelector(state => state.courses);
  const { reports = [] } = useSelector(state => state.monitoring);
  const { user } = useSelector(state => state.auth);
  const [refreshing, setRefreshing] = useState(false);

  // Get lecturer's employee ID
  const lecturerId = user?.employeeId || user?.id || user?.uid;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!lecturerId) return;
    
    try {
      await Promise.all([
        dispatch(fetchDashboardStats()),
        dispatch(fetchCoursesByLecturer(lecturerId)), // Fetch only lecturer's courses
        dispatch(fetchReports({ lecturerId: lecturerId })),
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Filter data by lecturer ID
  const myCourses = courses?.filter(c => 
    c.lecturerId === lecturerId || 
    c.lecturerEmployeeId === lecturerId ||
    c.assignedLecturerId === lecturerId
  ) || [];

  const myReports = reports?.filter(r => 
    r.submittedBy === lecturerId || 
    r.employeeId === lecturerId ||
    r.lecturerEmployeeId === lecturerId
  ) || [];

  // Calculate total number of courses assigned
  const totalAssignedCourses = totalCourses || myCourses.length;

  // ✅ Calculate total students from REPORTS
  // Get unique total per course (more accurate - avoids double counting)
  const getUniqueCourseStudents = () => {
    const courseMap = new Map();
    
    myReports.forEach(report => {
      // Use courseId or courseCode as unique identifier
      const courseKey = report.courseId || report.courseCode || report.courseName;
      const students = parseInt(report.totalRegisteredStudents) || 0;
      
      if (courseKey && students > 0) {
        // Store the maximum value for each course (in case of multiple reports)
        if (!courseMap.has(courseKey) || students > courseMap.get(courseKey)) {
          courseMap.set(courseKey, students);
        }
      }
    });
    
    // Sum up unique course student counts
    return Array.from(courseMap.values()).reduce((sum, val) => sum + val, 0);
  };

  const totalStudents = getUniqueCourseStudents();

  // Calculate report statistics
  const reportStats = {
    total: myReports.length,
    pending: myReports.filter(r => r.status?.toLowerCase() === 'pending').length,
    thisWeek: myReports.filter(r => {
      const created = new Date(r.createdAt);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return created >= weekAgo;
    }).length,
  };

  // Get pending reports
  const pendingReports = myReports.filter(r => r.status?.toLowerCase() === 'pending');
  
  // Get recent reports
  const recentReports = [...myReports]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  if (isLoading && !refreshing && myReports.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Lecturer'}</Text>
          <Text style={styles.userRole}>Lecturer</Text>
          <Text style={styles.department}>{user?.department || user?.faculty || 'Faculty'}</Text>
        </View>

        {/* Stats Cards - Now showing Total Courses instead of Rating */}
        <View style={styles.statsRow}>
          <StatsCard
            title="Total Courses"
            value={totalAssignedCourses}
            icon="📚"
            color={COLORS.primary}
          />
          <StatsCard
            title="Total Reports"
            value={reportStats.total}
            icon="📄"
            color={COLORS.info}
          />
        </View>

        <View style={styles.statsRow}>
          <StatsCard
            title="Total Students"
            value={totalStudents}
            icon="👨‍🎓"
            color={COLORS.success}
          />
          <StatsCard
            title="Reports This Week"
            value={reportStats.thisWeek}
            icon="📊"
            color={COLORS.warning}
          />
        </View>

        {/* Quick Actions */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('LecturerReportingForm')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.success + '20' }]}>
                <Ionicons name="add-circle-outline" size={28} color={COLORS.success} />
              </View>
              <Text style={styles.actionText}>New Report</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('LecturerReports')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.primary + '20' }]}>
                <Ionicons name="document-text-outline" size={28} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>My Reports</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Classes')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.info + '20' }]}>
                <Ionicons name="people-outline" size={28} color={COLORS.info} />
              </View>
              <Text style={styles.actionText}>Classes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={[styles.actionIcon, { backgroundColor: COLORS.secondary + '20' }]}>
                <Ionicons name="person-outline" size={28} color={COLORS.secondary} />
              </View>
              <Text style={styles.actionText}>Profile</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Recent Reports */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            <TouchableOpacity onPress={() => navigation.navigate('LecturerReports')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentReports.length > 0 ? (
            recentReports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={styles.reportItem}
                onPress={() => navigation.navigate('LecturerReports')}
              >
                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle}>
                    {report.courseName || report.courseCode || 'Untitled Report'}
                  </Text>
                  <Text style={styles.reportSubtitle}>
                    Week {report.weekOfReporting || 'N/A'} • {report.actualStudentsPresent || 0}/{report.totalRegisteredStudents || 0} students
                  </Text>
                  <Text style={styles.reportMeta}>
                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
                <View style={styles.reportStatus}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(report.status) + '20' }
                  ]}>
                    <Text style={[styles.statusBadgeText, { color: getStatusColor(report.status) }]}>
                      {report.status?.toUpperCase() || 'PENDING'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={40} color={COLORS.textDisabled} />
              <Text style={styles.emptyText}>No reports yet</Text>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={() => navigation.navigate('LecturerReportingForm')}
              >
                <Text style={styles.createButtonText}>Create First Report</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* Pending Reports Alert */}
        {pendingReports.length > 0 && (
          <Card style={[styles.sectionCard, styles.pendingCard]}>
            <View style={styles.cardHeader}>
              <View style={styles.pendingHeader}>
                <Ionicons name="time-outline" size={20} color={COLORS.warning} />
                <Text style={[styles.sectionTitle, { marginLeft: spacing.xs }]}>
                  Pending Review ({pendingReports.length})
                </Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('LecturerReports')}>
                <Text style={styles.viewAll}>View</Text>
              </TouchableOpacity>
            </View>
            {pendingReports.slice(0, 2).map((report) => (
              <View key={report.id} style={styles.pendingItem}>
                <Text style={styles.pendingTitle}>
                  {report.courseCode} - Week {report.weekOfReporting}
                </Text>
                <Text style={styles.pendingDate}>
                  Submitted: {new Date(report.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </Card>
        )}

        {/* My Courses */}
        <Card style={[styles.sectionCard, styles.lastCard]}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>My Courses ({totalAssignedCourses})</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Classes')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {myCourses.length > 0 ? (
            myCourses.slice(0, 5).map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.classItem}
                onPress={() => navigation.navigate('ClassDetails', { courseId: course.id })}
              >
                <View style={styles.classInfo}>
                  <Text style={styles.className}>{course.name}</Text>
                  <Text style={styles.classCode}>{course.code}</Text>
                  <View style={styles.classMeta}>
                    <Text style={styles.classStudents}>
                      Reports: {myReports.filter(r => r.courseId === course.id || r.courseCode === course.code).length}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No courses assigned yet</Text>
          )}
        </Card>
      </ScrollView>
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
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  sectionCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  lastCard: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  viewAll: {
    ...typography.bodySmall,
    color: COLORS.primary,
    fontWeight: '500',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '23%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actionText: {
    ...typography.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
    fontWeight: '500',
  },
  reportSubtitle: {
    ...typography.caption,
    color: COLORS.primary,
    marginTop: 2,
  },
  reportMeta: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  reportStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  statusBadgeText: {
    ...typography.caption,
    fontWeight: '600',
    fontSize: 10,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  createButton: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: COLORS.success,
    borderRadius: 8,
  },
  createButtonText: {
    ...typography.bodySmall,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  pendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pendingItem: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  pendingTitle: {
    ...typography.bodySmall,
    color: COLORS.text,
    fontWeight: '500',
  },
  pendingDate: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  classCode: {
    ...typography.caption,
    color: COLORS.primary,
    marginTop: 2,
  },
  classMeta: {
    marginTop: spacing.xs,
  },
  classStudents: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
});