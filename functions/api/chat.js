import { PARTIES, MINISTRIES } from '../../src/data';

// Since this runs in Worker environment, we might need to duplicate data or import it carefully.
// To avoid compilation issues with imports in standard Workers, we'll redefine minimized data here 
// or ensure the build process includes shared files. For simplicity in Pages Functions, 
// we'll rely on the logic finding the right context from the payload mainly, 
// but we'll include the Parties map here for coloring/context.

const PARTIES_MAP = {
    'PTP': { name: 'เพื่อไทย', color: 'bg-red-600' },
    'PP': { name: 'ประชาชน', color: 'bg-orange-500' },
    'BJT': { name: 'ภูมิใจไทย', color: 'bg-blue-700' },
    'PPRP': { name: 'พลังประชารัฐ', color: 'bg-blue-600' },
    'UTN': { name: 'รทสช.', color: 'bg-blue-800' },
    'DEM': { name: 'ประชาธิปัตย์', color: 'bg-cyan-500' },
    'CTP': { name: 'ชาติไทยพัฒนา', color: 'bg-pink-500' },
    'PCC': { name: 'ประชาชาติ', color: 'bg-amber-700' },
    'TKM': { name: 'ไทยก้าวใหม่', color: 'bg-cyan-400' },
    'OKM': { name: 'โอกาสใหม่', color: 'bg-emerald-500' }
};

const MINISTRIES_MAP = {
    'PM': 'นายกรัฐมนตรี',
    'MOF': 'กระทรวงการคลัง',
    'MOI': 'กระทรวงมหาดไทย',
    'MOD': 'กระทรวงกลาโหม',
    'MOT': 'กระทรวงคมนาคม',
    'MOE': 'กระทรวงศึกษา/อว.',
    'MOPH': 'กระทรวงสาธารณสุข',
    'MOEN': 'กระทรวงพลังงาน'
}

export async function onRequestPost({ request, env }) {
    try {
        const { message, cabinet, coalition, policies } = await request.json();

        // 1. Context Analysis (Which Ministry should answer?)
        // This logic mimics the frontend logic but executed here or by LLM.
        // Let's use LLM to decide who answers if possible, or use the keyword heuristic as a fallback/guide.
        // For free-tier AI, we can use @cf/meta/llama-3-8b-instruct or similar.

        const keywords = {
            'เงิน': 'MOF', 'เศรษฐกิจ': 'MOF', 'แจก': 'MOF', 'หนี้': 'MOF', 'คลัง': 'MOF',
            'ทหาร': 'MOD', 'กองทัพ': 'MOD', 'รบ': 'MOD', 'เกณฑ์': 'MOD', 'อาวุธ': 'MOD',
            'ตำรวจ': 'MOI', 'ผู้ว่า': 'MOI', 'น้ำท่วม': 'MOI', 'ยาเสพติด': 'MOI',
            'รถ': 'MOT', 'รถไฟฟ้า': 'MOT', 'ถนน': 'MOT',
            'เรียน': 'MOE', 'ครู': 'MOE', 'โรงเรียน': 'MOE',
            'หมอ': 'MOPH', 'พยาบาล': 'MOPH', 'ป่วย': 'MOPH', 'ยา': 'MOPH',
            'ไฟ': 'MOEN', 'น้ำมัน': 'MOEN', 'แก๊ส': 'MOEN'
        };

        let targetMinistry = 'PM';
        for (const [key, minId] of Object.entries(keywords)) {
            if (message.includes(key)) {
                targetMinistry = minId;
                break;
            }
        }

        const partyId = cabinet[targetMinistry] || cabinet['PM'];
        const party = PARTIES_MAP[partyId];
        const ministryName = MINISTRIES_MAP[targetMinistry];

        // 2. Generate Prompt
        const systemPrompt = `
    คุณคือรัฐมนตรีว่าการ ${ministryName} จากพรรค ${party.name} ในรัฐบาลผสม
    
    บุคลิกและนโยบายของพรรค:
    ${partyId === 'PTP' ? 'เน้นเศรษฐกิจปากท้อง Digital Wallet พูดจานุ่มนวลแต่จริงจัง' : ''}
    ${partyId === 'PP' ? 'เน้นแก้โครงสร้าง ทลายทุนผูกขาด ชนชั้นนำ พูดจาฉะฉาน ตรงไปตรงมา' : ''}
    ${partyId === 'BJT' ? 'เน้นเรื่องทำกิน ปลดล็อคกฎระเบียบ พูดแล้วทำ' : ''}
    ${partyId === 'UTN' ? 'เน้นความสงบ ทำมาหากิน ปกป้องสถาบันหลัก' : ''}
    
    นโยบายหลักที่รัฐบาลชุดนี้ยึดถือ (อ้างอิง):
    ${policies ? policies.map(p => `- ${p.title}: ${p.desc}`).join('\n    ') : '- ไม่มีข้อมูลนโยบายพิเศษ'}
    
    หน้าที่ของคุณ: ตอบคำถามประชาชนเรื่อง "${message}" ตามแนวนโยบายของพรรคคุณ และเชื่อมโยงกับนโยบายหลักของรัฐบาลข้างต้นหากเกี่ยวข้อง
    ตอบสั้นๆ กระชับ ไม่เกิน 2 ประโยค ให้ดูเป็นการตอบในสภาหรือแถลงข่าว
    `;

        let responseText = "";

        // Check if AI binding is available
        if (env.AI) {
            const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ]
            });
            responseText = response.response;
        } else {
            responseText = `(Mock Response) นโยบายของเราคือการดูแลประชาชนอย่างเต็มที่ครับ (${party.name} รับเรื่อง)`;
        }

        return new Response(JSON.stringify({
            responder: `${ministryName} (${party.name})`,
            text: responseText,
            partyColor: party.color
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
