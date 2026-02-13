"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, FileText, Target, Calendar, Book, Layers, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface ExamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ExamModal({ isOpen, onClose, onSuccess }: ExamModalProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [classes, setClasses] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [years, setYears] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        classId: "",
        courseId: "",
        academicYearId: "",
        termId: "",
        remembering: false,
        understanding: false,
        applying: false,
        analyzing: false,
        evaluating: false,
        creating: false,
    });

    useEffect(() => {
        if (!isOpen) return;
        async function loadMetadata() {
            setFetching(true);
            try {
                const [cRes, crsRes, yRes] = await Promise.all([
                    fetch("/api/classes"),
                    fetch("/api/courses"),
                    fetch("/api/academic-years")
                ]);
                const [cData, crsData, yData] = await Promise.all([cRes.json(), crsRes.json(), yRes.json()]);
                setClasses(cData);
                setCourses(crsData);
                setYears(yData);
            } catch (err) {
                toast.error("Metadata retrieval failed.");
            } finally {
                setFetching(false);
            }
        }
        loadMetadata();
    }, [isOpen]);

    const availableTerms = years.find(y => y.id === formData.academicYearId)?.terms || [];

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const tid = toast.loading("Constructing examination node...");

        try {
            const res = await fetch("/api/exams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Validation failure.");

            toast.success("Examination Scheduled.", { id: tid, icon: "📝" });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(`ERROR: ${err.message}`, { id: tid });
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen || !mounted) return null;

    const inputClass = "w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all placeholder:text-slate-300";
    const labelClass = "text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2";

    const TaxonomySwitch = ({ label, field }: { label: string, field: keyof typeof formData }) => (
        <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
                <input type="checkbox" className="sr-only" checked={!!formData[field]} onChange={e => setFormData({ ...formData, [field]: e.target.checked })} />
                <div className={`w-12 h-6 rounded-full transition-colors ${formData[field] ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData[field] ? 'translate-x-6' : ''}`} />
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${formData[field] ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`}>{label}</span>
        </label>
    );

    return createPortal(
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-fade-up max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-emerald-500 shadow-xl">
                            <Target className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter">Assessment Provision</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Bloom's Taxonomy Synchronization</p>
                        </div>
                    </div>
                </div>

                {fetching ? (
                    <div className="py-20 flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Catalog...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <div>
                                <label className={labelClass}>Examination Paradigm</label>
                                <input required className={inputClass} placeholder="e.g. End of Term Assessment" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>Course Allocation</label>
                                    <select required className={inputClass} value={formData.courseId} onChange={e => setFormData({ ...formData, courseId: e.target.value })}>
                                        <option value="">Select Domain</option>
                                        {courses.map(c => <option key={c.id} value={c.id}>[{c.class.name}] {c.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Target Node (Class)</label>
                                    <select required className={inputClass} value={formData.classId} onChange={e => setFormData({ ...formData, classId: e.target.value })}>
                                        <option value="">Select Node</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Academic Year</label>
                                    <select required className={inputClass} value={formData.academicYearId} onChange={e => setFormData({ ...formData, academicYearId: e.target.value, termId: "" })}>
                                        <option value="">Select Year</option>
                                        {years.map(y => <option key={y.id} value={y.id}>{y.title}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Terminus Partition</label>
                                    <select required className={inputClass} value={formData.termId} onChange={e => setFormData({ ...formData, termId: e.target.value })}>
                                        <option value="">Select Term</option>
                                        {availableTerms.map((t: any) => <option key={t.id} value={t.id}>{t.title}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="p-8 bg-slate-50 rounded-[2.5rem] space-y-6">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Cognitive Complexity Map (Bloom's)</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-10">
                                    <TaxonomySwitch label="Remembering" field="remembering" />
                                    <TaxonomySwitch label="Understanding" field="understanding" />
                                    <TaxonomySwitch label="Applying" field="applying" />
                                    <TaxonomySwitch label="Analyzing" field="analyzing" />
                                    <TaxonomySwitch label="Evaluating" field="evaluating" />
                                    <TaxonomySwitch label="Creating" field="creating" />
                                </div>
                            </div>
                        </div>

                        <button disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-50">
                            {loading ? "Committing Node..." : "Initialize Examination"}
                        </button>
                    </form>
                )}
            </div>
        </div>,
        document.body
    );
}
