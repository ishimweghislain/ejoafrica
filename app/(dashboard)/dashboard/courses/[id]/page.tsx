"use client";

import { useState, useEffect, use } from "react";
import { Plus, Layout, Book, Layers, ChevronRight, Loader2, ArrowLeft, Trash2, Edit2, CheckCircle2, FileText, Target, Activity, Share2, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CurriculumModal from "@/components/CurriculumModal";

interface Unit {
    id: string;
    title: string;
    periods: number;
    knowledge?: string;
    skills?: string;
}

interface Subtopic {
    id: string;
    title: string;
    units: Unit[];
}

interface Topic {
    id: string;
    title: string;
    subtopics: Subtopic[];
}

interface Course {
    id: string;
    title: string;
    class: { name: string };
    teacherId: string;
    teacher: { firstName: string, lastName: string };
    hoursPerWeek: number;
    topics: Topic[];
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: "TOPIC" | "SUBTOPIC" | "UNIT"; parentId: string; initialData?: any }>({
        isOpen: false,
        type: "TOPIC",
        parentId: id
    });

    async function fetchData() {
        try {
            const [cRes, uRes] = await Promise.all([
                fetch(`/api/courses/${id}`),
                fetch("/api/auth/me")
            ]);
            const cData = await cRes.json();
            const uData = await uRes.json();

            if (cData.error) throw new Error(cData.error);
            setCourse(cData);
            setUser(uData);
        } catch (err: any) {
            toast.error(err.message);
            router.push("/dashboard/courses");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [id]);

    const openModal = (type: "TOPIC" | "SUBTOPIC" | "UNIT", parentId: string, initialData?: any) => {
        setModalConfig({ isOpen: true, type, parentId, initialData });
    };

    const handleDelete = async (type: "topics" | "subtopics" | "units", itemId: string) => {
        if (!confirm("Are you sure you want to delete this curriculum node?")) return;

        try {
            const res = await fetch(`/api/${type}/${itemId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete.");
            toast.success("Node removed.");
            fetchData();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    if (loading) return (
        <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expanding Curriculum Matrix...</p>
        </div>
    );

    if (!course) return null;

    const isTeacher = user?.role === "TEACHER" || user?.role === "DOS" || user?.role === "SCHOOL_ADMIN";
    const canEdit = isTeacher && (user?.userId === course.teacherId || user?.role !== "TEACHER");
    const isStudent = user?.role === "STUDENT" || user?.role === "PARENT";

    return (
        <div className="space-y-10 animate-fade-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                <div className="space-y-4">
                    <Link href="/dashboard/courses" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-all">
                        <ArrowLeft className="w-4 h-4" /> Back to Catalog
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase leading-none">{course.title}</h1>
                        <div className="flex items-center gap-4 pt-2">
                            <span className="bg-emerald-50 text-emerald-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 italic">
                                Level: {course.class.name}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Directed by {course.teacher.firstName} {course.teacher.lastName}
                            </span>
                        </div>
                    </div>
                </div>
                {!isStudent && canEdit && (
                    <div className="flex gap-3">
                        <button className="p-4 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => openModal("TOPIC", id)}
                            className="bg-slate-900 text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/10 hover:bg-emerald-600 transition-all flex items-center gap-3"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Extend Curriculum</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Matrix View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                    {course.topics.length > 0 ? course.topics.map((topic, tIdx) => (
                        <div key={topic.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden border-l-[12px] border-l-slate-900">
                            <div className="p-10 space-y-10">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Major Domain {tIdx + 1}</p>
                                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{topic.title}</h2>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {canEdit && (
                                            <>
                                                <button onClick={() => openModal("TOPIC", id, topic)} className="p-3 text-slate-400 hover:text-emerald-600 transition-all">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete("topics", topic.id)} className="p-3 text-slate-400 hover:text-red-600 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openModal("SUBTOPIC", topic.id)}
                                                    className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all ml-4"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {topic.subtopics.map((sub, sIdx) => (
                                        <div key={sub.id} className="bg-slate-50/50 rounded-[2.5rem] p-8 space-y-6 border border-slate-100/50 group hover:bg-white hover:shadow-xl transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <span className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[10px] font-black text-slate-900 shadow-sm">
                                                        {tIdx + 1}.{sIdx + 1}
                                                    </span>
                                                    <h3 className="font-black text-slate-800 uppercase text-sm tracking-tight">{sub.title}</h3>
                                                </div>
                                                {canEdit && (
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => openModal("SUBTOPIC", topic.id, sub)} className="p-2 text-slate-300 hover:text-emerald-600 transition-colors">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleDelete("subtopics", sub.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openModal("UNIT", sub.id)}
                                                            className="p-2 text-slate-300 hover:text-emerald-600 transition-colors ml-4"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {sub.units.map(unit => (
                                                    <div key={unit.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:scale-[1.02] transition-transform cursor-pointer group/unit">
                                                        <div className="space-y-1">
                                                            <p className="text-xs font-black text-slate-900 uppercase tracking-tight group-hover/unit:text-emerald-600">{unit.title}</p>
                                                            <p className="text-[9px] font-bold text-slate-400 flex items-center gap-2">
                                                                <Clock className="w-3 h-3" /> {unit.periods} Periods Allocated
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2 opacity-0 group-hover/unit:opacity-100 transition-opacity">
                                                            {canEdit && (
                                                                <>
                                                                    <button onClick={(e) => { e.stopPropagation(); openModal("UNIT", sub.id, unit); }} className="p-2 text-slate-300 hover:text-emerald-600">
                                                                        <Edit2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete("units", unit.id); }} className="p-2 text-slate-300 hover:text-red-600">
                                                                        <Trash2 className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </>
                                                            )}
                                                            <ChevronRight className="w-4 h-4 text-slate-200" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {topic.subtopics.length === 0 && (
                                        <p className="text-center py-10 text-[10px] font-black uppercase tracking-widest text-slate-300 italic">No sub-domains provisioned.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="py-40 bg-slate-50 rounded-[4rem] border border-dashed border-slate-200 flex flex-col items-center gap-6">
                            <Layers className="w-16 h-16 text-slate-200" />
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-black text-slate-900 uppercase">Architecture Void</h3>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest uppercase">No topics have been integrated into this curriculum node.</p>
                            </div>
                            {!isStudent && canEdit && (
                                <button onClick={() => openModal("TOPIC", id)} className="btn-primary">Provision First Topic</button>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar Stats */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 rounded-[3rem] p-10 text-white space-y-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Syllabus Analytics</h4>
                        <div className="space-y-8">
                            <StatBox label="Total Capacity" value={`${course.topics.reduce((acc, t) => acc + t.subtopics.reduce((a, s) => a + s.units.reduce((u, n) => u + n.periods, 0), 0), 0)} Periods`} icon={<Activity className="w-4 h-4" />} />
                            <StatBox label="Sub-Domains" value={`${course.topics.reduce((acc, t) => acc + t.subtopics.length, 0)} Nodes`} icon={<Target className="w-4 h-4" />} />
                            <StatBox label="Weightage" value={`${course.hoursPerWeek}h / Week`} icon={<Clock className="w-4 h-4" />} />
                        </div>
                    </div>
                </div>
            </div>

            <CurriculumModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                onSuccess={fetchData}
                type={modalConfig.type}
                parentId={modalConfig.parentId}
                initialData={modalConfig.initialData}
            />
        </div>
    );
}

function StatBox({ label, value, icon }: any) {
    return (
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-emerald-500 border border-white/5">
                {icon}
            </div>
            <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</p>
                <p className="font-black text-lg tracking-tight">{value}</p>
            </div>
        </div>
    );
}
