"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

interface CourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CourseModal({ isOpen, onClose, onSuccess }: CourseModalProps) {
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [classes, setClasses] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        classId: "",
        teacherId: "",
        academicYearId: "",
        termId: "",
        notation: "",
        hoursPerWeek: "4",
    });

    useEffect(() => {
        async function loadData() {
            try {
                const [clsRes, tRes, yRes] = await Promise.all([
                    fetch("/api/classes"),
                    fetch("/api/users?role=TEACHER"),
                    fetch("/api/academic-years")
                ]);

                const [clsData, tData, yData] = await Promise.all([
                    clsRes.json(),
                    tRes.json(),
                    yRes.json()
                ]);

                setClasses(clsData);
                setTeachers(tData);
                setAcademicYears(yData);
            } catch (err) {
                console.error(err);
            } finally {
                setFetchingData(false);
            }
        }
        if (isOpen) loadData();
    }, [isOpen]);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Find the first term of the selected academic year for now
        const selectedYear = academicYears.find(y => y.id === formData.academicYearId);
        const termId = selectedYear?.terms?.[0]?.id;

        if (!termId) {
            setError("Selected academic year must have at least one term.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, termId }),
            });

            if (!res.ok) throw new Error("Failed to create course");

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const inputClass = "w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20";
    const labelClass = "text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-xl rounded-3xl p-8 shadow-2xl animate-fade-up">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold">New Course Engineering</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                </div>

                {fetchingData ? (
                    <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-emerald-600" /></div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <p className="text-red-500 text-xs">{error}</p>}

                        <div className="space-y-4">
                            <div>
                                <label className={labelClass}>Course Title</label>
                                <input
                                    required
                                    className={inputClass}
                                    placeholder="e.g. Advanced Physics"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Class</label>
                                    <select required className={inputClass} value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })}>
                                        <option value="">Select Class</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Teacher</label>
                                    <select required className={inputClass} value={formData.teacherId} onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}>
                                        <option value="">Select Teacher</option>
                                        {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Academic Year</label>
                                    <select required className={inputClass} value={formData.academicYearId} onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}>
                                        <option value="">Select Year</option>
                                        {academicYears.map(y => <option key={y.id} value={y.id}>{y.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Hours Per Week</label>
                                    <input type="number" className={inputClass} value={formData.hoursPerWeek} onChange={(e) => setFormData({ ...formData, hoursPerWeek: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Course Notation (Optional)</label>
                                <input className={inputClass} placeholder="e.g. PHY-A1" value={formData.notation} onChange={(e) => setFormData({ ...formData, notation: e.target.value })} />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full btn-primary py-4">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Deploy Course"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
