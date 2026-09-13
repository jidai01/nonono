import * as SQLite from 'expo-sqlite';

export async function seedTestData(database: SQLite.SQLiteDatabase) {
  try {
    const existing = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM journal_entries'
    );

    console.log(`[seeder] Existing entries: ${existing?.count || 0}`);

    if (existing && existing.count > 0) {
      console.log('[seeder] Clearing existing data...');
      await database.execAsync('DELETE FROM journal_entries');
      await database.execAsync('DELETE FROM activities');
      await database.execAsync('DELETE FROM schedules');
      await database.execAsync('DELETE FROM addictions');
    }

    console.log('[seeder] Starting seed for Aug 1 - Sep 12, 2026...');

    const addictions = [
      "('addiction_gaming', 'Gaming', '🎮', '#6B5CE7')",
      "('addiction_smoking', 'Smoking', '🚬', '#8B8B8B')",
    ];

    await database.execAsync(`
      INSERT OR IGNORE INTO addictions (id, name, icon, color)
      VALUES ${addictions.join(',\n')};
    `);

    await seedAddictionData(database, 'addiction_gaming', {
      relapseDates: ['2026-08-07', '2026-08-19', '2026-08-31', '2026-09-08'],
      activities: [
        { name: 'Exercise', duration: 30 },
        { name: 'Reading', duration: 45 },
        { name: 'Nature Walk', duration: 60 },
        { name: 'Call a Friend', duration: 20 },
        { name: 'Journaling', duration: 15 },
      ],
      schedules: [
        { title: 'Morning Exercise', time: '07:00' },
        { title: 'Reading Time', time: '10:00' },
        { title: 'Evening Walk', time: '17:00' },
      ],
    });

    await seedAddictionData(database, 'addiction_smoking', {
      relapseDates: ['2026-08-12', '2026-08-28', '2026-09-05'],
      activities: [
        { name: 'Deep Breathing', duration: 10 },
        { name: 'Meditation', duration: 20 },
        { name: 'Chewing Gum', duration: 5 },
        { name: 'Walking', duration: 30 },
        { name: 'Drinking Water', duration: 5 },
      ],
      schedules: [
        { title: 'Morning Meditation', time: '06:30' },
        { title: 'Break Walk', time: '10:00' },
        { title: 'Deep Breathing', time: '14:00' },
        { title: 'Evening Exercise', time: '18:00' },
      ],
    });

    console.log('[seeder] Done! Seeded 2 addictions with data');

  } catch (error) {
    console.error('[seeder] Error:', error);
  }
}

async function seedAddictionData(
  database: SQLite.SQLiteDatabase,
  addictionId: string,
  config: {
    relapseDates: string[];
    activities: { name: string; duration: number }[];
    schedules: { title: string; time: string }[];
  }
) {
  const startDate = new Date('2026-08-01');
  const endDate = new Date('2026-09-12');
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const feelings = [
    'Feeling good today. Stayed busy with work.',
    'Had some cravings but managed to push through.',
    'Great day! Felt really strong.',
    'Struggled a bit today. Felt lonely.',
    'Productive day. Finished a project.',
    'Feeling grateful for another sober day.',
    'Tough day but I made it through.',
    'Meditated this morning. Set a good tone.',
    'Spent time with family. Reminded me why I am doing this.',
    'Feeling a bit down but staying positive.',
  ];

  const relapseNotes = [
    'Fell into old patterns. Need to refocus.',
    'Stress got to me. Will try harder next time.',
    'Social situation triggered cravings.',
    'Feeling disappointed but not giving up.',
    'Need to revisit my coping strategies.',
  ];

  const entries: string[] = [];

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    const isRelapse = config.relapseDates.includes(dateStr);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

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
    const feeling = isRelapse ? relapseNotes[feelingIdx] : feelings[feelingIdx];

    entries.push(
      `('entry_${addictionId}_${dateStr}', '${addictionId}', '${dateStr}', ${mood}, '${feeling.replace(/'/g, "''")}', ${isRelapse ? 1 : 0}, '${isRelapse ? relapseNotes[Math.floor(Math.random() * relapseNotes.length)].replace(/'/g, "''") : ''}', datetime('now'), datetime('now'))`
    );
  }

  await database.execAsync(`
    INSERT OR IGNORE INTO journal_entries (id, addiction_id, date, mood, feelings, is_relapse, relapse_notes, created_at, updated_at)
    VALUES ${entries.join(',\n')};
  `);

  const activities = config.activities.map((a, i) =>
    `('act_${addictionId}_${i}', '${addictionId}', '${a.name}', ${a.duration}, '', datetime('now'))`
  );

  await database.execAsync(`
    INSERT OR IGNORE INTO activities (id, addiction_id, name, duration_minutes, notes, created_at)
    VALUES ${activities.join(',\n')};
  `);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const schedules = config.schedules.map((s, i) => {
    const schedDate = new Date(today);
    schedDate.setDate(schedDate.getDate() + i);
    const dateStr = schedDate.toISOString().split('T')[0];
    return `('sched_${addictionId}_${i}', '${addictionId}', '${s.title}', '', '${dateStr}', '${s.time}', 1, datetime('now'))`;
  });

  await database.execAsync(`
    INSERT OR IGNORE INTO schedules (id, addiction_id, title, description, date, time, is_active, created_at)
    VALUES ${schedules.join(',\n')};
  `);

  console.log(`[seeder] Seeded ${entries.length} entries for ${addictionId}`);
}

export async function forceReseed(database: SQLite.SQLiteDatabase) {
  console.log('[seeder] Force reseeding...');
  await database.execAsync('DELETE FROM journal_entries');
  await database.execAsync('DELETE FROM activities');
  await database.execAsync('DELETE FROM schedules');
  await database.execAsync('DELETE FROM addictions');
  await seedTestData(database);
}
