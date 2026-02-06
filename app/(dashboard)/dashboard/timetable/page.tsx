"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, Clock, User, Book, Filter, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

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

    async function fetchData() {
        setLoading(true);
        try {
            const url = selectedClass ? `/api/timetables?classId=${selectedClass}` : "/api/timetables";
            const [tRes, cRes] = await Promise.all([
                fetch(url),
                fetch("/api/classes")
            ]);
            const [tData, cData] = await Promise.all([tRes.json(), cRes.json()]);
            setEntries(tData);
            setClasses(cData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [selectedClass]);

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Institutional Timetable</h1>
                    <p className="text-gray-500 text-sm">Synchronized scheduling for classes and faculty.</p>
                </div>
                <div className="flex gap-3">
                    <select
                        className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-emerald-500/20"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="">All Classes</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button className="btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        <span>Add Slot</span>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto min-h-[60vh]">
                    {loading ? (
                        <div className="flex h-full items-center justify-center min-h-[40vh]">
                            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 min-w-[1200px] border-collapse relative">
                            {DAYS.map((day, idx) => (
                                <div key={day} className="border-r border-gray-50 last:border-0 relative">
                                    <div className="p-6 bg-gray-50/50 sticky top-0 z-10 border-b border-gray-100 mb-4">
                                        <h3 className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{day}</h3>
                                    </div>

                                    <div className="px-4 space-y-4 pb-8">
                                        {entries.filter(e => e.day === idx).length > 0 ? (
                                            entries.filter(e => e.day === idx).map((entry) => (
                                                <div key={entry.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer group space-y-4">
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] font-black tracking-widest text-emerald-600 opacity-60 uppercase">{entry.class.name}</span>
                                                        <h4 className="font-black text-sm text-gray-900 leading-tight group-hover:text-emerald-600 transition-colors uppercase">{entry.course.title}</h4>
                                                    </div>

                                                    <div className="space-y-2 pt-2 border-t border-gray-50">
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                                            <Clock className="w-3 h-3" />
                                                            <span>{entry.startTime} - {entry.endTime}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                                            <User className="w-3 h-3" />
                                                            <span className="truncate">{entry.teacher.firstName} {entry.teacher.lastName[0]}.</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-20 text-center flex flex-col items-center gap-3 opacity-20 filter grayscale">
                                                <Calendar className="w-8 h-8 text-gray-300" />
                                                <span className="text-[10px] uppercase font-black tracking-widest">No Sessions</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
