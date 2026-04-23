// app/student/StudentCourses.js - Fixed with proper SafeAreaView

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // ✅ Correct import
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchCourses } from '../../src/store/courseSlice';

export default function StudentCourses({ navigation, route }) {
  const dispatch = useDispatch();
  const flatListRef = useRef(null);
  
  const { courses = [], isLoading } = useSelector(state => state.courses || { courses: [], isLoading: false });
  const { user } = useSelector(state => state.auth || { user: null });
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCourseId, setExpandedCourseId] = useState(null);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  useEffect(() => {
    loadCourses();
  }, []);

  // Handle navigation params when coming from dashboard
  useEffect(() => {
    const courseId = route.params?.selectedCourseId;
    const courseName = route.params?.courseName;
    
    if (courseId && courses.length > 0) {
      console.log('📚 [StudentCourses] Received course from dashboard:', courseId, courseName);
      setSelectedCourseId(courseId);
      
      const course = courses.find(c => c.id === courseId);
      if (course) {
        setExpandedCourseId(courseId);
        
        // Scroll to the course
        const index = courses.findIndex(c => c.id === courseId);
        if (index !== -1 && flatListRef.current) {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({ 
              index, 
              animated: true,
              viewPosition: 0.1 
            });
          }, 300);
        }
      }
    }
  }, [route.params, courses]);

  const loadCourses = async () => {
    try {
      await dispatch(fetchCourses()).unwrap();
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  const handleCoursePress = (course) => {
    if (expandedCourseId === course.id) {
      setExpandedCourseId(null);
    } else {
      setExpandedCourseId(course.id);
    }
  };

  const navigateToAttendance = (course) => {
    navigation.navigate('Attendance', { 
      courseId: course.id, 
      courseName: course.name 
    });
  };

  const navigateToRatings = (course) => {
    navigation.navigate('Ratings', { 
      courseId: course.id, 
      lecturerId: course.lecturerId 
    });
  };

  const filteredCourses = courses.filter(course => 
    course.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.lecturerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCourseItem = ({ item: course }) => {
    const isExpanded = expandedCourseId === course.id;
    const isSelected = selectedCourseId === course.id;

    return (
      <Card style={[
        styles.courseCard,
        isSelected && styles.selectedCourseCard
      ]}>
        <TouchableOpacity
          style={styles.courseHeader}
          onPress={() => handleCoursePress(course)}
          activeOpacity={0.7}
        >
          <View style={styles.courseInfo}>
            <View style={styles.courseCodeContainer}>
              <Text style={styles.courseCode}>{course.code || 'N/A'}</Text>
            </View>
            <Text style={styles.courseName}>{course.name || 'Unnamed Course'}</Text>
            <Text style={styles.lecturerName}>
              {course.lecturerName || 'Lecturer not assigned'}
            </Text>
          </View>
          <View style={styles.expandIconContainer}>
            <Ionicons 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color={COLORS.textSecondary} 
            />
          </View>
        </TouchableOpacity>

        {/* Course Info Row */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Ionicons name="book-outline" size={20} color={COLORS.primary} />
            <Text style={styles.statValue}>{course.credits || 0}</Text>
            <Text style={styles.statLabel}>Credits</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={20} color={COLORS.info} />
            <Text style={styles.statValue}>{course.semester || 'N/A'}</Text>
            <Text style={styles.statLabel}>Semester</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="business-outline" size={20} color={COLORS.success} />
            <Text style={styles.statValue}>{course.department?.slice(0, 4) || 'N/A'}</Text>
            <Text style={styles.statLabel}>Dept</Text>
          </View>
        </View>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.divider} />
            
            {/* Course Details */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Course Details</Text>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Department:</Text>
                <Text style={styles.detailValue}>{course.department || 'Not specified'}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Stream:</Text>
                <Text style={styles.detailValue}>{course.stream || 'Not specified'}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Year:</Text>
                <Text style={styles.detailValue}>{course.year || 'Not specified'}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Lecturer Email:</Text>
                <Text style={styles.detailValue}>{course.lecturerEmail || 'Not available'}</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              
              <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => navigateToAttendance(course)}
              >
                <View style={[styles.actionIcon, { backgroundColor: COLORS.success + '20' }]}>
                  <Ionicons name="calendar-outline" size={20} color={COLORS.success} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>View Attendance</Text>
                  <Text style={styles.actionSubtitle}>
                    Check your attendance records
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => navigateToRatings(course)}
              >
                <View style={[styles.actionIcon, { backgroundColor: COLORS.warning + '20' }]}>
                  <Ionicons name="star-outline" size={20} color={COLORS.warning} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Rate Course</Text>
                  <Text style={styles.actionSubtitle}>
                    Share your feedback on this course
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Card>
    );
  };

  // Get item layout for scrollToIndex
  const getItemLayout = (data, index) => ({
    length: 150,
    offset: 150 * index,
    index,
  });

  // Header Component for FlatList
  const ListHeaderComponent = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Courses</Text>
        <Text style={styles.headerSubtitle}>
          {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} enrolled
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses by name, code, or lecturer..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </>
  );

  // Empty Component
  const ListEmptyComponent = () => (
    <View style={styles.emptyState}>
      <Ionicons name="book-outline" size={64} color={COLORS.textDisabled} />
      <Text style={styles.emptyStateTitle}>No Courses Found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery ? 'Try adjusting your search' : 'You are not enrolled in any courses yet'}
      </Text>
    </View>
  );

  if (isLoading && !refreshing && courses.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        ref={flatListRef}
        data={filteredCourses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        getItemLayout={getItemLayout}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h2,
    color: COLORS.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: COLORS.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: COLORS.text,
    paddingVertical: spacing.md,
  },
  courseCard: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  selectedCourseCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  courseInfo: {
    flex: 1,
  },
  courseCodeContainer: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  courseCode: {
    ...typography.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  courseName: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.xs,
  },
  lecturerName: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
  },
  expandIconContainer: {
    marginLeft: spacing.sm,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: COLORS.surfaceLight,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
  },
  expandedContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: spacing.md,
  },
  detailsSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  detailLabel: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
  },
  detailValue: {
    ...typography.bodySmall,
    color: COLORS.text,
    fontWeight: '500',
  },
  actionsSection: {
    marginTop: spacing.sm,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    ...typography.bodySmall,
    color: COLORS.text,
    fontWeight: '500',
  },
  actionSubtitle: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyStateText: {
    ...typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});