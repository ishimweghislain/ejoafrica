"use client";

import { useState, useEffect } from "react";
import { Plus, BookOpen, Calendar, Clock, MapPin, CheckCircle2, MoreVertical, Search, Loader2, ArrowRight, Book, Layers, Trash2, Edit } from "lucide-react";
import { toast } from "react-hot-toast";
import LessonModal from "@/components/LessonModal";

interface Lesson {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    scheme: {
        id: string;
        courseId: string;
        course: { title: string };
        class: { name: string };
    };
    unit: {
        title: string;
    };
    evaluation: string;
    teachingMethod: string;
}

export default function LessonPlanPage() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [schemes, setSchemes] = useState<any[]>([]);
    const [selectedScheme, setSelectedScheme] = useState<any>(null);

    async function fetchData() {
        setLoading(true);
        try {
            const [lRes, uRes, sRes] = await Promise.all([
                fetch("/api/lessons"),
                fetch("/api/auth/me"),
                fetch("/api/schemes-of-work")
            ]);
            const [lData, uData, sData] = await Promise.all([
                lRes.json(),
                uRes.json(),
                sRes.json()
            ]);
            setLessons(Array.isArray(lData) ? lData : []);
            setUser(uData);

            const teacherSchemes = Array.isArray(sData) ? sData.filter((s: any) => s.teacherId === uData.userId || uData.role === "DOS") : [];
            setSchemes(teacherSchemes);
            if (teacherSchemes.length > 0) setSelectedScheme(teacherSchemes[0]);
        } catch (err) {
            toast.error("Failed to load data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="space-y-10 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase tracking-tighter">Lesson Plans</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-emerald-600">Plan and track your daily lessons.</p>
                </div>

                {user?.role === "TEACHER" && (
                    <div className="flex gap-4">
                        {schemes.length > 0 && (
                            <div className="flex flex-col">
                                <label className="text-[8px] font-black uppercase text-slate-400 mb-1 ml-2">Target Scheme</label>
                                <select
                                    className="bg-white border border-slate-100 rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm"
                                    value={selectedScheme?.id || ""}
                                    onChange={(e) => setSelectedScheme(schemes.find(s => s.id === e.target.value))}
                                >
                                    {schemes.map(s => (
                                        <option key={s.id} value={s.id}>{s.course.title} - {s.class.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-slate-900 text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/10 hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 self-end"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Lesson</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="relative z-10 space-y-6">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold tracking-tight uppercase">Today's Progress</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Tasks for today</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-[11px] font-bold">
                                    <span>Plan Completion</span>
                                    <span>85%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white w-[85%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading lessons...</p>
                        </div>
                    ) : lessons.length > 0 ? lessons.map(lesson => (
                        <div key={lesson.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all group">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="space-y-4 flex-grow">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-slate-50 text-slate-400 rounded-md border border-slate-100">
                                            {lesson.scheme.class.name}
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
                                            {lesson.scheme.course.title}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors uppercase leading-tight tracking-tighter">
                                        {lesson.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-6">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <Layers className="w-4 h-4 text-emerald-500" />
                                            {lesson.unit.title}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <Clock className="w-4 h-4 text-emerald-500" />
                                            {new Date(lesson.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                                {user?.role === "TEACHER" && (
                                    <div className="flex gap-2">
                                        <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="py-32 flex flex-col items-center gap-6 bg-slate-50/50 rounded-[4rem] border border-dashed border-slate-200">
                            <BookOpen className="w-16 h-16 text-slate-200" />
                            <div className="text-center space-y-2">
                                <p className="font-black text-slate-900 uppercase tracking-tighter text-xl">No Lessons Found</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Create a lesson plan to get started.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <LessonModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
                schemeId={selectedScheme?.id}
                courseId={selectedScheme?.courseId}
            />
        </div>
    );
}
