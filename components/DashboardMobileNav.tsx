"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
    Home, Users, BookOpen, Settings, Calendar, FileText,
    GraduationCap, ClipboardList, ShieldAlert, CalendarCheck,
    Briefcase, FileSpreadsheet, BookMarked, Users2, MessageCircle,
    Fingerprint, Menu, X, LogOut, Radio
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

interface DashboardMobileNavProps {
    role: string;
}

export default function DashboardMobileNav({ role }: DashboardMobileNavProps) {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        { icon: <BookOpen className="w-5 h-5" />, label: "Question Bank", href: "/dashboard/question-bank", roles: ["TEACHER", "STUDENT"] },
        { icon: <Radio className="w-5 h-5" />, label: "Live Assessments", href: "/dashboard/live-assessments", roles: ["TEACHER", "STUDENT", "DOS", "SCHOOL_ADMIN", "PARENT"] },

        // Parent specific
        { icon: <Users className="w-5 h-5" />, label: "My Children", href: "/dashboard/children", roles: ["PARENT"] },

        { icon: <Settings className="w-5 h-5" />, label: "Settings", href: "/dashboard/settings", roles: ["ALL"] },
    ];

    const filteredItems = menuItems.filter(item =>
        item.roles.includes("ALL") || item.roles.includes(role)
    );

    return (
        <>
            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in">
                    <div className="absolute bottom-0 w-full bg-white rounded-t-[3rem] p-8 max-h-[85vh] overflow-y-auto animate-bubble">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">System Menu</h2>
                            <button onClick={() => setIsMenuOpen(false)} className="p-3 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-10">
                            {filteredItems.map((item, idx) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={idx}
                                        href={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className={`flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all ${isActive
                                            ? "bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm"
                                            : "bg-gray-50 border-gray-50 text-gray-500 hover:bg-gray-100"
                                            }`}
                                    >
                                        <div className={`${isActive ? "text-emerald-500 scale-110" : "text-gray-400"} transition-all`}>
                                            {item.icon}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-center">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="pt-6 border-t">
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            )}

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
                <button
                    onClick={() => setIsMenuOpen(true)}
                    className={`flex flex-col items-center gap-1 transition-colors ${isMenuOpen ? 'text-emerald-600' : 'text-gray-500'}`}
                >
                    <Menu className="w-5 h-5" />
                    <span className="text-[9px] font-black uppercase tracking-[0.05em]">Portal</span>
                </button>
            </nav>
        </>
    );
}
