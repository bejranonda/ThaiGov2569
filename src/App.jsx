import React, { useState, useEffect, useRef } from 'react';
import {
    Users,
    CheckCircle,
    AlertCircle,
    Send,
    ChevronRight,
    RotateCcw,
    Search,
    Check
} from 'lucide-react';
import { PARTIES, MINISTRIES, TOTAL_SEATS, MAJORITY_THRESHOLD } from './data';
import { POLICIES } from './policies';

export default function PMSimulator() {
    const [step, setStep] = useState(1); // 1: Coalition, 2: Policy, 3: Cabinet, 4: Chat
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
            // Remove from cabinet if removed from coalition
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

    // --- AI Chat Logic ---
    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMsg = { sender: 'user', text: inputMessage };
        setChatHistory(prev => [...prev, userMsg]);
        const currentInput = inputMessage;
        setInputMessage('');
        setIsTyping(true);

        try {
            // Prepare context for AI
            const context = {
                message: currentInput,
                cabinet: cabinet, // { "MOF": "PTP", ... }
                coalition: coalition,
                policies: Array.from(selectedPolicies)
            };

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(context),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // Handle new format (responses array) or old format (single response)
            if (data.responses && Array.isArray(data.responses)) {
                // New format: PM + Opposition
                data.responses.forEach(resp => {
                    setChatHistory(prev => [...prev, {
                        sender: resp.sender,
                        text: resp.text,
                        partyColor: resp.partyColor
                    }]);
                });
            } else {
                // Old format (backwards compatibility)
                setChatHistory(prev => [...prev, {
                    sender: data.responder,
                    text: data.text,
                    partyColor: data.partyColor
                }]);
            }

        } catch (error) {
            console.error('AI Error:', error);
            // Fallback or Error message
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

    // --- SCREENS ---

    const renderCoalitionBuilder = () => (
        <div className="animate-fade-in">
            <div className="bg-white p-6 rounded-xl shadow-lg mb-6 border border-slate-200">
                <div className="flex justify-between items-end mb-4">
                    <h2 className="text-xl font-bold text-slate-800">1. รวมเสียงจัดตั้งรัฐบาล</h2>
                    <div className="text-right">
                        <span className="text-sm text-slate-500">ที่นั่งรวม</span>
                        <div className={`text-3xl font-bold ${totalCoalitionSeats >= MAJORITY_THRESHOLD ? 'text-green-600' : 'text-red-500'}`}>
                            {totalCoalitionSeats} / {TOTAL_SEATS}
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 text-slate-600">
                            {totalCoalitionSeats < MAJORITY_THRESHOLD ? 'เสียงข้างน้อย (ตั้งไม่ได้)' : totalCoalitionSeats > 375 ? 'รัฐบาลมั่นคงมาก' : 'รัฐบาลเสียงข้างมาก'}
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden mb-6 relative">
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-black z-10 opacity-20"></div> {/* 250 line */}
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                        style={{ width: `${(totalCoalitionSeats / TOTAL_SEATS) * 100}%` }}
                    ></div>
                </div>

                {/* Party Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {PARTIES.map(party => (
                        <button
                            key={party.id}
                            onClick={() => toggleParty(party.id)}
                            className={`p-3 rounded-lg border-2 transition-all relative overflow-hidden ${coalition.includes(party.id)
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-slate-200 hover:border-blue-300 hover:shadow'
                                }`}
                        >
                            {coalition.includes(party.id) && (
                                <div className="absolute top-1 right-1 text-blue-600"><CheckCircle size={16} /></div>
                            )}
                            <div className={`w-8 h-8 rounded-full ${party.color} flex items-center justify-center text-white text-xs font-bold mb-2`}>
                                {party.id}
                            </div>
                            <div className="font-bold text-slate-800">{party.name}</div>
                            <div className="text-xs text-slate-500">{party.seats} ที่นั่ง</div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => {
                        if (totalCoalitionSeats >= MAJORITY_THRESHOLD) {
                            // Auto assign PM to largest party
                            const largestPartyId = coalition.sort((a, b) => {
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

    const togglePolicy = (id) => {
        const newSet = new Set(selectedPolicies);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedPolicies(newSet);
    };

    const renderPolicySelector = () => {
        // Filter policies: Must be from a coalition party
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

        return (
            <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setStep(1)} className="text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium">
                        <RotateCcw size={16} /> แก้ไขพรรคร่วม
                    </button>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-slate-800">2. เลือกนโยบายหลัก</h2>
                        <p className="text-xs text-slate-500">เลือกอย่างน้อย 3 นโยบายเพื่อขับเคลื่อนประเทศ</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 space-y-4">
                    {/* Search */}
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
                    {/* Categories */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setPolicyCategory(cat.id)}
                                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${policyCategory === cat.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
                    {filteredPolicies.map(p => {
                        const party = PARTIES.find(pty => pty.id === p.party);
                        const isSelected = selectedPolicies.has(p.id);
                        return (
                            <div
                                key={p.id}
                                onClick={() => togglePolicy(p.id)}
                                className={`cursor-pointer p-4 rounded-xl border-2 transition-all relative ${isSelected
                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                    : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded text-white ${party.color}`}>
                                        {party.name}
                                    </span>
                                    {isSelected && <Check className="text-blue-600" size={20} />}
                                </div>
                                <h3 className="font-bold text-slate-800 mb-1">{p.title}</h3>
                                <p className="text-sm text-slate-600 mb-3">{p.desc}</p>
                                <div className="text-xs text-slate-400 flex items-center gap-1">
                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded uppercase">{p.cat}</span>
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
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-50">
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
                <div className="h-20"></div> {/* Spacer for fixed footer */}
            </div>
        );
    };

    const renderCabinetMaker = () => (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => setStep(2)} className="text-slate-500 hover:text-blue-600 flex items-center gap-1 font-medium">
                    <RotateCcw size={16} /> ย้อนกลับไปเลือกนโยบาย
                </button>
                <h2 className="text-xl font-bold text-slate-800">3. จัดสรรโควตารัฐมนตรี</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {MINISTRIES.map(min => (
                    <div key={min.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
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
                                    return <option key={pId} value={pId}>{party.name} ({party.seats})</option>
                                })}
                            </select>
                        </div>
                    </div>
                ))}
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
                    <div key={idx} className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
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
                    <div className="flex justify-start mb-4">
                        <div className="bg-white rounded-2xl p-4 rounded-bl-none border border-slate-200 flex gap-1">
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
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
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition"
                >
                    <Send size={20} />
                </button>
            </div>

            {/* Suggestion Chips */}
            <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                {['จะแก้ปัญหาเศรษฐกิจยังไง', 'ขอลดค่าไฟหน่อย', 'ปราบยาเสพติดยังไง', 'การศึกษาจะดีขึ้นไหม', 'เงินดิจิทัลได้เมื่อไหร่'].map(q => (
                    <button
                        key={q}
                        onClick={() => { setInputMessage(q); }}
                        className="whitespace-nowrap px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-600 text-xs rounded-full transition"
                    >
                        {q}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2">🇹🇭 PM Simulator 2569</h1>
                    <p className="text-slate-500">เกมจำลองการจัดตั้งรัฐบาลและบริหารประเทศด้วยนโยบายจริง</p>
                </header>

                {/* Content */}
                {step === 1 && renderCoalitionBuilder()}
                {step === 2 && renderPolicySelector()}
                {step === 3 && renderCabinetMaker()}
                {step === 4 && renderGovChat()}

            </div>
        </div>
    );
}
