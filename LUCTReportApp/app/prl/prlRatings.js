// app/prl/Ratings.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, Card } from '../../src/components/UI';
import { RatingSummary, RatingCard, RatingBar, StarRating } from '../../src/components/Ratings';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchRatings, fetchRatingsAnalytics, selectRatings, selectRatingsLoading } from '../../src/store/Ratingsslice';
import { fetchLecturers } from '../../src/store/authSlice';

export default function PRLRatings({ navigation }) {
  const dispatch = useDispatch();
  const ratings = useSelector(selectRatings);
  const isLoading = useSelector(selectRatingsLoading);
  const { lecturers } = useSelector(state => state.auth || { lecturers: [] });
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [selectedLecturerAnalytics, setSelectedLecturerAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchLecturers()),
        dispatch(fetchRatings()), // Fetch all ratings for PRL view
      ]);
    } catch (error) {
      console.error('Error loading ratings data:', error);
    }
  };

  const handleLecturerSelect = async (lecturer) => {
    if (selectedLecturer?.id === lecturer.id) {
      setSelectedLecturer(null);
      setSelectedLecturerAnalytics(null);
      return;
    }
    
    setSelectedLecturer(lecturer);
    setLoadingAnalytics(true);
    
    try {
      // Fetch analytics for this specific lecturer
      const result = await dispatch(fetchRatingsAnalytics(lecturer.id)).unwrap();
      setSelectedLecturerAnalytics(result.analytics);
    } catch (error) {
      console.error('Error fetching lecturer analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Get ratings for a specific lecturer
  const getLecturerRatings = (lecturerId) => {
    return ratings?.filter(r => r.ratedUserId === lecturerId) || [];
  };

  // Calculate average rating per lecturer
  const getLecturerAverage = (lecturerId) => {
    const lecturerRatingsList = getLecturerRatings(lecturerId);
    if (lecturerRatingsList.length === 0) return 0;
    
    // Use overall rating from aspects or direct rating field
    let totalRating = 0;
    let count = 0;
    
    lecturerRatingsList.forEach(rating => {
      if (rating.aspects?.overall) {
        totalRating += rating.aspects.overall;
        count++;
      } else if (rating.rating) {
        totalRating += rating.rating;
        count++;
      }
    });
    
    return count > 0 ? (totalRating / count).toFixed(1) : 0;
  };

  // Calculate aspect averages for a lecturer
  const calculateLecturerAverages = (lecturerId) => {
    const lecturerRatingsList = getLecturerRatings(lecturerId);
    if (!lecturerRatingsList.length) return null;
    
    const aspects = ['teachingQuality', 'communication', 'punctuality', 'material', 'support', 'overall'];
    const sums = {};
    aspects.forEach(aspect => { sums[aspect] = 0; });
    
    let count = 0;
    
    lecturerRatingsList.forEach(rating => {
      if (rating.aspects) {
        aspects.forEach(aspect => {
          sums[aspect] += rating.aspects[aspect] || 0;
        });
        count++;
      }
    });
    
    if (count === 0) return null;
    
    const averages = {};
    aspects.forEach(aspect => {
      averages[aspect] = sums[aspect] / count;
    });
    
    return averages;
  };

  // Get total ratings count for a lecturer
  const getLecturerRatingCount = (lecturerId) => {
    return getLecturerRatings(lecturerId).length;
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer scrollable={true}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Overall Summary */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Ratings Overview</Text>
            <View style={styles.overviewStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{lecturers?.length || 0}</Text>
                <Text style={styles.statLabel}>Total Lecturers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{ratings?.length || 0}</Text>
                <Text style={styles.statLabel}>Total Ratings</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {lecturers?.filter(l => getLecturerRatings(l.id).length > 0).length || 0}
                </Text>
                <Text style={styles.statLabel}>Rated Lecturers</Text>
              </View>
            </View>
          </Card>

          {/* Lecturers Ratings List */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Lecturers Performance</Text>
            {lecturers?.length > 0 ? (
              lecturers.map((lecturer) => {
                const avgRating = getLecturerAverage(lecturer.id);
                const ratingCount = getLecturerRatingCount(lecturer.id);
                const isSelected = selectedLecturer?.id === lecturer.id;
                
                return (
                  <TouchableOpacity
                    key={lecturer.id}
                    style={[
                      styles.lecturerItem,
                      isSelected && styles.lecturerItemSelected,
                    ]}
                    onPress={() => handleLecturerSelect(lecturer)}
                  >
                    <View style={styles.lecturerInfo}>
                      <View style={styles.lecturerAvatar}>
                        <Text style={styles.avatarText}>
                          {lecturer.name?.charAt(0)?.toUpperCase() || 'L'}
                        </Text>
                      </View>
                      <View style={styles.lecturerDetails}>
                        <Text style={styles.lecturerName}>{lecturer.name}</Text>
                        <Text style={styles.lecturerDept}>
                          {lecturer.department || lecturer.faculty || 'No department'}
                        </Text>
                        <Text style={styles.ratingCount}>
                          {ratingCount} rating{ratingCount !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.lecturerRating}>
                      <Text style={[
                        styles.ratingNumber,
                        { color: avgRating > 3 ? COLORS.success : avgRating > 2 ? COLORS.warning : COLORS.error }
                      ]}>
                        {avgRating}
                      </Text>
                      <StarRating value={Math.round(avgRating)} readonly size={14} />
                    </View>
                    <Ionicons 
                      name={isSelected ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={COLORS.textSecondary} 
                    />
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={styles.emptyText}>No lecturers found</Text>
            )}
          </Card>

          {/* Selected Lecturer Detailed Ratings */}
          {selectedLecturer && (
            <Card style={styles.sectionCard}>
              <View style={styles.detailHeader}>
                <View style={styles.detailHeaderInfo}>
                  <View style={styles.detailAvatar}>
                    <Text style={styles.detailAvatarText}>
                      {selectedLecturer.name?.charAt(0)?.toUpperCase() || 'L'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.detailName}>{selectedLecturer.name}</Text>
                    <Text style={styles.detailDept}>
                      {selectedLecturer.department || selectedLecturer.faculty || 'No department'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setSelectedLecturer(null)}>
                  <Ionicons name="close-circle" size={28} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {loadingAnalytics ? (
                <LoadingSpinner />
              ) : (
                <>
                  {/* Analytics Summary */}
                  {selectedLecturerAnalytics && (
                    <View style={styles.analyticsContainer}>
                      <View style={styles.analyticsHeader}>
                        <Text style={styles.analyticsTitle}>Overall Rating</Text>
                        <View style={styles.analyticsScore}>
                          <Text style={styles.analyticsNumber}>
                            {selectedLecturerAnalytics.averageRating}
                          </Text>
                          <StarRating 
                            value={Math.round(selectedLecturerAnalytics.averageRating)} 
                            readonly 
                            size={20} 
                          />
                        </View>
                        <Text style={styles.totalRatingsText}>
                          Based on {selectedLecturerAnalytics.totalRatings} ratings
                        </Text>
                      </View>

                      {/* Rating Distribution */}
                      {selectedLecturerAnalytics.ratingDistribution && (
                        <View style={styles.distributionContainer}>
                          <Text style={styles.subsectionTitle}>Rating Distribution</Text>
                          {Object.entries(selectedLecturerAnalytics.ratingDistribution).reverse().map(([star, count]) => (
                            <View key={star} style={styles.distributionRow}>
                              <Text style={styles.distributionLabel}>{star} ★</Text>
                              <View style={styles.distributionBar}>
                                <View 
                                  style={[
                                    styles.distributionFill, 
                                    { 
                                      width: `${selectedLecturerAnalytics.totalRatings > 0 
                                        ? (count / selectedLecturerAnalytics.totalRatings) * 100 
                                        : 0}%` 
                                    }
                                  ]} 
                                />
                              </View>
                              <Text style={styles.distributionCount}>{count}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  )}

                  {/* Criteria Averages */}
                  {calculateLecturerAverages(selectedLecturer.id) && (
                    <View style={styles.criteriaContainer}>
                      <Text style={styles.subsectionTitle}>Criteria Breakdown</Text>
                      {Object.entries(calculateLecturerAverages(selectedLecturer.id))
                        .filter(([key]) => key !== 'overall')
                        .map(([key, value]) => (
                          <RatingBar
                            key={key}
                            label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            value={value}
                          />
                        ))
                      }
                    </View>
                  )}

                  {/* Individual Ratings */}
                  <View style={styles.ratingsListContainer}>
                    <Text style={styles.subsectionTitle}>
                      Student Reviews ({getLecturerRatings(selectedLecturer.id).length})
                    </Text>
                    {getLecturerRatings(selectedLecturer.id).length > 0 ? (
                      getLecturerRatings(selectedLecturer.id)
                        .slice(0, 10)
                        .map((rating) => (
                          <RatingCard key={rating.id} rating={rating} />
                        ))
                    ) : (
                      <Text style={styles.noRatingsText}>
                        No ratings available for this lecturer yet
                      </Text>
                    )}
                  </View>
                </>
              )}
            </Card>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  sectionCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: COLORS.primary,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  lecturerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: spacing.xs,
  },
  lecturerItemSelected: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    marginBottom: spacing.xs,
  },
  lecturerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lecturerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
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
  lecturerRating: {
    alignItems: 'flex-end',
    marginRight: spacing.sm,
  },
  ratingNumber: {
    ...typography.h4,
    fontWeight: '700',
  },
  emptyText: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  detailHeaderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  detailAvatarText: {
    ...typography.h3,
    color: COLORS.primary,
  },
  detailName: {
    ...typography.h3,
    color: COLORS.text,
  },
  detailDept: {
    ...typography.body,
    color: COLORS.textSecondary,
  },
  analyticsContainer: {
    marginBottom: spacing.lg,
  },
  analyticsHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  analyticsTitle: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.xs,
  },
  analyticsScore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  analyticsNumber: {
    ...typography.h1,
    color: COLORS.primary,
  },
  totalRatingsText: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  subsectionTitle: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  distributionContainer: {
    marginBottom: spacing.lg,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  distributionLabel: {
    ...typography.caption,
    color: COLORS.textSecondary,
    width: 30,
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 4,
    marginHorizontal: spacing.sm,
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    backgroundColor: COLORS.warning,
    borderRadius: 4,
  },
  distributionCount: {
    ...typography.caption,
    color: COLORS.textSecondary,
    width: 30,
    textAlign: 'right',
  },
  criteriaContainer: {
    marginBottom: spacing.lg,
  },
  ratingsListContainer: {
    marginTop: spacing.md,
  },
  noRatingsText: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
});