"use client";

import { useState, useEffect } from "react";
import {
    X, Users, Radio, ArrowRight, CheckCircle2,
    Loader2, Zap, Award, BarChart3, Clock, Play
} from "lucide-react";
import { toast } from "react-hot-toast";

interface TeacherLiveSessionProps {
    assessment: any;
    onExit: () => void;
}

export default function TeacherLiveSession({ assessment: initialAssessment, onExit }: TeacherLiveSessionProps) {
    const [assessment, setAssessment] = useState(initialAssessment);
    const [responses, setResponses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [releasing, setReleasing] = useState(false);

    const currentQuestion = assessment.questions[assessment.currentQuestionIndex];

    const fetchLiveDetails = async () => {
        try {
            const [aRes, rRes] = await Promise.all([
                fetch(`/api/live-assessments/${assessment.id}`),
                fetch(`/api/live-assessments/${assessment.id}/responses`)
            ]);
            const aData = await aRes.json();
            const rData = await rRes.json();
            setAssessment(aData);
            setResponses(rData);
        } catch (err) {
            console.error("Failed to poll live details");
        }
    };

    useEffect(() => {
        const interval = setInterval(fetchLiveDetails, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, []);

    const releaseNext = async () => {
        if (assessment.currentQuestionIndex >= assessment.questions.length - 1) {
            // End session
            return endSession();
        }
        setReleasing(true);
        try {
            const res = await fetch(`/api/live-assessments/${assessment.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ currentQuestionIndex: assessment.currentQuestionIndex + 1 })
            });
            if (res.ok) {
                toast.success("Next question released!");
                fetchLiveDetails();
            }
        } catch (err) {
            toast.error("Failed to release next question");
        } finally {
            setReleasing(false);
        }
    };

    const endSession = async () => {
        if (!confirm("Are you sure you want to end this live assessment?")) return;
        setReleasing(true);
        try {
            const res = await fetch(`/api/live-assessments/${assessment.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'COMPLETED' })
            });
            if (res.ok) {
                toast.success("Live assessment completed!");
                onExit();
            }
        } catch (err) {
            toast.error("Failed to end session");
        } finally {
            setReleasing(false);
        }
    };

    const questionResponses = responses.filter(r => r.questionId === currentQuestion?.id);
    const uniqueStudents = [...new Set(responses.map(r => r.studentId))];

    return (
        <div className="fixed inset-0 z-[70] bg-slate-900 flex flex-col animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <header className="p-8 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onExit}
                        className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Live: {assessment.title}</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                            <p className="text-[10px] font-black uppercase text-white/50 tracking-widest">{assessment.course.title} • {assessment.class.name}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl">
                        <Users className="w-5 h-5 text-emerald-500" />
                        <div>
                            <p className="text-[8px] font-black uppercase text-white/40">Active Students</p>
                            <p className="text-lg font-black text-emerald-500 italic">{uniqueStudents.length}</p>
                        </div>
                    </div>
                    <button
                        onClick={endSession}
                        className="bg-rose-600/20 text-rose-500 border border-rose-500/30 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-xl shadow-rose-900/20"
                    >
                        End Session
                    </button>
                </div>
            </header>

            {/* Main Section */}
            <main className="flex-grow overflow-hidden flex flex-col md:flex-row">
                {/* Left: Current Question Area */}
                <div className="flex-grow p-12 overflow-y-auto space-y-12">
                    {currentQuestion ? (
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className="bg-rose-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest italic">Question {assessment.currentQuestionIndex + 1} of {assessment.questions.length}</span>
                                    <div className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest">
                                        <Clock className="w-4 h-4" />
                                        <span>{currentQuestion.timer}s Limit</span>
                                    </div>
                                </div>
                                <h1 className="text-5xl font-black text-white leading-tight uppercase italic tracking-tighter">
                                    {currentQuestion.text}
                                </h1>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {currentQuestion.options.map((opt: string, idx: number) => {
                                    const isCorrect = opt === currentQuestion.correctAnswer;
                                    const count = questionResponses.filter(r => r.answer === opt).length;
                                    const percentage = questionResponses.length > 0 ? (count / questionResponses.length) * 100 : 0;

                                    return (
                                        <div key={idx} className={`p-8 rounded-[2.5rem] border transition-all relative overflow-hidden ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                                            <div className="absolute top-0 left-0 h-full bg-emerald-500/5 transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                                            <div className="relative flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                                                <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">Option {String.fromCharCode(65 + idx)}</span>
                                                {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                            </div>
                                            <p className={`relative text-xl font-black italic uppercase ${isCorrect ? 'text-emerald-500' : 'text-white/80'}`}>{opt}</p>
                                            <div className="relative mt-6 flex justify-between items-end">
                                                <p className="text-[10px] font-black uppercase text-white/40 tracking-widest">{count} Choices</p>
                                                <p className="text-2xl font-black text-white italic">{Math.round(percentage)}%</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                            <Zap className="w-24 h-24 text-rose-600 animate-bounce" />
                            <div>
                                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Prepare to Launch</h2>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-2">The session is ready. Click below to release the first question.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Sidebar / Participation Panel */}
                <div className="w-full md:w-[400px] bg-white/5 border-l border-white/10 overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-white/40" />
                            <h3 className="text-[10px] font-black uppercase text-white/40 tracking-widest">Leaderboard</h3>
                        </div>
                        <span className="text-[10px] font-black text-emerald-500 uppercase italic">Real-time Data</span>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4 custom-scrollbar space-y-3">
                        {uniqueStudents.length === 0 ? (
                            <div className="py-20 flex flex-col items-center gap-4 text-white/20">
                                <Activity className="w-12 h-12" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Waiting for students...</p>
                            </div>
                        ) : (
                            uniqueStudents.sort((aId, bId) => {
                                const scoreA = responses.filter(r => r.studentId === aId).reduce((acc, r) => acc + r.marksObtained, 0);
                                const scoreB = responses.filter(r => r.studentId === bId).reduce((acc, r) => acc + r.marksObtained, 0);
                                return scoreB - scoreA;
                            }).map((sid: string) => {
                                const studentRes = responses.filter(r => r.studentId === sid);
                                const student = studentRes[0]?.student;
                                const totalScore = studentRes.reduce((acc, r) => acc + r.marksObtained, 0);
                                const correctCount = studentRes.filter(r => r.isCorrect).length;

                                return (
                                    <div key={sid} className="bg-white/5 p-5 rounded-3xl border border-white/5 flex items-center justify-between group hover:bg-white/[0.08] transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-[10px] font-black text-white uppercase border border-white/10 italic">
                                                {student?.firstName[0]}{student?.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-white mb-0.5">{student?.firstName} {student?.lastName}</p>
                                                <p className="text-[8px] font-black uppercase text-white/40 tracking-widest">{correctCount} Correct • {studentRes.length} Answers</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-emerald-500 italic">{totalScore}</p>
                                            <p className="text-[8px] font-black uppercase text-white/30">Points</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="p-8 bg-slate-900 border-t border-white/10">
                        <button
                            disabled={releasing}
                            onClick={releaseNext}
                            className="w-full bg-rose-600 text-white p-6 rounded-[2rem] flex items-center justify-between group shadow-2xl shadow-rose-900/40 hover:bg-rose-700 transition-all disabled:opacity-50"
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] ml-4 italic">
                                {assessment.currentQuestionIndex >= assessment.questions.length - 1 ? "Finish Session" : (assessment.currentQuestionIndex === -1 ? "Start Assessment" : "Release Next")}
                            </span>
                            {releasing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

function Activity({ className }: { className?: string }) {
    return <Radio className={className} />;
}
