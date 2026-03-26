import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { submitRating } from '../../store/slices/ratingsSlice';
import Button from '../common/Button';
import Input from '../common/Input';
import { COLORS } from '../../styles/colors';
import { SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../styles/typography';
import { RATING_CRITERIA } from '../../utils/constants/roles';
import { getCurrentAcademicYear } from '../../utils/formatters/dateFormatter';

// ─── Star Row ─────────────────────────────────────────────────────────────────
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
            color={star <= value ? '#FFC107' : COLORS.gray300}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Rating Criterion Row ─────────────────────────────────────────────────────
function CriterionRow({ label, value, onChange }) {
  return (
    <View style={styles.criterionRow}>
      <Text style={styles.criterionLabel}>{label}</Text>
      <StarRating value={value} onChange={onChange} size={24} />
      <Text style={styles.criterionValue}>{value}/5</Text>
    </View>
  );
}

// ─── Full Rating Form ─────────────────────────────────────────────────────────
export function RatingForm({ ratedUserId, moduleId, semester, onSuccess, onCancel }) {
  const dispatch = useDispatch();
  const [scores, setScores] = useState({
    teachingQuality: 0,
    communication: 0,
    punctuality: 0,
    availability: 0,
    overall: 0,
  });
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const criterionLabels = {
    teachingQuality: 'Teaching Quality',
    communication: 'Communication',
    punctuality: 'Punctuality',
    availability: 'Availability',
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
      await dispatch(submitRating({
        ratedUserId,
        moduleId,
        ratingType: 'lecturer',
        scores,
        comment,
        semester: semester || 'Semester 1',
        academicYear: getCurrentAcademicYear(),
      })).unwrap();
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
      {RATING_CRITERIA.map((key) => (
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
        style={{ marginTop: SPACING.md }}
      />
      <View style={styles.formActions}>
        <Button title="Cancel" variant="outline" onPress={onCancel} style={{ flex: 1, marginRight: SPACING.sm }} />
        <Button title="Submit Rating" onPress={handleSubmit} loading={loading} style={{ flex: 2 }} />
      </View>
    </ScrollView>
  );
}

// ─── Rating Chart Bar ─────────────────────────────────────────────────────────
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

const styles = StyleSheet.create({
  starsRow: { flexDirection: 'row', alignItems: 'center' },
  starBtn: { padding: 2 },
  criterionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  criterionLabel: { ...TYPOGRAPHY.body2, flex: 1 },
  criterionValue: { ...TYPOGRAPHY.body2, color: COLORS.primary, fontWeight: '700', width: 32, textAlign: 'right' },
  formTitle: { ...TYPOGRAPHY.h4, marginBottom: SPACING.lg },
  formActions: { flexDirection: 'row', marginTop: SPACING.lg, marginBottom: SPACING.md },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  barLabel: { ...TYPOGRAPHY.caption, flex: 1, color: COLORS.textSecondary },
  barTrack: {
    flex: 2,
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginHorizontal: SPACING.sm,
  },
  barFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.full },
  barValue: { ...TYPOGRAPHY.caption, fontWeight: '700', color: COLORS.primary, width: 28, textAlign: 'right' },
});