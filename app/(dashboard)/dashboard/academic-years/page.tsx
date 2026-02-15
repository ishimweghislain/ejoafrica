"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, Search, Edit2, Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import AcademicYearModal from "@/components/AcademicYearModal";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "react-hot-toast";

interface AcademicYear {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
}

export default function AcademicYearsPage() {
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

    async function fetchYears() {
        try {
            const res = await fetch("/api/academic-years");
            const data = await res.json();
            setAcademicYears(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchYears();
    }, []);

    async function handleDelete(id: string) {
        toast.loading("Deleting academic year...", { id: "delete-year" });
        try {
            const res = await fetch(`/api/academic-years/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Could not delete academic year.");

            toast.success("Academic year deleted.", { id: "delete-year", icon: "🗑️" });
            fetchYears();
            setShowDeleteConfirm(null);
        } catch (err) {
            toast.error("Deletion failed.", { id: "delete-year" });
        }
    }

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase tracking-tighter">Academic Years</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Manage your school's academic years and terms.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingYear(null);
                        setIsModalOpen(true);
                    }}
                    className="bg-emerald-600 text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Academic Year</span>
                </button>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Year Name</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Start Date</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">End Date</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-10 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Loading years...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : academicYears.length > 0 ? (
                                academicYears.map((year) => (
                                    <tr key={year.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-xl shadow-slate-900/10 group-hover:scale-110 transition-transform">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <span className="font-black text-slate-900 tracking-tight uppercase">{year.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-xs font-bold text-slate-500 tracking-wider">
                                            {new Date(year.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-10 py-8 text-xs font-bold text-slate-500 tracking-wider">
                                            {new Date(year.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setEditingYear(year);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-3 bg-white hover:bg-emerald-50 rounded-2xl text-slate-400 hover:text-emerald-600 transition-all border border-slate-100"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(year.id)}
                                                    className="p-3 bg-white hover:bg-red-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all border border-slate-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-10 py-32 text-center text-slate-300">
                                        <div className="flex flex-col items-center gap-6">
                                            <Calendar className="w-16 h-16 opacity-10" />
                                            <p className="font-black uppercase tracking-widest text-[10px]">No academic years found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal
                isOpen={!!showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(null)}
                onConfirm={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
                title="Delete Academic Year?"
                description="This will permanently remove this academic year and all its terms."
            />

            <AcademicYearModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchYears}
                editingYear={editingYear}
            />
        </div>
    );
}
