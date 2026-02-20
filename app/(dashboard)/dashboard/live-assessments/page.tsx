"use client";

import { useState, useEffect } from "react";
import {
    Plus, Search, Radio, Clock,
    Loader2, User, CheckCircle2, Eye, Printer, FileText,
    Zap, RefreshCcw, Edit3, Trash2, TrendingUp
} from "lucide-react";
import LiveAssessmentModal from "@/components/LiveAssessmentModal";
import TeacherLiveSession from "@/components/TeacherLiveSession";
import StudentLiveSession from "@/components/StudentLiveSession";
import ViewQuestionsModal from "@/components/ViewQuestionsModal";
import StudentAnalyticsModal from "@/components/StudentAnalyticsModal";
import { toast } from "react-hot-toast";

export default function LiveAssessmentsPage() {
    const [assessments, setAssessments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    const [activeSession, setActiveSession] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterBy, setFilterBy] = useState("ALL");
    const [viewQuestionsData, setViewQuestionsData] = useState<any>(null);
    const [viewAnalyticsData, setViewAnalyticsData] = useState<any>(null);

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
        const interval = setInterval(() => {
            if (user?.role === "STUDENT") {
                fetch("/api/live-assessments")
                    .then(res => res.json())
                    .then(data => {
                        if (Array.isArray(data)) setAssessments(data);
                    });
            }
        }, 5000); // 5-second polling for students

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

            if (isParent && user.children) {
                const childIds = user.children.map((c: any) => c.id);
                students = students.filter((s: any) => childIds.includes(s.id));
            }

            const printWindow = window.open('', '_blank');
            if (!printWindow) return;

            const studentResponses: any = {};
            a.responses.forEach((r: any) => {
                if (!studentResponses[r.studentId]) {
                    studentResponses[r.studentId] = { score: 0, correct: 0, total: 0 };
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
                        <td style="padding: 12px; font-size: 14px;">${std.firstName} ${std.lastName}${!attended ? '<br><span style="font-size: 10px; color: #f43f5e; font-weight: bold;">(DID NOT ATTEND)</span>' : ''}</td>
                        <td style="padding: 12px; font-size: 14px;">${s.score} Pts</td>
                        <td style="padding: 12px; font-size: 14px;">${s.correct} / ${a.questions.length}</td>
                        <td style="padding: 12px; font-size: 14px; font-weight: bold; color: ${s.correct === a.questions.length ? '#10b981' : '#1e293b'}">${Math.round((s.correct / a.questions.length) * 100)}%</td>
                    </tr>
                `;
            }).join('');

            printWindow.document.write(`
                <html>
                    <head><title>Report - ${a.title}</title><style>body { font-family: sans-serif; padding: 40px; color: #334155; } table { width: 100%; border-collapse: collapse; margin-top: 20px; } th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 2px solid #e2e8f0; font-size: 12px; text-transform: uppercase; } .header { margin-bottom: 40px; border-bottom: 4px solid #e11d48; padding-bottom: 20px; }</style></head>
                    <body><div class="header"><h1>Live Assessment Report</h1><p>${a.title} | ${a.course.title}</p></div><table><thead><tr><th>Student</th><th>Score</th><th>Correct</th><th>%</th></tr></thead><tbody>${rowsHtml}</tbody></table></body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
            toast.dismiss(tid);
        } catch (err) { toast.error("Failed to generate report", { id: tid }); }
    };

    const deleteAssessment = async (id: string) => {
        if (!confirm("Are you sure you want to delete this assessment?")) return;
        try {
            const res = await fetch(`/api/live-assessments/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Assessment deleted");
                fetchData();
            }
        } catch (err) {
            toast.error("Failed to delete");
        }
    };

    if (activeSession) {
        if (isTeacher) return <TeacherLiveSession assessment={activeSession} onExit={() => { setActiveSession(null); fetchData(); }} />;
        if (isStudent) return <StudentLiveSession assessment={activeSession} onExit={() => { setActiveSession(null); fetchData(); }} />;
    }

    return (
        <div className="space-y-10 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">Digital Assessments</h1>
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest italic">Live Classroom Tests.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => fetchData()} className="bg-white text-slate-400 p-4 rounded-2xl border border-slate-100 hover:text-emerald-600 transition-all">
                        <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    {isTeacher && (
                        <button
                            onClick={() => { setEditData(null); setIsAddModalOpen(true); }}
                            className="bg-slate-900 text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[9px] shadow-xl hover:bg-emerald-600 transition-all flex items-center gap-3"
                        >
                            <Zap className="w-4 h-4 text-yellow-400" />
                            Create Assessment
                        </button>
                    )}
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex flex-wrap gap-2">
                    {subjects.slice(0, 4).map(sub => (
                        <button key={sub} onClick={() => setFilterBy(sub)} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterBy === sub ? 'bg-slate-900 text-white italic shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>{sub}</button>
                    ))}
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input placeholder="Search sessions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 border border-slate-50 rounded-2xl pl-12 pr-6 py-3.5 text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-slate-900" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                {loading ? (
                    <div className="col-span-full py-32 flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">Updating Dashboard...</p>
                    </div>
                ) : filteredAssessments.length > 0 ? (
                    filteredAssessments.map(a => (
                        <div key={a.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col gap-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 ${a.status === 'LIVE' ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-900 text-white'} rounded-xl flex items-center justify-center shadow-lg`}>
                                        <Radio className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-[9px] font-black uppercase text-emerald-600 italic leading-none mb-1">{a.course.title}</h4>
                                        <p className="text-[10px] font-black text-slate-900 uppercase italic">{a.class.name}</p>
                                    </div>
                                </div>
                                {a.status === 'LIVE' ? (
                                    <span className="bg-rose-50 text-rose-600 text-[7px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest border border-rose-100 italic">Running Now</span>
                                ) : isTeacher && a.status !== 'LIVE' && a.status !== 'COMPLETED' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => { setEditData(a); setIsAddModalOpen(true); }} className="p-2.5 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl border border-slate-100 transition-all"><Edit3 className="w-4 h-4" /></button>
                                        <button onClick={() => deleteAssessment(a.id)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="text-xl font-black text-slate-900 leading-tight uppercase italic tracking-tighter line-clamp-1">{a.title}</h3>
                                    {a.deadline && (
                                        <div className="flex items-center gap-1.5 text-rose-500 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                                            <Clock className="w-3 h-3" />
                                            <span className="text-[7.5px] font-black uppercase">Due: {new Date(a.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-slate-400 text-[10px] font-black uppercase leading-relaxed line-clamp-2 italic">{a.description || "No instructions provided for this session."}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pb-4">
                                <div className="bg-slate-50 p-3.5 rounded-2xl flex items-center gap-3">
                                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                                    <div><p className="text-[7px] font-black uppercase text-slate-400">Questions</p><p className="text-[9px] font-black text-slate-900">{a.questions.length}</p></div>
                                </div>
                                <div className="bg-slate-50 p-3.5 rounded-2xl flex items-center gap-3">
                                    <User className="w-3.5 h-3.5 text-blue-500" />
                                    <div><p className="text-[7px] font-black uppercase text-slate-400">Joined</p><p className="text-[9px] font-black text-slate-900">{[...new Set(a.responses.map((r: any) => r.studentId))].length}</p></div>
                                </div>
                            </div>

                            <div className="mt-auto">
                                {a.status === 'LIVE' ? (
                                    <button onClick={() => setActiveSession(a)} className="w-full bg-rose-600 text-white p-4 rounded-xl flex items-center justify-between group shadow-lg hover:bg-rose-700 transition-all italic">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] ml-2">Join Assessment</span>
                                        <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-all duration-700" />
                                    </button>
                                ) : a.status === 'COMPLETED' ? (
                                    <div className="flex gap-3">
                                        <div className="flex-grow flex gap-2">
                                            <div className="flex-grow bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                <span className="text-[8px] font-black uppercase text-slate-500 italic">Finished</span>
                                            </div>
                                            {isTeacher && (
                                                <button
                                                    onClick={() => setViewAnalyticsData(a)}
                                                    className="p-4 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-emerald-600 transition-all"
                                                    title="Student Analytics"
                                                >
                                                    <TrendingUp className="w-5 h-5" />
                                                </button>
                                            )}
                                            {(isTeacher || isStudent) && (
                                                <button
                                                    onClick={() => setViewQuestionsData(a)}
                                                    className="p-4 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all"
                                                    title="View Questions"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                        <button onClick={() => printReport(a)} className="p-4 bg-emerald-600 text-white rounded-xl shadow-lg hover:bg-emerald-700 transition-all"><Printer className="w-5 h-5" /></button>
                                    </div>
                                ) : (
                                    isTeacher && (
                                        <button
                                            onClick={() => {
                                                if (confirm("Start this live assessment now?")) {
                                                    fetch(`/api/live-assessments/${a.id}`, { method: 'PATCH', body: JSON.stringify({ status: 'LIVE', currentQuestionIndex: 0 }) }).then(() => fetchData());
                                                }
                                            }}
                                            className="w-full bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between hover:bg-emerald-600 transition-all italic"
                                        >
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] ml-2">Start Assessment</span>
                                            <Zap className="w-4 h-4 fill-current text-yellow-400" />
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-32 bg-white rounded-[3rem] border border-dashed border-slate-100 flex flex-col items-center justify-center text-center space-y-6">
                        <Radio className="w-12 h-12 text-slate-100" />
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">No assessments found</h3>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic leading-loose">Create an assessment to start real-time tests.</p>
                        </div>
                        {isTeacher && <button onClick={() => setIsAddModalOpen(true)} className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black uppercase text-[9px] hover:bg-emerald-600 transition-all shadow-xl">Create Now</button>}
                    </div>
                )}
            </div>

            <LiveAssessmentModal
                isOpen={isAddModalOpen}
                initialData={editData}
                onClose={() => { setIsAddModalOpen(false); setEditData(null); }}
                onSuccess={fetchData}
            />

            {
                viewQuestionsData && (
                    <ViewQuestionsModal
                        isOpen={true}
                        onClose={() => setViewQuestionsData(null)}
                        title={viewQuestionsData.title}
                        questions={viewQuestionsData.questions}
                        responses={isStudent ? viewQuestionsData.responses.filter((r: any) => r.studentId === user.id) : undefined}
                        showCorrectAnswers={true}
                    />
                )
            }

            {
                viewAnalyticsData && (
                    <StudentAnalyticsModal
                        isOpen={true}
                        onClose={() => setViewAnalyticsData(null)}
                        assessment={viewAnalyticsData}
                        type="ASSESSMENT"
                    />
                )
            }
        </div >
    );
}
