"use client";

import { useState, useEffect } from "react";
import {
    Users, BookOpen, Calendar, CheckCircle2, XCircle, Loader2,
    ChevronDown, ChevronUp, BarChart2, UserCheck, UserX, Filter, TrendingUp
} from "lucide-react";
import { toast } from "react-hot-toast";

interface LessonAttendance {
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
            academicYear: { title: string };
            term: { title: string };
        };
    };
}

interface Child {
    id: string;
    firstName: string;
    lastName: string;
    class?: { name: string };
}

interface CourseGroup {
    courseTitle: string;
    className: string;
    yearTitle: string;
    termTitle: string;
    records: LessonAttendance[];
}

export default function ParentAttendancePage() {
    const [user, setUser] = useState<any>(null);
    const [children, setChildren] = useState<Child[]>([]);
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);
    const [attendanceData, setAttendanceData] = useState<LessonAttendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

    useEffect(() => {
        async function init() {
            try {
                const [meRes, usersRes] = await Promise.all([
                    fetch("/api/auth/me"),
                    fetch("/api/auth/me")
                ]);
                const me = await meRes.json();
                setUser(me);

                if (me.role === "PARENT") {
                    // Fetch linked children
                    const uRes = await fetch(`/api/users/${me.userId}`);
                    const uData = await uRes.json();
                    const kids = uData.children || [];
                    setChildren(kids);
                    if (kids.length > 0) {
                        setSelectedChild(kids[0]);
                    }
                } else if (me.role === "STUDENT") {
                    // Student sees their own attendance
                    setSelectedChild({ id: me.userId, firstName: me.firstName || "You", lastName: "" });
                }
            } catch (err) {
                toast.error("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

    useEffect(() => {
        if (!selectedChild) return;
        setLoadingAttendance(true);
        setAttendanceData([]);

        fetch(`/api/attendance?studentId=${selectedChild.id}`)
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setAttendanceData(data);
                else setAttendanceData([]);
            })
            .catch(() => toast.error("Failed to load attendance."))
            .finally(() => setLoadingAttendance(false));
    }, [selectedChild]);

    // Group by course
    const courseGroups: Record<string, CourseGroup> = {};
    attendanceData.forEach(rec => {
        const key = rec.lesson.scheme.course.title;
        if (!courseGroups[key]) {
            courseGroups[key] = {
                courseTitle: rec.lesson.scheme.course.title,
                className: rec.lesson.scheme.class.name,
                yearTitle: rec.lesson.scheme.academicYear.title,
                termTitle: rec.lesson.scheme.term.title,
                records: []
            };
        }
        courseGroups[key].records.push(rec);
    });

    const totalLessons = attendanceData.length;
    const totalPresent = attendanceData.filter(r => r.present).length;
    const overallPct = totalLessons > 0 ? Math.round(totalPresent / totalLessons * 100) : null;

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading attendance records...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Attendance Tracker</h1>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mt-1">
                        {user?.role === "PARENT" ? "Track your child's attendance per course" : "Your personal attendance record"}
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
                            {children.map(c => (
                                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Selected child info */}
            {selectedChild && (
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-[2.5rem] p-8 text-white">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center text-xl font-black">
                                {selectedChild.firstName[0]}{selectedChild.lastName?.[0] || ""}
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Student</p>
                                <h2 className="text-2xl font-black uppercase tracking-tighter leading-tight">
                                    {selectedChild.firstName} {selectedChild.lastName}
                                </h2>
                                {selectedChild.class && (
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                                        {selectedChild.class.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Overall stats */}
                        <div className="flex gap-6">
                            <div className="text-center">
                                <p className="text-3xl font-black text-emerald-400">{totalPresent}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Present</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-black text-red-400">{totalLessons - totalPresent}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Absent</p>
                            </div>
                            <div className="text-center">
                                <p className={`text-3xl font-black ${overallPct === null ? "text-slate-400" :
                                        overallPct >= 75 ? "text-emerald-400" :
                                            overallPct >= 50 ? "text-amber-400" : "text-red-400"
                                    }`}>
                                    {overallPct !== null ? `${overallPct}%` : "—"}
                                </p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Overall</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    {overallPct !== null && (
                        <div className="mt-6">
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${overallPct >= 75 ? "bg-emerald-400" :
                                            overallPct >= 50 ? "bg-amber-400" : "bg-red-400"
                                        }`}
                                    style={{ width: `${overallPct}%` }}
                                />
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">
                                {overallPct >= 75 ? "✓ Good attendance" : overallPct >= 50 ? "⚠ Attendance needs improvement" : "⚠ Low attendance – action required"}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Course breakdown */}
            {loadingAttendance ? (
                <div className="py-16 flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading course attendance...</p>
                </div>
            ) : totalLessons === 0 ? (
                <div className="py-24 flex flex-col items-center gap-6 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                    <BookOpen className="w-16 h-16 text-slate-200" />
                    <div className="text-center">
                        <p className="font-black text-slate-900 uppercase tracking-tighter text-xl">No Attendance Records</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">
                            No lessons have been recorded yet.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">By Course</h2>

                    {Object.entries(courseGroups).map(([courseKey, group]) => {
                        const presentInCourse = group.records.filter(r => r.present).length;
                        const totalInCourse = group.records.length;
                        const coursePct = Math.round(presentInCourse / totalInCourse * 100);
                        const isExpanded = expandedCourse === courseKey;

                        return (
                            <div key={courseKey} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                                {/* Course header */}
                                <button
                                    onClick={() => setExpandedCourse(isExpanded ? null : courseKey)}
                                    className="w-full p-6 flex items-center justify-between hover:bg-slate-50/50 transition-all text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${coursePct >= 75 ? "bg-emerald-100" : coursePct >= 50 ? "bg-amber-100" : "bg-red-100"
                                            }`}>
                                            <BookOpen className={`w-6 h-6 ${coursePct >= 75 ? "text-emerald-600" : coursePct >= 50 ? "text-amber-600" : "text-red-500"
                                                }`} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 uppercase tracking-tighter">{group.courseTitle}</h3>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{group.className}</span>
                                                <span className="text-[9px] text-slate-300">•</span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{group.termTitle}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        {/* Mini stats */}
                                        <div className="hidden md:flex items-center gap-4">
                                            <div className="text-center">
                                                <p className="text-lg font-black text-emerald-600">{presentInCourse}</p>
                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Present</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-black text-red-400">{totalInCourse - presentInCourse}</p>
                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Absent</p>
                                            </div>
                                            <div className={`text-lg font-black px-3 py-1 rounded-xl ${coursePct >= 75 ? "bg-emerald-50 text-emerald-600" :
                                                    coursePct >= 50 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-500"
                                                }`}>
                                                {coursePct}%
                                            </div>
                                        </div>
                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                    </div>
                                </button>

                                {/* Progress bar */}
                                <div className="px-6 pb-1">
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${coursePct >= 75 ? "bg-emerald-500" : coursePct >= 50 ? "bg-amber-400" : "bg-red-400"
                                                }`}
                                            style={{ width: `${coursePct}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Expanded lesson records */}
                                {isExpanded && (
                                    <div className="border-t border-slate-50 divide-y divide-slate-50">
                                        {group.records
                                            .sort((a, b) => new Date(b.lesson.startDate).getTime() - new Date(a.lesson.startDate).getTime())
                                            .map(rec => (
                                                <div key={rec.id} className={`px-6 py-4 flex items-center gap-4 ${rec.present ? "" : "bg-red-50/30"}`}>
                                                    {rec.present
                                                        ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                                        : <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                                                    }
                                                    <div className="flex-grow min-w-0">
                                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{rec.lesson.title}</p>
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">{rec.lesson.unit.title}</p>
                                                        {!rec.present && rec.note && (
                                                            <p className="text-[10px] text-red-400 mt-1 italic">Note: {rec.note}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <p className="text-[9px] font-bold text-slate-500">
                                                            {new Date(rec.lesson.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </p>
                                                        <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${rec.present ? "text-emerald-600" : "text-red-500"}`}>
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
