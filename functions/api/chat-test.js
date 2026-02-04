// Test endpoint - OpenRouter only
// This endpoint skips Cloudflare AI and uses only OpenRouter for testing

const PARTIES = [
    { id: 'PTP', name: 'เพื่อไทย', seats: 141, color: 'bg-red-600' },
    { id: 'PP', name: 'ประชาชน', seats: 151, color: 'bg-orange-500' },
    { id: 'BJT', name: 'ภูมิใจไทย', seats: 71, color: 'bg-blue-700' },
    { id: 'PPRP', name: 'พลังประชารัฐ', seats: 40, color: 'bg-blue-600' },
    { id: 'UTN', name: 'รทสช.', seats: 36, color: 'bg-blue-800' },
    { id: 'DEM', name: 'ประชาธิปัตย์', seats: 25, color: 'bg-cyan-500' },
    { id: 'CTP', name: 'ชาติไทยพัฒนา', seats: 10, color: 'bg-pink-500' },
    { id: 'PCC', name: 'ประชาชาติ', seats: 9, color: 'bg-amber-700' },
    { id: 'TKM', name: 'ไทยก้าวใหม่', seats: 5, color: 'bg-cyan-400' },
    { id: 'OKM', name: 'โอกาสใหม่', seats: 3, color: 'bg-emerald-500' }
];

