"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home, Users, BookOpen, Settings, Calendar, FileText,
    GraduationCap, ClipboardList, ShieldAlert, CalendarCheck,
    Briefcase, FileSpreadsheet, BookMarked, Users2, MessageCircle,
    Fingerprint, Radio, TrendingUp, CalendarCheck2, UserCheck
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

interface DashboardSidebarProps {
    role: string;
}

export default function DashboardSidebar({ role }: DashboardSidebarProps) {
    const pathname = usePathname();

    const [notifCount, setNotifCount] = useState(0);

    useEffect(() => {
        async function fetchNotifCount() {
            try {
                const res = await fetch("/api/notifications/count");
                const data = await res.json();
                setNotifCount(data.count || 0);
            } catch (err) { }
        }
        fetchNotifCount();
        const interval = setInterval(fetchNotifCount, 10000); // refresh every 10s
        window.addEventListener('refreshNotifications', fetchNotifCount);
        return () => {
            clearInterval(interval);
            window.removeEventListener('refreshNotifications', fetchNotifCount);
        };
    }, []);

    const menuItems = [
        { icon: <Home className="w-5 h-5" />, label: "Dashboard", href: "/dashboard", roles: ["ALL"] },

        // School Admin
        { icon: <Calendar className="w-5 h-5" />, label: "Academic Years", href: "/dashboard/academic-years", roles: ["SCHOOL_ADMIN"] },
        { icon: <CalendarCheck className="w-5 h-5" />, label: "Academic Terms", href: "/dashboard/academic-terms", roles: ["SCHOOL_ADMIN"] },
        { icon: <Briefcase className="w-5 h-5" />, label: "Classes", href: "/dashboard/classes", roles: ["SCHOOL_ADMIN", "DOS"] },
        { icon: <GraduationCap className="w-5 h-5" />, label: "Students", href: "/dashboard/students", roles: ["SCHOOL_ADMIN", "DOS", "DOD", "TEACHER"] },
        { icon: <Fingerprint className="w-5 h-5" />, label: "Registration", href: "/dashboard/registration", roles: ["SCHOOL_ADMIN"] },
        { icon: <Users2 className="w-5 h-5" />, label: "Teachers", href: "/dashboard/teachers", roles: ["SCHOOL_ADMIN", "DOS"] },
        { icon: <ShieldAlert className="w-5 h-5" />, label: "Disciplinary Reports", href: "/dashboard/discipline", roles: ["SCHOOL_ADMIN", "DOD"] },

        // DOS specific
        { icon: <BookOpen className="w-5 h-5" />, label: "Courses", href: "/dashboard/courses", roles: ["DOS", "TEACHER"] },
        { icon: <ClipboardList className="w-5 h-5" />, label: "Reports", href: "/dashboard/reports", roles: ["DOS"] },

        // DOD specific
        { icon: <ShieldAlert className="w-5 h-5" />, label: "Discipline Marks", href: "/dashboard/discipline-marks", roles: ["DOD"] },
        { icon: <MessageCircle className="w-5 h-5" />, label: "Parent Communication", href: "/dashboard/parent-comm", roles: ["DOD"] },

        // Shared among staff
        { icon: <Calendar className="w-5 h-5" />, label: "Timetable", href: "/dashboard/timetable", roles: ["TEACHER", "STUDENT", "PARENT", "DOS", "SCHOOL_ADMIN"] },
        { icon: <FileSpreadsheet className="w-5 h-5" />, label: "Scheme of Work", href: "/dashboard/scheme-of-work", roles: ["TEACHER", "DOS"] },
        { icon: <BookMarked className="w-5 h-5" />, label: "Lesson Plan", href: "/dashboard/lesson-plan", roles: ["TEACHER"] },
        { icon: <UserCheck className="w-5 h-5" />, label: "Attendance Tracker", href: "/dashboard/attendance", roles: ["PARENT", "STUDENT", "TEACHER", "DOS", "SCHOOL_ADMIN", "DOD"] },

        // Results & Progress
        { icon: <ClipboardList className="w-5 h-5" />, label: "Assignments", href: "/dashboard/assignments", roles: ["TEACHER", "STUDENT", "PARENT"] },
        { icon: <Radio className="w-5 h-5" />, label: "Live Assessments", href: "/dashboard/live-assessments", roles: ["TEACHER", "STUDENT", "DOS", "SCHOOL_ADMIN", "PARENT"] },
        { icon: <TrendingUp className="w-5 h-5" />, label: "Performance", href: "/dashboard/performance", roles: ["TEACHER", "STUDENT", "DOS", "SCHOOL_ADMIN", "PARENT"] },
        { icon: <ShieldAlert className="w-5 h-5" />, label: "Conduct & Discipline", href: "/dashboard/children-discipline", roles: ["PARENT", "STUDENT"] },

        { icon: <MessageCircle className="w-5 h-5" />, label: "Notifications", href: "/dashboard/notifications", roles: ["ALL"], badge: notifCount },

        // Parent specific
        { icon: <Users className="w-5 h-5" />, label: "My Children", href: "/dashboard/children", roles: ["PARENT"] },
        { icon: <MessageCircle className="w-5 h-5" />, label: "Messages from School", href: "/dashboard/parent-messages", roles: ["PARENT"] },

        { icon: <Settings className="w-5 h-5" />, label: "Settings", href: "/dashboard/settings", roles: ["ALL"] },
    ];

    const filteredItems = menuItems.filter(item =>
        item.roles.includes("ALL") || item.roles.includes(role)
    );

    return (
        <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen sticky top-0 left-0 overflow-y-auto shrink-0 z-40">
            <div className="p-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-black text-2xl tracking-tight text-emerald-600">
                    <GraduationCap className="w-8 h-8" />
                    <span>eShuri</span>
                </Link>
            </div>

            <nav className="flex-grow px-4 space-y-1 pb-10">
                <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Main Menu</p>
                {filteredItems.map((item, idx) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={idx}
                            href={item.href}
                            className={`flex items-center justify-between gap-3 px-4 py-3 text-sm font-bold rounded-2xl transition-all group ${isActive
                                ? "bg-emerald-50 text-emerald-600 shadow-sm"
                                : "text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`transition-transform ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </div>
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t px-6 bg-gray-50/50">
                <LogoutButton />
            </div>
        </aside>
    );
}
