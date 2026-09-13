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

    await seedGamingData(database);
    console.log('[seeder] Gaming data seeded, now seeding Smoking...');

    await seedSmokingData(database);
    console.log('[seeder] Smoking data seeded');

    // Verify
    const smokingEntries = await database.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM journal_entries WHERE addiction_id = 'addiction_smoking'"
    );
    console.log(`[seeder] Smoking entries in DB: ${smokingEntries?.count || 0}`);

    console.log('[seeder] Done! Seeded Gaming and Smoking addictions');

  } catch (error) {
    console.error('[seeder] Error:', error);
  }
}

async function seedGamingData(database: SQLite.SQLiteDatabase) {
  const addictionId = 'addiction_gaming';

  const startDate = new Date('2026-08-01');
  const endDate = new Date('2026-09-12');
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const feelings = [
    'Spent the day working on a project. Focused and productive.',
    'Went to the gym. Physical activity helps resist the urge.',
    'Read a book today. Found a new hobby to replace gaming.',
    'Had a good conversation with a friend about my goals.',
    'Feeling bored but resisting the urge to game.',
    'Completed my to-do list. Feeling accomplished.',
    'Went for a walk instead of gaming. Fresh air helped.',
    'Tried cooking a new recipe. Keeping my hands busy.',
    'Meditated for 15 minutes. Mind feels clearer.',
    'Played guitar instead of video games. Enjoying music.',
    'Went to the library. Found some great books.',
    'Cleaned my room. Organized space, organized mind.',
    'Had a productive day at work. No gaming urges.',
    'Feeling proud of myself for staying strong.',
    'One day at a time. Today was a win.',
    'Cravings were strong but I pushed through.',
    'Spent time learning something new online.',
    'Went for a run. Exercise really helps.',
    'Feeling grateful for another gaming-free day.',
    'Socialized with friends in person instead of online.',
  ];

  const relapseNotes = [
    'Gamed for 6 hours. Lost track of time completely.',
    'Started with "just one game" and couldn\'t stop.',
    'Stressed about work and escaped into gaming.',
    'Friends invited me to play. Couldn\'t say no.',
    'Felt lonely and turned to gaming for comfort.',
    'Bought a new game. Couldn\'t resist the urge.',
    'Stayed up all night gaming. Feel terrible today.',
  ];

  const entries: string[] = [];
  const relapseDates = ['2026-08-05', '2026-08-14', '2026-08-23', '2026-09-02', '2026-09-10'];

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const isRelapse = relapseDates.includes(dateStr);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let mood: number;
    if (isRelapse) {
      mood = Math.random() < 0.7 ? 1 : 2;
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

  const activities = [
    `('act_${addictionId}_0', '${addictionId}', 'Gym Workout', 45, 'Replaced gaming time with exercise', datetime('now'))`,
    `('act_${addictionId}_1', '${addictionId}', 'Reading', 30, 'Reading a book about breaking habits', datetime('now'))`,
    `('act_${addictionId}_2', '${addictionId}', 'Guitar Practice', 40, 'Learning to play songs I enjoy', datetime('now'))`,
    `('act_${addictionId}_3', '${addictionId}', 'Nature Walk', 60, 'Walking in the park instead of gaming', datetime('now'))`,
    `('act_${addictionId}_4', '${addictionId}', 'Cooking', 30, 'Trying new recipes to stay busy', datetime('now'))`,
  ];

  await database.execAsync(`
    INSERT OR IGNORE INTO activities (id, addiction_id, name, duration_minutes, notes, created_at)
    VALUES ${activities.join(',\n')};
  `);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const schedules = [
    { title: 'Morning Gym Session', time: '07:00', offset: 0 },
    { title: 'Guitar Practice', time: '14:00', offset: 1 },
    { title: 'Evening Walk', time: '18:00', offset: 2 },
    { title: 'Reading Hour', time: '20:00', offset: 3 },
  ];

  const schedEntries = schedules.map(s => {
    const d = new Date(today);
    d.setDate(d.getDate() + s.offset);
    const dateStr = d.toISOString().split('T')[0];
    return `('sched_${addictionId}_${s.offset}', '${addictionId}', '${s.title}', '', '${dateStr}', '${s.time}', 1, datetime('now'))`;
  });

  await database.execAsync(`
    INSERT OR IGNORE INTO schedules (id, addiction_id, title, description, date, time, is_active, created_at)
    VALUES ${schedEntries.join(',\n')};
  `);

  console.log(`[seeder] Gaming: ${entries.length} entries, 5 activities, 4 schedules`);
}

async function seedSmokingData(database: SQLite.SQLiteDatabase) {
  const addictionId = 'addiction_smoking';

  const startDate = new Date('2026-08-01');
  const endDate = new Date('2026-09-12');
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const feelings = [
    'Breathing feels easier today. Lungs are healing.',
    'Did deep breathing exercises when cravings hit.',
    'Walked past the store without buying cigarettes.',
    'Chewing gum helped with the oral fixation.',
    'Drank water instead of smoking. Staying hydrated.',
    'Feeling proud. Another smoke-free day.',
    'Cravings were intense but I used my coping strategies.',
    'Went for a run. Lungs are getting stronger.',
    'Meditated to manage stress without smoking.',
    'Smell of smoke still triggers me but I resisted.',
    'Day 10 smoke-free. Starting to feel the benefits.',
    'Had coffee without a cigarette. New routine.',
    'Used the patch today. Managing withdrawal.',
    'Feeling more energetic without smoking.',
    'Cooked instead of smoking. Healthy distraction.',
    'Went to a support group. Not alone in this.',
    'Cravings hit hard after a meal but I pushed through.',
    'Running is getting easier. Lungs are healing.',
    'Feeling confident in my ability to quit.',
    'One more day smoke-free. Progress!',
  ];

  const relapseNotes = [
    'Had one cigarette after a stressful meeting.',
    'Smoked when out with friends who smoke.',
    'Bought a pack "for emergencies". Now smoking again.',
    'Stress was too much. Relapsed after 5 days.',
    'Social pressure got to me. Smoked at a party.',
    'Thought "just one" but ended up smoking all day.',
    'Coffee shop trigger. Smoked outside.',
  ];

  const entries: string[] = [];
  const relapseDates = ['2026-08-09', '2026-08-21', '2026-09-03'];

  for (let i = 0; i < totalDays; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const isRelapse = relapseDates.includes(dateStr);
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

  const activities = [
    `('act_${addictionId}_0', '${addictionId}', 'Deep Breathing', 10, '4-7-8 breathing technique when cravings hit', datetime('now'))`,
    `('act_${addictionId}_1', '${addictionId}', 'Morning Run', 30, 'Cardio helps reduce cravings', datetime('now'))`,
    `('act_${addictionId}_2', '${addictionId}', 'Chewing Gum', 5, 'Sugar-free gum for oral fixation', datetime('now'))`,
    `('act_${addictionId}_3', '${addictionId}', 'Meditation', 15, 'Mindfulness to manage stress', datetime('now'))`,
    `('act_${addictionId}_4', '${addictionId}', 'Hydration', 5, 'Drinking water when cravings hit', datetime('now'))`,
  ];

  await database.execAsync(`
    INSERT OR IGNORE INTO activities (id, addiction_id, name, duration_minutes, notes, created_at)
    VALUES ${activities.join(',\n')};
  `);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const schedules = [
    { title: 'Morning Run', time: '06:30', offset: 0 },
    { title: 'Deep Breathing Break', time: '10:00', offset: 1 },
    { title: 'Afternoon Walk', time: '14:00', offset: 2 },
    { title: 'Evening Meditation', time: '19:00', offset: 3 },
  ];

  const schedEntries = schedules.map(s => {
    const d = new Date(today);
    d.setDate(d.getDate() + s.offset);
    const dateStr = d.toISOString().split('T')[0];
    return `('sched_${addictionId}_${s.offset}', '${addictionId}', '${s.title}', '', '${dateStr}', '${s.time}', 1, datetime('now'))`;
  });

  await database.execAsync(`
    INSERT OR IGNORE INTO schedules (id, addiction_id, title, description, date, time, is_active, created_at)
    VALUES ${schedEntries.join(',\n')};
  `);

  console.log(`[seeder] Smoking: ${entries.length} entries, 5 activities, 4 schedules`);
}

export async function forceReseed(database: SQLite.SQLiteDatabase) {
  console.log('[seeder] Force reseeding...');
  await database.execAsync('DELETE FROM journal_entries');
  await database.execAsync('DELETE FROM activities');
  await database.execAsync('DELETE FROM schedules');
  await database.execAsync('DELETE FROM addictions');
  await seedTestData(database);
}
