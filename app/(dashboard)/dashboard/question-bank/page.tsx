"use client";

import { useState, useEffect } from "react";
import { BookOpen, Plus, Search, Filter, HelpCircle, ArrowRight, Book, Tags, Loader2, User, LayoutGrid } from "lucide-react";
import QuestionModal from "../../../../components/QuestionModal";
import { toast } from "react-hot-toast";

export default function QuestionBankPage() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");

    async function fetchQuestions() {
        setLoading(true);
        try {
            const res = await fetch("/api/questions");
            const data = await res.json();
            setQuestions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load questions.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchQuestions();
    }, []);

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.course.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === "ALL" || q.course.title.toUpperCase() === activeFilter.toUpperCase();
        return matchesSearch && matchesFilter;
    });

    const subjects = ["ALL", ...new Set(questions.map(q => q.course.title))];

    return (
        <div className="space-y-10 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase tracking-tighter">Question Bank</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-emerald-600">A collection of academic questions for student assessments.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-slate-900 text-white rounded-2xl px-8 py-5 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/10 hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Question</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex flex-wrap gap-2">
                    {subjects.slice(0, 6).map(sub => (
                        <button
                            key={sub}
                            onClick={() => setActiveFilter(sub)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeFilter === sub
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                }`}
                        >
                            {sub}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-[1.5rem] pl-12 pr-6 py-3 text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {loading ? (
                    <div className="col-span-full py-32 flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading questions...</p>
                    </div>
                ) : filteredQuestions.length > 0 ? (
                    filteredQuestions.map(q => (
                        <div key={q.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900/[0.02] rounded-full -mr-16 -mt-16"></div>

                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                                        <HelpCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-black uppercase tracking-widest text-[10px] text-emerald-600">{q.course.title}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest border ${q.difficulty === 'HARD' ? 'border-red-100 text-red-500 bg-red-50' :
                                                q.difficulty === 'MEDIUM' ? 'border-orange-100 text-orange-500 bg-orange-50' : 'border-emerald-100 text-emerald-600 bg-emerald-50'
                                                }`}>
                                                {q.difficulty}
                                            </span>
                                            {q.class && (
                                                <span className="text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest bg-slate-100 text-slate-500">
                                                    {q.class.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-300">
                                    <User className="w-3 h-3" />
                                    {q.teacher.firstName}
                                </div>
                            </div>

                            <p className="text-slate-900 font-bold text-lg mb-8 group-hover:text-emerald-600 transition-colors uppercase leading-tight tracking-tighter">
                                {q.text}
                            </p>

                            <div className="space-y-2 mb-8">
                                {q.options.map((opt: string, i: number) => (
                                    <div key={i} className={`p-4 rounded-2xl text-[10px] font-bold border transition-all ${opt === q.correctAnswer
                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                        : 'bg-slate-50/50 border-slate-50 text-slate-500'
                                        }`}>
                                        <span className="opacity-40 mr-3 uppercase">{String.fromCharCode(65 + i)}.</span>
                                        {opt}
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                                <button className="text-[10px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 hover:gap-4 transition-all group-hover:text-emerald-600">
                                    See Details <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Ref: #{q.id.slice(0, 8)}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-40 bg-white rounded-[4rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-8">
                        <div className="bg-slate-50 p-8 rounded-[3rem]">
                            <Book className="w-16 h-16 text-slate-200" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-slate-900 uppercase">No Questions Found</h3>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Add new questions to populate your question bank.</p>
                        </div>
                    </div>
                )}
            </div>

            <QuestionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchQuestions}
            />
        </div>
    );
}
