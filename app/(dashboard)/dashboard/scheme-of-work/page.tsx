"use client";

import { useState, useEffect } from "react";
import { Plus, FileSpreadsheet, ChevronRight, Book, Calendar, Loader2 } from "lucide-react";

interface Scheme {
    id: string;
    course: { title: string };
    class: { name: string };
    academicYear: { title: string };
    term: { title: string };
    periodsPerWeek: number;
    _count: { lessons: number };
}

export default function SchemeOfWorkPage() {
    const [schemes, setSchemes] = useState<Scheme[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchSchemes() {
        try {
            const res = await fetch("/api/schemes-of-work");
            const data = await res.json();
            setSchemes(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSchemes();
    }, []);

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Schemes of Work</h1>
                    <p className="text-gray-500 text-sm">Quarterly pedagogical programming and coverage.</p>
                </div>
                <button className="btn-primary flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" />
                    <span>New Scheme</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-emerald-600" /></div>
                ) : schemes.length > 0 ? (
                    schemes.map((scheme) => (
                        <div key={scheme.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer flex gap-8 items-start">
                            <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm">
                                <FileSpreadsheet className="w-8 h-8" />
                            </div>

                            <div className="flex-grow space-y-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">{scheme.class.name} • {scheme.term.title}</span>
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors uppercase">{scheme.course.title}</h3>
                                </div>

                                <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                        <Book className="w-4 h-4" />
                                        <span>{scheme._count.lessons} Lessons Planed</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        <span>{scheme.academicYear.title}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="self-center">
                                <ChevronRight className="w-6 h-6 text-gray-200 group-hover:text-emerald-600 transition-all" />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-32 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center space-y-4">
                        <FileSpreadsheet className="w-12 h-12 text-gray-200" />
                        <div className="space-y-1">
                            <p className="font-bold text-gray-600">No Professional Programming</p>
                            <p className="text-sm text-gray-400">Teachers must upload their schemes of work for the active term.</p>
                        </div>
                        <button className="btn-primary mt-4">Draft New Scheme</button>
                    </div>
                )}
            </div>
        </div>
    );
}
