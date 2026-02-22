"use client";

import { useState, useEffect, use } from "react";
import {
    Plus, Layers, Loader2, ArrowLeft, Edit2, Calendar, Clock, BookOpen, AlertCircle,
    Users, CheckCircle2, ChevronRight, BarChart2, UserCheck, UserX
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LessonModal from "@/components/LessonModal";
import AttendanceModal from "@/components/AttendanceModal";

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
}

interface AttendanceRecord {
    id: string;
    studentId: string;
    present: boolean;
    note?: string;
    student: Student;
}

interface Lesson {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    unit: { id: string; title: string };
    evaluation?: string;
    teachingMethod?: string;
    resources?: string;
    attendance: AttendanceRecord[];
}

interface Unit {
    id: string;
    title: string;
    periods: number;
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

interface Scheme {
    id: string;
    courseId: string;
    course: { id: string; title: string; topics: Topic[] };
    class: { id: string; name: string; users: Student[] };
    academicYear: { title: string };
    term: { title: string };
    teacher?: { id: string; firstName: string; lastName: string };
    lessons: Lesson[];
}

export default function SchemeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [scheme, setScheme] = useState<Scheme | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [attendanceModal, setAttendanceModal] = useState<{ lesson: Lesson } | null>(null);
    const [activeTab, setActiveTab] = useState<"lessons" | "units">("lessons");

    async function fetchScheme() {
        try {
            const [schemeRes, userRes] = await Promise.all([
                fetch(`/api/schemes-of-work/${id}`),
                fetch("/api/auth/me")
            ]);
            const [schemeData, userData] = await Promise.all([schemeRes.json(), userRes.json()]);
            if (schemeData.error) throw new Error(schemeData.error);
            setScheme(schemeData);
            setUser(userData);
        } catch (err: any) {
            toast.error(err.message);
            router.push("/dashboard/scheme-of-work");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchScheme(); }, [id]);

    if (loading) return (
        <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading lesson roadmap...</p>
        </div>
    );

    if (!scheme) return null;

    // Flatten all units from the course
    const allUnits: (Unit & { subtopicTitle: string; topicTitle: string })[] = [];
    if (scheme.course && scheme.course.topics) {
        scheme.course.topics.forEach(t => {
            if (t.subtopics) {
                t.subtopics.forEach(s => {
                    if (s.units) {
                        s.units.forEach(u => {
                            allUnits.push({ ...u, subtopicTitle: s.title, topicTitle: t.title });
                        });
                    }
                });
            }
        });
    }

    const students = scheme.class.users || [];
    const isTeacher = user?.role === "TEACHER";

    return (
        <div className="space-y-8 animate-fade-up">
            {/* Back + Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-3">
                    <Link href="/dashboard/scheme-of-work" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-all">
                        <ArrowLeft className="w-4 h-4" /> Back to Plans
                    </Link>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase leading-none">
                            {scheme.course.title}
                        </h1>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                {scheme.academicYear.title}
                            </span>
                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                                {scheme.term.title}
                            </span>
                            <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-100">
                                {scheme.class.name}
                            </span>
                        </div>
                    </div>
                </div>
                {isTeacher && (
                    <button
                        onClick={() => setIsLessonModalOpen(true)}
                        className="bg-slate-900 text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-emerald-600 transition-all flex items-center gap-3"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add New Lesson</span>
                    </button>
                )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Lessons Taught", value: scheme.lessons.length, color: "emerald" },
                    { label: "Units in Syllabus", value: allUnits.length, color: "blue" },
                    { label: "Students", value: students.length, color: "violet" },
                    {
                        label: "Avg Attendance",
                        value: scheme.lessons.length > 0
                            ? Math.round(
                                scheme.lessons.reduce((acc, l) =>
                                    acc + (l.attendance.filter(a => a.present).length / Math.max(students.length, 1) * 100), 0
                                ) / scheme.lessons.length
                            ) + "%"
                            : "—",
                        color: "orange"
                    },
                ].map(stat => {
                    const styleMap: Record<string, string> = {
                        emerald: "bg-emerald-50 border-emerald-100 text-emerald-800 label-emerald-700",
                        blue: "bg-blue-50 border-blue-100 text-blue-800 label-blue-700",
                        violet: "bg-violet-50 border-violet-100 text-violet-800 label-violet-700",
                        orange: "bg-orange-50 border-orange-100 text-orange-800 label-orange-700"
                    };

                    const style = styleMap[stat.color] || "bg-slate-50 border-slate-100 text-slate-700 label-slate-500";
                    const [bg, border, text, label] = style.split(" ");

                    return (
                        <div key={stat.label} className={`${bg} border ${border} rounded-[2rem] p-7 shadow-sm transition-all hover:shadow-md`}>
                            <p className={`text-4xl font-black ${text} tracking-tighter`}>{stat.value}</p>
                            <p className={`text-[10px] font-black uppercase tracking-widest ${label.replace('label-', 'text-')} mt-2`}>{stat.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tabs */}
                    <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
                        {(["lessons", "units"] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                {tab === "lessons" ? `Lessons (${scheme.lessons.length})` : `Units (${allUnits.length})`}
                            </button>
                        ))}
                    </div>

