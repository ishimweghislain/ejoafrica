"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Calendar } from "lucide-react";

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
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
    }, [editingYear]);

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

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

            if (!res.ok) throw new Error("Synchronization protocol failed.");

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const inputClass = "w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white outline-none transition-all shadow-sm";
    const labelClass = "text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-3 block ml-2";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-md" onClick={onClose} />

            <div className="relative glass-modal w-full max-w-md rounded-[3rem] p-10 animate-fade-up">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/20">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 leading-tight">Year Setup</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Calendar Module</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-2xl transition-all">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {error && (
                    <div className="mb-8 p-6 bg-red-50 text-red-600 rounded-3xl text-xs font-bold border border-red-100 italic">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-6">
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

                        <div className="grid grid-cols-2 gap-4">
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
                        className="w-full btn-primary py-6 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : editingYear ? "Update Protocol" : "Deploy Year"}
                    </button>
                </form>
            </div>
        </div>
    );
}
