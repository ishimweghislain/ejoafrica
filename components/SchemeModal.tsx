"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, BookOpen, Layout, Calendar, Layers } from "lucide-react";
import { toast } from "react-hot-toast";

interface SchemeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export default function SchemeModal({ isOpen, onClose, onSuccess, initialData }: SchemeModalProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [years, setYears] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        classId: "",
        academicYearId: "",
        termId: "",
        courseId: "",
        periodsPerWeek: "4",
        reference: "",
        teacherId: "",
    });
    const [teachers, setTeachers] = useState<any[]>([]);
    const [userRole, setUserRole] = useState<string>("");

    useEffect(() => {
        if (!isOpen) return;
        async function loadMetadata() {
            setFetching(true);
            try {
                const [yRes, cRes, crsRes] = await Promise.all([
                    fetch("/api/academic-years"),
                    fetch("/api/classes"),
                    fetch("/api/courses")
                ]);
                const [yData, cData, crsData] = await Promise.all([yRes.json(), cRes.json(), crsRes.json()]);
                setYears(Array.isArray(yData) ? yData : []);
                setClasses(Array.isArray(cData) ? cData : []);
                setCourses(Array.isArray(crsData) ? crsData : []);

                // Load teachers + user role
                const [tRes, uRes] = await Promise.all([
                    fetch("/api/users?role=TEACHER"),
                    fetch("/api/auth/me")
                ]);
                const [tData, uData] = await Promise.all([tRes.json(), uRes.json()]);
                setTeachers(Array.isArray(tData) ? tData : []);
                setUserRole(uData.role || "");
            } catch (err) {
                toast.error("Failed to load setup data.");
            } finally {
                setFetching(false);
            }
        }
        loadMetadata();

        if (initialData) {
            setFormData({
                classId: initialData.classId || "",
                academicYearId: initialData.academicYearId || "",
                termId: initialData.termId || "",
                courseId: initialData.courseId || "",
                periodsPerWeek: initialData.periodsPerWeek?.toString() || "4",
                reference: initialData.reference || "",
                teacherId: initialData.teacherId || "",
            });
        }
    }, [isOpen, initialData]);

    const selectedYear = years.find(y => y.id === formData.academicYearId);
    const availableTerms = selectedYear?.terms || [];

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const tid = toast.loading("Saving teaching plan...");

        try {
            const url = initialData ? `/api/schemes-of-work/${initialData.id}` : "/api/schemes-of-work";
            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    periodsPerWeek: parseInt(formData.periodsPerWeek)
                }),
            });

            if (!res.ok) throw new Error("Could not save the plan.");

            toast.success(`Plan ${initialData ? 'Updated' : 'Created'}.`, { id: tid, icon: "🗺️" });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(`Error: ${err.message}`, { id: tid });
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen || !mounted) return null;

    const inputClass = "w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all placeholder:text-slate-300";
    const labelClass = "text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2";

    return createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl animate-fade-up max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <Layers className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter leading-tight">Teaching Plan</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Plan details</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-all"><X className="w-6 h-6 text-slate-400" /></button>
                </div>

                {fetching ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading details...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2 md:col-span-1">
                                <label className={labelClass}>Subject / Course</label>
                                <select
                                    required
                                    className={inputClass}
                                    value={formData.courseId}
                                    onChange={e => {
                                        const c = courses.find((x: any) => x.id === e.target.value);
                                        setFormData(prev => ({
                                            ...prev,
                                            courseId: e.target.value,
                                            classId: c?.classId || prev.classId,
                                            teacherId: c?.teacherId || prev.teacherId,
                                        }));
                                    }}
                                >
                                    <option value="">Select subject</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.class?.name || "?"})</option>)}
                                </select>
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className={labelClass}>Class</label>
                                <select required className={inputClass} value={formData.classId} onChange={e => setFormData({ ...formData, classId: e.target.value })}>
                                    <option value="">Select class</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Academic Year</label>
                                <select required className={inputClass} value={formData.academicYearId} onChange={e => setFormData({ ...formData, academicYearId: e.target.value, termId: "" })}>
                                    <option value="">Select year</option>
                                    {years.map(y => <option key={y.id} value={y.id}>{y.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Term</label>
                                <select required className={inputClass} value={formData.termId} onChange={e => setFormData({ ...formData, termId: e.target.value })}>
                                    <option value="">Select term</option>
                                    {availableTerms.map((t: any) => <option key={t.id} value={t.id}>{t.title}</option>)}
                                </select>
                            </div>
                            {(userRole === "DOS" || userRole === "SCHOOL_ADMIN") && (
                                <div className="col-span-2">
                                    <label className={labelClass}>Assign Teacher <span className="text-red-400">*</span></label>
                                    <select
                                        required
                                        className={inputClass}
                                        value={formData.teacherId}
                                        onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                                    >
                                        <option value="">— Select teacher —</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label className={labelClass}>Periods / Week</label>
                                <input type="number" required className={inputClass} value={formData.periodsPerWeek} onChange={e => setFormData({ ...formData, periodsPerWeek: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Reference Syllabus</label>
                                <input className={inputClass} placeholder="e.g. Primary 1 Syllabus" value={formData.reference} onChange={e => setFormData({ ...formData, reference: e.target.value })} />
                            </div>
                        </div>

                        <button disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-50">
                            {loading ? "Saving..." : "Save Plan"}
                        </button>
                    </form>
                )}
            </div>
        </div>,
        document.body
    );
}
