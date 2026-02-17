"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, BookOpen, Clock, Calendar, CheckCircle, List, FileText } from "lucide-react";
import { toast } from "react-hot-toast";

interface LessonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    schemeId?: string;
    courseId?: string; // To fetch units
}

export default function LessonModal({ isOpen, onClose, onSuccess, schemeId, courseId }: LessonModalProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [units, setUnits] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        unitId: "",
        startDate: "",
        endDate: "",
        teachingMethod: "",
        resources: "",
        evaluation: "",
    });

    useEffect(() => {
        if (!isOpen || !courseId) return;
        async function fetchUnits() {
            setFetching(true);
            try {
                // We'll fetch units via the course details API
                const res = await fetch(`/api/courses/${courseId}`);
                const data = await res.json();
                const allUnits: any[] = [];
                data.topics.forEach((t: any) => {
                    t.subtopics.forEach((s: any) => {
                        s.units.forEach((u: any) => {
                            allUnits.push({ ...u, subtopicTitle: s.title });
                        });
                    });
                });
                setUnits(allUnits);
            } catch (err) {
                toast.error("Failed to load units.");
            } finally {
                setFetching(false);
            }
        }
        fetchUnits();
    }, [isOpen, courseId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!schemeId) return;
        setLoading(true);
        const tid = toast.loading("Saving lesson...");

        try {
            const res = await fetch("/api/lessons", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    schemeId,
                }),
            });

            if (!res.ok) throw new Error("Failed to save.");

            toast.success("Lesson saved.", { id: tid, icon: "📓" });
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
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-fade-up max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter">Add Lesson</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Daily lesson plan</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-all"><X className="w-6 h-6 text-slate-400" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className={labelClass}>Lesson Title / Objective</label>
                            <input required className={inputClass} placeholder="e.g. Understanding Momentum Vectors" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        </div>

                        <div className="col-span-2">
                            <label className={labelClass}>Unit</label>
                            <select required className={inputClass} value={formData.unitId} onChange={e => setFormData({ ...formData, unitId: e.target.value })}>
                                <option value="">Select unit</option>
                                {units.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Start Date</label>
                            <input type="datetime-local" required className={inputClass} value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                        </div>
                        <div>
                            <label className={labelClass}>End Date</label>
                            <input type="datetime-local" required className={inputClass} value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
                        </div>

                        <div className="col-span-2 grid grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Methodology</label>
                                <textarea className={`${inputClass} h-24`} placeholder="e.g. Direct Instruction, Group Discussion" value={formData.teachingMethod} onChange={e => setFormData({ ...formData, teachingMethod: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Evaluation Mechanism</label>
                                <textarea className={`${inputClass} h-24`} placeholder="e.g. Formative Quiz, Peer Review" value={formData.evaluation} onChange={e => setFormData({ ...formData, evaluation: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <button disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-50">
                        {loading ? "Saving..." : "Save Lesson"}
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
}
