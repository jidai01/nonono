import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { useJournalStore } from '../../src/stores/journalStore';
import { MOOD_EMOJIS, MOOD_LABELS, MoodLevel } from '../../src/types';
import * as Crypto from 'expo-crypto';

export default function CalendarScreen() {
  const router = useRouter();
  const { entries, loadEntriesByMonth, loadEntryByDate, saveEntry } = useJournalStore();
  const [selectedDate, setSelectedDate] = useState('');
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodLevel>(3);
  const [isRelapse, setIsRelapse] = useState(false);

  useEffect(() => {
    const now = new Date();
    loadEntriesByMonth(now.getFullYear(), now.getMonth() + 1);
  }, []);

  const markedDates = entries.reduce((acc, entry) => {
    acc[entry.date] = {
      marked: true,
      dotColor: entry.is_relapse ? '#FF6B6B' : '#4CAF50',
      selected: entry.date === selectedDate,
      selectedColor: entry.is_relapse ? '#FF6B6B' : '#4CAF50',
    };
    return acc;
  }, {} as Record<string, any>);

  const handleDayPress = useCallback((day: DateData) => {
    setSelectedDate(day.dateString);
    loadEntryByDate(day.dateString);
    router.push(`/entry/${day.dateString}`);
  }, []);

  const handleMonthChange = useCallback((month: DateData) => {
    loadEntriesByMonth(month.year, month.month);
  }, []);

  const currentStreak = entries.filter(e => !e.is_relapse).length;

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{currentStreak}</Text>
          <Text style={styles.statLabel}>Hari Berturut</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{entries.length}</Text>
          <Text style={styles.statLabel}>Total Entri</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{entries.filter(e => e.is_relapse).length}</Text>
          <Text style={styles.statLabel}>Relapse</Text>
        </View>
      </View>

      <Calendar
        markedDates={markedDates}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#4A90D9',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#4A90D9',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          monthTextColor: '#2d4150',
          arrowColor: '#4A90D9',
          textMonthFontWeight: 'bold',
        }}
        style={styles.calendar}
      />

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Hari Baik</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
          <Text style={styles.legendText}>Relapse</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#DDD' }]} />
          <Text style={styles.legendText}>Belum Ada Entri</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  statCard: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90D9',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  calendar: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 15,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});