                    {/* Lessons tab */}
                    {activeTab === "lessons" && (
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <h3 className="text-lg font-black uppercase tracking-tighter text-slate-900">Lessons Recorded</h3>
                                <span className="bg-slate-50 text-slate-700 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-slate-100">
                                    {scheme.lessons.length} total
                                </span>
                            </div>

                            <div className="divide-y divide-slate-50">
                                {scheme.lessons.length === 0 ? (
                                    <div className="py-24 flex flex-col items-center gap-4 text-center px-8">
                                        <AlertCircle className="w-12 h-12 text-slate-200" />
                                        <div>
                                            <p className="font-black text-slate-900 uppercase tracking-tighter">No Lessons Yet</p>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">
                                                {isTeacher ? 'Click "Add New Lesson" to start recording.' : "No lessons recorded for this plan."}
                                            </p>
                                        </div>
                                    </div>
                                ) : scheme.lessons.map((lesson, idx) => {
                                    const presentCount = lesson.attendance.filter(a => a.present).length;
                                    const hasAttendance = lesson.attendance.length > 0;
                                    const attendancePct = students.length > 0
                                        ? Math.round(presentCount / students.length * 100)
                                        : 0;

                                    return (
                                        <div key={lesson.id} className="p-6 hover:bg-slate-50/50 transition-all group">
                                            <div className="flex items-start gap-4">
                                                {/* Number badge */}
                                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-100 group-hover:border-emerald-200 group-hover:text-emerald-500 transition-all shrink-0">
                                                    {idx + 1}
                                                </div>

                                                <div className="flex-grow min-w-0">
                                                    <h4 className="text-base font-black text-slate-900 uppercase tracking-tighter group-hover:text-emerald-600 transition-colors">
                                                        {lesson.title}
                                                    </h4>
                                                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mt-1">
                                                        {lesson.unit.title}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-4 mt-3">
                                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                                                            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                                                            {new Date(lesson.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
                                                            <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                                            {new Date(lesson.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>

                                                        {/* Attendance badge */}
                                                        {hasAttendance ? (
                                                            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${attendancePct >= 75
                                                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                                                : "bg-amber-50 text-amber-600 border border-amber-200"
                                                                }`}>
                                                                <UserCheck className="w-3 h-3" />
                                                                {presentCount}/{students.length} ({attendancePct}%)
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-400 border border-slate-200">
                                                                <Users className="w-3 h-3" /> No attendance
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Attendance button */}
                                                {isTeacher && (
                                                    <button
                                                        onClick={() => setAttendanceModal({ lesson })}
                                                        className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${hasAttendance
                                                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"
                                                            : "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100"
                                                            }`}
                                                    >
                                                        <Users className="w-3.5 h-3.5" />
                                                        {hasAttendance ? "Edit" : "Take"} Attendance
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Units tab */}
                    {activeTab === "units" && (
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                                <h3 className="text-lg font-black uppercase tracking-tighter text-slate-900">Syllabus Units (from DOS)</h3>
                                <span className="bg-blue-50 text-blue-600 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                                    {allUnits.length} units
                                </span>
                            </div>

                            {allUnits.length === 0 ? (
                                <div className="py-24 flex flex-col items-center gap-4 text-center px-8">
                                    <Layers className="w-12 h-12 text-slate-200" />
                                    <div>
                                        <p className="font-black text-slate-900 uppercase tracking-tighter">No Units in Syllabus</p>
                                        <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest mt-1">
                                            The DOS must add units to this course's syllabus first.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 space-y-4">
                                    {scheme.course.topics.map(topic => (
                                        <div key={topic.id} className="space-y-2">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 px-2">
                                                📚 {topic.title}
                                            </p>
                                            {topic.subtopics.map(sub => (
                                                <div key={sub.id} className="pl-4 space-y-1.5">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-2">
                                                        › {sub.title}
                                                    </p>
                                                    {sub.units.map(unit => {
                                                        const taughtCount = scheme.lessons.filter(l => l.unit.id === unit.id).length;
                                                        return (
                                                            <div key={unit.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${taughtCount > 0
                                                                ? "bg-emerald-50 border-emerald-200"
                                                                : "bg-slate-50 border-slate-100"
                                                                }`}>
                                                                <div className={`w-2 h-2 rounded-full ${taughtCount > 0 ? "bg-emerald-500" : "bg-slate-300"}`} />
                                                                <span className="flex-grow text-xs font-bold text-slate-700">{unit.title}</span>
                                                                <span className="text-[9px] font-black text-slate-600">{unit.periods}p</span>
                                                                {taughtCount > 0 && (
                                                                    <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                                                        {taughtCount} lesson{taughtCount !== 1 ? "s" : ""}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Class Info */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-1">Class</p>
                            <h4 className="text-2xl font-black uppercase tracking-tighter">{scheme.class.name}</h4>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">School Year</p>
                                <p className="font-black text-sm mt-0.5">{scheme.academicYear.title}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Term</p>
                                <p className="font-black text-sm mt-0.5">{scheme.term.title}</p>
                            </div>
                            {scheme.teacher && (
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Teacher</p>
                                    <p className="font-black text-sm mt-0.5">{scheme.teacher.firstName} {scheme.teacher.lastName}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Students / Attendance Overview */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50">
                            <h4 className="text-sm font-black uppercase tracking-tighter text-slate-900">
                                Students ({students.length})
                            </h4>
                        </div>
                        <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                            {students.length === 0 ? (
                                <p className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">No students enrolled</p>
                            ) : students.map(student => {
                                const totalLessons = scheme.lessons.length;
                                const attendedCount = scheme.lessons.filter(l =>
                                    l.attendance.some(a => a.studentId === student.id && a.present)
                                ).length;
                                const pct = totalLessons > 0 ? Math.round(attendedCount / totalLessons * 100) : null;

                                return (
                                    <div key={student.id} className="p-4 flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-[9px] font-black text-slate-400 shrink-0">
                                            {student.firstName[0]}{student.lastName[0]}
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="text-xs font-black text-slate-900 truncate">{student.firstName} {student.lastName}</p>
                                            {pct !== null && (
                                                <div className="mt-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                                                        style={{ width: `${pct}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        {pct !== null && (
                                            <span className={`text-[9px] font-black shrink-0 ${pct >= 75 ? "text-emerald-600" : pct >= 50 ? "text-amber-500" : "text-red-500"}`}>
                                                {pct}%
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <LessonModal
                isOpen={isLessonModalOpen}
                onClose={() => setIsLessonModalOpen(false)}
                onSuccess={(newLesson?: Lesson) => {
                    fetchScheme();
                    if (newLesson) {
                        setAttendanceModal({ lesson: newLesson });
                    }
                }}
                schemeId={scheme.id}
                courseId={scheme.courseId || scheme.course?.id}
            />

            <AttendanceModal
                isOpen={!!attendanceModal}
                onClose={() => setAttendanceModal(null)}
                lesson={attendanceModal?.lesson || null}
                students={students}
                onSuccess={fetchScheme}
            />
        </div>
    );
}
