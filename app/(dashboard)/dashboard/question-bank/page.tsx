"use client";

import { useState } from "react";
import { BookOpen, Plus, Search, Filter, HelpCircle, ArrowRight, Book, Tags, Loader2 } from "lucide-react";

export default function QuestionBankPage() {
    const [loading, setLoading] = useState(false);

    const questions = [
        { id: 1, text: "Explain the Newton's Third Law of Motion with relevant examples.", subject: "Physics", difficulty: "HARD", tags: ["Mechanics", "Dynamics"] },
        { id: 2, title: "Solve the quadratic equation x^2 + 5x + 6 = 0.", subject: "Mathematics", difficulty: "EASY", tags: ["Algebra"] },
        { id: 3, title: "Describe the process of photosynthesis in green plants.", subject: "Biology", difficulty: "MEDIUM", tags: ["Botany", "Physiology"] },
    ];

    return (
        <div className="space-y-10 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase tracking-tighter">Knowledge Repository</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-emerald-600">Centralized academic question bank for assessment engineering.</p>
                </div>
                <button className="bg-slate-900 text-white rounded-2xl px-8 py-5 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/10 hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                    <Plus className="w-5 h-5" />
                    <span>Create Question Node</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex flex-wrap gap-2">
                    {["ALL", "Physics", "Mathematics", "Biology", "Chemistry"].map(sub => (
                        <button key={sub} className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">
                            {sub}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                        placeholder="Search Knowledge..."
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-[1.5rem] pl-12 pr-6 py-3 text-xs font-bold outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {questions.map(q => (
                    <div key={q.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900/[0.02] rounded-full -mr-16 -mt-16"></div>

                        <div className="flex items-start justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                                    <HelpCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-black uppercase tracking-widest text-[10px] text-emerald-600">{q.subject}</h4>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest border ${q.difficulty === 'HARD' ? 'border-red-100 text-red-500 bg-red-50' :
                                            q.difficulty === 'MEDIUM' ? 'border-orange-100 text-orange-500 bg-orange-50' : 'border-emerald-100 text-emerald-600 bg-emerald-50'
                                        }`}>
                                        {q.difficulty}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-slate-900 font-bold text-lg mb-8 group-hover:text-emerald-600 transition-colors uppercase leading-tight tracking-tighter">
                            {q.text || q.title}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-8">
                            {q.tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-100">
                                    <Tags className="w-2.5 h-2.5" />
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                            <button className="text-[10px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 hover:gap-4 transition-all group-hover:text-emerald-600">
                                View Full Schema <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Node ID: #{q.id}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
