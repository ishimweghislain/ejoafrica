"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, BookOpen, RefreshCcw } from "lucide-react";
import { toast } from "react-hot-toast";

interface CourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export default function CourseModal({ isOpen, onClose, onSuccess, initialData }: CourseModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [classes, setClasses] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [academicYears, setAcademicYears] = useState<any[]>([]);

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

        if (initialData) {
            setFormData({
                title: initialData.title || "",
                classId: initialData.classId || "",
                teacherId: initialData.teacherId || "",
                academicYearId: initialData.term?.academicYearId || "",
                termId: initialData.termId || "",
                notation: initialData.notation || "",
                hoursPerWeek: initialData.hoursPerWeek?.toString() || "4",
            });
        } else {
            setFormData({
                title: "",
                classId: "",
                teacherId: "",
                academicYearId: "",
                termId: "",
                notation: "",
                hoursPerWeek: "4",
            });
        }
    }, [isOpen, initialData]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const tid = toast.loading(`${initialData ? 'Syncing' : 'Deploying'} course curriculum...`);

        const termId = formData.termId;

        if (!termId || termId === "") {
            toast.error("Calendar Protocol Error: Select a valid academic term.", { id: tid });
            setLoading(false);
            return;
        }

        try {
            const url = initialData ? `/api/courses/${initialData.id}` : "/api/courses";
            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, termId }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Course Deployment Protocol Failure.");

            toast.success(`Course ${initialData ? 'Updated' : 'Deployed'}.`, { id: tid, icon: "📚" });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(`PROTOCOL ERROR: ${err.message}`, { id: tid });
        } finally {
            setLoading(false);
        }
    }

    const inputClass = "w-full bg-slate-50/50 border border-slate-100 rounded-[2rem] px-8 py-5 text-sm font-bold text-slate-900 focus:ring-8 focus:ring-emerald-500/5 focus:bg-white outline-none transition-all shadow-sm placeholder:text-slate-300 appearance-none";
    const labelClass = "text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-3 block ml-4";

    if (!isOpen || !mounted) return null;

    const selectedYear = academicYears.find(y => y.id === formData.academicYearId);
    const availableTerms = selectedYear?.terms || [];

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />

            <div className="relative bg-white border border-slate-100 w-full max-w-lg rounded-[2.5rem] p-8 animate-fade-up shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-2xl">
                            {initialData ? <RefreshCcw className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tighter">
                                {initialData ? "Modify Course" : "Course Design"}
                            </h3>
                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Curriculum Engine</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {fetchingData ? (
                    <div className="py-12 flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Metadata...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
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

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Academic Cycle</label>
                                    <select required className={inputClass} value={formData.academicYearId} onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value, termId: "" })}>
                                        <option value="">Select Cycle</option>
                                        {academicYears.map(y => <option key={y.id} value={y.id}>{y.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Academic Term</label>
                                    <select required className={inputClass} value={formData.termId} onChange={(e) => setFormData({ ...formData, termId: e.target.value })}>
                                        <option value="">Select Term</option>
                                        {availableTerms.map((t: any) => <option key={t.id} value={t.id}>{t.title}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Weekly Bandwidth (H)</label>
                                    <input type="number" className={inputClass} value={formData.hoursPerWeek} onChange={(e) => setFormData({ ...formData, hoursPerWeek: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelClass}>Course Protocol ID</label>
                                    <input className={inputClass} placeholder="e.g. PHY-A1" value={formData.notation} onChange={(e) => setFormData({ ...formData, notation: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-200"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <>
                                    {initialData ? <RefreshCcw className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                                    <span>{initialData ? "Apply Changes" : "Deploy Curriculum"}</span>
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>,
        document.body
    );
}
