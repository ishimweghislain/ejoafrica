"use client";

import { useState, useEffect } from "react";
import {
    ShieldAlert, Search, Loader2, Trophy,
    AlertTriangle, TrendingUp, TrendingDown, Users,
    ChevronDown, ChevronUp, Star, Save, BarChart2
} from "lucide-react";
import { toast } from "react-hot-toast";

function markColor(m: number) {
    if (m >= 35) return { bg: "bg-emerald-100", text: "text-emerald-700", bar: "bg-emerald-500", light: "bg-emerald-50" };
    if (m >= 25) return { bg: "bg-amber-100", text: "text-amber-700", bar: "bg-amber-400", light: "bg-amber-50" };
    return { bg: "bg-red-100", text: "text-red-600", bar: "bg-red-500", light: "bg-red-50" };
}

function MarkBadge({ marks }: { marks: number }) {
    const c = markColor(marks);
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${c.bg} ${c.text}`}>
            {marks >= 35 ? <Star className="w-3 h-3" /> : marks >= 25 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {marks} / 40
        </span>
    );
}

export default function DisciplineMarksPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [expandedClass, setExpandedClass] = useState<string | null>(null);
    const [localMarks, setLocalMarks] = useState<Record<string, number>>({});
    const [saving, setSaving] = useState<string | null>(null);

    async function fetchData() {
        try {
            const res = await fetch("/api/discipline");
            const d = await res.json();
            setData(d);
            const marks: Record<string, number> = {};
            (d.classes || []).forEach((cls: any) => {
                (cls.users || []).forEach((s: any) => {
                    marks[s.id] = s.disciplineMarks ?? 40;
                });
            });
            setLocalMarks(marks);
        } catch {
            toast.error("Failed to load discipline data.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchData(); }, []);

    async function saveMark(studentId: string) {
        const marks = localMarks[studentId];
        if (marks === undefined || marks < 0 || marks > 40) {
            toast.error("Marks must be between 0 and 40.");
            return;
        }
        setSaving(studentId);
        try {
            const res = await fetch("/api/discipline", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId, marks }),
            });
            if (!res.ok) throw new Error("Failed");
            toast.success("Mark saved!");
            await fetchData();
        } catch {
            toast.error("Could not save mark.");
        } finally {
            setSaving(null);
        }
    }

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading discipline records...</p>
        </div>
    );

    const allStudents: any[] = (data?.classes || []).flatMap((c: any) =>
        (c.users || []).map((s: any) => ({ ...s, className: c.name }))
    );
    const bestStudents = [...allStudents]
        .sort((a, b) => (b.disciplineMarks ?? 0) - (a.disciplineMarks ?? 0))
        .slice(0, 3);
    const atRisk = [...allStudents]
        .filter(s => (s.disciplineMarks ?? 40) < 25)
        .sort((a, b) => (a.disciplineMarks ?? 0) - (b.disciplineMarks ?? 0));
    const schoolAvg = parseFloat(data?.schoolAverage || "0");

    const filteredClasses = (data?.classes || []).filter((c: any) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.users || []).some((s: any) =>
            `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase())
        )
    );

    return (
        <div className="space-y-10 animate-fade-up">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Discipline Marks</h1>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mt-1">
                        School average: <span className="text-slate-900">{data?.schoolAverage} / 40</span>
                    </p>
                </div>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                        className="bg-white border border-slate-100 rounded-2xl pl-10 pr-6 py-4 text-xs font-semibold outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-sm w-72 focus:border-emerald-400 transition-all"
                        placeholder="Search class or student..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 rounded-[2rem] p-6 text-white">
                    <Users className="w-5 h-5 text-emerald-400 mb-3" />
                    <p className="text-3xl font-black">{allStudents.length}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Total Students</p>
                </div>
                <div className={`rounded-[2rem] p-6 border ${markColor(schoolAvg).light} ${markColor(schoolAvg).text}`}>
                    <BarChart2 className="w-5 h-5 mb-3 opacity-70" />
                    <p className="text-3xl font-black">{data?.schoolAverage}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">School Average</p>
                </div>
                <div className="bg-emerald-50 rounded-[2rem] p-6 border border-emerald-100">
                    <Trophy className="w-5 h-5 text-emerald-600 mb-3" />
                    <p className="text-3xl font-black text-emerald-700">{allStudents.filter(s => (s.disciplineMarks ?? 40) >= 35).length}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Excellent (35+)</p>
                </div>
                <div className="bg-red-50 rounded-[2rem] p-6 border border-red-100">
                    <AlertTriangle className="w-5 h-5 text-red-500 mb-3" />
                    <p className="text-3xl font-black text-red-600">{atRisk.length}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">At Risk (&lt;25)</p>
                </div>
            </div>

            {/* Leaderboard + At risk */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Best conduct podium */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 uppercase tracking-tighter">Best Conduct</h3>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Top students this term</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {bestStudents.length === 0
                            ? <p className="text-center py-6 text-[9px] font-black uppercase tracking-widest text-slate-300">No students yet</p>
                            : bestStudents.map((s, i) => (
                                <div key={s.id} className="flex items-center gap-4 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-50">
                                    <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-base shrink-0">
                                        {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                                    </div>
                                    <div className="flex-grow min-w-0">
                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{s.firstName} {s.lastName}</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.className}</p>
                                    </div>
                                    <MarkBadge marks={s.disciplineMarks ?? 40} />
                                </div>
                            ))}
                    </div>
                </div>

                {/* At risk students */}
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 uppercase tracking-tighter">Needs Attention</h3>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Students below 25/40</p>
                        </div>
                    </div>
                    <div className="space-y-3 max-h-56 overflow-y-auto">
                        {atRisk.length === 0 ? (
                            <div className="py-6 text-center">
                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500">All students doing well! ✓</p>
                            </div>
                        ) : atRisk.map(s => (
                            <div key={s.id} className="flex items-center gap-4 p-3 rounded-2xl bg-red-50/50 border border-red-50">
                                <div className="w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center text-white text-[11px] font-black shrink-0">
                                    {s.firstName[0]}{s.lastName[0]}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{s.firstName} {s.lastName}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{s.className}</p>
                                </div>
                                <MarkBadge marks={s.disciplineMarks ?? 40} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Per-class expandable table */}
            <div className="space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Classes — click to edit marks</h2>

                {filteredClasses.length === 0 ? (
                    <div className="py-20 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center gap-4">
                        <ShieldAlert className="w-12 h-12 text-slate-200" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">No classes match your search.</p>
                    </div>
                ) : filteredClasses.map((cls: any) => {
                    const avg = parseFloat(cls.averageDiscipline || "40");
                    const c = markColor(avg);
                    const isOpen = expandedClass === cls.id;

                    return (
                        <div key={cls.id} className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden">
                            <button
                                onClick={() => setExpandedClass(isOpen ? null : cls.id)}
                                className="w-full flex items-center justify-between p-6 hover:bg-slate-50/50 transition-all text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.bg}`}>
                                        <ShieldAlert className={`w-5 h-5 ${c.text}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-900 uppercase tracking-tighter">{cls.name}</h3>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                                            {(cls.users || []).length} students
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden md:block">
                                        <p className={`text-xl font-black ${c.text}`}>{cls.averageDiscipline} <span className="text-slate-300 text-xs">avg</span></p>
                                    </div>
                                    <div className="hidden md:block w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${(avg / 40) * 100}%` }} />
                                    </div>
                                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                </div>
                            </button>

                            {isOpen && (
                                <div className="border-t border-slate-50 p-6 space-y-3 max-h-96 overflow-y-auto">
                                    {(cls.users || []).length === 0
                                        ? <p className="text-center py-8 text-[9px] font-black uppercase tracking-widest text-slate-300">No students enrolled yet.</p>
                                        : (cls.users || [])
                                            .sort((a: any, b: any) => (b.disciplineMarks ?? 0) - (a.disciplineMarks ?? 0))
                                            .map((student: any) => {
                                                const m = localMarks[student.id] ?? 40;
                                                const sc = markColor(m);
                                                return (
                                                    <div key={student.id} className="bg-slate-50/50 rounded-2xl p-4 flex items-center gap-4 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                                                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white text-[11px] font-black shrink-0">
                                                            {student.firstName[0]}{student.lastName[0]}
                                                        </div>
                                                        <div className="flex-grow min-w-0">
                                                            <p className="font-black text-slate-900 text-sm uppercase tracking-tight">{student.firstName} {student.lastName}</p>
                                                            <div className="flex items-center gap-2 mt-1.5">
                                                                <div className="flex-grow h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                                    <div className={`h-full rounded-full transition-all ${sc.bar}`} style={{ width: `${(m / 40) * 100}%` }} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="40"
                                                                value={m}
                                                                onChange={e => setLocalMarks(prev => ({ ...prev, [student.id]: parseInt(e.target.value) || 0 }))}
                                                                className="w-16 bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs font-black text-center outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                                                            />
                                                            <button
                                                                onClick={() => saveMark(student.id)}
                                                                disabled={saving === student.id}
                                                                className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-sm"
                                                            >
                                                                {saving === student.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
