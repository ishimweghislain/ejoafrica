"use client";

import { useState, useEffect } from "react";
import { User, Mail, Shield, Smartphone, Globe, MapPin, Hash, Loader2, Save } from "lucide-react";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<any>(null);

    async function fetchProfile() {
        try {
            const res = await fetch("/api/auth/me");
            const data = await res.json();
            setUser(data);
        } catch (err) {
            toast.error("Failed to load profile details.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchProfile();
    }, []);

    async function handleUpdate(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        const tid = toast.loading("Saving profile changes...");
        try {
            const res = await fetch(`/api/users/${user.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            });
            if (!res.ok) throw new Error("Could not save changes.");
            toast.success("Profile updated successfully.", { id: tid });
            fetchProfile();
        } catch (err: any) {
            toast.error(`Error: ${err.message}`, { id: tid });
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading profile...</p>
            </div>
        );
    }

    const inputClass = "w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-8 focus:ring-emerald-500/5 focus:bg-white outline-none transition-all shadow-sm";
    const labelClass = "text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3 block ml-2";

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-fade-up">
            <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase tracking-tighter">Account Settings</h1>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-emerald-600">Configure your personal account and contact information.</p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-8">
                <div className="bg-white rounded-[3rem] border border-slate-100 p-10 md:p-16 shadow-sm space-y-12">
                    <section className="space-y-8">
                        <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                            <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-black uppercase tracking-widest text-xs text-slate-900">Personal Information</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Your basic identification details.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelClass}>First Name</label>
                                <input className={inputClass} value={user.firstName} onChange={e => setUser({ ...user, firstName: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Last Name</label>
                                <input className={inputClass} value={user.lastName} onChange={e => setUser({ ...user, lastName: e.target.value })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input className={`${inputClass} pl-14`} value={user.email} onChange={e => setUser({ ...user, email: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                            <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg shadow-slate-900/20">
                                <Globe className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-black uppercase tracking-widest text-xs text-slate-900">Contact Information</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Address and phone number details.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <label className={labelClass}>Country</label>
                                <input className={inputClass} value={user.country || ""} onChange={e => setUser({ ...user, country: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>City</label>
                                <input className={inputClass} value={user.city || ""} onChange={e => setUser({ ...user, city: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Phone</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input className={`${inputClass} pl-14`} value={user.phone || ""} onChange={e => setUser({ ...user, phone: e.target.value })} />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Physical Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input className={`${inputClass} pl-14`} value={user.address || ""} onChange={e => setUser({ ...user, address: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Security PIN</label>
                                <div className="relative">
                                    <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input className={`${inputClass} pl-14`} value={user.accountPin || ""} onChange={e => setUser({ ...user, accountPin: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    </section>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-emerald-600 text-white py-8 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-emerald-600/20 hover:bg-emerald-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
