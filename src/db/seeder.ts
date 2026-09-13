import * as SQLite from 'expo-sqlite';

export async function seedTestData(database: SQLite.SQLiteDatabase) {
  const existing = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM journal_entries'
  );

  if (existing && existing.count > 0) return;

  const now = new Date();
  const entries: string[] = [];
  const activities: string[] = [];
  const schedules: string[] = [];

  const feelings = [
    'Feeling good today. Stayed busy with work and kept my mind occupied.',
    'Had some cravings but managed to push through with a walk.',
    'Great day! Went to the gym and felt really strong.',
    'Struggled a bit today. Felt lonely but called a friend.',
    'Productive day. Finished a project I had been working on.',
    'Feeling grateful for another sober day.',
    'Tough day but I made it through.',
    'Meditated this morning and it set a good tone for the day.',
    'Spent time with family. It reminded me why I am doing this.',
    'Feeling a bit down but staying positive.',
    'Exercised hard today. The endorphins really helped.',
    'Cleaned the whole house. Staying productive keeps me sane.',
    'Had a great conversation with someone who understands.',
    'Feeling hopeful about the future.',
    'One day at a time. Today was a good day.',
    'Cooked a healthy meal. Taking care of myself matters.',
    'Went for a long walk in nature. Peaceful.',
    'Feeling tempted but I stayed strong.',
    'Journaling helps me process my thoughts.',
    'Feeling proud of myself for staying on track.',
  ];

  const relapseNotes = [
    'Fell into old patterns. Need to refocus.',
    'Stress got to me. Will try harder next time.',
    'Social situation triggered cravings.',
    'Feeling disappointed in myself but not giving up.',
    'Need to revisit my coping strategies.',
  ];

  const activityNames = [
    'Morning Meditation',
    'Gym Workout',
    'Reading',
    'Journaling',
    'Nature Walk',
    'Cooking Healthy Meal',
    'Call a Friend',
    'Yoga',
    'Deep Breathing',
    'Gratitude List',
  ];

  const scheduleTitles = [
    'Morning Meditation',
    'Exercise',
    'Check-in Call',
    'Evening Journal',
    'Therapy Session',
    'Group Meeting',
  ];

  for (let i = 90; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const isRelapse = (i % 23 === 0 || i % 37 === 0) && i > 0;
    const mood = isRelapse ? Math.floor(Math.random() * 2) + 1 : Math.floor(Math.random() * 3) + 3;

    entries.push(
      `('entry_${i}', '${dateStr}', ${mood}, '${isRelapse ? relapseNotes[Math.floor(Math.random() * relapseNotes.length)].replace(/'/g, "''") : feelings[Math.floor(Math.random() * feelings.length)].replace(/'/g, "''")}', ${isRelapse ? 1 : 0}, '${isRelapse ? relapseNotes[Math.floor(Math.random() * relapseNotes.length)].replace(/'/g, "''") : ''}', datetime('now'), datetime('now'))`
    );
  }

  for (let i = 0; i < 10; i++) {
    const dur = [15, 30, 45, 60, 90][Math.floor(Math.random() * 5)];
    activities.push(
      `('act_${i}', '${activityNames[i]}', ${dur}, '', datetime('now'))`
    );
  }

  for (let i = 0; i < 6; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const time = `${String(8 + i * 2).padStart(2, '0')}:00`;
    schedules.push(
      `('sched_${i}', '${scheduleTitles[i]}', '', '${dateStr}', '${time}', 1, datetime('now'))`
    );
  }

  await database.execAsync(`
    INSERT INTO journal_entries (id, date, mood, feelings, is_relapse, relapse_notes, created_at, updated_at)
    VALUES ${entries.join(',\n')};
  `);

  await database.execAsync(`
    INSERT INTO activities (id, name, duration_minutes, notes, created_at)
    VALUES ${activities.join(',\n')};
  `);

  await database.execAsync(`
    INSERT INTO schedules (id, title, description, date, time, is_active, created_at)
    VALUES ${schedules.join(',\n')};
  `);

  console.log(`[seeder] Seeded ${entries.length} entries, ${activities.length} activities, ${schedules.length} schedules`);
}
