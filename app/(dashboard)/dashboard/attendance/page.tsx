"use client";

import { useState, useEffect } from "react";
import {
    Users, BookOpen, Calendar, CheckCircle2, XCircle, Loader2,
    ChevronDown, ChevronUp, UserCheck, UserX, Filter, BarChart2, School
} from "lucide-react";
import { toast } from "react-hot-toast";

// ─── Types ──────────────────────────────────────────────────────────────────

interface AttRecord {
    id: string;
    present: boolean;
    note?: string;
    lesson: {
        id: string;
        title: string;
        startDate: string;
        unit: { title: string };
        scheme: {
            course: { title: string };
            class: { name: string };
            academicYear?: { title: string };
            term?: { title: string };
        };
    };
}

interface LessonSummary {
    id: string;
    title: string;
    startDate: string;
    unit: { title: string };
    scheme: {
        course: { title: string };
        class: { name: string };
        teacher?: { firstName: string; lastName: string };
    };
    attendance: { id: string; present: boolean; studentId: string }[];
}

interface Child {
    id: string;
    firstName: string;
    lastName: string;
    class?: { name: string };
}

// ─── Helper ─────────────────────────────────────────────────────────────────

function pct(present: number, total: number) {
    if (total === 0) return null;
    return Math.round((present / total) * 100);
}

