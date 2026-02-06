"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Mail, Lock, Loader2, AlertCircle, LogIn } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email");
        const password = formData.get("password");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Login failed");
            }

            // Successful login - redirect to dashboard base on role
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-20 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50 rounded-full blur-[100px] -mr-48 -mt-48 opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full blur-[100px] -ml-48 -mb-48 opacity-50"></div>

            <div className="max-w-md w-full space-y-10 glass-modal p-12 rounded-[4rem] animate-fade-up relative z-10">
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="bg-emerald-600 p-4 rounded-3xl text-white shadow-xl shadow-emerald-500/20">
                            <GraduationCap className="w-12 h-12" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Access Node</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Institutional Gateway</p>
                    </div>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 text-red-600 p-5 rounded-2xl flex items-center gap-4 text-xs font-bold border border-red-100 animate-shake italic">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p>PROTOCOL ERROR: {error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2 block">System Identifier</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="Email address"
                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-3xl px-14 py-5 text-sm font-bold text-gray-900 outline-none ring-4 ring-transparent focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2 block">Security Token</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    placeholder="Master Password"
                                    className="w-full bg-gray-50/50 border border-gray-100 rounded-3xl px-14 py-5 text-sm font-bold text-gray-900 outline-none ring-4 ring-transparent focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-900 text-white py-6 rounded-3xl flex items-center justify-center gap-4 font-black uppercase tracking-[0.3em] shadow-2xl shadow-gray-200 hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 transition-all text-xs"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Synchronizing...
                            </>
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                Initialize Access
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 leading-relaxed px-6">
                        Provisioned accounts only. Contact System Root for credentials.
                    </p>
                </div>
            </div>
        </div>
    );
}
