import {
    Users,
    Briefcase,
    Send,
    ShieldAlert,
    Trophy,
    Wheat,
    Scale,
    Globe,
    TreePine,
    Laptop,
    ShoppingCart,
    Heart,
} from 'lucide-react';

export const PARTIES = [
    {
        id: 'PP', name: 'ประชาชน', seats: 170, color: 'bg-orange-500', text: 'text-orange-500', policies: {
            finance: 'ทลายทุนผูกขาด และทำงบประมาณฐานศูนย์ (Zero-based)',
            defense: 'ยกเลิกเกณฑ์ทหาร 100% และลดนายพล',
            interior: 'กระจายอำนาจ เลือกตั้งผู้ว่าฯ ทั่วประเทศ',
            foreign: 'การทูตเชิงคุณค่า นำไทยกลับสู่เวทีโลก',
            environment: 'กำหนดเพดานก๊าซเรือนกระจก รถเมล์ไฟฟ้าทั่วประเทศ',
            commerce: 'เปิดเสรีสุรา ทลายผูกขาด ลดค่าครองชีพ',
            general: 'เราจะเปลี่ยนโครงสร้างประเทศให้เท่าเทียม'
        }
    },
    {
        id: 'BJT', name: 'ภูมิใจไทย', seats: 111, color: 'bg-blue-700', text: 'text-blue-700', policies: {
            interior: 'แก้ระเบียบมหาดไทย ให้ชาวบ้านทำกินสะดวก',
            health: 'ฟอกไตฟรีทุกอำเภอ เครื่องฉายแสงทุกจังหวัด',
            energy: 'ฟรีโซล่าเซลล์ ลดค่าไฟทันที',
            agriculture: 'กัญชาเพื่อสุขภาพ สร้างรายได้เกษตรกร',
            commerce: 'Wellness Tourism ดึงดูดนักท่องเที่ยวสุขภาพ',
            general: 'พูดแล้วทำครับ เน้นแก้ปัญหาปากท้องทันที'
        }
    },
    {
        id: 'PTP', name: 'เพื่อไทย', seats: 84, color: 'bg-red-600', text: 'text-red-600', policies: {
            finance: 'เราจะดัน Digital Wallet และ GDP โต 5% ทันทีครับ',
            defense: 'ปฏิรูปกองทัพแบบค่อยเป็นค่อยไป เน้นทหารอาสา',
            transport: 'รถไฟฟ้า 20 บาทตลอดสาย ทำได้จริงแน่นอน',
            digital: 'Digital Wallet + Blockchain Government โปร่งใส',
            agriculture: 'ประกันกำไรเกษตรกร 30% ของต้นทุนการผลิต',
            foreign: 'วีซ่าฟรีทั่วโลก ส่งเสริมการท่องเที่ยวและธุรกิจ',
            environment: 'พ.ร.บ.อากาศสะอาด และ Net Zero 2050',
            general: 'เราเน้นปากท้องและเศรษฐกิจเป็นหลักครับ'
        }
    },
    {
        id: 'DEM', name: 'ประชาธิปัตย์', seats: 61, color: 'bg-cyan-500', text: 'text-cyan-500', policies: {
            finance: 'ประกันรายได้เกษตรกร และธนาคารหมู่บ้าน',
            education: 'เรียนฟรี มีงานทำ สร้างคนรุ่นใหม่',
            agriculture: 'ประกันรายได้เกษตรกรยุคดิจิทัล จ่ายส่วนต่างตรง',
            foreign: 'ปิดดีล FTA ยุโรปและตะวันออกกลางใน 1 ปี',
            commerce: 'SME แต้มต่อ เข้าถึงสินเชื่อและจัดซื้อภาครัฐ',
            environment: 'ผลักดัน พ.ร.บ.อากาศสะอาด ฉบับประชาชน',
            general: 'ประชาธิปไตยสุจริต แก้ปัญหาอย่างยั่งยืน'
        }
    },
    {
        id: 'SET', name: 'เศรษฐกิจ', seats: 19, color: 'bg-yellow-600', text: 'text-yellow-600', policies: {
            finance: 'พัฒนาเศรษฐกิจฐานรากด้วยนโยบายเชิงโครงสร้าง',
            commerce: 'ส่งเสริมการลงทุน SME ลดกฎระเบียบ',
            general: 'เศรษฐกิจดี ประชาชนอยู่ดีกินดี'
        }
    },
    {
        id: 'UTN', name: 'รวมไทยสร้างชาติ', seats: 10, color: 'bg-blue-800', text: 'text-blue-800', policies: {
            energy: 'รื้อโครงสร้างพลังงาน ค่าไฟต้องถูกลง',
            defense: 'ปกป้องสถาบันฯ และความมั่นคงชายแดน',
            justice: 'เพิ่มโทษประหารชีวิตคนโกง แก้กฎหมายล้าหลัง',
            environment: 'กฎหมายโซลาร์เสรี ผลิตไฟฟ้าขายเข้าระบบ',
            general: 'ทำแล้ว ทำอยู่ ทำต่อ เน้นความสงบ'
        }
    },
    {
        id: 'TST', name: 'ไทยสร้างไทย', seats: 9, color: 'bg-rose-500', text: 'text-rose-500', policies: {
            finance: 'กองทุน SME 3 แสนล้าน ดอกเบี้ยต่ำ',
            education: 'จบ ป.ตรี อายุ 18 และเรียนฟรีจริง',
            commerce: 'กองทุน SME ดอกเบี้ยต่ำ ลดขั้นตอนราชการ',
            foreign: 'ครัวไทยสู่ครัวโลก Soft Power อาหารไทย',
            general: 'สร้างโอกาสใหม่ให้คนไทยทุกคน'
        }
    },
    {
        id: 'PCC', name: 'ประชาชาติ', seats: 7, color: 'bg-amber-700', text: 'text-amber-700', policies: {
            justice: 'ล้างหนี้ กยศ. และคืนความยุติธรรม',
            interior: 'สันติภาพชายแดนใต้ พหุวัฒนธรรม',
            commerce: 'Halal Hub World ศูนย์กลางอาหารฮาลาลโลก',
            general: 'สร้างความเป็นธรรม ลดความเหลื่อมล้ำ'
        }
    },
    {
        id: 'PPRP', name: 'พลังประชารัฐ', seats: 6, color: 'bg-blue-600', text: 'text-blue-600', policies: {
            finance: 'บัตรประชารัฐ 700 บาท บวกเบี้ยคนชรา',
            interior: 'มีเราไม่มีแล้ง บริหารจัดการน้ำชุมชน',
            agriculture: 'ที่ดินทำกินมั่นคง เปลี่ยน ส.ป.ก. เป็นโฉนด',
            justice: 'กวาดล้างทุนสีเทา ปราบมาเฟียข้ามชาติ',
            general: 'ก้าวข้ามความขัดแย้ง ดูแลกลุ่มเปราะบาง'
        }
    },
    {
        id: 'SRT', name: 'เสรีรวมไทย', seats: 5, color: 'bg-indigo-600', text: 'text-indigo-600', policies: {
            defense: 'ปฏิรูปกองทัพอย่างจริงจัง ยกเลิกเกณฑ์ทหาร',
            justice: 'ปราบคอร์รัปชันเด็ดขาด ยึดทรัพย์ถาวร',
            general: 'เสรีภาพ ความยุติธรรม ปราบคอร์รัปชัน'
        }
    },
    {
        id: 'OTH', name: 'พรรคเล็กอื่นๆ', seats: 18, color: 'bg-gray-500', text: 'text-gray-500', policies: {
            digital: 'AI ในห้องเรียน วิเคราะห์พัฒนาการเด็กรายบุคคล',
            environment: 'Carbon Credit Hub ศูนย์กลางคาร์บอนอาเซียน',
            general: 'พรรคขนาดเล็กรวมกัน มีความหลากหลายของนโยบาย'
        }
    },
];

