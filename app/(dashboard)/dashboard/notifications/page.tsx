"use client";

import { useState, useEffect } from "react";
import {
    Bell, Info, CheckCircle2, AlertTriangle,
    XCircle, Clock, Check, Loader2, Trash2, ArrowRight
} from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function fetchNotifications() {
        try {
            const res = await fetch("/api/notifications");
            const data = await res.json();
            setNotifications(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markRead = async (id: string) => {
        try {
            await fetch("/api/notifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });
            fetchNotifications();
            window.dispatchEvent(new Event('refreshNotifications'));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllRead = async () => {
        try {
            await fetch("/api/notifications", { method: "PUT" });
            fetchNotifications();
            window.dispatchEvent(new Event('refreshNotifications'));
            toast.success("All alerts cleared.");
        } catch (err) {
            toast.error("Process failed.");
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
            case 'WARNING': return <AlertTriangle className="w-6 h-6 text-orange-500" />;
            case 'ALARM': return <XCircle className="w-6 h-6 text-red-500" />;
            default: return <Info className="w-6 h-6 text-blue-500" />;
        }
    };

    return (
        <div className="space-y-10 animate-fade-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase tracking-tighter italic">Notifications</h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-emerald-600">Centralized system alerts and operational status updates for eShuri.</p>
                </div>
                <button
                    onClick={markAllRead}
                    className="bg-slate-900 text-white rounded-2xl px-8 py-4 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/10 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3"
                >
                    <Check className="w-4 h-4" />
                    <span>Verify All Alerts</span>
                </button>
            </div>

            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                {loading ? (
                    <div className="flex-grow flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Alert Cache...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                        {notifications.map((n) => (
                            <div key={n.id} className={`p-8 flex items-start gap-6 transition-all hover:bg-slate-50 relative group ${!n.read ? 'bg-emerald-50/20' : ''}`}>
                                {!n.read && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
                                )}
                                <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm border ${!n.read ? 'bg-white border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                                    {getIcon(n.type)}
                                </div>
                                <div className="flex-grow space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className={`text-lg font-black tracking-tighter uppercase italic ${!n.read ? 'text-slate-900' : 'text-slate-500'}`}>
                                            {n.title}
                                        </h4>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{new Date(n.createdAt).toLocaleString()}</span>
                                            </div>
                                            {!n.read && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                                                    className="p-2 transition-all hover:bg-emerald-100 rounded-lg text-emerald-600"
                                                    title="Mark as read"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                        <p className={`text-[11px] font-bold leading-relaxed uppercase tracking-wide max-w-4xl ${!n.read ? 'text-slate-600' : 'text-slate-400'}`}>
                                            {n.message}
                                        </p>
                                        {(n.message.toLowerCase().includes("assessment") || n.title.toLowerCase().includes("assessment")) ? (
                                            <Link
                                                href="/dashboard/live-assessments"
                                                className="flex-shrink-0 flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg"
                                            >
                                                Check Assessment <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        ) : (n.message.toLowerCase().includes("assignment") || n.message.toLowerCase().includes("submitted") || n.title.toLowerCase().includes("assignment")) && (
                                            <Link
                                                href="/dashboard/assignments"
                                                className="flex-shrink-0 flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg"
                                            >
                                                View Assignment <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                            <Bell className="w-10 h-10" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Alert Cache Empty</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No prioritized system notifications detected.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
