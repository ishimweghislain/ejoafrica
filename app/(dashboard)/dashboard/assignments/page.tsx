"use client";

import { useState, useEffect } from "react";
import {
    Plus, Search, Filter, ClipboardList, Clock,
    ArrowRight, Book, Loader2, User, ChevronRight,
    CheckCircle2, AlertCircle, Eye, Printer, FileText,
    TrendingUp, Award, Play, Trash2
} from "lucide-react";
import AssignmentModal from "@/components/AssignmentModal";
import TakeAssignmentModal from "@/components/TakeAssignmentModal";
import ViewQuestionsModal from "@/components/ViewQuestionsModal";
import StudentAnalyticsModal from "@/components/StudentAnalyticsModal";
import { toast } from "react-hot-toast";

export default function AssignmentsPage() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isTakeModalOpen, setIsTakeModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
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
                fetch("/api/assignments")
            ]);
            const uData = await uRes.json();
            const aData = await aRes.json();
            setUser(uData);
            setAssignments(Array.isArray(aData) ? aData : []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to sync assignment data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const filteredAssignments = assignments.filter(a => {
        const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.course.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterBy === "ALL" || a.course.title.toUpperCase() === filterBy.toUpperCase();
        return matchesSearch && matchesFilter;
    });

    const subjects = ["ALL", ...new Set(assignments.map(a => a.course.title))];

    const isTeacher = user?.role === "TEACHER";
    const isStudent = user?.role === "STUDENT";
    const isParent = user?.role === "PARENT";
    const isDOS = user?.role === "DOS" || user?.role === "SCHOOL_ADMIN";

    const printReports = (assignment: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const submissionsHtml = assignment.submissions.map((s: any) => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px; font-size: 14px;">${s.student.firstName} ${s.student.lastName}</td>
                <td style="padding: 12px; font-size: 14px;">${s.score} / ${assignment.questions.reduce((acc: number, q: any) => acc + q.marks, 0)}</td>
                <td style="padding: 12px; font-size: 14px; font-weight: bold; color: ${s.status === 'CHEATING' ? 'darkred' : s.status === 'LATE' ? 'red' : 'green'}">
                    ${s.status === 'CHEATING' ? '⚠️ CHEATED' : s.status}
                </td>
                <td style="padding: 12px; font-size: 12px; color: #666;">${new Date(s.createdAt).toLocaleDateString()}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Assignment Report - ${assignment.title}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background: #f9f9f9; text-align: left; padding: 12px; border-bottom: 2px solid #ddd; }
                        .header { margin-bottom: 40px; border-bottom: 4px solid #10b981; padding-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1 style="margin: 0; text-transform: uppercase; letter-spacing: -1px;">Assessment Report</h1>
                        <p style="color: #666; font-weight: bold; margin-top: 5px;">${assignment.title} | ${assignment.course.title} | ${assignment.class.name}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Score Achieved</th>
                                <th>Status</th>
                                <th>Completion Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${submissionsHtml}
                        </tbody>
                    </table>
                    <div style="margin-top: 40px; font-size: 12px; color: #999; text-align: center;">
                        Generated by Eshuri Curriculum Engine Dashboard
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="space-y-12 animate-fade-up">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase tracking-tighter italic">Assignments</h1>
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">View and manage school assignments.</p>
                    </div>
                </div>
                {isTeacher && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-slate-900 text-white rounded-3xl px-10 py-5 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/10 hover:bg-emerald-600 hover:scale-105 transition-all flex items-center justify-center gap-4"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Assignment</span>
                    </button>
                )}
            </div>

            {/* Analytical Cards (Small indicators) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <TrendingUp className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active assignments</p>
                        <p className="text-2xl font-black text-slate-900 italic">{assignments.length}</p>
                    </div>
                </div>
                {isStudent && (
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <Clock className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Need to do</p>
                            <p className="text-2xl font-black text-slate-900 italic">{assignments.filter(a => !a.submissions.some((s: any) => s.studentId === user.id)).length}</p>
                        </div>
                    </div>
                )}
                {isTeacher && (
                    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5">
                        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Submissions</p>
                            <p className="text-2xl font-black text-slate-900 italic">{assignments.reduce((acc, a) => acc + a.submissions.length, 0)}</p>
                        </div>
                    </div>
                )}
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
                        placeholder="Search assignments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-50 rounded-[1.8rem] pl-14 pr-8 py-4 text-xs font-black outline-none focus:bg-white focus:ring-8 focus:ring-emerald-500/5 transition-all text-slate-900 placeholder:text-slate-300"
                    />
                </div>
            </div>

            {/* Main Assignment Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8 pb-20">
                {loading ? (
                    <div className="col-span-full py-40 flex flex-col items-center gap-6">
                        <Loader2 className="w-16 h-16 animate-spin text-emerald-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Syncing assignments...</p>
                    </div>
                ) : filteredAssignments.length > 0 ? (
                    filteredAssignments.map(a => {
                        const studentSubmission = isStudent ? a.submissions.find((s: any) => s.studentId === user.id) : null;
                        const isExpired = a.deadline && new Date() > new Date(a.deadline);
                        const canTake = isStudent && !studentSubmission && !isExpired;

                        return (
                            <div key={a.id} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col gap-8">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-900/[0.02] rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/5 transition-colors"></div>

                                <div className="space-y-6 flex-grow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                                                <ClipboardList className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1">{a.course.title}</h4>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[9px] font-black px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 uppercase tracking-widest border border-slate-100">
                                                        {a.class.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {(isTeacher || isDOS) && (
                                            <div className="flex gap-2">
                                                {isTeacher && (
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm("Are you sure you want to delete this assignment?")) {
                                                                try {
                                                                    const res = await fetch(`/api/assignments/${a.id}`, { method: 'DELETE' });
                                                                    if (res.ok) {
                                                                        toast.success("Assignment deleted");
                                                                        fetchData();
                                                                    }
                                                                } catch (err) {
                                                                    toast.error("Failed to delete");
                                                                }
                                                            }
                                                        }}
                                                        className="p-3 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all"
                                                        title="Delete Assignment"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => printReports(a)}
                                                    className="p-3 bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-2xl transition-all"
                                                    title="Print Marks PDF"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-emerald-600 transition-colors tracking-tighter uppercase italic">
                                            {a.title}
                                        </h3>
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-relaxed line-clamp-2">
                                            {a.description || "No special instructions given."}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50/50 p-4 rounded-3xl flex items-center gap-4 border border-slate-100/50">
                                            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm border border-slate-50">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Structure</p>
                                                <p className="text-[10px] font-black text-slate-900 lowercase">{a.questions.length} Questions</p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50/50 p-4 rounded-3xl flex items-center gap-4 border border-slate-100/50">
                                            <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm border border-slate-50">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Due Date</p>
                                                <p className="text-[10px] font-black text-slate-900 uppercase">
                                                    {a.deadline ? new Date(a.deadline).toLocaleDateString('en-GB') : "No Limit"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-50 mt-auto">
                                    {isStudent && (
                                        <>
                                            {studentSubmission ? (
                                                <div className="bg-emerald-50 p-6 rounded-[2rem] flex items-center justify-between border border-emerald-100 group/status">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                            <CheckCircle2 className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Score</p>
                                                            <p className="text-xl font-black text-slate-900 italic">{studentSubmission.score} Pts</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-[8px] font-black uppercase text-slate-400">Status</span>
                                                        <span className={`text-[10px] font-black uppercase italic ${studentSubmission.status === 'LATE' ? 'text-red-500' : 'text-emerald-600'}`}>{studentSubmission.status === 'CHEATING' ? '🚩 CHEATED' : studentSubmission.status}</span>
                                                    </div>
                                                </div>
                                            ) : isExpired ? (
                                                <div className="bg-red-50 p-6 rounded-[2rem] flex items-center gap-4 border border-red-100 text-red-700">
                                                    <AlertCircle className="w-6 h-6" />
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase tracking-widest">Closed</p>
                                                        <p className="text-[8px] font-black uppercase italic opacity-70">The deadline has passed.</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => { setSelectedAssignment(a); setIsTakeModalOpen(true); }}
                                                    className="w-full bg-slate-900 text-white p-5 rounded-[2rem] flex items-center justify-between group/take hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-200"
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] ml-4">Start Now</span>
                                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover/take:bg-white group-hover/take:text-emerald-600 transition-all">
                                                        <Play className="w-5 h-5 fill-current" />
                                                    </div>
                                                </button>
                                            )}
                                        </>
                                    )}

                                    {(isTeacher || isDOS || isParent) && (
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <User className="w-4 h-4 text-slate-300" />
                                                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic">Author: {a.teacher.firstName} {a.teacher.lastName}</p>
                                                </div>
                                                <div className="flex -space-x-3">
                                                    {a.submissions.slice(0, 3).map((s: any, i: number) => (
                                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400 overflow-hidden uppercase">
                                                            {s.student.firstName[0]}
                                                        </div>
                                                    ))}
                                                    {a.submissions.length > 3 && (
                                                        <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-900 flex items-center justify-center text-[8px] font-black text-white uppercase italic">
                                                            +{a.submissions.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {isParent ? (
                                                <div className="space-y-3">
                                                    {/* Check which child this belongs to */}
                                                    {user.children.filter((c: any) => c.classId === a.classId).map((child: any) => {
                                                        const sub = a.submissions.find((s: any) => s.studentId === child.id);
                                                        return (
                                                            <div key={child.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black uppercase italic">
                                                                        {child.firstName[0]}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[9px] font-black uppercase text-slate-900">{child.firstName}</p>
                                                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{sub ? 'DONE' : 'PENDING'}</p>
                                                                    </div>
                                                                </div>
                                                                {sub ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="text-right">
                                                                            <p className="text-sm font-black text-emerald-600 italic">{sub.score} Pts</p>
                                                                            <p className="text-[8px] font-black text-slate-400 uppercase">{sub.status}</p>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => {
                                                                                const studentAnswers = a.questions.flatMap((q: any) =>
                                                                                    q.answers.filter((ans: any) => ans.studentId === child.id).map((ans: any) => ({
                                                                                        questionId: q.id,
                                                                                        answer: ans.answer,
                                                                                        isCorrect: ans.isCorrect
                                                                                    }))
                                                                                );
                                                                                setViewQuestionsData({ ...a, studentAnswers });
                                                                            }}
                                                                            className="p-2 bg-white text-slate-400 hover:text-emerald-600 rounded-lg border border-slate-100 shadow-sm"
                                                                        >
                                                                            <Eye className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-[9px] font-black text-red-400 uppercase italic">-- / --</p>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => printReports(a)}
                                                        className="flex-grow bg-slate-50 text-slate-900 p-5 rounded-[2rem] flex items-center justify-between hover:bg-slate-900 hover:text-white transition-all group/view border border-slate-100"
                                                    >
                                                        <span className="text-[10px] font-black uppercase tracking-widest ml-4 italic">View Reports</span>
                                                        <ArrowRight className="w-5 h-5 transform group-hover/view:translate-x-2 transition-all" />
                                                    </button>
                                                    {isTeacher && (
                                                        <button
                                                            onClick={() => setViewAnalyticsData(a)}
                                                            className="p-5 bg-slate-900 text-white rounded-[2rem] shadow-xl hover:bg-emerald-600 transition-all"
                                                        >
                                                            <TrendingUp className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    {(isTeacher || studentSubmission) && (
                                                        <button
                                                            onClick={() => {
                                                                const studentAnswers = studentSubmission ? a.questions.flatMap((q: any) =>
                                                                    q.answers.filter((ans: any) => ans.studentId === user.id).map((ans: any) => ({
                                                                        questionId: q.id,
                                                                        answer: ans.answer,
                                                                        isCorrect: ans.isCorrect
                                                                    }))
                                                                ) : undefined;
                                                                setViewQuestionsData({ ...a, studentAnswers });
                                                            }}
                                                            className="p-5 bg-indigo-600 text-white rounded-[2rem] shadow-xl hover:bg-indigo-700 transition-all"
                                                        >
                                                            <Eye className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-48 bg-white rounded-[4rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-10">
                        <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-200">
                            <ClipboardList className="w-16 h-16" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">No Assignments</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No assignments have been created yet.</p>
                            {isTeacher && (
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-200"
                                >
                                    Add Your First Assignment
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <AssignmentModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchData}
            />

            {selectedAssignment && (
                <TakeAssignmentModal
                    isOpen={isTakeModalOpen}
                    onClose={() => setIsTakeModalOpen(false)}
                    assignment={selectedAssignment}
                    onComplete={fetchData}
                />
            )}

            {viewQuestionsData && (
                <ViewQuestionsModal
                    isOpen={true}
                    onClose={() => setViewQuestionsData(null)}
                    title={viewQuestionsData.title}
                    questions={viewQuestionsData.questions}
                    responses={viewQuestionsData.studentAnswers}
                    showCorrectAnswers={isTeacher || isDOS || (isParent && viewQuestionsData.studentAnswers !== undefined)}
                />
            )}

            {viewAnalyticsData && (
                <StudentAnalyticsModal
                    isOpen={true}
                    onClose={() => setViewAnalyticsData(null)}
                    assessment={viewAnalyticsData}
                    type="ASSIGNMENT"
                />
            )}
        </div>
    );
}
