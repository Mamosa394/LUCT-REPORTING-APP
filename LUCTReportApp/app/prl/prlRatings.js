// app/prl/Ratings.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, Card } from '../../src/components/UI';
import { RatingSummary, RatingCard, RatingBar } from '../../src/components/Ratings';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchRatings } from '../../src/store/monitoringSlice';
import { fetchLecturers } from '../../src/store/monitoringSlice';

export default function PRLRatings({ navigation }) {
  const dispatch = useDispatch();
  const { ratings, averages, isLoading } = useSelector(state => state.monitoring);
  const { lecturers } = useSelector(state => state.monitoring);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [lecturerRatings, setLecturerRatings] = useState([]);

  useEffect(() => {
    loadRatingsData();
  }, []);

  const loadRatingsData = async () => {
    await Promise.all([
      dispatch(fetchRatings()),
      dispatch(fetchLecturers()),
    ]);
  };

  const handleLecturerSelect = (lecturer) => {
    setSelectedLecturer(lecturer);
    const lecturerSpecificRatings = ratings?.filter(r => r.lecturerId === lecturer.id) || [];
    setLecturerRatings(lecturerSpecificRatings);
  };

  // Calculate average rating per lecturer
  const getLecturerAverage = (lecturerId) => {
    const lecturerRatingsList = ratings?.filter(r => r.lecturerId === lecturerId) || [];
    if (lecturerRatingsList.length === 0) return 0;
    const sum = lecturerRatingsList.reduce((acc, r) => acc + (r.overall || 0), 0);
    return (sum / lecturerRatingsList.length).toFixed(1);
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

          {/* Lecturers List */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Lecturers Performance</Text>
            {lecturers?.map((lecturer) => (
              <TouchableOpacity
                key={lecturer.id}
                style={[
                  styles.lecturerItem,
                  selectedLecturer?.id === lecturer.id && styles.lecturerItemSelected,
                ]}
                onPress={() => handleLecturerSelect(lecturer)}
              >
                <View style={styles.lecturerInfo}>
                  <View style={styles.lecturerAvatar}>
                    <Text style={styles.avatarText}>{lecturer.name?.charAt(0)}</Text>
                  </View>
                  <View>
                    <Text style={styles.lecturerName}>{lecturer.name}</Text>
                    <Text style={styles.lecturerDept}>{lecturer.department}</Text>
                  </View>
                </View>
                <View style={styles.lecturerRating}>
                  <Text style={styles.ratingNumber}>{getLecturerAverage(lecturer.id)}</Text>
                  <Text style={styles.ratingStars}>⭐</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Card>

          {/* Selected Lecturer Details */}
          {selectedLecturer && (
            <Card style={styles.sectionCard}>
              <View style={styles.selectedHeader}>
                <Text style={styles.sectionTitle}>
                  {selectedLecturer.name} - Detailed Ratings
                </Text>
                <TouchableOpacity onPress={() => setSelectedLecturer(null)}>
                  <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              
              {lecturerRatings.length > 0 ? (
                <>
                  {/* Criteria Averages for this lecturer */}
                  {calculateLecturerAverages(lecturerRatings) && (
                    <View style={styles.criteriaContainer}>
                      <RatingBar
                        label="Teaching Quality"
                        value={calculateLecturerAverages(lecturerRatings).teaching}
                      />
                      <RatingBar
                        label="Communication"
                        value={calculateLecturerAverages(lecturerRatings).communication}
                      />
                      <RatingBar
                        label="Punctuality"
                        value={calculateLecturerAverages(lecturerRatings).punctuality}
                      />
                      <RatingBar
                        label="Course Material"
                        value={calculateLecturerAverages(lecturerRatings).material}
                      />
                      <RatingBar
                        label="Student Support"
                        value={calculateLecturerAverages(lecturerRatings).support}
                      />
                    </View>
                  )}
                  
                  <Text style={styles.reviewsTitle}>
                    Recent Reviews ({lecturerRatings.length})
                  </Text>
                  {lecturerRatings.slice(0, 5).map((rating) => (
                    <RatingCard key={rating.id} rating={rating} />
                  ))}
                </>
              ) : (
                <Text style={styles.noRatingsText}>No ratings available for this lecturer</Text>
              )}
            </Card>
          )}

          {/* All Ratings List */}
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

const calculateLecturerAverages = (ratings) => {
  if (!ratings.length) return null;
  const sum = ratings.reduce((acc, r) => ({
    teaching: acc.teaching + (r.teaching || 0),
    communication: acc.communication + (r.communication || 0),
    punctuality: acc.punctuality + (r.punctuality || 0),
    material: acc.material + (r.material || 0),
    support: acc.support + (r.support || 0),
    overall: acc.overall + (r.overall || 0),
  }), { teaching: 0, communication: 0, punctuality: 0, material: 0, support: 0, overall: 0 });
  
  const count = ratings.length;
  return {
    teaching: sum.teaching / count,
    communication: sum.communication / count,
    punctuality: sum.punctuality / count,
    material: sum.material / count,
    support: sum.support / count,
    overall: sum.overall / count,
  };
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  sectionCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  lecturerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lecturerItemSelected: {
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
  },
  lecturerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lecturerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    ...typography.h4,
    color: COLORS.primary,
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
  lecturerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    ...typography.h4,
    color: COLORS.primary,
    marginRight: spacing.xs,
  },
  ratingStars: {
    fontSize: 14,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  criteriaContainer: {
    marginBottom: spacing.lg,
  },
  reviewsTitle: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginVertical: spacing.md,
  },
  noRatingsText: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
});