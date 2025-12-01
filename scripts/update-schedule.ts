// Script to update schedule with new events
// Run this with: npx ts-node scripts/update-schedule.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const newSchedule = [
  {
    title: 'Старт навчання',
    type: 'platform_opening',
    date: '2025-12-01',
    description: 'Розклад у каналі передзапуску',
  },
  {
    title: 'Прямий ефір від ректора',
    type: 'live_stream',
    date: '2025-12-02',
    time: '20:00',
    timeEurope: '19:00',
    description: 'Тема: «Як отримати максимум від навчання?»',
    speaker: 'Ректор',
  },
  {
    title: 'Відкриття навчальної платформи та першого модуля',
    type: 'module_opening',
    date: '2025-12-03',
    description: 'Відкриття навчальної платформи\nВідкриття уроків 1 модуля',
  },
  {
    title: 'Zoom-зустріч з Олегом Лобановим',
    type: 'zoom_meeting',
    date: '2025-12-03',
    time: '20:00',
    timeEurope: '19:00',
    description: 'Тема: Розбори в прямому ефірі',
    speaker: 'Олег Лобанов',
  },
  {
    title: 'Формування Telegram-чатів',
    type: 'group_meeting',
    date: '2025-12-05',
    description: 'Надсилаємо посилання на чати з кураторами в особисті повідомлення\nЗавдання на знайомство в чаті',
    notes: 'До 7 грудня',
  },
  {
    title: 'Онлайн-урок від ректора',
    type: 'live_stream',
    date: '2025-12-08',
    time: '20:00',
    timeEurope: '19:00',
    description: 'Тема: «Формула запуску для швидкого старту»',
    speaker: 'Ректор',
  },
];

async function updateSchedule() {
  try {
    console.log('🔄 Starting schedule update...');
    
    // Get token from command line argument
    const token = process.argv[2];
    if (!token) {
      console.error('❌ Please provide admin token as argument');
      console.log('Usage: npx ts-node scripts/update-schedule.ts <YOUR_ADMIN_TOKEN>');
      process.exit(1);
    }

    // 1. Get all existing events
    console.log('📥 Fetching existing events...');
    const response = await fetch(`${API_URL}/schedule`);
    const result = await response.json();
    const existingEvents = result.data;
    console.log(`Found ${existingEvents.length} existing events`);

    // 2. Delete all existing events
    console.log('🗑️  Deleting old events...');
    for (const event of existingEvents) {
      await fetch(`${API_URL}/admin/schedule/${event._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log(`  ✓ Deleted: ${event.title}`);
    }

    // 3. Create new events
    console.log('➕ Creating new events...');
    for (const event of newSchedule) {
      const response = await fetch(`${API_URL}/admin/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(event),
      });

      if (response.ok) {
        console.log(`  ✓ Created: ${event.title}`);
      } else {
        const error = await response.json();
        console.error(`  ❌ Failed to create: ${event.title}`, error);
      }
    }

    console.log('✅ Schedule update completed!');
  } catch (error) {
    console.error('❌ Error updating schedule:', error);
    process.exit(1);
  }
}

updateSchedule();
