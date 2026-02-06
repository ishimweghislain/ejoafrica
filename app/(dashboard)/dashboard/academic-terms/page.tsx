"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Loader2, CalendarRange, Trash2, Edit2, X } from "lucide-react";

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
}

export default function AcademicTermsPage() {
    const [terms, setTerms] = useState<AcademicTerm[]>([]);
    const [years, setYears] = useState<AcademicYear[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

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
            setTerms(termsData);
            setYears(yearsData);
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
        setError("");
        try {
            const res = await fetch("/api/academic-terms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error("Failed to create term");
            setFormData({ title: "", startDate: "", endDate: "", academicYearId: "" });
            setIsModalOpen(false);
            fetchData();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Academic Terms</h1>
                    <p className="text-gray-500 text-sm">Define grading periods within academic years.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Term</span>
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Term Title</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Academic Year</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Duration</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
                                    </td>
                                </tr>
                            ) : terms.length > 0 ? (
                                terms.map((term) => (
                                    <tr key={term.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-50 p-2 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    <CalendarRange className="w-5 h-5" />
                                                </div>
                                                <span className="font-bold text-gray-700">{term.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                                {term.academicYear.title}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-gray-500">
                                            {new Date(term.startDate).toLocaleDateString()} — {new Date(term.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-emerald-600 border border-transparent hover:border-gray-100 transition-all"><Edit2 className="w-4 h-4" /></button>
                                                <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-500 border border-transparent hover:border-gray-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center text-gray-400 italic">No terms defined.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <form onSubmit={handleSubmit} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-fade-up space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold tracking-tight">Setup New Term</h3>
                            <button onClick={() => setIsModalOpen(false)} type="button" className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                        </div>

                        {error && <p className="text-red-500 text-xs font-bold">{error}</p>}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Academic Year</label>
                                <select
                                    required
                                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                    value={formData.academicYearId}
                                    onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                                >
                                    <option value="">Select Year</option>
                                    {years.map(y => <option key={y.id} value={y.id}>{y.title}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Term Title</label>
                                <input
                                    required
                                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                    placeholder="e.g. Term One"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Start Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">End Date</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={submitting} className="w-full btn-primary py-4 flex items-center justify-center gap-2">
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deploy Term"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
