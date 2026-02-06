"use client";

import { useState } from "react";
import { ShieldAlert, Plus, Search, User, MoreVertical, AlertTriangle, CheckCircle2, Loader2, MessageSquare } from "lucide-react";

export default function DisciplinePage() {
    const [loading, setLoading] = useState(false);

    const reports = [
        { id: 1, name: "Iradukunda John", class: "S5 PCM", infraction: "Late Arrival", date: "2026-02-05", status: "PENDING", severity: "LOW" },
        { id: 2, name: "Uwase Marie", class: "S4 HEG", infraction: "Uniform Violation", date: "2026-02-04", status: "RESOLVED", severity: "MEDIUM" },
    ];

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Disciplinary Intelligence</h1>
                    <p className="text-gray-500 text-sm font-medium">Monitor student conduct and academic integrity reports.</p>
                </div>
                <button className="btn-primary flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5" />
                    <span>New Incident</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <h3 className="font-black uppercase tracking-widest text-[10px] text-emerald-600">Active Reports</h3>
                        <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-gray-300" />
                            <input className="text-sm outline-none bg-transparent font-bold text-gray-400" placeholder="Quick Search..." />
                        </div>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {reports.map((report) => (
                            <div key={report.id} className="p-8 hover:bg-gray-50/50 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${report.severity === 'LOW' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                        <ShieldAlert className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{report.name}</h4>
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{report.class} • {report.infraction}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-bold text-gray-600">{report.date}</p>
                                        <span className={`text-[9px] font-black tracking-widest uppercase ${report.status === 'RESOLVED' ? 'text-emerald-500' : 'text-orange-500 animate-pulse'}`}>
                                            {report.status}
                                        </span>
                                    </div>
                                    <button className="p-2 hover:bg-white rounded-xl text-gray-300 hover:text-emerald-600 transition-all border border-transparent hover:border-gray-50">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-900 rounded-[3rem] p-10 text-white space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>

                    <div className="relative z-10 space-y-6">
                        <div className="bg-white/10 w-fit p-4 rounded-2xl border border-white/10">
                            <AlertTriangle className="w-8 h-8 text-orange-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black">Parental Guard</h3>
                            <p className="text-sm text-gray-400 font-medium leading-relaxed">Instantly communicate severe infractions to registered parent/guardian nodes.</p>
                        </div>

                        <div className="space-y-4 pt-6">
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
                                <MessageSquare className="w-5 h-5 text-emerald-400" />
                                <div>
                                    <p className="text-xs font-bold">Broadcast Warning</p>
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">To 12 Guardian Nodes</p>
                                </div>
                            </div>
                            <button className="w-full bg-emerald-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20">
                                Execute Protocol
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
