"use client";

import { useState, useEffect } from "react";
import {
    FileText, Search, BarChart3, TrendingUp, Users,
    BookOpen, Loader2, Printer, ChevronRight, Award,
    CheckCircle2, Clock, Map
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function ReportsPage() {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    async function fetchReports() {
        setLoading(true);
        try {
            const res = await fetch("/api/assignments");
            const data = await res.json();
            setAssignments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load reports.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchReports();
    }, []);

    const printReports = (assignment: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const submissionsHtml = assignment.submissions.map((s: any) => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px; font-size: 14px;">${s.student.firstName} ${s.student.lastName}</td>
                <td style="padding: 12px; font-size: 14px;">${s.score} / ${assignment.questions.reduce((acc: number, q: any) => acc + q.marks, 0)}</td>
                <td style="padding: 12px; font-size: 14px; font-weight: bold; color: ${s.status === 'LATE' ? 'red' : 'green'}">${s.status}</td>
                <td style="padding: 12px; font-size: 12px; color: #666;">${new Date(s.createdAt).toLocaleDateString()}</td>
            </tr>
        `).join('');

        printWindow.document.write(`
            <html>
                <head>
                    <title>Institutional Report - ${assignment.title}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #1e293b; }
                        table { width: 100%; border-collapse: collapse; margin-top: 30px; }
                        th { background: #f8fafc; text-align: left; padding: 15px; border-bottom: 2px solid #e2e8f0; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
                        td { padding: 15px; border-bottom: 1px solid #f1f5f9; }
                        .header { border-bottom: 5px solid #0f172a; padding-bottom: 20px; margin-bottom: 40px; }
                        .stat-box { display: inline-block; background: #f8fafc; padding: 15px; border-radius: 10px; margin-right: 20px; border: 1px solid #e2e8f0; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1 style="margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: -1px;">Assignment Report</h1>
                        <p style="margin: 5px 0 0; color: #64748b; font-weight: bold;">${assignment.title} | ${assignment.course.title} | ${assignment.class.name}</p>
                    </div>
                    <div style="margin-bottom: 30px;">
                        <div class="stat-box">
                            <span style="font-size: 10px; color: #64748b; text-transform: uppercase;">Avg Score</span><br/>
                            <span style="font-size: 20px; font-weight: 900;">${assignment.submissions.length > 0 ? (assignment.submissions.reduce((a: any, s: any) => a + s.score, 0) / assignment.submissions.length).toFixed(1) : 0}</span>
                        </div>
                        <div class="stat-box">
                            <span style="font-size: 10px; color: #64748b; text-transform: uppercase;">Participation</span><br/>
                            <span style="font-size: 20px; font-weight: 900;">${assignment.submissions.length} Students</span>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Student Name</th>
                                <th>Score</th>
                                <th>Status</th>
                                <th>Date Submitted</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${submissionsHtml}
                        </tbody>
                    </table>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const filtered = assignments.filter(a =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-12 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase tracking-tighter italic">Reports</h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-emerald-600">Performance summaries for all assignments.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                        placeholder="Filter reports..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-100 rounded-[2rem] pl-14 pr-8 py-5 text-xs font-black outline-none focus:ring-8 focus:ring-emerald-500/5 transition-all shadow-sm"
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-40 flex flex-col items-center gap-6">
                    <Loader2 className="w-16 h-16 animate-spin text-emerald-600" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Loading report data...</p>
                </div>
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
                    {filtered.map((a) => (
                        <div key={a.id} className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-slate-900/[0.02] rounded-full -mr-20 -mt-20 group-hover:bg-emerald-500/[0.03] transition-colors"></div>

                            <div className="space-y-8 flex-grow relative z-10">
                                <div className="flex items-center justify-between">
                                    <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform">
                                        <BarChart3 className="w-8 h-8" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black uppercase text-emerald-600 tracking-widest bg-emerald-50 px-3 py-1 rounded-lg inline-block mb-1">{a.course.title}</p>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-tight">{a.class.name}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic leading-tight group-hover:text-emerald-600 transition-colors">{a.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-3.5 h-3.5 text-slate-300" />
                                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Teacher: {a.teacher.firstName} {a.teacher.lastName}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100/50">
                                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Participation</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-black text-slate-900 italic">{a.submissions.length}</span>
                                            <span className="text-[10px] font-black text-slate-400">Total</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100/50">
                                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1">Mean Score</p>
                                        <div className="flex items-baseline gap-2 text-emerald-600">
                                            <span className="text-2xl font-black italic">
                                                {a.submissions.length > 0 ? (a.submissions.reduce((acc: any, s: any) => acc + s.score, 0) / a.submissions.length).toFixed(1) : '0.0'}
                                            </span>
                                            <span className="text-[10px] font-black opacity-60">Avg</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span>Completion Progress</span>
                                        <span className="text-slate-900">74%</span>
                                    </div>
                                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                        <div className="h-full bg-emerald-500 w-[74%] rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-10 mt-auto flex gap-3 relative z-10">
                                <button
                                    onClick={() => printReports(a)}
                                    className="flex-grow bg-slate-900 text-white rounded-[2rem] p-5 font-black uppercase tracking-widest text-[9px] hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/10"
                                >
                                    <Printer className="w-4 h-4" />
                                    <span>Print Report</span>
                                </button>
                                <button className="p-5 bg-slate-50 text-slate-400 hover:bg-white hover:text-slate-900 rounded-[2rem] border border-transparent hover:border-slate-100 transition-all">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="py-40 flex flex-col items-center justify-center text-center space-y-10">
                    <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-200">
                        <Map className="w-16 h-16" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-900 uppercase italic">No Reports</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No assignment data available yet.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
