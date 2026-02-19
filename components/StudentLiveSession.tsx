"use client";

import { useState, useEffect } from "react";
import {
    X, Radio, CheckCircle2, Loader2, Zap,
    Clock, Play, Trophy, AlertCircle, Send
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

    const currentQuestion = assessment.questions[assessment.currentQuestionIndex];
    const hasAnsweredCurrent = myResponses.some(r => r.questionId === currentQuestion?.id);

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

    const submitAnswer = async () => {
        if (!selectedAnswer || submitting) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/live-assessments/${assessment.id}/responses`, {
                method: "POST",
                body: JSON.stringify({
                    questionId: currentQuestion.id,
                    answer: selectedAnswer
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
        <div className="fixed inset-0 z-[70] bg-rose-600 flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-500">
            {/* Header */}
            <header className="p-8 flex items-center justify-between border-b border-white/20">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-600 shadow-xl shadow-rose-900/20">
                        <Radio className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">{assessment.title}</h2>
                        <p className="text-[8px] font-black uppercase text-white/60 tracking-widest">{assessment.course.title} • Teacher {assessment.teacher.firstName}</p>
                    </div>
                </div>
                <div className="bg-black/20 text-white px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-3 font-black text-[10px] uppercase italic">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    LIVE SESSION
                </div>
            </header>

            {/* Main Area */}
            <main className="flex-grow p-8 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
                {assessment.currentQuestionIndex === -1 ? (
                    <div className="text-center space-y-10 animate-bounce">
                        <div className="w-40 h-40 bg-white/10 rounded-[3.5rem] border border-white/20 flex items-center justify-center mx-auto shadow-2xl backdrop-blur-3xl">
                            <Clock className="w-20 h-20 text-white" />
                        </div>
                        <div className="space-y-4 text-white">
                            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Waiting for Launch...</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Your teacher hasn't released the first question yet.</p>
                        </div>
                    </div>
                ) : hasAnsweredCurrent ? (
                    <div className="text-center space-y-12 w-full">
                        <div className="bg-white p-12 rounded-[4rem] text-center space-y-8 shadow-2xl">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-lg animate-in zoom-in">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Response Locked!</h3>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Great job. Waiting for your teacher to pass the next question...</p>
                            </div>
                            <div className="pt-8 border-t border-slate-50 flex items-center justify-center gap-4 text-[10px] font-black text-slate-300 uppercase italic">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Polling for status update
                            </div>
                        </div>
                    </div>
                ) : currentQuestion ? (
                    <div className="w-full space-y-12 animate-in zoom-in duration-300">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="bg-white/20 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic border border-white/10">Question {assessment.currentQuestionIndex + 1}</span>
                                <div className="flex items-center gap-2 text-white/60 font-black text-[10px] uppercase tracking-widest">
                                    <Clock className="w-4 h-4" />
                                    <span>{currentQuestion.timer}s Limit</span>
                                </div>
                            </div>
                            <h1 className="text-5xl font-black text-white leading-tight uppercase italic tracking-tighter">
                                {currentQuestion.text}
                            </h1>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            {currentQuestion.options.map((opt: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedAnswer(opt)}
                                    className={`p-8 rounded-[2.5rem] border-2 text-left transition-all relative overflow-hidden group ${selectedAnswer === opt
                                            ? 'bg-white border-white scale-105 shadow-2xl'
                                            : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${selectedAnswer === opt ? 'text-rose-600' : 'text-white/40'}`}>Option {String.fromCharCode(65 + idx)}</span>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedAnswer === opt ? 'bg-rose-600 border-rose-600' : 'border-white/20'}`}>
                                            {selectedAnswer === opt && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                    </div>
                                    <p className={`text-xl font-black italic uppercase ${selectedAnswer === opt ? 'text-slate-900' : ''}`}>{opt}</p>
                                </button>
                            ))}
                        </div>

                        <button
                            disabled={!selectedAnswer || submitting}
                            onClick={submitAnswer}
                            className={`w-full p-8 rounded-[2.5rem] flex items-center justify-between group transition-all shadow-2xl ${selectedAnswer
                                    ? 'bg-slate-900 text-white hover:bg-black scale-[1.02]'
                                    : 'bg-black/20 text-white/30 cursor-not-allowed'
                                }`}
                        >
                            <span className="text-xl font-black uppercase tracking-[0.2em] ml-4 italic">Submit Answer</span>
                            {submitting ? <Loader2 className="w-8 h-8 animate-spin" /> : <Send className="w-8 h-8 group-hover:translate-x-2 transition-all" />}
                        </button>
                    </div>
                ) : (
                    <div className="text-center text-white space-y-4">
                        <AlertCircle className="w-16 h-16 mx-auto opacity-50" />
                        <p className="font-black uppercase tracking-widest text-xs">Error: Question data corrupted or missing.</p>
                    </div>
                )}
            </main>

            {/* Participation Footer */}
            <footer className="p-8 bg-black/10 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-rose-600 flex items-center justify-center text-[8px] font-black text-white uppercase italic">
                                S
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">You are live with other students.</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Your Score</p>
                    <p className="text-2xl font-black text-white italic tracking-tighter">
                        {myResponses.reduce((acc, r) => acc + r.marksObtained, 0)} <span className="text-xs opacity-40 ml-1">POINTS</span>
                    </p>
                </div>
            </footer>
        </div>
    );
}
