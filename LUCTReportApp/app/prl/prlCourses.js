// app/prl/Courses.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, AppModal, Input, Button, Card } from '../../src/components/UI';
import { CourseList, CourseHeader, CourseStats } from '../../src/components/Courses';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchCourses, createCourse, updateCourse, deleteCourse } from '../../src/store/courseSlice';
import { fetchLecturers } from '../../src/store/authSlice';
import { selectLecturers, selectUsersLoading } from '../../src/store/authSlice';

export default function PRLCourses({ navigation }) {
  const dispatch = useDispatch();
  const { courses, isLoading } = useSelector(state => state.courses);
  
  const lecturers = useSelector(selectLecturers);
  const lecturersLoading = useSelector(selectUsersLoading);
  const { user: currentUser } = useSelector(state => state.auth);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null); // For viewing course details
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: '',
    semester: '',
    year: '',
    credits: '',
    lecturerId: '',
    lecturerName: '',
    stream: currentUser?.stream || '',
    createdBy: currentUser?.uid || '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      await Promise.all([
        dispatch(fetchCourses()),
        dispatch(fetchLecturers()),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load data');
    }
  };

  const handleCreateCourse = async () => {
    if (!formData.name || !formData.code) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    const selectedLecturer = lecturers.find(l => l.id === formData.lecturerId);
    const courseData = {
      ...formData,
      credits: parseInt(formData.credits) || 0,
      lecturerName: selectedLecturer?.name || '',
      lecturerEmail: selectedLecturer?.email || '',
      employeeId: selectedLecturer?.employeeId || '',
      stream: currentUser?.stream || '',
      createdBy: currentUser?.uid,
      createdAt: new Date().toISOString(),
      isActive: true,
    };
    
    await dispatch(createCourse(courseData));
    setShowCreateModal(false);
    resetForm();
    await loadData();
  };

  const handleUpdateCourse = async () => {
    const selectedLecturer = lecturers.find(l => l.id === formData.lecturerId);
    const courseData = {
      ...formData,
      credits: parseInt(formData.credits) || 0,
      lecturerName: selectedLecturer?.name || '',
      lecturerEmail: selectedLecturer?.email || '',
      employeeId: selectedLecturer?.employeeId || '',
      updatedAt: new Date().toISOString(),
    };
    
    await dispatch(updateCourse({ id: editingCourse.id, data: courseData }));
    setEditingCourse(null);
    resetForm();
    await loadData();
  };

  const handleDeleteCourse = (course) => {
    Alert.alert(
      'Delete Course',
      `Are you sure you want to delete ${course.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await dispatch(deleteCourse(course.id));
            await loadData();
            setShowDetailsModal(false); // Close details modal if open
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
      lecturerName: '',
      stream: currentUser?.stream || '',
      createdBy: currentUser?.uid || '',
    });
  };

  const editCourse = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      code: course.code,
      department: course.department || '',
      semester: course.semester || '',
      year: course.year || '',
      credits: course.credits?.toString() || '',
      lecturerId: course.lecturerId || '',
      lecturerName: course.lecturerName || '',
      stream: course.stream || currentUser?.stream || '',
      createdBy: course.createdBy || currentUser?.uid || '',
    });
  };

  const viewCourseDetails = (course) => {
    setSelectedCourse(course);
    setShowDetailsModal(true);
  };

  const courseStats = {
    total: courses?.length || 0,
    active: courses?.filter(c => c.isActive !== false).length || 0,
    assigned: courses?.filter(c => c.lecturerId).length || 0,
    unassigned: courses?.filter(c => !c.lecturerId).length || 0,
  };

  if (isLoading || lecturersLoading) {
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
        onCoursePress={viewCourseDetails} // Show details modal instead of navigating
        onEdit={editCourse}
        onDelete={handleDeleteCourse}
        showActions={true}
      />

      {/* Course Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalContainer}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>Course Details</Text>
              <TouchableOpacity 
                onPress={() => setShowDetailsModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            {selectedCourse && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Course Header with Icon */}
                <View style={styles.courseHeaderIcon}>
                  <View style={styles.courseIconContainer}>
                    <Ionicons name="book-outline" size={48} color={COLORS.primary} />
                  </View>
                  <Text style={styles.courseNameLarge}>{selectedCourse.name}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={[
                      styles.statusText,
                      { color: selectedCourse.isActive ? COLORS.success : COLORS.error }
                    ]}>
                      {selectedCourse.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Text>
                  </View>
                </View>

                {/* Course Information */}
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>Course Information</Text>
                  
                  <View style={styles.detailRow}>
                    <Ionicons name="code-outline" size={20} color={COLORS.textSecondary} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Course Code</Text>
                      <Text style={styles.detailValue}>{selectedCourse.code}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="business-outline" size={20} color={COLORS.textSecondary} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Department</Text>
                      <Text style={styles.detailValue}>{selectedCourse.department || 'Not specified'}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={20} color={COLORS.textSecondary} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Semester & Year</Text>
                      <Text style={styles.detailValue}>
                        Semester {selectedCourse.semester || 'N/A'} • Year {selectedCourse.year || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="star-outline" size={20} color={COLORS.textSecondary} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Credits</Text>
                      <Text style={styles.detailValue}>{selectedCourse.credits || 0} credits</Text>
                    </View>
                  </View>
                </View>

                {/* Lecturer Information */}
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>Assigned Lecturer</Text>
                  
                  {selectedCourse.lecturerId ? (
                    <>
                      <View style={styles.lecturerCard}>
                        <Ionicons name="person-circle" size={40} color={COLORS.primary} />
                        <View style={styles.lecturerInfo}>
                          <Text style={styles.lecturerNameLarge}>{selectedCourse.lecturerName}</Text>
                          <Text style={styles.lecturerDetail}>ID: {selectedCourse.employeeId}</Text>
                          <Text style={styles.lecturerDetail}>{selectedCourse.lecturerEmail}</Text>
                        </View>
                      </View>
                    </>
                  ) : (
                    <View style={styles.noLecturerCard}>
                      <Ionicons name="person-outline" size={32} color={COLORS.textSecondary} />
                      <Text style={styles.noLecturerText}>No lecturer assigned yet</Text>
                    </View>
                  )}
                </View>

                {/* Stream Information */}
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>Stream Information</Text>
                  <View style={styles.streamCard}>
                    <Ionicons name="school-outline" size={24} color={COLORS.primary} />
                    <Text style={styles.streamValue}>{selectedCourse.stream || 'Not assigned'}</Text>
                  </View>
                </View>

                {/* Timestamps */}
                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>Additional Information</Text>
                  
                  <View style={styles.timestampRow}>
                    <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.timestampText}>
                      Created: {selectedCourse.createdAt ? new Date(selectedCourse.createdAt).toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>
                  
                  {selectedCourse.updatedAt && (
                    <View style={styles.timestampRow}>
                      <Ionicons name="refresh-outline" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.timestampText}>
                        Last Updated: {new Date(selectedCourse.updatedAt).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={styles.detailsActions}>
                  <Button
                    title="Edit Course"
                    onPress={() => {
                      setShowDetailsModal(false);
                      editCourse(selectedCourse);
                    }}
                    style={styles.actionButton}
                  />
                  <Button
                    title="Delete Course"
                    variant="danger"
                    onPress={() => handleDeleteCourse(selectedCourse)}
                    style={styles.actionButton}
                  />
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

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
          
          {/* Stream Display (Read-only, from PRL) */}
          <View style={styles.streamContainer}>
            <Text style={styles.label}>Stream</Text>
            <View style={styles.streamBadge}>
              <Ionicons name="school-outline" size={16} color={COLORS.primary} />
              <Text style={styles.streamText}>{currentUser?.stream || 'Not assigned'}</Text>
            </View>
            <Text style={styles.streamHint}>
              Courses will be assigned to your stream: {currentUser?.stream}
            </Text>
          </View>
          
          {/* Lecturer Selection Section */}
          <View style={styles.lecturerSection}>
            <Text style={styles.label}>Assign Lecturer *</Text>
            <Text style={styles.subLabel}>
              Select a lecturer from the system (only shows registered lecturers)
            </Text>
            
            {lecturers.length === 0 ? (
              <View style={styles.noLecturersContainer}>
                <Ionicons name="people-outline" size={48} color={COLORS.textSecondary} />
                <Text style={styles.noLecturersText}>No lecturers found in system</Text>
                <Text style={styles.noLecturersHint}>
                  Please ensure lecturers have registered accounts
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.lecturerList} showsVerticalScrollIndicator={false}>
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
                      <View style={styles.lecturerHeader}>
                        <Ionicons 
                          name="person-circle-outline" 
                          size={24} 
                          color={formData.lecturerId === lecturer.id ? COLORS.primary : COLORS.textSecondary} 
                        />
                        <View style={styles.lecturerDetails}>
                          <Text style={[
                            styles.lecturerName,
                            formData.lecturerId === lecturer.id && styles.lecturerNameSelected,
                          ]}>
                            {lecturer.name}
                          </Text>
                          <Text style={styles.lecturerEmployeeId}>
                            ID: {lecturer.employeeId}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.lecturerDept}>
                        {lecturer.department || 'No department'} 
                        {lecturer.faculty && ` • ${lecturer.faculty}`}
                      </Text>
                      <Text style={styles.lecturerEmail}>{lecturer.email}</Text>
                    </View>
                    
                    {formData.lecturerId === lecturer.id && (
                      <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            
            {formData.lecturerId && (
              <View style={styles.selectedLecturerInfo}>
                <Ionicons name="information-circle" size={16} color={COLORS.success} />
                <Text style={styles.selectedLecturerText}>
                  Assigned to: {lecturers.find(l => l.id === formData.lecturerId)?.name}
                </Text>
              </View>
            )}
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
              disabled={!formData.lecturerId}
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
  streamContainer: {
    marginVertical: spacing.md,
    padding: spacing.md,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  streamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    padding: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  streamText: {
    ...typography.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  streamHint: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
    fontSize: 11,
  },
  lecturerSection: {
    marginVertical: spacing.md,
  },
  label: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  subLabel: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginBottom: spacing.md,
    fontSize: 12,
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
    borderWidth: 2,
  },
  lecturerInfo: {
    flex: 1,
  },
  lecturerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  lecturerDetails: {
    flex: 1,
  },
  lecturerName: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
  },
  lecturerNameSelected: {
    color: COLORS.primary,
  },
  lecturerEmployeeId: {
    ...typography.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  lecturerDept: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
    marginLeft: 32,
  },
  lecturerEmail: {
    ...typography.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginLeft: 32,
  },
  noLecturersContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  noLecturersText: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginTop: spacing.md,
    fontWeight: '600',
  },
  noLecturersHint: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  selectedLecturerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: COLORS.success + '20',
    borderRadius: 8,
    gap: spacing.sm,
  },
  selectedLecturerText: {
    ...typography.caption,
    color: COLORS.success,
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  // Details Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  detailsModalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    padding: spacing.lg,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailsTitle: {
    ...typography.h3,
    color: COLORS.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  courseHeaderIcon: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  courseIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  courseNameLarge: {
    ...typography.h2,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
  },
  statusText: {
    ...typography.caption,
    fontWeight: 'bold',
  },
  detailsSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    ...typography.body,
    color: COLORS.text,
  },
  lecturerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    gap: spacing.md,
  },
  lecturerNameLarge: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  lecturerDetail: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  noLecturerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    gap: spacing.md,
  },
  noLecturerText: {
    ...typography.body,
    color: COLORS.textSecondary,
  },
  streamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    gap: spacing.md,
  },
  streamValue: {
    ...typography.body,
    color: COLORS.text,
    fontWeight: '500',
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  timestampText: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  detailsActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
  },
});