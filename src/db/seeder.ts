import * as SQLite from 'expo-sqlite';

export async function seedTestData(database: SQLite.SQLiteDatabase) {
  try {
    const existing = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM journal_entries'
    );

    console.log(`[seeder] Existing entries: ${existing?.count || 0}`);

    if (existing && existing.count > 0) {
      console.log('[seeder] Data already exists, skipping seed');
      return;
    }

    console.log('[seeder] Starting seed for Aug 1 - Sep 12, 2026...');

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
      'Woke up early and went for a run. Starting the day right.',
      'Read a chapter of my book. Learning to slow down.',
      'Practiced deep breathing when I felt anxious.',
      'Had a productive meeting at work. Feeling capable.',
      'Tried a new recipe today. Cooking is becoming therapeutic.',
      'Called an old friend. Reconnecting feels good.',
      'Went to a support group meeting. Not alone in this.',
      'Slept well last night. Rest makes everything better.',
      'Took a break from social media. Mental health matters.',
      'Wrote in my gratitude journal. Three things I am thankful for.',
    ];

    const relapseNotes = [
      'Fell into old patterns. Need to refocus.',
      'Stress got to me. Will try harder next time.',
      'Social situation triggered cravings.',
      'Feeling disappointed in myself but not giving up.',
      'Need to revisit my coping strategies.',
      'Had a bad argument. Lost control for a moment.',
      'Work deadline pressure was too much.',
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
      'Reading Time',
      'Nature Walk',
    ];

    const startDate = new Date('2026-08-01');
    const endDate = new Date('2026-09-12');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const isRelapse = (
        dateStr === '2026-08-07' ||
        dateStr === '2026-08-19' ||
        dateStr === '2026-08-31' ||
        dateStr === '2026-09-08'
      );

      let mood: number;
      if (isRelapse) {
        mood = Math.random() < 0.6 ? 1 : 2;
      } else if (isWeekend) {
        mood = Math.floor(Math.random() * 2) + 4;
      } else {
        mood = Math.floor(Math.random() * 3) + 3;
      }

      const feelingIdx = isRelapse
        ? Math.floor(Math.random() * relapseNotes.length)
        : Math.floor(Math.random() * feelings.length);
      const feeling = isRelapse
        ? relapseNotes[feelingIdx]
        : feelings[feelingIdx];

      entries.push(
        `('entry_${dateStr}', '${dateStr}', ${mood}, '${feeling.replace(/'/g, "''")}', ${isRelapse ? 1 : 0}, '${isRelapse ? relapseNotes[Math.floor(Math.random() * relapseNotes.length)].replace(/'/g, "''") : ''}', datetime('now'), datetime('now'))`
      );
    }

    for (let i = 0; i < activityNames.length; i++) {
      const durations = [15, 20, 30, 45, 60, 90, 30, 45, 10, 15];
      activities.push(
        `('act_${i}', '${activityNames[i]}', ${durations[i]}, '', datetime('now'))`
      );
    }

    for (let i = 0; i < scheduleTitles.length; i++) {
      const schedDate = new Date(today);
      schedDate.setDate(schedDate.getDate() + i);
      const dateStr = schedDate.toISOString().split('T')[0];
      const times = ['07:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
      schedules.push(
        `('sched_${i}', '${scheduleTitles[i]}', '', '${dateStr}', '${times[i]}', 1, datetime('now'))`
      );
    }

    await database.execAsync(`
      INSERT OR IGNORE INTO journal_entries (id, date, mood, feelings, is_relapse, relapse_notes, created_at, updated_at)
      VALUES ${entries.join(',\n')};
    `);

    await database.execAsync(`
      INSERT OR IGNORE INTO activities (id, name, duration_minutes, notes, created_at)
      VALUES ${activities.join(',\n')};
    `);

    await database.execAsync(`
      INSERT OR IGNORE INTO schedules (id, title, description, date, time, is_active, created_at)
      VALUES ${schedules.join(',\n')};
    `);

    const countCheck = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM journal_entries'
    );
    console.log(`[seeder] Done! Total entries: ${countCheck?.count || 0}`);

  } catch (error) {
    console.error('[seeder] Error:', error);
  }
}

export async function forceReseed(database: SQLite.SQLiteDatabase) {
  console.log('[seeder] Force reseeding...');
  await database.execAsync('DELETE FROM journal_entries');
  await database.execAsync('DELETE FROM activities');
  await database.execAsync('DELETE FROM schedules');
  await seedTestData(database);
}
