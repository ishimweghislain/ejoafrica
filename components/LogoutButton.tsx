"use client";

import { LogOut, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

export default function LogoutButton() {
    const [showConfirm, setShowConfirm] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        const tid = toast.loading("Terminating session protocol...");
        try {
            const res = await fetch("/api/auth/logout", {
                method: "POST",
            });

            if (res.ok) {
                toast.success("Session Terminated.", { id: tid, icon: "🔒" });
                router.push("/login");
            } else {
                throw new Error("Logout failed");
            }
        } catch (error) {
            toast.error("Protocol Error: Logout failed", { id: tid });
        }
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                className="w-full bg-slate-900 text-white p-4 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-red-500 transition-all font-black uppercase tracking-widest text-[10px] group shadow-2xl shadow-slate-200"
            >
                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Terminate Session</span>
            </button>

            {showConfirm && mounted && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60"
                        onClick={() => setShowConfirm(false)}
                    />
                    <div className="relative bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-fade-up border border-slate-100">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="bg-red-50 p-6 rounded-[2.5rem] text-red-500 shadow-xl shadow-red-500/10">
                                <LogOut className="w-10 h-10" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-tight">Close Session?</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                    Securely terminate your connection to the institutional node?
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 w-full pt-6">
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="bg-slate-50 text-slate-400 py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Stay
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-500 text-white py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
