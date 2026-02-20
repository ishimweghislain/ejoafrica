"use client";

import { useState, useEffect } from "react";
import {
    X, Radio, ArrowRight, CheckCircle2,
    Loader2, Zap, Clock, Play, RefreshCcw, Users
} from "lucide-react";
import { toast } from "react-hot-toast";

interface TeacherLiveSessionProps {
    assessment: any;
    onExit: () => void;
}

export default function TeacherLiveSession({ assessment: initialAssessment, onExit }: TeacherLiveSessionProps) {
    const [assessment, setAssessment] = useState(initialAssessment);
    const [responses, setResponses] = useState<any[]>([]);
    const [classStudents, setClassStudents] = useState<any[]>([]);
    const [releasing, setReleasing] = useState(false);

    const currentQuestion = assessment.questions[assessment.currentQuestionIndex];

    const fetchLiveDetails = async () => {
        try {
            const [aRes, rRes, sRes] = await Promise.all([
                fetch(`/api/live-assessments/${assessment.id}`),
                fetch(`/api/live-assessments/${assessment.id}/responses`),
                fetch(`/api/users?role=STUDENT&classId=${assessment.classId}`)
            ]);
            const aData = await aRes.json();
            const rData = await rRes.json();
            const sData = await sRes.json();

            setAssessment(aData);
            setResponses(rData);
            setClassStudents(Array.isArray(sData) ? sData : []);
        } catch (err) {
            console.error("Failed to poll live details");
        }
    };

    useEffect(() => {
        fetchLiveDetails();
        const interval = setInterval(fetchLiveDetails, 4000);
        return () => clearInterval(interval);
    }, []);

    const releaseNext = async () => {
        if (assessment.currentQuestionIndex >= assessment.questions.length - 1) {
            return endSession();
        }
        setReleasing(true);
        try {
            const res = await fetch(`/api/live-assessments/${assessment.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ currentQuestionIndex: assessment.currentQuestionIndex + 1 })
            });
            if (res.ok) {
                toast.success("Question released!");
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
                toast.success("Live assessment ended successfully!");
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
        <div className="fixed inset-0 z-[70] bg-slate-900 flex flex-col animate-in fade-in duration-500 overflow-hidden">
            {/* Header */}
            <header className="px-10 py-6 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
                <div className="flex items-center gap-6">
                    <button onClick={onExit} className="p-3.5 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/5">
                        <X className="w-5 h-5" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Live Monitor: {assessment.title}</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></div>
                            <p className="text-[9px] font-black uppercase text-white/40 tracking-[0.3em] italic">{assessment.course.title} • {assessment.class.name}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-xl border border-white/10">
                        <Users className="w-4 h-4 text-emerald-400" />
                        <div>
                            <p className="text-[7px] font-black uppercase text-white/30 tracking-widest">Active Students</p>
                            <p className="text-xl font-black text-emerald-400 italic leading-none">{uniqueStudents.length}</p>
                        </div>
                    </div>
                    {assessment.deadline && (
                        <div className="hidden lg:flex flex-col items-end">
                            <p className="text-[7px] font-black text-white/30 uppercase tracking-widest mb-1 italic">Due Time</p>
                            <span className="text-[9px] font-black text-rose-500 uppercase italic tracking-widest">
                                {new Date(assessment.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    )}
                    <button
                        onClick={endSession}
                        className="bg-rose-600/10 text-rose-500 border border-rose-500/20 px-8 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all italic shadow-xl shadow-rose-950/20"
                    >
                        End Session
                    </button>
                </div>
            </header>

            {/* Main Section */}
            <main className="flex-grow flex flex-col lg:flex-row overflow-hidden">
                {/* Left: Active Question Console */}
                <div className="flex-grow p-12 overflow-y-auto space-y-12 bg-slate-900">
                    {currentQuestion ? (
                        <div className="space-y-12 max-w-5xl">
                            <div className="space-y-8">
                                <div className="flex flex-wrap items-center gap-4">
                                    <span className="bg-rose-600 text-white px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest italic shadow-lg">Question {assessment.currentQuestionIndex + 1} / {assessment.questions.length}</span>
                                    <div className="px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/10 text-white/60 italic">
                                        Submissions: {questionResponses.length} / {classStudents.length} Students
                                    </div>
                                    <div className="flex items-center gap-2 text-white/30 text-[9px] font-black uppercase tracking-widest italic">
                                        <Clock className="w-4 h-4" />
                                        <span>Timer: {currentQuestion.timer}s</span>
                                    </div>
                                </div>
                                <h1 className="text-3xl lg:text-5xl font-black text-white leading-tight uppercase italic tracking-tighter">
                                    {currentQuestion.text}
                                </h1>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {currentQuestion.options.map((opt: string, idx: number) => {
                                    const isCorrect = opt === currentQuestion.correctAnswer;
                                    const count = questionResponses.filter(r => r.answer === opt).length;
                                    const percentage = questionResponses.length > 0 ? (count / questionResponses.length) * 100 : 0;

                                    return (
                                        <div key={idx} className={`p-6 rounded-3xl border transition-all relative overflow-hidden group ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/5'}`}>
                                            <div className="absolute top-0 left-0 h-full bg-emerald-500/10 transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                                            <div className="relative flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                                                <span className="text-white/20 text-[9px] font-black uppercase tracking-widest italic">Option {String.fromCharCode(65 + idx)}</span>
                                                {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                            </div>
                                            <p className={`relative text-xl font-black italic uppercase ${isCorrect ? 'text-emerald-500' : 'text-white/80'}`}>{opt}</p>
                                            <div className="relative mt-6 flex justify-between items-end">
                                                <p className="text-[8px] font-black uppercase text-white/30 tracking-widest italic">{count} Answers</p>
                                                <p className="text-2xl font-black text-white italic tracking-tighter">{Math.round(percentage)}%</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-10">
                            <div className="w-32 h-32 bg-white/5 rounded-[3rem] border border-white/10 flex items-center justify-center animate-pulse">
                                <Zap className="w-16 h-16 text-emerald-500 fill-current" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Ready to Start</h2>
                                <p className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] italic leading-relaxed">System ready to display questions to students.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Leaderboard / Statistics Panel */}
                <div className="w-full lg:w-[450px] bg-slate-950/80 border-l border-white/10 overflow-hidden flex flex-col">
                    <div className="p-10 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <Users className="w-4 h-4 text-white/30" />
                            <h3 className="text-[10px] font-black uppercase text-white/30 tracking-[0.3em] italic">Leaderboard</h3>
                        </div>
                        <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest italic px-2 py-1 bg-emerald-500/10 rounded">Live Results</span>
                    </div>

                    <div className="flex-grow overflow-y-auto p-6 custom-scrollbar space-y-3">
                        {classStudents.length === 0 ? (
                            <div className="py-24 flex flex-col items-center gap-5 text-white/10">
                                <Radio className="w-16 h-16 opacity-20" />
                                <p className="text-[9px] font-black uppercase tracking-widest italic">No students joined yet.</p>
                            </div>
                        ) : (
                            [...classStudents].sort((a, b) => {
                                const scoreA = responses.filter(r => r.studentId === a.id).reduce((acc, r) => acc + r.marksObtained, 0);
                                const scoreB = responses.filter(r => r.studentId === b.id).reduce((acc, r) => acc + r.marksObtained, 0);
                                return scoreB - scoreA;
                            }).map((student: any) => {
                                const studentRes = responses.filter(r => r.studentId === student.id);
                                const totalScore = studentRes.reduce((acc, r) => acc + r.marksObtained, 0);
                                const correctCount = studentRes.filter(r => r.isCorrect).length;
                                const hasJoined = studentRes.length > 0;

                                return (
                                    <div key={student.id} className={`p-4 rounded-2xl border transition-all flex items-center justify-between group ${hasJoined ? 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08]' : 'bg-white/[0.01] border-white/[0.01] opacity-30'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[9px] font-black text-white uppercase border italic ${hasJoined ? 'bg-emerald-600 border-white/20' : 'bg-slate-800 border-white/5'}`}>
                                                {student?.firstName[0]}{student?.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-white mb-0.5">{student?.firstName} {student?.lastName}</p>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-[8px] font-black uppercase text-white/40 tracking-widest italic">{correctCount} Correct • {studentRes.length} Answers</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xl font-black italic ${totalScore > 0 ? 'text-emerald-400' : 'text-white/20'}`}>{totalScore}</p>
                                            <p className="text-[7px] font-black uppercase text-white/20 tracking-widest italic">Points</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="p-10 bg-black/40 border-t border-white/10">
                        <button
                            disabled={releasing}
                            onClick={releaseNext}
                            className="w-full bg-rose-600 text-white p-5 rounded-xl flex items-center justify-between group transition-all disabled:opacity-50 shadow-2xl hover:bg-rose-700 italic"
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] ml-2">
                                {assessment.currentQuestionIndex >= assessment.questions.length - 1 ? "End Assessment" : (assessment.currentQuestionIndex === -1 ? "Start Assessment" : "Next Question")}
                            </span>
                            {releasing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
