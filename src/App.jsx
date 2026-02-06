import React, { useState, useEffect, useRef } from 'react';
import {
    Users,
    CheckCircle,
    AlertCircle,
    Send,
    ChevronRight,
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
    Play,
    Briefcase,
    ExternalLink,
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
];

export default function PMSimulator() {
    const [step, setStep] = useState(0); // 0: Intro, 1: Coalition, 2: Policy, 3: Cabinet, 4: Chat
    const [selectedPolicies, setSelectedPolicies] = useState(new Set());
    const [policyCategory, setPolicyCategory] = useState('all');
    const [policySearch, setPolicySearch] = useState('');
    const [coalition, setCoalition] = useState([]);
    const [cabinet, setCabinet] = useState({});
    const [chatLog, setChatHistory] = useState([
        { sender: 'system', text: 'สวัสดีครับท่านนายกฯ คณะรัฐมนตรีพร้อมทำงานแล้วครับ ท่านต้องการสั่งการเรื่องอะไรครับ?' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);

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

    // --- STEP PROGRESS INDICATOR ---
    const renderStepIndicator = () => (
        <div className="flex items-center justify-center gap-0 mb-8">
            {STEP_LABELS.map((s, i) => {
                const stepNum = i + 1;
                const isCompleted = step > stepNum;
                const isActive = step === stepNum;
                const Icon = s.icon;
                return (
                    <React.Fragment key={i}>
                        {i > 0 && (
                            <div className={`step-line w-8 md:w-16 h-0.5 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                        )}
                        <div className="flex flex-col items-center gap-1">
                            <div className={`step-dot w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted
                                ? 'bg-emerald-500 text-white completed'
                                : isActive
                                    ? 'bg-blue-600 text-white active'
                                    : 'bg-slate-200 text-slate-400'
                                }`}>
                                {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                            </div>
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
                    มาจัดตั้งรัฐบาลในฝัน และพูดคุยกับนายกฯ ของคุณ
                </p>

                {/* Sequel Badge */}
                <a
                    href="https://thalay.eu/sim-thailand"
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
                    การเลือกตั้งจบลงแล้ว ประชาชนได้ลงคะแนนเสียง<br />
                    ถึงเวลาที่คุณจะ<strong className="text-slate-600">จัดตั้งรัฐบาล</strong> เลือกนโยบาย แต่งตั้งรัฐมนตรี<br />
                    และ<strong className="text-slate-600">นำพาประเทศ</strong>
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
                        ผลลัพธ์จากการจำลองนี้อ้างอิงจากข้อมูลนโยบายจริงของพรรคการเมือง
                        เพื่อวัตถุประสงค์ทางการศึกษาและการจำลองสถานการณ์เท่านั้น
                        ไม่ใช่การชี้นำทางการเมือง
                    </p>
                </div>

                {/* CTA Button */}
                <button
                    onClick={() => setStep(1)}
                    className="btn-shine px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xl rounded-2xl shadow-xl shadow-blue-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 mb-8 animate-slide-up stagger-6"
                >
                    <Play size={22} /> เริ่มจัดตั้งรัฐบาล
                </button>

                {/* Footer */}
                <div className="flex flex-col items-center gap-3 animate-slide-up stagger-7">
                    <p className="text-xs text-slate-400 font-mono">Sim-Government: Thailand 2569 v0.2.0</p>
                    <a
                        href="https://thalay.eu/sim-thailand"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-400 hover:text-blue-500 transition-colors flex items-center gap-1"
                    >
                        เล่น Sim-Thailand 2569 (ภาคเลือกตั้ง) <ExternalLink size={10} />
                    </a>
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
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedPolicies(newSet);
    };

    const renderPolicySelector = () => {
        const availablePolicies = POLICIES.filter(p => coalition.includes(p.party));

        const filteredPolicies = availablePolicies.filter(p => {
            const matchesCategory = policyCategory === 'all' || p.cat === policyCategory;
            const matchesSearch = p.title.toLowerCase().includes(policySearch.toLowerCase()) ||
                p.desc.toLowerCase().includes(policySearch.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        const categories = [
            { id: 'all', name: 'ทั้งหมด' },
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

        // Count policies per category
        const categoryCounts = {};
        categories.forEach(cat => {
            if (cat.id === 'all') {
                categoryCounts[cat.id] = availablePolicies.length;
            } else {
                categoryCounts[cat.id] = availablePolicies.filter(p => p.cat === cat.id).length;
            }
        });

        return (
            <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setStep(1)} className="text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium">
                        <RotateCcw size={16} /> แก้ไขพรรคร่วม
                    </button>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-slate-800">เลือกนโยบายหลัก</h2>
                        <p className="text-xs text-slate-500">เลือกอย่างน้อย 3 นโยบายเพื่อขับเคลื่อนประเทศ</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 space-y-4">
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
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map(cat => {
                            const count = categoryCounts[cat.id] || 0;
                            if (cat.id !== 'all' && count === 0) return null;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setPolicyCategory(cat.id)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${policyCategory === cat.id
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                        }`}
                                >
                                    {cat.name}
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${policyCategory === cat.id ? 'bg-blue-500 text-blue-100' : 'bg-slate-200 text-slate-500'}`}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
                    {filteredPolicies.map(p => {
                        const party = PARTIES.find(pty => pty.id === p.party);
                        const isSelected = selectedPolicies.has(p.id);
                        const ps = PARTY_STYLES[p.party] || { border: 'border-blue-500', bg: 'bg-blue-50', accent: 'border-l-blue-500' };
                        return (
                            <div
                                key={p.id}
                                onClick={() => togglePolicy(p.id)}
                                className={`choice-card-enhanced p-4 rounded-xl border-2 relative ${isSelected
                                    ? `border-l-4 ${ps.accent} ${ps.bg} border-slate-200 shadow-md card-shimmer`
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
                                    {p.ref && (
                                        <span className="text-slate-300">|</span>
                                    )}
                                    {p.ref && (
                                        <span className="truncate text-slate-400" title={p.ref}>{p.ref}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {filteredPolicies.length === 0 && (
                        <div className="col-span-full text-center py-10 text-slate-500">
                            ไม่พบนโยบายที่ค้นหา
                        </div>
                    )}
                </div>

                {/* Footer Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 p-4 shadow-lg z-50">
                    <div className="max-w-4xl mx-auto flex justify-between items-center">
                        <div>
                            <span className="text-sm text-slate-500">เลือกแล้ว</span>
                            <div className="text-2xl font-bold text-blue-600">{selectedPolicies.size} <span className="text-base text-slate-800">นโยบาย</span></div>
                        </div>
                        <button
                            onClick={() => setStep(3)}
                            disabled={selectedPolicies.size < 3}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2"
                        >
                            ถัดไป {selectedPolicies.size < 3 && '(เลือกอีก ' + (3 - selectedPolicies.size) + ')'} <ChevronRight />
                        </button>
                    </div>
                </div>
                <div className="h-20"></div>
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
                        <Crown size={16} /> พรรคนายกฯ ทุกกระทรวง
                    </button>
                    <button
                        onClick={clearAllAssignments}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-bold transition"
                    >
                        <Trash2 size={16} /> ล้างทั้งหมด
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    Auto-assign: แบ่งกระทรวงตามสัดส่วนที่นั่ง | พรรคนายกฯ: ให้พรรคนายกฯ ทุกกระทรวง
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
                <button onClick={() => setStep(3)} className="text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium">
                    <RotateCcw size={16} /> ปรับ ครม.
                </button>
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
        </div>
    );

    // --- MAIN RENDER ---
    return (
        <div className={`min-h-screen font-sans ${step === 0 ? '' : 'bg-slate-50 p-4 md:p-8'}`}>
            {step === 0 && renderIntro()}

            {step >= 1 && (
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <header className="mb-2 text-center">
                        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Sim-Government: Thailand 2569</h1>
                        <p className="text-sm text-slate-400 mb-4">มาจัดตั้งรัฐบาลในฝัน และพูดคุยกับนายกฯ ของคุณ</p>
                    </header>

                    {/* Step Indicator */}
                    {renderStepIndicator()}

                    {/* Content */}
                    {step === 1 && renderCoalitionBuilder()}
                    {step === 2 && renderPolicySelector()}
                    {step === 3 && renderCabinetMaker()}
                    {step === 4 && renderGovChat()}
                </div>
            )}
        </div>
    );
}
