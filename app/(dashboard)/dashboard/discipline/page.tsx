"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Plus, Search, User, MoreVertical, AlertTriangle, CheckCircle2, Loader2, MessageSquare, GraduationCap, ArrowRight, Save } from "lucide-react";
import { toast } from "react-hot-toast";

export default function DisciplinePage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [updatingMark, setUpdatingMark] = useState<string | null>(null);

    async function fetchData() {
        try {
            const res = await fetch("/api/discipline");
            const d = await res.json();
            setData(d);
        } catch (err) {
            toast.error("Failed to sync disciplinary data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    async function handleUpdateMark(studentId: string, marks: number) {
        if (marks < 0 || marks > 40) {
            toast.error("Protocol Error: Marks must be between 0 and 40.");
            return;
        }

        setUpdatingMark(studentId);
        try {
            const res = await fetch("/api/discipline", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId, marks: Number(marks) }),
            });
            if (!res.ok) throw new Error("Synchronization failure.");
            toast.success("Discipline Record Synchronized.");
            fetchData();
        } catch (err) {
            toast.error("Failed to commit mark update.");
        } finally {
            setUpdatingMark(null);
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Conduct Data...</p>
            </div>
        );
    }

    const filteredClasses = data?.classes.filter((c: any) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Conduct Intelligence</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-emerald-600">Institutional average conduct node: <span className="text-slate-900">{data?.schoolAverage} / 40.0</span></p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                        placeholder="Filter Class Nodes..."
                        className="w-full bg-white border border-slate-100 rounded-[1.5rem] pl-12 pr-6 py-4 text-xs font-bold focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all shadow-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredClasses?.map((cls: any) => (
                    <div
                        key={cls.id}
                        className={`bg-white rounded-[3rem] border transition-all overflow-hidden cursor-pointer group shadow-sm hover:shadow-2xl ${selectedClassId === cls.id ? 'ring-4 ring-emerald-500/10 border-emerald-500' : 'border-slate-100'
                            }`}
                        onClick={() => setSelectedClassId(selectedClassId === cls.id ? null : cls.id)}
                    >
                        <div className="p-8 space-y-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{cls.name}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{cls.users.length} Student Nodes</p>
                                </div>
                                <div className={`px-4 py-2 rounded-xl text-xs font-black ${Number(cls.averageDiscipline) > 35 ? 'bg-emerald-50 text-emerald-600' :
                                        Number(cls.averageDiscipline) > 25 ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
                                    }`}>
                                    {cls.averageDiscipline} AVG
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                                    Manage Records <ArrowRight className="w-3 h-3" />
                                </span>
                            </div>
                        </div>

                        {selectedClassId === cls.id && (
                            <div className="bg-slate-50/50 border-t border-slate-100 p-8 space-y-4 animate-fade-in max-h-[400px] overflow-y-auto">
                                {cls.users.map((student: any) => (
                                    <div key={student.id} className="bg-white p-5 rounded-2xl flex items-center justify-between border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white text-xs font-black">
                                                {student.firstName[0]}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm whitespace-nowrap">{student.firstName} {student.lastName}</p>
                                                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest text-xs">Current: {student.disciplineMarks}/40</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                min="0"
                                                max="40"
                                                defaultValue={student.disciplineMarks}
                                                className="w-16 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-black text-center outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white"
                                                onBlur={(e) => {
                                                    const val = parseInt(e.target.value);
                                                    if (val !== student.disciplineMarks) {
                                                        handleUpdateMark(student.id, val);
                                                    }
                                                }}
                                                disabled={updatingMark === student.id}
                                            />
                                            {updatingMark === student.id && <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
