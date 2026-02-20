"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, CheckCircle2, XCircle, Info } from "lucide-react";

interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: string;
    marks: number;
}

interface Response {
    questionId: string;
    answer: string;
    isCorrect: boolean;
}

interface ViewQuestionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    questions: Question[];
    responses?: Response[]; // Optional: if provided, show student answers
    showCorrectAnswers: boolean;
}

export default function ViewQuestionsModal({
    isOpen,
    onClose,
    title,
    questions,
    responses,
    showCorrectAnswers
}: ViewQuestionsModalProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            {/* Light Overlay */}
            <div
                className="absolute inset-0 bg-slate-900/20 backdrop-blur-md animate-in fade-in duration-500"
                onClick={onClose}
            />

            <div className="relative bg-white w-full max-w-2xl max-h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">{title}</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Reviewing questions and performance.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-white text-slate-400 hover:text-rose-600 rounded-2xl border border-slate-100 transition-all shadow-sm active:scale-90"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {questions.map((q, idx) => {
                        const studentResponse = responses?.find(r => r.questionId === q.id);

                        return (
                            <div key={q.id} className="space-y-4 p-6 rounded-[1.5rem] bg-slate-50/50 border border-slate-100 relative group">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex-shrink-0 flex items-center justify-center font-black text-sm italic shadow-lg">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-grow space-y-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <h3 className="text-lg font-black text-slate-900 leading-tight uppercase italic">{q.text}</h3>
                                            <span className="bg-white px-4 py-1.5 rounded-xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest flex-shrink-0">
                                                {q.marks} PTS
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {q.options.map((opt, oIdx) => {
                                                const isCorrect = opt === q.correctAnswer;
                                                const isStudentChoice = opt === studentResponse?.answer;

                                                let stateStyles = "bg-white border-slate-100 text-slate-600";
                                                if (showCorrectAnswers && isCorrect) {
                                                    stateStyles = "bg-emerald-50 border-emerald-200 text-emerald-700 ring-2 ring-emerald-500/20";
                                                }
                                                if (isStudentChoice) {
                                                    if (showCorrectAnswers) {
                                                        stateStyles = isCorrect
                                                            ? "bg-emerald-50 border-emerald-500 text-emerald-700 ring-4 ring-emerald-500/10"
                                                            : "bg-rose-50 border-rose-500 text-rose-700 ring-4 ring-rose-500/10";
                                                    } else {
                                                        stateStyles = "bg-slate-900 border-slate-900 text-white shadow-xl";
                                                    }
                                                }

                                                return (
                                                    <div
                                                        key={oIdx}
                                                        className={`p-5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between ${stateStyles}`}
                                                    >
                                                        <span>{opt}</span>
                                                        <div className="flex items-center gap-2">
                                                            {isStudentChoice && (
                                                                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-black/5">Your Choice</span>
                                                            )}
                                                            {showCorrectAnswers && isCorrect && <CheckCircle2 className="w-4 h-4" />}
                                                            {showCorrectAnswers && isStudentChoice && !isCorrect && <XCircle className="w-4 h-4" />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {showCorrectAnswers && (
                                            <div className="pt-4 border-t border-slate-200/50 flex items-center gap-3">
                                                <Info className="w-4 h-4 text-emerald-600" />
                                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">
                                                    Correct Answer: <span className="text-slate-900 underline underline-offset-4 decoration-emerald-200">{q.correctAnswer}</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {responses && (
                            <>
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Correct</p>
                                    <p className="text-xl font-black text-emerald-600 italic leading-none">{responses.filter(r => r.isCorrect).length} / {questions.length}</p>
                                </div>
                                <div className="w-px h-8 bg-slate-200"></div>
                                <div>
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Score</p>
                                    <p className="text-xl font-black text-slate-900 italic leading-none">
                                        {responses.reduce((acc, r) => acc + (r.isCorrect ? questions.find((q: any) => q.id === r.questionId)?.marks || 0 : 0), 0)} PTS
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-emerald-600 transition-all transition-transform active:scale-95 italic"
                    >
                        Close View
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
