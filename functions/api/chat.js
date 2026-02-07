// Party data - duplicated for Workers environment
const PARTIES = [
    { id: 'PP', name: 'ประชาชน', seats: 170, color: 'bg-orange-500' },
    { id: 'BJT', name: 'ภูมิใจไทย', seats: 111, color: 'bg-blue-700' },
    { id: 'PTP', name: 'เพื่อไทย', seats: 84, color: 'bg-red-600' },
    { id: 'DEM', name: 'ประชาธิปัตย์', seats: 61, color: 'bg-cyan-500' },
    { id: 'SET', name: 'เศรษฐกิจ', seats: 19, color: 'bg-yellow-600' },
    { id: 'UTN', name: 'รวมไทยสร้างชาติ', seats: 10, color: 'bg-blue-800' },
    { id: 'TST', name: 'ไทยสร้างไทย', seats: 9, color: 'bg-rose-500' },
    { id: 'PCC', name: 'ประชาชาติ', seats: 7, color: 'bg-amber-700' },
    { id: 'PPRP', name: 'พลังประชารัฐ', seats: 6, color: 'bg-blue-600' },
    { id: 'SRT', name: 'เสรีรวมไทย', seats: 5, color: 'bg-indigo-600' },
    { id: 'OTH', name: 'พรรคเล็กอื่นๆ', seats: 18, color: 'bg-gray-500' },
];

const MINISTRIES_MAP = {
    PM: 'นายกรัฐมนตรี',
    MOF: 'กระทรวงการคลัง',
    MOI: 'กระทรวงมหาดไทย',
    MOD: 'กระทรวงกลาโหม',
    MOT: 'กระทรวงคมนาคม',
    MOE: 'กระทรวงศึกษา/อว.',
    MOPH: 'กระทรวงสาธารณสุข',
    MOEN: 'กระทรวงพลังงาน',
};

// Call Cloudflare Workers AI (Llama 3.1-8B)
async function callCloudflareAI(env, systemPrompt, userMessage) {
    const response = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ]
    });
    return response.response;
}

// Call OpenRouter API (backup)
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
            max_tokens: 700
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response generated';
}

// Get AI response with fallback
async function getAIResponse(env, systemPrompt, userMessage, sourceLabel) {
    // Try Cloudflare Workers AI first
    try {
        if (env.AI) {
            const response = await callCloudflareAI(env, systemPrompt, userMessage);
            return { text: response, source: 'Cloudflare Workers AI (Llama 3.1-8B)' };
        }
    } catch (err) {
        console.log(`Cloudflare AI failed for ${sourceLabel}:`, err.message);
    }

    // Fallback to OpenRouter
    try {
        const response = await callOpenRouterAPI(env, systemPrompt, userMessage);
        return { text: response, source: 'OpenRouter (Llama 3.3-70B)' };
    } catch (err) {
        console.log(`OpenRouter failed for ${sourceLabel}:`, err.message);
        throw err;
    }
}

