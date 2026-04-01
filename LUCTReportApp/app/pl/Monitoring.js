// app/pl/Monitoring.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { ScreenContainer, LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../src/config/theme';
import { fetchDashboardStats, fetchRatings, fetchReports } from '../../src/store/monitoringslice';
import { fetchCourses } from '../../src/store/courseSlice';
import { fetchAttendanceByCourse } from '../../src/store/attendanceSlice';

const { width } = Dimensions.get('window');

export default function PLMonitoring({ navigation }) {
  const dispatch = useDispatch();
  const { stats, ratings, averages, reports, isLoading } = useSelector(state => state.monitoring);
  const { courses } = useSelector(state => state.courses);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('attendance');

  useEffect(() => {
    loadMonitoringData();
  }, [selectedPeriod]);

  const loadMonitoringData = async () => {
    await Promise.all([
      dispatch(fetchDashboardStats()),
      dispatch(fetchRatings()),
      dispatch(fetchReports()),
      dispatch(fetchCourses()),
    ]);
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

  // System Performance Data
  const systemPerformance = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      data: [98, 99, 97, 99],
      color: (opacity = 1) => COLORS.success,
    }],
  };

  // User Activity Data
  const userActivity = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: [1200, 1500, 1400, 1800, 2100, 900, 600],
      color: (opacity = 1) => COLORS.primary,
    }],
  };

  // Report Distribution
  const reportDistribution = {
    labels: ['Weekly', 'Monthly', 'Incident', 'Assessment'],
    data: [35, 45, 15, 25],
    colors: [COLORS.primary, COLORS.success, COLORS.warning, COLORS.info],
  };

  const pieChartData = reportDistribution.labels.map((label, index) => ({
    name: label,
    population: reportDistribution.data[index],
    color: reportDistribution.colors[index],
    legendFontColor: COLORS.textSecondary,
    legendFontSize: 12,
  }));

  return (
    <ScreenContainer scrollable={true}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Period Selector */}
          <Card style={styles.periodCard}>
            <View style={styles.periodSelector}>
              <TouchableOpacity
                style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
                onPress={() => setSelectedPeriod('week')}
              >
                <Text style={[styles.periodText, selectedPeriod === 'week' && styles.periodTextActive]}>
                  Week
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
                onPress={() => setSelectedPeriod('month')}
              >
                <Text style={[styles.periodText, selectedPeriod === 'month' && styles.periodTextActive]}>
                  Month
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, selectedPeriod === 'year' && styles.periodButtonActive]}
                onPress={() => setSelectedPeriod('year')}
              >
                <Text style={[styles.periodText, selectedPeriod === 'year' && styles.periodTextActive]}>
                  Year
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* System Health */}
          <Card style={styles.healthCard}>
            <Text style={styles.sectionTitle}>System Health</Text>
            <View style={styles.healthMetrics}>
              <View style={styles.healthMetric}>
                <Text style={styles.healthValue}>99.8%</Text>
                <Text style={styles.healthLabel}>Uptime</Text>
              </View>
              <View style={styles.healthMetric}>
                <Text style={styles.healthValue}>2.3s</Text>
                <Text style={styles.healthLabel}>Response Time</Text>
              </View>
              <View style={styles.healthMetric}>
                <Text style={styles.healthValue}>1.2k</Text>
                <Text style={styles.healthLabel}>Active Users</Text>
              </View>
            </View>
          </Card>

          {/* System Performance Chart */}
          <Card style={styles.chartCard}>
            <Text style={styles.sectionTitle}>System Performance</Text>
            <LineChart
              data={systemPerformance}
              width={width - 48}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              formatYLabel={(value) => `${value}%`}
            />
          </Card>

          {/* User Activity Chart */}
          <Card style={styles.chartCard}>
            <Text style={styles.sectionTitle}>User Activity</Text>
            <BarChart
              data={userActivity}
              width={width - 48}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero
            />
          </Card>

          {/* Report Distribution */}
          <Card style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Report Distribution by Type</Text>
            <PieChart
              data={pieChartData}
              width={width - 48}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </Card>

          {/* Database Stats */}
          <Card style={styles.statsCard}>
            <Text style={styles.sectionTitle}>Database Statistics</Text>
            <View style={styles.dbStats}>
              <View style={styles.dbStatRow}>
                <Text style={styles.dbStatLabel}>Users</Text>
                <Text style={styles.dbStatValue}>{stats?.totalStudents + stats?.totalLecturers || 0}</Text>
              </View>
              <View style={styles.dbStatRow}>
                <Text style={styles.dbStatLabel}>Courses</Text>
                <Text style={styles.dbStatValue}>{stats?.totalCourses || 0}</Text>
              </View>
              <View style={styles.dbStatRow}>
                <Text style={styles.dbStatLabel}>Reports</Text>
                <Text style={styles.dbStatValue}>{stats?.totalReports || 0}</Text>
              </View>
              <View style={styles.dbStatRow}>
                <Text style={styles.dbStatLabel}>Ratings</Text>
                <Text style={styles.dbStatValue}>{stats?.totalRatings || 0}</Text>
              </View>
              <View style={styles.dbStatRow}>
                <Text style={styles.dbStatLabel}>Storage Used</Text>
                <Text style={styles.dbStatValue}>2.4 GB</Text>
              </View>
            </View>
          </Card>

          {/* API Endpoints Status */}
          <Card style={styles.statsCard}>
            <Text style={styles.sectionTitle}>API Endpoints Status</Text>
            {[
              { name: 'Auth Service', status: 'operational', latency: '45ms' },
              { name: 'Course Service', status: 'operational', latency: '78ms' },
              { name: 'Report Service', status: 'operational', latency: '92ms' },
              { name: 'Rating Service', status: 'operational', latency: '56ms' },
              { name: 'Notification Service', status: 'operational', latency: '67ms' },
            ].map((endpoint, index) => (
              <View key={index} style={styles.endpointRow}>
                <View style={styles.endpointInfo}>
                  <View style={[styles.statusDot, { backgroundColor: COLORS.success }]} />
                  <Text style={styles.endpointName}>{endpoint.name}</Text>
                </View>
                <View style={styles.endpointMeta}>
                  <Text style={styles.endpointLatency}>{endpoint.latency}</Text>
                  <Text style={styles.endpointStatus}>{endpoint.status}</Text>
                </View>
              </View>
            ))}
          </Card>

          {/* Error Logs */}
          <Card style={styles.logsCard}>
            <View style={styles.logsHeader}>
              <Text style={styles.sectionTitle}>Recent Error Logs</Text>
              <TouchableOpacity>
                <Text style={styles.clearLogs}>Clear Logs</Text>
              </TouchableOpacity>
            </View>
            {[
              { time: '10:23 AM', error: 'Failed to fetch attendance data', level: 'warning' },
              { time: '09:45 AM', error: 'Push notification delivery failed', level: 'error' },
              { time: '08:12 AM', error: 'Slow database query detected', level: 'warning' },
            ].map((log, index) => (
              <View key={index} style={styles.logItem}>
                <View style={[styles.logLevel, { backgroundColor: log.level === 'error' ? COLORS.error + '20' : COLORS.warning + '20' }]}>
                  <Text style={[styles.logLevelText, { color: log.level === 'error' ? COLORS.error : COLORS.warning }]}>
                    {log.level.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.logContent}>
                  <Text style={styles.logError}>{log.error}</Text>
                  <Text style={styles.logTime}>{log.time}</Text>
                </View>
              </View>
            ))}
          </Card>

          {/* System Configuration */}
          <Card style={styles.configCard}>
            <Text style={styles.sectionTitle}>System Configuration</Text>
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Version</Text>
              <Text style={styles.configValue}>2.0.1</Text>
            </View>
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Environment</Text>
              <Text style={styles.configValue}>Production</Text>
            </View>
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Last Deployment</Text>
              <Text style={styles.configValue}>2024-01-15</Text>
            </View>
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Maintenance Mode</Text>
              <Text style={[styles.configValue, { color: COLORS.success }]}>Disabled</Text>
            </View>
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
  periodCard: {
    marginBottom: spacing.md,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  periodButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
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
  },
  healthCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  healthMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  healthMetric: {
    alignItems: 'center',
  },
  healthValue: {
    ...typography.h3,
    color: COLORS.text,
  },
  healthLabel: {
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
  statsCard: {
    marginBottom: spacing.md,
  },
  dbStats: {
    marginTop: spacing.sm,
  },
  dbStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dbStatLabel: {
    ...typography.body,
    color: COLORS.textSecondary,
  },
  dbStatValue: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  endpointRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  endpointInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  endpointName: {
    ...typography.body,
    color: COLORS.text,
  },
  endpointMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  endpointLatency: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginRight: spacing.sm,
  },
  endpointStatus: {
    ...typography.caption,
    color: COLORS.success,
  },
  logsCard: {
    marginBottom: spacing.md,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  clearLogs: {
    ...typography.bodySmall,
    color: COLORS.primary,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logLevel: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  logLevelText: {
    ...typography.caption,
    fontWeight: '600',
  },
  logContent: {
    flex: 1,
  },
  logError: {
    ...typography.bodySmall,
    color: COLORS.text,
  },
  logTime: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  configCard: {
    marginBottom: spacing.md,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  configLabel: {
    ...typography.body,
    color: COLORS.textSecondary,
  },
  configValue: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '500',
  },
});