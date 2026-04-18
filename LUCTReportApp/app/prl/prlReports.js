// app/prl/prlReports.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { ScreenContainer, LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchDashboardStats, fetchRatings } from '../../src/store/monitoringSlice';

const { width } = Dimensions.get('window');

// ✅ Define the component function (not as export default yet)
function PRLReports({ navigation }) {
  const dispatch = useDispatch();
  const { stats, ratings, averages, isLoading } = useSelector(state => state.monitoring);
  const [attendanceData, setAttendanceData] = useState([85, 82, 88, 79, 83, 87]);
  const [chartsReady, setChartsReady] = useState(false);

  useEffect(() => {
    loadMonitoringData();
  }, []);

  const loadMonitoringData = async () => {
    try {
      await Promise.all([
        dispatch(fetchDashboardStats()),
        dispatch(fetchRatings()),
      ]);
      setChartsReady(true);
    } catch (error) {
      console.error('Error loading monitoring data:', error);
      setChartsReady(true);
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
    propsForBackgroundLines: {
      strokeDasharray: '',
    },
  };

  const attendanceTrend = {
    labels: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'],
    datasets: [{
      data: attendanceData.filter(value => typeof value === 'number' && !isNaN(value)),
      color: (opacity = 1) => `rgba(192, 192, 192, ${opacity})`,
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
          {attendanceData.length > 0 && (
            <Card style={styles.chartCard}>
              <Text style={styles.sectionTitle}>Attendance Trend</Text>
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
              <Text style={styles.chartNote}>Average: 84% attendance rate</Text>
            </Card>
          )}

          {/* Course Completion Chart */}
          <Card style={styles.chartCard}>
            <Text style={styles.sectionTitle}>Course Completion Rate</Text>
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

          {/* Rating Summary */}
          <Card style={styles.ratingsCard}>
            <Text style={styles.sectionTitle}>Lecturer Ratings</Text>
            {averages ? (
              <View>
                <View style={styles.overallRating}>
                  <Text style={styles.overallScore}>
                    {averages.overall?.toFixed(1) || '0.0'}
                  </Text>
                  <Text style={styles.overallLabel}>Overall Rating</Text>
                </View>
                
                <View style={styles.criteriaList}>
                  <View style={styles.criteriaItem}>
                    <Text style={styles.criteriaLabel}>Teaching Quality</Text>
                    <View style={styles.criteriaBar}>
                      <View 
                        style={[
                          styles.criteriaFill, 
                          { width: `${Math.min(((averages.teaching || 0) / 5) * 100, 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.criteriaValue}>
                      {averages.teaching?.toFixed(1) || '0.0'}
                    </Text>
                  </View>
                  
                  <View style={styles.criteriaItem}>
                    <Text style={styles.criteriaLabel}>Communication</Text>
                    <View style={styles.criteriaBar}>
                      <View 
                        style={[
                          styles.criteriaFill, 
                          { width: `${Math.min(((averages.communication || 0) / 5) * 100, 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.criteriaValue}>
                      {averages.communication?.toFixed(1) || '0.0'}
                    </Text>
                  </View>
                  
                  <View style={styles.criteriaItem}>
                    <Text style={styles.criteriaLabel}>Punctuality</Text>
                    <View style={styles.criteriaBar}>
                      <View 
                        style={[
                          styles.criteriaFill, 
                          { width: `${Math.min(((averages.punctuality || 0) / 5) * 100, 100)}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.criteriaValue}>
                      {averages.punctuality?.toFixed(1) || '0.0'}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.totalRatings}>
                  Based on {averages.totalRatings || 0} ratings
                </Text>
              </View>
            ) : (
              <Text style={styles.emptyText}>No rating data available</Text>
            )}
          </Card>

          {/* Recent Activity */}
          {stats?.recentActivities && stats.recentActivities.length > 0 && (
            <Card style={styles.activityCard}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              {stats.recentActivities.map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Text style={{ fontSize: 20 }}>📄</Text>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{activity.title || 'Untitled'}</Text>
                    <Text style={styles.activityMeta}>
                      {activity.status || 'Unknown'} • {activity.createdAt ? new Date(activity.createdAt).toLocaleDateString() : 'N/A'}
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

// ✅ STYLES AT THE BOTTOM - WHERE YOU WANT THEM
const styles = StyleSheet.create({
  container: {
    padding: spacing?.md || 16,
  },
  statsCard: {
    marginBottom: spacing?.md || 16,
  },
  sectionTitle: {
    ...(typography?.h4 || { fontSize: 18, fontWeight: 'bold' }),
    color: COLORS?.text || '#FFFFFF',
    marginBottom: spacing?.md || 16,
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
    ...(typography?.h3 || { fontSize: 24, fontWeight: 'bold' }),
    color: COLORS?.text || '#FFFFFF',
  },
  statLabel: {
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
  chartNote: {
    ...(typography?.caption || { fontSize: 12 }),
    color: COLORS?.textSecondary || '#C0C0C0',
    textAlign: 'center',
    marginTop: spacing?.sm || 8,
  },
  ratingsCard: {
    marginBottom: spacing?.md || 16,
  },
  overallRating: {
    alignItems: 'center',
    marginBottom: spacing?.lg || 24,
  },
  overallScore: {
    ...(typography?.h1 || { fontSize: 32, fontWeight: 'bold' }),
    color: COLORS?.primary || '#C0C0C0',
  },
  overallLabel: {
    ...(typography?.bodySmall || { fontSize: 14 }),
    color: COLORS?.textSecondary || '#C0C0C0',
  },
  criteriaList: {
    marginBottom: spacing?.md || 16,
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
  totalRatings: {
    ...(typography?.caption || { fontSize: 12 }),
    color: COLORS?.textSecondary || '#C0C0C0',
    textAlign: 'center',
    marginTop: spacing?.md || 16,
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

// ✅ Export at the very bottom
export default PRLReports;