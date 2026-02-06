"use client";

import { useState, useEffect } from "react";
import {
    Users,
    BookOpen,
    Calendar,
    GraduationCap,
    Clock,
    ArrowUpRight,
    Plus,
    Loader2,
    CheckCircle2,
    Circle
} from "lucide-react";
import Link from "next/link";

interface SetupItem {
    id: string;
    label: string;
    done: boolean;
}

interface Stats {
    students: number;
    teachers: number;
    classes: number;
    courses: number;
    setupItems: SetupItem[];
    progress: number;
}

export default function DashboardHome() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/stats");
                const data = await res.json();
                setStats(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="h-[80vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            </div>
        );
    }

    const statCards = [
        {
            label: "Enrollment",
            value: `${stats?.students || 0} Students`,
            icon: <GraduationCap className="w-6 h-6" />,
            color: "bg-blue-600",
            link: "/dashboard/students"
        },
        {
            label: "Academic Staff",
            value: `${stats?.teachers || 0} Teachers`,
            icon: <Users className="w-6 h-6" />,
            color: "bg-emerald-600",
            link: "/dashboard/teachers"
        },
        {
            label: "Classrooms",
            value: `${stats?.classes || 0} Levels`,
            icon: <Calendar className="w-6 h-6" />,
            color: "bg-orange-600",
            link: "/dashboard/classes"
        },
        {
            label: "Course Bank",
            value: `${stats?.courses || 0} Subjects`,
            icon: <BookOpen className="w-6 h-6" />,
            color: "bg-purple-600",
            link: "/dashboard/courses"
        },
    ];

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">Institutional Pulse</h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">EjoAfrica Management Engine</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/academic-years" className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Calendar Settings
                    </Link>
                    <Link href="/dashboard/registration" className="btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        <span className="text-xs">Enroll User</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <Link key={idx} href={stat.link} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 ${stat.color} opacity-[0.03] -mr-16 -mt-16 rounded-full transition-transform group-hover:scale-150 duration-700`}></div>
                        <div className="relative z-10 space-y-4">
                            <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gray-200`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">{stat.label}</p>
                                <h3 className="text-2xl font-black text-gray-900">{stat.value}</h3>
                            </div>
                        </div>
                        <ArrowUpRight className="absolute top-8 right-8 w-5 h-5 text-gray-200 group-hover:text-gray-400 transition-colors" />
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold tracking-tight text-gray-900">Recent Transmission</h3>
                        <Link href="#" className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:underline">Log History</Link>
                    </div>
                    <div className="space-y-6">
                        <ActivityItem
                            icon={<Clock className="w-4 h-4" />}
                            title="Identity Encrypted"
                            desc="New student node added to database"
                            time="2h ago"
                            color="text-blue-600 bg-blue-50"
                        />
                        <ActivityItem
                            icon={<Calendar className="w-4 h-4" />}
                            title="Term Synchronized"
                            desc="Academic Year 2026 data updated"
                            time="5h ago"
                            color="text-emerald-600 bg-emerald-50"
                        />
                        <ActivityItem
                            icon={<BookOpen className="w-4 h-4" />}
                            title="Payload Updated"
                            desc="Physics curriculum units expanded"
                            time="1d ago"
                            color="text-orange-600 bg-orange-50"
                        />
                    </div>
                </div>

                <div className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden group border border-gray-800">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10 flex flex-col h-full space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="bg-emerald-500/20 w-fit p-4 rounded-2xl border border-emerald-500/10">
                                <SparklesIcon className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Node Readiness</p>
                                <p className="text-3xl font-black">{stats?.progress}%</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold tracking-tight">Institutional Setup</h3>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed">Verification of required building blocks for platform full-deployment.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {stats?.setupItems.map(item => (
                                <div key={item.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 group-hover:border-emerald-500/20 transition-all">
                                    {item.done ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                        <Circle className="w-4 h-4 text-gray-600" />
                                    )}
                                    <span className={`text-[11px] font-bold tracking-tight ${item.done ? 'text-white' : 'text-gray-500'}`}>
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 mt-auto">
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 transition-all duration-1000"
                                    style={{ width: `${stats?.progress}%` }}
                                ></div>
                            </div>
                            {!stats?.setupItems.every(i => i.done) && (
                                <p className="text-[10px] font-bold text-gray-500 mt-4 uppercase tracking-widest text-center">
                                    Action required: Complete {stats?.setupItems.filter(i => !i.done).length} pending protocols
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActivityItem({ icon, title, desc, time, color }: any) {
    return (
        <div className="flex items-center gap-5 group cursor-pointer">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                {icon}
            </div>
            <div className="flex-grow">
                <h4 className="text-sm font-bold text-gray-900 leading-none mb-1 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{title}</h4>
                <p className="text-[11px] text-gray-500 font-medium">{desc}</p>
            </div>
            <span className="text-[10px] font-black uppercase text-gray-300 tracking-wider ">{time}</span>
        </div>
    );
}

function SparklesIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    );
}
