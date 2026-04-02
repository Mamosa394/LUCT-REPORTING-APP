// src/components/Courses.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../config/theme';
import { spacing, typography, shadows } from '../../config/theme';

// Course Card Component
export function CourseCard({ course, onPress, onEnroll, showEnrollButton = false }) {
  const getProgressColor = () => {
    const progress = course.progress || 0;
    if (progress >= 75) return COLORS.success;
    if (progress >= 50) return COLORS.warning;
    return COLORS.error;
  };

  return (
    <TouchableOpacity style={styles.courseCard} onPress={() => onPress?.(course)} activeOpacity={0.8}>
      <View style={styles.courseHeader}>
        <View style={styles.courseCodeContainer}>
          <Text style={styles.courseCode}>{course.code}</Text>
        </View>
        {showEnrollButton && (
          <TouchableOpacity style={styles.enrollButton} onPress={() => onEnroll?.(course)}>
            <Text style={styles.enrollText}>Enroll</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.courseName}>{course.name}</Text>
      
      {course.lecturer && (
        <View style={styles.lecturerInfo}>
          <Ionicons name="person-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.lecturerName}>{course.lecturer.name || course.lecturer}</Text>
        </View>
      )}
      
      <View style={styles.courseDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>Semester {course.semester}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>{course.credits || 3} Credits</Text>
        </View>
      </View>
      
      {course.progress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${course.progress}%`, backgroundColor: getProgressColor() }]} />
          </View>
          <Text style={styles.progressText}>{course.progress}% Complete</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Course List Component
export function CourseList({ courses, onCoursePress, onEnroll, showEnrollButton = false }) {
  if (!courses || courses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="book-outline" size={48} color={COLORS.textDisabled} />
        <Text style={styles.emptyText}>No courses available</Text>
      </View>
    );
  }

  return (
    <View style={styles.courseList}>
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          onPress={onCoursePress}
          onEnroll={onEnroll}
          showEnrollButton={showEnrollButton}
        />
      ))}
    </View>
  );
}

// Course Header with Filter
export function CourseHeader({ title, onFilterPress, onSearchPress }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity onPress={onSearchPress} style={styles.headerButton}>
          <Ionicons name="search-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onFilterPress} style={styles.headerButton}>
          <Ionicons name="filter-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Course Stats Component
export function CourseStats({ stats }) {
  const { total = 0, completed = 0, inProgress = 0, upcoming = 0 } = stats;
  
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statBox}>
        <Text style={styles.statNumber}>{total}</Text>
        <Text style={styles.statLabel}>Total Courses</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={[styles.statNumber, { color: COLORS.success }]}>{completed}</Text>
        <Text style={styles.statLabel}>Completed</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={[styles.statNumber, { color: COLORS.warning }]}>{inProgress}</Text>
        <Text style={styles.statLabel}>In Progress</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={[styles.statNumber, { color: COLORS.primary }]}>{upcoming}</Text>
        <Text style={styles.statLabel}>Upcoming</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  courseCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  courseCodeContainer: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  courseCode: {
    ...typography.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  enrollButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
  },
  enrollText: {
    ...typography.caption,
    color: COLORS.buttonPrimaryText,
    fontWeight: '600',
  },
  courseName: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.sm,
  },
  lecturerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  lecturerName: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: spacing.xs,
  },
  courseDetails: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  detailText: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: spacing.xs,
  },
  progressContainer: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  courseList: {
    padding: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    ...typography.h3,
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.md,
    borderRadius: 12,
    ...shadows.small,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h3,
    color: COLORS.text,
  },
  statLabel: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
});