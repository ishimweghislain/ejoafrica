import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import Link from "next/link";
import {
    Home,
    Users,
    BookOpen,
    Settings,
    LogOut,
    Calendar,
    FileText,
    GraduationCap,
    ClipboardList,
    ShieldAlert,
    Menu,
    CalendarCheck,
    Briefcase,
    FileSpreadsheet,
    BookMarked,
    Users2,
    MessageCircle,
    Fingerprint
} from "lucide-react";
import { Toaster } from "react-hot-toast";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "default_secret_for_dev_only"
);

interface SessionPayload {
    email: string;
    role: string;
    userId: string;
}

async function getSession(): Promise<SessionPayload | null> {
    const token = (await cookies()).get("token")?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as SessionPayload;
    } catch (err) {
        return null;
    }
}

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const role = session.role as string;

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
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#0f172a',
                        color: '#fff',
                        borderRadius: '1.5rem',
                        padding: '1rem 1.5rem',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen sticky top-0 overflow-y-auto">
                <div className="p-6">
                    <Link href="/dashboard" className="flex items-center gap-2 font-black text-2xl tracking-tight text-emerald-600">
                        <GraduationCap className="w-8 h-8" />
                        <span>EjoAfrica</span>
                    </Link>
                </div>

                <nav className="flex-grow px-4 space-y-1 pb-10">
                    <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400">Main Menu</p>
                    {filteredItems.map((item, idx) => (
                        <Link
                            key={idx}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 rounded-2xl transition-all group"
                        >
                            <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t px-6 bg-gray-50/50">
                    <form action="/api/auth/logout" method="POST">
                        <button className="flex items-center gap-3 w-full text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 p-3 rounded-2xl transition-all">
                            <LogOut className="w-4 h-4" />
                            Logout Session
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow pb-24 md:pb-8">
                {/* Header - Desktop & Mobile */}
                <header className="bg-white/80 backdrop-blur-md border-b px-6 h-16 flex items-center justify-between sticky top-0 z-30">
                    <div className="md:hidden flex items-center gap-2 font-black text-emerald-600">
                        <GraduationCap className="w-6 h-6" />
                        <span>EjoAfrica</span>
                    </div>
                    <div className="hidden md:block">
                        <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">
                            {role.replace('_', ' ')} <span className="text-emerald-500">Node</span>
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right">
                            <p className="text-sm font-bold text-gray-900">{(session.email as string)}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Online</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold border-2 border-white shadow-xl">
                            {(session.email as string)[0].toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="p-6 md:p-10 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Bottom Nav - Mobile (Instagram Style) */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white border-t px-6 h-20 flex items-center justify-between z-40 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                {filteredItems.slice(0, 4).map((item, idx) => (
                    <Link key={idx} href={item.href} className="flex flex-col items-center gap-1 text-gray-500 hover:text-emerald-600 transition-colors">
                        {item.icon}
                        <span className="text-[9px] font-black uppercase tracking-[0.05em]">{item.label.split(' ')[0]}</span>
                    </Link>
                ))}
                <Link href="/dashboard" className="flex flex-col items-center gap-1 text-gray-500">
                    <Menu className="w-5 h-5" />
                    <span className="text-[9px] font-black uppercase tracking-[0.05em]">Portal</span>
                </Link>
            </nav>
        </div>
    );
}
