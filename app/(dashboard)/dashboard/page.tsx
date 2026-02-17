"use client";

import { useState, useEffect } from "react";
import {
    Users,
    BookOpen,
    Calendar,
    GraduationCap,
    ClipboardList,
    ShieldAlert,
    CalendarCheck,
    Briefcase,
    FileSpreadsheet,
    BookMarked,
    Users2,
    MessageCircle,
    Fingerprint,
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
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const [sRes, mRes, nRes] = await Promise.all([
                    fetch("/api/stats"),
                    fetch("/api/auth/me"),
                    fetch("/api/notifications")
                ]);
                const [sData, mData, nData] = await Promise.all([sRes.json(), mRes.json(), nRes.json()]);
                setStats(sData);
                setUser(mData);
                setNotifications(Array.isArray(nData) ? nData.slice(0, 5) : []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="h-[80vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            </div>
        );
    }

    const role = user?.role || "STUDENT";

    const getStatCards = () => {
        if (role === "TEACHER") {
            return [
                {
                    label: "My Students",
                    value: `${stats?.students || 0} Learners`,
                    icon: <Users className="w-6 h-6" />,
                    color: "bg-blue-600",
                    link: "/dashboard/students"
                },
                {
                    label: "Assigned Courses",
                    value: `${stats?.courses || 0} Subjects`,
                    icon: <BookOpen className="w-6 h-6" />,
                    color: "bg-purple-600",
                    link: "/dashboard/courses"
                },
                {
                    label: "Active Classes",
                    value: `${stats?.classes || 0} Levels`,
                    icon: <Calendar className="w-6 h-6" />,
                    color: "bg-orange-600",
                    link: "/dashboard/timetable"
                },
                {
                    label: "Student Reports",
                    value: `View Grades`,
                    icon: <GraduationCap className="w-6 h-6" />,
                    color: "bg-emerald-600",
                    link: "/dashboard/assignments"
                },
            ];
        }

        if (role === "STUDENT" || role === "PARENT") {
            return [
                {
                    label: role === "STUDENT" ? "My Courses" : "Child Courses",
                    value: `${stats?.courses || 0} Active`,
                    icon: <BookOpen className="w-6 h-6" />,
                    color: "bg-purple-600",
                    link: role === "STUDENT" ? "/dashboard/courses" : "/dashboard/my-children"
                },
                {
                    label: "Weekly Schedule",
                    value: `View Timetable`,
                    icon: <Clock className="w-6 h-6" />,
                    color: "bg-blue-600",
                    link: "/dashboard/timetable"
                },
                {
                    label: "My Progress",
                    value: `Grades & Reports`,
                    icon: <GraduationCap className="w-6 h-6" />,
                    color: "bg-emerald-600",
                    link: role === "STUDENT" ? "/dashboard/assignments" : "/dashboard/my-children"
                },
                {
                    label: "Discipline Account",
                    value: `Status: Good`,
                    icon: <Users className="w-6 h-6" />,
                    color: "bg-orange-600",
                    link: "/dashboard/discipline"
                },
            ];
        }

        // Admin view
        return [
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
    };

    const statCards = getStatCards();

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">
                        {role === "SCHOOL_ADMIN" ? "School Overview" : "Dashboard Overview"}
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                        Welcome back, <span className="text-emerald-600">{user?.firstName}</span>
                    </p>
                </div>
                {role === "SCHOOL_ADMIN" && (
                    <div className="flex gap-3">
                        <Link href="/dashboard/academic-years" className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Calendar Settings
                        </Link>
                        <Link href="/dashboard/registration" className="btn-primary flex items-center gap-2 border-b-4 border-emerald-800">
                            <Plus className="w-4 h-4" />
                            <span className="text-xs">Enroll User</span>
                        </Link>
                    </div>
                )}
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
                                <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{stat.value}</h3>
                            </div>
                        </div>
                        <ArrowUpRight className="absolute top-8 right-8 w-5 h-5 text-gray-200 group-hover:text-gray-400 transition-colors" />
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between pb-6 border-b border-gray-50">
                        <h3 className="text-xl font-bold tracking-tight text-gray-900">Recent Notifications</h3>
                        <Link href="/dashboard/notifications" className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:underline">View All</Link>
                    </div>
                    <div className="space-y-8">
                        {notifications.length > 0 ? notifications.map((notif) => (
                            <ActivityItem
                                key={notif.id}
                                icon={notif.type === "ASSIGNMENT" ? <ClipboardList className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                title={notif.title}
                                desc={notif.message}
                                time={new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                color={notif.type === "ASSIGNMENT" ? "text-purple-600 bg-purple-50" : "text-emerald-600 bg-emerald-50"}
                            />
                        )) : (
                            <div className="py-10 text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No recent alerts</p>
                            </div>
                        )}
                    </div>
                </div>

                {role === "SCHOOL_ADMIN" ? (
                    <div className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden group border border-gray-800">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10 flex flex-col h-full space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="bg-emerald-500/20 w-fit p-4 rounded-2xl border border-emerald-500/10">
                                    <SparklesIcon className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">System Setup</p>
                                    <p className="text-3xl font-black">{stats?.progress}%</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold tracking-tight">Deployment Progress</h3>
                                <p className="text-gray-400 text-sm font-medium leading-relaxed">Ensure all institutional parameters are correctly configured.</p>
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
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-600 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl shadow-emerald-600/20">
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-48 -mb-48"></div>
                        <div className="relative z-10 flex flex-col h-full space-y-8">
                            <div className="bg-white/20 w-fit p-4 rounded-2xl">
                                <GraduationCap className="w-8 h-8 text-white" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black tracking-tighter uppercase">Academic Success</h3>
                                <p className="text-emerald-50/80 text-sm font-bold uppercase tracking-widest leading-loose">
                                    Track your performance, attend classes, and stay ahead of your curriculum with Eshuri.
                                </p>
                            </div>
                            <div className="pt-8">
                                <Link href="/dashboard/timetable" className="bg-white text-emerald-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all inline-block">
                                    View Schedule
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ActivityItem({ icon, title, desc, time, color }: any) {
    return (
        <div className="flex items-center gap-6 group cursor-pointer">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} shadow-sm transition-transform group-hover:scale-110`}>
                {icon}
            </div>
            <div className="flex-grow">
                <h4 className="text-[12px] font-black text-gray-900 leading-none mb-2 group-hover:text-emerald-600 transition-colors uppercase tracking-widest">{title}</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{desc}</p>
            </div>
            <span className="text-[9px] font-black uppercase text-gray-300 tracking-[0.2em]">{time}</span>
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
