// app/pl/Courses.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, AppModal, Input, Button, Card } from '../../src/components/UI';
import { CourseList, CourseHeader, CourseStats } from '../../src/components/Courses';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchCourses, createCourse, updateCourse, deleteCourse } from '../../src/store/courseSlice';
import { fetchLecturers } from '../../src/store/monitoringSlice';

export default function PLCourses({ navigation }) {
  const dispatch = useDispatch();
  const { courses, isLoading } = useSelector(state => state.courses);
  const { lecturers } = useSelector(state => state.monitoring);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: '',
    semester: '',
    year: '',
    credits: '',
    lecturerId: '',
    description: '',
    prerequisites: [],
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

  const handleCreateCourse = async () => {
    if (!formData.name || !formData.code) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    await dispatch(createCourse(formData));
    setShowCreateModal(false);
    resetForm();
    loadData();
    Alert.alert('Success', 'Course created successfully');
  };

  const handleUpdateCourse = async () => {
    await dispatch(updateCourse({ id: editingCourse.id, data: formData }));
    setEditingCourse(null);
    resetForm();
    loadData();
    Alert.alert('Success', 'Course updated successfully');
  };

  const handleDeleteCourse = (course) => {
    Alert.alert(
      'Delete Course',
      `Are you sure you want to delete ${course.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await dispatch(deleteCourse(course.id));
            loadData();
            Alert.alert('Success', 'Course deleted successfully');
          },
        },
      ]
    );
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
      description: '',
      prerequisites: [],
    });
  };

  const editCourse = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      department: course.department,
      semester: course.semester,
      year: course.year,
      credits: course.credits?.toString(),
      lecturerId: course.lecturerId,
      description: course.description || '',
      prerequisites: course.prerequisites || [],
    });
  };

  const courseStats = {
    total: courses?.length || 0,
    active: courses?.filter(c => c.isActive !== false).length || 0,
    completed: courses?.filter(c => c.status === 'completed').length || 0,
  };

  if (isLoading && !courses) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer scrollable={false}>
      <CourseHeader
        title="Manage Courses"
        onSearchPress={() => navigation.navigate('SearchCourses')}
        onFilterPress={() => {}}
      />
      
      <CourseStats stats={courseStats} />
      
      <View style={styles.addButtonContainer}>
        <Button
          title="+ Add New Course"
          onPress={() => setShowCreateModal(true)}
          style={styles.addButton}
        />
      </View>
      
      <CourseList
        courses={courses}
        onCoursePress={(course) => navigation.navigate('CourseDetails', { courseId: course.id })}
        onEdit={editCourse}
        onDelete={handleDeleteCourse}
        showActions={true}
      />

      {/* Create/Edit Modal */}
      <AppModal
        visible={showCreateModal || !!editingCourse}
        onClose={() => {
          setShowCreateModal(false);
          setEditingCourse(null);
          resetForm();
        }}
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
            placeholder="e.g., CS301"
          />
          
          <Input
            label="Department"
            value={formData.department}
            onChangeText={(text) => setFormData({ ...formData, department: text })}
            placeholder="e.g., Computer Science"
          />
          
          <View style={styles.row}>
            <Input
              label="Semester"
              value={formData.semester}
              onChangeText={(text) => setFormData({ ...formData, semester: text })}
              placeholder="e.g., 1"
              style={styles.halfInput}
            />
            
            <Input
              label="Year"
              value={formData.year}
              onChangeText={(text) => setFormData({ ...formData, year: text })}
              placeholder="e.g., 2024"
              style={styles.halfInput}
            />
          </View>
          
          <Input
            label="Credits"
            value={formData.credits}
            onChangeText={(text) => setFormData({ ...formData, credits: text })}
            placeholder="e.g., 3"
            keyboardType="numeric"
          />
          
          <Input
            label="Description"
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Course description..."
            multiline
            numberOfLines={4}
          />
          
          <View style={styles.lecturerSection}>
            <Text style={styles.label}>Assign Lecturer</Text>
            <ScrollView style={styles.lecturerList} showsVerticalScrollIndicator={false}>
              {lecturers?.map((lecturer) => (
                <TouchableOpacity
                  key={lecturer.id}
                  style={[
                    styles.lecturerOption,
                    formData.lecturerId === lecturer.id && styles.lecturerOptionSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, lecturerId: lecturer.id })}
                >
                  <View style={styles.lecturerOptionContent}>
                    <View style={styles.lecturerOptionAvatar}>
                      <Text style={styles.lecturerOptionInitial}>
                        {lecturer.name?.charAt(0)}
                      </Text>
                    </View>
                    <View>
                      <Text style={[
                        styles.lecturerOptionName,
                        formData.lecturerId === lecturer.id && styles.lecturerOptionNameSelected,
                      ]}>
                        {lecturer.name}
                      </Text>
                      <Text style={styles.lecturerOptionDept}>{lecturer.department}</Text>
                    </View>
                  </View>
                  {formData.lecturerId === lecturer.id && (
                    <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={() => {
                setShowCreateModal(false);
                setEditingCourse(null);
                resetForm();
              }}
              style={styles.modalButton}
            />
            <Button
              title={editingCourse ? 'Update' : 'Create'}
              onPress={editingCourse ? handleUpdateCourse : handleCreateCourse}
              style={styles.modalButton}
            />
          </View>
        </ScrollView>
      </AppModal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  addButtonContainer: {
    paddingHorizontal: spacing.md,
    marginVertical: spacing.md,
  },
  addButton: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  lecturerSection: {
    marginVertical: spacing.md,
  },
  label: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.sm,
  },
  lecturerList: {
    maxHeight: 300,
  },
  lecturerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lecturerOptionSelected: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  lecturerOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lecturerOptionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  lecturerOptionInitial: {
    color: COLORS.buttonPrimaryText,
    fontWeight: '700',
    fontSize: 16,
  },
  lecturerOptionName: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  lecturerOptionNameSelected: {
    color: COLORS.primary,
  },
  lecturerOptionDept: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});