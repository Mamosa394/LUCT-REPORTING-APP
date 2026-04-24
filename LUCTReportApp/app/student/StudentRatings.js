// student Ratings
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ScreenContainer, LoadingSpinner, AppModal, Card } from '../../src/components/UI';
import { RatingForm, RatingCard } from '../../src/components/Ratings';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchCourses } from '../../src/store/courseSlice';
import { 
  fetchRatings, 
  submitRating, 
  selectRatings, 
  selectRatingsLoading,
  selectRatingsSubmitting 
} from '../../src/store/Ratingsslice';
import { fetchLecturers } from '../../src/store/authSlice';

export default function StudentRatings({ navigation }) {
  const dispatch = useDispatch();
  
  // State from Redux
  const ratings = useSelector(selectRatings);
  const isLoading = useSelector(selectRatingsLoading);
  const isSubmitting = useSelector(selectRatingsSubmitting);
  const { courses } = useSelector(state => state.courses || { courses: [] });
  const { user } = useSelector(state => state.auth || { user: null });
  const { lecturers } = useSelector(state => state.auth || { lecturers: [] });
  
  // Local state
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [ratedLecturers, setRatedLecturers] = useState(new Set());

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Track which lecturers have been rated
    if (ratings.length > 0) {
      const rated = new Set(ratings.map(r => r.ratedUserId));
      setRatedLecturers(rated);
    }
  }, [ratings]);

  const loadData = async () => {
    try {
      // Fetch student's courses
      await dispatch(fetchCourses()).unwrap();
      
      // Fetch all lecturers
      await dispatch(fetchLecturers()).unwrap();
      
      // Fetch student's existing ratings
      await dispatch(fetchRatings()).unwrap();
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    }
  };

  const handleRateLecturer = (lecturer, course) => {
    setSelectedLecturer(lecturer);
    setSelectedCourse(course);
    setShowRatingForm(true);
  };

  const handleSubmitRating = async (ratingData) => {
    try {
      
      // Prepare rating data for submission
      const ratingToSubmit = {
        ratedUserId: selectedLecturer?.id || selectedLecturer?.uid,
        ratedUserName: selectedLecturer?.name,
        ratedUserRole: 'lecturer',
        courseId: selectedCourse?.id,
        courseName: selectedCourse?.name,
        courseCode: selectedCourse?.code,
        rating: ratingData.scores?.overall || 0,
        comment: ratingData.comment || '',
        aspects: ratingData.scores || {},
      };
      
      // Submit to Firestore
      await dispatch(submitRating(ratingToSubmit)).unwrap();
      
      // Close modal and refresh
      setShowRatingForm(false);
      setSelectedLecturer(null);
      setSelectedCourse(null);
      
      // Refresh ratings
      await dispatch(fetchRatings()).unwrap();
      
      Alert.alert('Success', 'Your rating has been submitted successfully!');
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', error.message || 'Failed to submit rating. Please try again.');
    }
  };

  // Group courses by lecturer
  const getLecturersFromCourses = () => {
    const lecturerMap = new Map();
    
    courses.forEach(course => {
      if (course.lecturerId || course.lecturer) {
        const lecturerId = course.lecturerId || course.lecturer?.id;
        
        if (!lecturerMap.has(lecturerId)) {
          // Find full lecturer details from lecturers array
          const fullLecturer = lecturers.find(l => 
            l.id === lecturerId || l.uid === lecturerId
          );
          
          lecturerMap.set(lecturerId, {
            id: lecturerId,
            name: course.lecturer?.name || fullLecturer?.name || 'Unknown Lecturer',
            email: fullLecturer?.email,
            department: fullLecturer?.department,
            courses: []
          });
        }
        
        lecturerMap.get(lecturerId).courses.push(course);
      }
    });
    
    return Array.from(lecturerMap.values());
  };

  const lecturerList = getLecturersFromCourses();

  if (isLoading && ratings.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer scrollable={true}>
      <View style={styles.container}>
        {/* My Ratings Section */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>My Ratings</Text>
          {ratings && ratings.length > 0 ? (
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
          {lecturerList.length > 0 ? (
            lecturerList.map((lecturer) => {
              const hasRated = ratedLecturers.has(lecturer.id);
              
              return (
                <View key={lecturer.id} style={styles.lecturerSection}>
                  <View style={styles.lecturerHeader}>
                    <View>
                      <Text style={styles.lecturerName}>{lecturer.name}</Text>
                      {lecturer.department && (
                        <Text style={styles.departmentText}>{lecturer.department}</Text>
                      )}
                    </View>
                    {hasRated && (
                      <View style={styles.ratedBadge}>
                        <Text style={styles.ratedText}>✓ Rated</Text>
                      </View>
                    )}
                  </View>
                  
                  {lecturer.courses.map((course) => (
                    <TouchableOpacity
                      key={course.id}
                      style={styles.courseItem}
                      onPress={() => handleRateLecturer(lecturer, course)}
                      disabled={hasRated}
                    >
                      <View style={styles.courseInfo}>
                        <Text style={styles.courseCode}>{course.code}</Text>
                        <Text style={styles.courseName}>{course.name}</Text>
                      </View>
                      {!hasRated && (
                        <Text style={styles.rateButton}>Rate →</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No courses available</Text>
          )}
        </Card>

        {/* Rating Form Modal */}
        <AppModal
          visible={showRatingForm}
          onClose={() => {
            setShowRatingForm(false);
            setSelectedLecturer(null);
            setSelectedCourse(null);
          }}
          title={`Rate ${selectedLecturer?.name || 'Lecturer'}`}
        >
          {selectedCourse && (
            <Text style={styles.modalSubtitle}>
              {selectedCourse.code} - {selectedCourse.name}
            </Text>
          )}
          
          <RatingForm
            ratedUserId={selectedLecturer?.id}
            courseId={selectedCourse?.id}
            onSuccess={handleSubmitRating}
            onCancel={() => {
              setShowRatingForm(false);
              setSelectedLecturer(null);
              setSelectedCourse(null);
            }}
            isSubmitting={isSubmitting}
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
    padding: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  lecturerSection: {
    marginBottom: spacing.lg,
  },
  lecturerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lecturerName: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 16,
  },
  departmentText: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  ratedBadge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  ratedText: {
    ...typography.caption,
    color: COLORS.success,
    fontWeight: '500',
  },
  courseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '40',
  },
  courseInfo: {
    flex: 1,
  },
  courseCode: {
    ...typography.bodySmall,
    color: COLORS.primary,
    fontWeight: '500',
  },
  courseName: {
    ...typography.body,
    color: COLORS.text,
    marginTop: 2,
  },
  rateButton: {
    ...typography.bodySmall,
    color: COLORS.primary,
    fontWeight: '500',
    paddingHorizontal: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
  modalSubtitle: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});