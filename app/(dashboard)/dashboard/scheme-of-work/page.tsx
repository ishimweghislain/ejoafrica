"use client";

import { useState, useEffect } from "react";
import { Plus, BookOpen, Calendar, Search, Filter, Loader2, ArrowRight, FileText, Layout, MoreVertical, Edit2, Trash2, Layers } from "lucide-react";
import { toast } from "react-hot-toast";
import SchemeModal from "@/components/SchemeModal";

interface Scheme {
    id: string;
    title?: string;
    class: { name: string };
    course: { title: string };
    term: { title: string };
    academicYear: { title: string };
    periodsPerWeek: number;
    reference: string;
    _count: { lessons: number };
}

export default function SchemesOfWorkPage() {
    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    async function fetchSchemes() {
        setLoading(true);
        try {
            const res = await fetch("/api/schemes-of-work");
            const data = await res.json();
            setSchemes(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error("Failed to sync curricular blueprints.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSchemes();
    }, []);

    return (
        <div className="space-y-10 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase tracking-tighter">Curricular Blueprints</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-emerald-600">Strategic planning and pedagogical roadmap management.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-slate-900 text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/10 hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    <Plus className="w-5 h-5" />
                    <span>Provision Blueprint</span>
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex flex-wrap gap-2">
                    {["ALL", "ACTIVE", "ARCHIVED", "DRAFT"].map(status => (
                        <button key={status} className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all">
                            {status}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                        placeholder="Search Strategy..."
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-[1.5rem] pl-12 pr-6 py-3 text-xs font-bold outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {loading ? (
                    <div className="col-span-full py-40 flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Pedagogical Data...</p>
                    </div>
                ) : schemes.length > 0 ? schemes.map(scheme => (
                    <div key={scheme.id} className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all relative">
                        <div className="p-10 space-y-8">
                            <div className="flex items-start justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 italic">
                                            {scheme.academicYear.title}
                                        </span>
                                        <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                                            {scheme.term.title}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-tight group-hover:text-emerald-600 transition-colors">
                                        {scheme.course.title}
                                    </h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 italic">
                                        <Layout className="w-3.5 h-3.5" />
                                        Synchronized with {scheme.class.name}
                                    </p>
                                </div>
                                <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-900 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all transform group-hover:rotate-12">
                                    <BookOpen className="w-8 h-8" />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-50">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Bandwidth</p>
                                    <p className="font-black text-slate-900 text-sm tracking-tight">{scheme.periodsPerWeek} Periods / Week</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Lessons</p>
                                    <p className="font-black text-slate-900 text-sm tracking-tight">{scheme._count.lessons} Nodes</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Coverage</p>
                                    <p className="font-black text-emerald-600 text-sm tracking-tight">74% Complete</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <button className="flex-grow bg-slate-900 text-white py-5 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10">
                                    <span>Access Roadmap</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                                <button className="p-5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-40 flex flex-col items-center gap-6 bg-slate-50/50 rounded-[4rem] border border-dashed border-slate-200">
                        <FileText className="w-16 h-16 text-slate-200" />
                        <div className="text-center space-y-2">
                            <p className="font-black text-slate-900 uppercase tracking-tighter text-xl">No Blueprints Archived</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Initialize a new curricular strategy to begin synchronization.</p>
                        </div>
                    </div>
                )}
            </div>
            <SchemeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchSchemes}
            />
        </div>
    );
}
