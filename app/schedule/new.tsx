import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useScheduleStore } from '../../src/stores/scheduleStore';
import { DAY_NAMES } from '../../src/types';

export default function NewScheduleScreen() {
  const router = useRouter();
  const { addSchedule } = useScheduleStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay());
  const [time, setTime] = useState('09:00');

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Masukkan judul jadwal');
      return;
    }

    await addSchedule({
      title: title.trim(),
      description: description.trim(),
      day_of_week: selectedDay,
      time,
      is_active: true,
    });

    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Judul Jadwal</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Olahraga Pagi"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.sectionTitle}>Deskripsi (opsional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Detail aktivitas yang akan dilakukan..."
          multiline
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.sectionTitle}>Hari</Text>
        <View style={styles.dayContainer}>
          {DAY_NAMES.map((day, index) => (
            <TouchableOpacity
              key={day}
              style={[styles.dayButton, selectedDay === index && styles.dayButtonSelected]}
              onPress={() => setSelectedDay(index)}
            >
              <Text style={[styles.dayText, selectedDay === index && styles.dayTextSelected]}>
                {day.substring(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Waktu</Text>
        <TextInput
          style={styles.input}
          placeholder="HH:MM (contoh: 09:00)"
          value={time}
          onChangeText={setTime}
          keyboardType="numbers-and-punctuation"
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Batal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Simpan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#EEE',
    marginBottom: 20,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dayContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  dayButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  dayButtonSelected: {
    backgroundColor: '#4A90D9',
    borderColor: '#4A90D9',
  },
  dayText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  dayTextSelected: {
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
