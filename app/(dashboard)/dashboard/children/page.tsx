"use client";

import { useState, useEffect } from "react";
import { Users, GraduationCap, Calendar, Book, Shield, ArrowRight, UserCircle, Loader2, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function MyChildrenPage() {
    const [loading, setLoading] = useState(true);
    const [children, setChildren] = useState<any[]>([]);
    const [expandedChild, setExpandedChild] = useState<string | null>(null);
    const [childDetails, setChildDetails] = useState<any>({});

    async function fetchChildren() {
        try {
            const meRes = await fetch("/api/auth/me");
            const me = await meRes.json();

            const cRes = await fetch(`/api/users?role=STUDENT&parentId=${me.id}`);
            const cData = await cRes.json();
            setChildren(Array.isArray(cData) ? cData : []);
        } catch (err) {
            toast.error("Failed to sync dependent nodes.");
        } finally {
            setLoading(false);
        }
    }

    async function fetchChildDetails(childId: string, classId: string) {
        if (childDetails[childId]) return;

        try {
            const [tRes, qRes] = await Promise.all([
                fetch(`/api/timetables?classId=${classId}`),
                fetch(`/api/questions/answers?studentId=${childId}`)
            ]);

            const tData = await tRes.json();
            const qData = await qRes.json();

            setChildDetails((prev: any) => ({
                ...prev,
                [childId]: {
                    timetable: Array.isArray(tData) ? tData : [],
                    answers: Array.isArray(qData) ? qData : []
                }
            }));
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchChildren();
    }, []);

    const toggleChild = (child: any) => {
        if (expandedChild === child.id) {
            setExpandedChild(null);
        } else {
            setExpandedChild(child.id);
            if (child.classId) fetchChildDetails(child.id, child.classId);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Syncing Dependent Nodes...</p>
            </div>
        );
    }

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return (
        <div className="space-y-10 animate-fade-up">
            <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase tracking-tighter">My Children</h1>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-emerald-600">Track academic progress, schedules, and test results for your children.</p>
            </div>

            <div className="space-y-8">
                {children.length > 0 ? children.map(child => {
                    const isExpanded = expandedChild === child.id;
                    const details = childDetails[child.id] || { timetable: [], answers: [] };

                    // Group timetable by day
                    const groupedTimetable = details.timetable.reduce((acc: any, curr: any) => {
                        if (!acc[curr.day]) acc[curr.day] = [];
                        acc[curr.day].push(curr);
                        return acc;
                    }, {});

                    return (
                        <div key={child.id} className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden transition-all hover:shadow-xl">
                            <div
                                onClick={() => toggleChild(child)}
                                className="p-8 cursor-pointer flex items-center justify-between"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl group-hover:bg-emerald-600 transition-colors">
                                        <UserCircle className="w-10 h-10" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 leading-tight">{child.firstName} {child.lastName}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">{child.class?.name || "No Class assigned"}</span>
                                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">ID: #{child.id.slice(0, 8)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Performance</div>
                                        <div className="text-sm font-black text-emerald-600 mt-1 uppercase tracking-tighter">Active Student</div>
                                    </div>
                                    <div className="p-2 bg-slate-50 rounded-xl">
                                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                    </div>
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="px-8 pb-10 animate-fade-up">
                                    <div className="h-px bg-slate-50 mb-10" />

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                        {/* Column 1: Weekly Schedule */}
                                        <div className="lg:col-span-2 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h4 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">
                                                    <Calendar className="w-4 h-4 text-emerald-500" />
                                                    Weekly Schedule
                                                </h4>
                                                <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">Class Timetable</span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {days.map((dayName, index) => {
                                                    const dayNum = index + 1;
                                                    const sessions = groupedTimetable[dayNum] || [];
                                                    if (sessions.length === 0) return null;

                                                    return (
                                                        <div key={dayName} className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                                                            <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-4">{dayName}</h5>
                                                            <div className="space-y-4">
                                                                {sessions.map((s: any) => (
                                                                    <div key={s.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
                                                                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex flex-col items-center justify-center text-white">
                                                                            <Clock className="w-3.5 h-3.5" />
                                                                        </div>
                                                                        <div className="flex-grow">
                                                                            <p className="text-[10px] font-black uppercase tracking-tight text-slate-900 leading-none mb-1">{s.course.title}</p>
                                                                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{s.startTime} - {s.endTime}</p>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="text-[8px] font-black uppercase text-emerald-600">{s.teacher.firstName}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {Object.keys(groupedTimetable).length === 0 && (
                                                    <div className="col-span-full py-10 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-[2rem] bg-slate-50/30">
                                                        <Calendar className="w-8 h-8 text-slate-200 mb-2" />
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">No classes scheduled yet.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Column 2: Knowledge Responses & Faculty */}
                                        <div className="space-y-10">
                                            <section className="space-y-6">
                                                <h4 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">
                                                    <Book className="w-4 h-4 text-blue-500" />
                                                    Test Results
                                                </h4>
                                                <div className="space-y-4">
                                                    {details.answers.length > 0 ? details.answers.slice(0, 5).map((a: any) => (
                                                        <div key={a.id} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
                                                            {a.isCorrect ? (
                                                                <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                                                            ) : (
                                                                <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                                                            )}
                                                            <div className="min-w-0">
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 truncate">{a.question.course.title}</p>
                                                                <p className="text-[10px] font-bold text-slate-900 truncate leading-tight uppercase tracking-tighter">{a.question.text}</p>
                                                            </div>
                                                        </div>
                                                    )) : (
                                                        <div className="py-10 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-[2rem] bg-slate-50/30">
                                                            <Shield className="w-8 h-8 text-slate-200 mb-2" />
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">No test data available.</p>
                                                        </div>
                                                    )}
                                                    {details.answers.length > 5 && (
                                                        <button className="w-full text-[9px] font-black uppercase text-slate-400 hover:text-emerald-600 transition-colors tracking-widest">
                                                            View Full Performance History
                                                        </button>
                                                    )}
                                                </div>
                                            </section>

                                            <section className="space-y-6">
                                                <h4 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">
                                                    <Users className="w-4 h-4 text-orange-500" />
                                                    Current Teachers
                                                </h4>
                                                <div className="flex flex-wrap gap-3">
                                                    {/* Unique teachers from timetable */}
                                                    {Array.from(new Set(details.timetable.map((t: any) => t.teacherId))).map((tid: any) => {
                                                        const teacher = details.timetable.find((t: any) => t.teacherId === tid)?.teacher;
                                                        if (!teacher) return null;
                                                        return (
                                                            <div key={tid as string} className="flex items-center gap-3 bg-slate-50 py-3 px-4 rounded-xl border border-slate-100">
                                                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-black border border-slate-100 text-slate-900 uppercase">
                                                                    {teacher.firstName[0]}{teacher.lastName[0]}
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] font-black uppercase text-slate-900 leading-none">{teacher.firstName} {teacher.lastName}</p>
                                                                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Teacher</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }) : (
                    <div className="py-40 flex flex-col items-center gap-6 bg-white rounded-[4rem] border border-dashed border-slate-200">
                        <Users className="w-16 h-16 text-slate-200" />
                        <div className="text-center space-y-2">
                            <p className="font-black text-slate-900 uppercase tracking-tighter text-xl">No Children Linked</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">There are no student accounts linked to your parent profile.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
