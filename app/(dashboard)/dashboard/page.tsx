import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import {
    Users,
    BookOpen,
    Calendar,
    ClipboardList,
    GraduationCap,
    TrendingUp,
    Clock,
    MessageSquare
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

export default async function DashboardMainPage() {
    const session = await getSession();
    const role = session?.role as string;

    const stats = [
        { label: "Students", value: "1,240", icon: <Users className="w-5 h-5 text-blue-600" />, bg: "bg-blue-50" },
        { label: "Teachers", value: "48", icon: <Users className="w-5 h-5 text-emerald-600" />, bg: "bg-emerald-50" },
        { label: "Active Courses", value: "12", icon: <BookOpen className="w-5 h-5 text-orange-600" />, bg: "bg-orange-50" },
        { label: "Attendance", value: "98.2%", icon: <TrendingUp className="w-5 h-5 text-purple-600" />, bg: "bg-purple-50" },
    ];

    const activities = [
        { type: "exam", title: "Monthly Mathematics Test", time: "2 hours ago", icon: <ClipboardList className="w-4 h-4" /> },
        { type: "attendance", title: "Class 10A Attendance Marked", time: "4 hours ago", icon: <Calendar className="w-4 h-4" /> },
        { type: "message", title: "New Message from Principal", time: "Yesterday", icon: <MessageSquare className="w-4 h-4" /> },
    ];

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Welcome, {session?.email?.split('@')[0]}</h1>
                    <p className="text-gray-500 text-sm">Here is what's happening in EjoAfrica today.</p>
                </div>
                <div className="bg-white px-4 py-2 border rounded-xl flex items-center gap-3 shadow-sm">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <div className="text-xs">
                        <p className="font-bold text-gray-900">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                        <p className="text-gray-500 uppercase tracking-widest font-black text-[9px]">Term 1 • 2026 Academic Year</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-1">
                        <div className={`${stat.bg} p-4 rounded-xl`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-xl font-bold">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b flex items-center justify-between">
                        <h3 className="font-bold">Recent Updates</h3>
                        <button className="text-xs font-bold text-emerald-600 hover:underline">View All</button>
                    </div>
                    <div className="p-6 divide-y divide-gray-50">
                        {activities.map((act, idx) => (
                            <div key={idx} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0 group cursor-pointer">
                                <div className="bg-gray-50 p-3 rounded-full text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                    {act.icon}
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm font-bold group-hover:text-emerald-600 transition-colors">{act.title}</p>
                                    <p className="text-xs text-gray-400">{act.time}</p>
                                </div>
                                <div className="text-[10px] font-black uppercase px-2 py-1 bg-gray-100 rounded text-gray-400">
                                    {act.type}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Calendar / Quick Actions */}
                <div className="bg-emerald-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-500/20">
                    <div className="relative z-10 space-y-6">
                        <div className="bg-white/20 p-3 rounded-2xl w-fit">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold leading-tight">Modernize Your Workflow</h3>
                            <p className="text-emerald-100 text-sm">Create courses, manage students, and monitor academic progress with ease.</p>
                        </div>
                        <button className="w-full bg-white text-emerald-600 py-4 rounded-2xl font-bold text-sm shadow-lg hover:bg-emerald-50 transition-all active:scale-95">
                            Quick Setup Guide
                        </button>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                </div>
            </div>
        </div>
    );
}
