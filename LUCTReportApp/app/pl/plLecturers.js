//program leader lecturers
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { fetchLecturers, selectLecturers } from '../../src/store/authSlice';
import { deleteUser } from '../../src/services/firebase';

export default function PLLecturers({ navigation }) {
  const dispatch = useDispatch();
  const lecturers = useSelector(selectLecturers);
  const { usersLoading } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchLecturers());
  }, []);

  const handleDeleteLecturer = (lecturer) => {
    Alert.alert(
      'Delete Lecturer',
      `Delete ${lecturer.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(lecturer.id);
              dispatch(fetchLecturers());
            } catch (error) {
              Alert.alert('Error', 'Failed to delete lecturer');
            }
          },
        },
      ]
    );
  };

  if (usersLoading && lecturers.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer scrollable={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Manage Lecturers</Text>
          <Text style={styles.subtitle}>{lecturers.length} lecturers</Text>
        </View>

        {lecturers.map((lecturer) => (
          <Card key={lecturer.id} style={styles.lecturerCard}>
            <View style={styles.lecturerHeader}>
              <View style={styles.lecturerAvatar}>
                <Text style={styles.avatarText}>{lecturer.name?.charAt(0)?.toUpperCase()}</Text>
              </View>
              <View style={styles.lecturerInfo}>
                <Text style={styles.lecturerName}>{lecturer.name}</Text>
                <Text style={styles.lecturerDept}>{lecturer.department || lecturer.faculty || 'No department'}</Text>
                <Text style={styles.lecturerId}>ID: {lecturer.employeeId}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteLecturer(lecturer)}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={20} color={COLORS.error} />
              </TouchableOpacity>
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
              <View style={styles.detailItem}>
                <Ionicons name="person-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.detailText}>{lecturer.role || 'Lecturer'}</Text>
              </View>
            </View>
          </Card>
        ))}

        {lecturers.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={COLORS.textDisabled} />
            <Text style={styles.emptyText}>No lecturers found</Text>
          </View>
        )}
      </View>
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
  headerTitle: {
    ...typography.h2,
    color: COLORS.text,
  },
  subtitle: {
    ...typography.body,
    color: COLORS.textSecondary,
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
  deleteBtn: {
    padding: spacing.sm,
  },
  lecturerDetails: {
    marginTop: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  detailText: {
    ...typography.bodySmall,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body,
    color: COLORS.textSecondary,
    marginTop: spacing.md,
  },
});