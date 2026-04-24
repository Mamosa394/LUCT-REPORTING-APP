// student Profile
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, Input, Button, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { logoutUser, updateUserProfile } from '../../src/store/authSlice';

export default function StudentProfile({ navigation }) {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    studentId: user?.studentId || '',
    faculty: user?.faculty || user?.department || '',
  });


  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await dispatch(logoutUser()).unwrap();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          }
        },
      ]
    );
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScreenContainer scrollable={true}>
      <View style={styles.container}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>Student</Text>
          <Text style={styles.userId}>{user?.studentId}</Text>
        </View>

        {/* Profile Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <Input
            label="Full Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />
          
          <Input
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
          />
          
          <Input
            label="Student ID"
            value={formData.studentId}
          />
          
          <Input
            label="Faculty"
            value={formData.faculty}
            onChangeText={(text) => setFormData({ ...formData, faculty: text })}
          />
        </Card>

        {/* Logout Button */}
        <Button
          title={isLoggingOut ? "Logging out..." : "Logout"}
          variant="danger"
          onPress={handleLogout}
          style={styles.logoutButton}
          loading={isLoggingOut}
          disabled={isLoggingOut}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.buttonPrimaryText,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 20,
    padding: spacing.xs,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  userName: {
    ...typography.h2,
    color: COLORS.text,
  },
  userRole: {
    ...typography.body,
    color: COLORS.primary,
    marginTop: spacing.xs,
  },
  userId: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  infoCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: COLORS.text,
    marginBottom: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  logoutButton: {
    marginTop: spacing.md,
  },
});