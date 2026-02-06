"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

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

            if (!res.ok) throw new Error("Something went wrong");

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-fade-up">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold">
                        {editingYear ? "Edit Academic Year" : "New Academic Year"}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Title</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. 2026 Academic Year"
                            className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none ring-2 ring-transparent focus:ring-emerald-500/20 transition-all"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Start Date</label>
                            <input
                                type="date"
                                required
                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none ring-2 ring-transparent focus:ring-emerald-500/20 transition-all font-medium"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase text-gray-400 tracking-widest">End Date</label>
                            <input
                                type="date"
                                required
                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 outline-none ring-2 ring-transparent focus:ring-emerald-500/20 transition-all font-medium"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-4 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : editingYear ? "Update Year" : "Create Year"}
                    </button>
                </form>
            </div>
        </div>
    );
}
