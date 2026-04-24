//program leader courses
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, AppModal, Input, Button } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchCourses, createCourse, updateCourse, deleteCourse } from '../../src/store/courseSlice';
import { fetchLecturers, selectLecturers } from '../../src/store/authSlice';

export default function PLCourses({ navigation }) {
  const dispatch = useDispatch();
  const { courses, isLoading } = useSelector(state => state.courses);
  const lecturers = useSelector(selectLecturers);
  const { user } = useSelector(state => state.auth);
  
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: '',
    semester: '',
    year: '',
    credits: '',
    lecturerId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      dispatch(fetchCourses()),
      dispatch(fetchLecturers()),
    ]);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      department: '',
      semester: '',
      year: '',
      credits: '',
      lecturerId: '',
    });
  };

  const openCreateModal = () => {
    resetForm();
    setEditingCourse(null);
    setShowModal(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name || '',
      code: course.code || '',
      department: course.department || '',
      semester: course.semester || '',
      year: course.year || '',
      credits: course.credits?.toString() || '',
      lecturerId: course.lecturerId || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      Alert.alert('Error', 'Course name and code are required');
      return;
    }

    const selectedLecturer = lecturers.find(l => l.id === formData.lecturerId);
    
    const courseData = {
      ...formData,
      code: formData.code.toUpperCase(),
      credits: parseInt(formData.credits) || 0,
      lecturerName: selectedLecturer?.name || '',
      lecturerEmail: selectedLecturer?.email || '',
      employeeId: selectedLecturer?.employeeId || '',
      stream: user?.stream || '',
      createdBy: user?.uid || user?.id || '',
    };

    if (editingCourse) {
      await dispatch(updateCourse({ id: editingCourse.id, data: courseData }));
    } else {
      await dispatch(createCourse(courseData));
    }

    setShowModal(false);
    resetForm();
    loadData();
  };

  const handleDeleteCourse = (course) => {
    Alert.alert(
      'Delete Course',
      `Delete ${course.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await dispatch(deleteCourse(course.id));
            loadData();
          },
        },
      ]
    );
  };

  if (isLoading && courses.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer scrollable={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Courses</Text>
          <Text style={styles.subtitle}>{courses.length} courses</Text>
        </View>

        <Button
          title="+ Add New Course"
          onPress={openCreateModal}
          style={styles.addButton}
        />

        <ScrollView style={styles.courseList}>
          {courses.map((course) => (
            <View key={course.id} style={styles.courseCard}>
              <View style={styles.courseInfo}>
                <Text style={styles.courseName}>{course.name}</Text>
                <Text style={styles.courseCode}>{course.code}</Text>
                <Text style={styles.courseDetails}>
                  Semester {course.semester || 'N/A'} • {course.credits || 0} credits
                </Text>
                <Text style={styles.lecturerText}>
                  Lecturer: {course.lecturerName || 'Unassigned'}
                </Text>
              </View>
              <View style={styles.courseActions}>
                <TouchableOpacity onPress={() => openEditModal(course)} style={styles.actionBtn}>
                  <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteCourse(course)} style={styles.actionBtn}>
                  <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <AppModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title={editingCourse ? 'Edit Course' : 'Create New Course'}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Input
            label="Course Name *"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="e.g., Mobile Device Programming"
          />
          
          <Input
            label="Course Code *"
            value={formData.code}
            onChangeText={(text) => setFormData({ ...formData, code: text.toUpperCase() })}
            placeholder="e.g., MDP0000"
          />
          
          <Input
            label="Department"
            value={formData.department}
            onChangeText={(text) => setFormData({ ...formData, department: text })}
            placeholder="e.g., FICT"
          />
          
          <View style={styles.row}>
            <Input
              label="Semester"
              value={formData.semester}
              onChangeText={(text) => setFormData({ ...formData, semester: text })}
              placeholder="1"
              style={styles.halfInput}
            />
            <Input
              label="Year"
              value={formData.year}
              onChangeText={(text) => setFormData({ ...formData, year: text })}
              placeholder="2026"
              style={styles.halfInput}
            />
          </View>
          
          <Input
            label="Credits"
            value={formData.credits}
            onChangeText={(text) => setFormData({ ...formData, credits: text })}
            placeholder="10"
            keyboardType="numeric"
          />
          
          <Text style={styles.label}>Assign Lecturer</Text>
          <ScrollView style={styles.lecturerList}>
            {lecturers.map((lecturer) => (
              <TouchableOpacity
                key={lecturer.id}
                style={[
                  styles.lecturerOption,
                  formData.lecturerId === lecturer.id && styles.lecturerOptionSelected,
                ]}
                onPress={() => setFormData({ ...formData, lecturerId: lecturer.id })}
              >
                <View style={styles.lecturerInfo}>
                  <Ionicons name="person-circle-outline" size={24} color={COLORS.textSecondary} />
                  <View>
                    <Text style={styles.lecturerName}>{lecturer.name}</Text>
                    <Text style={styles.lecturerDept}>{lecturer.department || lecturer.faculty}</Text>
                  </View>
                </View>
                {formData.lecturerId === lecturer.id && (
                  <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.modalButtons}>
            <Button title="Cancel" variant="secondary" onPress={() => setShowModal(false)} style={{ flex: 1, marginRight: spacing.xs }} />
            <Button title={editingCourse ? 'Update' : 'Create'} onPress={handleSubmit} style={{ flex: 1, marginLeft: spacing.xs }} />
          </View>
        </ScrollView>
      </AppModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: COLORS.text,
  },
  subtitle: {
    ...typography.body,
    color: COLORS.textSecondary,
  },
  addButton: {
    marginBottom: spacing.md,
  },
  courseList: {
    flex: 1,
  },
  courseCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  courseCode: {
    ...typography.caption,
    color: COLORS.primary,
  },
  courseDetails: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  lecturerText: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  courseActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    padding: spacing.xs,
  },
  row: {
    flexDirection: 'row',
  },
  halfInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  label: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    fontWeight: '600',
  },
  lecturerList: {
    maxHeight: 250,
  },
  lecturerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lecturerOptionSelected: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  lecturerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  lecturerName: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  lecturerDept: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
});