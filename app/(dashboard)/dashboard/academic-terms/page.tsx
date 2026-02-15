"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Search, Loader2, CalendarRange, Trash2, Edit2, X, AlertTriangle, RefreshCcw, Check, Calendar, Bookmark } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import { toast } from "react-hot-toast";

interface AcademicYear {
    id: string;
    title: string;
}

interface AcademicTerm {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    academicYear: AcademicYear;
    academicYearId: string;
}

export default function AcademicTermsPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    const [terms, setTerms] = useState<AcademicTerm[]>([]);
    const [years, setYears] = useState<AcademicYear[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTerm, setSelectedTerm] = useState<AcademicTerm | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        startDate: "",
        endDate: "",
        academicYearId: "",
    });

    async function fetchData() {
        try {
            const [termsRes, yearsRes] = await Promise.all([
                fetch("/api/academic-terms"),
                fetch("/api/academic-years")
            ]);
            const [termsData, yearsData] = await Promise.all([
                termsRes.json(),
                yearsRes.json()
            ]);
            setTerms(Array.isArray(termsData) ? termsData : []);
            setYears(Array.isArray(yearsData) ? yearsData : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        const tid = toast.loading(`${selectedTerm ? 'Updating' : 'Adding'} academic term...`);
        try {
            const url = selectedTerm ? `/api/academic-terms/${selectedTerm.id}` : "/api/academic-terms";
            const method = selectedTerm ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save academic term.");

            toast.success(`Term ${selectedTerm ? 'Updated' : 'Added'} successfully.`, { id: tid, icon: "🗓️" });
            handleCloseModal();
            fetchData();
        } catch (err: any) {
            toast.error(`Error: ${err.message}`, { id: tid });
        } finally {
            setSubmitting(false);
        }
    }

    const handleDelete = async (id: string) => {
        toast.loading("Deleting term...", { id: "delete-term" });
        try {
            const res = await fetch(`/api/academic-terms/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Deletion failed.");

            toast.success("Term deleted successfully.", { id: "delete-term", icon: "🗑️" });
            fetchData();
            setShowDeleteConfirm(null);
        } catch (err) {
            toast.error("Deletion failed.", { id: "delete-term" });
        }
    };

    const handleEdit = (term: AcademicTerm) => {
        setSelectedTerm(term);
        setFormData({
            title: term.title,
            startDate: new Date(term.startDate).toISOString().split('T')[0],
            endDate: new Date(term.endDate).toISOString().split('T')[0],
            academicYearId: term.academicYearId,
        });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedTerm(null);
        setFormData({ title: "", startDate: "", endDate: "", academicYearId: "" });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTerm(null);
        setFormData({ title: "", startDate: "", endDate: "", academicYearId: "" });
    };

    const inputClass = "w-full bg-slate-50/50 border border-slate-100 rounded-[2rem] px-8 py-5 text-sm font-bold text-slate-900 focus:ring-8 focus:ring-emerald-500/5 focus:bg-white outline-none transition-all shadow-sm placeholder:text-slate-300 appearance-none";
    const labelClass = "text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] mb-3 block ml-4";

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase tracking-tighter">School Terms</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Create and manage terms for each academic year.</p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="bg-emerald-600 text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-600/20 hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Term</span>
                </button>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Term Name</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Academic Year</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Date Range</th>
                                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-10 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Loading terms...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : terms.length > 0 ? (
                                terms.map((term) => (
                                    <tr key={term.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-xl shadow-emerald-600/10 group-hover:scale-110 transition-transform">
                                                    <CalendarRange className="w-5 h-5" />
                                                </div>
                                                <span className="font-black text-slate-900 tracking-tight uppercase">{term.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-5 py-2 rounded-full border border-blue-100">
                                                {term.academicYear?.title || "Previous Year"}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8 text-xs font-bold text-slate-500 tracking-wider">
                                            {new Date(term.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} — {new Date(term.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEdit(term)}
                                                    className="p-3 bg-white hover:bg-emerald-50 rounded-2xl text-slate-400 hover:text-emerald-600 transition-all border border-slate-100"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(term.id)}
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
                                            <CalendarRange className="w-16 h-16 opacity-10" />
                                            <p className="font-black uppercase tracking-widest text-[10px]">No terms found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Add/Edit */}
            {isModalOpen && mounted && createPortal(
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={handleCloseModal} />
                    <form onSubmit={handleSubmit} className="relative bg-white w-full max-w-md rounded-[3rem] p-8 md:p-10 animate-fade-up shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-100 space-y-10 overflow-y-auto max-h-[95vh]">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="absolute top-6 right-6 p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="bg-slate-900 p-4 rounded-[2rem] text-white shadow-2xl">
                                {selectedTerm ? <RefreshCcw className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 leading-tight uppercase tracking-tighter">
                                    {selectedTerm ? "Update Term" : "Add New Term"}
                                </h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                    {selectedTerm ? "Update school term" : "Create a new school term"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className={labelClass}>Academic Year</label>
                                <select
                                    required
                                    className={inputClass}
                                    value={formData.academicYearId}
                                    onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                                >
                                    <option value="">Select Academic Year</option>
                                    {years.map(y => <option key={y.id} value={y.id}>{y.title}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Term Name</label>
                                <input
                                    required
                                    className={inputClass}
                                    placeholder="e.g. Term One"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        className={inputClass}
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>End Date</label>
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
                            disabled={submitting}
                            className="w-full bg-slate-900 text-white py-6 rounded-[2rem] flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-200"
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    {selectedTerm ? <RefreshCcw className="w-5 h-5" /> : <Check className="w-5 h-5" />}
                                    <span>{selectedTerm ? "Save Changes" : "Save Term"}</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>,
                document.body
            )}

            <ConfirmModal
                isOpen={!!showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(null)}
                onConfirm={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}
                title="Delete Term?"
                description="This will permanently remove this school term."
            />
        </div>
    );
}
