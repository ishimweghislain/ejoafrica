"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, User, CheckCircle2, Eye, Search, TrendingUp, Trophy } from "lucide-react";
import ViewQuestionsModal from "./ViewQuestionsModal";

interface StudentAnalyticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    assessment: any;
    type: "ASSESSMENT" | "ASSIGNMENT";
}

export default function StudentAnalyticsModal({
    isOpen,
    onClose,
    assessment,
    type
}: StudentAnalyticsModalProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStudentAnswers, setSelectedStudentAnswers] = useState<any>(null);

    if (!isOpen || !mounted) return null;

    // Normalize responses/submissions to a common format
    const results = (type === "ASSESSMENT" ? assessment.responses : assessment.submissions).map((r: any) => {
        const student = r.student;
        if (type === "ASSESSMENT") {
            // LiveAssessment responses are multiple records per student
            return {
                studentId: r.studentId,
                studentName: `${student.firstName} ${student.lastName}`,
                email: student.email,
                score: assessment.responses.filter((resp: any) => resp.studentId === r.studentId).reduce((acc: number, cur: any) => acc + cur.marksObtained, 0),
                totalQuestions: assessment.questions.length,
                correctCount: assessment.responses.filter((resp: any) => resp.studentId === r.studentId && resp.isCorrect).length,
                answers: assessment.responses.filter((resp: any) => resp.studentId === r.studentId).map((resp: any) => ({
                    questionId: resp.questionId,
                    answer: resp.answer,
                    isCorrect: resp.isCorrect
                }))
            };
        } else {
            // Assignment submissions are one record per student
            return {
                studentId: r.studentId,
                studentName: `${student.firstName} ${student.lastName}`,
                email: student.email,
                score: r.score,
                totalQuestions: assessment.questions.length,
                answers: assessment.questions.flatMap((q: any) =>
                    q.answers.filter((ans: any) => ans.studentId === r.studentId).map((ans: any) => ({
                        questionId: q.id,
                        answer: ans.answer,
                        isCorrect: ans.isCorrect
                    }))
                )
            };
        }
    });

    // Handle the fact that for LiveAssessments, the results map will have duplicates (one per question-response)
    const uniqueResults = type === "ASSESSMENT"
        ? Array.from(new Map(results.map((item: any) => [item.studentId, item])).values())
        : results;

    const filteredResults = uniqueResults.filter((r: any) =>
        r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const averageScore = uniqueResults.length > 0
        ? uniqueResults.reduce((acc: number, cur: any) => acc + cur.score, 0) / uniqueResults.length
        : 0;

    return createPortal(
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
                {/* Lighter Overlay */}
                <div
                    className="absolute inset-0 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-500"
                    onClick={onClose}
                />

                <div className="relative bg-white w-full max-w-4xl max-h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500">
                    {/* Header */}
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-xl">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">{assessment.title}</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Class-wide performance and individual student analytics.</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-4 bg-white text-slate-400 hover:text-rose-600 rounded-2xl border border-slate-100 transition-all shadow-sm active:scale-95"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Meta Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-white">
                        <div className="bg-slate-50 p-6 rounded-[2rem] flex items-center gap-5 border border-slate-100">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm"><Trophy className="w-6 h-6" /></div>
                            <div>
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Average Score</p>
                                <p className="text-2xl font-black text-slate-900 italic">{Math.round(averageScore)} PTS</p>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-[2rem] flex items-center gap-5 border border-slate-100">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><User className="w-6 h-6" /></div>
                            <div>
                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Students Participated</p>
                                <p className="text-2xl font-black text-slate-900 italic">{uniqueResults.length}</p>
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <input
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-full bg-slate-50 border border-slate-100 rounded-[2rem] pl-16 pr-8 text-xs font-black outline-none focus:bg-white focus:ring-8 focus:ring-emerald-500/5 transition-all text-slate-900"
                            />
                        </div>
                    </div>

                    {/* Students List */}
                    <div className="flex-grow overflow-y-auto p-6 pt-0 custom-scrollbar">
                        <table className="w-full border-separate border-spacing-y-4">
                            <thead>
                                <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-left">
                                    <th className="px-6 pb-2">Student Information</th>
                                    <th className="px-6 pb-2">Performance</th>
                                    <th className="px-6 pb-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredResults.map((r: any) => (
                                    <tr key={r.studentId} className="group transition-all">
                                        <td className="bg-slate-50 group-hover:bg-white border-y border-l border-slate-100 rounded-l-[1.5rem] px-6 py-6 transition-all group-hover:shadow-lg group-hover:shadow-slate-200/50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-sm uppercase italic text-slate-400 border border-slate-100 shadow-sm">
                                                    {r.studentName[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 uppercase italic tracking-tighter">{r.studentName}</p>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{r.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="bg-slate-50 group-hover:bg-white border-y border-slate-100 px-6 py-6 transition-all group-hover:shadow-lg group-hover:shadow-slate-200/50">
                                            <div className="flex items-center gap-6">
                                                <div>
                                                    <p className="text-[10px] font-black text-emerald-600 italic tracking-tighter">{r.score} PTS</p>
                                                    <div className="w-32 h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-500 rounded-full"
                                                            style={{ width: `${(r.score / (assessment.questions.reduce((sum: number, q: any) => sum + q.marks, 0) || 1)) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                                {r.correctCount !== undefined && (
                                                    <div className="flex flex-col items-center">
                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Accuracy</p>
                                                        <p className="text-xs font-black text-slate-900 italic">{r.correctCount} / {r.totalQuestions}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="bg-slate-50 group-hover:bg-white border-y border-r border-slate-100 rounded-r-[1.5rem] px-6 py-6 text-right transition-all group-hover:shadow-lg group-hover:shadow-slate-200/50">
                                            <button
                                                onClick={() => setSelectedStudentAnswers(r)}
                                                className="bg-white group-hover:bg-slate-900 text-slate-900 group-hover:text-white px-6 py-3 rounded-xl border border-slate-100 group-hover:border-slate-900 text-[9px] font-black uppercase tracking-widest transition-all inline-flex items-center gap-2 italic shadow-sm"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                View Answers
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="p-8 border-t border-slate-100 bg-white flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-relaxed">System syncing student response data in real-time.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-emerald-600 transition-all transition-transform active:scale-95 italic"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>

            {/* Individual Student Answers Detail */}
            {selectedStudentAnswers && (
                <ViewQuestionsModal
                    isOpen={true}
                    onClose={() => setSelectedStudentAnswers(null)}
                    title={`Results: ${selectedStudentAnswers.studentName}`}
                    questions={assessment.questions}
                    responses={selectedStudentAnswers.answers}
                    showCorrectAnswers={true}
                />
            )}
        </>,
        document.body
    );
}
