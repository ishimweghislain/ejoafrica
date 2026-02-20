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

import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardMobileNav from "@/components/DashboardMobileNav";

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

            <DashboardSidebar role={role} />


            {/* Main Content */}
            <main className="flex-grow pb-24 md:pb-8">
                {/* Header - Desktop & Mobile */}
                <header className="bg-white/80 backdrop-blur-md border-b px-6 h-16 flex items-center justify-between sticky top-0 z-30">
                    <div className="md:hidden flex items-center gap-2 font-black text-emerald-600">
                        <GraduationCap className="w-6 h-6" />
                        <span>eShuri</span>
                    </div>
                    <div className="hidden md:block">
                        <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">
                            {role.replace('_', ' ')} <span className="text-emerald-500">Portal</span>
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
            <DashboardMobileNav role={role} />
        </div>
    );
}
