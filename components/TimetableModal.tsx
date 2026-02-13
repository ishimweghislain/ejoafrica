"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Calendar, Clock, Book, User } from "lucide-react";
import { toast } from "react-hot-toast";

interface TimetableModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const DAYS = [
    { label: "Monday", value: 0 },
    { label: "Tuesday", value: 1 },
    { label: "Wednesday", value: 2 },
    { label: "Thursday", value: 3 },
    { label: "Friday", value: 4 },
    { label: "Saturday", value: 5 },
    { label: "Sunday", value: 6 },
];

export default function TimetableModal({ isOpen, onClose, onSuccess }: TimetableModalProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [classes, setClasses] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        classId: "",
        courseId: "",
        day: 0,
        startTime: "08:00",
        endTime: "09:00",
        academicYearId: "",
        termId: "",
        teacherId: "",
    });

    useEffect(() => {
        if (!isOpen) return;
        async function loadData() {
            try {
                const [clsRes, crsRes] = await Promise.all([
                    fetch("/api/classes"),
                    fetch("/api/courses")
                ]);
                const [clsData, crsData] = await Promise.all([clsRes.json(), crsRes.json()]);
                setClasses(clsData);
                setCourses(crsData);
            } catch (err) {
                toast.error("Failed to load metadata.");
            } finally {
                setFetching(false);
            }
        }
        loadData();
    }, [isOpen]);

    // Update teacherId, academicYearId, termId based on selected course
    useEffect(() => {
        const selectedCourse = courses.find(c => c.id === formData.courseId);
        if (selectedCourse) {
            setFormData(prev => ({
                ...prev,
                teacherId: selectedCourse.teacherId,
                academicYearId: selectedCourse.academicYearId,
                termId: selectedCourse.termId,
            }));
        }
    }, [formData.courseId, courses]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const tid = toast.loading("Scheduling session...");

        try {
            const res = await fetch("/api/timetables", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    day: Number(formData.day)
                }),
            });

            if (!res.ok) throw new Error("Scheduling conflict or protocol failure.");

            toast.success("Session Scheduled.", { id: tid, icon: "🗓️" });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(`PROTOCOL ERROR: ${err.message}`, { id: tid });
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen || !mounted) return null;

    const inputClass = "w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all";
    const labelClass = "text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2";

    return createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-fade-up overflow-hidden">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tighter">Schedule Assignment</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Timetable Optimization</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all"><X className="w-5 h-5" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className={labelClass}>Target Class</label>
                            <select required className={inputClass} value={formData.classId} onChange={e => setFormData({ ...formData, classId: e.target.value })}>
                                <option value="">Select Class Node</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className={labelClass}>Academic Course</label>
                            <select required className={inputClass} value={formData.courseId} onChange={e => setFormData({ ...formData, courseId: e.target.value })}>
                                <option value="">Select Course Resource</option>
                                {courses.filter(c => !formData.classId || c.classId === formData.classId).map(c => (
                                    <option key={c.id} value={c.id}>{c.title} ({c.teacher?.lastName})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Weekday</label>
                            <select required className={inputClass} value={formData.day} onChange={e => setFormData({ ...formData, day: Number(e.target.value) })}>
                                {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Start Dimension</label>
                            <input type="time" required className={inputClass} value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>End Dimension</label>
                            <input type="time" required className={inputClass} value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} />
                        </div>
                    </div>

                    <button disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-50">
                        {loading ? "Committing Schedule..." : "Commit Assignment"}
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
}
