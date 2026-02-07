import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    Users,
    CheckCircle,
    AlertCircle,
    Send,
    ChevronRight,
    ChevronLeft,
    RotateCcw,
    Check,
    Zap,
    Trash2,
    Crown,
    Landmark,
    FileText,
    MessageSquare,
    ArrowRight,
    ArrowLeft,
    Play,
    Briefcase,
    ExternalLink,
    BarChart3,
    Camera,
    Share2,
    Download,
    Volume2,
    VolumeX,
    HelpCircle,
} from 'lucide-react';
import { PARTIES, MINISTRIES, TOTAL_SEATS, MAJORITY_THRESHOLD } from './data';
import { POLICIES } from './policies';
import { playSelect, playDeselect, playSuccess, playTransition, playFanfare, setMuted, isMuted } from './sounds';

// IDs of original policies that are now grouped (v0.6.0)
const GROUPED_POLICY_IDS = [
    // 901: EV transport (PTP, BJT, PP)
    106, 408, 213,
    // 902: Free education (UTN, TST, BJT, PP)
    306, 704, 405, 209,
    // 903: Unlock schools (PP, UTN)
    204, 307,
    // 904: Bilingual schools (PTP, PPRP)
    109, 1704,
    // 905: Learn to earn (PTP, DEM)
    108, 506,
    // 906: Energy cost (UTN, PCC, TST, SET, PPRP)
    303, 602, 710, 1802, 1703,
    // 907: Farmer income (PTP, DEM)
    102, 501,
    // 908: SME fund (TST, DEM, SET)
    703, 510, 1803,
    // 909: Village fund (DEM, PPRP)
    504, 1706,
    // 910: Gender equality (PTP, PP, DEM, TST)
    107, 207, 505, 705,
    // 911: Elderly pension (TST, PPRP)
    701, 1702,
    // 912: Anti-corruption (UTN, DEM, SRT, PPRP)
    301, 502, 1902, 1709,
    // 913: Deregulation (UTN, TST)
    305, 702,
    // 914: Military reform (PP, SRT)
    206, 1901,
    // 915: Clean air (PTP, DEM)
    111, 509,
    // 916: Net zero / carbon (PTP, PP, OTH)
    112, 212, 2007,
    // 917: Solar (UTN, BJT)
    309, 402,
];

