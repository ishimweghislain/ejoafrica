"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, AlertTriangle, CheckCircle2, Loader2, MessageSquare, User, Calendar, History, TrendingDown } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ChildrenDisciplinePage() {
    const [loading, setLoading] = useState(true);
    const [children, setChildren] = useState<any[]>([]);
    const [selectedChild, setSelectedChild] = useState<any>(null);
    const [reports, setReports] = useState<any[]>([]);
    const [fetchingReports, setFetchingReports] = useState(false);

    async function fetchChildren() {
        try {
            const res = await fetch("/api/auth/me");
            const user = await res.json();

            if (user.role === "STUDENT") {
                // For students, their "children" list is just themselves
                const selfRes = await fetch(`/api/users/${user.id}`);
                const selfData = await selfRes.json();
                setChildren([selfData]);
                handleSelectChild(selfData);
            } else {
                // Re-fetch parent with children expanded
                const parentRes = await fetch(`/api/users/${user.id}`);
                const parentData = await parentRes.json();

                setChildren(parentData.children || []);
                if (parentData.children?.length > 0) {
                    handleSelectChild(parentData.children[0]);
                }
            }
        } catch (err) {
            toast.error("Failed to load data.");
        } finally {
            setLoading(false);
        }
    }

    async function handleSelectChild(child: any) {
        setSelectedChild(child);
        setFetchingReports(true);
        try {
            const res = await fetch(`/api/discipline/${child.id}`);
            const data = await res.json();
            setReports(data.disciplinaryReports || []);
            // Update the selected child object with latest marks
            setSelectedChild({ ...child, disciplineMarks: data.disciplineMarks });
        } catch (err) {
            toast.error("Failed to load discipline history.");
        } finally {
            setFetchingReports(false);
        }
    }

    useEffect(() => {
        fetchChildren();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading disciplinary data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-up">
            <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">Children's Discipline</h1>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-emerald-600">Monitor and track your children's conduct and disciplinary status.</p>
            </div>

            {children.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Children List */}
                    <div className="lg:col-span-1 space-y-4">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-4 mb-2">Select Child Node</p>
                        {children.map(child => (
                            <button
                                key={child.id}
                                onClick={() => handleSelectChild(child)}
                                className={`w-full p-6 rounded-[2rem] border transition-all flex items-center gap-4 ${selectedChild?.id === child.id
                                    ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-[1.02]'
                                    : 'bg-white border-slate-100 text-slate-900 hover:border-emerald-200'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs ${selectedChild?.id === child.id ? 'bg-white/10' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    {child.firstName[0]}
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-sm uppercase italic leading-tight">{child.firstName}</p>
                                    <p className={`text-[8px] font-bold uppercase tracking-widest ${selectedChild?.id === child.id ? 'text-slate-400' : 'text-slate-400'
                                        }`}>{child.lastName}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {selectedChild && (
                            <>
                                {/* Discipline Score Card */}
                                <div className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm flex flex-col md:flex-row items-center gap-10">
                                    <div className="relative">
                                        <div className={`w-32 h-32 rounded-full border-[6px] flex flex-col items-center justify-center ${selectedChild.disciplineMarks > 35 ? 'border-emerald-500 text-emerald-600' :
                                            selectedChild.disciplineMarks > 25 ? 'border-orange-500 text-orange-600' : 'border-red-500 text-red-600'
                                            }`}>
                                            <span className="text-3xl font-black italic">{selectedChild.disciplineMarks}</span>
                                            <span className="text-[8px] font-black uppercase tracking-widest opacity-60">/ 40 PTS</span>
                                        </div>
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-4 py-1.5 rounded-full border border-slate-100 shadow-sm whitespace-nowrap">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Current Conduct</p>
                                        </div>
                                    </div>

                                    <div className="flex-grow space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">{selectedChild.firstName}'s Conduct Report</h2>
                                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedChild.disciplineMarks > 35 ? 'bg-emerald-50 text-emerald-600' :
                                                selectedChild.disciplineMarks > 25 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                                                }`}>
                                                {selectedChild.disciplineMarks > 35 ? 'Excellent' : selectedChild.disciplineMarks > 25 ? 'Satisfactory' : 'Needs Correction'}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                                            This score represents the current disciplinary standing of the student. High marks indicate consistent adherence to school protocols and positive behavioral engagement.
                                        </p>
                                        <div className="flex gap-4">
                                            <div className="bg-slate-50 px-4 py-3 rounded-2xl flex items-center gap-3">
                                                <History className="w-4 h-4 text-slate-400" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">{reports.length} Incidents Recorded</span>
                                            </div>
                                            <div className="bg-slate-50 px-4 py-3 rounded-2xl flex items-center gap-3">
                                                <TrendingDown className="w-4 h-4 text-slate-400" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">{40 - selectedChild.disciplineMarks} Points Deducted</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Incident History */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 ml-4">
                                        <MessageSquare className="w-5 h-5 text-emerald-600" />
                                        <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">Disciplinary Timeline</h3>
                                    </div>

                                    {fetchingReports ? (
                                        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-20 flex flex-col items-center justify-center gap-4">
                                            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Syncing history...</p>
                                        </div>
                                    ) : reports.length > 0 ? (
                                        <div className="space-y-4">
                                            {reports.map((report, idx) => (
                                                <div key={report.id} className="bg-white rounded-[2rem] border border-slate-100 p-6 flex items-start gap-6 hover:shadow-lg transition-all group">
                                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                                        <AlertTriangle className="w-6 h-6" />
                                                    </div>
                                                    <div className="flex-grow space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <h4 className="font-black text-slate-900 uppercase italic text-sm tracking-tight">{report.description}</h4>
                                                                <span className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-slate-100 text-slate-400 rounded">Category Node</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                {new Date(report.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                                            {report.remarks || "No additional remarks provided for this incident node."}
                                                        </p>
                                                        <div className="pt-2 flex items-center gap-2">
                                                            <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[7px] font-black text-slate-400">
                                                                {report.reporter.firstName[0]}
                                                            </div>
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Recorded by {report.reporter.role}: {report.reporter.firstName} {report.reporter.lastName}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 rounded-[4rem] border border-dashed border-slate-200 p-20 flex flex-col items-center justify-center gap-6">
                                            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm">
                                                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                            </div>
                                            <div className="text-center space-y-2">
                                                <h4 className="font-black text-xl text-slate-900 uppercase italic tracking-tighter">Perfect Track Record</h4>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 max-w-xs leading-relaxed"> No disciplinary incidents detected in the current academic protocols.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="py-40 flex flex-col items-center gap-6 bg-slate-50 rounded-[4rem] border border-dashed border-slate-200">
                    <User className="w-16 h-16 text-slate-200" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No child nodes linked to this account node.</p>
                </div>
            )}
        </div>
    );
}
