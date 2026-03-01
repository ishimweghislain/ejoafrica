"use client";

import { useState, useEffect } from "react";
import {
    Plus, BookOpen, Clock, Layers, Trash2, Edit,
    AlertCircle, Loader2, CheckCircle2, XCircle,
    Users, ChevronDown, ChevronUp, Save
} from "lucide-react";
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
    unit: { title: string };
    evaluation: string;
    teachingMethod: string;
}

interface AttendanceRecord {
    studentId: string;
    firstName: string;
    lastName: string;
    present: boolean;
    note: string;
}

export default function LessonPlanPage() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editLesson, setEditLesson] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [schemes, setSchemes] = useState<any[]>([]);
    const [selectedScheme, setSelectedScheme] = useState<any>(null);

    // Attendance state
    const [attendanceOpen, setAttendanceOpen] = useState<string | null>(null);
    const [attendanceStudents, setAttendanceStudents] = useState<AttendanceRecord[]>([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [savingAttendance, setSavingAttendance] = useState(false);

    async function fetchData() {
        setLoading(true);
        try {
            const [lRes, uRes, sRes] = await Promise.all([
                fetch("/api/lessons"),
                fetch("/api/auth/me"),
                fetch("/api/schemes-of-work")
            ]);
            const [lData, uData, sData] = await Promise.all([
                lRes.json(), uRes.json(), sRes.json()
            ]);
            setLessons(Array.isArray(lData) ? lData : []);
            setUser(uData);

            // KEY FIX: uData.id not uData.userId
            const teacherSchemes = Array.isArray(sData)
                ? sData.filter((s: any) => s.teacherId === uData.id || uData.role === "DOS")
                : [];
            setSchemes(teacherSchemes);
            if (teacherSchemes.length > 0 && !selectedScheme) {
                setSelectedScheme(teacherSchemes[0]);
            }
        } catch {
            toast.error("Failed to load data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchData(); }, []);

    async function handleDelete(id: string) {
        if (!confirm("Delete this lesson? This will also delete its attendance records.")) return;
        const tid = toast.loading("Deleting lesson...");
        try {
            const res = await fetch(`/api/lessons/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed");
            toast.success("Lesson deleted.", { id: tid });
            fetchData();
        } catch {
            toast.error("Could not delete lesson.", { id: tid });
        }
    }

    async function handleEditClick(lesson: Lesson) {
        // Fetch full lesson data (with unit info etc)
        setEditLesson(lesson);
        setIsModalOpen(true);
    }

    async function openAttendance(lesson: Lesson) {
        if (attendanceOpen === lesson.id) {
            setAttendanceOpen(null);
            return;
        }
        setAttendanceOpen(lesson.id);
        setAttendanceLoading(true);

        try {
            // Fetch lesson details (includes class students + existing attendance)
            const res = await fetch(`/api/lessons/${lesson.id}`);
            const data = await res.json();

            const students = data.scheme?.class?.users || [];
            const existingAttendance: any[] = data.attendance || [];

            const records: AttendanceRecord[] = students.map((s: any) => {
                const existing = existingAttendance.find((a: any) => a.studentId === s.id);
                return {
                    studentId: s.id,
                    firstName: s.firstName,
                    lastName: s.lastName,
                    present: existing ? existing.present : true,
                    note: existing?.note || "",
                };
            });

            setAttendanceStudents(records);
        } catch {
            toast.error("Could not load student list.");
            setAttendanceOpen(null);
        } finally {
            setAttendanceLoading(false);
        }
    }

    async function saveAttendance(lessonId: string) {
        setSavingAttendance(true);
        const tid = toast.loading("Saving attendance...");
        try {
            const res = await fetch("/api/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lessonId,
                    records: attendanceStudents.map(s => ({
                        studentId: s.studentId,
                        present: s.present,
                        note: s.note || null,
                    }))
                })
            });
            if (!res.ok) throw new Error("Failed");
            toast.success(`Attendance saved for ${attendanceStudents.length} students! ✓`, { id: tid });
            setAttendanceOpen(null);
        } catch {
            toast.error("Could not save attendance.", { id: tid });
        } finally {
            setSavingAttendance(false);
        }
    }

    function toggleStudent(studentId: string, present: boolean) {
        setAttendanceStudents(prev =>
            prev.map(s => s.studentId === studentId ? { ...s, present } : s)
        );
    }

    const isTeacher = user?.role === "TEACHER";

    // Count units from selected scheme
    let unitCount = 0;
    let topicCount = 0;
    (selectedScheme?.course?.topics || []).forEach((t: any) => {
        topicCount++;
        (t.subtopics || []).forEach((s: any) => { unitCount += s.units?.length || 0; });
    });

    return (
        <div className="space-y-10 animate-fade-up">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Lesson Plans</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-emerald-600">Plan and track your daily lessons.</p>
                </div>

                {isTeacher && (
                    <div className="flex flex-wrap gap-4 items-end">
                        {schemes.length > 0 ? (
                            <div className="flex flex-col">
                                <label className="text-[8px] font-black uppercase text-slate-400 mb-1 ml-2">Target Scheme</label>
                                <select
                                    className="bg-white border border-slate-100 rounded-2xl px-6 py-3 text-[10px] font-black uppercase tracking-widest outline-none shadow-sm"
                                    value={selectedScheme?.id || ""}
                                    onChange={(e) => setSelectedScheme(schemes.find(s => s.id === e.target.value) || null)}
                                >
                                    <option value="">— Choose —</option>
                                    {schemes.map(s => (
                                        <option key={s.id} value={s.id}>{s.course?.title} - {s.class?.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="bg-amber-50 border border-amber-100 rounded-2xl px-6 py-3 flex items-center gap-3">
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                <p className="text-[9px] font-black uppercase tracking-widest text-amber-700">No schemes assigned. Contact the DOS.</p>
                            </div>
                        )}
                        {schemes.length > 0 && (
                            <button
                                onClick={() => { setEditLesson(null); setIsModalOpen(true); }}
                                className="bg-slate-900 text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/10 hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add Lesson</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left — scheme summary */}
                <div className="lg:col-span-1 space-y-6">
                    {selectedScheme ? (
                        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-5">
                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Active Scheme</p>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">{selectedScheme.course?.title}</h3>
                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">{selectedScheme.class?.name}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
                                <div className="bg-slate-50 rounded-xl p-3">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Topics</p>
                                    <p className="text-xl font-black text-slate-900">{topicCount}</p>
                                </div>
                                <div className={`rounded-xl p-3 ${unitCount > 0 ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Lesson Units</p>
                                    <p className={`text-xl font-black ${unitCount > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>{unitCount}</p>
                                </div>
                            </div>
                            {unitCount === 0 && (
                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
                                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-amber-700 leading-relaxed">
                                        No lesson units yet. Ask the DOS to add subtopics and units inside the course syllabus.
                                    </p>
                                </div>
                            )}
                            <div className="pt-2 border-t border-slate-50">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Lessons Recorded</p>
                                <p className="text-xl font-black text-slate-900">{lessons.length}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center gap-4 border border-dashed border-slate-200 min-h-[200px]">
                            <Layers className="w-8 h-8 text-slate-300" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Select a scheme above to see details</p>
                        </div>
                    )}
                </div>

                {/* Right — lessons list */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading lessons...</p>
                        </div>
                    ) : lessons.length > 0 ? lessons.map(lesson => (
                        <div key={lesson.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            {/* Lesson card */}
                            <div className="p-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="space-y-3 flex-grow">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-slate-50 text-slate-400 rounded-md border border-slate-100">
                                            {lesson.scheme.class.name}
                                        </span>
                                        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-blue-50 text-blue-600 rounded-md border border-blue-100">
                                            {lesson.scheme.course.title}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">{lesson.title}</h3>
                                    <div className="flex flex-wrap items-center gap-5">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <Layers className="w-3.5 h-3.5 text-emerald-500" />
                                            {lesson.unit.title}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                            {new Date(lesson.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>

                                {isTeacher && (
                                    <div className="flex gap-2 shrink-0">
                                        {/* Take Attendance */}
                                        <button
                                            onClick={() => openAttendance(lesson)}
                                            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${attendanceOpen === lesson.id
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                                                }`}
                                        >
                                            <Users className="w-4 h-4" />
                                            {attendanceOpen === lesson.id ? 'Close' : 'Attendance'}
                                            {attendanceOpen === lesson.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                        </button>
                                        {/* Edit */}
                                        <button
                                            onClick={() => handleEditClick(lesson)}
                                            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        {/* Delete */}
                                        <button
                                            onClick={() => handleDelete(lesson.id)}
                                            className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Attendance panel */}
                            {attendanceOpen === lesson.id && (
                                <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                                            <Users className="w-4 h-4 text-emerald-600" />
                                            Student Attendance — {lesson.title}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">
                                                {attendanceStudents.filter(s => s.present).length}/{attendanceStudents.length} Present
                                            </span>
                                        </div>
                                    </div>

                                    {attendanceLoading ? (
                                        <div className="py-8 flex flex-col items-center gap-3">
                                            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Loading students...</p>
                                        </div>
                                    ) : attendanceStudents.length === 0 ? (
                                        <div className="py-8 text-center">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                                No students found in this class. Make sure students are enrolled in {lesson.scheme.class.name}.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Quick all buttons */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setAttendanceStudents(prev => prev.map(s => ({ ...s, present: true })))}
                                                    className="text-[9px] font-black uppercase tracking-widest px-3 py-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition-all"
                                                >
                                                    All Present
                                                </button>
                                                <button
                                                    onClick={() => setAttendanceStudents(prev => prev.map(s => ({ ...s, present: false })))}
                                                    className="text-[9px] font-black uppercase tracking-widest px-3 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all"
                                                >
                                                    All Absent
                                                </button>
                                            </div>

                                            {/* Student list */}
                                            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                                {attendanceStudents.map(student => (
                                                    <div key={student.studentId} className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between border border-slate-100 shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white text-[10px] font-black">
                                                                {student.firstName[0]}{student.lastName[0]}
                                                            </div>
                                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                                                {student.firstName} {student.lastName}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => toggleStudent(student.studentId, true)}
                                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${student.present
                                                                    ? 'bg-emerald-500 text-white shadow-md'
                                                                    : 'bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-700'
                                                                    }`}
                                                            >
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                Present
                                                            </button>
                                                            <button
                                                                onClick={() => toggleStudent(student.studentId, false)}
                                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!student.present
                                                                    ? 'bg-red-500 text-white shadow-md'
                                                                    : 'bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-700'
                                                                    }`}
                                                            >
                                                                <XCircle className="w-3 h-3" />
                                                                Absent
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => saveAttendance(lesson.id)}
                                                disabled={savingAttendance}
                                                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {savingAttendance ? (
                                                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                                ) : (
                                                    <><Save className="w-4 h-4" /> Save Attendance ({attendanceStudents.filter(s => s.present).length} Present)</>
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="py-32 flex flex-col items-center gap-6 bg-slate-50/50 rounded-[4rem] border border-dashed border-slate-200">
                            <BookOpen className="w-16 h-16 text-slate-200" />
                            <div className="text-center space-y-2">
                                <p className="font-black text-slate-900 uppercase tracking-tighter text-xl">No Lessons Found</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    {isTeacher ? "Use Add Lesson above to record a lesson." : "No lessons have been recorded yet."}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <LessonModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditLesson(null); }}
                onSuccess={fetchData}
                schemeId={selectedScheme?.id}
                courseId={selectedScheme?.courseId || selectedScheme?.course?.id}
                initialData={editLesson}
            />
        </div>
    );
}
