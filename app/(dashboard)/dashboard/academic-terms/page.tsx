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

    const inputClass = "w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white outline-none transition-all";
    const labelClass = "text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2 block ml-1";

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase">Academic Terms</h1>
                    <p className="text-gray-500 text-sm font-bold opacity-60">Define grading periods within academic years.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Term</span>
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Term Title</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Academic Year</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Duration</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
                                    </td>
                                </tr>
                            ) : terms.length > 0 ? (
                                terms.map((term) => (
                                    <tr key={term.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                    <CalendarRange className="w-5 h-5" />
                                                </div>
                                                <span className="font-black text-gray-900 uppercase tracking-tight">{term.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                                                {term.academicYear.title}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-xs font-bold text-gray-500">
                                            {new Date(term.startDate).toLocaleDateString()} — {new Date(term.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <button className="p-3 hover:bg-white rounded-2xl text-gray-400 hover:text-emerald-600 border border-transparent hover:border-gray-100 transition-all"><Edit2 className="w-4 h-4" /></button>
                                                <button className="p-3 hover:bg-white rounded-2xl text-gray-400 hover:text-red-500 border border-transparent hover:border-gray-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-300">
                                            <CalendarRange className="w-16 h-16 opacity-10" />
                                            <p className="font-black uppercase tracking-widest text-xs">No terms defined for this cycle</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
                    <form onSubmit={handleSubmit} className="relative glass-modal w-full max-w-md rounded-[3rem] p-10 animate-fade-up space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-emerald-600 p-3 rounded-2xl text-white">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 uppercase">Deploy Term</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} type="button" className="p-2 hover:bg-gray-100 rounded-xl transition-all"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>

                        {error && <p className="text-red-500 text-[10px] font-black uppercase bg-red-50 p-4 rounded-2xl border border-red-100">{error}</p>}

                        <div className="space-y-6">
                            <div>
                                <label className={labelClass}>Parent Academic Cycle</label>
                                <select
                                    required
                                    className={inputClass}
                                    value={formData.academicYearId}
                                    onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                                >
                                    <option value="">Select Cycle</option>
                                    {years.map(y => <option key={y.id} value={y.id}>{y.title}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className={labelClass}>Institutional Title</label>
                                <input
                                    required
                                    className={inputClass}
                                    placeholder="e.g. Term One"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Commencement</label>
                                    <input
                                        type="date"
                                        required
                                        className={inputClass}
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Termination</label>
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

                        <button type="submit" disabled={submitting} className="w-full btn-primary py-6 flex items-center justify-center gap-3">
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>
                                    <CalendarRange className="w-5 h-5" />
                                    <span>Finalize Deployment</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
