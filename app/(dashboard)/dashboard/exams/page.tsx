"use client";

import { useState, useEffect } from "react";
import { Plus, FileText, ChevronRight, Book, GraduationCap, Loader2, Sparkles, Target } from "lucide-react";
import ExamModal from "@/components/ExamModal";

interface Exam {
    id: string;
    title: string;
    course: { title: string };
    class: { name: string };
    academicYear: { title: string };
    term: { title: string };
    _count?: { questions: number };
}

export default function ExamsPage() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    async function fetchExams() {
        try {
            const res = await fetch("/api/exams");
            const data = await res.json();
            setExams(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchExams();
    }, []);

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase tracking-tighter">Assessment Center</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-emerald-600 italic">Advanced cognitive evaluation nodes.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-slate-900 text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/10 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3"
                >
                    <Plus className="w-5 h-5" />
                    <span>Provision Examination</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    <div className="col-span-full py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-emerald-600" /></div>
                ) : exams.length > 0 ? (
                    exams.map((exam) => (
                        <div key={exam.id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group cursor-pointer relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-6">
                                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                                    Live Session
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                                    <FileText className="w-7 h-7" />
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">{exam.class.name} • {exam.term.title}</p>
                                    <h3 className="text-xl font-black text-gray-900 leading-tight uppercase group-hover:text-emerald-600 transition-colors">{exam.title}</h3>
                                    <p className="text-xs font-bold text-gray-400 flex items-center gap-1.5 pt-1">
                                        <Book className="w-3 h-3" />
                                        {exam.course.title}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-6">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-emerald-500" />
                                        <span className="text-[10px] font-black uppercase text-gray-400">Bloom's Ready</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-emerald-600 transition-all" />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-40 bg-gray-50/50 rounded-[4rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="bg-white p-10 rounded-full shadow-sm">
                            <FileText className="w-16 h-16 text-gray-100" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-gray-600 uppercase tracking-tight">No Active Assessments</h3>
                            <p className="text-sm text-gray-400 max-w-sm font-medium">Create your first examination and define questions based on different learning levels.</p>
                        </div>
                        <button className="btn-primary mt-4">Initialize Exam</button>
                    </div>
                )}
            </div>
            <ExamModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchExams}
            />
        </div>
    );
}