export const MINISTRIES = [
    { id: 'PM', name: 'นายกรัฐมนตรี (PM)', icon: Trophy, key: 'general' },
    { id: 'MOF', name: 'กระทรวงการคลัง', icon: Briefcase, key: 'finance' },
    { id: 'MOI', name: 'กระทรวงมหาดไทย', icon: Users, key: 'interior' },
    { id: 'MOD', name: 'กระทรวงกลาโหม', icon: ShieldAlert, key: 'defense' },
    { id: 'MOT', name: 'กระทรวงคมนาคม', icon: Send, key: 'transport' },
    { id: 'MOE', name: 'กระทรวงศึกษา/อว.', icon: Users, key: 'education' },
    { id: 'MOPH', name: 'กระทรวงสาธารณสุข', icon: Heart, key: 'health' },
    { id: 'MOEN', name: 'กระทรวงพลังงาน', icon: Users, key: 'energy' },
    { id: 'MOAG', name: 'กระทรวงเกษตรฯ', icon: Wheat, key: 'agriculture' },
    { id: 'MOJ', name: 'กระทรวงยุติธรรม', icon: Scale, key: 'justice' },
    { id: 'MFA', name: 'กระทรวงการต่างประเทศ', icon: Globe, key: 'foreign' },
    { id: 'MONRE', name: 'กระทรวงทรัพยากรฯ/สิ่งแวดล้อม', icon: TreePine, key: 'environment' },
    { id: 'MDES', name: 'กระทรวงดิจิทัลฯ', icon: Laptop, key: 'digital' },
    { id: 'MOC', name: 'กระทรวงพาณิชย์', icon: ShoppingCart, key: 'commerce' },
];

export const TOTAL_SEATS = 500;
export const MAJORITY_THRESHOLD = 250;
