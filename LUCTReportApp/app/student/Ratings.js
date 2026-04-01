// app/student/Ratings.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ScreenContainer, LoadingSpinner, AppModal, Card } from '../../src/components/UI';
import { RatingForm, RatingCard, RatingSummary } from '../../src/components/Ratings';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchRatings, submitRating } from '../../src/store/monitoringSlice';
import { fetchCourses } from '../../src/store/courseSlice';

export default function StudentRatings({ navigation }) {
  const dispatch = useDispatch();
  const { ratings, averages, isLoading } = useSelector(state => state.monitoring);
  const { courses } = useSelector(state => state.courses);
  const { user } = useSelector(state => state.auth);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      dispatch(fetchRatings({ studentId: user?.id })),
      dispatch(fetchCourses()),
    ]);
  };

  const handleRateLecturer = (lecturer, course) => {
    setSelectedLecturer(lecturer);
    setSelectedCourse(course);
    setShowRatingForm(true);
  };

  const handleSubmitRating = async (ratingData) => {
    await dispatch(submitRating(ratingData));
    setShowRatingForm(false);
    loadData();
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer scrollable={true}>
      <View style={styles.container}>
        {/* My Ratings Section */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>My Ratings</Text>
          {ratings?.length > 0 ? (
            ratings.map((rating) => (
              <RatingCard key={rating.id} rating={rating} />
            ))
          ) : (
            <Text style={styles.emptyText}>You haven't rated any lecturers yet</Text>
          )}
        </Card>

        {/* Rate Lecturers Section */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Rate Your Lecturers</Text>
          {courses?.map((course) => (
            course.lecturer && (
              <TouchableOpacity
                key={course.id}
                style={styles.lecturerItem}
                onPress={() => handleRateLecturer(course.lecturer, course)}
              >
                <View>
                  <Text style={styles.lecturerName}>{course.lecturer.name}</Text>
                  <Text style={styles.courseName}>{course.name}</Text>
                </View>
                <Text style={styles.rateButton}>Rate →</Text>
              </TouchableOpacity>
            )
          ))}
        </Card>

        {/* Rating Form Modal */}
        <AppModal
          visible={showRatingForm}
          onClose={() => setShowRatingForm(false)}
          title={`Rate ${selectedLecturer?.name || 'Lecturer'}`}
        >
          <RatingForm
            ratedUserId={selectedLecturer?.id}
            courseId={selectedCourse?.id}
            onSuccess={handleSubmitRating}
            onCancel={() => setShowRatingForm(false)}
          />
        </AppModal>
      </View>
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
  lecturerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lecturerName: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  courseName: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  rateButton: {
    ...typography.bodySmall,
    color: COLORS.primary,
  },
  emptyText: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
});