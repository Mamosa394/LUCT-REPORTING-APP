// lecturer Ratings
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, Card } from '../../src/components/UI';
import { RatingSummary, RatingCard} from '../../src/components/Ratings';
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