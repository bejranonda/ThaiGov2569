import {
    Users,
    Briefcase,
    Send,
    ShieldAlert,
    Trophy
} from 'lucide-react';

export const PARTIES = [
    {
        id: 'PTP', name: 'เพื่อไทย', seats: 141, color: 'bg-red-600', text: 'text-red-600', policies: {
            finance: 'เราจะดัน Digital Wallet และ GDP โต 5% ทันทีครับ',
            defense: 'ปฏิรูปกองทัพแบบค่อยเป็นค่อยไป เน้นทหารอาสา',
            transport: 'รถไฟฟ้า 20 บาทตลอดสาย ทำได้จริงแน่นอน',
            general: 'เราเน้นปากท้องและเศรษฐกิจเป็นหลักครับ'
        }
    },
    {
        id: 'PP', name: 'ประชาชน', seats: 151, color: 'bg-orange-500', text: 'text-orange-500', policies: {
            finance: 'ทลายทุนผูกขาด และทำงบประมาณฐานศูนย์ (Zero-based)',
            defense: 'ยกเลิกเกณฑ์ทหาร 100% และลดนายพล',
            interior: 'กระจายอำนาจ เลือกตั้งผู้ว่าฯ ทั่วประเทศ',
            general: 'เราจะเปลี่ยนโครงสร้างประเทศให้เท่าเทียม'
        }
    },
    {
        id: 'BJT', name: 'ภูมิใจไทย', seats: 71, color: 'bg-blue-700', text: 'text-blue-700', policies: {
            interior: 'แก้ระเบียบมหาดไทย ให้ชาวบ้านทำกินสะดวก',
            health: 'ฟอกไตฟรีทุกอำเภอ เครื่องฉายแสงทุกจังหวัด',
            energy: 'ฟรีโซล่าเซลล์ ลดค่าไฟทันที',
            general: 'พูดแล้วทำครับ เน้นแก้ปัญหาปากท้องทันที'
        }
    },
    {
        id: 'PPRP', name: 'พลังประชารัฐ', seats: 40, color: 'bg-blue-600', text: 'text-blue-600', policies: {
            finance: 'บัตรประชารัฐ 700 บาท บวกเบี้ยคนชรา',
            interior: 'มีเราไม่มีแล้ง บริหารจัดการน้ำชุมชน',
            general: 'ก้าวข้ามความขัดแย้ง ดูแลกลุ่มเปราะบาง'
        }
    },
    {
        id: 'UTN', name: 'รทสช.', seats: 36, color: 'bg-blue-800', text: 'text-blue-800', policies: {
            energy: 'รื้อโครงสร้างพลังงาน ค่าไฟต้องถูกลง',
            defense: 'ปกป้องสถาบันฯ และความมั่นคงชายแดน',
            general: 'ทำแล้ว ทำอยู่ ทำต่อ เน้นความสงบ'
        }
    },
    {
        id: 'DEM', name: 'ประชาธิปัตย์', seats: 25, color: 'bg-cyan-500', text: 'text-cyan-500', policies: {
            finance: 'ประกันรายได้เกษตรกร และธนาคารหมู่บ้าน',
            education: 'เรียนฟรี มีงานทำ สร้างคนรุ่นใหม่',
            general: 'ประชาธิปไตยสุจริต แก้ปัญหาอย่างยั่งยืน'
        }
    },
    {
        id: 'CTP', name: 'ชาติไทยพัฒนา', seats: 10, color: 'bg-pink-500', text: 'text-pink-500', policies: {
            environment: 'Green Economy ขายคาร์บอนเครดิต',
            general: 'รับฟัง ทำจริง ไม่ขัดแย้งกับใคร'
        }
    },
    {
        id: 'PCC', name: 'ประชาชาติ', seats: 9, color: 'bg-amber-700', text: 'text-amber-700', policies: {
            justice: 'ล้างหนี้ กยศ. และคืนความยุติธรรม',
            interior: 'สันติภาพชายแดนใต้ พหุวัฒนธรรม',
            general: 'สร้างความเป็นธรรม ลดความเหลื่อมล้ำ'
        }
    },
    {
        id: 'TKM', name: 'ไทยก้าวใหม่', seats: 5, color: 'bg-cyan-400', text: 'text-cyan-400', policies: {
            education: 'ธนู 4 ดอก ปฏิรูปการศึกษาจบไว',
            tech: 'ปราบสแกมเมอร์ และใช้ AI บริหารประเทศ',
            general: 'ใช้เทคโนโลยีสร้างคน สร้างชาติ'
        }
    },
    {
        id: 'OKM', name: 'โอกาสใหม่', seats: 3, color: 'bg-emerald-500', text: 'text-emerald-500', policies: {
            finance: 'อัดฉีดงบ 5 แสนล้านเข้าระบบทันที',
            general: 'สร้างโอกาสใหม่ให้คนไทยทุกคน'
        }
    }
];

export const MINISTRIES = [
    { id: 'PM', name: 'นายกรัฐมนตรี (PM)', icon: Trophy, key: 'general' },
    { id: 'MOF', name: 'กระทรวงการคลัง', icon: Briefcase, key: 'finance' },
    { id: 'MOI', name: 'กระทรวงมหาดไทย', icon: Users, key: 'interior' },
    { id: 'MOD', name: 'กระทรวงกลาโหม', icon: ShieldAlert, key: 'defense' },
    { id: 'MOT', name: 'กระทรวงคมนาคม', icon: Send, key: 'transport' },
    { id: 'MOE', name: 'กระทรวงศึกษา/อว.', icon: Users, key: 'education' },
    { id: 'MOPH', name: 'กระทรวงสาธารณสุข', icon: Users, key: 'health' },
    { id: 'MOEN', name: 'กระทรวงพลังงาน', icon: Users, key: 'energy' },
];

export const TOTAL_SEATS = 500;
export const MAJORITY_THRESHOLD = 250;
