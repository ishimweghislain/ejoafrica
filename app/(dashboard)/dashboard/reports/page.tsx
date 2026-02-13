"use client";

import { useState } from "react";
import { FileText, Download, Filter, Search, BarChart3, PieChart, TrendingUp, Users, BookOpen, Calendar, Loader2 } from "lucide-react";

export default function ReportsPage() {
    const [loading, setLoading] = useState(false);

    const reports = [
        { id: 1, title: "Academic Performance Summary", category: "Academic", date: "2026-02-05", type: "PDF" },
        { id: 2, title: "Course Coverage Report", category: "Curriculum", date: "2026-02-04", type: "XLS" },
        { id: 3, title: "Attendance Analytics", category: "Operations", date: "2026-02-04", type: "PDF" },
        { id: 4, title: "Teacher Workload Analysis", category: "Staff", date: "2026-02-03", type: "PDF" },
    ];

    const stats = [
        { label: "Overall GPA", value: "3.4", trend: "+0.2", icon: <TrendingUp className="w-5 h-5" /> },
        { label: "Course Completion", value: "84%", trend: "+5%", icon: <BookOpen className="w-5 h-5" /> },
        { label: "Daily Attendance", value: "92%", trend: "-1%", icon: <Users className="w-5 h-5" /> },
    ];

    return (
        <div className="space-y-10 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase tracking-tighter">Academic Intelligence</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-emerald-600">Generate and analyze institutional performance metrics.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-slate-100 rounded-2xl px-6 py-4 font-black uppercase tracking-widest text-[9px] hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <span>Filter Protocol</span>
                    </button>
                    <button className="bg-slate-900 text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[9px] hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/10">
                        <BarChart3 className="w-4 h-4" />
                        <span>Real-time Analytics</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="bg-slate-50 p-3 rounded-xl text-slate-900">
                                {stat.icon}
                            </div>
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                            <h4 className="text-3xl font-black text-slate-900">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-500 p-3 rounded-xl text-white">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-black uppercase tracking-widest text-xs text-slate-900">Data Archives</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Available institutional reports.</p>
                        </div>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input className="w-full bg-slate-50/50 border-none rounded-xl pl-10 pr-4 py-3 text-xs font-bold outline-none" placeholder="Search Archives..." />
                    </div>
                </div>

                <div className="divide-y divide-slate-50">
                    {reports.map((report) => (
                        <div key={report.id} className="p-8 hover:bg-slate-50/50 transition-all flex items-center justify-between group">
                            <div className="flex items-center gap-6">
                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-600 transition-colors uppercase">{report.title}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">{report.category}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-1">
                                            <Calendar className="w-2.5 h-2.5" />
                                            {report.date}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-[9px] font-black px-3 py-1 rounded-md border ${report.type === 'PDF' ? 'border-red-100 text-red-500 bg-red-50' : 'border-emerald-100 text-emerald-600 bg-emerald-50'}`}>
                                    {report.type}
                                </span>
                                <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
