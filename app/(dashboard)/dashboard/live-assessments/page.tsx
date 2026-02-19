"use client";

import { useState, useEffect } from "react";
import {
    Plus, Search, Filter, Radio, Clock,
    ArrowRight, Book, Loader2, User, ChevronRight,
    CheckCircle2, AlertCircle, Eye, Printer, FileText,
    TrendingUp, Award, Play, Trash2, Activity, Zap, RefreshCcw
} from "lucide-react";
import LiveAssessmentModal from "@/components/LiveAssessmentModal";
import TeacherLiveSession from "@/components/TeacherLiveSession";
import StudentLiveSession from "@/components/StudentLiveSession";
import { toast } from "react-hot-toast";

export default function LiveAssessmentsPage() {
    const [assessments, setAssessments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeSession, setActiveSession] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterBy, setFilterBy] = useState("ALL");

    async function fetchData() {
        setLoading(true);
        try {
            const [uRes, aRes] = await Promise.all([
                fetch("/api/auth/me"),
                fetch("/api/live-assessments")
            ]);
            const uData = await uRes.json();
            const aData = await aRes.json();
            setUser(uData);
            setAssessments(Array.isArray(aData) ? aData : []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to sync live assessment data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
        // Setup polling for live status if student
        const interval = setInterval(() => {
            if (user?.role === "STUDENT") {
                fetch("/api/live-assessments?status=LIVE")
                    .then(res => res.json())
                    .then(data => {
                        if (Array.isArray(data) && data.length > 0) {
                            // Check if there is a NEW live session the student hasn't joined or is currently in
                        }
                    });
            }
        }, 10000); // Poll every 10 seconds for students

        return () => clearInterval(interval);
    }, [user?.role]);

    const filteredAssessments = assessments.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.course.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterBy === "ALL" || a.course.title.toUpperCase() === filterBy.toUpperCase();
        return matchesSearch && matchesFilter;
    });

    const subjects = ["ALL", ...new Set(assessments.map(a => a.course.title))];

    const isTeacher = user?.role === "TEACHER";
    const isStudent = user?.role === "STUDENT";
    const isParent = user?.role === "PARENT";
    const isDOS = user?.role === "DOS" || user?.role === "SCHOOL_ADMIN";

    const printReport = async (a: any) => {
        const tid = toast.loading("Preparing report...");
        try {
            const sRes = await fetch(`/api/users?role=STUDENT&classId=${a.classId}`);
            let students = await sRes.json();

            // If parent, only show their children
            if (isParent && user.children) {
                const childIds = user.children.map((c: any) => c.id);
                students = students.filter((s: any) => childIds.includes(s.id));
            }

            const printWindow = window.open('', '_blank');
            if (!printWindow) return;

            // Group responses by student
            const studentResponses: any = {};
            a.responses.forEach((r: any) => {
                if (!studentResponses[r.studentId]) {
                    studentResponses[r.studentId] = {
                        score: 0,
                        correct: 0,
                        total: 0
                    };
                }
                studentResponses[r.studentId].score += r.marksObtained;
                if (r.isCorrect) studentResponses[r.studentId].correct++;
                studentResponses[r.studentId].total++;
            });

            const rowsHtml = students.map((std: any) => {
                const s = studentResponses[std.id] || { score: 0, correct: 0, total: 0 };
                const attended = !!studentResponses[std.id];

                return `
                    <tr style="border-bottom: 1px solid #eee; ${!attended ? 'background: #fffafa;' : ''}">
                        <td style="padding: 12px; font-size: 14px;">
                            ${std.firstName} ${std.lastName}
                            ${!attended ? '<br><span style="font-size: 10px; color: #f43f5e; font-weight: bold;">(DID NOT ATTEND)</span>' : ''}
                        </td>
                        <td style="padding: 12px; font-size: 14px;">${s.score} Pts</td>
                        <td style="padding: 12px; font-size: 14px;">${s.correct} / ${a.questions.length}</td>
                        <td style="padding: 12px; font-size: 14px; font-weight: bold; color: ${s.correct === a.questions.length ? '#10b981' : '#1e293b'}">
                            ${Math.round((s.correct / a.questions.length) * 100)}%
                        </td>
                    </tr>
                `;
            }).join('');

            printWindow.document.write(`
                <html>
                    <head>
                        <title>Live Assessment Report - ${a.title}</title>
                        <style>
                            body { font-family: sans-serif; padding: 40px; color: #334155; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; font-size: 12px; text-transform: uppercase; }
                            .header { margin-bottom: 40px; border-bottom: 4px solid #e11d48; padding-bottom: 20px; }
                        </style>
                    </head>
                    <body>
                        <div class="header">
                            <h1 style="margin: 0; text-transform: uppercase; letter-spacing: -1px;">Live Assessment Report</h1>
                            <p style="color: #64748b; font-weight: bold; margin-top: 5px;">${a.title} | ${a.course.title} | ${a.class.name}</p>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Score</th>
                                    <th>Correct</th>
                                    <th>Percentage</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rowsHtml}
                            </tbody>
                        </table>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
            toast.dismiss(tid);
        } catch (err) {
            toast.error("Failed to generate report", { id: tid });
        }
    };

    const startSession = (assessment: any) => {
        setActiveSession(assessment);
    };

    if (activeSession) {
        if (isTeacher) {
            return <TeacherLiveSession assessment={activeSession} onExit={() => { setActiveSession(null); fetchData(); }} />;
        }
        if (isStudent) {
            return <StudentLiveSession assessment={activeSession} onExit={() => { setActiveSession(null); fetchData(); }} />;
        }
    }

    return (
        <div className="space-y-12 animate-fade-up">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase italic">Live Assessments</h1>
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">Real-time classroom testing & interaction.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => fetchData()}
                        className="bg-white text-slate-400 p-5 rounded-3xl border border-slate-100 shadow-sm hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-3 group"
                        title="Refresh All Data"
                    >
                        <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-all duration-500'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Sync Lives</span>
                    </button>
                    {isTeacher && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-slate-900 text-white rounded-3xl px-10 py-5 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/10 hover:bg-rose-600 hover:scale-105 transition-all flex items-center justify-center gap-4"
                        >
                            <Zap className="w-5 h-5 text-yellow-400" />
                            <span>Create Live Session</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                        <Activity className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ongoing Lives</p>
                        <p className="text-2xl font-black text-slate-900 italic">{assessments.filter(a => a.status === "LIVE").length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                        <Clock className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Scheduled</p>
                        <p className="text-2xl font-black text-slate-900 italic">{assessments.filter(a => a.status === "DRAFT").length}</p>
                    </div>
                </div>
            </div>

            {/* Filter Hub */}
            <div className="flex flex-col md:flex-row gap-8 items-center justify-between bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex flex-wrap gap-2">
                    {subjects.slice(0, 5).map(sub => (
                        <button
                            key={sub}
                            onClick={() => setFilterBy(sub)}
                            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filterBy === sub
                                ? 'bg-slate-900 text-white shadow-xl italic'
                                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                }`}
                        >
                            {sub}
                        </button>
                    ))}
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                        placeholder="Search live sessions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-50 rounded-[1.8rem] pl-14 pr-8 py-4 text-xs font-black outline-none focus:bg-white focus:ring-8 focus:ring-rose-500/5 transition-all text-slate-900 placeholder:text-slate-300"
                    />
                </div>
            </div>

            {/* Assessment Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 pb-20">
                {loading ? (
                    <div className="col-span-full py-40 flex flex-col items-center gap-6">
                        <Loader2 className="w-16 h-16 animate-spin text-rose-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Syncing live sessions...</p>
                    </div>
                ) : filteredAssessments.length > 0 ? (
                    filteredAssessments.map(a => (
                        <div key={a.id} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col gap-8">
                            <div className={`absolute top-0 right-0 w-32 h-32 ${a.status === 'LIVE' ? 'bg-rose-500/10' : 'bg-slate-900/[0.02]'} rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform`}></div>

                            <div className="space-y-6 flex-grow">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 ${a.status === 'LIVE' ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-900 text-white'} rounded-[1.5rem] flex items-center justify-center shadow-xl`}>
                                            <Radio className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600 mb-1">{a.course.title}</h4>
                                            <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 uppercase tracking-widest border border-slate-100">
                                                {a.class.name}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => fetchData()}
                                            className="p-3 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all border border-slate-100 group/btn"
                                            title="Sync Card Data"
                                        >
                                            <RefreshCcw className="w-3.5 h-3.5 group-hover/btn:rotate-180 transition-all duration-500" />
                                        </button>
                                        {a.status === 'LIVE' && (
                                            <span className="bg-rose-600 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest animate-bounce">LIVE NOW</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-black text-slate-900 leading-tight uppercase italic tracking-tighter">
                                            {a.title}
                                        </h3>
                                        {a.deadline && (
                                            <div className="flex items-center gap-1.5 text-rose-500 bg-rose-50 px-3 py-1 rounded-xl border border-rose-100 shadow-sm animate-pulse">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-[8px] font-black uppercase tracking-widest">
                                                    Deadline: {new Date(a.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-relaxed line-clamp-2">
                                        {a.description || "No description provided."}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-3xl flex items-center gap-4">
                                        <FileText className="w-4 h-4 text-rose-500" />
                                        <div>
                                            <p className="text-[8px] font-black uppercase text-slate-400">Questions</p>
                                            <p className="text-[10px] font-black text-slate-900">{a.questions.length}</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-3xl flex items-center gap-4">
                                        <User className="w-4 h-4 text-emerald-500" />
                                        <div>
                                            <p className="text-[8px] font-black uppercase text-slate-400">Participation</p>
                                            <p className="text-[10px] font-black text-slate-900">{[...new Set(a.responses.map((r: any) => r.studentId))].length} Students</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 mt-auto flex flex-col gap-4">
                                {a.status === 'LIVE' ? (
                                    <button
                                        onClick={() => startSession(a)}
                                        className="w-full bg-rose-600 text-white p-5 rounded-[2rem] flex items-center justify-between group/live hover:bg-rose-700 transition-all shadow-xl shadow-rose-200"
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] ml-4">Join Session</span>
                                        <Play className="w-5 h-5 fill-current" />
                                    </button>
                                ) : a.status === 'COMPLETED' ? (
                                    <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                            <div>
                                                <p className="text-[9px] font-black uppercase text-emerald-600">Session Ended</p>
                                                <p className="text-[10px] font-black text-slate-900">Final Results Ready</p>
                                            </div>
                                        </div>
                                        {(isTeacher || isDOS || isParent) && (
                                            <button
                                                onClick={() => printReport(a)}
                                                className="p-3 bg-white text-emerald-600 rounded-xl shadow-sm hover:bg-emerald-600 hover:text-white transition-all"
                                            >
                                                <Printer className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    isTeacher && (
                                        <button
                                            onClick={() => {
                                                if (confirm("Start this live assessment now?")) {
                                                    fetch(`/api/live-assessments/${a.id}`, {
                                                        method: 'PATCH',
                                                        body: JSON.stringify({ status: 'LIVE', currentQuestionIndex: 0 })
                                                    }).then(() => fetchData());
                                                }
                                            }}
                                            className="w-full bg-slate-900 text-white p-5 rounded-[2rem] flex items-center justify-between hover:bg-rose-600 transition-all shadow-xl"
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] ml-4">Go Live</span>
                                            <Zap className="w-5 h-5 fill-current text-yellow-400" />
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-48 bg-white rounded-[4rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-10">
                        <Radio className="w-16 h-16 text-slate-200" />
                        <div className="space-y-4">
                            <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">No Live Sessions</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Create a real-time assessment for your students.</p>
                            {isTeacher && (
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 transition-all"
                                >
                                    Start One Now
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <LiveAssessmentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    );
}
