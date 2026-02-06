"use client";

import { useState, useEffect } from "react";
import {
    Users,
    BookOpen,
    Calendar,
    GraduationCap,
    TrendingUp,
    Clock,
    ArrowUpRight,
    Plus,
    Loader2
} from "lucide-react";
import Link from "next/link";

interface Stats {
    students: number;
    teachers: number;
    classes: number;
    courses: number;
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
            label: "Total Students",
            value: stats?.students || 0,
            icon: <GraduationCap className="w-6 h-6" />,
            color: "bg-blue-500",
            link: "/dashboard/students"
        },
        {
            label: "Active Teachers",
            value: stats?.teachers || 0,
            icon: <Users className="w-6 h-6" />,
            color: "bg-emerald-500",
            link: "/dashboard/teachers"
        },
        {
            label: "Classes",
            value: stats?.classes || 0,
            icon: <Calendar className="w-6 h-6" />,
            color: "bg-orange-500",
            link: "/dashboard/classes"
        },
        {
            label: "Courses",
            value: stats?.courses || 0,
            icon: <BookOpen className="w-6 h-6" />,
            color: "bg-purple-500",
            link: "/dashboard/courses"
        },
    ];

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500 font-medium">Welcome back! Here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/academic-years" className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Setup Calendar
                    </Link>
                    <Link href="/dashboard/teachers" className="btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Staff
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <Link key={idx} href={stat.link} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-32 h-32 ${stat.color} opacity-[0.03] -mr-16 -mt-16 rounded-full transition-transform group-hover:scale-150 duration-700`}></div>
                        <div className="relative z-10 space-y-4">
                            <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-${stat.color.split('-')[1]}-500/20`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">{stat.label}</p>
                                <div className="flex items-end gap-2">
                                    <h3 className="text-3xl font-black">{stat.value}</h3>
                                    <div className="flex items-center text-emerald-500 text-[10px] font-bold mb-1">
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        +12%
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ArrowUpRight className="absolute top-8 right-8 w-5 h-5 text-gray-200 group-hover:text-gray-400 transition-colors" />
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold tracking-tight">Recent Activity</h3>
                        <Link href="#" className="text-emerald-600 text-xs font-bold uppercase tracking-widest hover:underline">View All</Link>
                    </div>
                    <div className="space-y-6">
                        <ActivityItem
                            icon={<Clock className="w-4 h-4" />}
                            title="New Teacher Registered"
                            desc="Pro Teacher joined EjoAfrica staff"
                            time="2h ago"
                            color="text-blue-500 bg-blue-50"
                        />
                        <ActivityItem
                            icon={<Calendar className="w-4 h-4" />}
                            title="Term 1 Finalized"
                            desc="Academic Year 2026 update"
                            time="5h ago"
                            color="text-emerald-500 bg-emerald-50"
                        />
                        <ActivityItem
                            icon={<BookOpen className="w-4 h-4" />}
                            title="Syllabus Updated"
                            desc="Advanced Physics curriculum updated"
                            time="1d ago"
                            color="text-orange-500 bg-orange-50"
                        />
                    </div>
                </div>

                <div className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-110"></div>
                    <div className="relative z-10 space-y-6">
                        <div className="bg-white/10 backdrop-blur-md w-fit p-4 rounded-2xl border border-white/10">
                            <Sparkles className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold tracking-tight">School Setup Progress</h3>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed">Complete your initial configuration to unlock full analytical reports and student tracking.</p>
                        </div>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                    <span>Configuration</span>
                                    <span>75%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-3/4 shadow-lg shadow-emerald-500/50"></div>
                                </div>
                            </div>
                            <button className="bg-white text-gray-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-xl">
                                Continue Setup
                            </button>
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
                <h4 className="text-sm font-bold text-gray-900 leading-none mb-1 group-hover:text-emerald-600 transition-colors">{title}</h4>
                <p className="text-xs text-gray-400 font-medium">{desc}</p>
            </div>
            <span className="text-[10px] font-black uppercase text-gray-300 tracking-wider ">{time}</span>
        </div>
    );
}

function Sparkles(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    );
}
