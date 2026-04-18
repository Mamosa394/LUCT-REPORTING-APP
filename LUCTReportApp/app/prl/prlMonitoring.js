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

function PRLMonitoring({ navigation }) {
  const dispatch = useDispatch();
  const { stats, ratings, averages, reports, isLoading } = useSelector(state => state.monitoring);
  const { courses } = useSelector(state => state.courses);
  const [attendanceData, setAttendanceData] = useState([85, 82, 88, 79, 83, 87, 84, 86, 89, 85, 82, 88]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    loadMonitoringData();
  }, [selectedPeriod]);

  const loadMonitoringData = async () => {
    try {
      await Promise.all([
        dispatch(fetchDashboardStats()),
        dispatch(fetchRatings()),
        dispatch(fetchReports()),
        dispatch(fetchCourses()),
      ]);
      loadAttendanceTrend();
      setChartsReady(true);
    } catch (error) {
      console.error('Error loading data:', error);
      setChartsReady(true);
    }
  };

  const loadAttendanceTrend = () => {
    let data = [];
    if (selectedPeriod === 'week') {
      data = [85, 82, 88, 79, 83, 87, 84];
    } else if (selectedPeriod === 'month') {
      data = [85, 82, 88, 79, 83, 87, 84, 86, 89, 85, 82, 88];
    } else {
      data = [85, 82, 88, 79, 83, 87, 84, 86, 89, 85, 82, 88, 84, 86, 82];
    }
    setAttendanceData(data.filter(v => isFinite(v)));
  };

  if (isLoading || !chartsReady) {
    return <LoadingSpinner fullScreen />;
  }

  const chartConfig = {
    backgroundColor: COLORS?.cardBackground || '#0A0A0A',
    backgroundGradientFrom: COLORS?.cardBackground || '#0A0A0A',
    backgroundGradientTo: COLORS?.cardBackground || '#0A0A0A',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(192, 192, 192, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(192, 192, 192, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: COLORS?.primary || '#C0C0C0',
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

  const validAttendanceData = attendanceData.filter(v => typeof v === 'number' && !isNaN(v) && isFinite(v));
  
  const attendanceTrend = {
    labels: getAttendanceLabels().slice(0, validAttendanceData.length),
    datasets: [{
      data: validAttendanceData,
      color: (opacity = 1) => `rgba(192, 192, 192, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  const courseCompletion = {
    labels: courses?.slice(0, 5).map(c => c.code) || ['CS101', 'IT202', 'SE303', 'DS404', 'CYB505'],
    datasets: [{
      data: courses?.slice(0, 5).map(() => Math.floor(Math.random() * 30) + 60) || [75, 82, 68, 91, 73],
    }],
  };

  // ✅ FIXED: Properly create pie chart data
  const pendingCount = reports?.filter(r => r.status === 'pending').length || 0;
  const approvedCount = reports?.filter(r => r.status === 'approved').length || 0;
  const rejectedCount = reports?.filter(r => r.status === 'rejected').length || 0;
  
  const pieChartData = [
    {
      name: 'Pending',
      population: pendingCount,
      color: COLORS?.warning || '#FFC107',
      legendFontColor: COLORS?.textSecondary || '#C0C0C0',
      legendFontSize: 12,
    },
    {
      name: 'Approved',
      population: approvedCount,
      color: COLORS?.success || '#4CAF50',
      legendFontColor: COLORS?.textSecondary || '#C0C0C0',
      legendFontSize: 12,
    },
    {
      name: 'Rejected',
      population: rejectedCount,
      color: COLORS?.error || '#F44336',
      legendFontColor: COLORS?.textSecondary || '#C0C0C0',
      legendFontSize: 12,
    },
  ];

  // Only show pie chart if there's data
  const totalReports = pendingCount + approvedCount + rejectedCount;
  const showPieChart = totalReports > 0;

  const departmentPerformance = [
    { name: 'CS', value: 88, color: COLORS?.primary || '#C0C0C0' },
    { name: 'IT', value: 82, color: COLORS?.success || '#4CAF50' },
    { name: 'SE', value: 76, color: COLORS?.warning || '#FFC107' },
    { name: 'DS', value: 91, color: COLORS?.info || '#2196F3' },
    { name: 'Cyber', value: 79, color: COLORS?.primaryLight || '#E0E0E0' },
  ];

  const getAverageRating = () => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + (r.overall || 0), 0);
    return (sum / ratings.length).toFixed(1);
  };

  const avgAttendance = validAttendanceData.length > 0
    ? (validAttendanceData.reduce((a, b) => a + b, 0) / validAttendanceData.length).toFixed(1)
    : '0';

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
                <Ionicons name="trending-up" size={12} color={COLORS?.success || '#4CAF50'} />
                <Text style={styles.metricTrendText}>+12%</Text>
              </View>
            </Card>
            
            <Card style={styles.metricCard}>
              <Text style={styles.metricValue}>{stats?.totalLecturers || 0}</Text>
              <Text style={styles.metricLabel}>Total Lecturers</Text>
              <View style={styles.metricTrend}>
                <Ionicons name="trending-up" size={12} color={COLORS?.success || '#4CAF50'} />
                <Text style={styles.metricTrendText}>+5%</Text>
              </View>
            </Card>
            
            <Card style={styles.metricCard}>
              <Text style={styles.metricValue}>{stats?.totalCourses || 0}</Text>
              <Text style={styles.metricLabel}>Active Courses</Text>
              <View style={styles.metricTrend}>
                <Ionicons name="trending-up" size={12} color={COLORS?.success || '#4CAF50'} />
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
                    color={star <= Math.round(getAverageRating()) ? '#FFC107' : (COLORS?.textDisabled || '#666666')}
                  />
                ))}
              </View>
              <Text style={styles.ratingTotal}>Based on {ratings?.length || 0} ratings</Text>
            </View>
          </Card>

          {/* Attendance Trend Chart */}
          {validAttendanceData.length > 0 && (
            <Card style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.sectionTitle}>Attendance Trend</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AttendanceReports')}>
                  <Text style={styles.viewAll}>View Details</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                  data={attendanceTrend}
                  width={Math.max(width - 48, 300)}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                  formatYLabel={(value) => `${value}%`}
                  fromZero={true}
                />
              </ScrollView>
              <Text style={styles.chartNote}>
                Average attendance: {avgAttendance}%
              </Text>
            </Card>
          )}

          {/* Course Completion Chart */}
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>Course Completion Rate</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CourseReports')}>
                <Text style={styles.viewAll}>View Details</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={courseCompletion}
                width={Math.max(width - 48, 300)}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                yAxisLabel=""
                yAxisSuffix="%"
                fromZero={true}
                showValuesOnTopOfBars={true}
              />
            </ScrollView>
          </Card>

          {/* Report Distribution Pie Chart */}
          <Card style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Report Status Distribution</Text>
            {showPieChart ? (
              <>
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
                <View style={styles.reportStats}>
                  <View style={styles.reportStatItem}>
                    <View style={[styles.reportDot, { backgroundColor: COLORS?.warning || '#FFC107' }]} />
                    <Text style={styles.reportStatText}>Pending: {pendingCount}</Text>
                  </View>
                  <View style={styles.reportStatItem}>
                    <View style={[styles.reportDot, { backgroundColor: COLORS?.success || '#4CAF50' }]} />
                    <Text style={styles.reportStatText}>Approved: {approvedCount}</Text>
                  </View>
                  <View style={styles.reportStatItem}>
                    <View style={[styles.reportDot, { backgroundColor: COLORS?.error || '#F44336' }]} />
                    <Text style={styles.reportStatText}>Rejected: {rejectedCount}</Text>
                  </View>
                </View>
              </>
            ) : (
              <Text style={styles.emptyText}>No reports available</Text>
            )}
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
          {averages && (
            <Card style={styles.ratingsCard}>
              <Text style={styles.sectionTitle}>Rating Distribution</Text>
              <View>
                <View style={styles.criteriaList}>
                  <View style={styles.criteriaItem}>
                    <Text style={styles.criteriaLabel}>Teaching Quality</Text>
                    <View style={styles.criteriaBar}>
                      <View style={[styles.criteriaFill, { width: `${Math.min(((averages.teaching || 0) / 5) * 100, 100)}%` }]} />
                    </View>
                    <Text style={styles.criteriaValue}>{averages.teaching?.toFixed(1) || '0.0'}</Text>
                  </View>
                  
                  <View style={styles.criteriaItem}>
                    <Text style={styles.criteriaLabel}>Communication</Text>
                    <View style={styles.criteriaBar}>
                      <View style={[styles.criteriaFill, { width: `${Math.min(((averages.communication || 0) / 5) * 100, 100)}%` }]} />
                    </View>
                    <Text style={styles.criteriaValue}>{averages.communication?.toFixed(1) || '0.0'}</Text>
                  </View>
                  
                  <View style={styles.criteriaItem}>
                    <Text style={styles.criteriaLabel}>Punctuality</Text>
                    <View style={styles.criteriaBar}>
                      <View style={[styles.criteriaFill, { width: `${Math.min(((averages.punctuality || 0) / 5) * 100, 100)}%` }]} />
                    </View>
                    <Text style={styles.criteriaValue}>{averages.punctuality?.toFixed(1) || '0.0'}</Text>
                  </View>
                  
                  <View style={styles.criteriaItem}>
                    <Text style={styles.criteriaLabel}>Course Material</Text>
                    <View style={styles.criteriaBar}>
                      <View style={[styles.criteriaFill, { width: `${Math.min(((averages.material || 0) / 5) * 100, 100)}%` }]} />
                    </View>
                    <Text style={styles.criteriaValue}>{averages.material?.toFixed(1) || '0.0'}</Text>
                  </View>
                  
                  <View style={styles.criteriaItem}>
                    <Text style={styles.criteriaLabel}>Student Support</Text>
                    <View style={styles.criteriaBar}>
                      <View style={[styles.criteriaFill, { width: `${Math.min(((averages.support || 0) / 5) * 100, 100)}%` }]} />
                    </View>
                    <Text style={styles.criteriaValue}>{averages.support?.toFixed(1) || '0.0'}</Text>
                  </View>
                </View>
              </View>
            </Card>
          )}

          {/* Recent Activities */}
          {stats?.recentActivities && stats.recentActivities.length > 0 && (
            <Card style={styles.activityCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.sectionTitle}>Recent Activities</Text>
                <TouchableOpacity onPress={() => navigation.navigate('ActivityLog')}>
                  <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
              </View>
              {stats.recentActivities.map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Ionicons name="document-text-outline" size={20} color={COLORS?.primary || '#C0C0C0'} />
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
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing?.md || 16,
  },
  periodCard: {
    marginBottom: spacing?.md || 16,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  periodButton: {
    paddingVertical: spacing?.sm || 8,
    paddingHorizontal: spacing?.lg || 24,
    borderRadius: 20,
    backgroundColor: COLORS?.surfaceLight || '#2A2A2A',
  },
  periodButtonActive: {
    backgroundColor: COLORS?.primary || '#C0C0C0',
  },
  periodText: {
    ...(typography?.bodySmall || { fontSize: 14 }),
    color: COLORS?.textSecondary || '#C0C0C0',
  },
  periodTextActive: {
    color: COLORS?.buttonPrimaryText || '#FFFFFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing?.md || 16,
  },
  metricCard: {
    flex: 1,
    marginHorizontal: spacing?.xs || 4,
    alignItems: 'center',
    padding: spacing?.sm || 8,
  },
  metricValue: {
    ...(typography?.h3 || { fontSize: 24, fontWeight: 'bold' }),
    color: COLORS?.text || '#FFFFFF',
    fontWeight: '700',
  },
  metricLabel: {
    ...(typography?.caption || { fontSize: 12 }),
    color: COLORS?.textSecondary || '#C0C0C0',
    marginTop: spacing?.xs || 4,
  },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing?.xs || 4,
  },
  metricTrendText: {
    ...(typography?.caption || { fontSize: 12 }),
    color: COLORS?.success || '#4CAF50',
    marginLeft: 2,
  },
  ratingCard: {
    marginBottom: spacing?.md || 16,
    alignItems: 'center',
  },
  ratingDisplay: {
    alignItems: 'center',
    marginTop: spacing?.sm || 8,
  },
  ratingScore: {
    ...(typography?.h1 || { fontSize: 32, fontWeight: 'bold' }),
    color: COLORS?.primary || '#C0C0C0',
  },
  ratingStars: {
    flexDirection: 'row',
    marginVertical: spacing?.sm || 8,
  },
  ratingTotal: {
    ...(typography?.caption || { fontSize: 12 }),
    color: COLORS?.textSecondary || '#C0C0C0',
  },
  chartCard: {
    marginBottom: spacing?.md || 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing?.md || 16,
  },
  sectionTitle: {
    ...(typography?.h4 || { fontSize: 18, fontWeight: 'bold' }),
    color: COLORS?.text || '#FFFFFF',
  },
  viewAll: {
    ...(typography?.bodySmall || { fontSize: 14 }),
    color: COLORS?.primary || '#C0C0C0',
  },
  chart: {
    marginVertical: spacing?.md || 16,
    borderRadius: 12,
  },
  chartNote: {
    ...(typography?.caption || { fontSize: 12 }),
    color: COLORS?.textSecondary || '#C0C0C0',
    textAlign: 'center',
    marginTop: spacing?.sm || 8,
  },
  reportStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing?.md || 16,
  },
  reportStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reportDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing?.xs || 4,
  },
  reportStatText: {
    ...(typography?.caption || { fontSize: 12 }),
    color: COLORS?.textSecondary || '#C0C0C0',
  },
  deptItem: {
    marginBottom: spacing?.md || 16,
  },
  deptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing?.xs || 4,
  },
  deptName: {
    ...(typography?.body || { fontSize: 16 }),
    color: COLORS?.text || '#FFFFFF',
  },
  deptScore: {
    ...(typography?.body || { fontSize: 16 }),
    color: COLORS?.primary || '#C0C0C0',
    fontWeight: '600',
  },
  deptBar: {
    height: 8,
    backgroundColor: COLORS?.surfaceLight || '#2A2A2A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  deptFill: {
    height: '100%',
    borderRadius: 4,
  },
  ratingsCard: {
    marginBottom: spacing?.md || 16,
  },
  criteriaList: {
    marginTop: spacing?.sm || 8,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing?.sm || 8,
  },
  criteriaLabel: {
    ...(typography?.bodySmall || { fontSize: 14 }),
    color: COLORS?.textSecondary || '#C0C0C0',
    width: 100,
  },
  criteriaBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS?.surfaceLight || '#2A2A2A',
    borderRadius: 3,
    marginHorizontal: spacing?.sm || 8,
    overflow: 'hidden',
  },
  criteriaFill: {
    height: '100%',
    backgroundColor: COLORS?.primary || '#C0C0C0',
    borderRadius: 3,
  },
  criteriaValue: {
    ...(typography?.bodySmall || { fontSize: 14 }),
    color: COLORS?.text || '#FFFFFF',
    width: 35,
    textAlign: 'right',
  },
  activityCard: {
    marginBottom: spacing?.md || 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing?.sm || 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS?.border || '#2A2A2A',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS?.surfaceLight || '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing?.sm || 8,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...(typography?.body || { fontSize: 16 }),
    color: COLORS?.text || '#FFFFFF',
    fontWeight: '500',
  },
  activityMeta: {
    ...(typography?.caption || { fontSize: 12 }),
    color: COLORS?.textSecondary || '#C0C0C0',
    marginTop: spacing?.xs || 4,
  },
  emptyText: {
    ...(typography?.body || { fontSize: 16 }),
    color: COLORS?.textSecondary || '#C0C0C0',
    textAlign: 'center',
    padding: spacing?.lg || 24,
  },
});

export default PRLMonitoring;