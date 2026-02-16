"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Clock, Play, CheckCircle2, Loader2, AlertCircle, ChevronRight, Award, ClipboardList } from "lucide-react";
import { toast } from "react-hot-toast";

interface TakeAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    assignment: any;
    onComplete: () => void;
}

export default function TakeAssignmentModal({ isOpen, onClose, assignment, onComplete }: TakeAssignmentModalProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState<{ questionId: string, answer: string }[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isStarted, setIsStarted] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const questions = assignment?.questions || [];
    const currentQuestion = questions[currentQuestionIdx];

    const nextQuestion = useCallback(() => {
        if (currentQuestionIdx < questions.length - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
            setTimeLeft(questions[currentQuestionIdx + 1]?.timer || 60);
        } else {
            finishAssignment();
        }
    }, [currentQuestionIdx, questions]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isStarted && !isFinished && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (isStarted && !isFinished && timeLeft === 0) {
            nextQuestion();
        }
        return () => clearInterval(timer);
    }, [isStarted, isFinished, timeLeft, nextQuestion]);

    const startAssignment = () => {
        setIsStarted(true);
        setTimeLeft(questions[0]?.timer || 60);
    };

    const handleAnswer = (answer: string) => {
        const newAnswers = [...answers];
        const existingIdx = newAnswers.findIndex(a => a.questionId === currentQuestion.id);
        if (existingIdx > -1) {
            newAnswers[existingIdx].answer = answer;
        } else {
            newAnswers.push({ questionId: currentQuestion.id, answer });
        }
        setAnswers(newAnswers);
    };

    const finishAssignment = async () => {
        setIsFinished(true);
        setLoading(true);
        try {
            const res = await fetch("/api/assignments/submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assignmentId: assignment.id,
                    answers
                })
            });
            const data = await res.json();
            if (res.ok) {
                setResult(data);
                toast.success("Assignment transmitted successfully.");
            } else {
                toast.error(data.error);
            }
        } catch (err) {
            toast.error("Telemetry failure.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" />

            <div className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fade-up">
                {!isStarted ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center space-y-8">
                        <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center text-emerald-600 shadow-inner">
                            <ClipboardList className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">{assignment.title}</h3>
                            <p className="text-slate-500 font-bold text-sm max-w-lg mx-auto">{assignment.description || 'No specialized instructions provided.'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-2">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Question Count</span>
                                <span className="text-2xl font-black text-slate-900">{questions.length}</span>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-2">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Weight</span>
                                <span className="text-2xl font-black text-slate-900">{questions.reduce((acc: number, q: any) => acc + q.marks, 0)} Pts</span>
                            </div>
                        </div>
                        <div className="flex bg-orange-50 p-4 rounded-3xl border border-orange-100 items-center gap-4 text-orange-700">
                            <AlertCircle className="w-6 h-6 shrink-0" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Caution: Timed modules active. Once started, the timer cannot be paused.</p>
                        </div>
                        <button
                            onClick={startAssignment}
                            className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-600 transition-all flex items-center gap-3 shadow-2xl shadow-slate-200"
                        >
                            <Play className="w-5 h-5 fill-current" />
                            <span>Initiatize Assessment</span>
                        </button>
                    </div>
                ) : !isFinished ? (
                    <>
                        {/* Header */}
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-5">
                                <div className="bg-slate-900 p-3 rounded-2xl text-white">
                                    <span className="font-black text-sm italic">{currentQuestionIdx + 1}</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Question {currentQuestionIdx + 1} of {questions.length}</h3>
                                    <div className="h-1.5 w-48 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 transition-all duration-500"
                                            style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={`flex items-center gap-4 px-6 py-3 rounded-2xl border transition-all ${timeLeft < 10 ? 'bg-red-50 border-red-100 text-red-500 animate-pulse' : 'bg-slate-50 border-slate-100 text-slate-900'}`}>
                                <Clock className="w-5 h-5" />
                                <span className="text-xl font-black italic">{timeLeft}s</span>
                            </div>
                        </div>

                        {/* Question */}
                        <div className="flex-grow p-12 overflow-y-auto">
                            <div className="space-y-10">
                                <h4 className="text-2xl font-black text-slate-900 uppercase leading-tight tracking-tighter italic">
                                    {currentQuestion.text}
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentQuestion.options.map((opt: string, i: number) => {
                                        const isSelected = answers.find(a => a.questionId === currentQuestion.id)?.answer === opt;
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => handleAnswer(opt)}
                                                className={`p-6 rounded-[2rem] text-left border-2 transition-all flex items-center gap-6 group ${isSelected
                                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xl'
                                                    : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-200 hover:bg-white'}`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${isSelected ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 group-hover:bg-slate-900 group-hover:text-white'}`}>
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                                <span className="font-bold text-sm uppercase tracking-wide">{opt}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex justify-end">
                            <button
                                onClick={nextQuestion}
                                className="bg-slate-900 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 hover:bg-emerald-600 transition-all shadow-xl"
                            >
                                <span>{currentQuestionIdx === questions.length - 1 ? "Finalize Submisson" : "Proceed to Next"}</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="p-16 flex flex-col items-center justify-center text-center space-y-10">
                        {loading ? (
                            <div className="flex flex-col items-center gap-6">
                                <Loader2 className="w-16 h-16 animate-spin text-emerald-600" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Processing Telemetry Data...</p>
                            </div>
                        ) : (
                            <>
                                <div className="w-32 h-32 bg-emerald-500 text-white rounded-[3rem] flex items-center justify-center shadow-2xl animate-bounce">
                                    <Award className="w-16 h-16" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Evaluation Complete</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Transmission Secured & Verified</p>
                                </div>

                                <div className="p-10 bg-slate-900 rounded-[3rem] text-white w-full max-w-sm space-y-2 shadow-2xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Score Achieved</p>
                                    <p className="text-6xl font-black text-emerald-400 italic">{result?.score}<span className="text-2xl text-slate-600"> / {questions.reduce((acc: number, q: any) => acc + q.marks, 0)}</span></p>
                                </div>

                                <button
                                    onClick={() => { onComplete(); onClose(); }}
                                    className="bg-slate-50 text-slate-900 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 hover:text-white transition-all border border-slate-100 shadow-sm"
                                >
                                    Return to Command Center
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
