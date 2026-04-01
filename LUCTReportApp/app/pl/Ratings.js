// app/pl/Ratings.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, Card } from '../../src/components/UI';
import { RatingSummary, RatingCard, RatingBar } from '../../src/components/Ratings';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchRatings, fetchLecturers } from '../../src/store/monitoringSlice'; // Correct

export default function PLRatings({ navigation }) {
  const dispatch = useDispatch();
  const { ratings, averages, isLoading } = useSelector(state => state.monitoring);
  const { lecturers } = useSelector(state => state.monitoring);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  useEffect(() => {
    loadRatingsData();
  }, []);

  const loadRatingsData = async () => {
    await Promise.all([
      dispatch(fetchRatings()),
      dispatch(fetchLecturers()),
    ]);
  };

  const getLecturerAverage = (lecturerId) => {
    const lecturerRatings = ratings?.filter(r => r.lecturerId === lecturerId) || [];
    if (lecturerRatings.length === 0) return 0;
    const sum = lecturerRatings.reduce((acc, r) => acc + (r.overall || 0), 0);
    return (sum / lecturerRatings.length).toFixed(1);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer scrollable={true}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Overall Rating Summary */}
          {averages && (
            <RatingSummary averages={averages} />
          )}

          {/* Period Selector */}
          <Card style={styles.periodCard}>
            <View style={styles.periodSelector}>
              <TouchableOpacity
                style={[styles.periodButton, selectedPeriod === 'all' && styles.periodButtonActive]}
                onPress={() => setSelectedPeriod('all')}
              >
                <Text style={[styles.periodText, selectedPeriod === 'all' && styles.periodTextActive]}>
                  All Time
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, selectedPeriod === 'semester' && styles.periodButtonActive]}
                onPress={() => setSelectedPeriod('semester')}
              >
                <Text style={[styles.periodText, selectedPeriod === 'semester' && styles.periodTextActive]}>
                  This Semester
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
                onPress={() => setSelectedPeriod('month')}
              >
                <Text style={[styles.periodText, selectedPeriod === 'month' && styles.periodTextActive]}>
                  This Month
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Lecturers Ranking */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Lecturer Rankings</Text>
            {lecturers?.sort((a, b) => getLecturerAverage(b.id) - getLecturerAverage(a.id)).map((lecturer, index) => (
              <TouchableOpacity
                key={lecturer.id}
                style={styles.rankingItem}
                onPress={() => setSelectedLecturer(lecturer)}
              >
                <View style={styles.rankingLeft}>
                  <View style={[styles.rankingBadge, index < 3 && styles.topRanking]}>
                    <Text style={styles.rankingNumber}>{index + 1}</Text>
                  </View>
                  <View>
                    <Text style={styles.rankingName}>{lecturer.name}</Text>
                    <Text style={styles.rankingDept}>{lecturer.department}</Text>
                  </View>
                </View>
                <View style={styles.rankingRight}>
                  <Text style={styles.rankingScore}>{getLecturerAverage(lecturer.id)}</Text>
                  <View style={styles.rankingStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= Math.round(getLecturerAverage(lecturer.id)) ? 'star' : 'star-outline'}
                        size={12}
                        color={star <= Math.round(getLecturerAverage(lecturer.id)) ? '#FFC107' : COLORS.textDisabled}
                      />
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </Card>

          {/* Rating Distribution by Department */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Ratings by Department</Text>
            {['Computer Science', 'Information Technology', 'Software Engineering', 'Data Science'].map((dept) => {
              const deptRatings = ratings?.filter(r => r.lecturer?.department === dept) || [];
              const avgRating = deptRatings.length > 0 
                ? deptRatings.reduce((sum, r) => sum + r.overall, 0) / deptRatings.length 
                : 0;
              return (
                <View key={dept} style={styles.deptRating}>
                  <Text style={styles.deptName}>{dept}</Text>
                  <View style={styles.deptRatingBar}>
                    <View style={[styles.deptRatingFill, { width: `${(avgRating / 5) * 100}%` }]} />
                  </View>
                  <Text style={styles.deptRatingValue}>{avgRating.toFixed(1)}</Text>
                </View>
              );
            })}
          </Card>

          {/* Rating Trends */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Rating Trends</Text>
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>Overall Average</Text>
              <View style={styles.trendBar}>
                <View style={[styles.trendFill, { width: `${(averages?.overall / 5) * 100}%` }]} />
              </View>
              <Text style={styles.trendValue}>{averages?.overall?.toFixed(1)}</Text>
            </View>
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>Teaching Quality</Text>
              <View style={styles.trendBar}>
                <View style={[styles.trendFill, { width: `${(averages?.teaching / 5) * 100}%` }]} />
              </View>
              <Text style={styles.trendValue}>{averages?.teaching?.toFixed(1)}</Text>
            </View>
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>Communication</Text>
              <View style={styles.trendBar}>
                <View style={[styles.trendFill, { width: `${(averages?.communication / 5) * 100}%` }]} />
              </View>
              <Text style={styles.trendValue}>{averages?.communication?.toFixed(1)}</Text>
            </View>
            <View style={styles.trendItem}>
              <Text style={styles.trendLabel}>Punctuality</Text>
              <View style={styles.trendBar}>
                <View style={[styles.trendFill, { width: `${(averages?.punctuality / 5) * 100}%` }]} />
              </View>
              <Text style={styles.trendValue}>{averages?.punctuality?.toFixed(1)}</Text>
            </View>
          </Card>

          {/* Recent Ratings */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Recent Ratings</Text>
            {ratings?.slice(0, 10).map((rating) => (
              <RatingCard key={rating.id} rating={rating} />
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
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  rankingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rankingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankingBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  topRanking: {
    backgroundColor: COLORS.primary,
  },
  rankingNumber: {
    ...typography.body,
    fontWeight: '700',
    color: COLORS.text,
  },
  rankingName: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  rankingDept: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rankingRight: {
    alignItems: 'flex-end',
  },
  rankingScore: {
    ...typography.h4,
    color: COLORS.primary,
  },
  rankingStars: {
    flexDirection: 'row',
    marginTop: 2,
  },
  deptRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  deptName: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
    width: 120,
  },
  deptRatingBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 3,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  deptRatingFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  deptRatingValue: {
    ...typography.bodySmall,
    color: COLORS.text,
    width: 35,
    textAlign: 'right',
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  trendLabel: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
    width: 100,
  },
  trendBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 3,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  trendFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  trendValue: {
    ...typography.bodySmall,
    color: COLORS.text,
    width: 35,
    textAlign: 'right',
  },
});