export async function onRequestPost({ request, env }) {
    try {
        const { message, cabinet, coalition, policies, cabinetMapping, coalitionSeats } = await request.json();

        // 1. Find PM party
        const pmPartyId = cabinet['PM'];
        const pmParty = PARTIES.find(p => p.id === pmPartyId);

        // 2. Find main opposition (largest party NOT in coalition)
        const oppositionParties = PARTIES.filter(p => !coalition.includes(p.id));
        const mainOpposition = oppositionParties.sort((a, b) => b.seats - a.seats)[0];

        // 3. Build coalition info
        const coalitionParties = PARTIES.filter(p => coalition.includes(p.id));
        const coalitionNames = coalitionParties.map(p => p.name).join(', ');
        const totalSeats = coalitionSeats || coalitionParties.reduce((sum, p) => sum + p.seats, 0);

        // 4. Build policies string
        const policiesText = policies && policies.length > 0
            ? policies.map(p => `- ${p}`).join('\n')
            : '- ไม่มีนโยบายเฉพาะ';

        // 5. Build cabinet mapping string
        let cabinetText = '';
        if (cabinetMapping) {
            cabinetText = Object.entries(cabinetMapping)
                .map(([ministry, partyId]) => {
                    const ministryName = MINISTRIES_MAP[ministry] || ministry;
                    const party = PARTIES.find(p => p.id === partyId);
                    return `- ${ministryName}: พรรค${party ? party.name : partyId}`;
                })
                .join('\n');
        } else if (cabinet) {
            cabinetText = Object.entries(cabinet)
                .map(([ministry, partyId]) => {
                    const ministryName = MINISTRIES_MAP[ministry] || ministry;
                    const party = PARTIES.find(p => p.id === partyId);
                    return `- ${ministryName}: พรรค${party ? party.name : partyId}`;
                })
                .join('\n');
        }

        // 6. PM Prompt - แสดงวิสัยทัศน์ต่อสภา
        const pmPrompt = `คุณคือผู้ถูกเสนอชื่อเป็นนายกรัฐมนตรีจากพรรค${pmParty.name} กำลังแสดงวิสัยทัศน์ต่อสภาผู้แทนราษฎร และตอบคำถามจากสมาชิกสภา

รัฐบาลผสม: ${coalitionNames} (${totalSeats}/500 เสียง)

นโยบายหลักที่รัฐบาลเลือก:
${policiesText}

หมายเหตุ: นโยบายข้างต้นคือที่เลือกไว้ในเกม คำตอบควรพิจารณาจุดยืนของพรรค${pmParty.name}จากแหล่งข้อมูลทั่วไป นโยบายที่รัฐบาลเลือกอาจไม่ครอบคลุมทั้งหมด

กฎเหล็ก:
- ตอบให้จบประโยค ห้ามตัดกลางประโยค
- ใช้สรรพนาม "เรา" แทนตัวเอง (ตัวแทนรัฐบาลโดยรวม)
- ใช้ภาษาแบบผู้นำที่มีความเป็นมนุษย์ ไม่ใช่ข้อความราชการ
- ตอบ 3-5 ประโยค ในสไตล์ผู้นำรัฐบาลที่จริงใจ
- สะท้อนบุคลิกและจุดยืนของพรรค${pmParty.name}อย่างเป็นธรรมชาติ
- ไม่ต้องลงท้ายด้วยวลีตายตัว ให้สร้างคำลงท้ายที่เหมาะสมเอง
- แสดงความมุ่งมั่นและวิสัยทัศน์ส่วนตัว
- พิจารณาจุดยืนของพรรคร่วมรัฐบาลในประเด็นสำคัญ เช่น การแก้รัฐธรรมนูญ การปฏิรูปกองทัพ แนวทางเศรษฐกิจ จากข้อมูลทั่วไป`;

        // 7. Opposition Prompt - ผู้มีแนวโน้มเป็นวิปฝ่ายค้าน
        const oppPrompt = `คุณคือผู้มีแนวโน้มเป็นวิปฝ่ายค้านจากพรรค${mainOpposition.name} กำลังซักถามและให้ความเห็นต่อวิสัยทัศน์ของผู้ถูกเสนอชื่อเป็นนายกฯ ในสภา

รัฐบาลผสม: ${coalitionNames} (${totalSeats}/500 เสียง)

นโยบายหลักของรัฐบาล:
${policiesText}

หมายเหตุ: นโยบายข้างต้นคือที่เลือกไว้ในเกม จงพิจารณาจุดยืนของพรรค${mainOpposition.name}จากแหล่งข้อมูลทั่วไป

กฎเหล็ก:
- ตอบให้จบประโยค ห้ามตัดกลางประโยค
- ใช้ภาษาแบบนักการเมืองที่มีความเป็นมนุษย์ ไม่ใช่ข้อความราชการ
- วิจารณ์อย่างสร้างสรรค์ เสนอทางเลือก
- สะท้อนจุดยืนพรรค${mainOpposition.name}อย่างเป็นธรรมชาติ
- ตอบ 3-5 ประโยค ในสไตล์วิปฝ่ายค้านในสภา
- ไม่ต้องลงท้ายด้วยวลีตายตัว ให้สร้างคำลงท้ายที่เหมาะสมเอง
- พิจารณาจุดยืนของพรรค${mainOpposition.name}ในประเด็นสำคัญ เช่น การแก้รัฐธรรมนูญ การปฏิรูปกองทัพ แนวทางเศรษฐกิจ จากข้อมูลทั่วไป`;

        // 8. Make AI calls with fallback
        const [pmResult, oppResult] = await Promise.allSettled([
            getAIResponse(env, pmPrompt, message, 'PM'),
            getAIResponse(env, oppPrompt, message, 'Opposition')
        ]);

        const pmResponse = pmResult.status === 'fulfilled' ? pmResult.value : {
            text: `(ขออภัย ไม่สามารถเชื่อมต่อ AI ได้ในขณะนี้)`,
            source: 'Error'
        };
        const oppResponse = oppResult.status === 'fulfilled' ? oppResult.value : {
            text: `(ขออภัย ไม่สามารถเชื่อมต่อ AI ได้ในขณะนี้)`,
            source: 'Error'
        };

        // 9. Return both responses with AI source info
        return new Response(JSON.stringify({
            responses: [
                {
                    sender: `นายกรัฐมนตรี (${pmParty.name})`,
                    text: pmResponse.text,
                    partyColor: pmParty.color,
                    aiSource: pmResponse.source
                },
                {
                    sender: `วิปฝ่ายค้าน (${mainOpposition.name})`,
                    text: oppResponse.text,
                    partyColor: mainOpposition.color,
                    aiSource: oppResponse.source
                }
            ]
        }), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