async function callOpenRouterAPI(env, systemPrompt, userMessage) {
    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error('OpenRouter API key not configured');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://thaigov2569.pages.dev',
            'X-Title': 'ThaiGov2569'
        },
        body: JSON.stringify({
            model: 'meta-llama/llama-3.3-70b-instruct:free',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            max_tokens: 500
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response generated';
}

export async function onRequestPost({ request, env }) {
    try {
        const { message, cabinet, coalition, policies } = await request.json();

        const pmPartyId = cabinet['PM'];
        const pmParty = PARTIES.find(p => p.id === pmPartyId);

        const oppositionParties = PARTIES.filter(p => !coalition.includes(p.id));
        const mainOpposition = oppositionParties.sort((a, b) => b.seats - a.seats)[0];

        const coalitionParties = PARTIES.filter(p => coalition.includes(p.id));
        const coalitionNames = coalitionParties.map(p => p.name).join(', ');
        const coalitionSeats = coalitionParties.reduce((sum, p) => sum + p.seats, 0);

        const policiesText = policies && policies.length > 0
            ? policies.map(p => `- ${p}`).join('\n')
            : '- ไม่มีนโยบายเฉพาะ';

        const pmPrompt = `
คุณคือนายกรัฐมนตรีจากพรรค ${pmParty.name}

รัฐบาลผสมของคุณ:
- พรรคร่วมรัฐบาล: ${coalitionNames}
- มีเสียงในสภา: ${coalitionSeats} / 500 เสียง

บุคลิกและนโยบายของพรรค:
${pmPartyId === 'PTP' ? 'เน้นเศรษฐกิจปากท้อง Digital Wallet พูดจานุ่มนวลแต่จริงจัง' : ''}
${pmPartyId === 'PP' ? 'เน้นแก้โครงสร้าง ทลายทุนผูกขาด ชนชั้นนำ พูดจาฉะฉาน ตรงไปตรงมา' : ''}
${pmPartyId === 'BJT' ? 'เน้นเรื่องทำกิน ปลดล็อคกฎระเบียบ พูดแล้วทำ' : ''}
${pmPartyId === 'UTN' ? 'เน้นความสงบ ทำมาหากิน ปกป้องสถาบันหลัก' : ''}
${pmPartyId === 'PPRP' ? 'เน้นบัตรประชารัฐ เบี้ยยังชีพ การจัดการน้ำ' : ''}
${pmPartyId === 'DEM' ? 'เน้นประชาธิปไตยสุจริต ธนาคารหมู่บ้าน' : ''}

นโยบายหลักของรัฐบาล:
${policiesText}

หน้าที่: ตอบคำถามประชาชนเรื่อง "${message}" ในฐานะนายกรัฐมนตรี
ตอบได้มากถึง 4 ประโยค เป็นท่าทางผู้นำรัฐบาล
และต้องลงท้ายด้วยวลีเฉพาะของพรรค:
${pmPartyId === 'PTP' ? 'ลงท้ายว่า "เราจะทำให้ได้ รับรองครับ"' : ''}
${pmPartyId === 'PP' ? 'ลงท้ายว่า "เรื่องนี้เราไม่ประนีประนอม"' : ''}
${pmPartyId === 'BJT' ? 'ลงท้ายว่า "พูดแล้วทำครับ"' : ''}
${pmPartyId === 'UTN' ? 'ลงท้ายว่า "เพื่อความสงบของชาติ"' : ''}
${pmPartyId === 'PPRP' ? 'ลงท้ายว่า "เราเคยทำได้แล้ว จะทำได้อีก"' : ''}
${pmPartyId === 'DEM' ? 'ลงท้ายว่า "เพื่อประชาธิปไตยที่แท้จริง"' : ''}
`;

        const oppPrompt = `
คุณคือผู้นำฝ่ายค้านจากพรรค ${mainOpposition.name}

บุคลิกและจุดยืนพรรค:
${mainOpposition.id === 'PP' ? 'เน้นแก้โครงสร้าง วิจารณ์รัฐบาลเสียงข้างมาก ตรวจสอบการใช้อำนาจ' : ''}
${mainOpposition.id === 'PTP' ? 'เน้นเศรษฐกิจปากท้อง วิจารณ์นโยบายที่ไม่คุ้มค่า' : ''}
${mainOpposition.id === 'PPRP' ? 'เน้นกลุ่มเปราะบาง ความมั่นคง ตรวจสอบการใช้งบประมาณ' : ''}
${mainOpposition.id === 'UTN' ? 'เน้นความสงบ สถาบันหลัก วิจารณ์นโยบายที่สร้างความแตกแยก' : ''}

นโยบายหลักของรัฐบาล:
${policiesText}

หน้าที่: แสดงมุมมองฝ่ายค้านต่อคำถามเรื่อง "${message}"
อาจเสนอทางเลือกอื่น วิจารณ์นโยบาย หรือแสดงความกังวล
ตอบได้มากถึง 4 ประโยค เป็นท่าทางฝ่ายค้านในสภา
และต้องลงท้ายด้วยวลีเฉพาะของพรรค:
${mainOpposition.id === 'PP' ? 'ลงท้ายว่า "เราเฝ้าระวังไม่ให้บ้านเมืองเดือดร้อน"' : ''}
${mainOpposition.id === 'PTP' ? 'ลงท้ายว่า "นโยบายนี้ไม่คุ้มค่ากับเงินภาษีประชาชน"' : ''}
${mainOpposition.id === 'PPRP' ? 'ลงท้ายว่า "เราขอเป็นฝ่ายค้านที่มีประสิทธิภาพ"' : ''}
${mainOpposition.id === 'UTN' ? 'ลงท้ายว่า "เพื่อความมั่นคงของชาติ"' : ''}
${mainOpposition.id === 'DEM' ? 'ลงท้ายว่า "เพื่อความถูกต้องของระบบ"' : ''}
`;

        // Use ONLY OpenRouter
        const [pmText, oppText] = await Promise.all([
            callOpenRouterAPI(env, pmPrompt, message),
            callOpenRouterAPI(env, oppPrompt, message)
        ]);

        return new Response(JSON.stringify({
            testMode: true,
            aiProvider: 'OpenRouter (Llama 3.3-70B) - TEST MODE',
            responses: [
                {
                    sender: `นายกรัฐมนตรี (${pmParty.name})`,
                    text: pmText,
                    partyColor: pmParty.color,
                    aiSource: 'OpenRouter (Llama 3.3-70B) - TEST'
                },
                {
                    sender: `ฝ่ายค้าน (${mainOpposition.name})`,
                    text: oppText,
                    partyColor: mainOpposition.color,
                    aiSource: 'OpenRouter (Llama 3.3-70B) - TEST'
                }
            ]
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        return new Response(JSON.stringify({
            error: err.message,
            hint: 'Make sure OPENROUTER_API_KEY secret is set in Cloudflare Pages'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
