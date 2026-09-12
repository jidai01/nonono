import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useScheduleStore } from '../../src/stores/scheduleStore';
import { DAY_NAMES, Schedule } from '../../src/types';

export default function ScheduleScreen() {
  const router = useRouter();
  const { schedules, loadSchedules, toggleSchedule, deleteSchedule } = useScheduleStore();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    loadSchedules();
  }, []);

  const filteredSchedules = selectedDay !== null
    ? schedules.filter(s => s.day_of_week === selectedDay)
    : schedules;

  const handleDeleteSchedule = (id: string) => {
    Alert.alert(
      'Delete Schedule',
      'Are you sure you want to delete this schedule?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteSchedule(id) },
      ]
    );
  };

  const renderSchedule = ({ item }: { item: Schedule }) => (
    <View style={[styles.scheduleCard, !item.is_active && styles.inactiveCard]}>
      <View style={styles.scheduleHeader}>
        <View style={styles.scheduleInfo}>
          <Text style={styles.scheduleTitle}>{item.title}</Text>
          <Text style={styles.scheduleTime}>{item.time}</Text>
          <Text style={styles.scheduleDay}>{DAY_NAMES[item.day_of_week]}</Text>
        </View>
        <Switch
          value={item.is_active}
          onValueChange={(value) => toggleSchedule(item.id, value)}
          trackColor={{ false: '#DDD', true: '#4A90D9' }}
        />
      </View>
      {item.description ? (
        <Text style={styles.scheduleDescription}>{item.description}</Text>
      ) : null}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteSchedule(item.id)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.daySelector}>
        {DAY_NAMES.map((day, index) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDay === index && styles.dayButtonSelected,
            ]}
            onPress={() => setSelectedDay(selectedDay === index ? null : index)}
          >
            <Text
              style={[
                styles.dayText,
                selectedDay === index && styles.dayTextSelected,
              ]}
            >
              {day.substring(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredSchedules.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>⏰</Text>
          <Text style={styles.emptyText}>No schedules yet</Text>
          <Text style={styles.emptySubtext}>Create reminders for prevention activities</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSchedules}
          renderItem={renderSchedule}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/schedule/new')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  dayButtonSelected: {
    backgroundColor: '#4A90D9',
  },
  dayText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  dayTextSelected: {
    color: 'white',
  },
  listContent: {
    padding: 15,
  },
  scheduleCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  scheduleTime: {
    fontSize: 14,
    color: '#4A90D9',
    fontWeight: '600',
  },
  scheduleDay: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  scheduleDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  deleteButton: {
    marginTop: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90D9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  fabText: {
    fontSize: 30,
    color: 'white',
    marginTop: -2,
  },
});
