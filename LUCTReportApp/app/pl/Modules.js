// app/pl/Modules.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, AppModal, Input, Button, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchModules, createModule, updateModule, deleteModule } from '../../src/store/monitoringSlice'; // Fixed import
import { fetchCourses } from '../../src/store/courseSlice';

export default function PLModules({ navigation }) {
  const dispatch = useDispatch();
  const { modules, isLoading } = useSelector(state => state.monitoring);
  const { courses } = useSelector(state => state.courses);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    credits: '',
    courseId: '',
    description: '',
    learningOutcomes: [],
    assessmentMethods: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      dispatch(fetchModules()),
      dispatch(fetchCourses()),
    ]);
  };

  const handleCreateModule = async () => {
    if (!formData.name || !formData.code || !formData.courseId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    await dispatch(createModule(formData));
    setShowCreateModal(false);
    resetForm();
    loadData();
    Alert.alert('Success', 'Module created successfully');
  };

  const handleUpdateModule = async () => {
    await dispatch(updateModule({ id: editingModule.id, data: formData }));
    setEditingModule(null);
    resetForm();
    loadData();
    Alert.alert('Success', 'Module updated successfully');
  };

  const handleDeleteModule = (module) => {
    Alert.alert(
      'Delete Module',
      `Are you sure you want to delete ${module.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await dispatch(deleteModule(module.id));
            loadData();
            Alert.alert('Success', 'Module deleted successfully');
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      credits: '',
      courseId: '',
      description: '',
      learningOutcomes: [],
      assessmentMethods: [],
    });
    setSelectedCourse(null);
  };

  const editModule = (module) => {
    setEditingModule(module);
    setFormData({
      name: module.name,
      code: module.code,
      credits: module.credits?.toString(),
      courseId: module.courseId,
      description: module.description || '',
      learningOutcomes: module.learningOutcomes || [],
      assessmentMethods: module.assessmentMethods || [],
    });
    setSelectedCourse(courses?.find(c => c.id === module.courseId));
  };

  if (isLoading && !modules) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer scrollable={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manage Modules</Text>
          <Button
            title="+ Add Module"
            onPress={() => setShowCreateModal(true)}
            size="sm"
          />
        </View>

        {/* Filter by Course */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedCourse && styles.filterChipActive]}
            onPress={() => setSelectedCourse(null)}
          >
            <Text style={[styles.filterText, !selectedCourse && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          {courses?.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={[styles.filterChip, selectedCourse?.id === course.id && styles.filterChipActive]}
              onPress={() => setSelectedCourse(course)}
            >
              <Text style={[styles.filterText, selectedCourse?.id === course.id && styles.filterTextActive]}>
                {course.code}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Modules List */}
        {modules
          ?.filter(module => !selectedCourse || module.courseId === selectedCourse.id)
          .map((module) => (
            <Card key={module.id} style={styles.moduleCard}>
              <View style={styles.moduleHeader}>
                <View>
                  <Text style={styles.moduleCode}>{module.code}</Text>
                  <Text style={styles.moduleName}>{module.name}</Text>
                </View>
                <View style={styles.moduleActions}>
                  <TouchableOpacity
                    onPress={() => editModule(module)}
                    style={styles.actionIcon}
                  >
                    <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteModule(module)}
                    style={styles.actionIcon}
                  >
                    <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.moduleCredits}>{module.credits} Credits</Text>
              
              {module.description && (
                <Text style={styles.moduleDescription}>{module.description}</Text>
              )}
              
              <View style={styles.moduleCourse}>
                <Ionicons name="book-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.courseName}>
                  {courses?.find(c => c.id === module.courseId)?.name || 'No course assigned'}
                </Text>
              </View>
              
              {module.learningOutcomes?.length > 0 && (
                <View style={styles.outcomes}>
                  <Text style={styles.outcomesTitle}>Learning Outcomes:</Text>
                  {module.learningOutcomes.slice(0, 2).map((outcome, index) => (
                    <Text key={index} style={styles.outcomeItem}>• {outcome}</Text>
                  ))}
                  {module.learningOutcomes.length > 2 && (
                    <Text style={styles.moreText}>+{module.learningOutcomes.length - 2} more</Text>
                  )}
                </View>
              )}
            </Card>
          ))}

        {/* Create/Edit Modal */}
        <AppModal
          visible={showCreateModal || !!editingModule}
          onClose={() => {
            setShowCreateModal(false);
            setEditingModule(null);
            resetForm();
          }}
          title={editingModule ? 'Edit Module' : 'Add New Module'}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Input
              label="Module Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="e.g., Mobile Application Development"
            />
            
            <Input
              label="Module Code *"
              value={formData.code}
              onChangeText={(text) => setFormData({ ...formData, code: text.toUpperCase() })}
              placeholder="e.g., CS3011"
            />
            
            <Input
              label="Credits"
              value={formData.credits}
              onChangeText={(text) => setFormData({ ...formData, credits: text })}
              placeholder="e.g., 3"
              keyboardType="numeric"
            />
            
            <View style={styles.courseSection}>
              <Text style={styles.label}>Course *</Text>
              <ScrollView style={styles.courseList} showsVerticalScrollIndicator={false}>
                {courses?.map((course) => (
                  <TouchableOpacity
                    key={course.id}
                    style={[
                      styles.courseOption,
                      formData.courseId === course.id && styles.courseOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, courseId: course.id })}
                  >
                    <View>
                      <Text style={[
                        styles.courseOptionName,
                        formData.courseId === course.id && styles.courseOptionNameSelected,
                      ]}>
                        {course.name}
                      </Text>
                      <Text style={styles.courseOptionCode}>{course.code}</Text>
                    </View>
                    {formData.courseId === course.id && (
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <Input
              label="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Module description..."
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => {
                  setShowCreateModal(false);
                  setEditingModule(null);
                  resetForm();
                }}
                style={styles.modalButton}
              />
              <Button
                title={editingModule ? 'Update' : 'Create'}
                onPress={editingModule ? handleUpdateModule : handleCreateModule}
                style={styles.modalButton}
              />
            </View>
          </ScrollView>
        </AppModal>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.h3,
    color: COLORS.text,
  },
  filterBar: {
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.buttonPrimaryText,
  },
  moduleCard: {
    marginBottom: spacing.md,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  moduleCode: {
    ...typography.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  moduleName: {
    ...typography.h4,
    color: COLORS.text,
    marginTop: spacing.xs,
  },
  moduleActions: {
    flexDirection: 'row',
  },
  actionIcon: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  moduleCredits: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: spacing.sm,
  },
  moduleDescription: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  moduleCourse: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  courseName: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: spacing.xs,
  },
  outcomes: {
    marginTop: spacing.sm,
  },
  outcomesTitle: {
    ...typography.bodySmall,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  outcomeItem: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginLeft: spacing.md,
    marginBottom: spacing.xs,
  },
  moreText: {
    ...typography.caption,
    color: COLORS.primary,
    marginLeft: spacing.md,
  },
  courseSection: {
    marginVertical: spacing.md,
  },
  label: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.sm,
  },
  courseList: {
    maxHeight: 200,
  },
  courseOption: {
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
  courseOptionSelected: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  courseOptionName: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  courseOptionNameSelected: {
    color: COLORS.primary,
  },
  courseOptionCode: {
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