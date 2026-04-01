// app/prl/Profile.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LoadingSpinner, Input, Button, Card } from '../../src/components/UI';
import { COLORS, spacing, typography } from '../../config/theme';
import { logout } from '../../src/store/authSlice';

export default function PRLProfile({ navigation }) {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector(state => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    employeeId: user?.employeeId || '',
    department: user?.department || '',
    position: user?.position || 'Programme Leader',
  });

  const handleUpdate = async () => {
    // Update profile logic
    Alert.alert('Success', 'Profile updated successfully');
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) },
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
                {user?.name?.charAt(0).toUpperCase() || 'P'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editIcon}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Ionicons name="camera-outline" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>Programme Leader</Text>
          <Text style={styles.userId}>{user?.employeeId}</Text>
        </View>

        {/* Profile Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <Input
            label="Full Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            editable={isEditing}
          />
          
          <Input
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            editable={isEditing}
            keyboardType="email-address"
          />
          
          <Input
            label="Phone Number"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            editable={isEditing}
            keyboardType="phone-pad"
          />
          
          <Input
            label="Employee ID"
            value={formData.employeeId}
            editable={false}
          />
          
          <Input
            label="Department"
            value={formData.department}
            editable={false}
          />
          
          <Input
            label="Position"
            value={formData.position}
            editable={false}
          />
          
          {isEditing && (
            <View style={styles.buttonRow}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setIsEditing(false)}
                style={styles.button}
              />
              <Button
                title="Save Changes"
                onPress={handleUpdate}
                style={styles.button}
              />
            </View>
          )}
        </Card>

        {/* Programme Management */}
        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Programme Management</Text>
          
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Courses')}>
            <View style={styles.actionLeft}>
              <Ionicons name="book-outline" size={20} color={COLORS.primary} />
              <Text style={styles.actionText}>Manage Courses</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Lecturers')}>
            <View style={styles.actionLeft}>
              <Ionicons name="people-outline" size={20} color={COLORS.primary} />
              <Text style={styles.actionText}>Manage Lecturers</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Reports')}>
            <View style={styles.actionLeft}>
              <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
              <Text style={styles.actionText}>Review Reports</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Account Actions */}
        <Card style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('ChangePassword')}>
            <View style={styles.actionLeft}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} />
              <Text style={styles.actionText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Notifications')}>
            <View style={styles.actionLeft}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
              <Text style={styles.actionText}>Notification Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Logout Button */}
        <Button
          title="Logout"
          variant="danger"
          onPress={handleLogout}
          style={styles.logoutButton}
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
  actionsCard: {
    marginBottom: spacing.md,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    ...typography.body,
    color: COLORS.text,
    marginLeft: spacing.sm,
  },
  logoutButton: {
    marginTop: spacing.md,
  },
});