// app/student/Courses.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, AppModal } from '../../src/components/UI';
import { CourseList, CourseHeader } from '../../src/components/Courses';
import { COLORS, spacing } from '../../config/theme';
import { fetchCourses } from '../../src/store/courseSlice';

export default function StudentCourses({ navigation }) {
  const dispatch = useDispatch();
  const { courses, isLoading } = useSelector(state => state.courses);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    await dispatch(fetchCourses(filters));
  };

  const handleCoursePress = (course) => {
    navigation.navigate('CourseDetails', { courseId: course.id });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    loadCourses();
    setShowFilter(false);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer scrollable={false}>
      <CourseHeader
        title="My Courses"
        onSearchPress={() => navigation.navigate('SearchCourses')}
        onFilterPress={() => setShowFilter(true)}
      />
      
      <CourseList
        courses={courses}
        onCoursePress={handleCoursePress}
      />

      <AppModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        title="Filter Courses"
      >
        {/* Add filter options here */}
        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </AppModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  applyButton: {
    backgroundColor: COLORS.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  applyButtonText: {
    color: COLORS.buttonPrimaryText,
    fontWeight: '600',
  },
});