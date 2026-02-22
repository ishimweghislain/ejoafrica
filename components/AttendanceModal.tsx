"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Users, CheckCircle2, XCircle, Save, UserCheck } from "lucide-react";
import { toast } from "react-hot-toast";

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
}

interface AttendanceRecord {
    studentId: string;
    present: boolean;
    note: string;
}

interface AttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    lesson: {
        id: string;
        title: string;
        unit: { title: string };
    } | null;
    students: Student[];
    onSuccess: () => void;
}

export default function AttendanceModal({ isOpen, onClose, lesson, students, onSuccess }: AttendanceModalProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [records, setRecords] = useState<Record<string, AttendanceRecord>>({});

    useEffect(() => {
        if (!isOpen || !lesson || students.length === 0) return;

        // Pre-load existing attendance records
        setLoading(true);
        fetch(`/api/attendance?lessonId=${lesson.id}`)
            .then(r => r.json())
            .then((data: any[]) => {
                const map: Record<string, AttendanceRecord> = {};
                // First, mark all students as present by default
                students.forEach(s => {
                    map[s.id] = { studentId: s.id, present: true, note: "" };
                });
                // Override with existing records
                if (Array.isArray(data)) {
                    data.forEach((rec: any) => {
                        map[rec.studentId] = {
                            studentId: rec.studentId,
                            present: rec.present,
                            note: rec.note || ""
                        };
                    });
                }
                setRecords(map);
            })
            .catch(() => {
                // Initialize all as present if fetch fails
                const map: Record<string, AttendanceRecord> = {};
                students.forEach(s => {
                    map[s.id] = { studentId: s.id, present: true, note: "" };
                });
                setRecords(map);
            })
            .finally(() => setLoading(false));
    }, [isOpen, lesson, students]);

    function toggleAttendance(studentId: string) {
        setRecords(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], present: !prev[studentId]?.present }
        }));
    }

    function setNote(studentId: string, note: string) {
        setRecords(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], note }
        }));
    }

    function markAll(present: boolean) {
        const updated: Record<string, AttendanceRecord> = {};
        students.forEach(s => {
            updated[s.id] = { ...records[s.id], studentId: s.id, present };
        });
        setRecords(updated);
    }

    async function handleSave() {
        if (!lesson) return;
        setSaving(true);
        const tid = toast.loading("Saving attendance...");

        try {
            const res = await fetch("/api/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lessonId: lesson.id,
                    records: Object.values(records)
                })
            });
            if (!res.ok) throw new Error("Save failed");

            const presentCount = Object.values(records).filter(r => r.present).length;
            toast.success(`Attendance saved! ${presentCount}/${students.length} present`, { id: tid, icon: "✅" });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error("Failed to save attendance", { id: tid });
        } finally {
            setSaving(false);
        }
    }

    if (!isOpen || !mounted || !lesson) return null;

    const presentCount = Object.values(records).filter(r => r.present).length;
    const absentCount = students.length - presentCount;

    return createPortal(
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl animate-fade-up max-h-[92vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-8 border-b border-slate-100">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900">Class Attendance</h3>
                                <p className="text-[9px] font-black uppercase tracking-widest text-blue-600">{lesson.title}</p>
                                <p className="text-[9px] text-slate-400 uppercase tracking-widest">{lesson.unit.title}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="mt-6 flex gap-3">
                        <div className="flex-1 bg-emerald-50 rounded-2xl p-3 text-center border border-emerald-100">
                            <p className="text-2xl font-black text-emerald-600">{presentCount}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Present</p>
                        </div>
                        <div className="flex-1 bg-red-50 rounded-2xl p-3 text-center border border-red-100">
                            <p className="text-2xl font-black text-red-500">{absentCount}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-red-400">Absent</p>
                        </div>
                        <div className="flex-1 bg-slate-50 rounded-2xl p-3 text-center border border-slate-100">
                            <p className="text-2xl font-black text-slate-700">{students.length}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total</p>
                        </div>
                    </div>

                    {/* Bulk actions */}
                    <div className="mt-4 flex gap-3">
                        <button
                            onClick={() => markAll(true)}
                            className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl py-2 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Mark All Present
                        </button>
                        <button
                            onClick={() => markAll(false)}
                            className="flex-1 bg-red-50 text-red-600 border border-red-100 rounded-xl py-2 text-[9px] font-black uppercase tracking-widest hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                        >
                            <XCircle className="w-3.5 h-3.5" /> Mark All Absent
                        </button>
                    </div>
                </div>

                {/* Student list */}
                <div className="overflow-y-auto flex-grow p-4 space-y-2">
                    {loading ? (
                        <div className="py-12 flex flex-col items-center gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Loading records...</p>
                        </div>
                    ) : students.length === 0 ? (
                        <div className="py-12 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No students in this class</p>
                        </div>
                    ) : students.map((student, idx) => {
                        const rec = records[student.id];
                        const isPresent = rec?.present !== false;
                        return (
                            <div
                                key={student.id}
                                className={`rounded-2xl border p-4 flex items-center gap-4 transition-all ${isPresent
                                        ? "bg-emerald-50 border-emerald-200"
                                        : "bg-red-50 border-red-200"
                                    }`}
                            >
                                {/* Avatar / Number */}
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 ${isPresent ? "bg-emerald-500 text-white" : "bg-red-400 text-white"
                                    }`}>
                                    {idx + 1}
                                </div>

                                {/* Name */}
                                <div className="flex-grow">
                                    <p className="font-black text-sm text-slate-900 uppercase tracking-tight leading-none">
                                        {student.firstName} {student.lastName}
                                    </p>
                                    {!isPresent && (
                                        <input
                                            className="mt-2 w-full border-0 bg-white/70 rounded-lg px-3 py-1.5 text-xs text-slate-600 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-red-300"
                                            placeholder="Reason for absence (optional)"
                                            value={rec?.note || ""}
                                            onChange={e => setNote(student.id, e.target.value)}
                                            onClick={e => e.stopPropagation()}
                                        />
                                    )}
                                </div>

                                {/* Toggle */}
                                <button
                                    onClick={() => toggleAttendance(student.id)}
                                    className={`shrink-0 w-12 h-7 rounded-full transition-all relative ${isPresent ? "bg-emerald-500" : "bg-red-400"
                                        }`}
                                >
                                    <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${isPresent ? "left-6" : "left-1"
                                        }`} />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Footer save */}
                <div className="p-6 border-t border-slate-100">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-600 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {saving
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                            : <><Save className="w-4 h-4" /> Save Attendance — {presentCount}/{students.length} Present</>
                        }
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
