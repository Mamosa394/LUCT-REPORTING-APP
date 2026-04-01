// app/prl/Monitoring.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { ScreenContainer, LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography, shadows } from '../../config/theme';
import { fetchDashboardStats, fetchRatings, fetchReports } from '../../src/store/monitoringSlice';
import { fetchCourses } from '../../src/store/courseSlice';
import { fetchAttendanceByCourse } from '../../src/store/attendanceSlice';

const { width } = Dimensions.get('window');

export default function PRLMonitoring({ navigation }) {
  const dispatch = useDispatch();
  const { stats, ratings, averages, reports, isLoading } = useSelector(state => state.monitoring);
  const { courses } = useSelector(state => state.courses);
  const [attendanceData, setAttendanceData] = useState([]);
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
      loadAttendanceTrend(),
    ]);
  };

  const loadAttendanceTrend = async () => {
    // Get attendance trend based on selected period
    let data = [];
    if (selectedPeriod === 'week') {
      data = [85, 82, 88, 79, 83, 87, 84];
    } else if (selectedPeriod === 'month') {
      data = [85, 82, 88, 79, 83, 87, 84, 86, 89, 85, 82, 88];
    } else {
      data = [85, 82, 88, 79, 83, 87, 84, 86, 89, 85, 82, 88, 84, 86, 82];
    }
    setAttendanceData(data);
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

  const getAttendanceLabels = () => {
    if (selectedPeriod === 'week') {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    } else if (selectedPeriod === 'month') {
      return ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];
    }
    return ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
  };

  const attendanceTrend = {
    labels: getAttendanceLabels(),
    datasets: [{
      data: attendanceData,
      color: (opacity = 1) => COLORS.primary,
      strokeWidth: 2,
    }],
  };

  // Course completion data
  const courseCompletion = {
    labels: courses?.slice(0, 5).map(c => c.code) || ['CS', 'IT', 'SE', 'DS', 'Cyber'],
    datasets: [{
      data: courses?.slice(0, 5).map(() => Math.floor(Math.random() * 30) + 60) || [75, 82, 68, 91, 73],
    }],
  };

  // Report status distribution
  const reportDistribution = {
    labels: ['Pending', 'Approved', 'Rejected'],
    data: [
      reports?.filter(r => r.status === 'pending').length || 0,
      reports?.filter(r => r.status === 'approved').length || 0,
      reports?.filter(r => r.status === 'rejected').length || 0,
    ],
    colors: [COLORS.warning, COLORS.success, COLORS.error],
  };

  // Department performance
  const departmentPerformance = [
    { name: 'CS', value: 88, color: COLORS.primary },
    { name: 'IT', value: 82, color: COLORS.success },
    { name: 'SE', value: 76, color: COLORS.warning },
    { name: 'DS', value: 91, color: COLORS.info },
    { name: 'Cyber', value: 79, color: COLORS.primaryLight },
  ];

  const pieChartData = departmentPerformance.map(dept => ({
    name: dept.name,
    population: dept.value,
    color: dept.color,
    legendFontColor: COLORS.textSecondary,
    legendFontSize: 12,
  }));

  const getAverageRating = () => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + (r.overall || 0), 0);
    return (sum / ratings.length).toFixed(1);
  };

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

          {/* Key Metrics Cards */}
          <View style={styles.metricsGrid}>
            <Card style={styles.metricCard}>
              <Text style={styles.metricValue}>{stats?.totalStudents || 0}</Text>
              <Text style={styles.metricLabel}>Total Students</Text>
              <View style={styles.metricTrend}>
                <Ionicons name="trending-up" size={12} color={COLORS.success} />
                <Text style={styles.metricTrendText}>+12%</Text>
              </View>
            </Card>
            
            <Card style={styles.metricCard}>
              <Text style={styles.metricValue}>{stats?.totalLecturers || 0}</Text>
              <Text style={styles.metricLabel}>Total Lecturers</Text>
              <View style={styles.metricTrend}>
                <Ionicons name="trending-up" size={12} color={COLORS.success} />
                <Text style={styles.metricTrendText}>+5%</Text>
              </View>
            </Card>
            
            <Card style={styles.metricCard}>
              <Text style={styles.metricValue}>{stats?.totalCourses || 0}</Text>
              <Text style={styles.metricLabel}>Active Courses</Text>
              <View style={styles.metricTrend}>
                <Ionicons name="trending-up" size={12} color={COLORS.success} />
                <Text style={styles.metricTrendText}>+8%</Text>
              </View>
            </Card>
          </View>

          {/* Overall Rating */}
          <Card style={styles.ratingCard}>
            <Text style={styles.sectionTitle}>Overall Programme Rating</Text>
            <View style={styles.ratingDisplay}>
              <Text style={styles.ratingScore}>{getAverageRating()}</Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= Math.round(getAverageRating()) ? 'star' : 'star-outline'}
                    size={24}
                    color={star <= Math.round(getAverageRating()) ? '#FFC107' : COLORS.textDisabled}
                  />
                ))}
              </View>
              <Text style={styles.ratingTotal}>Based on {ratings?.length || 0} ratings</Text>
            </View>
          </Card>

          {/* Attendance Trend Chart */}
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>Attendance Trend</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AttendanceReports')}>
                <Text style={styles.viewAll}>View Details</Text>
              </TouchableOpacity>
            </View>
            <LineChart
              data={attendanceTrend}
              width={width - 48}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              formatYLabel={(value) => `${value}%`}
            />
            <Text style={styles.chartNote}>
              Average attendance: {(attendanceData.reduce((a, b) => a + b, 0) / attendanceData.length).toFixed(1)}%
            </Text>
          </Card>

          {/* Course Completion Chart */}
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>Course Completion Rate</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CourseReports')}>
                <Text style={styles.viewAll}>View Details</Text>
              </TouchableOpacity>
            </View>
            <BarChart
              data={courseCompletion}
              width={width - 48}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisLabel=""
              yAxisSuffix="%"
              fromZero
            />
          </Card>

          {/* Report Distribution Pie Chart */}
          <Card style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Report Status Distribution</Text>
            <PieChart
              data={reportDistribution.data.map((value, index) => ({
                name: reportDistribution.labels[index],
                population: value,
                color: reportDistribution.colors[index],
                legendFontColor: COLORS.textSecondary,
                legendFontSize: 12,
              }))}
              width={width - 48}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
            <View style={styles.reportStats}>
              <View style={styles.reportStatItem}>
                <View style={[styles.reportDot, { backgroundColor: COLORS.warning }]} />
                <Text style={styles.reportStatText}>
                  Pending: {reportDistribution.data[0]}
                </Text>
              </View>
              <View style={styles.reportStatItem}>
                <View style={[styles.reportDot, { backgroundColor: COLORS.success }]} />
                <Text style={styles.reportStatText}>
                  Approved: {reportDistribution.data[1]}
                </Text>
              </View>
              <View style={styles.reportStatItem}>
                <View style={[styles.reportDot, { backgroundColor: COLORS.error }]} />
                <Text style={styles.reportStatText}>
                  Rejected: {reportDistribution.data[2]}
                </Text>
              </View>
            </View>
          </Card>

          {/* Department Performance */}
          <Card style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Department Performance</Text>
            {departmentPerformance.map((dept, index) => (
              <View key={dept.name} style={styles.deptItem}>
                <View style={styles.deptHeader}>
                  <Text style={styles.deptName}>{dept.name}</Text>
                  <Text style={styles.deptScore}>{dept.value}%</Text>
                </View>
                <View style={styles.deptBar}>
                  <View style={[styles.deptFill, { width: `${dept.value}%`, backgroundColor: dept.color }]} />
                </View>
              </View>
            ))}
          </Card>

          {/* Rating Distribution */}
          <Card style={styles.ratingsCard}>
            <Text style={styles.sectionTitle}>Rating Distribution</Text>
            {averages && (
              <View>
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
                  
                  <View style={styles.criteriaItem}>
                    <Text style={styles.criteriaLabel}>Course Material</Text>
                    <View style={styles.criteriaBar}>
                      <View style={[styles.criteriaFill, { width: `${(averages.material / 5) * 100}%` }]} />
                    </View>
                    <Text style={styles.criteriaValue}>{averages.material?.toFixed(1)}</Text>
                  </View>
                  
                  <View style={styles.criteriaItem}>
                    <Text style={styles.criteriaLabel}>Student Support</Text>
                    <View style={styles.criteriaBar}>
                      <View style={[styles.criteriaFill, { width: `${(averages.support / 5) * 100}%` }]} />
                    </View>
                    <Text style={styles.criteriaValue}>{averages.support?.toFixed(1)}</Text>
                  </View>
                </View>
              </View>
            )}
          </Card>

          {/* Recent Activities */}
          <Card style={styles.activityCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>Recent Activities</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ActivityLog')}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
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
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  metricCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
    padding: spacing.sm,
  },
  metricValue: {
    ...typography.h3,
    color: COLORS.text,
    fontWeight: '700',
  },
  metricLabel: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  metricTrendText: {
    ...typography.caption,
    color: COLORS.success,
    marginLeft: 2,
  },
  ratingCard: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  ratingDisplay: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  ratingScore: {
    ...typography.h1,
    color: COLORS.primary,
  },
  ratingStars: {
    flexDirection: 'row',
    marginVertical: spacing.sm,
  },
  ratingTotal: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  chartCard: {
    marginBottom: spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: COLORS.text,
  },
  viewAll: {
    ...typography.bodySmall,
    color: COLORS.primary,
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
  reportStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  reportStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  reportStatText: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  deptItem: {
    marginBottom: spacing.md,
  },
  deptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  deptName: {
    ...typography.body,
    color: COLORS.text,
  },
  deptScore: {
    ...typography.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  deptBar: {
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  deptFill: {
    height: '100%',
    borderRadius: 4,
  },
  ratingsCard: {
    marginBottom: spacing.md,
  },
  criteriaList: {
    marginTop: spacing.sm,
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