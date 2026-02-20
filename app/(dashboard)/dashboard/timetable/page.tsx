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
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    async function fetchData() {
        setLoading(true);
        try {
            const url = selectedClass ? `/api/timetables?classId=${selectedClass}` : "/api/timetables";
            const [tRes, cRes, uRes] = await Promise.all([
                fetch(url),
                fetch("/api/classes"),
                fetch("/api/auth/me")
            ]);
            const [tData, cData, uData] = await Promise.all([tRes.json(), cRes.json(), uRes.json()]);
            setEntries(Array.isArray(tData) ? tData : []);
            setClasses(Array.isArray(cData) ? cData : []);
            setUser(uData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to remove this session?")) return;
        const tid = toast.loading("Deleting session...");
        try {
            const res = await fetch(`/api/timetables/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Could not delete session");
            toast.success("Session deleted successfully.", { id: tid });
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
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase tracking-tighter">School Schedule</h1>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest text-emerald-600">Weekly class and teacher schedules.</p>
                </div>
                <div className="flex gap-2">
                    {(user?.role !== "STUDENT" && user?.role !== "PARENT") && (
                        <>
                            <select
                                className="bg-white border border-slate-100 rounded-2xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-emerald-500/5 shadow-sm"
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                            >
                                <option value="">All Classes</option>
                                {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-slate-900 text-white rounded-2xl px-6 py-3 font-black uppercase tracking-widest text-[9px] hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-xl"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Session</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex h-full items-center justify-center min-h-[40vh]">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 min-w-[800px] border-collapse relative bg-white">
                            {DAYS.map((day, idx) => (
                                <div key={day} className="border-r border-slate-50 last:border-0 relative bg-white">
                                    <div className="p-3 bg-slate-50 sticky top-0 z-10 border-b border-slate-100 mb-3 text-center">
                                        <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{day.substring(0, 3)}</h3>
                                    </div>

                                    <div className="px-2 space-y-2 pb-6">
                                        {entries.filter(e => e.day === idx).length > 0 ? (
                                            entries.filter(e => e.day === idx).map((entry) => (
                                                <div key={entry.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-2 relative overflow-hidden">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                                                        className="absolute top-1 right-1 p-1 bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-2.5 h-2.5" />
                                                    </button>

                                                    <div className="space-y-0.5">
                                                        <span className="text-[7px] font-black tracking-widest text-emerald-600/60 uppercase">{entry.class.name}</span>
                                                        <h4 className="font-black text-[10px] text-slate-900 leading-tight uppercase truncate pr-4">{entry.course.title}</h4>
                                                    </div>

                                                    <div className="space-y-1 pt-1.5 border-t border-slate-50">
                                                        <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400">
                                                            <Clock className="w-2.5 h-2.5 text-emerald-500/30" />
                                                            <span>{entry.startTime} - {entry.endTime}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-400">
                                                            <User className="w-2.5 h-2.5 text-emerald-500/30" />
                                                            <span className="truncate">{entry.teacher.firstName} {entry.teacher.lastName[0]}.</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center flex flex-col items-center gap-2 opacity-10 grayscale">
                                                <Calendar className="w-5 h-5 text-slate-300" />
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
