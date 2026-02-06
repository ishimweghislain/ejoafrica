"use client";

import { LogOut, AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function LogoutButton() {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleLogout = async () => {
        toast.loading("Deauthenticating institutional node...", { id: "logout" });
        try {
            const res = await fetch("/api/auth/logout", { method: "POST" });
            if (res.ok) {
                toast.success("Terminal Session Terminated.", { id: "logout", icon: "🔌" });
                window.location.href = "/login";
            } else {
                throw new Error("Logout failed");
            }
        } catch (error) {
            toast.error("Logout Protocol Error.", { id: "logout" });
        }
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                className="flex items-center gap-3 w-full text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 p-3 rounded-2xl transition-all"
            >
                <LogOut className="w-4 h-4" />
                Logout Session
            </button>

            {showConfirm && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setShowConfirm(false)}
                    />
                    <div className="relative bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-fade-up border border-slate-100">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="bg-red-50 p-4 rounded-3xl text-red-500 shadow-xl shadow-red-500/10">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Terminate Session?</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                    Are you sure you want to disconnect from the institutional gateway?
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 w-full pt-4">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="bg-slate-50 text-slate-400 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Abort
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
