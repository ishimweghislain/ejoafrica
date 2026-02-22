"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Plus, BookOpen, Search, Loader2, ArrowRight,
    FileText, Layout, Edit2, Layers, Users
} from "lucide-react";
import { toast } from "react-hot-toast";
import SchemeOfWorkModal from "@/components/SchemeModal";

interface Scheme {
    id: string;
    courseId: string;
    class: { name: string };
    course: {
        title: string;
        topics: { subtopics: { units: any[] }[] }[];
    };
    term: { title: string };
    academicYear: { title: string };
    periodsPerWeek: number;
    teacher?: { firstName: string; lastName: string };
    _count: { lessons: number };
}

export default function SchemesOfWorkPage() {
    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [search, setSearch] = useState("");

    async function fetchData() {
        setLoading(true);
        try {
            const [sRes, uRes] = await Promise.all([
                fetch("/api/schemes-of-work"),
                fetch("/api/auth/me")
            ]);
            const [sData, uData] = await Promise.all([sRes.json(), uRes.json()]);
            setSchemes(Array.isArray(sData) ? sData : []);
            setUser(uData);
        } catch (err) {
            toast.error("Failed to load teaching plans.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchData(); }, []);

    const canCreate = user?.role === "TEACHER" || user?.role === "DOS" || user?.role === "SCHOOL_ADMIN";

    const filtered = schemes.filter(s =>
        s.course.title.toLowerCase().includes(search.toLowerCase()) ||
        s.class.name.toLowerCase().includes(search.toLowerCase())
    );

    // Count total units across all topics->subtopics->units
    function countUnits(scheme: Scheme) {
        let count = 0;
        scheme.course.topics?.forEach(t => t.subtopics?.forEach(s => { count += s.units?.length || 0; }));
        return count;
    }

    return (
        <div className="space-y-10 animate-fade-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Teaching Plans</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                        {user?.role === "DOS"
                            ? "All schemes of work across the school"
                            : "Your lesson schemes and curriculum tracking"}
                    </p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-slate-900 text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/10 hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create New Plan</span>
                    </button>
                )}
            </div>

            {/* Search bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="relative flex-grow">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                        placeholder="Search by course or class..."
                        className="w-full bg-slate-50/50 border border-slate-100 rounded-[1.5rem] pl-12 pr-6 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
                    {filtered.length} plan{filtered.length !== 1 ? "s" : ""} found
                </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {loading ? (
                    <div className="col-span-full py-40 flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading teaching plans...</p>
                    </div>
                ) : filtered.length > 0 ? filtered.map(scheme => {
                    const unitCount = countUnits(scheme);
                    return (
                        <div key={scheme.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all relative">
                            <div className="p-10 space-y-8">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap items-center gap-2">
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
                                            {scheme.class.name}
                                        </p>
                                        {scheme.teacher && (
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {scheme.teacher.firstName} {scheme.teacher.lastName}
                                            </p>
                                        )}
                                    </div>
                                    <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-900 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all transform group-hover:rotate-12 shrink-0">
                                        <BookOpen className="w-8 h-8" />
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-50">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Schedule</p>
                                        <p className="font-black text-slate-900 text-sm">{scheme.periodsPerWeek} Periods / Week</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Lessons Taught</p>
                                        <p className="font-black text-slate-900 text-sm">{scheme._count.lessons} Lessons</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Units in Syllabus</p>
                                        <p className={`font-black text-sm ${unitCount > 0 ? "text-emerald-600" : "text-amber-500"}`}>
                                            {unitCount > 0 ? `${unitCount} Units` : "No units yet"}
                                        </p>
                                    </div>
                                </div>

                                {/* Warning if no units */}
                                {unitCount === 0 && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-amber-500 shrink-0" />
                                        <p className="text-[9px] font-black uppercase tracking-widest text-amber-600">
                                            No units in syllabus — DOS must add units before teachers can log lessons.
                                        </p>
                                    </div>
                                )}

                                {/* CTA */}
                                <div className="flex items-center gap-3 pt-2">
                                    <Link
                                        href={`/dashboard/scheme-of-work/${scheme.id}`}
                                        className="flex-grow bg-slate-900 text-white py-5 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-900/10"
                                    >
                                        <span>Open Lesson Roadmap</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    {canCreate && (
                                        <button className="p-5 bg-slate-50 text-slate-400 rounded-2xl hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="col-span-full py-40 flex flex-col items-center gap-6 bg-slate-50/50 rounded-[4rem] border border-dashed border-slate-200">
                        <FileText className="w-16 h-16 text-slate-200" />
                        <div className="text-center space-y-2">
                            <p className="font-black text-slate-900 uppercase tracking-tighter text-xl">No Plans Found</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                {search ? "No plans match your search." : canCreate ? "Start by creating a new teaching plan." : "No teaching plans have been assigned yet."}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <SchemeOfWorkModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    );
}
