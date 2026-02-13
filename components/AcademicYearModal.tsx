"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Calendar, RefreshCcw, Check } from "lucide-react";
import { toast } from "react-hot-toast";

interface AcademicYear {
    id?: string;
    title: string;
    startDate: string;
    endDate: string;
}

interface AcademicYearModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingYear: AcademicYear | null;
}

export default function AcademicYearModal({
    isOpen,
    onClose,
    onSuccess,
    editingYear
}: AcademicYearModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<AcademicYear>({
        title: "",
        startDate: "",
        endDate: "",
    });

    useEffect(() => {
        if (editingYear) {
            setFormData({
                title: editingYear.title,
                startDate: new Date(editingYear.startDate).toISOString().split('T')[0],
                endDate: new Date(editingYear.endDate).toISOString().split('T')[0],
            });
        } else {
            setFormData({
                title: "",
                startDate: "",
                endDate: "",
            });
        }
    }, [editingYear, isOpen]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const tid = toast.loading(`${editingYear ? 'Synchronizing' : 'Deploying'} academic cycle...`);

        try {
            const url = editingYear
                ? `/api/academic-years/${editingYear.id}`
                : "/api/academic-years";

            const method = editingYear ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Synchronization protocol failed.");

            toast.success(`Academic Cycle ${editingYear ? 'Updated' : 'Deployed'}.`, { id: tid, icon: "📅" });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(`PROTOCOL ERROR: ${err.message}`, { id: tid });
        } finally {
            setLoading(false);
        }
    }

    const inputClass = "w-full bg-slate-50/50 border border-slate-100 rounded-[2rem] px-8 py-5 text-sm font-bold text-slate-900 focus:ring-8 focus:ring-emerald-500/5 focus:bg-white outline-none transition-all shadow-sm placeholder:text-slate-300";
    const labelClass = "text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-3 block ml-4";

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />

            <div className="relative bg-white border border-slate-100 w-full max-w-md rounded-[3rem] p-10 animate-fade-up shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)]">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-900 p-4 rounded-[2rem] text-white shadow-2xl">
                            {editingYear ? <RefreshCcw className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tighter">
                                {editingYear ? "Update Cycle" : "Year Setup"}
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Calendar Module</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-all">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="space-y-8">
                        <div>
                            <label className={labelClass}>Calendar Title</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. 2026 Academic Year"
                                className={inputClass}
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className={labelClass}>Start Key</label>
                                <input
                                    type="date"
                                    required
                                    className={inputClass}
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={labelClass}>End Key</label>
                                <input
                                    type="date"
                                    required
                                    className={inputClass}
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-6 rounded-[2rem] flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-200"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                {editingYear ? <RefreshCcw className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                                {editingYear ? "Sync Cycle" : "Initialize Cycle"}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
}
