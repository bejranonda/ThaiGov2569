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
} from 'lucide-react';
import { PARTIES, MINISTRIES, TOTAL_SEATS, MAJORITY_THRESHOLD } from './data';
import { POLICIES } from './policies';

// IDs of original policies that are now grouped (v0.5.0)
const GROUPED_POLICY_IDS = [106, 408, 213, 306, 704];

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
    { icon: FileText, label: 'นโยบาย' },
    { icon: Briefcase, label: 'ครม.' },
    { icon: MessageSquare, label: 'บริหาร' },
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
    const [chatLog, setChatHistory] = useState([
        { sender: 'โฆษกรัฐบาล', text: 'สวัสดีครับท่านนายก คณะรัฐมนตรีพร้อมทำงานแล้วครับ ประชาชนรอถามท่าน 1 คำถามครับ' }
    ]);
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

    const chatEndRef = useRef(null);
    const resultsRef = useRef(null);

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
            setCoalition(coalition.filter(id => id !== partyId));
            const newCabinet = { ...cabinet };
            Object.keys(newCabinet).forEach(key => {
                if (newCabinet[key] === partyId) delete newCabinet[key];
            });
            setCabinet(newCabinet);
        } else {
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
            if (reshuffleCount >= 2) return;
            setReshuffleCount(prev => prev + 1);
        }
        setStep(targetStep);
    };

    // --- Scoring ---
    const calculateScore = () => {
        const margin = Math.max(0, totalCoalitionSeats - MAJORITY_THRESHOLD);
        const coalitionScore = Math.min(25, Math.round((margin / 100) * 25));

        const selectedPolicyObjects = POLICIES.filter(p => selectedPolicies.has(p.id));
        const uniqueCategories = new Set(selectedPolicyObjects.map(p => p.cat));
        const diversityScore = Math.min(25, Math.round((uniqueCategories.size / POLICY_CATEGORIES.length) * 25));

        let expertiseMatches = 0;
        MINISTRIES.forEach(min => {
            const assignedPartyId = cabinet[min.id];
            if (assignedPartyId) {
                const party = PARTIES.find(p => p.id === assignedPartyId);
                if (party && party.policies && party.policies[min.key]) expertiseMatches++;
            }
        });
        const cabinetScore = Math.min(25, Math.round((expertiseMatches / MINISTRIES.length) * 25));

        const userMessages = chatLog.filter(m => m.sender === 'user').length;
        const engagementScore = Math.min(25, userMessages > 0 ? 25 : 0);

        const total = coalitionScore + diversityScore + cabinetScore + engagementScore;
        return { total, coalition: coalitionScore, diversity: diversityScore, cabinet: cabinetScore, engagement: engagementScore };
    };

    // Dynamic commentary
    const getCommentary = (s) => {
        const comments = [];
        if (s.coalition >= 20) comments.push('รัฐบาลมีฐานเสียงที่มั่นคง');
        else if (s.coalition >= 10) comments.push('เสียงข้างมากแต่อาจไม่มั่นคง');
        else comments.push('รัฐบาลเสียงปริ่มน้ำ อาจมีปัญหาในสภา');

        if (s.diversity >= 20) comments.push('นโยบายครอบคลุมทุกด้าน');
        else if (s.diversity >= 10) comments.push('นโยบายดีแต่ยังขาดบางมิติ');
        else comments.push('นโยบายยังไม่ครอบคลุมเท่าที่ควร');

        if (s.cabinet >= 20) comments.push('ครม. ตรงกับจุดแข็งของแต่ละพรรค');
        else comments.push('บางกระทรวงอาจไม่ตรงกับความเชี่ยวชาญพรรค');

        if (s.engagement >= 15) comments.push('ถามคำถามที่ดีต่อรัฐบาล');
        else comments.push('ยังไม่ได้ถามคำถามรัฐบาล');

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
                    score_diversity: scoreData.diversity, score_cabinet: scoreData.cabinet,
                    score_engagement: scoreData.engagement,
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

            // Get PM party emoji ONLY (No mixing)
            const pmEmoji = PARTY_EMOJI[pmPartyId] || '🎉';

            // Create shape from emoji
            const pmShape = confetti.shapeFromText({ text: pmEmoji, scalar: 4 });

            // Grand opening burst
            const duration = 3000;
            const end = Date.now() + duration;

            // 1. Center burst (The "Grand" start)
            confetti({
                particleCount: 50,
                spread: 100,
                origin: { y: 0.4 },
                shapes: [pmShape],
                scalar: 3,
                drift: 0,
                ticks: 300
            });

            // 2. Side cannons (Shower effect)
            (function frame() {
                const timeLeft = end - Date.now();
                if (timeLeft <= 0) return;

                confetti({
                    particleCount: 3,
                    angle: 60,
                    spread: 45,
                    origin: { x: 0 },
                    shapes: [pmShape],
                    scalar: 2.5
                });
                confetti({
                    particleCount: 3,
                    angle: 120,
                    spread: 45,
                    origin: { x: 1 },
                    shapes: [pmShape],
                    scalar: 2.5
                });

                requestAnimationFrame(frame);
            }());

            // 3. Random rain from top
            const rainInterval = setInterval(() => {
                const timeLeft = end - Date.now();
                if (timeLeft <= 0) {
                    clearInterval(rainInterval);
                    return;
                }
                confetti({
                    particleCount: 2,
                    angle: 270,
                    spread: 180,
                    origin: { x: Math.random(), y: 0 },
                    shapes: [pmShape],
                    scalar: 3,
                    gravity: 0.8,
                    drift: (Math.random() - 0.5) * 0.5
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

        try {
            // Build full context
            const selectedPolicyTitles = POLICIES.filter(p => selectedPolicies.has(p.id)).map(p => p.title);
            const cabinetMapping = {};
            Object.entries(cabinet).forEach(([minId, partyId]) => {
                const ministry = MINISTRIES.find(m => m.id === minId);
                const party = PARTIES.find(p => p.id === partyId);
                if (ministry && party) cabinetMapping[ministry.name] = party.name;
            });

            const context = {
                message: currentInput,
                cabinet,
                coalition,
                policies: selectedPolicyTitles,
                cabinetMapping,
                coalitionSeats: totalCoalitionSeats,
            };

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(context),
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            if (data.responses && Array.isArray(data.responses)) {
                // Sequential streaming: PM first, then Opposition when PM completes
                const pmResp = data.responses[0];
                const oppResp = data.responses[1];

                const pmKey = `pm-${Date.now()}`;
                const oppKey = `opp-${Date.now()}`;

                // Add PM message immediately
                setChatHistory(prev => [...prev, {
                    sender: pmResp.sender, text: pmResp.text,
                    partyColor: pmResp.partyColor, streamKey: pmKey,
                }]);

                // Stream PM first, then Opposition when PM completes
                streamText(pmKey, pmResp.text, 20);

                // Add and stream Opposition after PM finishes
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

    // --- STEP PROGRESS INDICATOR ---
    const renderStepIndicator = () => (
        <div className="flex items-center justify-center gap-0 mb-8">
            {STEP_LABELS.map((s, i) => {
                const stepNum = i + 1;
                const isCompleted = step > stepNum;
                const isActive = step === stepNum;
                const isClickable = stepNum < step && !(stepNum === 3 && step >= 4 && reshuffleCount >= 2);
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

                <p className="text-slate-500 text-base md:text-lg font-medium mb-6 animate-slide-up stagger-3">มาจัดตั้งรัฐบาลในฝัน และพูดคุยกับนายกของคุณ</p>

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
                    onClick={() => setStep(1)}
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
                    <a href="https://github.com/bejranonda/ThaiGov2569" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-blue-500 transition-colors font-mono mt-2">v0.4.0</a>
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
                        const ps = PARTY_STYLES[party.id] || { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-600', glow: '' };
                        return (
                            <button key={party.id} onClick={() => toggleParty(party.id)}
                                className={`choice-card-enhanced p-4 rounded-xl border-2 relative overflow-hidden text-left ${isSelected ? `${ps.border} ${ps.bg} ${ps.glow} shadow-md animate-card-pulse` : 'border-slate-200 hover:border-slate-300 hover:shadow bg-white'}`}>
                                {isSelected && <div className={`absolute top-1.5 right-1.5 ${ps.text} animate-check-pop`}><CheckCircle size={18} /></div>}
                                <div className="font-bold text-slate-800 text-base mb-1">{party.name}</div>
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
                            setStep(2);
                        }
                    }}
                    disabled={totalCoalitionSeats < MAJORITY_THRESHOLD}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2"
                >
                    ถัดไป: เลือกนโยบาย <ChevronRight />
                </button>
            </div>
        </div>
    );

    // --- POLICY SELECTOR (Step 2) - Step through categories ---
    const togglePolicy = (id) => {
        const newSet = new Set(selectedPolicies);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedPolicies(newSet);
    };

    const renderPolicySelector = () => {
        const currentCat = activeCategories[policyCategoryIndex];
        if (!currentCat) return null;
        const policiesInCat = shuffledPoliciesByCategory[currentCat.id] || [];
        const selectedInCat = policiesInCat.filter(p => selectedPolicies.has(p.id)).length;

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
                            <span>หมวด {policyCategoryIndex + 1}/{activeCategories.length}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-blue-600">เลือกแล้ว {selectedPolicies.size} นโยบาย</span>
                        </div>

                        <button
                            onClick={() => {
                                if (policyCategoryIndex < activeCategories.length - 1) {
                                    setPolicyCategoryIndex(policyCategoryIndex + 1);
                                } else {
                                    setStep(3);
                                }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow transition flex items-center gap-1 text-sm flex-shrink-0"
                        >
                            {policyCategoryIndex < activeCategories.length - 1 ? 'ถัดไป' : 'เลือกเสร็จ'} <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Category progress bar */}
                <div className="flex gap-1 mb-4">
                    {activeCategories.map((cat, idx) => {
                        const catPolicies = shuffledPoliciesByCategory[cat.id] || [];
                        const hasSelected = catPolicies.some(p => selectedPolicies.has(p.id));
                        return (
                            <button key={cat.id} onClick={() => setPolicyCategoryIndex(idx)}
                                className={`flex-1 h-2 rounded-full transition-all ${idx === policyCategoryIndex ? 'bg-blue-500' : hasSelected ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                        );
                    })}
                </div>

                {/* Category heading */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">{currentCat.name}</h2>
                    <p className="text-xs text-slate-500 mt-1">{policiesInCat.length} นโยบาย | เลือกแล้ว {selectedInCat} ในหมวดนี้</p>
                </div>

                {/* Policy cards - no party names shown */}
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
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // --- CABINET MAKER (Step 3) ---
    const renderCabinetMaker = () => (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => { setPolicyCategoryIndex(activeCategories.length - 1); setStep(2); }} className="text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium">
                    <RotateCcw size={16} /> ย้อนกลับไปเลือกนโยบาย
                </button>
                <h2 className="text-xl font-bold text-slate-800">จัดสรรโควตารัฐมนตรี</h2>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
                <div className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2"><Zap size={16} /> ตั้งค่าอัตโนมาติ</div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={autoAssignCabinet} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg text-sm font-bold transition shadow-sm">
                        <Zap size={16} /> Auto-assign
                    </button>
                    <button onClick={assignAllToPmParty} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition shadow-sm">
                        <Crown size={16} /> พรรคนายกทุกกระทรวง
                    </button>
                    <button onClick={clearAllAssignments} className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-bold transition">
                        <Trash2 size={16} /> ล้างทั้งหมด
                    </button>
                </div>
            </div>

            {/* Ministry Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {MINISTRIES.map(min => {
                    const assignedParty = cabinet[min.id] ? PARTIES.find(p => p.id === cabinet[min.id]) : null;
                    return (
                        <div key={min.id} className={`bg-white p-4 rounded-xl shadow-sm border-2 flex items-center gap-4 transition-all ${assignedParty ? 'border-slate-200' : 'border-dashed border-slate-300'}`}>
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${assignedParty ? assignedParty.color + ' text-white' : 'bg-slate-100 text-slate-500'} transition-colors`}>
                                <min.icon size={24} />
                            </div>
                            <div className="flex-grow">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{min.name}</label>
                                <select className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={cabinet[min.id] || ''} onChange={(e) => assignMinister(min.id, e.target.value)}>
                                    <option value="" disabled>-- เลือกพรรค --</option>
                                    {coalition.map(pId => {
                                        const party = PARTIES.find(p => p.id === pId);
                                        return <option key={pId} value={pId}>{party.name} ({party.seats})</option>;
                                    })}
                                </select>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end">
                <button onClick={() => setStep(4)} disabled={Object.keys(cabinet).length < MINISTRIES.length}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2">
                    จัดตั้งรัฐบาลสำเร็จ! เข้าทำเนียบ <ChevronRight />
                </button>
            </div>
        </div>
    );

    // --- GOVERNMENT CHAT (Step 4) - 1 question, streaming, action buttons ---
    const renderGovChat = () => {
        const allStreamed = Object.keys(streamingDone).length > 0 && Object.values(streamingDone).every(v => v);

        return (
            <div className="animate-fade-in h-[600px] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <h2 className="text-lg font-bold text-slate-800">ห้องแถลงข่าวรัฐบาล</h2>
                    </div>
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
                            <div className="bg-white rounded-2xl p-4 rounded-bl-none border border-slate-200 flex gap-1.5 items-center">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
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
                                placeholder="ถามรัฐบาล 1 คำถาม (เช่น เศรษฐกิจแก้ยังไง, ลดค่าไฟไหม...)"
                                value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                            <button onClick={handleSendMessage} disabled={isTyping || !inputMessage.trim()}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-3 rounded-lg transition">
                                <Send size={20} />
                            </button>
                        </div>
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {['จะแก้ปัญหาเศรษฐกิจยังไง', 'ขอลดค่าไฟหน่อย', 'ปราบยาเสพติดยังไง', 'การศึกษาจะดีขึ้นไหม'].map(q => (
                                <button key={q} onClick={() => setInputMessage(q)}
                                    className="whitespace-nowrap px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-full transition-colors border border-slate-200">{q}</button>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="space-y-3">
                        <button
                            onClick={() => { if (reshuffleCount < 2) { setReshuffleCount(prev => prev + 1); setStep(3); } }}
                            disabled={reshuffleCount >= 2}
                            className="w-full py-3 bg-white border-2 border-slate-200 hover:border-blue-300 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <RotateCcw size={18} /> ปรับ ครม. (เหลือ {2 - reshuffleCount} ครั้ง)
                        </button>
                        <button
                            onClick={() => {
                                const scoreData = calculateScore();
                                setScore(scoreData);
                                saveSession(scoreData);
                                fetchAggregateStats();
                                setStep(5);
                            }}
                            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            ยืนยันจัดตั้งรัฐบาล ดูผลลัพธ์ <ArrowRight size={18} />
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
            { label: 'เสถียรภาพรัฐบาล', value: score.coalition, max: 25, color: 'bg-emerald-500' },
            { label: 'นโยบายครอบคลุมทุกมิติ', value: score.diversity, max: 25, color: 'bg-blue-500' },
            { label: 'ครม. ตรงกับจุดแข็งพรรค', value: score.cabinet, max: 25, color: 'bg-purple-500' },
            { label: 'ถามคำถามสำคัญ', value: score.engagement, max: 25, color: 'bg-amber-500' },
        ];

        const resetGame = () => {
            setStep(0); setCoalition([]); setCabinet({}); setSelectedPolicies(new Set());
            setChatHistory([{ sender: 'โฆษกรัฐบาล', text: 'สวัสดีครับท่านนายก คณะรัฐมนตรีพร้อมทำงานแล้วครับ ประชาชนรอถามท่าน 1 คำถามครับ' }]);
            setInputMessage(''); setReshuffleCount(0); setConfettiFired(false); setScore(null);
            setPolicyCategoryIndex(0); setHasAskedQuestion(false); setStreamingText({}); setStreamingDone({});
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
                                </div>
                            ))}
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
                        <p className="text-xs text-slate-300">Sim-Government: Thailand 2569 | thalay.eu</p>
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
                    <header className="mb-2 text-center">
                        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Sim-Government: Thailand 2569</h1>
                        <p className="text-sm text-slate-400 mb-4">มาจัดตั้งรัฐบาลในฝัน และพูดคุยกับนายกของคุณ</p>
                    </header>
                    {renderStepIndicator()}
                    {step === 1 && renderCoalitionBuilder()}
                    {step === 2 && renderPolicySelector()}
                    {step === 3 && renderCabinetMaker()}
                    {step === 4 && renderGovChat()}
                    {step === 5 && !showResults && renderResults()}
                    {step === 5 && showResults && renderAggregateStats()}
                </div>
            )}
        </div>
    );
}
