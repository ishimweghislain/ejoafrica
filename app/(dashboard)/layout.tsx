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
    Menu
} from "lucide-react";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "default_secret_for_dev_only"
);

async function getSession() {
    const token = (await cookies()).get("token")?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
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
        { icon: <Users className="w-5 h-5" />, label: "Students", href: "/dashboard/students", roles: ["SCHOOL_ADMIN", "DOS", "DOD", "TEACHER"] },
        { icon: <Users className="w-5 h-5" />, label: "Teachers", href: "/dashboard/teachers", roles: ["SCHOOL_ADMIN", "DOS"] },

        // DOS
        { icon: <BookOpen className="w-5 h-5" />, label: "Courses", href: "/dashboard/courses", roles: ["DOS", "TEACHER"] },
        { icon: <ClipboardList className="w-5 h-5" />, label: "Reports", href: "/dashboard/reports", roles: ["DOS", "DOD"] },

        // Teacher
        { icon: <Calendar className="w-5 h-5" />, label: "Timetable", href: "/dashboard/timetable", roles: ["TEACHER"] },
        { icon: <FileText className="w-5 h-5" />, label: "Exams", href: "/dashboard/exams", roles: ["TEACHER"] },

        // DOD
        { icon: <ShieldAlert className="w-5 h-5" />, label: "Discipline", href: "/dashboard/discipline", roles: ["DOD", "SCHOOL_ADMIN"] },

        { icon: <Settings className="w-5 h-5" />, label: "Settings", href: "/dashboard/settings", roles: ["ALL"] },
    ];

    const filteredItems = menuItems.filter(item =>
        item.roles.includes("ALL") || item.roles.includes(role)
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r h-screen sticky top-0">
                <div className="p-6">
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-emerald-600">
                        <GraduationCap className="w-8 h-8" />
                        <span>EjoAfrica</span>
                    </Link>
                </div>

                <nav className="flex-grow px-4 space-y-1">
                    {filteredItems.map((item, idx) => (
                        <Link
                            key={idx}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl transition-all"
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t px-6">
                    <form action="/api/auth/logout" method="POST">
                        <button className="flex items-center gap-3 w-full text-sm font-medium text-red-500 hover:bg-red-50 p-3 rounded-xl transition-all">
                            <LogOut className="w-5 h-5" />
                            Logout
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow pb-24 md:pb-8">
                {/* Header - Desktop & Mobile */}
                <header className="bg-white border-b px-6 h-16 flex items-center justify-between sticky top-0 z-30">
                    <div className="md:hidden flex items-center gap-2 font-bold text-emerald-600">
                        <GraduationCap className="w-6 h-6" />
                        <span>EjoAfrica</span>
                    </div>
                    <div className="hidden md:block">
                        <h2 className="text-lg font-bold capitalize">{role.toLowerCase().replace('_', ' ')} Dashboard</h2>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="hidden sm:block text-right">
                            <p className="font-bold">{session.email}</p>
                            <p className="text-xs text-gray-400 capitalize">{role.toLowerCase()}</p>
                        </div>
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold border-2 border-white shadow-sm">
                            {(session.email as string)[0].toUpperCase()}
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>

            {/* Bottom Nav - Mobile */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white border-t px-6 h-20 flex items-center justify-between z-40 pb-safe">
                {filteredItems.slice(0, 4).map((item, idx) => (
                    <Link key={idx} href={item.href} className="flex flex-col items-center gap-1 text-gray-400 hover:text-emerald-600">
                        {item.icon}
                        <span className="text-[10px] font-bold uppercase">{item.label.split(' ')[0]}</span>
                    </Link>
                ))}
                <Link href="/dashboard/more" className="flex flex-col items-center gap-1 text-gray-400">
                    <Menu className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase">More</span>
                </Link>
            </nav>
        </div>
    );
}
