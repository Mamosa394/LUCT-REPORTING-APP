// app/student/CourseMonitoring.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { 
  fetchCourseMonitoring, 
  fetchCourseActivities,
  selectCourseMonitoring,
  selectCourseActivities,
  selectSelectedPeriod,
  setSelectedPeriod 
} from '../../src/store/monitoringSlice';

export default function CourseMonitoring({ route, navigation }) {
  const { courseId, courseName } = route.params;
  const dispatch = useDispatch();
  const courseMonitoring = useSelector(selectCourseMonitoring);
  const activities = useSelector(selectCourseActivities);
  const selectedPeriod = useSelector(selectSelectedPeriod);
  const { isLoading } = useSelector(state => state.monitoring || {});
  const { user } = useSelector(state => state.auth || {});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMonitoringData();
  }, [courseId, selectedPeriod]);

  const loadMonitoringData = async () => {
    try {
      await Promise.all([
        dispatch(fetchCourseMonitoring({ 
          courseId, 
          studentId: user?.id,
          period: selectedPeriod 
        })),
        dispatch(fetchCourseActivities({ 
          courseId, 
          studentId: user?.id,
          limit: 10 
        }))
      ]);
    } catch (error) {
      console.error('Error loading monitoring:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMonitoringData();
    setRefreshing(false);
  };

  const handlePeriodChange = (period) => {
    dispatch(setSelectedPeriod(period));
  };

  if (isLoading && !refreshing && !courseMonitoring) {
    return <LoadingSpinner fullScreen />;
  }

  const monitoringData = courseMonitoring || {
    attendance: 75,
    assignments: 80,
    participation: 70,
    overallProgress: 72,
  };

  // Prepare activities data
  const activitiesData = activities.length > 0 ? activities : [
    { id: '1', type: 'attendance', date: '2024-01-15', status: 'present' },
    { id: '2', type: 'assignment', date: '2024-01-14', status: 'submitted', score: 85 },
    { id: '3', type: 'quiz', date: '2024-01-13', status: 'completed', score: 78 },
  ];

  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityIcon}>
        <Ionicons 
          name={
            item.type === 'attendance' ? 'calendar' :
            item.type === 'assignment' ? 'document-text' : 'school'
          } 
          size={20} 
          color={COLORS.primary} 
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </Text>
        <Text style={styles.activityDate}>{item.date}</Text>
      </View>
      <View style={styles.activityStatus}>
        <Text style={[
          styles.statusText,
          { color: item.status === 'present' || item.status === 'submitted' ? COLORS.success : COLORS.warning }
        ]}>
          {item.status.toUpperCase()}
        </Text>
        {item.score && (
          <Text style={styles.scoreText}>{item.score}%</Text>
        )}
      </View>
    </View>
  );

  const ListHeaderComponent = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.courseName}>{courseName}</Text>
        <Text style={styles.courseId}>Course ID: {courseId}</Text>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {['week', 'month', 'semester'].map((period) => (
          <TouchableOpacity
            key={period}
            style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
            onPress={() => handlePeriodChange(period)}
          >
            <Text style={[styles.periodText, selectedPeriod === period && styles.periodTextActive]}>
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Overall Progress */}
      <Card style={styles.progressCard}>
        <Text style={styles.cardTitle}>Overall Progress</Text>
        <View style={styles.progressCircle}>
          <Text style={styles.progressPercentage}>{monitoringData.overallProgress}%</Text>
        </View>
        <View style={styles.progressStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{monitoringData.attendance}%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{monitoringData.assignments}%</Text>
            <Text style={styles.statLabel}>Assignments</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{monitoringData.participation}%</Text>
            <Text style={styles.statLabel}>Participation</Text>
          </View>
        </View>
      </Card>

      {/* Performance Metrics */}
      <Card style={styles.metricsCard}>
        <Text style={styles.cardTitle}>Performance Metrics</Text>
        
        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Attendance Rate</Text>
            <Text style={styles.metricValue}>{monitoringData.attendance}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${monitoringData.attendance}%` }]} />
          </View>
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Assignment Completion</Text>
            <Text style={styles.metricValue}>{monitoringData.assignments}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${monitoringData.assignments}%` }]} />
          </View>
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Class Participation</Text>
            <Text style={styles.metricValue}>{monitoringData.participation}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${monitoringData.participation}%` }]} />
          </View>
        </View>
      </Card>

      {/* Recent Activities Header */}
      <View style={styles.activitiesHeader}>
        <Text style={styles.cardTitle}>Recent Activities</Text>
      </View>
    </>
  );

  const ListFooterComponent = () => (
    <>
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Attendance', { courseId, courseName })}
        >
          <Ionicons name="calendar-outline" size={24} color={COLORS.primary} />
          <Text style={styles.actionText}>View Attendance</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Assignments', { courseId })}
        >
          <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
          <Text style={styles.actionText}>Assignments</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('CourseMaterials', { courseId })}
        >
          <Ionicons name="folder-outline" size={24} color={COLORS.primary} />
          <Text style={styles.actionText}>Materials</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <ScreenContainer>
      <FlatList
        data={activitiesData}
        renderItem={renderActivityItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.md,
  },
  courseName: {
    ...typography.h2,
    color: COLORS.text,
  },
  courseId: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    padding: spacing.xs,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodText: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
  },
  periodTextActive: {
    color: COLORS.buttonPrimaryText,
    fontWeight: '600',
  },
  progressCard: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  progressCircle: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressPercentage: {
    ...typography.h1,
    color: COLORS.primary,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h4,
    color: COLORS.text,
  },
  statLabel: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  metricsCard: {
    marginBottom: spacing.md,
  },
  metricItem: {
    marginBottom: spacing.md,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  metricLabel: {
    ...typography.body,
    color: COLORS.text,
  },
  metricValue: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  activitiesHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...typography.body,
    color: COLORS.text,
  },
  activityDate: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  activityStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  scoreText: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  actionButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  actionText: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
});