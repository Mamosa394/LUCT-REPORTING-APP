// app/prl/Monitoring.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { ScreenContainer, LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchDashboardStats, fetchRatings } from '../../src/store/monitoringSlice';
import { fetchAttendanceSummary } from '../../src/store/attendanceSlice';

const { width } = Dimensions.get('window');

export default function PRLMonitoring({ navigation }) {
  const dispatch = useDispatch();
  const { stats, ratings, averages, isLoading } = useSelector(state => state.monitoring);
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    loadMonitoringData();
  }, []);

  const loadMonitoringData = async () => {
    await Promise.all([
      dispatch(fetchDashboardStats()),
      dispatch(fetchRatings()),
      loadAttendanceTrend(),
    ]);
  };

  const loadAttendanceTrend = async () => {
    // Get attendance trend for last 6 months
    const months = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
    const trend = [85, 82, 88, 79, 83, 87];
    setAttendanceData(trend);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  const chartConfig = {
    backgroundColor: COLORS.cardBackground,
    backgroundGradientFrom: COLORS.cardBackground,
    backgroundGradientTo: COLORS.cardBackground,
    decimalPlaces: 0,
    color: (opacity = 1) => COLORS.primary,
    labelColor: (opacity = 1) => COLORS.textSecondary,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: COLORS.primary,
    },
  };

  const attendanceTrend = {
    labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    datasets: [{
      data: attendanceData,
      color: (opacity = 1) => COLORS.primary,
      strokeWidth: 2,
    }],
  };

  const courseCompletion = {
    labels: ['CS', 'IT', 'SE', 'DS', 'Cyber'],
    datasets: [{
      data: [75, 82, 68, 91, 73],
    }],
  };

  return (
    <ScreenContainer scrollable={true}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Stats Overview */}
          <Card style={styles.statsCard}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.totalStudents || 0}</Text>
                <Text style={styles.statLabel}>Students</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.totalLecturers || 0}</Text>
                <Text style={styles.statLabel}>Lecturers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.totalCourses || 0}</Text>
                <Text style={styles.statLabel}>Courses</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.totalReports || 0}</Text>
                <Text style={styles.statLabel}>Reports</Text>
              </View>
            </View>
          </Card>

          {/* Attendance Trend Chart */}
          <Card style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Attendance Trend</Text>
            <LineChart
              data={attendanceTrend}
              width={width - 48}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              formatYLabel={(value) => `${value}%`}
            />
            <Text style={styles.chartNote}>Average: 84% attendance rate</Text>
          </Card>

          {/* Course Completion Chart */}
          <Card style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Course Completion Rate</Text>
            <BarChart
              data={courseCompletion}
              width={width - 48}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix="%"
            />
          </Card>

          {/* Rating Summary */}
          <Card style={styles.ratingsCard}>
            <Text style={styles.sectionTitle}>Lecturer Ratings</Text>
            {averages && (
              <View>
                <View style={styles.overallRating}>
                  <Text style={styles.overallScore}>{averages.overall?.toFixed(1)}</Text>
                  <Text style={styles.overallLabel}>Overall Rating</Text>
                </View>
                
                <View style={styles.criteriaList}>
                  <View style={styles.criteriaItem}>
                    <Text style={styles.criteriaLabel}>Teaching Quality</Text>
                    <View style={styles.criteriaBar}>
                      <View style={[styles.criteriaFill, { width: `${(averages.teaching / 5) * 100}%` }]} />
                    </View>
                    <Text style={styles.criteriaValue}>{averages.teaching?.toFixed(1)}</Text>
                  </View>
                  
                  <View style={styles.criteriaItem}>
                    <Text style={styles.criteriaLabel}>Communication</Text>
                    <View style={styles.criteriaBar}>
                      <View style={[styles.criteriaFill, { width: `${(averages.communication / 5) * 100}%` }]} />
                    </View>
                    <Text style={styles.criteriaValue}>{averages.communication?.toFixed(1)}</Text>
                  </View>
                  
                  <View style={styles.criteriaItem}>
                    <Text style={styles.criteriaLabel}>Punctuality</Text>
                    <View style={styles.criteriaBar}>
                      <View style={[styles.criteriaFill, { width: `${(averages.punctuality / 5) * 100}%` }]} />
                    </View>
                    <Text style={styles.criteriaValue}>{averages.punctuality?.toFixed(1)}</Text>
                  </View>
                </View>
                
                <Text style={styles.totalRatings}>
                  Based on {averages.totalRatings || 0} ratings
                </Text>
              </View>
            )}
          </Card>

          {/* Recent Activity */}
          <Card style={styles.activityCard}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {stats?.recentActivities?.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityMeta}>
                    {activity.status} • {new Date(activity.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  statsCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...typography.h3,
    color: COLORS.text,
  },
  statLabel: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  chartCard: {
    marginBottom: spacing.md,
  },
  chart: {
    marginVertical: spacing.md,
    borderRadius: 12,
  },
  chartNote: {
    ...typography.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  ratingsCard: {
    marginBottom: spacing.md,
  },
  overallRating: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  overallScore: {
    ...typography.h1,
    color: COLORS.primary,
  },
  overallLabel: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
  },
  criteriaList: {
    marginBottom: spacing.md,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  criteriaLabel: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
    width: 100,
  },
  criteriaBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 3,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  criteriaFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  criteriaValue: {
    ...typography.bodySmall,
    color: COLORS.text,
    width: 35,
    textAlign: 'right',
  },
  totalRatings: {
    ...typography.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  activityCard: {
    marginBottom: spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  activityMeta: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
});