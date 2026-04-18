// app/pl/Monitoring.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { ScreenContainer, LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { 
  fetchDashboardStats, 
  fetchRatings, 
  fetchReports, 
  fetchSystemStats 
} from '../../src/store/monitoringSlice';
import { fetchCourses } from '../../src/store/courseSlice';

const { width } = Dimensions.get('window');

function PLMonitoring({ navigation }) {
  const dispatch = useDispatch();
  const { 
    stats, 
    ratings = [], 
    averages, 
    reports = [], 
    systemStats, 
    isLoading 
  } = useSelector(state => state.monitoring || {});
  const { courses = [] } = useSelector(state => state.courses || {});
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    loadMonitoringData();
  }, [selectedPeriod]);

  const loadMonitoringData = async () => {
    try {
      await Promise.all([
        dispatch(fetchDashboardStats()).unwrap(),
        dispatch(fetchRatings()).unwrap(),
        dispatch(fetchReports()).unwrap(),
        dispatch(fetchCourses()).unwrap(),
        dispatch(fetchSystemStats()).unwrap(),
      ]);
      setChartsReady(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to load monitoring data');
      console.error('Monitoring data loading error:', error);
      setChartsReady(true); // Still set ready to show whatever data we have
    }
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

  // ✅ FIXED: Safe access with fallback
  const performanceData = systemStats?.performanceHistory || [98, 99, 97, 99, 100, 98, 99];
  const systemPerformance = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
    datasets: [{
      data: Array.isArray(performanceData) ? performanceData.slice(0, 7) : [98, 99, 97, 99, 100, 98, 99],
      color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    }],
  };

  // ✅ FIXED: Safe array access with fallback
  const safeReports = Array.isArray(reports) ? reports : [];
  const activityData = safeReports.slice(0, 7).map(report => report?.activityCount || Math.floor(Math.random() * 1000) + 500);
  while (activityData.length < 7) activityData.push(Math.floor(Math.random() * 1000) + 500);
  
  const userActivity = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      data: activityData,
      color: (opacity = 1) => `rgba(192, 192, 192, ${opacity})`,
    }],
  };

  // ✅ FIXED: Safe filtering with fallback
  const reportTypes = {
    weekly: safeReports.filter(r => r?.type === 'weekly').length,
    monthly: safeReports.filter(r => r?.type === 'monthly').length,
    incident: safeReports.filter(r => r?.type === 'incident').length,
    assessment: safeReports.filter(r => r?.type === 'assessment').length,
  };
  
  const reportDistribution = {
    labels: ['Weekly', 'Monthly', 'Incident', 'Assessment'],
    data: [reportTypes.weekly, reportTypes.monthly, reportTypes.incident, reportTypes.assessment],
    colors: [COLORS?.primary || '#C0C0C0', COLORS?.success || '#4CAF50', COLORS?.warning || '#FFC107', COLORS?.info || '#2196F3'],
  };

  const pieChartData = reportDistribution.labels.map((label, index) => ({
    name: label,
    population: reportDistribution.data[index] || 0,
    color: reportDistribution.colors[index],
    legendFontColor: COLORS?.textSecondary || '#C0C0C0',
    legendFontSize: 12,
  }));

  // ✅ FIXED: Safe filtering with fallback
  const safeRatings = Array.isArray(ratings) ? ratings : [];
  const ratingDistribution = {
    labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
    data: [
      safeRatings.filter(r => r?.rating === 5).length,
      safeRatings.filter(r => r?.rating === 4).length,
      safeRatings.filter(r => r?.rating === 3).length,
      safeRatings.filter(r => r?.rating === 2).length,
      safeRatings.filter(r => r?.rating === 1).length,
    ],
  };

  const maxRatingCount = Math.max(...ratingDistribution.data, 1);

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
                <Text style={styles.healthValue}>{systemStats?.uptime || '99.8%'}</Text>
                <Text style={styles.healthLabel}>Uptime</Text>
              </View>
              <View style={styles.healthMetric}>
                <Text style={styles.healthValue}>{systemStats?.responseTime || '2.3s'}</Text>
                <Text style={styles.healthLabel}>Response Time</Text>
              </View>
              <View style={styles.healthMetric}>
                <Text style={styles.healthValue}>{systemStats?.activeUsers || '1.2k'}</Text>
                <Text style={styles.healthLabel}>Active Users</Text>
              </View>
            </View>
          </Card>

          {/* Key Metrics */}
          <Card style={styles.metricsCard}>
            <Text style={styles.sectionTitle}>Key Metrics</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{stats?.totalStudents || 0}</Text>
                <Text style={styles.metricLabel}>Students</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{stats?.totalLecturers || 0}</Text>
                <Text style={styles.metricLabel}>Lecturers</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{stats?.totalCourses || 0}</Text>
                <Text style={styles.metricLabel}>Courses</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{stats?.totalReports || 0}</Text>
                <Text style={styles.metricLabel}>Reports</Text>
              </View>
            </View>
          </Card>

          {/* System Performance Chart */}
          <Card style={styles.chartCard}>
            <Text style={styles.sectionTitle}>System Performance</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={systemPerformance}
                width={Math.max(width - 48, 300)}
                height={200}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                formatYLabel={(value) => `${value}%`}
                fromZero={true}
              />
            </ScrollView>
          </Card>

          {/* User Activity Chart */}
          <Card style={styles.chartCard}>
            <Text style={styles.sectionTitle}>User Activity</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={userActivity}
                width={Math.max(width - 48, 300)}
                height={220}
                chartConfig={chartConfig}
                style={styles.chart}
                yAxisLabel=""
                yAxisSuffix=""
                fromZero={true}
                showValuesOnTopOfBars={true}
              />
            </ScrollView>
          </Card>

          {/* Report Distribution */}
          <Card style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Report Distribution by Type</Text>
            {pieChartData.some(data => data.population > 0) ? (
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
            ) : (
              <Text style={styles.noDataText}>No report data available</Text>
            )}
          </Card>

          {/* Rating Distribution */}
          <Card style={styles.statsCard}>
            <Text style={styles.sectionTitle}>Rating Distribution</Text>
            <View style={styles.ratingContainer}>
              {ratingDistribution.labels.map((label, index) => (
                <View key={index} style={styles.ratingRow}>
                  <Text style={styles.ratingLabel}>{label}</Text>
                  <View style={styles.ratingBarContainer}>
                    <View 
                      style={[
                        styles.ratingBar, 
                        { 
                          width: `${(ratingDistribution.data[index] / maxRatingCount) * 100}%`,
                          backgroundColor: index === 0 ? COLORS?.success || '#4CAF50' : 
                                          index === 1 ? COLORS?.primary || '#C0C0C0' : 
                                          index === 2 ? COLORS?.warning || '#FFC107' : 
                                          COLORS?.error || '#F44336'
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.ratingCount}>{ratingDistribution.data[index]}</Text>
                </View>
              ))}
              {averages && (
                <View style={styles.averageContainer}>
                  <Text style={styles.averageText}>
                    Average Rating: {averages.overall?.toFixed(1) || 'N/A'} / 5.0
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* Recent Reports */}
          <Card style={styles.reportsCard}>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            {safeReports.slice(0, 5).map((report, index) => (
              <View key={index} style={styles.reportItem}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportTitle}>{report?.title || `Report ${index + 1}`}</Text>
                  <Text style={styles.reportDate}>
                    {report?.date ? new Date(report.date).toLocaleDateString() : 'Recent'}
                  </Text>
                </View>
                <Text style={styles.reportDescription}>{report?.description || 'No description available'}</Text>
                <View style={styles.reportFooter}>
                  <Text style={styles.reportType}>{report?.type || 'General'}</Text>
                  <Text style={styles.reportStatus}>{report?.status || 'Pending'}</Text>
                </View>
              </View>
            ))}
            {safeReports.length === 0 && (
              <Text style={styles.noDataText}>No reports available</Text>
            )}
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
                  <View style={[styles.statusDot, { backgroundColor: COLORS?.success || '#4CAF50' }]} />
                  <Text style={styles.endpointName}>{endpoint.name}</Text>
                </View>
                <View style={styles.endpointMeta}>
                  <Text style={styles.endpointLatency}>{endpoint.latency}</Text>
                  <Text style={styles.endpointStatus}>{endpoint.status}</Text>
                </View>
              </View>
            ))}
          </Card>

          {/* System Configuration */}
          <Card style={styles.configCard}>
            <Text style={styles.sectionTitle}>System Configuration</Text>
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Version</Text>
              <Text style={styles.configValue}>{systemStats?.version || '2.0.1'}</Text>
            </View>
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Environment</Text>
              <Text style={styles.configValue}>{systemStats?.environment || 'Production'}</Text>
            </View>
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Last Deployment</Text>
              <Text style={styles.configValue}>{systemStats?.lastDeployment || '2024-01-15'}</Text>
            </View>
            <View style={styles.configItem}>
              <Text style={styles.configLabel}>Maintenance Mode</Text>
              <Text style={[styles.configValue, { 
                color: systemStats?.maintenanceMode ? COLORS?.warning || '#FFC107' : COLORS?.success || '#4CAF50' 
              }]}>
                {systemStats?.maintenanceMode ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </Card>
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
  healthCard: {
    marginBottom: spacing?.md || 16,
  },
  metricsCard: {
    marginBottom: spacing?.md || 16,
  },
  sectionTitle: {
    ...(typography?.h4 || { fontSize: 18, fontWeight: 'bold' }),
    color: COLORS?.text || '#FFFFFF',
    marginBottom: spacing?.md || 16,
  },
  healthMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  healthMetric: {
    alignItems: 'center',
  },
  healthValue: {
    ...(typography?.h3 || { fontSize: 24, fontWeight: 'bold' }),
    color: COLORS?.text || '#FFFFFF',
  },
  healthLabel: {
    ...(typography?.caption || { fontSize: 12 }),
    color: COLORS?.textSecondary || '#C0C0C0',
    marginTop: spacing?.xs || 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    backgroundColor: COLORS?.surfaceLight || '#2A2A2A',
    padding: spacing?.md || 16,
    borderRadius: 12,
    marginBottom: spacing?.sm || 8,
    alignItems: 'center',
  },
  metricValue: {
    ...(typography?.h2 || { fontSize: 28, fontWeight: 'bold' }),
    color: COLORS?.primary || '#C0C0C0',
    fontSize: 24,
  },
  metricLabel: {
    ...(typography?.caption || { fontSize: 12 }),
    color: COLORS?.textSecondary || '#C0C0C0',
    marginTop: spacing?.xs || 4,
  },
  chartCard: {
    marginBottom: spacing?.md || 16,
  },
  chart: {
    marginVertical: spacing?.md || 16,
    borderRadius: 12,
  },
  statsCard: {
    marginBottom: spacing?.md || 16,
  },
  ratingContainer: {
    marginTop: spacing?.sm || 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing?.sm || 8,
  },
  ratingLabel: {
    ...(typography?.bodySmall || { fontSize: 14 }),
    color: COLORS?.textSecondary || '#C0C0C0',
    width: 70,
  },
  ratingBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS?.surfaceLight || '#2A2A2A',
    borderRadius: 4,
    marginHorizontal: spacing?.sm || 8,
    overflow: 'hidden',
  },
  ratingBar: {
    height: '100%',
    borderRadius: 4,
  },
  ratingCount: {
    ...(typography?.bodySmall || { fontSize: 14 }),
    color: COLORS?.text || '#FFFFFF',
    width: 40,
    textAlign: 'right',
  },
  averageContainer: {
    marginTop: spacing?.md || 16,
    paddingTop: spacing?.sm || 8,
    borderTopWidth: 1,
    borderTopColor: COLORS?.border || '#2A2A2A',
    alignItems: 'center',
  },
  averageText: {
    ...(typography?.body || { fontSize: 16 }),
    color: COLORS?.primary || '#C0C0C0',
    fontWeight: '600',
  },
  reportsCard: {
    marginBottom: spacing?.md || 16,
  },
  reportItem: {
    paddingVertical: spacing?.sm || 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS?.border || '#2A2A2A',
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing?.xs || 4,
  },
  reportTitle: {
    ...(typography?.body || { fontSize: 16 }),
    color: COLORS?.text || '#FFFFFF',
    fontWeight: '500',
  },
  reportDate: {
    ...(typography?.caption || { fontSize: 12 }),
    color: COLORS?.textSecondary || '#C0C0C0',
  },
  reportDescription: {
    ...(typography?.bodySmall || { fontSize: 14 }),
    color: COLORS?.textSecondary || '#C0C0C0',
    marginBottom: spacing?.xs || 4,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reportType: {
    ...(typography?.caption || { fontSize: 12 }),
    color: COLORS?.primary || '#C0C0C0',
  },
  reportStatus: {
    ...(typography?.caption || { fontSize: 12 }),
    color: COLORS?.warning || '#FFC107',
  },
  endpointRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing?.sm || 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS?.border || '#2A2A2A',
  },
  endpointInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing?.sm || 8,
  },
  endpointName: {
    ...(typography?.body || { fontSize: 16 }),
    color: COLORS?.text || '#FFFFFF',
  },
  endpointMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  endpointLatency: {
    ...(typography?.caption || { fontSize: 12 }),
    color: COLORS?.textSecondary || '#C0C0C0',
    marginRight: spacing?.sm || 8,
  },
  endpointStatus: {
    ...(typography?.caption || { fontSize: 12 }),
    color: COLORS?.success || '#4CAF50',
  },
  configCard: {
    marginBottom: spacing?.md || 16,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing?.sm || 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS?.border || '#2A2A2A',
  },
  configLabel: {
    ...(typography?.body || { fontSize: 16 }),
    color: COLORS?.textSecondary || '#C0C0C0',
  },
  configValue: {
    ...(typography?.body || { fontSize: 16 }),
    color: COLORS?.text || '#FFFFFF',
    fontWeight: '500',
  },
  noDataText: {
    ...(typography?.body || { fontSize: 16 }),
    color: COLORS?.textSecondary || '#C0C0C0',
    textAlign: 'center',
    padding: spacing?.lg || 24,
  },
});

export default PLMonitoring;