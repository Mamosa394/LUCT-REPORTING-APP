// app/pl/Lecturers.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, AppModal, Input, Button, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchLecturers, createLecturer, updateLecturer, deleteLecturer } from '../../src/store/monitoringSlice'; 

export default function PLLecturers({ navigation }) {
  const dispatch = useDispatch();
  const { lecturers, isLoading } = useSelector(state => state.monitoring);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLecturer, setEditingLecturer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeId: '',
    department: '',
    position: 'Lecturer',
    phone: '',
    specialization: '',
  });

  useEffect(() => {
    loadLecturers();
  }, []);

  const loadLecturers = async () => {
    await dispatch(fetchLecturers());
  };

  const handleCreateLecturer = async () => {
    if (!formData.name || !formData.email || !formData.employeeId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    await dispatch(createLecturer(formData));
    setShowCreateModal(false);
    resetForm();
    loadLecturers();
    Alert.alert('Success', 'Lecturer added successfully');
  };

  const handleUpdateLecturer = async () => {
    await dispatch(updateLecturer({ id: editingLecturer.id, data: formData }));
    setEditingLecturer(null);
    resetForm();
    loadLecturers();
    Alert.alert('Success', 'Lecturer updated successfully');
  };

  const handleDeleteLecturer = (lecturer) => {
    Alert.alert(
      'Delete Lecturer',
      `Are you sure you want to delete ${lecturer.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await dispatch(deleteLecturer(lecturer.id));
            loadLecturers();
            Alert.alert('Success', 'Lecturer deleted successfully');
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      employeeId: '',
      department: '',
      position: 'Lecturer',
      phone: '',
      specialization: '',
    });
  };

  const editLecturer = (lecturer) => {
    setEditingLecturer(lecturer);
    setFormData({
      name: lecturer.name,
      email: lecturer.email,
      employeeId: lecturer.employeeId,
      department: lecturer.department,
      position: lecturer.position,
      phone: lecturer.phone || '',
      specialization: lecturer.specialization || '',
    });
  };

  if (isLoading && !lecturers) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer scrollable={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manage Lecturers</Text>
          <Button
            title="+ Add Lecturer"
            onPress={() => setShowCreateModal(true)}
            size="sm"
          />
        </View>

        {lecturers?.map((lecturer) => (
          <Card key={lecturer.id} style={styles.lecturerCard}>
            <View style={styles.lecturerHeader}>
              <View style={styles.lecturerAvatar}>
                <Text style={styles.avatarText}>{lecturer.name?.charAt(0)}</Text>
              </View>
              <View style={styles.lecturerInfo}>
                <Text style={styles.lecturerName}>{lecturer.name}</Text>
                <Text style={styles.lecturerDept}>{lecturer.department}</Text>
                <Text style={styles.lecturerId}>ID: {lecturer.employeeId}</Text>
              </View>
              <View style={styles.lecturerActions}>
                <TouchableOpacity
                  onPress={() => editLecturer(lecturer)}
                  style={styles.actionIcon}
                >
                  <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteLecturer(lecturer)}
                  style={styles.actionIcon}
                >
                  <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.lecturerDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="mail-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{lecturer.email}</Text>
              </View>
              {lecturer.phone && (
                <View style={styles.detailItem}>
                  <Ionicons name="call-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.detailText}>{lecturer.phone}</Text>
                </View>
              )}
              {lecturer.specialization && (
                <View style={styles.detailItem}>
                  <Ionicons name="school-outline" size={14} color={COLORS.textSecondary} />
                  <Text style={styles.detailText}>{lecturer.specialization}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.lecturerStats}>
              <View style={styles.statBadge}>
                <Text style={styles.statText}>Rating: {lecturer.averageRating?.toFixed(1) || 'N/A'}⭐</Text>
              </View>
              <View style={styles.statBadge}>
                <Text style={styles.statText}>Courses: {lecturer.courseCount || 0}</Text>
              </View>
            </View>
          </Card>
        ))}

        {/* Create/Edit Modal */}
        <AppModal
          visible={showCreateModal || !!editingLecturer}
          onClose={() => {
            setShowCreateModal(false);
            setEditingLecturer(null);
            resetForm();
          }}
          title={editingLecturer ? 'Edit Lecturer' : 'Add New Lecturer'}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Input
              label="Full Name *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="e.g., Dr. John Smith"
            />
            
            <Input
              label="Email *"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="john.smith@luct.edu"
              keyboardType="email-address"
            />
            
            <Input
              label="Employee ID *"
              value={formData.employeeId}
              onChangeText={(text) => setFormData({ ...formData, employeeId: text.toUpperCase() })}
              placeholder="e.g., LCT00123"
            />
            
            <Input
              label="Department"
              value={formData.department}
              onChangeText={(text) => setFormData({ ...formData, department: text })}
              placeholder="e.g., Computer Science"
            />
            
            <Input
              label="Position"
              value={formData.position}
              onChangeText={(text) => setFormData({ ...formData, position: text })}
              placeholder="e.g., Senior Lecturer"
            />
            
            <Input
              label="Phone Number"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              placeholder="+1234567890"
              keyboardType="phone-pad"
            />
            
            <Input
              label="Specialization"
              value={formData.specialization}
              onChangeText={(text) => setFormData({ ...formData, specialization: text })}
              placeholder="e.g., Mobile Development, AI"
            />
            
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => {
                  setShowCreateModal(false);
                  setEditingLecturer(null);
                  resetForm();
                }}
                style={styles.modalButton}
              />
              <Button
                title={editingLecturer ? 'Update' : 'Create'}
                onPress={editingLecturer ? handleUpdateLecturer : handleCreateLecturer}
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
  lecturerCard: {
    marginBottom: spacing.md,
  },
  lecturerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  lecturerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.buttonPrimaryText,
  },
  lecturerInfo: {
    flex: 1,
  },
  lecturerName: {
    ...typography.h4,
    color: COLORS.text,
  },
  lecturerDept: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  lecturerId: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  lecturerActions: {
    flexDirection: 'row',
  },
  actionIcon: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  lecturerDetails: {
    marginVertical: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  detailText: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
    marginLeft: spacing.xs,
  },
  lecturerStats: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  statBadge: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginRight: spacing.sm,
  },
  statText: {
    ...typography.caption,
    color: COLORS.textSecondary,
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