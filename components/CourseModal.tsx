"use client";

import { useState, useEffect } from "react";
import { X, Loader2, BookOpen } from "lucide-react";

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
        const termId = selectedYear?.terms?.[0]?.id || selectedYear?.id; // Fallback

        if (!termId) {
            setError("Calendar Protocol Error: Selected academic year must satisfy institutional term definitions.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, termId }),
            });

            if (!res.ok) throw new Error("Course Deployment Protocol Failure.");

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const inputClass = "w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white outline-none transition-all shadow-sm";
    const labelClass = "text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-3 block ml-2";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-md" onClick={onClose} />

            <div className="relative glass-modal w-full max-w-xl rounded-[3rem] p-10 animate-fade-up">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 leading-tight">Course Design</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Curriculum Engine</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-2xl transition-all">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {fetchingData ? (
                    <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-emerald-600" /></div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && <p className="text-red-600 text-[11px] font-bold p-4 bg-red-50 rounded-2xl border border-red-100 italic">{error}</p>}

                        <div className="space-y-6">
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

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>Class Level</label>
                                    <select required className={inputClass} value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })}>
                                        <option value="">Select Level</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Faculty Lead</label>
                                    <select required className={inputClass} value={formData.teacherId} onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}>
                                        <option value="">Select Teacher</option>
                                        {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>Academic Cycle</label>
                                    <select required className={inputClass} value={formData.academicYearId} onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}>
                                        <option value="">Select Cycle</option>
                                        {academicYears.map(y => <option key={y.id} value={y.id}>{y.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Weekly Bandwidth (H)</label>
                                    <input type="number" className={inputClass} value={formData.hoursPerWeek} onChange={(e) => setFormData({ ...formData, hoursPerWeek: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Course Protocol ID (Notation)</label>
                                <input className={inputClass} placeholder="e.g. PHY-A1" value={formData.notation} onChange={(e) => setFormData({ ...formData, notation: e.target.value })} />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full btn-primary py-6 flex items-center justify-center gap-3">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                                <>
                                    <BookOpen className="w-5 h-5" />
                                    Deploy Curriculum
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
