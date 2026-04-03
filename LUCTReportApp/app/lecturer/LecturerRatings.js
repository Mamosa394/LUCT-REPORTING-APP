// app/lecturer/Ratings.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, Card } from '../../src/components/UI';
import { RatingSummary, RatingCard, RatingBar } from '../../src/components/Ratings';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchRatings } from '../../src/store/monitoringSlice';
import { fetchCourses } from '../../src/store/courseSlice';

export default function LecturerRatings({ navigation }) {
  const dispatch = useDispatch();
  const { ratings, averages, isLoading } = useSelector(state => state.monitoring);
  const { courses } = useSelector(state => state.courses);
  const { user } = useSelector(state => state.auth);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseRatings, setCourseRatings] = useState([]);

  useEffect(() => {
    loadRatingsData();
  }, []);

  const loadRatingsData = async () => {
    await Promise.all([
      dispatch(fetchRatings({ lecturerId: user?.id })),
      dispatch(fetchCourses({ lecturerId: user?.id })),
    ]);
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    const courseSpecificRatings = ratings?.filter(r => r.courseId === course.id) || [];
    setCourseRatings(courseSpecificRatings);
  };

  const myRatings = ratings?.filter(r => r.lecturerId === user?.id) || [];
  const myCourses = courses?.filter(c => c.lecturerId === user?.id) || [];

  const getCourseAverage = (courseId) => {
    const courseRatingsList = myRatings.filter(r => r.courseId === courseId);
    if (courseRatingsList.length === 0) return 0;
    const sum = courseRatingsList.reduce((acc, r) => acc + (r.overall || 0), 0);
    return (sum / courseRatingsList.length).toFixed(1);
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

          {/* Courses List */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Ratings by Course</Text>
            {myCourses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={[
                  styles.courseItem,
                  selectedCourse?.id === course.id && styles.courseItemSelected,
                ]}
                onPress={() => handleCourseSelect(course)}
              >
                <View>
                  <Text style={styles.courseName}>{course.name}</Text>
                  <Text style={styles.courseCode}>{course.code}</Text>
                </View>
                <View style={styles.courseRating}>
                  <Text style={styles.ratingNumber}>{getCourseAverage(course.id)}</Text>
                  <View style={styles.starsSmall}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= Math.round(getCourseAverage(course.id)) ? 'star' : 'star-outline'}
                        size={12}
                        color={star <= Math.round(getCourseAverage(course.id)) ? '#FFC107' : COLORS.textDisabled}
                      />
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </Card>

          {/* Selected Course Details */}
          {selectedCourse && (
            <Card style={styles.sectionCard}>
              <View style={styles.selectedHeader}>
                <Text style={styles.sectionTitle}>
                  {selectedCourse.name} - Details
                </Text>
                <TouchableOpacity onPress={() => setSelectedCourse(null)}>
                  <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
              
              {courseRatings.length > 0 ? (
                <>
                  {/* Criteria Averages for this course */}
                  {calculateCourseAverages(courseRatings) && (
                    <View style={styles.criteriaContainer}>
                      <RatingBar
                        label="Teaching Quality"
                        value={calculateCourseAverages(courseRatings).teaching}
                      />
                      <RatingBar
                        label="Communication"
                        value={calculateCourseAverages(courseRatings).communication}
                      />
                      <RatingBar
                        label="Punctuality"
                        value={calculateCourseAverages(courseRatings).punctuality}
                      />
                      <RatingBar
                        label="Course Material"
                        value={calculateCourseAverages(courseRatings).material}
                      />
                      <RatingBar
                        label="Student Support"
                        value={calculateCourseAverages(courseRatings).support}
                      />
                    </View>
                  )}
                  
                  <Text style={styles.reviewsTitle}>
                    Student Reviews ({courseRatings.length})
                  </Text>
                  {courseRatings.map((rating) => (
                    <RatingCard key={rating.id} rating={rating} />
                  ))}
                </>
              ) : (
                <Text style={styles.noRatingsText}>No ratings yet for this course</Text>
              )}
            </Card>
          )}

          {/* All Ratings List */}
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>All Ratings</Text>
            {myRatings.slice(0, 10).map((rating) => (
              <RatingCard key={rating.id} rating={rating} />
            ))}
            {myRatings.length === 0 && (
              <Text style={styles.noRatingsText}>No ratings received yet</Text>
            )}
          </Card>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const calculateCourseAverages = (ratings) => {
  if (!ratings.length) return null;
  const sum = ratings.reduce((acc, r) => ({
    teaching: acc.teaching + (r.teaching || 0),
    communication: acc.communication + (r.communication || 0),
    punctuality: acc.punctuality + (r.punctuality || 0),
    material: acc.material + (r.material || 0),
    support: acc.support + (r.support || 0),
  }), { teaching: 0, communication: 0, punctuality: 0, material: 0, support: 0 });
  
  const count = ratings.length;
  return {
    teaching: sum.teaching / count,
    communication: sum.communication / count,
    punctuality: sum.punctuality / count,
    material: sum.material / count,
    support: sum.support / count,
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
  courseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  courseItemSelected: {
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
  },
  courseName: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  courseCode: {
    ...typography.caption,
    color: COLORS.primary,
    marginTop: 2,
  },
  courseRating: {
    alignItems: 'flex-end',
  },
  ratingNumber: {
    ...typography.h4,
    color: COLORS.primary,
  },
  starsSmall: {
    flexDirection: 'row',
    marginTop: 2,
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