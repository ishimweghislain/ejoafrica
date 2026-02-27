"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
    const [violations, setViolations] = useState(0);

    const questions = assignment?.questions || [];
    const currentQuestion = questions[currentQuestionIdx];

    const violationsRef = useRef(0);
    const toastIdRef = useRef<string | null>(null);

    const finishAssignment = async (cheating: boolean = false) => {
        if (isFinished) return;
        setIsFinished(true); // Immediate state change to stop listeners
        setLoading(true);

        if (toastIdRef.current) toast.dismiss(toastIdRef.current);

        try {
            const res = await fetch("/api/assignments/submissions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assignmentId: assignment.id,
                    answers,
                    cheatingAttempt: cheating
                })
            });
            const data = await res.json();
            if (res.ok) {
                setResult(data);
                if (cheating) {
                    toast.error("UMENYAWE! Ibisubizo byawe byiromete kubera kuriganya.", { duration: 10000 });
                } else {
                    toast.success("Assignment submitted successfully.");
                }
            }
        } catch (err) {
            console.error("Submission failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const nextQuestion = useCallback(() => {
        if (currentQuestionIdx < questions.length - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
            setTimeLeft(questions[currentQuestionIdx + 1]?.timer || 60);
        } else {
            finishAssignment();
        }
    }, [currentQuestionIdx, questions, answers, isFinished]);

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

    // Cheating detection
    useEffect(() => {
        if (!isStarted || isFinished) return;

        const handleViolation = () => {
            if (isFinished) return;
            violationsRef.current += 1;

            if (violationsRef.current === 1) {
                // Show a persistent warning
                if (toastIdRef.current) toast.dismiss(toastIdRef.current);
                toastIdRef.current = toast("Niwongera birahita byirometa directe aho ugeze attention petit fre. NTUBAKE vubaha!", {
                    icon: '🚫',
                    duration: Infinity, // Stay until dismissed or auto-submitted
                    style: {
                        background: '#991b1b',
                        color: '#ffffff',
                        border: '2px solid #f87171',
                        fontWeight: '900',
                        fontSize: '14px',
                        padding: '20px'
                    }
                });
            } else if (violationsRef.current >= 2) {
                finishAssignment(true);
            }
        };

        const handleVisibility = () => {
            if (document.visibilityState === 'hidden') {
                handleViolation();
            }
        };

        const handleBlur = () => {
            handleViolation();
        };

        document.addEventListener('visibilitychange', handleVisibility);
        window.addEventListener('blur', handleBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
            window.removeEventListener('blur', handleBlur);
            if (toastIdRef.current) toast.dismiss(toastIdRef.current);
        };
    }, [isStarted, isFinished, answers, assignment.id]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl" />

            <div className="relative bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fade-up">
                {!isStarted ? (
                    <div className="p-8 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 shadow-sm">
                            <ClipboardList className="w-10 h-10" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">{assignment.title}</h3>
                            <p className="text-slate-500 font-bold text-xs max-w-md mx-auto">{assignment.description || 'No special instructions given.'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center gap-1">
                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Questions</span>
                                <span className="text-xl font-black text-slate-900">{questions.length}</span>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col items-center gap-1">
                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Points</span>
                                <span className="text-xl font-black text-slate-900">{questions.reduce((acc: number, q: any) => acc + q.marks, 0)}</span>
                            </div>
                        </div>
                        <div className="flex bg-orange-50 p-4 rounded-2xl border border-orange-100 items-center gap-3 text-orange-700 max-w-md">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="text-[9px] font-black uppercase tracking-widest leading-tight">Wait! Once you start, you cannot pause the timer.</p>
                        </div>
                        <button
                            onClick={startAssignment}
                            className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all flex items-center gap-3 shadow-xl"
                        >
                            <Play className="w-4 h-4 fill-current" />
                            <span>Start Now</span>
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
                                <span>{currentQuestionIdx === questions.length - 1 ? "Submit Assignment" : "Next Question"}</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="p-16 flex flex-col items-center justify-center text-center space-y-10">
                        {loading ? (
                            <div className="flex flex-col items-center gap-6">
                                <Loader2 className="w-16 h-16 animate-spin text-emerald-600" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Sending your answers...</p>
                            </div>
                        ) : (
                            <>
                                <div className="w-32 h-32 bg-emerald-500 text-white rounded-[3rem] flex items-center justify-center shadow-2xl animate-bounce">
                                    <Award className="w-16 h-16" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">Finished!</h3>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Your answers were saved safely</p>
                                </div>

                                <div className="p-10 bg-slate-900 rounded-[3rem] text-white w-full max-w-sm space-y-2 shadow-2xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Score Achieved</p>
                                    <p className="text-6xl font-black text-emerald-400 italic">{result?.score}<span className="text-2xl text-slate-600"> / {questions.reduce((acc: number, q: any) => acc + q.marks, 0)}</span></p>
                                </div>

                                <button
                                    onClick={() => { onComplete(); onClose(); }}
                                    className="bg-slate-50 text-slate-900 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 hover:text-white transition-all border border-slate-100 shadow-sm"
                                >
                                    Go Back to Assignments
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
