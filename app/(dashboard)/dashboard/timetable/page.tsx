"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, Clock, User, Book, Filter, Loader2, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import TimetableModal from "@/components/TimetableModal";
import { toast } from "react-hot-toast";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface TimetableEntry {
    id: string;
    day: number;
    startTime: string;
    endTime: string;
    course: { title: string };
    teacher: { firstName: string, lastName: string };
    class: { name: string };
}

export default function TimetablePage() {
    const [entries, setEntries] = useState<TimetableEntry[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    async function fetchData() {
        setLoading(true);
        try {
            const url = selectedClass ? `/api/timetables?classId=${selectedClass}` : "/api/timetables";
            const [tRes, cRes] = await Promise.all([
                fetch(url),
                fetch("/api/classes")
            ]);
            const [tData, cData] = await Promise.all([tRes.json(), cRes.json()]);
            setEntries(Array.isArray(tData) ? tData : []);
            setClasses(Array.isArray(cData) ? cData : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to remove this session?")) return;
        const tid = toast.loading("Decommissioning session...");
        try {
            const res = await fetch(`/api/timetables/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Protocol Error");
            toast.success("Session Removed.", { id: tid });
            fetchData();
        } catch (err) {
            toast.error("Failed to remove session.", { id: tid });
        }
    }

    useEffect(() => {
        fetchData();
    }, [selectedClass]);

    return (
        <div className="space-y-6 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase tracking-tighter">Institutional Timetable</h1>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest text-emerald-600">Synchronized faculty scheduling.</p>
                </div>
                <div className="flex gap-2">
                    <select
                        className="bg-white border border-slate-100 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/5 shadow-sm"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="">All Class Nodes</option>
                        {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-slate-900 text-white rounded-2xl px-6 py-3 font-black uppercase tracking-widest text-[9px] hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-xl"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Provision Slot</span>
                    </button>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto min-h-[50vh]">
                    {loading ? (
                        <div className="flex h-full items-center justify-center min-h-[40vh]">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 min-w-[900px] border-collapse relative">
                            {DAYS.map((day, idx) => (
                                <div key={day} className="border-r border-white/5 last:border-0 relative">
                                    <div className="p-3 bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 border-b border-white/5 mb-3">
                                        <h3 className="text-center text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500/60">{day.substring(0, 3)}</h3>
                                    </div>

                                    <div className="px-2 space-y-2 pb-6">
                                        {entries.filter(e => e.day === idx).length > 0 ? (
                                            entries.filter(e => e.day === idx).map((entry) => (
                                                <div key={entry.id} className="bg-slate-800/50 p-3 rounded-2xl border border-white/5 shadow-sm hover:bg-slate-800 transition-all cursor-pointer group space-y-2 relative overflow-hidden">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                                                        className="absolute top-1 right-1 p-1 bg-red-500/0 text-red-500/0 group-hover:bg-red-500 group-hover:text-white rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-2.5 h-2.5" />
                                                    </button>

                                                    <div className="space-y-0.5">
                                                        <span className="text-[7px] font-black tracking-widest text-emerald-500/40 uppercase">{entry.class.name}</span>
                                                        <h4 className="font-black text-[10px] text-white leading-tight uppercase truncate pr-4">{entry.course.title}</h4>
                                                    </div>

                                                    <div className="space-y-1 pt-1.5 border-t border-white/5">
                                                        <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-500">
                                                            <Clock className="w-2.5 h-2.5 text-emerald-500/30" />
                                                            <span>{entry.startTime} - {entry.endTime}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-500">
                                                            <User className="w-2.5 h-2.5 text-emerald-500/30" />
                                                            <span className="truncate">{entry.teacher.firstName} {entry.teacher.lastName[0]}.</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center flex flex-col items-center gap-2 opacity-5">
                                                <Calendar className="w-5 h-5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <TimetableModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    );
}