function RateChip({ value }: { value: number | null }) {
    if (value === null) return <span className="text-slate-300 font-black text-sm">—</span>;
    const color = value >= 75 ? "text-emerald-600 bg-emerald-50" : value >= 50 ? "text-amber-600 bg-amber-50" : "text-red-500 bg-red-50";
    return <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${color}`}>{value}%</span>;
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function AttendancePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Parent/Student
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);
    const [studentRecords, setStudentRecords] = useState<AttRecord[]>([]);
    const [loadingRecords, setLoadingRecords] = useState(false);

    // Teacher / DOS / Admin — lesson summary
    const [lessons, setLessons] = useState<LessonSummary[]>([]);
    const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
    const [lessonDetail, setLessonDetail] = useState<any[]>([]);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Filter
    const [search, setSearch] = useState("");

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        async function init() {
            try {
                const me = await fetch("/api/auth/me").then(r => r.json());
                setUser(me);

                if (me.role === "PARENT") {
                    // Fetch parent's children
                    const uData = await fetch(`/api/users/${me.id}`).then(r => r.json());
                    const kids: Child[] = uData.children || [];
                    setChildren(kids);
                    if (kids.length > 0) setSelectedChild(kids[0]);

                } else if (me.role === "STUDENT") {
                    setSelectedChild({ id: me.id, firstName: me.firstName, lastName: me.lastName });

                } else {
                    // TEACHER / DOS / SCHOOL_ADMIN / DOD → load lesson summaries
                    const data = await fetch("/api/attendance").then(r => r.json());
                    setLessons(Array.isArray(data) ? data : []);
                }
            } catch {
                toast.error("Failed to load attendance data.");
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

    // ── Load student attendance when child changes ────────────────────────────
    useEffect(() => {
        if (!selectedChild) return;
        setLoadingRecords(true);
        setStudentRecords([]);

        fetch(`/api/attendance?studentId=${selectedChild.id}`)
            .then(r => r.json())
            .then(data => setStudentRecords(Array.isArray(data) ? data : []))
            .catch(() => toast.error("Could not load attendance records."))
            .finally(() => setLoadingRecords(false));
    }, [selectedChild]);

    // ── Expand lesson to see student list ─────────────────────────────────────
    async function toggleLesson(lessonId: string) {
        if (expandedLesson === lessonId) { setExpandedLesson(null); return; }
        setExpandedLesson(lessonId);
        setLessonDetail([]);
        setLoadingDetail(true);
        try {
            const data = await fetch(`/api/attendance?lessonId=${lessonId}`).then(r => r.json());
            setLessonDetail(Array.isArray(data) ? data : []);
        } catch {
            toast.error("Could not load lesson attendance.");
        } finally {
            setLoadingDetail(false);
        }
    }

    // ── Derived stats (student view) ──────────────────────────────────────────
    const totalPresent = studentRecords.filter(r => r.present).length;
    const overallPct = pct(totalPresent, studentRecords.length);

    // Group student records by course
    const courseMap: Record<string, { title: string; className: string; records: AttRecord[] }> = {};
    studentRecords.forEach(rec => {
        const key = rec.lesson.scheme.course.title;
        if (!courseMap[key]) courseMap[key] = { title: key, className: rec.lesson.scheme.class.name, records: [] };
        courseMap[key].records.push(rec);
    });

    // ── Filter lessons (teacher/DOS view) ─────────────────────────────────────
    const filteredLessons = lessons.filter(l =>
        l.scheme.course.title.toLowerCase().includes(search.toLowerCase()) ||
        l.scheme.class.name.toLowerCase().includes(search.toLowerCase()) ||
        l.title.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading attendance data...</p>
        </div>
    );

    // ─────────────────────────────────────────────────────────────────────────
    //  TEACHER / DOS / ADMIN VIEW
    // ─────────────────────────────────────────────────────────────────────────
    const isAdmin = user?.role && ["DOS", "SCHOOL_ADMIN", "DOD", "TEACHER"].includes(user.role);

    if (isAdmin) {
        return (
            <div className="space-y-8 animate-fade-up">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Attendance Tracker</h1>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mt-1">
                            {user?.role === "TEACHER" ? "Lessons you have taught" : "All lessons across all classes"}
                        </p>
                    </div>
                    {/* Stats bar */}
                    <div className="flex gap-4">
                        <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 text-center shadow-sm">
                            <p className="text-2xl font-black text-slate-900">{lessons.length}</p>
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Lessons</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3 text-center shadow-sm">
                            <p className="text-2xl font-black text-emerald-600">
                                {lessons.reduce((a, l) => a + l.attendance.filter(r => r.present).length, 0)}
                            </p>
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Total Present</p>
                        </div>
                        <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-3 text-center shadow-sm">
                            <p className="text-2xl font-black text-red-500">
                                {lessons.reduce((a, l) => a + l.attendance.filter(r => !r.present).length, 0)}
                            </p>
                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Total Absent</p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <Filter className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                        className="w-full bg-white border border-slate-100 rounded-2xl pl-10 pr-5 py-4 text-xs font-semibold outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 shadow-sm"
                        placeholder="Search by course, class or lesson title..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {/* Lesson list */}
                {filteredLessons.length === 0 ? (
                    <div className="py-24 flex flex-col items-center gap-4 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                        <BookOpen className="w-16 h-16 text-slate-200" />
                        <p className="font-black text-slate-900 uppercase">No lessons found</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lessons will appear here after teachers create them.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredLessons.map(lesson => {
                            const presentN = lesson.attendance.filter(r => r.present).length;
                            const total = lesson.attendance.length;
                            const rate = pct(presentN, total);
                            const isExpanded = expandedLesson === lesson.id;

                            return (
                                <div key={lesson.id} className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
                                    <button
                                        onClick={() => toggleLesson(lesson.id)}
                                        className="w-full p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${rate === null ? 'bg-slate-100' : rate >= 75 ? 'bg-emerald-100' : rate >= 50 ? 'bg-amber-100' : 'bg-red-100'}`}>
                                                <School className={`w-5 h-5 ${rate === null ? 'text-slate-400' : rate >= 75 ? 'text-emerald-600' : rate >= 50 ? 'text-amber-600' : 'text-red-500'}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900 uppercase tracking-tighter text-sm">{lesson.title}</h3>
                                                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{lesson.scheme.class.name}</span>
                                                    <span className="text-slate-200">•</span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">{lesson.scheme.course.title}</span>
                                                    <span className="text-slate-200">•</span>
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{lesson.unit.title}</span>
                                                    {lesson.scheme.teacher && (
                                                        <>
                                                            <span className="text-slate-200">•</span>
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                                {lesson.scheme.teacher.firstName} {lesson.scheme.teacher.lastName}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                                                    {new Date(lesson.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-5 shrink-0">
                                            <div className="hidden md:flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-emerald-600">
                                                    <UserCheck className="w-4 h-4" />
                                                    <span className="text-sm font-black">{presentN}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-red-400">
                                                    <UserX className="w-4 h-4" />
                                                    <span className="text-sm font-black">{total - presentN}</span>
                                                </div>
                                                <RateChip value={rate} />
                                            </div>
                                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                        </div>
                                    </button>

                                    {/* Progress bar */}
                                    {total > 0 && (
                                        <div className="px-6 pb-1">
                                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${rate !== null && rate >= 75 ? 'bg-emerald-500' : rate !== null && rate >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                                                    style={{ width: `${rate ?? 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Expanded: student list */}
                                    {isExpanded && (
                                        <div className="border-t border-slate-50">
                                            {loadingDetail && expandedLesson === lesson.id ? (
                                                <div className="py-10 flex items-center justify-center gap-3">
                                                    <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Loading students...</p>
                                                </div>
                                            ) : lessonDetail.length === 0 ? (
                                                <div className="py-8 text-center">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">No attendance records for this lesson yet.</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-slate-50">
                                                    {lessonDetail.map(rec => (
                                                        <div key={rec.id} className={`px-6 py-3 flex items-center gap-4 ${rec.present ? '' : 'bg-red-50/30'}`}>
                                                            <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white text-[10px] font-black shrink-0">
                                                                {rec.student.firstName[0]}{rec.student.lastName[0]}
                                                            </div>
                                                            <div className="flex-grow">
                                                                <p className="text-sm font-black uppercase tracking-tight text-slate-900">
                                                                    {rec.student.firstName} {rec.student.lastName}
                                                                </p>
                                                                {rec.note && <p className="text-[9px] text-red-400 italic">{rec.note}</p>}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {rec.present
                                                                    ? <span className="flex items-center gap-1 text-emerald-600 text-[9px] font-black uppercase bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100"><CheckCircle2 className="w-3 h-3" /> Present</span>
                                                                    : <span className="flex items-center gap-1 text-red-500 text-[9px] font-black uppercase bg-red-50 px-3 py-1 rounded-xl border border-red-100"><XCircle className="w-3 h-3" /> Absent</span>
                                                                }
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    //  STUDENT / PARENT VIEW
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-8 animate-fade-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Attendance Tracker</h1>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mt-1">
                        {user?.role === "PARENT" ? "Track your child's attendance per lesson" : "Your personal attendance record"}
                    </p>
                </div>

                {/* Child selector for parent */}
                {user?.role === "PARENT" && children.length > 1 && (
                    <div className="flex flex-col">
                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1 ml-2">Select Child</label>
                        <select
                            className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-xs font-bold outline-none shadow-sm"
                            value={selectedChild?.id || ""}
                            onChange={e => setSelectedChild(children.find(c => c.id === e.target.value) || null)}
                        >
                            {children.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {/* Student summary banner */}
            {selectedChild && (
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center text-2xl font-black">
                                {selectedChild.firstName[0]}{selectedChild.lastName?.[0] || ""}
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">
                                    {user?.role === "PARENT" ? "Child" : "Student"}
                                </p>
                                <h2 className="text-2xl font-black uppercase tracking-tighter">{selectedChild.firstName} {selectedChild.lastName}</h2>
                            </div>
                        </div>
                        <div className="flex gap-8">
                            <div className="text-center">
                                <p className="text-3xl font-black text-emerald-400">{totalPresent}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Present</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-black text-red-400">{studentRecords.length - totalPresent}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Absent</p>
                            </div>
                            <div className="text-center">
                                <p className={`text-3xl font-black ${overallPct === null ? 'text-slate-400' : overallPct >= 75 ? 'text-emerald-400' : overallPct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                    {overallPct !== null ? `${overallPct}%` : "—"}
                                </p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Attendance</p>
                            </div>
                        </div>
                    </div>
                    {overallPct !== null && (
                        <div className="mt-6">
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${overallPct >= 75 ? 'bg-emerald-400' : overallPct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                                    style={{ width: `${overallPct}%` }}
                                />
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">
                                {overallPct >= 75 ? "✓ Good attendance" : overallPct >= 50 ? "⚠ Needs improvement" : "⚠ Low attendance — action required"}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Records */}
            {loadingRecords ? (
                <div className="py-16 flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading records...</p>
                </div>
            ) : studentRecords.length === 0 ? (
                <div className="py-24 flex flex-col items-center gap-6 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                    <BookOpen className="w-16 h-16 text-slate-200" />
                    <div className="text-center">
                        <p className="font-black text-slate-900 uppercase tracking-tighter text-xl">No Attendance Records Yet</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                            Records will appear here once a teacher marks attendance for a lesson.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lessons attended — by course</h2>
                    {Object.entries(courseMap).map(([key, group]) => {
                        const presentN = group.records.filter(r => r.present).length;
                        const rate = pct(presentN, group.records.length);
                        const isExp = expandedLesson === key;

                        return (
                            <div key={key} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => setExpandedLesson(isExp ? null : key)}
                                    className="w-full p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${rate !== null && rate >= 75 ? 'bg-emerald-100' : rate !== null && rate >= 50 ? 'bg-amber-100' : 'bg-red-100'}`}>
                                            <BookOpen className={`w-6 h-6 ${rate !== null && rate >= 75 ? 'text-emerald-600' : rate !== null && rate >= 50 ? 'text-amber-600' : 'text-red-500'}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 uppercase tracking-tighter">{group.title}</h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{group.className}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="hidden md:flex items-center gap-3">
                                            <span className="flex items-center gap-1 text-emerald-600 font-black text-sm">{presentN} <UserCheck className="w-3.5 h-3.5" /></span>
                                            <span className="flex items-center gap-1 text-red-400 font-black text-sm">{group.records.length - presentN} <UserX className="w-3.5 h-3.5" /></span>
                                            <RateChip value={rate} />
                                        </div>
                                        {isExp ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </div>
                                </button>

                                {/* Progress bar */}
                                <div className="px-6 pb-1">
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${rate !== null && rate >= 75 ? 'bg-emerald-500' : rate !== null && rate >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                                            style={{ width: `${rate ?? 0}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Lessons per course */}
                                {isExp && (
                                    <div className="border-t border-slate-50 divide-y divide-slate-50">
                                        {group.records
                                            .sort((a, b) => new Date(b.lesson.startDate).getTime() - new Date(a.lesson.startDate).getTime())
                                            .map(rec => (
                                                <div key={rec.id} className={`px-6 py-4 flex items-center gap-4 ${rec.present ? '' : 'bg-red-50/30'}`}>
                                                    {rec.present
                                                        ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                                        : <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                                                    }
                                                    <div className="flex-grow min-w-0">
                                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{rec.lesson.title}</p>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">{rec.lesson.unit.title}</p>
                                                        {!rec.present && rec.note && (
                                                            <p className="text-[10px] text-red-400 mt-0.5 italic">Note: {rec.note}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-[9px] font-bold text-slate-500">
                                                            {new Date(rec.lesson.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </p>
                                                        <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${rec.present ? 'text-emerald-600' : 'text-red-500'}`}>
                                                            {rec.present ? "Present" : "Absent"}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
