import React, { useState, useEffect, useRef } from 'react';
import {
    Users,
    CheckCircle,
    AlertCircle,
    Send,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    RotateCcw,
    Search,
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
} from 'lucide-react';
import { PARTIES, MINISTRIES, TOTAL_SEATS, MAJORITY_THRESHOLD } from './data';
import { POLICIES } from './policies';

// Party-colored selection styles
const PARTY_STYLES = {
    PTP: { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-600', glow: 'card-glow-red', accent: 'border-l-red-500' },
    PP: { border: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-600', glow: 'card-glow-orange', accent: 'border-l-orange-500' },
    BJT: { border: 'border-blue-700', bg: 'bg-blue-50', text: 'text-blue-700', glow: 'card-glow-blue', accent: 'border-l-blue-700' },
    PPRP: { border: 'border-blue-600', bg: 'bg-blue-50', text: 'text-blue-600', glow: 'card-glow-blue-light', accent: 'border-l-blue-600' },
    UTN: { border: 'border-blue-800', bg: 'bg-blue-50', text: 'text-blue-800', glow: 'card-glow-blue-dark', accent: 'border-l-blue-800' },
    DEM: { border: 'border-cyan-500', bg: 'bg-cyan-50', text: 'text-cyan-600', glow: 'card-glow-cyan', accent: 'border-l-cyan-500' },
    CTP: { border: 'border-pink-500', bg: 'bg-pink-50', text: 'text-pink-600', glow: 'card-glow-pink', accent: 'border-l-pink-500' },
    PCC: { border: 'border-amber-700', bg: 'bg-amber-50', text: 'text-amber-700', glow: 'card-glow-amber', accent: 'border-l-amber-700' },
    TKM: { border: 'border-cyan-400', bg: 'bg-cyan-50', text: 'text-cyan-500', glow: 'card-glow-cyan-light', accent: 'border-l-cyan-400' },
    OKM: { border: 'border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600', glow: 'card-glow-emerald', accent: 'border-l-emerald-500' },
};

const STEP_LABELS = [
    { icon: Users, label: 'รวมเสียง' },
    { icon: FileText, label: 'นโยบาย' },
    { icon: Briefcase, label: 'ครม.' },
    { icon: MessageSquare, label: 'บริหาร' },
    { icon: BarChart3, label: 'ผลลัพธ์' },
];

const POLICY_BUDGET = 10;

const POLICY_CATEGORIES = [
    { id: 'economy', name: 'เศรษฐกิจ' },
    { id: 'social', name: 'สังคม' },
    { id: 'education', name: 'การศึกษา' },
    { id: 'security', name: 'ความมั่นคง' },
    { id: 'environment', name: 'สิ่งแวดล้อม' },
    { id: 'politics', name: 'การเมือง' },
    { id: 'tech', name: 'เทคโนโลยี' },
    { id: 'justice', name: 'ยุติธรรม' },
    { id: 'health', name: 'สาธารณสุข' },
    { id: 'interior', name: 'ปกครอง' },
];

export default function PMSimulator() {
    const [step, setStep] = useState(0); // 0: Intro, 1: Coalition, 2: Policy, 3: Cabinet, 4: Chat, 5: Results
    const [selectedPolicies, setSelectedPolicies] = useState(new Set());
    const [policyCategory, setPolicyCategory] = useState('all');
    const [policySearch, setPolicySearch] = useState('');
    const [coalition, setCoalition] = useState([]);
    const [cabinet, setCabinet] = useState({});
    const [chatLog, setChatHistory] = useState([
        { sender: 'system', text: 'สวัสดีครับท่านนายก คณะรัฐมนตรีพร้อมทำงานแล้วครับ ท่านต้องการสั่งการเรื่องอะไรครับ?' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [reshuffleCount, setReshuffleCount] = useState(0);
    const [confettiFired, setConfettiFired] = useState(false);
    const [score, setScore] = useState(null);
    const [aggregateStats, setAggregateStats] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState(null);

    const chatEndRef = useRef(null);

    const totalCoalitionSeats = coalition.reduce((sum, pId) => {
        const party = PARTIES.find(p => p.id === pId);
        return sum + (party ? party.seats : 0);
    }, 0);

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

        if (cabinet['PM']) {
            newCabinet['PM'] = cabinet['PM'];
        }
        setCabinet(newCabinet);
    };

    const clearAllAssignments = () => {
        setCabinet({});
    };

    const assignAllToPmParty = () => {
        const pmPartyId = cabinet['PM'] || [...coalition].sort((a, b) => {
            const pA = PARTIES.find(p => p.id === a).seats;
            const pB = PARTIES.find(p => p.id === b).seats;
            return pB - pA;
        })[0];

        const newCabinet = { 'PM': pmPartyId };
        MINISTRIES.forEach(min => {
            newCabinet[min.id] = pmPartyId;
        });
        setCabinet(newCabinet);
    };

    // --- Navigation ---
    const navigateToStep = (targetStep) => {
        if (targetStep >= step) return; // Only backward
        // Going back to cabinet from chat/results costs a reshuffle
        if (targetStep === 3 && step >= 4) {
            if (reshuffleCount >= 2) return;
            setReshuffleCount(prev => prev + 1);
        }
        setStep(targetStep);
    };

    // --- Scoring ---
    const calculateScore = () => {
        // Coalition stability (25 pts): margin above 250
        const margin = Math.max(0, totalCoalitionSeats - MAJORITY_THRESHOLD);
        const coalitionScore = Math.min(25, Math.round((margin / 100) * 25));

        // Policy diversity (25 pts): unique categories covered
        const selectedPolicyObjects = POLICIES.filter(p => selectedPolicies.has(p.id));
        const uniqueCategories = new Set(selectedPolicyObjects.map(p => p.cat));
        const diversityScore = Math.min(25, Math.round((uniqueCategories.size / POLICY_CATEGORIES.length) * 25));

        // Cabinet expertise (25 pts): party assigned has relevant policy key
        let expertiseMatches = 0;
        MINISTRIES.forEach(min => {
            const assignedPartyId = cabinet[min.id];
            if (assignedPartyId) {
                const party = PARTIES.find(p => p.id === assignedPartyId);
                if (party && party.policies && party.policies[min.key]) {
                    expertiseMatches++;
                }
            }
        });
        const cabinetScore = Math.min(25, Math.round((expertiseMatches / MINISTRIES.length) * 25));

        // Engagement (25 pts): chat messages sent (capped at 10)
        const userMessages = chatLog.filter(m => m.sender === 'user').length;
        const engagementScore = Math.min(25, Math.round((Math.min(userMessages, 10) / 10) * 25));

        const total = coalitionScore + diversityScore + cabinetScore + engagementScore;
        let grade = 'F';
        if (total >= 90) grade = 'A';
        else if (total >= 75) grade = 'B';
        else if (total >= 60) grade = 'C';
        else if (total >= 40) grade = 'D';

        return {
            total,
            coalition: coalitionScore,
            diversity: diversityScore,
            cabinet: cabinetScore,
            engagement: engagementScore,
            grade,
        };
    };

    // --- Save session to backend ---
    const saveSession = async (scoreData) => {
        try {
            const sessionId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
            const pmPartyId = cabinet['PM'] || coalition[0];
            await fetch('/api/stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    pm_party: pmPartyId,
                    coalition: coalition,
                    coalition_seats: totalCoalitionSeats,
                    selected_policies: Array.from(selectedPolicies),
                    policy_count: selectedPolicies.size,
                    cabinet: cabinet,
                    chat_questions: chatLog.filter(m => m.sender === 'user').map(m => m.text),
                    chat_count: chatLog.filter(m => m.sender === 'user').length,
                    score_total: scoreData.total,
                    score_coalition: scoreData.coalition,
                    score_diversity: scoreData.diversity,
                    score_cabinet: scoreData.cabinet,
                    score_engagement: scoreData.engagement,
                    grade: scoreData.grade,
                }),
            });
        } catch (err) {
            console.error('Failed to save session:', err);
        }
    };

    // --- Fetch aggregate stats ---
    const fetchAggregateStats = async () => {
        try {
            const res = await fetch('/api/stats');
            if (res.ok) {
                const data = await res.json();
                setAggregateStats(data);
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    // --- Fire confetti ---
    const fireConfetti = async () => {
        if (confettiFired) return;
        setConfettiFired(true);
        try {
            const confettiModule = await import('canvas-confetti');
            const confetti = confettiModule.default;
            const pmPartyId = cabinet['PM'] || coalition[0];
            const colorMap = {
                PP: ['#f97316', '#ea580c', '#fb923c'],
                PTP: ['#dc2626', '#ef4444', '#f87171'],
                BJT: ['#1d4ed8', '#2563eb', '#3b82f6'],
                PPRP: ['#2563eb', '#3b82f6', '#60a5fa'],
                UTN: ['#1e3a5f', '#1e40af', '#3b82f6'],
                DEM: ['#06b6d4', '#22d3ee', '#67e8f9'],
                CTP: ['#ec4899', '#f472b6', '#f9a8d4'],
                PCC: ['#b45309', '#d97706', '#f59e0b'],
                TKM: ['#22d3ee', '#67e8f9', '#a5f3fc'],
                OKM: ['#10b981', '#34d399', '#6ee7b7'],
            };
            const colors = colorMap[pmPartyId] || ['#3b82f6', '#6366f1', '#8b5cf6'];

            // Left cannon
            confetti({ particleCount: 80, spread: 70, origin: { x: 0.1, y: 0.6 }, colors, ticks: 200 });
            // Right cannon
            confetti({ particleCount: 80, spread: 70, origin: { x: 0.9, y: 0.6 }, colors, ticks: 200 });
            // Delayed burst
            setTimeout(() => {
                confetti({ particleCount: 50, spread: 100, origin: { x: 0.5, y: 0.4 }, colors, ticks: 150 });
            }, 500);
        } catch (err) {
            console.error('Confetti failed:', err);
        }
    };

    // --- AI Chat Logic ---
    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMsg = { sender: 'user', text: inputMessage };
        setChatHistory(prev => [...prev, userMsg]);
        const currentInput = inputMessage;
        setInputMessage('');
        setIsTyping(true);

        try {
            const context = {
                message: currentInput,
                cabinet: cabinet,
                coalition: coalition,
                policies: Array.from(selectedPolicies)
            };

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(context),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();

            if (data.responses && Array.isArray(data.responses)) {
                data.responses.forEach(resp => {
                    setChatHistory(prev => [...prev, {
                        sender: resp.sender,
                        text: resp.text,
                        partyColor: resp.partyColor
                    }]);
                });
            } else {
                setChatHistory(prev => [...prev, {
                    sender: data.responder,
                    text: data.text,
                    partyColor: data.partyColor
                }]);
            }
        } catch (error) {
            console.error('AI Error:', error);
            setChatHistory(prev => [...prev, {
                sender: 'System',
                text: 'ขออภัยครับ ระบบสื่อสารขัดข้อง (AI ไม่ตอบสนอง) กรุณาลองใหม่',
                partyColor: 'bg-gray-500'
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatLog]);

    // Fire confetti when entering step 4
    useEffect(() => {
        if (step === 4 && !confettiFired) {
            fireConfetti();
        }
    }, [step]);

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
                        {i > 0 && (
                            <div className={`step-line w-6 md:w-12 h-0.5 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                        )}
                        <div className="flex flex-col items-center gap-1">
                            <button
                                onClick={() => isClickable && navigateToStep(stepNum)}
                                disabled={!isClickable}
                                className={`step-dot w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted
                                    ? 'bg-emerald-500 text-white completed'
                                    : isActive
                                        ? 'bg-blue-600 text-white active'
                                        : 'bg-slate-200 text-slate-400'
                                    } ${isClickable ? 'cursor-pointer hover:scale-110 hover:ring-4 ring-blue-200' : ''}`}
                            >
                                {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                            </button>
                            <span className={`text-[10px] font-bold ${isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {s.label}
                            </span>
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

                {/* Hero Icon with Pulse Rings */}
                <div className="relative mb-8 animate-slide-up stagger-1">
                    <div className="absolute inset-0 w-24 h-24 md:w-28 md:h-28 rounded-full bg-blue-500/20 animate-pulse-ring" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                    <div className="absolute inset-0 w-24 h-24 md:w-28 md:h-28 rounded-full bg-indigo-500/15 animate-pulse-ring" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', animationDelay: '0.5s' }} />
                    <div className="relative w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-200 animate-float">
                        <Landmark className="text-white" size={48} />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-1 animate-slide-up stagger-2">
                    Sim-Government
                </h1>
                <div className="flex items-center gap-2 mb-4 animate-slide-up stagger-2">
                    <span className="text-xl md:text-2xl font-bold text-slate-400">Thailand</span>
                    <span className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-[length:200%_auto] animate-text-gradient">
                        2569
                    </span>
                </div>

                {/* Tagline */}
                <p className="text-slate-500 text-base md:text-lg font-medium mb-6 animate-slide-up stagger-3">
                    มาจัดตั้งรัฐบาลในฝัน และพูดคุยกับนายกของคุณ
                </p>

                {/* Sequel Badge */}
                <a
                    href="https://thalay.eu/sim2569"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-6 hover:bg-blue-200 transition-colors animate-slide-up stagger-3"
                >
                    <ArrowRight size={14} />
                    ภาคต่อจาก Sim-Thailand 2569
                    <ExternalLink size={12} />
                </a>

                {/* Narrative */}
                <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md mx-auto mb-8 animate-slide-up stagger-4">
                    ถึงเวลาที่คุณจะจัดตั้งรัฐบาล และนำพาประเทศไปข้างหน้า
                </p>

                {/* Game Flow Preview */}
                <div className="flex items-center gap-2 md:gap-4 mb-8 animate-slide-up stagger-5">
                    {STEP_LABELS.map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <React.Fragment key={i}>
                                {i > 0 && <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />}
                                <div className="flex flex-col items-center gap-1.5">
                                    <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-xl shadow-md border border-slate-200 flex items-center justify-center text-blue-600 hover:shadow-lg transition-shadow">
                                        <Icon size={24} />
                                    </div>
                                    <span className="text-[10px] md:text-xs font-bold text-slate-500">{s.label}</span>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Disclaimer */}
                <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl max-w-md mx-auto animate-slide-up stagger-5">
                    <p className="text-amber-700 text-xs leading-relaxed">
                        <AlertCircle size={14} className="inline mr-1 -mt-0.5" />
                        <strong>คำเตือน:</strong>{' '}
                        ผลลัพธ์จากการจำลองนี้อ้างอิงจากข้อมูลนโยบายของพรรคการเมือง
                        เพื่อวัตถุประสงค์ทางการศึกษาและการจำลองสถานการณ์เท่านั้น
                        ไม่ใช่การชี้นำทางการเมือง
                    </p>
                </div>

                {/* CTA Button */}
                <button
                    onClick={() => setStep(1)}
                    className="btn-shine px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xl rounded-2xl shadow-xl shadow-blue-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 mb-6 animate-slide-up stagger-6"
                >
                    <Play size={22} /> เริ่มจัดตั้งรัฐบาล
                </button>

                {/* Bottom Navigation */}
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-8 animate-slide-up stagger-6">
                    <a
                        href="https://thalay.eu/policy2569"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-sm"
                    >
                        <FileText size={16} /> ดูนโยบายทุกพรรค <ExternalLink size={12} />
                    </a>
                    <button
                        onClick={() => { setShowResults(true); fetchAggregateStats(); }}
                        className="px-5 py-2.5 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-sm"
                    >
                        <BarChart3 size={16} /> ดูผลโหวตและการตั้งรัฐบาล
                    </button>
                </div>

                {/* Footer */}
                <div className="flex flex-col items-center gap-4 animate-slide-up stagger-7">
                    {/* Election reference */}
                    <div className="flex flex-col items-center gap-1 text-xs text-slate-400">
                        <span>อ้างอิงข้อมูลจำนวนที่นั่ง สส. ก่อนผลเลือกตั้ง</span>
                        <span className="text-slate-300">อ้างอิงข้อมูลจำนวนที่นั่ง สส. หลังเลือกตั้ง: <span className="text-amber-500">รอประกาศผล</span></span>
                    </div>

                    {/* Version with GitHub link */}
                    <a
                        href="https://github.com/bejranonda/ThaiGov2569"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-400 hover:text-blue-500 transition-colors font-mono"
                    >
                        Sim-Government: Thailand 2569 v0.3.0
                    </a>

                    {/* Developer credits - logos */}
                    <div className="flex items-center gap-4 opacity-40 hover:opacity-100 transition-all duration-300">
                        <a
                            href="https://thalay.eu/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="grayscale hover:grayscale-0 transition-all duration-300"
                        >
                            <img src="https://thalay.eu/wp-content/uploads/2021/04/Thalay.eu3-Transparent150.png" alt="thalay.eu" className="h-8" />
                        </a>
                        <a
                            href="https://www.facebook.com/thalay.eu"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                        >
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );

    // --- COALITION BUILDER (Step 1) ---
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
                        <span className={`text-xs font-medium px-2 py-1 rounded ${totalCoalitionSeats >= MAJORITY_THRESHOLD
                            ? totalCoalitionSeats > 375
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-600'
                            }`}>
                            {totalCoalitionSeats < MAJORITY_THRESHOLD ? 'เสียงข้างน้อย (ตั้งไม่ได้)' : totalCoalitionSeats > 375 ? 'รัฐบาลมั่นคงมาก' : 'รัฐบาลเสียงข้างมาก'}
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative mb-6">
                    <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden relative">
                        <div
                            className={`h-full transition-all duration-500 rounded-full ${totalCoalitionSeats >= MAJORITY_THRESHOLD
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                : 'bg-gradient-to-r from-red-400 to-orange-400'
                                }`}
                            style={{ width: `${Math.min(100, (totalCoalitionSeats / TOTAL_SEATS) * 100)}%` }}
                        />
                    </div>
                    {/* Threshold marker */}
                    <div className="absolute left-1/2 -top-1 -translate-x-1/2 flex flex-col items-center">
                        <div className="w-0.5 h-6 bg-slate-400" />
                        <span className="text-[9px] text-slate-500 font-bold mt-0.5">250</span>
                    </div>
                </div>

                {/* Party Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {PARTIES.map(party => {
                        const isSelected = coalition.includes(party.id);
                        const ps = PARTY_STYLES[party.id] || { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-600', glow: '' };
                        return (
                            <button
                                key={party.id}
                                onClick={() => toggleParty(party.id)}
                                className={`choice-card-enhanced p-3 rounded-xl border-2 relative overflow-hidden text-left ${isSelected
                                    ? `${ps.border} ${ps.bg} ${ps.glow} shadow-md animate-card-pulse`
                                    : 'border-slate-200 hover:border-slate-300 hover:shadow bg-white'
                                    }`}
                            >
                                {isSelected && (
                                    <div className={`absolute top-1.5 right-1.5 ${ps.text} animate-check-pop`}>
                                        <CheckCircle size={18} />
                                    </div>
                                )}
                                <div className={`w-10 h-10 rounded-lg ${party.color} flex items-center justify-center text-white text-xs font-bold mb-2 shadow-sm`}>
                                    {party.id}
                                </div>
                                <div className="font-bold text-slate-800 text-sm">{party.name}</div>
                                <div className="text-xs text-slate-500 mb-1">{party.seats} ที่นั่ง</div>
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

    // --- POLICY SELECTOR (Step 2) ---
    const togglePolicy = (id) => {
        const newSet = new Set(selectedPolicies);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            if (newSet.size >= POLICY_BUDGET) return; // Budget exhausted
            newSet.add(id);
        }
        setSelectedPolicies(newSet);
    };

    const renderPolicySelector = () => {
        const availablePolicies = POLICIES.filter(p => coalition.includes(p.party));
        const budgetRemaining = POLICY_BUDGET - selectedPolicies.size;
        const budgetExhausted = budgetRemaining <= 0;
        const isSearching = policySearch.trim().length > 0;

        const filteredPolicies = availablePolicies.filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(policySearch.toLowerCase()) ||
                p.desc.toLowerCase().includes(policySearch.toLowerCase());
            return matchesSearch;
        });

        // Group available policies by category
        const groupedByCategory = {};
        POLICY_CATEGORIES.forEach(cat => {
            const policies = availablePolicies.filter(p => p.cat === cat.id);
            if (policies.length > 0) {
                const selectedInCat = policies.filter(p => selectedPolicies.has(p.id)).length;
                groupedByCategory[cat.id] = { ...cat, policies, selectedCount: selectedInCat };
            }
        });

        const renderPolicyCard = (p) => {
            const party = PARTIES.find(pty => pty.id === p.party);
            const isSelected = selectedPolicies.has(p.id);
            const isDisabled = !isSelected && budgetExhausted;
            const ps = PARTY_STYLES[p.party] || { border: 'border-blue-500', bg: 'bg-blue-50', accent: 'border-l-blue-500' };
            return (
                <div
                    key={p.id}
                    onClick={() => !isDisabled && togglePolicy(p.id)}
                    className={`choice-card-enhanced p-4 rounded-xl border-2 relative ${isSelected
                        ? `border-l-4 ${ps.accent} ${ps.bg} border-slate-200 shadow-md card-shimmer`
                        : isDisabled
                            ? 'border-slate-200 bg-white opacity-50 cursor-not-allowed'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded text-white ${party.color}`}>
                            {party.name}
                        </span>
                        {isSelected && (
                            <span className="animate-check-pop">
                                <Check className="text-blue-600" size={20} />
                            </span>
                        )}
                    </div>
                    <h3 className="font-bold text-slate-800 mb-1">{p.title}</h3>
                    <p className="text-sm text-slate-600 mb-3">{p.desc}</p>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded uppercase">{p.cat}</span>
                        {p.ref && <span className="text-slate-300">|</span>}
                        {p.ref && <span className="truncate text-slate-400" title={p.ref}>{p.ref}</span>}
                    </div>
                </div>
            );
        };

        return (
            <div className="animate-fade-in">
                {/* Sticky Header */}
                <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-slate-200 -mx-4 md:-mx-8 px-4 md:px-8 py-3 mb-6 shadow-sm">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                        <button onClick={() => setStep(1)} className="text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium text-sm flex-shrink-0">
                            <ArrowLeft size={16} /> แก้ไขพรรคร่วม
                        </button>

                        {/* Budget Meter */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex gap-1">
                                {Array.from({ length: POLICY_BUDGET }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2.5 h-2.5 rounded-full transition-all ${i < selectedPolicies.size
                                            ? 'bg-blue-500 scale-110'
                                            : 'bg-slate-200'
                                            } ${budgetExhausted ? 'animate-pulse' : ''}`}
                                    />
                                ))}
                            </div>
                            <span className={`text-sm font-bold ${budgetExhausted ? 'text-red-500' : 'text-slate-600'}`}>
                                {selectedPolicies.size}/{POLICY_BUDGET}
                            </span>
                        </div>

                        <button
                            onClick={() => setStep(3)}
                            disabled={selectedPolicies.size < 3}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-6 py-2 rounded-lg font-bold shadow transition flex items-center gap-1 text-sm flex-shrink-0"
                        >
                            ถัดไป {selectedPolicies.size < 3 && `(อีก ${3 - selectedPolicies.size})`} <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Title */}
                <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-slate-800">เลือกนโยบายหลัก</h2>
                    <p className="text-xs text-slate-500">เลือก 3-{POLICY_BUDGET} นโยบายเพื่อขับเคลื่อนประเทศ</p>
                </div>

                {/* Budget Exhausted Notice */}
                {budgetExhausted && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-center animate-fade-in">
                        <p className="text-amber-700 text-sm font-bold">งบนโยบายหมดแล้ว! ยกเลิกนโยบายเดิมเพื่อเลือกใหม่</p>
                    </div>
                )}

                {/* Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="ค้นหานโยบาย... (เช่น เงินดิจิทัล, เกณฑ์ทหาร)"
                            value={policySearch}
                            onChange={(e) => setPolicySearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Accordion Categories or Search Results */}
                {isSearching ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {filteredPolicies.map(p => renderPolicyCard(p))}
                        {filteredPolicies.length === 0 && (
                            <div className="col-span-full text-center py-10 text-slate-500">ไม่พบนโยบายที่ค้นหา</div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3 mb-8">
                        {Object.entries(groupedByCategory).map(([catId, catData]) => {
                            const isExpanded = expandedCategory === catId;
                            return (
                                <div key={catId} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                                    <button
                                        onClick={() => setExpandedCategory(isExpanded ? null : catId)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-slate-800">{catData.name}</span>
                                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                                                {catData.policies.length} นโยบาย
                                            </span>
                                            {catData.selectedCount > 0 && (
                                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                                                    เลือกแล้ว {catData.selectedCount}
                                                </span>
                                            )}
                                        </div>
                                        {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                                    </button>
                                    {isExpanded && (
                                        <div className="px-4 pb-4 animate-accordion-open">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {catData.policies.map(p => renderPolicyCard(p))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    // --- CABINET MAKER (Step 3) ---
    const renderCabinetMaker = () => (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => setStep(2)} className="text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium">
                    <RotateCcw size={16} /> ย้อนกลับไปเลือกนโยบาย
                </button>
                <h2 className="text-xl font-bold text-slate-800">จัดสรรโควตารัฐมนตรี</h2>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
                <div className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
                    <Zap size={16} />
                    ตั้งค่าอัตโนมาติ
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={autoAssignCabinet}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg text-sm font-bold transition shadow-sm"
                    >
                        <Zap size={16} /> Auto-assign
                    </button>
                    <button
                        onClick={assignAllToPmParty}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition shadow-sm"
                    >
                        <Crown size={16} /> พรรคนายกทุกกระทรวง
                    </button>
                    <button
                        onClick={clearAllAssignments}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-bold transition"
                    >
                        <Trash2 size={16} /> ล้างทั้งหมด
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    Auto-assign: แบ่งกระทรวงตามสัดส่วนที่นั่ง | พรรคนายก: ให้พรรคนายกทุกกระทรวง
                </p>
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
                                <select
                                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={cabinet[min.id] || ''}
                                    onChange={(e) => assignMinister(min.id, e.target.value)}
                                >
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

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 flex gap-3">
                <AlertCircle className="text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> เลือกพรรคให้ตรงกับจุดแข็งของเขา (เช่น เพื่อไทย-คลัง, ภูมิใจไทย-มหาดไทย) จะทำให้รัฐบาลตอบคำถามได้ตรงจุด!
                </p>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => setStep(4)}
                    disabled={Object.keys(cabinet).length < MINISTRIES.length}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2"
                >
                    จัดตั้งรัฐบาลสำเร็จ! เข้าทำเนียบ <ChevronRight />
                </button>
            </div>
        </div>
    );

    // --- GOVERNMENT CHAT (Step 4) ---
    const renderGovChat = () => (
        <div className="animate-fade-in h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => { if (reshuffleCount < 2) { setReshuffleCount(prev => prev + 1); setStep(3); } }}
                        disabled={reshuffleCount >= 2}
                        className="text-slate-500 hover:text-blue-600 disabled:text-slate-300 disabled:cursor-not-allowed flex items-center gap-1 font-medium"
                    >
                        <RotateCcw size={16} /> ปรับ ครม.
                    </button>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                        {[0, 1].map(i => (
                            <div key={i} className={`w-2 h-2 rounded-full ${i < reshuffleCount ? 'bg-red-400' : 'bg-slate-200'}`} />
                        ))}
                        <span className="ml-1">({2 - reshuffleCount} ครั้ง)</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <h2 className="text-lg font-bold text-slate-800">ห้องแถลงข่าวรัฐบาล</h2>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-grow bg-slate-100 rounded-2xl p-4 overflow-y-auto mb-4 border border-slate-200 shadow-inner">
                {chatLog.map((msg, idx) => (
                    <div key={idx} className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} ${msg.sender === 'user' ? 'msg-enter-right' : 'msg-enter-left'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.sender === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white text-slate-700 rounded-bl-none border border-slate-200'
                            }`}>
                            {msg.sender !== 'user' && (
                                <div className="text-xs font-bold mb-1 flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${msg.partyColor || 'bg-slate-400'}`}></div>
                                    {msg.sender}
                                </div>
                            )}
                            <p className="text-sm leading-relaxed">{msg.text}</p>
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

            {/* Input Area */}
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-lg flex gap-2">
                <input
                    type="text"
                    className="flex-grow p-3 bg-transparent focus:outline-none text-slate-700"
                    placeholder="ถามรัฐบาล (เช่น เศรษฐกิจแก้ยังไง, ลดค่าไฟไหม...)"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                    onClick={handleSendMessage}
                    disabled={isTyping || !inputMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white p-3 rounded-lg transition"
                >
                    <Send size={20} />
                </button>
            </div>

            {/* Suggestion Chips */}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['จะแก้ปัญหาเศรษฐกิจยังไง', 'ขอลดค่าไฟหน่อย', 'ปราบยาเสพติดยังไง', 'การศึกษาจะดีขึ้นไหม', 'เงินดิจิทัลได้เมื่อไหร่'].map(q => (
                    <button
                        key={q}
                        onClick={() => setInputMessage(q)}
                        className="whitespace-nowrap px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs rounded-full transition-colors border border-slate-200"
                    >
                        {q}
                    </button>
                ))}
            </div>

            {/* Finish Button */}
            <button
                onClick={() => {
                    const scoreData = calculateScore();
                    setScore(scoreData);
                    saveSession(scoreData);
                    setStep(5);
                }}
                className="mt-4 w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
                <BarChart3 size={20} /> จบบริหาร - ดูผลลัพธ์
            </button>
        </div>
    );

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

        const { total_games, pm_distribution, avg_score, grade_distribution } = aggregateStats;
        const pmPartyNames = { PTP: 'เพื่อไทย', PP: 'ประชาชน', BJT: 'ภูมิใจไทย', PPRP: 'พลังประชารัฐ', UTN: 'รทสช.', DEM: 'ประชาธิปัตย์', CTP: 'ชาติไทยพัฒนา', PCC: 'ประชาชาติ', TKM: 'ไทยก้าวใหม่', OKM: 'โอกาสใหม่' };
        const gradeColors = { A: 'bg-emerald-500', B: 'bg-blue-500', C: 'bg-amber-500', D: 'bg-orange-500', F: 'bg-red-500' };

        return (
            <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setShowResults(false)} className="text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium">
                        <ArrowLeft size={16} /> กลับ
                    </button>
                    <h2 className="text-xl font-bold text-slate-800">สถิติการจำลอง</h2>
                </div>

                {/* Overview */}
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

                {/* PM Distribution */}
                {Object.keys(pm_distribution).length > 0 && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
                        <h3 className="font-bold text-slate-800 mb-3">นายกที่ผู้เล่นเลือก</h3>
                        <div className="space-y-2">
                            {Object.entries(pm_distribution)
                                .sort(([, a], [, b]) => b - a)
                                .map(([partyId, count]) => {
                                    const pct = total_games > 0 ? Math.round((count / total_games) * 100) : 0;
                                    const party = PARTIES.find(p => p.id === partyId);
                                    return (
                                        <div key={partyId} className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-slate-700 w-24 truncate">{pmPartyNames[partyId] || partyId}</span>
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

                {/* Grade Distribution */}
                {Object.keys(grade_distribution).length > 0 && (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
                        <h3 className="font-bold text-slate-800 mb-3">เกรดผู้เล่น</h3>
                        <div className="flex gap-3 justify-center">
                            {['A', 'B', 'C', 'D', 'F'].map(grade => (
                                <div key={grade} className="text-center">
                                    <div className={`w-12 h-12 rounded-full ${gradeColors[grade]} text-white font-bold text-lg flex items-center justify-center mb-1`}>
                                        {grade}
                                    </div>
                                    <div className="text-xs text-slate-500">{grade_distribution[grade] || 0}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {total_games === 0 && (
                    <div className="text-center py-10 text-slate-400">
                        <BarChart3 size={48} className="mx-auto mb-4 opacity-30" />
                        <p>ยังไม่มีข้อมูลสถิติ</p>
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
        const gradeColors = { A: 'from-emerald-400 to-emerald-600', B: 'from-blue-400 to-blue-600', C: 'from-amber-400 to-amber-600', D: 'from-orange-400 to-orange-600', F: 'from-red-400 to-red-600' };
        const gradeEmoji = { A: 'ยอดเยี่ยม!', B: 'ดีมาก!', C: 'พอใช้', D: 'ต้องปรับปรุง', F: 'ล้มเหลว' };

        const scoreCategories = [
            { label: 'เสถียรภาพรัฐบาล', value: score.coalition, max: 25, color: 'bg-emerald-500' },
            { label: 'ความหลากหลายนโยบาย', value: score.diversity, max: 25, color: 'bg-blue-500' },
            { label: 'ความเชี่ยวชาญ ครม.', value: score.cabinet, max: 25, color: 'bg-purple-500' },
            { label: 'การมีส่วนร่วม', value: score.engagement, max: 25, color: 'bg-amber-500' },
        ];

        const resetGame = () => {
            setStep(0);
            setCoalition([]);
            setCabinet({});
            setSelectedPolicies(new Set());
            setChatHistory([{ sender: 'system', text: 'สวัสดีครับท่านนายก คณะรัฐมนตรีพร้อมทำงานแล้วครับ ท่านต้องการสั่งการเรื่องอะไรครับ?' }]);
            setInputMessage('');
            setReshuffleCount(0);
            setConfettiFired(false);
            setScore(null);
            setExpandedCategory(null);
        };

        return (
            <div className="animate-fade-in">
                {/* Score Ring */}
                <div className="text-center mb-8">
                    <div className="relative inline-block mb-4">
                        <svg width="160" height="160" viewBox="0 0 160 160" className="score-ring">
                            <circle cx="80" cy="80" r="70" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                            <circle
                                cx="80" cy="80" r="70" fill="none"
                                stroke="url(#scoreGrad)" strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={`${(score.total / 100) * 440} 440`}
                                transform="rotate(-90 80 80)"
                                className="animate-score-fill"
                            />
                            <defs>
                                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-extrabold text-slate-800">{score.total}</span>
                            <span className="text-xs text-slate-400">/ 100</span>
                        </div>
                    </div>

                    {/* Grade */}
                    <div className="animate-grade-pop">
                        <span className={`inline-block text-5xl font-black bg-gradient-to-br ${gradeColors[score.grade]} bg-clip-text text-transparent`}>
                            {score.grade}
                        </span>
                        <p className="text-lg font-bold text-slate-600 mt-1">{gradeEmoji[score.grade]}</p>
                    </div>
                </div>

                {/* Score Breakdown */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                    <h3 className="font-bold text-slate-800 mb-4">รายละเอียดคะแนน</h3>
                    <div className="space-y-3">
                        {scoreCategories.map(cat => (
                            <div key={cat.label}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-600">{cat.label}</span>
                                    <span className="font-bold text-slate-800">{cat.value}/{cat.max}</span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${cat.color} transition-all duration-1000`}
                                        style={{ width: `${(cat.value / cat.max) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Government Summary */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                    <h3 className="font-bold text-slate-800 mb-4">สรุปรัฐบาลของคุณ</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex gap-2">
                            <span className="text-slate-500 w-20">นายก:</span>
                            <span className="font-bold">{pmParty?.name}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-slate-500 w-20">ร่วมรัฐบาล:</span>
                            <div className="flex flex-wrap gap-1">
                                {coalitionParties.map(p => (
                                    <span key={p.id} className={`px-2 py-0.5 rounded text-white text-xs ${p.color}`}>{p.name}</span>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-slate-500 w-20">ที่นั่ง:</span>
                            <span className="font-bold">{totalCoalitionSeats} / {TOTAL_SEATS}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-slate-500 w-20">นโยบาย:</span>
                            <span className="font-bold">{selectedPolicies.size} นโยบาย</span>
                        </div>
                    </div>
                </div>

                {/* Aggregate Stats (if available) */}
                {aggregateStats && aggregateStats.total_games > 0 && (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                        <h3 className="font-bold text-slate-800 mb-3">เปรียบเทียบกับผู้เล่นอื่น</h3>
                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div>
                                <div className="text-2xl font-bold text-blue-600">{aggregateStats.total_games}</div>
                                <div className="text-xs text-slate-500">ผู้เล่นทั้งหมด</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-emerald-600">{aggregateStats.avg_score || '-'}</div>
                                <div className="text-xs text-slate-500">คะแนนเฉลี่ย</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={resetGame}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
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
                <div className="max-w-xl mx-auto py-8 px-4">
                    {renderAggregateStats()}
                </div>
            )}

            {step >= 1 && (
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <header className="mb-2 text-center">
                        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Sim-Government: Thailand 2569</h1>
                        <p className="text-sm text-slate-400 mb-4">มาจัดตั้งรัฐบาลในฝัน และพูดคุยกับนายกของคุณ</p>
                    </header>

                    {/* Step Indicator */}
                    {renderStepIndicator()}

                    {/* Content */}
                    {step === 1 && renderCoalitionBuilder()}
                    {step === 2 && renderPolicySelector()}
                    {step === 3 && renderCabinetMaker()}
                    {step === 4 && renderGovChat()}
                    {step === 5 && renderResults()}
                </div>
            )}
        </div>
    );
}
