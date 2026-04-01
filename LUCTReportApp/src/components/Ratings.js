// src/components/Ratings.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/theme';
import { spacing, typography, shadows } from '../config/theme';
import { Button, Input } from './UI';

// Star Rating Component
export function StarRating({ value, onChange, size = 28, readonly = false }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => !readonly && onChange && onChange(star)}
          disabled={readonly}
          style={styles.starBtn}
        >
          <Ionicons
            name={star <= value ? 'star' : 'star-outline'}
            size={size}
            color={star <= value ? '#FFC107' : COLORS.textDisabled}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// Rating Criterion Row
function CriterionRow({ label, value, onChange }) {
  return (
    <View style={styles.criterionRow}>
      <Text style={styles.criterionLabel}>{label}</Text>
      <StarRating value={value} onChange={onChange} size={24} />
      <Text style={styles.criterionValue}>{value}/5</Text>
    </View>
  );
}

// Full Rating Form
export function RatingForm({ ratedUserId, courseId, onSuccess, onCancel }) {
  const [scores, setScores] = useState({
    teachingQuality: 0,
    communication: 0,
    punctuality: 0,
    material: 0,
    support: 0,
    overall: 0,
  });
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const criterionLabels = {
    teachingQuality: 'Teaching Quality',
    communication: 'Communication Skills',
    punctuality: 'Punctuality',
    material: 'Course Material',
    support: 'Student Support',
    overall: 'Overall Rating',
  };

  const updateScore = (key, value) => setScores((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    const allRated = Object.values(scores).every((v) => v > 0);
    if (!allRated) {
      Alert.alert('Incomplete Rating', 'Please rate all criteria before submitting.');
      return;
    }
    setLoading(true);
    try {
      // This will be connected to your API
      console.log('Submitting rating:', { ratedUserId, courseId, scores, comment });
      Alert.alert('Success', 'Rating submitted successfully!');
      onSuccess?.();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to submit rating.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={styles.formTitle}>Rate Your Lecturer</Text>
      {Object.keys(criterionLabels).map((key) => (
        <CriterionRow
          key={key}
          label={criterionLabels[key]}
          value={scores[key]}
          onChange={(v) => updateScore(key, v)}
        />
      ))}
      <Input
        label="Comments (Optional)"
        value={comment}
        onChangeText={setComment}
        placeholder="Share your experience..."
        multiline
        numberOfLines={4}
        style={{ marginTop: spacing.md }}
      />
      <View style={styles.formActions}>
        <Button title="Cancel" variant="secondary" onPress={onCancel} style={{ flex: 1, marginRight: spacing.sm }} />
        <Button title="Submit Rating" onPress={handleSubmit} loading={loading} style={{ flex: 2 }} />
      </View>
    </ScrollView>
  );
}

// Rating Bar Component
export function RatingBar({ label, value, maxValue = 5 }) {
  const percent = (value / maxValue) * 100;
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${percent}%` }]} />
      </View>
      <Text style={styles.barValue}>{Number(value).toFixed(1)}</Text>
    </View>
  );
}

// Rating Card Component
export function RatingCard({ rating, onPress }) {
  return (
    <TouchableOpacity style={styles.ratingCard} onPress={() => onPress?.(rating)} activeOpacity={0.8}>
      <View style={styles.ratingHeader}>
        <View style={styles.ratingUser}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{rating.lecturer?.name?.charAt(0) || 'L'}</Text>
          </View>
          <View>
            <Text style={styles.lecturerName}>{rating.lecturer?.name || 'Lecturer'}</Text>
            <Text style={styles.courseName}>{rating.course?.name || 'Course'}</Text>
          </View>
        </View>
        <View style={styles.ratingScore}>
          <Text style={styles.ratingNumber}>{rating.overall}</Text>
          <StarRating value={rating.overall} readonly size={16} />
        </View>
      </View>
      {rating.comment && (
        <Text style={styles.ratingComment}>"{rating.comment}"</Text>
      )}
      <Text style={styles.ratingDate}>
        {new Date(rating.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
}

// Rating Summary Component
export function RatingSummary({ averages }) {
  if (!averages) return null;
  
  const criteria = [
    { label: 'Teaching Quality', value: averages.teaching },
    { label: 'Communication', value: averages.communication },
    { label: 'Punctuality', value: averages.punctuality },
    { label: 'Course Material', value: averages.material },
    { label: 'Student Support', value: averages.support },
  ];

  return (
    <View style={styles.summaryContainer}>
      <View style={styles.overallRating}>
        <Text style={styles.overallNumber}>{averages.overall?.toFixed(1)}</Text>
        <StarRating value={Math.round(averages.overall)} readonly size={20} />
        <Text style={styles.totalRatings}>{averages.totalRatings} ratings</Text>
      </View>
      <View style={styles.criteriaContainer}>
        {criteria.map((criterion) => (
          <RatingBar key={criterion.label} label={criterion.label} value={criterion.value} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  starsRow: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  starBtn: { 
    padding: 2 
  },
  criterionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  criterionLabel: { 
    ...typography.body, 
    flex: 1,
    color: COLORS.text,
  },
  criterionValue: { 
    ...typography.body, 
    color: COLORS.primary, 
    fontWeight: '700', 
    width: 32, 
    textAlign: 'right' 
  },
  formTitle: { 
    ...typography.h3, 
    marginBottom: spacing.lg,
    color: COLORS.text,
  },
  formActions: { 
    flexDirection: 'row', 
    marginTop: spacing.lg, 
    marginBottom: spacing.md 
  },
  barRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: spacing.sm 
  },
  barLabel: { 
    ...typography.bodySmall, 
    flex: 1, 
    color: COLORS.textSecondary 
  },
  barTrack: {
    flex: 2,
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
  },
  barFill: { 
    height: '100%', 
    backgroundColor: COLORS.primary, 
    borderRadius: 4 
  },
  barValue: { 
    ...typography.bodySmall, 
    fontWeight: '700', 
    color: COLORS.primary, 
    width: 28, 
    textAlign: 'right' 
  },
  ratingCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ratingUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  userAvatarText: {
    ...typography.h4,
    color: COLORS.primary,
  },
  lecturerName: {
    ...typography.body,
    fontWeight: '600',
    color: COLORS.text,
  },
  courseName: {
    ...typography.caption,
    color: COLORS.textSecondary,
  },
  ratingScore: {
    alignItems: 'flex-end',
  },
  ratingNumber: {
    ...typography.h4,
    color: COLORS.primary,
    fontWeight: '700',
  },
  ratingComment: {
    ...typography.body,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginVertical: spacing.sm,
  },
  ratingDate: {
    ...typography.caption,
    color: COLORS.textDisabled,
    textAlign: 'right',
  },
  summaryContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  overallRating: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  overallNumber: {
    ...typography.h1,
    color: COLORS.primary,
    marginBottom: spacing.sm,
  },
  totalRatings: {
    ...typography.caption,
    color: COLORS.textSecondary,
    marginTop: spacing.xs,
  },
  criteriaContainer: {
    marginTop: spacing.md,
  },
});