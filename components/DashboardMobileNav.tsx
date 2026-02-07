"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home, Users, BookOpen, Settings, Calendar, FileText,
    GraduationCap, ClipboardList, ShieldAlert, CalendarCheck,
    Briefcase, FileSpreadsheet, BookMarked, Users2, MessageCircle,
    Fingerprint, Menu
} from "lucide-react";

interface DashboardMobileNavProps {
    role: string;
}

export default function DashboardMobileNav({ role }: DashboardMobileNavProps) {
    const pathname = usePathname();

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

        // Teacher specific
        { icon: <Calendar className="w-5 h-5" />, label: "Timetable", href: "/dashboard/timetable", roles: ["TEACHER"] },
        { icon: <FileSpreadsheet className="w-5 h-5" />, label: "Scheme of Work", href: "/dashboard/scheme-of-work", roles: ["TEACHER"] },
        { icon: <BookMarked className="w-5 h-5" />, label: "Lesson Plan", href: "/dashboard/lesson-plan", roles: ["TEACHER"] },
        { icon: <FileText className="w-5 h-5" />, label: "Exams", href: "/dashboard/exams", roles: ["TEACHER"] },

        // Parent specific
        { icon: <Users className="w-5 h-5" />, label: "My Children", href: "/dashboard/children", roles: ["PARENT"] },

        { icon: <Settings className="w-5 h-5" />, label: "Settings", href: "/dashboard/settings", roles: ["ALL"] },
    ];

    const filteredItems = menuItems.filter(item =>
        item.roles.includes("ALL") || item.roles.includes(role)
    );

    return (
        <nav className="md:hidden fixed bottom-0 w-full bg-white border-t px-6 h-20 flex items-center justify-between z-40 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
            {filteredItems.slice(0, 4).map((item, idx) => {
                const isActive = pathname === item.href;
                return (
                    <Link key={idx} href={item.href} className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-500 hover:text-emerald-600'}`}>
                        {item.icon}
                        <span className="text-[9px] font-black uppercase tracking-[0.05em]">{item.label.split(' ')[0]}</span>
                    </Link>
                )
            })}
            <Link href="/dashboard" className="flex flex-col items-center gap-1 text-gray-500">
                <Menu className="w-5 h-5" />
                <span className="text-[9px] font-black uppercase tracking-[0.05em]">Portal</span>
            </Link>
        </nav>
    );
}