// Party-colored selection styles
const PARTY_STYLES = {
    PTP: { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-600', glow: 'card-glow-red', accent: 'border-l-red-500' },
    PP: { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-600', glow: 'card-glow-orange', accent: 'border-l-orange-500' },
    BJT: { border: 'border-blue-700', bg: 'bg-blue-50', text: 'text-blue-700', glow: 'card-glow-blue', accent: 'border-l-blue-700' },
    PPRP: { border: 'border-blue-600', bg: 'bg-blue-50', text: 'text-blue-600', glow: 'card-glow-blue-light', accent: 'border-l-blue-600' },
    UTN: { border: 'border-blue-800', bg: 'bg-blue-50', text: 'text-blue-800', glow: 'card-glow-blue-dark', accent: 'border-l-blue-800' },
    DEM: { border: 'border-cyan-500', bg: 'bg-cyan-50', text: 'text-cyan-600', glow: 'card-glow-cyan', accent: 'border-l-cyan-500' },
    PCC: { border: 'border-amber-700', bg: 'bg-amber-50', text: 'text-amber-700', glow: 'card-glow-amber', accent: 'border-l-amber-700' },
    SET: { border: 'border-yellow-600', bg: 'bg-yellow-50', text: 'text-yellow-600', glow: 'card-glow-yellow', accent: 'border-l-yellow-600' },
    TST: { border: 'border-rose-500', bg: 'bg-rose-50', text: 'text-rose-600', glow: 'card-glow-rose', accent: 'border-l-rose-500' },
    SRT: { border: 'border-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-600', glow: 'card-glow-indigo', accent: 'border-l-indigo-600' },
    OTH: { border: 'border-gray-500', bg: 'bg-gray-50', text: 'text-gray-600', glow: 'card-glow-gray', accent: 'border-l-gray-500' },
};

// Party emoji mapping for confetti
const PARTY_EMOJI = {
    PP: '🍊', PTP: '❤️', BJT: '🌿', DEM: '💧', PPRP: '💎',
    UTN: '🛡️', PCC: '🦁', SET: '💰', TST: '🙆', SRT: '🦅', OTH: '🎉',
};

const STEP_LABELS = [
    { icon: Users, label: 'รวมเสียง' },
    { icon: FileText, label: '100 วันแรก' },
    { icon: Briefcase, label: 'ครม.' },
    { icon: MessageSquare, label: 'โหวตนายก' },
    { icon: BarChart3, label: 'ผลลัพธ์' },
];

const POLICY_CATEGORIES = [
    { id: 'economy', name: 'เศรษฐกิจ' },
    { id: 'social', name: 'สังคม' },
    { id: 'education', name: 'การศึกษา' },
    { id: 'security', name: 'ความมั่นคง' },
    { id: 'environment', name: 'สิ่งแวดล้อม' },
    { id: 'politics', name: 'การเมือง' },
];

// Policy dimension mapping for new scoring
const DIMENSION_MAP = {
    economy: 'เศรษฐกิจ',
    social: 'สังคม',
    education: 'สังคม',
    security: 'ความมั่นคง',
    environment: 'ความมั่นคง',
    politics: 'ความมั่นคง',
};

// Fisher-Yates shuffle
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function PMSimulator() {
    const [step, setStep] = useState(0);
    const [selectedPolicies, setSelectedPolicies] = useState(new Set());
    const [policyCategoryIndex, setPolicyCategoryIndex] = useState(0);
    const [coalition, setCoalition] = useState([]);
    const [cabinet, setCabinet] = useState({});
    const [chatLog, setChatHistory] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [reshuffleCount, setReshuffleCount] = useState(0);
    const [confettiFired, setConfettiFired] = useState(false);
    const [score, setScore] = useState(null);
    const [aggregateStats, setAggregateStats] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [hasAskedQuestion, setHasAskedQuestion] = useState(false);
    const [streamingText, setStreamingText] = useState({});
    const [streamingDone, setStreamingDone] = useState({});
    const [soundMuted, setSoundMuted] = useState(() => {
        try { return localStorage.getItem('simgov-muted') === 'true'; } catch { return false; }
    });
    const [showHelper, setShowHelper] = useState({});

    const chatEndRef = useRef(null);
    const resultsRef = useRef(null);

    // Sync mute state
    useEffect(() => {
        setMuted(soundMuted);
        try { localStorage.setItem('simgov-muted', soundMuted); } catch {}
    }, [soundMuted]);

    const totalCoalitionSeats = coalition.reduce((sum, pId) => {
        const party = PARTIES.find(p => p.id === pId);
        return sum + (party ? party.seats : 0);
    }, 0);

    // Shuffled policies per category (memoized once)
    const shuffledPoliciesByCategory = useMemo(() => {
        const result = {};
        POLICY_CATEGORIES.forEach(cat => {
            const policiesInCat = POLICIES.filter(p => p.cat === cat.id && !GROUPED_POLICY_IDS.includes(p.id));
            result[cat.id] = shuffleArray(policiesInCat);
        });
        return result;
    }, []);

    // Categories that have policies
    const activeCategories = useMemo(() => {
        return POLICY_CATEGORIES.filter(cat => (shuffledPoliciesByCategory[cat.id] || []).length > 0);
    }, [shuffledPoliciesByCategory]);

    const toggleParty = (partyId) => {
        if (coalition.includes(partyId)) {
            playDeselect();
            setCoalition(coalition.filter(id => id !== partyId));
            const newCabinet = { ...cabinet };
            Object.keys(newCabinet).forEach(key => {
                if (newCabinet[key] === partyId) delete newCabinet[key];
            });
            setCabinet(newCabinet);
        } else {
            playSelect();
            setCoalition([...coalition, partyId]);
        }
    };

    const assignMinister = (ministryId, partyId) => {
        setCabinet({ ...cabinet, [ministryId]: partyId });
    };

    const autoAssignCabinet = () => {
        const newCabinet = {};
        const totalSeats = coalition.reduce((sum, pId) => {
            const party = PARTIES.find(p => p.id === pId);
            return sum + (party ? party.seats : 0);
        }, 0);
        let ministryIndex = 0;
        coalition.forEach(partyId => {
            const party = PARTIES.find(p => p.id === partyId);
            if (!party) return;
            const partyRatio = party.seats / totalSeats;
            const ministriesCount = Math.max(1, Math.round(MINISTRIES.length * partyRatio));
            for (let i = 0; i < ministriesCount && ministryIndex < MINISTRIES.length; i++) {
                newCabinet[MINISTRIES[ministryIndex].id] = partyId;
                ministryIndex++;
            }
        });
        if (ministryIndex < MINISTRIES.length) {
            const largestPartyId = [...coalition].sort((a, b) => {
                const pA = PARTIES.find(p => p.id === a).seats;
                const pB = PARTIES.find(p => p.id === b).seats;
                return pB - pA;
            })[0];
            while (ministryIndex < MINISTRIES.length) {
                newCabinet[MINISTRIES[ministryIndex].id] = largestPartyId;
                ministryIndex++;
            }
        }
        if (cabinet['PM']) newCabinet['PM'] = cabinet['PM'];
        setCabinet(newCabinet);
    };

    const clearAllAssignments = () => setCabinet({});

    const assignAllToPmParty = () => {
        const pmPartyId = cabinet['PM'] || [...coalition].sort((a, b) => {
            const pA = PARTIES.find(p => p.id === a).seats;
            const pB = PARTIES.find(p => p.id === b).seats;
            return pB - pA;
        })[0];
        const newCabinet = { 'PM': pmPartyId };
        MINISTRIES.forEach(min => { newCabinet[min.id] = pmPartyId; });
        setCabinet(newCabinet);
    };

    const navigateToStep = (targetStep) => {
        if (targetStep >= step) return;
        if (targetStep === 3 && step >= 4) {
            if (reshuffleCount >= 1) return;
            setReshuffleCount(prev => prev + 1);
        }
        playTransition();
        setStep(targetStep);
    };

    // --- New Scoring System (v0.8.0) ---
    const calculateScore = () => {
        // 1. Coalition stability (25 pts) - Optimal range 57-66% gets full points
        // Ramp up 50.2-57%, Full 25pts at 57-66%, Ramp down 66-75%
        const percentage = (totalCoalitionSeats / 500) * 100;
        let coalitionScore = 0;

        if (percentage >= 50.2 && percentage <= 75) {
            if (percentage <= 57) {
                // Ramp up from 50.2% to 57% (0 to 25 points)
                coalitionScore = Math.round(25 * (percentage - 50.2) / 6.8);
            } else if (percentage <= 66) {
                // Full 25 points for optimal range 57-66%
                coalitionScore = 25;
            } else {
                // Ramp down from 66% to 75% (25 to 0 points)
                coalitionScore = Math.max(0, Math.round(25 * (75 - percentage) / 9));
            }
        }
        coalitionScore = Math.max(0, Math.min(25, coalitionScore));

        // 2. Policy dimensions
        const selectedPolicyObjects = POLICIES.filter(p => selectedPolicies.has(p.id));

        // Economy dimension: cat economy (capped at 6 effective policies)
        const economyPolicies = selectedPolicyObjects.filter(p => p.cat === 'economy');
        const effectiveEconomy = Math.min(economyPolicies.length, 6);
        const economyScore = Math.min(15, Math.round((effectiveEconomy / 6) * 15));

        // Social dimension: cat social + education (capped at 6 effective)
        const socialPolicies = selectedPolicyObjects.filter(p => p.cat === 'social' || p.cat === 'education');
        const effectiveSocial = Math.min(socialPolicies.length, 6);
        const socialScore = Math.min(15, Math.round((effectiveSocial / 6) * 15));

        // Security dimension: cat security + environment + politics (capped at 6 effective)
        const securityPolicies = selectedPolicyObjects.filter(p => p.cat === 'security' || p.cat === 'environment' || p.cat === 'politics');
        const effectiveSecurity = Math.min(securityPolicies.length, 6);
        const securityScore = Math.min(15, Math.round((effectiveSecurity / 6) * 15));

        // 3. Policy-party alignment (15 pts) - policies from coalition parties
        let alignedCount = 0;
        selectedPolicyObjects.forEach(p => {
            if (p.party && coalition.includes(p.party)) { alignedCount++; }
            else if (p.supporters && p.supporters.some(s => coalition.includes(s))) { alignedCount++; }
        });
        const alignmentScore = selectedPolicyObjects.length > 0
            ? Math.min(15, Math.round((alignedCount / selectedPolicyObjects.length) * 15))
            : 0;

        // 4. Budget efficiency (15 pts) - fewer policies = more disciplined
        const policyCount = selectedPolicies.size;
        const budgetScore = policyCount <= 5 ? 15 : policyCount <= 10 ? 12 : policyCount <= 15 ? 8 : policyCount <= 20 ? 4 : 0;

        // 5. Balance bonus (+5) - all 3 dimensions have at least 2 policies each
        const hasEconomy = economyPolicies.length >= 2;
        const hasSocial = socialPolicies.length >= 2;
        const hasSecurity = securityPolicies.length >= 2;
        const balanceBonus = (hasEconomy && hasSocial && hasSecurity) ? 5 : 0;

        // Overspending penalty: selecting 25+ policies loses extra points
        const overspendPenalty = policyCount > 25 ? Math.min(10, (policyCount - 25) * 2) : 0;

        const total = Math.max(0, coalitionScore + economyScore + socialScore + securityScore + alignmentScore + budgetScore + balanceBonus - overspendPenalty);

        // Harder grading curve
        const grade = total >= 92 ? 'A+' : total >= 82 ? 'A' : total >= 72 ? 'B+' : total >= 62 ? 'B' : total >= 52 ? 'C+' : total >= 42 ? 'C' : total >= 32 ? 'D' : 'F';

        return {
            total, grade,
            coalition: coalitionScore,
            economy: economyScore,
            social: socialScore,
            security: securityScore,
            alignment: alignmentScore,
            budget: budgetScore,
            balanceBonus,
        };
    };

    // Dynamic commentary
    const getCommentary = (s) => {
        const comments = [];
        const percentage = (totalCoalitionSeats / 500) * 100;

        // Coalition commentary with recommendations
        if (percentage < 50.2) {
            comments.push('❌ ไม่มีเสียงข้างมาก - รัฐบาลไม่สามารถก่อตั้งได้');
        } else if (percentage <= 57) {
            comments.push('⚠️ ปริ่มน้ำ (50-57%) - บริหารยาก เสี่ยงหากมีคนถอนตัว');
        } else if (percentage <= 66) {
            comments.push('✅ เหมาะสมที่สุด (57-66%) - เสถียรพอที่ผลักดันนโยบาย แต่ฝ่ายค้านแข็งแกร่ง');
            if (s.coalition > 0) comments.push('นี่คือความสมดุลที่ดีที่สุดสำหรับประชาธิปไตย');
        } else if (percentage < 75) {
            comments.push('⚠️ เกินพอ (66-75%) - เลยไปจากจุดสมดุลที่ดี');
        } else {
            comments.push('❌ อันตราย (75%+) - สามารถแก้รัฐธรรมนูญได้เพียงลำพัง คุกคามประชาธิปไตย');
        }

        if (s.economy >= 12) comments.push('นโยบายเศรษฐกิจครอบคลุมดี');
        else if (s.economy >= 6) comments.push('นโยบายเศรษฐกิจยังไม่ครอบคลุมเท่าที่ควร');
        else comments.push('ขาดนโยบายเศรษฐกิจที่ชัดเจน');

        if (s.social >= 12) comments.push('นโยบายสังคมและการศึกษาแข็งแกร่ง');
        else if (s.social >= 6) comments.push('นโยบายสังคมยังมีช่องว่าง');
        else comments.push('ด้านสังคมและการศึกษายังต้องเติมเต็ม');

        if (s.security >= 12) comments.push('ครอบคลุมด้านความมั่นคงและสิ่งแวดล้อม');
        else if (s.security >= 6) comments.push('ด้านความมั่นคงยังพอมีแต่ไม่ครบ');
        else comments.push('ขาดนโยบายด้านความมั่นคง สิ่งแวดล้อม หรือการเมือง');

        if (s.alignment >= 12) comments.push('นโยบายตรงกับจุดแข็งพรรคร่วมรัฐบาล');
        else if (s.alignment >= 6) comments.push('นโยบายบางส่วนไม่ตรงกับจุดแข็งพรรคร่วม');
        else comments.push('นโยบายส่วนใหญ่ไม่ตรงกับพรรคร่วมรัฐบาล');

        if (s.budget >= 12) comments.push('งบประมาณมีวินัย เลือกนโยบายอย่างเน้นจุด');
        else if (s.budget >= 6) comments.push('งบประมาณพอไหว แต่นโยบายค่อนข้างมาก');
        else comments.push('เลือกนโยบายมากเกินไป อาจมีปัญหาด้านงบประมาณ');

        if (s.balanceBonus > 0) comments.push('ได้โบนัสดุลยภาพนโยบาย! แต่ละมิติมีอย่างน้อย 2 นโยบาย');

        return comments;
    };

    const saveSession = async (scoreData) => {
        try {
            const sessionId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
            const pmPartyId = cabinet['PM'] || coalition[0];
            await fetch('/api/stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId, pm_party: pmPartyId, coalition, coalition_seats: totalCoalitionSeats,
                    selected_policies: Array.from(selectedPolicies), policy_count: selectedPolicies.size,
                    cabinet, chat_questions: chatLog.filter(m => m.sender === 'user').map(m => m.text),
                    chat_count: chatLog.filter(m => m.sender === 'user').length,
                    score_total: scoreData.total, score_coalition: scoreData.coalition,
                    score_economy: scoreData.economy, score_social: scoreData.social,
                    score_security: scoreData.security, score_alignment: scoreData.alignment,
                    score_budget: scoreData.budget, score_balance_bonus: scoreData.balanceBonus, grade: scoreData.grade,
                }),
            });
        } catch (err) { console.error('Failed to save session:', err); }
    };

    const fetchAggregateStats = async () => {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const res = await fetch('/api/stats', { signal: controller.signal });
            clearTimeout(timeout);
            if (res.ok) {
                const data = await res.json();
                setAggregateStats(data);
            } else {
                setAggregateStats({ total_games: 0, pm_distribution: {}, avg_score: null, grade_distribution: {} });
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
            setAggregateStats({ total_games: 0, pm_distribution: {}, avg_score: null, grade_distribution: {} });
        }
    };

    // --- Fire confetti with emoji ---
    const fireConfetti = async () => {
        if (confettiFired) return;
        setConfettiFired(true);
        try {
            const confettiModule = await import('canvas-confetti');
            const confetti = confettiModule.default;
            const pmPartyId = cabinet['PM'] || coalition[0];
            const pmEmoji = PARTY_EMOJI[pmPartyId] || '🎉';
            const pmShape = confetti.shapeFromText({ text: pmEmoji, scalar: 4 });
            const duration = 3000;
            const end = Date.now() + duration;

            confetti({
                particleCount: 50, spread: 100, origin: { y: 0.4 },
                shapes: [pmShape], scalar: 3, drift: 0, ticks: 300
            });

            (function frame() {
                const timeLeft = end - Date.now();
                if (timeLeft <= 0) return;
                confetti({ particleCount: 3, angle: 60, spread: 45, origin: { x: 0 }, shapes: [pmShape], scalar: 2.5 });
                confetti({ particleCount: 3, angle: 120, spread: 45, origin: { x: 1 }, shapes: [pmShape], scalar: 2.5 });
                requestAnimationFrame(frame);
            }());

            const rainInterval = setInterval(() => {
                const timeLeft = end - Date.now();
                if (timeLeft <= 0) { clearInterval(rainInterval); return; }
                confetti({
                    particleCount: 2, angle: 270, spread: 180,
                    origin: { x: Math.random(), y: 0 }, shapes: [pmShape],
                    scalar: 3, gravity: 0.8, drift: (Math.random() - 0.5) * 0.5
                });
            }, 80);
        } catch (err) { console.error('Confetti failed:', err); }
    };

    // --- Streaming text effect ---
    const streamText = useCallback((key, fullText, delay = 20) => {
        setStreamingDone(prev => ({ ...prev, [key]: false }));
        let i = 0;
        const interval = setInterval(() => {
            setStreamingText(prev => ({ ...prev, [key]: fullText.slice(0, i) }));
            i++;
            if (i > fullText.length) {
                clearInterval(interval);
                setStreamingDone(prev => ({ ...prev, [key]: true }));
            }
        }, delay);
        return () => clearInterval(interval);
    }, []);

    // --- AI Chat Logic ---
    const handleSendMessage = async () => {
        if (!inputMessage.trim() || hasAskedQuestion) return;

        const userMsg = { sender: 'user', text: inputMessage };
        setChatHistory(prev => [...prev, userMsg]);
        const currentInput = inputMessage;
        setInputMessage('');
        setIsTyping(true);
        setHasAskedQuestion(true);
        playSelect();

        try {
            const selectedPolicyTitles = POLICIES.filter(p => selectedPolicies.has(p.id)).map(p => p.title);
            const cabinetMapping = {};
            Object.entries(cabinet).forEach(([minId, partyId]) => {
                const ministry = MINISTRIES.find(m => m.id === minId);
                const party = PARTIES.find(p => p.id === partyId);
                if (ministry && party) cabinetMapping[ministry.name] = party.name;
            });

            const context = {
                message: currentInput, cabinet, coalition,
                policies: selectedPolicyTitles, cabinetMapping, coalitionSeats: totalCoalitionSeats,
            };

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(context),
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            if (data.responses && Array.isArray(data.responses)) {
                const pmResp = data.responses[0];
                const oppResp = data.responses[1];
                const pmKey = `pm-${Date.now()}`;
                const oppKey = `opp-${Date.now()}`;

                setChatHistory(prev => [...prev, {
                    sender: pmResp.sender, text: pmResp.text,
                    partyColor: pmResp.partyColor, streamKey: pmKey,
                }]);
                streamText(pmKey, pmResp.text, 20);

                setTimeout(() => {
                    setChatHistory(prev => [...prev, {
                        sender: oppResp.sender, text: oppResp.text,
                        partyColor: oppResp.partyColor, streamKey: oppKey,
                    }]);
                    streamText(oppKey, oppResp.text, 20);
                }, pmResp.text.length * 20 + 500);
            } else {
                const msgKey = `ai-${Date.now()}`;
                setChatHistory(prev => [...prev, {
                    sender: data.responder, text: data.text,
                    partyColor: data.partyColor, streamKey: msgKey,
                }]);
                streamText(msgKey, data.text, 20);
            }
        } catch (error) {
            console.error('AI Error:', error);
            setChatHistory(prev => [...prev, {
                sender: 'System', text: 'ขออภัยครับ ระบบสื่อสารขัดข้อง กรุณาลองใหม่',
                partyColor: 'bg-gray-500'
            }]);
            setHasAskedQuestion(false);
        } finally {
            setIsTyping(false);
        }
    };

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatLog]);
    useEffect(() => { if (step === 4 && !confettiFired) fireConfetti(); }, [step]);
    useEffect(() => {
        if (step === 4) {
            const pmPartyId = cabinet['PM'] || coalition[0];
            const pmParty = PARTIES.find(p => p.id === pmPartyId);
            setChatHistory([
                { sender: 'ประธานสภา', text: `สวัสดีครับ เชิญผู้ถูกเสนอชื่อเป็นนายกรัฐมนตรีจากพรรค${pmParty?.name || ''} แสดงวิสัยทัศน์ต่อสภา สมาชิกสภาสามารถซักถามได้ 1 คำถามครับ` }
            ]);
            setHasAskedQuestion(false);
        }
    }, [step]);

    // --- Screenshot/Share ---
    const handleShare = async () => {
        try {
            const html2canvas = (await import('html2canvas')).default;
            const el = resultsRef.current;
            if (!el) return;
            const canvas = await html2canvas(el, { backgroundColor: '#f8fafc', scale: 2 });
            canvas.toBlob(async (blob) => {
                if (!blob) return;
                const file = new File([blob], 'sim-government-result.png', { type: 'image/png' });
                if (navigator.share && navigator.canShare({ files: [file] })) {
                    await navigator.share({ files: [file], title: 'Sim-Government: Thailand 2569', text: 'ผลลัพธ์การจัดตั้งรัฐบาลของฉัน' });
                } else {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = 'sim-government-result.png';
                    a.click(); URL.revokeObjectURL(url);
                }
            }, 'image/png');
        } catch (err) { console.error('Share failed:', err); }
    };

    // --- Mute toggle ---
    const toggleMute = () => setSoundMuted(prev => !prev);

    // --- STEP PROGRESS INDICATOR ---
    const renderStepIndicator = () => (
        <div className="flex items-center justify-center gap-0 mb-8">
            {STEP_LABELS.map((s, i) => {
                const stepNum = i + 1;
                const isCompleted = step > stepNum;
                const isActive = step === stepNum;
                const isClickable = stepNum < step && !(stepNum === 3 && step >= 4 && reshuffleCount >= 1);
                const Icon = s.icon;
                return (
                    <React.Fragment key={i}>
                        {i > 0 && <div className={`step-line w-6 md:w-12 h-0.5 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                        <div className="flex flex-col items-center gap-1">
                            <button
                                onClick={() => isClickable && navigateToStep(stepNum)}
                                disabled={!isClickable}
                                className={`step-dot w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted ? 'bg-emerald-500 text-white completed' : isActive ? 'bg-blue-600 text-white active' : 'bg-slate-200 text-slate-400'} ${isClickable ? 'cursor-pointer hover:scale-110 hover:ring-4 ring-blue-200' : ''}`}
                            >
                                {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                            </button>
                            <span className={`text-[10px] font-bold ${isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>{s.label}</span>
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );

    // --- INTRO SCREEN ---
    const renderIntro = () => (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 animate-gradient-bg flex flex-col items-center justify-center px-4 py-10 -m-4 md:-m-8">
            <div className="max-w-xl w-full flex flex-col items-center text-center">
                {/* Developer credit at top */}
                <div className="flex items-center gap-3 mb-6 opacity-50 hover:opacity-100 transition-all duration-300 animate-slide-up stagger-1">
                    <a href="https://thalay.eu/" target="_blank" rel="noopener noreferrer" className="grayscale hover:grayscale-0 transition-all duration-300">
                        <img src="https://thalay.eu/wp-content/uploads/2021/04/Thalay.eu3-Transparent150.png" alt="thalay.eu" className="h-6" />
                    </a>
                    <a href="https://www.facebook.com/thalay.eu" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    </a>
                </div>

                {/* Hero Icon */}
                <div className="relative mb-8 animate-slide-up stagger-2">
                    <div className="absolute inset-0 w-24 h-24 md:w-28 md:h-28 rounded-full bg-blue-500/20 animate-pulse-ring" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                    <div className="relative w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-200 animate-float">
                        <Landmark className="text-white" size={48} />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-1 animate-slide-up stagger-2">Sim-Government</h1>
                <div className="flex items-center gap-2 mb-4 animate-slide-up stagger-2">
                    <span className="text-xl md:text-2xl font-bold text-slate-400">Thailand</span>
                    <span className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-[length:200%_auto] animate-text-gradient">2569</span>
                </div>

                <p className="text-slate-500 text-base md:text-lg font-medium mb-2 animate-slide-up stagger-3">คุณคือแกนนำจัดตั้งรัฐบาล</p>
                <p className="text-slate-400 text-sm mb-6 animate-slide-up stagger-3">รวมเสียง เลือกนโยบาย แล้วเสนอนายกเข้าสภาเพื่อโหวต</p>

                {/* Sequel Badge */}
                <a href="https://thalay.eu/sim2569" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-6 hover:bg-blue-200 transition-colors animate-slide-up stagger-3">
                    <ArrowRight size={14} /> ภาคต่อจาก Sim-Thailand 2569 <ExternalLink size={12} />
                </a>

                {/* Disclaimer */}
                <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-xl max-w-md mx-auto animate-slide-up stagger-4">
                    <p className="text-amber-700 text-xs leading-relaxed">
                        <AlertCircle size={14} className="inline mr-1 -mt-0.5" />
                        <strong>คำเตือน:</strong> ผลลัพธ์อ้างอิงจากข้อมูลนโยบายจริง เพื่อการศึกษาและจำลองสถานการณ์เท่านั้น ไม่ใช่การชี้นำทางการเมือง
                    </p>
                </div>

                {/* CTA Button */}
                <button
                    onClick={() => { playTransition(); setStep(1); }}
                    className="btn-shine px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xl rounded-2xl shadow-xl shadow-blue-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 mb-6 animate-slide-up stagger-5"
                >
                    <Play size={22} /> เริ่มจัดตั้งรัฐบาล
                </button>

                {/* Bottom Links */}
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 animate-slide-up stagger-6">
                    <a href="https://thalay.eu/policy2569" target="_blank" rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-sm">
                        <FileText size={16} /> ดูนโยบายทุกพรรค <ExternalLink size={12} />
                    </a>
                    <button onClick={() => { setShowResults(true); fetchAggregateStats(); }}
                        className="px-5 py-2.5 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-sm">
                        <BarChart3 size={16} /> ดูผลโหวตและการตั้งรัฐบาล
                    </button>
                </div>

                {/* Reference links */}
                <div className="flex flex-col items-center gap-2 text-xs text-slate-400 animate-slide-up stagger-7">
                    <span className="font-bold">อ้างอิงข้อมูล สส. ก่อนเลือกตั้ง:</span>
                    <div className="flex items-center gap-3">
                        <a href="https://nidapoll.nida.ac.th/wp-content/uploads/2026/01/nidapoll_round_2_election2026.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 underline">นิด้าโพล (ม.ค. 69)</a>
                        <span className="text-slate-300">|</span>
                        <a href="https://dusitpoll.dusit.ac.th/UPLOAD_FILES/POLL/2569/PS-2569-1769744270.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 underline">สวนดุสิตโพล (ธ.ค. 68)</a>
                    </div>
                    <a href="https://github.com/bejranonda/ThaiGov2569" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-blue-500 transition-colors font-mono mt-2">v0.8.0</a>
                </div>
            </div>
        </div>
    );

    // --- COALITION BUILDER (Step 1) - sorted by seats desc ---
    const sortedParties = useMemo(() => [...PARTIES].sort((a, b) => b.seats - a.seats), []);

    const renderCoalitionBuilder = () => (
        <div className="animate-fade-in">
            <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-slate-200">
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-xl font-bold text-slate-800">รวมเสียงจัดตั้งรัฐบาล</h2>
                    <div className="text-right">
                        <span className="text-sm text-slate-500">ที่นั่งรวม</span>
                        <div className={`text-3xl font-bold ${totalCoalitionSeats >= MAJORITY_THRESHOLD ? 'text-green-600' : 'text-red-500'}`}>
                            {totalCoalitionSeats} / {TOTAL_SEATS}
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${totalCoalitionSeats < MAJORITY_THRESHOLD ? 'bg-red-100 text-red-600' : totalCoalitionSeats > 375 ? 'bg-emerald-100 text-emerald-700' : 'bg-green-100 text-green-700'}`}>
                            {totalCoalitionSeats < MAJORITY_THRESHOLD ? 'เสียงข้างน้อย (ตั้งไม่ได้)' : totalCoalitionSeats > 375 ? 'รัฐบาลมั่นคงมาก' : 'รัฐบาลเสียงข้างมาก'}
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative mb-6">
                    <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden relative">
                        <div className={`h-full transition-all duration-500 rounded-full ${totalCoalitionSeats >= MAJORITY_THRESHOLD ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-400 to-orange-400'}`}
                            style={{ width: `${Math.min(100, (totalCoalitionSeats / TOTAL_SEATS) * 100)}%` }} />
                    </div>
                    <div className="absolute left-1/2 -top-1 -translate-x-1/2 flex flex-col items-center">
                        <div className="w-0.5 h-6 bg-slate-400" />
                        <span className="text-[9px] text-slate-500 font-bold mt-0.5">250</span>
                    </div>
                </div>

                {/* Party Grid - sorted by seats */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {sortedParties.map(party => {
                        const isSelected = coalition.includes(party.id);
                        const ps = PARTY_STYLES[party.id] || { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-600', glow: '', accent: 'border-l-blue-500' };
                        return (
                            <button key={party.id} onClick={() => toggleParty(party.id)}
                                className={`choice-card-enhanced p-4 rounded-xl border-2 relative overflow-hidden text-left transition-all ${isSelected ? `${ps.border} ${ps.bg} ${ps.glow} shadow-md` : `border-slate-200 hover:border-slate-300 hover:shadow bg-white border-l-4 ${ps.accent}`}`}>
                                {isSelected && <div className={`absolute top-1.5 right-1.5 ${ps.text} animate-check-pop`}><CheckCircle size={18} /></div>}
                                <div className={`font-bold text-base mb-1 ${ps.text}`}>{party.name}</div>
                                <div className="text-sm text-slate-500 mb-2">{party.seats} ที่นั่ง</div>
                                <p className="text-[10px] text-slate-400 leading-tight line-clamp-2">{party.policies?.general || ''}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => {
                        if (totalCoalitionSeats >= MAJORITY_THRESHOLD) {
                            const largestPartyId = [...coalition].sort((a, b) => {
                                const pA = PARTIES.find(p => p.id === a).seats;
                                const pB = PARTIES.find(p => p.id === b).seats;
                                return pB - pA;
                            })[0];
                            setCabinet({ ...cabinet, 'PM': largestPartyId });
                            setPolicyCategoryIndex(0);
                            playSuccess();
                            setStep(2);
                        }
                    }}
                    disabled={totalCoalitionSeats < MAJORITY_THRESHOLD}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2"
                >
                    ถัดไป: เลือกสิ่งที่อยากทำ <ChevronRight />
                </button>
            </div>
        </div>
    );

    // --- POLICY SELECTOR (Step 2) - Step through categories ---
    const togglePolicy = (id) => {
        const newSet = new Set(selectedPolicies);
        if (newSet.has(id)) {
            newSet.delete(id);
            playDeselect();
        } else {
            newSet.add(id);
            playSelect();
        }
        setSelectedPolicies(newSet);
    };

    const renderPolicySelector = () => {
        const currentCat = activeCategories[policyCategoryIndex];
        if (!currentCat) return null;
        const policiesInCat = shuffledPoliciesByCategory[currentCat.id] || [];
        const selectedInCat = policiesInCat.filter(p => selectedPolicies.has(p.id)).length;
        const helperVisible = showHelper[currentCat.id];
        const hasHelperPolicies = policiesInCat.some(p => p.pro && p.con);

        return (
            <div className="animate-fade-in">
                {/* Sticky Header */}
                <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-slate-200 -mx-4 md:-mx-8 px-4 md:px-8 py-3 mb-6 shadow-sm">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                        <button onClick={() => {
                            if (policyCategoryIndex > 0) setPolicyCategoryIndex(policyCategoryIndex - 1);
                            else setStep(1);
                        }} className="text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium text-sm flex-shrink-0">
                            <ArrowLeft size={16} /> {policyCategoryIndex > 0 ? 'หมวดก่อนหน้า' : 'แก้ไขพรรคร่วม'}
                        </button>

                        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                            <span>หมวด {policyCategoryIndex + 1}/{activeCategories.length} {policyCategoryIndex > 0 && '✅'}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-blue-600">เลือกแล้ว {selectedPolicies.size} นโยบาย {selectedInCat > 0 && '⭐'}</span>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                            {hasHelperPolicies && (
                                <button
                                    onClick={() => setShowHelper(prev => ({ ...prev, [currentCat.id]: !prev[currentCat.id] }))}
                                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold transition-all ${helperVisible ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'}`}
                                >
                                    <HelpCircle size={14} /> {helperVisible ? 'ซ่อน' : 'ตัวช่วย'}
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if (policyCategoryIndex < activeCategories.length - 1) {
                                        playSuccess();
                                        setPolicyCategoryIndex(policyCategoryIndex + 1);
                                        playTransition();
                                    } else {
                                        playSuccess();
                                        setStep(3);
                                    }
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow transition flex items-center gap-1 text-sm"
                            >
                                {policyCategoryIndex < activeCategories.length - 1 ? 'ถัดไป ✨' : 'เลือกเสร็จ 🎉'} <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Category progress bar */}
                <div className="flex gap-1 mb-4">
                    {activeCategories.map((cat, idx) => {
                        const catPolicies = shuffledPoliciesByCategory[cat.id] || [];
                        const hasSelected = catPolicies.some(p => selectedPolicies.has(p.id));
                        return (
                            <button key={cat.id} onClick={() => setPolicyCategoryIndex(idx)}
                                className={`flex-1 rounded-full transition-all text-center ${idx === policyCategoryIndex ? 'bg-blue-500 text-white py-1 text-xs font-bold' : hasSelected ? 'bg-emerald-400 h-2 mt-2' : 'bg-slate-200 h-2 mt-2'}`}>
                                {idx === policyCategoryIndex ? cat.name : ''}
                            </button>
                        );
                    })}
                </div>

                {/* Category heading */}
                <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-slate-800">สิ่งที่อยากให้ทำใน 100 วันแรก</h2>
                    <div className="inline-block bg-blue-100 text-blue-800 text-lg font-bold rounded-xl px-4 py-2 mt-2">
                        {currentCat.name}
                    </div>
                    <p className="text-sm text-slate-500 mt-1">{policiesInCat.length} นโยบาย | เลือกแล้ว {selectedInCat}</p>
                </div>

                {/* Policy cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {policiesInCat.map(p => {
                        const isSelected = selectedPolicies.has(p.id);
                        return (
                            <div key={p.id} onClick={() => togglePolicy(p.id)}
                                className={`choice-card-enhanced p-4 rounded-xl border-2 relative ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md card-shimmer' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-800">{p.title}</h3>
                                    {isSelected && <span className="animate-check-pop"><Check className="text-blue-600" size={20} /></span>}
                                </div>
                                <p className="text-sm text-slate-600">{p.desc}</p>
                                {helperVisible && p.pro && p.con && (
                                    <div className="mt-2 pt-2 border-t border-slate-200 flex gap-3 text-xs animate-fade-in" onClick={e => e.stopPropagation()}>
                                        <div className="flex-1">
                                            <span className="text-emerald-600 font-bold">ข้อดี:</span>
                                            <span className="text-slate-600 ml-1">{p.pro}</span>
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-red-500 font-bold">ข้อเสีย:</span>
                                            <span className="text-slate-600 ml-1">{p.con}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // --- PM NOMINATION (Step 3) ---
    const renderPMNomination = () => {
        const pmPartyId = cabinet['PM'] || coalition[0];
        const pmParty = pmPartyId ? PARTIES.find(p => p.id === pmPartyId) : null;

        return (
            <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => { setPolicyCategoryIndex(activeCategories.length - 1); setStep(2); }} className="text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium">
                        <RotateCcw size={16} /> ย้อนกลับไปเลือกนโยบาย
                    </button>
                    <h2 className="text-xl font-bold text-slate-800">เสนอชื่อนายก</h2>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 mb-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">เลือกผู้ถูกเสนอชื่อเป็นนายกรัฐมนตรี</h3>
                    <p className="text-sm text-slate-500 mb-6">เลือกหนึ่งท่านจากพรรคร่วมรัฐบาล เพื่อเสนอเข้าสภา</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {coalition.map(partyId => {
                            const party = PARTIES.find(p => p.id === partyId);
                            if (!party) return null;
                            const isSelected = pmPartyId === partyId;
                            const ps = PARTY_STYLES[partyId] || {};
                            return (
                                <button
                                    key={partyId}
                                    onClick={() => setCabinet({ ...cabinet, 'PM': partyId })}
                                    className={`choice-card-enhanced p-6 rounded-xl border-2 transition-all ${
                                        isSelected
                                            ? `${ps.border} ${ps.bg} ${ps.glow} shadow-lg`
                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex flex-col items-center text-center gap-2">
                                        {isSelected && <span className="text-2xl animate-check-pop"><Check className="text-blue-600" size={24} /></span>}
                                        <div className={`font-bold text-base ${ps.text}`}>{party.name}</div>
                                        <div className="text-sm text-slate-500">{party.seats} ที่นั่ง</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {pmParty && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-4 h-4 rounded-full ${pmParty.color}`} />
                            <h3 className="font-bold text-slate-800">ผู้ถูกเสนอชื่อเป็นนายก</h3>
                        </div>
                        <p className="text-slate-600 text-sm">{pmParty.name} - {pmParty.seats} ที่นั่ง</p>
                        <p className="text-slate-500 text-xs mt-2">{pmParty.policies?.general || ''}</p>
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        onClick={() => { playSuccess(); setStep(4); }}
                        disabled={!pmPartyId}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2"
                    >
                        เข้าสู่สภา <ChevronRight />
                    </button>
                </div>
            </div>
        );
    };

    // Shuffled suggested questions (memoized once)
    const shuffledQuestions = useMemo(() => shuffleArray([
        'จะแก้ปัญหาเศรษฐกิจยังไง', 'ขอลดค่าไฟหน่อย', 'ปราบยาเสพติดยังไง', 'การศึกษาจะดีขึ้นไหม',
        'ค่าครองชีพแพงมาก', 'จะแก้ปัญหาน้ำท่วมยังไง', 'ทุจริตคอร์รัปชันจะหมดไปไหม', 'เมื่อไหร่จะแก้รัฐธรรมนูญ',
        'จะปฏิรูปกองทัพไหม', 'PM 2.5 จะแก้ยังไง', 'หนี้ครัวเรือนสูง ช่วยได้ไหม', 'ต่างชาติจะลงทุนเพิ่มไหม',
        'แก้ ส.ว. หรือไม่แก้', 'แก้ รธน. มาตราไหนบ้าง', 'ทำประชามติก่อนแก้ รธน. ไหม',
    ]), []);

    // --- PARLIAMENTARY PM VOTE (Step 4) - "แสดงวิสัยทัศน์ในสภา" ---
    const renderGovChat = () => {
        const pmPartyId = cabinet['PM'] || coalition[0];
        const pmParty = PARTIES.find(p => p.id === pmPartyId);

        return (
            <div className="animate-fade-in h-[600px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <h2 className="text-lg font-bold text-slate-800">แสดงวิสัยทัศน์ในสภา</h2>
                    </div>
                </div>

                {/* Role explanation */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-xs text-blue-700">
                    <strong>ประธานสภา:</strong> สวัสดีครับ เชิญ ผู้ถูกเสนอชื่อเป็นนายกรัฐมนตรีจากพรรค{pmParty?.name} แสดงวิสัยทัศน์และตอบคำถามจากสมาชิกสภา
                </div>

                {/* Chat Area */}
                <div className="flex-grow bg-slate-100 rounded-2xl p-4 overflow-y-auto mb-4 border border-slate-200 shadow-inner">
                    {chatLog.map((msg, idx) => (
                        <div key={idx} className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} ${msg.sender === 'user' ? 'msg-enter-right' : 'msg-enter-left'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-700 rounded-bl-none border border-slate-200'}`}>
                                {msg.sender !== 'user' && (
                                    <div className="text-xs font-bold mb-1 flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${msg.partyColor || 'bg-slate-400'}`}></div>
                                        {msg.sender}
                                    </div>
                                )}
                                <p className={`text-sm leading-relaxed ${msg.streamKey && !streamingDone[msg.streamKey] ? 'streaming-cursor' : ''}`}>
                                    {msg.streamKey ? (streamingText[msg.streamKey] || '') : msg.text}
                                </p>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start mb-4 msg-enter-left">
                            <div className="bg-white rounded-2xl p-4 rounded-bl-none border border-slate-200">
                                <p className="text-xs text-slate-500 mb-2">ผู้เสนอตัวเป็นนายกกำลังเรียบเรียงคำตอบ...</p>
                                <div className="flex gap-1.5 items-center">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Input or Action Buttons */}
                {!hasAskedQuestion ? (
                    <>
                        <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-lg flex gap-2">
                            <input type="text" className="flex-grow p-3 bg-transparent focus:outline-none text-slate-700"
                                placeholder="ซักถามผู้เสนอตัวเป็นนายก 1 คำถาม..."
                                value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                            <button onClick={handleSendMessage} disabled={isTyping || !inputMessage.trim()}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-3 rounded-lg transition">
                                <Send size={20} />
                            </button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {shuffledQuestions.map(q => (
                                <button key={q} onClick={() => setInputMessage(q)}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-full transition-colors border border-slate-200">{q}</button>
                            ))}
                        </div>
                        <button
                            onClick={async () => {
                                setHasAskedQuestion(true);
                                const scoreData = calculateScore();
                                setScore(scoreData);
                                playFanfare();
                                await saveSession(scoreData);
                                fetchAggregateStats();
                                setStep(5);
                            }}
                            className="mt-3 w-full py-2.5 bg-white border-2 border-dashed border-slate-300 hover:border-blue-300 hover:bg-blue-50 text-slate-500 hover:text-blue-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            ข้ามการถามคำถาม ไปโหวตเลย <ArrowRight size={16} />
                        </button>
                    </>
                ) : (
                    <div className="space-y-3">
                        <button
                            onClick={() => { if (reshuffleCount < 1) { setReshuffleCount(prev => prev + 1); setStep(3); } }}
                            disabled={reshuffleCount >= 1}
                            className="w-full py-3 bg-white border-2 border-slate-200 hover:border-blue-300 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <RotateCcw size={18} /> สภาเสียงข้างมากไม่รับรอง เสนอนายกคนใหม่
                        </button>
                        <button
                            onClick={async () => {
                                const scoreData = calculateScore();
                                setScore(scoreData);
                                playFanfare();
                                await saveSession(scoreData);
                                fetchAggregateStats();
                                setStep(5);
                            }}
                            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            สภาเสียงข้างมากโหวตรับรอง ดูผลลัพธ์ <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // --- AGGREGATE STATS VIEW ---
    const renderAggregateStats = () => {
        if (!aggregateStats) {
            return (
                <div className="text-center py-20 animate-fade-in">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">กำลังโหลดข้อมูล...</p>
                </div>
            );
        }

        const { total_games, pm_distribution, avg_score } = aggregateStats;

        return (
            <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setShowResults(false)} className="text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium"><ArrowLeft size={16} /> กลับ</button>
                    <h2 className="text-xl font-bold text-slate-800">สถิติการจำลอง</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center">
                        <div className="text-3xl font-bold text-blue-600">{total_games}</div>
                        <div className="text-xs text-slate-500">รัฐบาลทั้งหมด</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center">
                        <div className="text-3xl font-bold text-emerald-600">{avg_score || '-'}</div>
                        <div className="text-xs text-slate-500">คะแนนเฉลี่ย</div>
                    </div>
                </div>

                {pm_distribution && Object.keys(pm_distribution).length > 0 && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
                        <h3 className="font-bold text-slate-800 mb-3">นายกที่ผู้เล่นเลือก</h3>
                        <div className="space-y-2">
                            {Object.entries(pm_distribution).sort(([, a], [, b]) => b - a).map(([partyId, count]) => {
                                const pct = total_games > 0 ? Math.round((count / total_games) * 100) : 0;
                                const party = PARTIES.find(p => p.id === partyId);
                                return (
                                    <div key={partyId} className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-slate-700 w-28 truncate">{party?.name || partyId}</span>
                                        <div className="flex-grow h-4 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${party?.color || 'bg-blue-500'}`} style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="text-xs text-slate-500 w-12 text-right">{pct}%</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {total_games === 0 && (
                    <div className="text-center py-10 text-slate-400">
                        <BarChart3 size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="font-bold">ยังไม่มีข้อมูลสถิติ</p>
                        <p className="text-sm">เล่นเกมเพื่อเริ่มเก็บข้อมูล!</p>
                    </div>
                )}
            </div>
        );
    };

    // --- RESULTS SCREEN (Step 5) ---
    const renderResults = () => {
        if (!score) return null;

        const pmPartyId = cabinet['PM'] || coalition[0];
        const pmParty = PARTIES.find(p => p.id === pmPartyId);
        const coalitionParties = PARTIES.filter(p => coalition.includes(p.id));
        const commentary = getCommentary(score);

        const scoreCategories = [
            { label: 'เสถียรภาพรัฐบาล', value: score.coalition, max: 25, color: 'bg-emerald-500', explanation: `เสียงเหนือ 250 = ${totalCoalitionSeats - MAJORITY_THRESHOLD} ที่นั่ง (ยิ่งมากยิ่งดี)` },
            { label: 'นโยบาย: เศรษฐกิจ', value: score.economy, max: 15, color: 'bg-blue-500', explanation: 'สัดส่วนนโยบายเศรษฐกิจที่เลือก' },
            { label: 'นโยบาย: สังคม', value: score.social, max: 15, color: 'bg-purple-500', explanation: 'สัดส่วนนโยบายสังคม+การศึกษาที่เลือก' },
            { label: 'นโยบาย: ความมั่นคง', value: score.security, max: 15, color: 'bg-amber-500', explanation: 'สัดส่วนนโยบายความมั่นคง+สิ่งแวดล้อม+การเมือง' },
            { label: 'นโยบายตรงจุดแข็งพรรคร่วม', value: score.alignment, max: 15, color: 'bg-cyan-500', explanation: 'สัดส่วนนโยบายที่ตรงกับพรรคร่วมรัฐบาล' },
            { label: 'งบประมาณ', value: score.budget, max: 15, color: 'bg-teal-500', explanation: `เลือก ${selectedPolicies.size} นโยบาย (ยิ่งน้อยยิ่งมีวินัย)` },
        ];

        const resetGame = () => {
            setStep(0); setCoalition([]); setCabinet({}); setSelectedPolicies(new Set());
            setChatHistory([{ sender: 'ประธานสภา', text: 'สวัสดีครับ ขณะนี้เปิดให้ผู้เสนอตัวเป็นนายกรัฐมนตรีแสดงวิสัยทัศน์ต่อสภา สมาชิกสภาสามารถซักถามได้ 1 คำถามครับ' }]);
            setInputMessage(''); setReshuffleCount(0); setConfettiFired(false); setScore(null);
            setPolicyCategoryIndex(0); setHasAskedQuestion(false); setStreamingText({}); setStreamingDone({});
            setShowHelper({});
        };

        return (
            <div className="animate-fade-in">
                <div ref={resultsRef} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 mb-6">
                    {/* Score Ring */}
                    <div className="text-center mb-6">
                        <div className="relative inline-block mb-4">
                            <svg width="160" height="160" viewBox="0 0 160 160" className="score-ring">
                                <circle cx="80" cy="80" r="70" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                                <circle cx="80" cy="80" r="70" fill="none" stroke="url(#scoreGrad)" strokeWidth="10"
                                    strokeLinecap="round" strokeDasharray={`${(score.total / 100) * 440} 440`}
                                    transform="rotate(-90 80 80)" className="animate-score-fill" />
                                <defs>
                                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-extrabold text-slate-800">{score.total}</span>
                                <span className="text-xs text-slate-400">/ 100</span>
                            </div>
                        </div>
                        <div className="animate-grade-pop">
                            <span className={`inline-block text-3xl font-extrabold px-4 py-1 rounded-xl ${score.grade === 'A+' || score.grade === 'A' ? 'bg-emerald-100 text-emerald-700' : score.grade.startsWith('B') ? 'bg-blue-100 text-blue-700' : score.grade.startsWith('C') ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                {score.grade}
                            </span>
                        </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="mb-6">
                        <h3 className="font-bold text-slate-800 mb-4">รายละเอียดคะแนน</h3>
                        <div className="space-y-3">
                            {scoreCategories.map(cat => (
                                <div key={cat.label}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600">{cat.label}</span>
                                        <span className="font-bold text-slate-800">{cat.value}/{cat.max}</span>
                                    </div>
                                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${cat.color} transition-all duration-1000`} style={{ width: `${(cat.value / cat.max) * 100}%` }} />
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{cat.explanation}</p>
                                </div>
                            ))}

                            {/* Balance bonus */}
                            {score.balanceBonus > 0 && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-emerald-700 font-bold">โบนัส: ดุลยภาพนโยบาย</span>
                                        <span className="font-bold text-emerald-700">+{score.balanceBonus}</span>
                                    </div>
                                    <p className="text-[10px] text-emerald-600 mt-0.5">แต่ละมิติมี 2+ นโยบาย (เศรษฐกิจ + สังคม + ความมั่นคง)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dynamic Commentary */}
                    <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                        <h3 className="font-bold text-slate-800 mb-2">บทวิเคราะห์</h3>
                        <ul className="space-y-1">
                            {commentary.map((c, i) => (
                                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                    <span className="text-blue-500 mt-0.5">-</span> {c}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Government Summary */}
                    <div>
                        <h3 className="font-bold text-slate-800 mb-3">สรุปรัฐบาลของคุณ</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex gap-2"><span className="text-slate-500 w-20">นายก:</span><span className="font-bold">{pmParty?.name}</span></div>
                            <div className="flex gap-2">
                                <span className="text-slate-500 w-20">ร่วมรัฐบาล:</span>
                                <div className="flex flex-wrap gap-1">{coalitionParties.map(p => <span key={p.id} className={`px-2 py-0.5 rounded text-white text-xs ${p.color}`}>{p.name}</span>)}</div>
                            </div>
                            <div className="flex gap-2"><span className="text-slate-500 w-20">ที่นั่ง:</span><span className="font-bold">{totalCoalitionSeats} / {TOTAL_SEATS}</span></div>
                            <div className="flex gap-2"><span className="text-slate-500 w-20">นโยบาย:</span><span className="font-bold">{selectedPolicies.size} นโยบาย</span></div>
                        </div>
                    </div>

                    {/* Branding */}
                    <div className="text-center mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-400 font-bold">simgov2569.autobahn.bot</p>
                        <p className="text-xs text-slate-300 mt-1">Sim-Government: Thailand 2569</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <button onClick={handleShare}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                        <Camera size={18} /> แชร์ผลลัพธ์
                    </button>
                    <button onClick={() => { setShowResults(true); fetchAggregateStats(); }}
                        className="w-full py-3 bg-white border-2 border-slate-200 hover:border-emerald-300 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                        <BarChart3 size={18} /> ดูผลโหวตทั้งหมด
                    </button>
                    <button onClick={resetGame}
                        className="w-full py-3 bg-white border-2 border-slate-200 hover:border-blue-300 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                        <RotateCcw size={18} /> เล่นใหม่
                    </button>
                </div>
            </div>
        );
    };

    // --- MAIN RENDER ---
    return (
        <div className={`min-h-screen font-sans ${step === 0 ? '' : 'bg-slate-50 p-4 md:p-8'}`}>
            {step === 0 && !showResults && renderIntro()}
            {step === 0 && showResults && (
                <div className="max-w-xl mx-auto py-8 px-4">{renderAggregateStats()}</div>
            )}

            {step >= 1 && (
                <div className="max-w-4xl mx-auto">
                    <header className="mb-2 text-center relative">
                        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Sim-Government: Thailand 2569</h1>
                        <p className="text-sm text-slate-400 mb-4">คุณคือแกนนำจัดตั้งรัฐบาล</p>
                        {/* Mute toggle */}
                        <button onClick={toggleMute} className="absolute top-0 right-0 p-2 text-slate-400 hover:text-slate-600 transition-colors" title={soundMuted ? 'เปิดเสียง' : 'ปิดเสียง'}>
                            {soundMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                    </header>
                    {renderStepIndicator()}
                    {step === 1 && renderCoalitionBuilder()}
                    {step === 2 && renderPolicySelector()}
                    {step === 3 && renderPMNomination()}
                    {step === 4 && renderGovChat()}
                    {step === 5 && !showResults && renderResults()}
                    {step === 5 && showResults && renderAggregateStats()}
                </div>
            )}
        </div>
    );
}
