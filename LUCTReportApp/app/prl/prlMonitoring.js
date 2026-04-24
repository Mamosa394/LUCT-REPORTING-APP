// app/pl/PRLMonitoring.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchDashboardStats, fetchReports } from '../../src/store/monitoringSlice';
import { fetchCourses } from '../../src/store/courseSlice';
import { fetchRatings, selectRatings } from '../../src/store/Ratingsslice';
import { fetchLecturers, selectLecturers, fetchStudentsCount } from '../../src/store/authSlice';

export default function PRLMonitoring({ navigation }) {
  const dispatch = useDispatch();
  const { stats, reports, isLoading } = useSelector(state => state.monitoring);
  const { courses } = useSelector(state => state.courses);
  const ratings = useSelector(selectRatings);
  const lecturers = useSelector(selectLecturers);
  const studentsCount = useSelector(state => state.auth?.studentsCount || 0);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchCourses());
    dispatch(fetchReports());
    dispatch(fetchRatings());
    dispatch(fetchLecturers());
    dispatch(fetchStudentsCount());
  }, []);

  const reviewedReports = reports?.filter(r => r.status === 'reviewed')?.length || 0;
  const pendingReports = reports?.filter(r => r.status === 'pending' || r.status === 'submitted')?.length || 0;
  const activeCourses = courses?.filter(c => c.isActive !== false)?.length || 0;

  const getAverageRating = () => {
    if (!ratings || ratings.length === 0) return 0;
    let total = 0;
    let count = 0;
    ratings.forEach(r => {
      if (r.aspects?.overall) { total += r.aspects.overall; count++; }
      else if (r.rating) { total += r.rating; count++; }
    });
    return count > 0 ? (total / count).toFixed(1) : 0;
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  return (
    <ScreenContainer scrollable={true}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.title}>Programme Overview</Text>

          <View style={styles.metricsGrid}>
            <Card style={styles.metricCard}>
              <Ionicons name="people-outline" size={24} color={COLORS.primary} />
              <Text style={styles.metricValue}>{lecturers.length}</Text>
              <Text style={styles.metricLabel}>Lecturers</Text>
            </Card>
            <Card style={styles.metricCard}>
              <Ionicons name="book-outline" size={24} color={COLORS.info} />
              <Text style={styles.metricValue}>{activeCourses}</Text>
              <Text style={styles.metricLabel}>Courses</Text>
            </Card>
            <Card style={styles.metricCard}>
              <Ionicons name="school-outline" size={24} color={COLORS.success} />
              <Text style={styles.metricValue}>{studentsCount}</Text>
              <Text style={styles.metricLabel}>Students</Text>
            </Card>
          </View>

          <Card style={styles.ratingCard}>
            <Text style={styles.sectionTitle}>Overall Rating</Text>
            <View style={styles.ratingDisplay}>
              <Text style={styles.ratingScore}>{getAverageRating()}</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Ionicons
                    key={star}
                    name={star <= Math.round(getAverageRating()) ? 'star' : 'star-outline'}
                    size={20}
                    color={star <= Math.round(getAverageRating()) ? '#FFC107' : COLORS.textDisabled}
                  />
                ))}
              </View>
              <Text style={styles.ratingCount}>Based on {ratings.length} ratings</Text>
            </View>
          </Card>

          <View style={styles.reportsRow}>
            <Card style={[styles.reportCard, { borderLeftColor: COLORS.warning }]}>
              <Text style={styles.reportValue}>{pendingReports}</Text>
              <Text style={styles.reportLabel}>Pending Reports</Text>
            </Card>
            <Card style={[styles.reportCard, { borderLeftColor: COLORS.success }]}>
              <Text style={styles.reportValue}>{reviewedReports}</Text>
              <Text style={styles.reportLabel}>Reviewed Reports</Text>
            </Card>
          </View>

          {ratings.length > 0 && (
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Rating Distribution</Text>
              {[5, 4, 3, 2, 1].map(star => {
                const count = ratings.filter(r => {
                  const rating = r.aspects?.overall || r.rating || 0;
                  return Math.round(rating) === star;
                }).length;
                const pct = ratings.length > 0 ? (count / ratings.length) * 100 : 0;
                return (
                  <View key={star} style={styles.distRow}>
                    <Text style={styles.distLabel}>{star} ★</Text>
                    <View style={styles.distBar}>
                      <View style={[styles.distFill, { width: `${pct}%` }]} />
                    </View>
                    <Text style={styles.distCount}>{count}</Text>
                  </View>
                );
              })}
            </Card>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md },
  title: { ...typography.h2, color: COLORS.text, marginBottom: spacing.lg },
  metricsGrid: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  metricCard: { flex: 1, alignItems: 'center', padding: spacing.md },
  metricValue: { ...typography.h2, color: COLORS.text, marginTop: spacing.xs },
  metricLabel: { ...typography.caption, color: COLORS.textSecondary },
  ratingCard: { alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { ...typography.h4, color: COLORS.text, marginBottom: spacing.md },
  ratingDisplay: { alignItems: 'center' },
  ratingScore: { ...typography.h1, color: COLORS.primary },
  stars: { flexDirection: 'row', marginVertical: spacing.sm },
  ratingCount: { ...typography.caption, color: COLORS.textSecondary },
  reportsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  reportCard: { flex: 1, alignItems: 'center', padding: spacing.md, borderLeftWidth: 3 },
  reportValue: { ...typography.h2, color: COLORS.text },
  reportLabel: { ...typography.caption, color: COLORS.textSecondary },
  sectionCard: { marginBottom: spacing.md },
  distRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  distLabel: { ...typography.caption, color: COLORS.textSecondary, width: 30 },
  distBar: { flex: 1, height: 8, backgroundColor: COLORS.surfaceLight, borderRadius: 4, marginHorizontal: spacing.sm, overflow: 'hidden' },
  distFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  distCount: { ...typography.caption, color: COLORS.textSecondary, width: 25, textAlign: 'right' },
});