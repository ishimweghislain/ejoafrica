"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, MoreVertical, Search, Edit2, Trash2, Loader2 } from "lucide-react";
import AcademicYearModal from "@/components/AcademicYearModal";

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
        if (!confirm("Are you sure you want to delete this year?")) return;

        try {
            const res = await fetch(`/api/academic-years/${id}`, { method: "DELETE" });
            if (res.ok) fetchYears();
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Academic Years</h1>
                    <p className="text-gray-500 text-sm">Manage calendars and terms for your institution.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingYear(null);
                        setIsModalOpen(true);
                    }}
                    className="btn-primary flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    <span>New Academic Year</span>
                </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search academic years..."
                        className="w-full bg-gray-50 border-none rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Year Title</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Start Date</th>
                                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">End Date</th>
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
                            ) : academicYears.length > 0 ? (
                                academicYears.map((year) => (
                                    <tr key={year.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <span className="font-bold text-gray-700">{year.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-gray-500">{new Date(year.startDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-5 text-sm text-gray-500">{new Date(year.endDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingYear(year);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-emerald-600 transition-all border border-transparent hover:border-gray-100"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(year.id)}
                                                    className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-red-500 transition-all border border-transparent hover:border-gray-100"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-400">
                                            <Calendar className="w-12 h-12 opacity-20" />
                                            <div>
                                                <p className="font-bold text-gray-600">No Academic Years Found</p>
                                                <p className="text-sm">Get started by creating your first academic calendar.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AcademicYearModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchYears}
                editingYear={editingYear}
            />
        </div>
    );
}
