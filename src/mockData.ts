import { Trip } from './types';

export const INITIAL_MOCK_TRIP: Trip = {
  id: 'trip-chiangmai-2026',
  title: 'ทริปเชียงใหม่ - ม่อนแจ่ม 3 วัน 2 คืน',
  dates: '24 - 26 ต.ค. 2026',
  location: 'เชียงใหม่',
  currency: '฿',
  members: [
    {
      id: 'm1',
      name: 'แบงค์',
      nickname: 'Bank',
      avatarColor: 'bg-indigo-600',
      promptpay: '081-234-5678',
      bankName: 'กสิกรไทย',
      bankAccount: '123-2-45678-9',
    },
    {
      id: 'm2',
      name: 'พลอย',
      nickname: 'Ploy',
      avatarColor: 'bg-rose-500',
      promptpay: '089-876-5432',
      bankName: 'ไทยพาณิชย์',
      bankAccount: '405-1-89765-4',
    },
    {
      id: 'm3',
      name: 'นนท์',
      nickname: 'Nont',
      avatarColor: 'bg-emerald-600',
      promptpay: '086-555-4321',
      bankName: 'กรุงเทพ',
      bankAccount: '054-7-12345-6',
    },
    {
      id: 'm4',
      name: 'มายด์',
      nickname: 'Mild',
      avatarColor: 'bg-amber-500',
      promptpay: '082-999-1234',
      bankName: 'กรุงไทย',
      bankAccount: '987-0-54321-0',
    },
    {
      id: 'm5',
      name: 'ตั้ม',
      nickname: 'Tum',
      avatarColor: 'bg-sky-600',
      promptpay: '090-333-7890',
      bankName: 'ttb (ทีทีบี)',
      bankAccount: '333-2-99887-1',
    },
  ],
  expenses: [
    {
      id: 'exp-1',
      title: 'ค่าที่พัก พูลวิลล่าแม่ริม (2 คืน)',
      amount: 8500,
      category: 'stay',
      date: '2026-10-24',
      payerId: 'm1', // แบงค์
      splitType: 'equal_all',
      participantIds: ['m1', 'm2', 'm3', 'm4', 'm5'],
      notes: 'จองผ่านแอป รวมอาหารเช้าทั้ง 5 คน',
    },
    {
      id: 'exp-2',
      title: 'ค่าน้ำมันรถตู้ไป-กลับและขึ้นดอย',
      amount: 2400,
      category: 'transport',
      date: '2026-10-24',
      payerId: 'm3', // นนท์
      splitType: 'equal_all',
      participantIds: ['m1', 'm2', 'm3', 'm4', 'm5'],
      notes: 'เติมน้ำมันเต็มถัง 2 รอบ',
    },
    {
      id: 'exp-3',
      title: 'มื้อค่ำ ชาบูสุกี้ช้างเผือก & ปิ้งย่าง',
      amount: 1950,
      category: 'food',
      date: '2026-10-24',
      payerId: 'm2', // พลอย
      splitType: 'equal_all',
      participantIds: ['m1', 'm2', 'm3', 'm4', 'm5'],
      notes: 'มื้อเย็นวันแรกหลังถึงที่พัก',
    },
    {
      id: 'exp-4',
      title: 'กาแฟ & ครัวซองต์ คาเฟ่วิวหมอก',
      amount: 580,
      category: 'cafe',
      date: '2026-10-25',
      payerId: 'm4', // มายด์
      splitType: 'equal_selected',
      participantIds: ['m1', 'm2', 'm4'], // แบงค์, พลอย, มายด์ (นนท์กับตั้มไม่ได้สั่ง)
      notes: 'นนท์กับตั้มเดินถ่ายรูปวิว ไม่ได้สั่งเครื่องดื่ม',
    },
    {
      id: 'exp-5',
      title: 'ค่าตั๋วสวนดอกไม้ & กิจกรรมเก็บส้ม',
      amount: 1120,
      category: 'activity',
      date: '2026-10-25',
      payerId: 'm1', // แบงค์
      splitType: 'exact_amounts',
      participantIds: ['m1', 'm2', 'm3', 'm4', 'm5'],
      customAmounts: {
        m1: 220, // ค่าบัตร 100 + ส้ม 120
        m2: 280, // ค่าบัตร 100 + ส้ม 180
        m3: 180, // ค่าบัตร 100 + ส้ม 80
        m4: 260, // ค่าบัตร 100 + ส้ม 160
        m5: 180, // ค่าบัตร 100 + ส้ม 80
      },
      notes: 'ตั๋วคนละ 100 + ค่าชั่งน้ำหนักส้มที่แต่ละคนเก็บกลับ',
    },
    {
      id: 'exp-6',
      title: 'หมูกระทะม่อนแจ่ม วิวรับลมหนาว',
      amount: 1600,
      category: 'food',
      date: '2026-10-25',
      payerId: 'm5', // ตั้ม
      splitType: 'equal_all',
      participantIds: ['m1', 'm2', 'm3', 'm4', 'm5'],
      notes: 'ชุดใหญ่ 3 ชุด + น้ำอัดลม',
    },
    {
      id: 'exp-7',
      title: 'ของฝากกาดหลวง (ไส้อั่ว & แคบหมู)',
      amount: 1200,
      category: 'shopping',
      date: '2026-10-26',
      payerId: 'm2', // พลอย
      splitType: 'equal_selected',
      participantIds: ['m1', 'm2', 'm3', 'm4'], // 4 คน (ตั้มไม่เอาของฝาก)
      notes: 'หาร 4 คน คนละ 300 บ. (ตั้มไม่ได้รับส่วนแบ่ง)',
    },
  ],
  updatedAt: new Date().toISOString(),
};
