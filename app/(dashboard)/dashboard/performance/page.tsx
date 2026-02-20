"use client";

import { useState, useEffect } from "react";
import {
    TrendingUp, Award, ClipboardList, Radio,
    ArrowUpRight, ArrowDownRight, Target, Brain,
    Loader2, ChevronRight, User, Search
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function PerformancePage() {
    const [user, setUser] = useState<any>(null);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [assessments, setAssessments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    async function fetchData() {
        setLoading(true);
        try {
            const [uRes, asRes, lvRes] = await Promise.all([
                fetch("/api/auth/me"),
                fetch("/api/assignments"),
                fetch("/api/live-assessments")
            ]);
            const uData = await uRes.json();
            const asData = await asRes.json();
            const lvData = await lvRes.json();

            setUser(uData);
            setAssignments(Array.isArray(asData) ? asData : []);
            setAssessments(Array.isArray(lvData) ? lvData : []);
        } catch (err) {
            toast.error("Failed to load performance data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const isTeacher = user?.role === "TEACHER";
    const isDOS = user?.role === "DOS" || user?.role === "SCHOOL_ADMIN";
    const isParent = user?.role === "PARENT";
    const isStudent = user?.role === "STUDENT";

    const getStudentStats = (studentId: string) => {
        const studentSubmissions = assignments.flatMap(a =>
            a.submissions.filter((s: any) => s.studentId === studentId).map((s: any) => ({
                ...s,
                totalPossible: a.questions.reduce((sum: number, q: any) => sum + q.marks, 0)
            }))
        );

        const studentResponses = assessments.flatMap(a => {
            const resps = a.responses.filter((r: any) => r.studentId === studentId);
            if (resps.length === 0) return [];
            return [{
                score: resps.reduce((acc: number, cur: any) => acc + cur.marksObtained, 0),
                totalPossible: a.questions.reduce((sum: number, q: any) => sum + q.marks, 0)
            }];
        });

        const assignmentAvg = studentSubmissions.length > 0
            ? (studentSubmissions.reduce((acc, s) => acc + (s.score / (s.totalPossible || 1)), 0) / studentSubmissions.length) * 100
            : 0;

        const assessmentAvg = studentResponses.length > 0
            ? (studentResponses.reduce((acc, r) => acc + (r.score / (r.totalPossible || 1)), 0) / studentResponses.length) * 100
            : 0;

        const combinedAvg = (assignmentAvg + assessmentAvg) / ((assignmentAvg > 0 && assessmentAvg > 0) ? 2 : 1);

        return { assignmentAvg, assessmentAvg, combinedAvg, submissionCount: studentSubmissions.length, responseCount: studentResponses.length };
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <Loader2 className="w-16 h-16 animate-spin text-emerald-600" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Analyzing Performance Data...</p>
            </div>
        );
    }

    if (isStudent && user) {
        const stats = getStudentStats(user.id);
        return (
            <div className="space-y-12 animate-fade-up pb-20">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase italic">My Performance</h1>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">Academic growth and score analytics.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <StatCard title="Assignment Average" value={`${Math.round(stats.assignmentAvg)}%`} sub={`${stats.submissionCount} Submissions`} icon={<ClipboardList className="w-6 h-6" />} color="emerald" />
                    <StatCard title="Assessment Average" value={`${Math.round(stats.assessmentAvg)}%`} sub={`${stats.responseCount} Completed`} icon={<Radio className="w-6 h-6" />} color="blue" />
                    <StatCard title="Overall Grade" value={`${Math.round(stats.combinedAvg)}%`} sub="Cumulative weighted score" icon={<Award className="w-6 h-6" />} color="indigo" />
                </div>
                <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="flex items-center gap-6 mb-12">
                        <div className="w-16 h-16 bg-slate-900 text-white rounded-[1.5rem] flex items-center justify-center shadow-xl">
                            <Brain className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Skill Mastery</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance breakdown across domains.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 italic">Assignment Progress</h4>
                            <div className="space-y-6">
                                {assignments.filter(a => a.submissions.some((s: any) => s.studentId === user.id)).slice(0, 5).map(a => {
                                    const sub = a.submissions.find((s: any) => s.studentId === user.id);
                                    const total = a.questions.reduce((sum: any, q: any) => sum + q.marks, 0);
                                    const percent = (sub.score / (total || 1)) * 100;
                                    return (
                                        <div key={a.id} className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase italic">
                                                <span className="text-slate-900">{a.title}</span>
                                                <span className="text-emerald-600">{Math.round(percent)}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${percent}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="space-y-8">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 italic">Assessment Precision</h4>
                            <div className="space-y-6">
                                {assessments.filter(a => a.responses.some((r: any) => r.studentId === user.id)).slice(0, 5).map(a => {
                                    const resps = a.responses.filter((r: any) => r.studentId === user.id);
                                    const score = resps.reduce((acc: any, cur: any) => acc + cur.marksObtained, 0);
                                    const total = a.questions.reduce((sum: any, q: any) => sum + q.marks, 0);
                                    const percent = (score / (total || 1)) * 100;
                                    return (
                                        <div key={a.id} className="space-y-2">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase italic">
                                                <span className="text-slate-900">{a.title}</span>
                                                <span className="text-blue-600">{Math.round(percent)}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percent}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Teacher / DOS / Parent View: Student List with their Averages
    if (isTeacher || isDOS || isParent) {
        // Collect students from submissions and responses
        const studentMap = new Map();

        if (isParent && user.children) {
            // For parents, we start with their children
            user.children.forEach((c: any) => studentMap.set(c.id, c));
        } else {
            // For staff, we collect everyone who has activity
            assignments.flatMap(a => a.submissions).forEach(s => {
                if (!studentMap.has(s.studentId)) studentMap.set(s.studentId, s.student);
            });
            assessments.flatMap(a => a.responses).forEach(r => {
                if (!studentMap.has(r.studentId)) studentMap.set(r.studentId, r.student);
            });
        }

        const studentList = Array.from(studentMap.values()).map(s => ({
            ...s,
            stats: getStudentStats(s.id)
        })).filter(s =>
            `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <div className="space-y-12 animate-fade-up pb-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase italic">
                            {isParent ? "Children's Performance" : "Performance Hub"}
                        </h1>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest italic">
                            {isParent ? "Monitoring academic growth of linked child nodes." : "Monitoring student growth and institutional standards."}
                        </p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-100 rounded-3xl pl-16 pr-8 py-4 text-xs font-black outline-none focus:ring-8 focus:ring-emerald-500/5 transition-all text-slate-900"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Students"
                        value={studentMap.size.toString()}
                        sub="In system"
                        icon={<User className="w-6 h-6" />}
                        color="slate"
                    />
                    <StatCard
                        title="Average Performance"
                        value={`${Math.round(studentList.reduce((acc, s) => acc + s.stats.combinedAvg, 0) / (studentList.length || 1))}%`}
                        sub="Institutional Average"
                        icon={<Target className="w-6 h-6" />}
                        color="emerald"
                    />
                </div>

                <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] italic border-b border-slate-100">
                                <th className="px-10 py-8 text-left">Student Profile</th>
                                <th className="px-10 py-8 text-left">Assignment Avg</th>
                                <th className="px-10 py-8 text-left">Assessment Avg</th>
                                <th className="px-10 py-8 text-left">Overall</th>
                                <th className="px-10 py-8 text-right">Trend</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {studentList.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50/30 transition-colors group">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-sm text-slate-400 uppercase italic">
                                                {s.firstName[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 uppercase italic tracking-tighter">{s.firstName} {s.lastName}</p>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{s.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-[11px] font-black text-emerald-600 italic">{Math.round(s.stats.assignmentAvg)}%</p>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.stats.submissionCount} Done</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <p className="text-[11px] font-black text-blue-600 italic">{Math.round(s.stats.assessmentAvg)}%</p>
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.stats.responseCount} Done</p>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-3">
                                            <div className="text-base font-black text-slate-900 italic">{Math.round(s.stats.combinedAvg)}%</div>
                                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-slate-900 rounded-full" style={{ width: `${s.stats.combinedAvg}%` }}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        {s.stats.combinedAvg >= 70 ? (
                                            <div className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 text-[10px] font-black uppercase italic">
                                                High <ArrowUpRight className="w-3 h-3" />
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-1.5 text-orange-600 bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100 text-[10px] font-black uppercase italic">
                                                Med <ArrowDownRight className="w-3 h-3" />
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return null;
}

function StatCard({ title, value, sub, icon, color }: any) {
    const colorClasses: any = {
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        slate: "bg-slate-50 text-slate-600 border-slate-100",
    };

    return (
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl flex flex-col gap-6 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500">
            <div className={`w-14 h-14 ${colorClasses[color]} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 italic opacity-70">{title}</p>
                <p className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">{value}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 bg-slate-50 w-fit px-3 py-1 rounded-lg border border-slate-100">{sub}</p>
            </div>
            <div className={`absolute top-0 right-0 w-24 h-24 ${color === 'emerald' ? 'bg-emerald-500/5' : color === 'blue' ? 'bg-blue-500/5' : 'bg-indigo-500/5'} rounded-full -mr-12 -mt-12 blur-2xl`}></div>
        </div>
    );
}
