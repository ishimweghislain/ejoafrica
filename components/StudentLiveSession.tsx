"use client";

import { useState, useEffect, useRef } from "react";
import {
    X, Radio, CheckCircle2, Loader2, Zap,
    Clock, Play, Trophy, AlertCircle, Send, RefreshCcw
} from "lucide-react";
import { toast } from "react-hot-toast";

interface StudentLiveSessionProps {
    assessment: any;
    onExit: () => void;
}

export default function StudentLiveSession({ assessment: initialAssessment, onExit }: StudentLiveSessionProps) {
    const [assessment, setAssessment] = useState(initialAssessment);
    const [myResponses, setMyResponses] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    const currentQuestion = assessment.questions[assessment.currentQuestionIndex];
    const hasAnsweredCurrent = myResponses.some(r => r.questionId === currentQuestion?.id);

    // Timer logic
    useEffect(() => {
        if (currentQuestion && currentQuestion.timer && !hasAnsweredCurrent && assessment.status === "LIVE") {
            setTimeLeft(currentQuestion.timer);
        } else {
            setTimeLeft(null);
        }
    }, [assessment.currentQuestionIndex, hasAnsweredCurrent, assessment.status]);

    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0 || hasAnsweredCurrent) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev !== null && prev <= 1) {
                    clearInterval(timer);
                    autoSubmit();
                    return 0;
                }
                return prev !== null ? prev - 1 : null;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, hasAnsweredCurrent]);

    const autoSubmit = () => {
        if (!hasAnsweredCurrent) {
            submitAnswer(selectedAnswer || "NO_ANSWER_PROVIDED");
        }
    };

    const fetchStatus = async () => {
        try {
            const [aRes, rRes] = await Promise.all([
                fetch(`/api/live-assessments/${assessment.id}`),
                fetch(`/api/live-assessments/${assessment.id}/responses`)
            ]);
            const aData = await aRes.json();
            const rData = await rRes.json();

            if (aData.status === "COMPLETED") {
                setAssessment(aData);
                setMyResponses(rData);
                return;
            }

            if (aData.currentQuestionIndex !== assessment.currentQuestionIndex) {
                setSelectedAnswer(null);
            }

            setAssessment(aData);
            setMyResponses(rData);
        } catch (err) {
            console.error("Polling error");
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            fetchStatus();
        }, 3000);
        return () => clearInterval(interval);
    }, [assessment.id, assessment.currentQuestionIndex]);

    const violationsRef = useRef(0);
    const toastIdRef = useRef<string | null>(null);

    const submitAnswer = async (ansOverride?: string, cheating: boolean = false) => {
        const answerToSubmit = ansOverride || selectedAnswer;
        if ((!answerToSubmit && !cheating) || submitting) return;
        setSubmitting(true);

        if (toastIdRef.current) toast.dismiss(toastIdRef.current);

        try {
            const res = await fetch(`/api/live-assessments/${assessment.id}/responses`, {
                method: "POST",
                body: JSON.stringify({
                    questionId: currentQuestion.id,
                    answer: answerToSubmit || "CHEATED_AUTO_SUBMIT",
                    cheatingAttempt: cheating
                })
            });
            if (res.ok) {
                if (cheating) {
                    toast.error("UMENYAWE! Ibisubizo byawe byiromete kubera kuriganya.", { duration: 10000 });
                } else {
                    toast.success("Answer sent!");
                }
                fetchStatus();
            }
        } catch (err) {
            console.error("Live submit error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    // Cheating detection
    useEffect(() => {
        if (assessment.status !== "LIVE" || !currentQuestion || hasAnsweredCurrent) return;

        const handleViolation = () => {
            if (hasAnsweredCurrent) return;
            violationsRef.current += 1;

            if (violationsRef.current === 1) {
                if (toastIdRef.current) toast.dismiss(toastIdRef.current);
                toastIdRef.current = toast("Niwongera birahita byirometa directe aho ugeze attention petit fre. NTUBAKE vubaha!", {
                    icon: '🚫',
                    duration: Infinity,
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
                submitAnswer(selectedAnswer || "CHEATED_AUTO_SUBMIT", true);
            }
        };

        const handleVisibility = () => {
            if (document.visibilityState === 'hidden') handleViolation();
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
    }, [assessment.status, currentQuestion?.id, hasAnsweredCurrent, selectedAnswer]);

    if (assessment.status === "COMPLETED") {
        const totalScore = myResponses.reduce((acc, r) => acc + r.marksObtained, 0);
        const maxScore = assessment.questions.reduce((acc: number, q: any) => acc + q.marks, 0);
        const correctOnes = myResponses.filter(r => r.isCorrect).length;

        return (
            <div className="fixed inset-0 z-[70] bg-slate-900 flex items-center justify-center p-8 animate-in fade-in zoom-in">
                <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 text-center space-y-10 shadow-2xl">
                    <div className="space-y-4">
                        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                            <Trophy className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Live Session Ended!</h1>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-relaxed">Here's your final results tally.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center gap-2">
                            <p className="text-[9px] font-black uppercase text-slate-400">Total Points</p>
                            <p className="text-3xl font-black text-rose-600 italic tracking-tighter">{totalScore}<span className="text-sm italic text-slate-300 ml-1">/{maxScore}</span></p>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center gap-2">
                            <p className="text-[9px] font-black uppercase text-slate-400">Correct</p>
                            <p className="text-3xl font-black text-emerald-600 italic tracking-tighter">{correctOnes}<span className="text-sm italic text-slate-300 ml-1">/{assessment.questions.length}</span></p>
                        </div>
                    </div>

                    <button
                        onClick={onExit}
                        className="w-full bg-slate-900 text-white p-5 rounded-xl font-black uppercase tracking-[0.2em] italic hover:bg-rose-600 transition-all shadow-xl"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[70] bg-slate-50 flex flex-col animate-in fade-in duration-500 overflow-hidden">
            {/* Header */}
            <header className="px-8 py-5 flex items-center justify-between border-b border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 italic uppercase tracking-tighter line-clamp-1">{assessment.title}</h2>
                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em] leading-none mt-1">{assessment.course.title} • {assessment.teacher.firstName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    {assessment.deadline && (
                        <div className="hidden md:flex flex-col items-end">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Due Date</p>
                            <span className="text-[10px] font-black uppercase text-rose-500 tabular-nums">
                                {new Date(assessment.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(assessment.deadline).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => fetchStatus()}
                        className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-100"
                    >
                        <RefreshCcw className={`w-4 h-4 ${submitting ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </header>

            {/* Main Area: 3 Panel Layout */}
            <main className="flex-grow flex flex-col lg:flex-row overflow-hidden">
                {assessment.currentQuestionIndex === -1 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center space-y-8 animate-pulse bg-white">
                        <Clock className="w-20 h-20 text-rose-200" />
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 font-medium">Waiting for Start...</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">The teacher hasn't released the first question.</p>
                        </div>
                    </div>
                ) : hasAnsweredCurrent ? (
                    <div className="w-full h-full flex items-center justify-center bg-white p-8">
                        <div className="text-center space-y-8 max-w-lg w-full">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Response Locked</h3>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Great job. Stand by for the next question.</p>
                            </div>
                            <div className="flex justify-center">
                                <button onClick={() => fetchStatus()} className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest italic hover:bg-emerald-600 transition-all flex items-center gap-3">
                                    <RefreshCcw className="w-3.5 h-3.5" /> Refresh Status
                                </button>
                            </div>
                        </div>
                    </div>
                ) : currentQuestion ? (
                    <>
                        {/* Panel 1: Left - Question */}
                        <div className="w-full lg:w-1/3 p-10 bg-white border-r border-slate-100 overflow-y-auto space-y-8">
                            <div className="inline-flex items-center gap-3 bg-rose-50 text-rose-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic border border-rose-100 shadow-sm">
                                Question {assessment.currentQuestionIndex + 1}
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-[1.3] uppercase italic tracking-tighter">
                                {currentQuestion.text}
                            </h1>
                            <div className="pt-8 border-t border-slate-50">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">Teacher Instructions</p>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed italic opacity-60">"Select the best answer from the options provided. Good luck!"</p>
                            </div>
                        </div>

                        {/* Panel 2: Middle - Answers */}
                        <div className="w-full lg:w-1/3 p-10 overflow-y-auto bg-slate-50/30">
                            <div className="grid grid-cols-1 gap-4">
                                {currentQuestion.options.map((opt: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedAnswer(opt)}
                                        className={`p-6 rounded-2xl border-2 text-left transition-all group ${selectedAnswer === opt
                                            ? 'bg-white border-rose-600 shadow-xl scale-[1.02]'
                                            : 'bg-white border-white text-slate-600 hover:border-rose-100 shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${selectedAnswer === opt ? 'text-rose-600' : 'text-slate-300'}`}>Option {String.fromCharCode(65 + idx)}</span>
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selectedAnswer === opt ? 'bg-rose-600 border-rose-600 rotate-45' : 'border-slate-100'}`}>
                                                {selectedAnswer === opt && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                                            </div>
                                        </div>
                                        <p className={`text-lg font-black italic uppercase leading-snug ${selectedAnswer === opt ? 'text-slate-900' : 'text-slate-700'}`}>{opt}</p>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8">
                                <button
                                    disabled={!selectedAnswer || submitting}
                                    onClick={() => submitAnswer()}
                                    className={`w-full p-6 rounded-xl flex items-center justify-between group transition-all shadow-xl ${selectedAnswer
                                        ? 'bg-slate-900 text-white hover:bg-emerald-600'
                                        : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                                        }`}
                                >
                                    <span className="text-sm font-black uppercase tracking-[0.3em] ml-2 italic">Confirm Choice</span>
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />}
                                </button>
                            </div>
                        </div>

                        {/* Panel 3: Right - Timer/Stats */}
                        <div className="w-full lg:w-1/3 p-10 bg-white border-l border-slate-100 flex flex-col items-center justify-center space-y-10">
                            <div className="text-center space-y-4">
                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.4em] italic">Timer</p>
                                <div className={`text-7xl md:text-8xl font-black italic tracking-tighter tabular-nums transition-all ${timeLeft !== null && timeLeft <= 5 ? 'text-rose-600 animate-ping' : 'text-slate-900'}`}>
                                    {timeLeft !== null ? timeLeft : "--"}
                                </div>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic animate-pulse">Seconds Remaining</p>
                            </div>

                            <div className="w-full space-y-4">
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                                    <p className="text-xs font-black text-slate-900 uppercase italic">Online</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-white">
                        <AlertCircle className="w-16 h-16 opacity-20 mb-4" />
                        <p className="font-black uppercase tracking-widest text-[10px]">Loading Data...</p>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="px-8 py-6 bg-white border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-8 h-8 rounded-xl bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-black text-slate-400 uppercase italic shadow-sm">
                                S
                            </div>
                        ))}
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">In class with other students</p>
                </div>
                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Live Score</p>
                        <p className="text-2xl font-black text-slate-900 italic tracking-tighter">
                            {myResponses.reduce((acc, r) => acc + r.marksObtained, 0)} <span className="text-[10px] opacity-40 ml-1">PTS</span>
                        </p>
                    </div>
                    <button onClick={onExit} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </footer>
        </div>
    );
}
