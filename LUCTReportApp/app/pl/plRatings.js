//program leader ratings
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, Card } from '../../src/components/UI';
import { RatingCard, StarRating } from '../../src/components/Ratings';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchRatings, fetchRatingsAnalytics, selectRatings, selectRatingsLoading } from '../../src/store/Ratingsslice';
import { fetchLecturers, selectLecturers } from '../../src/store/authSlice';

export default function PLRatings({ navigation }) {
  const dispatch = useDispatch();
  const ratings = useSelector(selectRatings);
  const isLoading = useSelector(selectRatingsLoading);
  const lecturers = useSelector(selectLecturers);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [lecturerRatings, setLecturerRatings] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      dispatch(fetchRatings()),
      dispatch(fetchLecturers()),
    ]);
  };

  const handleLecturerSelect = async (lecturer) => {
    if (selectedLecturer?.id === lecturer.id) {
      setSelectedLecturer(null);
      setLecturerRatings([]);
      return;
    }
    setSelectedLecturer(lecturer);
    
    const filtered = ratings.filter(r => r.ratedUserId === lecturer.id);
    setLecturerRatings(filtered);
  };

  const getLecturerAverage = (lecturerId) => {
    const lecturerRatingList = ratings.filter(r => r.ratedUserId === lecturerId);
    if (lecturerRatingList.length === 0) return 0;
    
    let total = 0;
    let count = 0;
    lecturerRatingList.forEach(r => {
      if (r.aspects?.overall) {
        total += r.aspects.overall;
        count++;
      } else if (r.rating) {
        total += r.rating;
        count++;
      }
    });
    return count > 0 ? (total / count).toFixed(1) : 0;
  };

  const getLecturerRatingCount = (lecturerId) => {
    return ratings.filter(r => r.ratedUserId === lecturerId).length;
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer scrollable={true}>
      <View style={styles.container}>
        <Text style={styles.title}>Lecturer Ratings</Text>
        <Text style={styles.subtitle}>See how students rated your lecturers</Text>

        {/* rated Lecturer List */}
        {lecturers.map((lecturer) => {
          const avg = getLecturerAverage(lecturer.id);
          const count = getLecturerRatingCount(lecturer.id);
          const isSelected = selectedLecturer?.id === lecturer.id;

          return (
            <View key={lecturer.id}>
              <TouchableOpacity
                style={[styles.lecturerItem, isSelected && styles.lecturerItemSelected]}
                onPress={() => handleLecturerSelect(lecturer)}
              >
                <View style={styles.lecturerInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{lecturer.name?.charAt(0)?.toUpperCase()}</Text>
                  </View>
                  <View style={styles.lecturerDetails}>
                    <Text style={styles.lecturerName}>{lecturer.name}</Text>
                    <Text style={styles.lecturerDept}>{lecturer.department || lecturer.faculty}</Text>
                    <Text style={styles.ratingCount}>{count} rating{count !== 1 ? 's' : ''}</Text>
                  </View>
                </View>
                <View style={styles.ratingSection}>
                  <Text style={[styles.ratingValue, { color: avg > 3 ? COLORS.success : avg > 2 ? COLORS.warning : COLORS.error }]}>
                    {avg}
                  </Text>
                  <StarRating value={Math.round(avg)} readonly size={12} />
                </View>
                <Ionicons name={isSelected ? "chevron-up" : "chevron-down"} size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>

              {/* Expanded Ratings form */}
              {isSelected && (
                <Card style={styles.expandedCard}>
                  <Text style={styles.reviewsTitle}>Student Reviews ({lecturerRatings.length})</Text>
                  {lecturerRatings.length > 0 ? (
                    lecturerRatings.map((rating) => (
                      <RatingCard key={rating.id} rating={rating} />
                    ))
                  ) : (
                    <Text style={styles.noRatings}>No ratings yet for this lecturer</Text>
                  )}
                </Card>
              )}
            </View>
          );
        })}

        {lecturers.length === 0 && (
          <Text style={styles.emptyText}>No lecturers found</Text>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  title: {
    ...typography.h2,
    color: COLORS.text,
  },
  subtitle: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.lg,
  },
  lecturerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lecturerItemSelected: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
  },
  lecturerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    ...typography.h4,
    color: COLORS.primary,
  },
  lecturerDetails: {
    flex: 1,
  },
  lecturerName: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  lecturerDept: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  ratingCount: {
    ...typography.caption,
    color: COLORS.textDisabled,
    fontSize: 11,
  },
  ratingSection: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  ratingValue: {
    ...typography.h4,
    fontWeight: '700',
  },
  expandedCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  reviewsTitle: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  noRatings: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: spacing.xl,
  },
});