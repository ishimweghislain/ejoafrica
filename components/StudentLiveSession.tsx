"use client";

import { useState, useEffect } from "react";
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

            // Reset selected answer if question changed
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

    const submitAnswer = async (ansOverride?: string) => {
        const answerToSubmit = ansOverride || selectedAnswer;
        if (!answerToSubmit || submitting) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/live-assessments/${assessment.id}/responses`, {
                method: "POST",
                body: JSON.stringify({
                    questionId: currentQuestion.id,
                    answer: answerToSubmit
                })
            });
            if (res.ok) {
                toast.success("Answer sent!");
                fetchStatus();
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to submit");
            }
        } catch (err) {
            toast.error("Network error");
        } finally {
            setSubmitting(false);
        }
    };

    if (assessment.status === "COMPLETED") {
        const totalScore = myResponses.reduce((acc, r) => acc + r.marksObtained, 0);
        const maxScore = assessment.questions.reduce((acc: number, q: any) => acc + q.marks, 0);
        const correctOnes = myResponses.filter(r => r.isCorrect).length;

        return (
            <div className="fixed inset-0 z-[70] bg-slate-900 flex items-center justify-center p-8 animate-in fade-in zoom-in">
                <div className="bg-white w-full max-w-2xl rounded-[4rem] p-12 text-center space-y-12 shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-500 via-rose-600 to-rose-700"></div>

                    <div className="space-y-4">
                        <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-xl">
                            <Trophy className="w-12 h-12" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Live Session Ended!</h1>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-relaxed">You've completed the assessment. Here's your final tally.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center gap-3">
                            <p className="text-[10px] font-black uppercase text-slate-400">Total Points</p>
                            <p className="text-5xl font-black text-rose-600 italic tracking-tighter">{totalScore}<span className="text-sm italic text-slate-300 ml-1">/{maxScore}</span></p>
                        </div>
                        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col items-center gap-3">
                            <p className="text-[10px] font-black uppercase text-slate-400">Correct Answers</p>
                            <p className="text-5xl font-black text-emerald-600 italic tracking-tighter">{correctOnes}<span className="text-sm italic text-slate-300 ml-1">/{assessment.questions.length}</span></p>
                        </div>
                    </div>

                    <button
                        onClick={onExit}
                        className="w-full bg-slate-900 text-white p-6 rounded-[2rem] font-black uppercase tracking-[0.3em] italic hover:bg-rose-600 transition-all shadow-xl shadow-slate-200"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[70] bg-slate-50 flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-500 overflow-hidden">
            {/* Header */}
            <header className="p-6 md:p-8 flex items-center justify-between border-b border-slate-200 bg-white">
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-200">
                        <Radio className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-base md:text-lg font-black text-slate-900 italic uppercase tracking-tighter line-clamp-1">{assessment.title}</h2>
                        <p className="text-[7.5px] font-black uppercase text-slate-400 tracking-widest leading-none mt-0.5">{assessment.course.title} • Teacher {assessment.teacher.firstName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchStatus()}
                        className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-100"
                        title="Refresh Status"
                    >
                        <RefreshCcw className={`w-3.5 h-3.5 ${submitting ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="hidden sm:flex bg-slate-900 text-white px-5 py-2.5 rounded-2xl border border-slate-800 items-center gap-3 font-black text-[9px] uppercase italic shadow-lg shadow-slate-200">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        LIVE SESSION
                    </div>
                </div>
            </header>

            {/* Main Area */}
            <main className="flex-grow p-4 md:p-8 flex flex-col items-center justify-center max-w-4xl mx-auto w-full overflow-y-auto custom-scrollbar">
                {assessment.currentQuestionIndex === -1 ? (
                    <div className="text-center space-y-8 animate-bounce py-10">
                        <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-[3.5rem] border border-slate-100 flex items-center justify-center mx-auto shadow-2xl">
                            <Clock className="w-12 h-12 md:w-20 md:h-20 text-rose-500" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-slate-900">Waiting for Launch...</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Your teacher hasn't released the first question yet.</p>
                        </div>
                    </div>
                ) : hasAnsweredCurrent ? (
                    <div className="text-center space-y-12 w-full max-w-2xl px-4">
                        <div className="bg-white p-8 md:p-12 rounded-[3.5rem] text-center space-y-8 shadow-2xl border border-slate-50">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg animate-in zoom-in">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl md:text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Response Locked!</h3>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-relaxed">Great job. Waiting for your teacher to pass the next question...</p>
                            </div>
                            <div className="pt-8 border-t border-slate-50 flex items-center justify-center gap-6">
                                <button
                                    onClick={() => fetchStatus()}
                                    className="px-6 py-2.5 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-slate-100 flex items-center gap-2 text-[9px] font-black uppercase italic"
                                >
                                    <RefreshCcw className="w-3.5 h-3.5" />
                                    Check for Next
                                </button>
                                <div className="text-[10px] font-black text-slate-300 uppercase italic flex items-center gap-2">
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Auto Polling...
                                </div>
                            </div>
                        </div>
                    </div>
                ) : currentQuestion ? (
                    <div className="w-full space-y-6 md:space-y-10 animate-in zoom-in duration-300 pb-10">
                        <div className="space-y-4 md:space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="bg-rose-50 text-rose-600 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest italic border border-rose-100 shadow-sm">Question {assessment.currentQuestionIndex + 1}</span>
                                <div className={`flex items-center gap-3 font-black text-sm uppercase tracking-widest px-6 py-3 rounded-2xl border shadow-xl transition-all ${timeLeft !== null && timeLeft <= 5 ? 'bg-rose-600 text-white border-rose-600 animate-pulse scale-110 shadow-rose-200' : 'bg-slate-900 text-white border-slate-800'}`}>
                                    <Clock className={`w-5 h-5 ${timeLeft !== null && timeLeft <= 5 ? 'text-white' : 'text-rose-400'}`} />
                                    <span className="tabular-nums">{timeLeft !== null ? `${timeLeft}s Remaining` : `No Time Limit`}</span>
                                </div>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight uppercase italic tracking-tighter text-center py-4">
                                {currentQuestion.text}
                            </h1>
                            {timeLeft !== null && timeLeft <= 10 && !hasAnsweredCurrent && (
                                <div className="flex justify-center -mt-4 mb-4">
                                    <div className={`text-5xl md:text-6xl font-black italic tracking-tighter tabular-nums ${timeLeft <= 5 ? 'text-rose-600 animate-ping' : 'text-slate-200'}`}>
                                        {timeLeft}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
                            {currentQuestion.options.map((opt: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedAnswer(opt)}
                                    className={`p-4 md:p-5 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${selectedAnswer === opt
                                        ? 'bg-white border-rose-600 scale-[1.01] shadow-xl'
                                        : 'bg-white border-slate-100 text-slate-600 hover:border-rose-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-3 md:mb-4">
                                        <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${selectedAnswer === opt ? 'text-rose-600' : 'text-slate-300'}`}>Option {String.fromCharCode(65 + idx)}</span>
                                        <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center ${selectedAnswer === opt ? 'bg-rose-600 border-rose-600' : 'border-slate-100'}`}>
                                            {selectedAnswer === opt && <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div>}
                                        </div>
                                    </div>
                                    <p className={`text-lg md:text-xl font-black italic uppercase ${selectedAnswer === opt ? 'text-slate-900' : 'text-slate-700'}`}>{opt}</p>
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={!selectedAnswer || submitting}
                            onClick={() => submitAnswer()}
                            className={`w-full p-4 md:p-5 rounded-2xl flex items-center justify-between group transition-all shadow-lg ${selectedAnswer
                                ? 'bg-slate-900 text-white hover:bg-black scale-[1.01]'
                                : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200'
                                }`}
                        >
                            <span className="text-base md:text-lg font-black uppercase tracking-[0.2em] ml-2 italic">Submit Answer</span>
                            {submitting ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : <Send className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-all" />}
                        </button>
                    </div>
                ) : (
                    <div className="text-center text-slate-400 space-y-4 py-20">
                        <AlertCircle className="w-16 h-16 mx-auto opacity-20" />
                        <p className="font-black uppercase tracking-widest text-[10px]">Error: Question data corrupted or missing.</p>
                    </div>
                )}
            </main>

            {/* Participation Footer */}
            <footer className="p-6 md:p-8 bg-white border-t border-slate-200 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[7px] md:text-[8px] font-black text-slate-400 uppercase italic">
                                S
                            </div>
                        ))}
                    </div>
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Live with classmates</p>
                </div>
                <div className="text-right flex items-center gap-4 md:gap-8">
                    <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Your Score</p>
                        <p className="text-xl md:text-2xl font-black text-slate-900 italic tracking-tighter">
                            {myResponses.reduce((acc, r) => acc + r.marksObtained, 0)} <span className="text-xs opacity-40 ml-1">PTS</span>
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
