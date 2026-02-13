"use client";

import { useState, useEffect, use } from "react";
import { Plus, Layout, Book, Layers, ChevronRight, Loader2, ArrowLeft, Trash2, Edit2, Calendar, Clock, BookOpen, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LessonModal from "@/components/LessonModal";

interface Lesson {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    unit: { title: string };
    evaluation?: string;
}

interface Scheme {
    id: string;
    courseId: string;
    course: { title: string };
    class: { name: string };
    academicYear: { title: string };
    term: { title: string };
    lessons: Lesson[];
}

export default function SchemeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [scheme, setScheme] = useState<Scheme | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    async function fetchScheme() {
        try {
            const res = await fetch(`/api/schemes-of-work/${id}`); // Need to create this specific API
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setScheme(data);
        } catch (err: any) {
            toast.error(err.message);
            router.push("/dashboard/scheme-of-work");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchScheme();
    }, [id]);

    if (loading) return (
        <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Roadmap Nodes...</p>
        </div>
    );

    if (!scheme) return null;

    return (
        <div className="space-y-10 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                <div className="space-y-4">
                    <Link href="/dashboard/scheme-of-work" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-all">
                        <ArrowLeft className="w-4 h-4" /> Back to Blueprints
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase leading-none">{scheme.course.title}</h1>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 italic">Curricular Roadmap Implementation</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-slate-900 text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/10 hover:bg-emerald-600 transition-all flex items-center gap-3"
                >
                    <Plus className="w-5 h-5" />
                    <span>Provision Lesson</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-xl font-black uppercase tracking-tighter">Pedagogical Execution Plan</h3>
                            <span className="bg-slate-50 text-slate-400 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-100">
                                {scheme.lessons.length} Nodes Synchronized
                            </span>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {scheme.lessons.length > 0 ? scheme.lessons.map((lesson, idx) => (
                                <div key={lesson.id} className="p-8 hover:bg-slate-50/50 transition-all group flex items-start gap-6">
                                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[10px] font-black text-slate-300 border border-slate-100 group-hover:border-emerald-200 group-hover:text-emerald-500 transition-all">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-grow space-y-4">
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tighter group-hover:text-emerald-600 transition-colors">{lesson.title}</h4>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">{lesson.unit.title}</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                                <Calendar className="w-4 h-4 text-emerald-500" />
                                                {new Date(lesson.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                                <Clock className="w-4 h-4 text-emerald-500" />
                                                {new Date(lesson.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-3 bg-white text-slate-300 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-50">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-32 flex flex-col items-center gap-6 text-center">
                                    <AlertCircle className="w-12 h-12 text-slate-200" />
                                    <div className="space-y-2">
                                        <p className="font-black text-slate-900 uppercase tracking-tighter">No Execution Blocks</p>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Initialization required to start synchronization.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900 rounded-[3rem] p-10 text-white space-y-8">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2">Institutional Context</p>
                            <h4 className="text-2xl font-black uppercase tracking-tighter leading-tight">{scheme.class.name}</h4>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Academic Cycle</p>
                                <p className="font-black text-sm">{scheme.academicYear.title}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Grading Term</p>
                                <p className="font-black text-sm">{scheme.term.title}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <LessonModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchScheme}
                schemeId={scheme.id}
                courseId={scheme.courseId}
            />
        </div>
    );
}
