"use client";

import { useState } from "react";
import { UserPlus, Shield, Fingerprint, Loader2, CheckCircle2 } from "lucide-react";

export default function RegistrationPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "STUDENT",
        phone: "",
        accountPin: "",
        country: "Rwanda",
        city: "Kigali",
        address: "",
        school: "EjoAfrica Academy",
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        if (formData.password !== formData.confirmPassword) {
            setError("Security check failed: Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to register user");

            setSuccess(true);
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                confirmPassword: "",
                role: "STUDENT",
                phone: "",
                accountPin: "",
                country: "Rwanda",
                city: "Kigali",
                address: "",
                school: "EjoAfrica Academy",
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const inputClass = "w-full bg-white border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white outline-none transition-all shadow-sm";
    const labelClass = "text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-3 block ml-2";

    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-fade-up">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 mb-2">
                    <Fingerprint className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Biometric Identity Node</span>
                </div>
                <h1 className="text-4xl font-black tracking-tight text-gray-900">User Enrollment</h1>
                <p className="text-gray-500 max-w-lg mx-auto font-bold uppercase tracking-widest text-[10px]">Provision unique institutional access for staff, students, and parents.</p>
            </div>

            <div className="bg-white rounded-[3.5rem] shadow-2xl shadow-emerald-950/5 border border-gray-100 overflow-hidden">
                <div className="bg-gray-900 p-8 text-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500 rounded-2xl">
                            <UserPlus className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-black tracking-tight uppercase">Access Provisioning</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Protocol Version 2.0</p>
                        </div>
                    </div>
                    {success && (
                        <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest animate-bubble">
                            <CheckCircle2 className="w-4 h-4" />
                            Registered
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="p-10 md:p-16 space-y-12 bg-white">
                    {error && (
                        <div className="p-6 bg-red-50 border border-red-100 text-red-600 rounded-3xl text-sm font-bold leading-relaxed italic">
                            SECURITY WARNING: {error}
                        </div>
                    )}

                    <section className="space-y-8">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 pb-4 border-b border-gray-50">Identity Credentials</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelClass}>Legal First Name</label>
                                <input required className={inputClass} value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Legal Last Name</label>
                                <input required className={inputClass} value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Institutional Email Address</label>
                                <input type="email" required className={inputClass} placeholder="user@ejoafrica.edu" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 pb-4 border-b border-gray-50">Role & Security</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelClass}>Assigned System Role</label>
                                <select className={inputClass} value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="STUDENT">Student (Standard Access)</option>
                                    <option value="TEACHER">Teacher (Academic Educator)</option>
                                    <option value="DOS">Director of Studies (Curriculum)</option>
                                    <option value="DOD">Director of Discipline (Counselor)</option>
                                    <option value="PARENT">Parent / Tutor (Observer)</option>
                                    <option value="SCHOOL_ADMIN">System Administrator (Root)</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Security Account PIN (6 Digits)</label>
                                <input required className={inputClass} maxLength={6} placeholder="******" value={formData.accountPin} onChange={e => setFormData({ ...formData, accountPin: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Master Password</label>
                                <input type="password" required className={inputClass} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Verify Password</label>
                                <input type="password" required className={inputClass} value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-8">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 pb-4 border-b border-gray-50">Geographic Routing</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <label className={labelClass}>Mobile Contact</label>
                                <input className={inputClass} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>City Location</label>
                                <input className={inputClass} value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Physical Address</label>
                                <input className={inputClass} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                            </div>
                        </div>
                    </section>

                    <div className="pt-10">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 text-white rounded-[2rem] py-8 font-black uppercase tracking-[0.3em] shadow-2xl shadow-emerald-600/20 hover:bg-emerald-500 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 text-xs"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                <>
                                    <Shield className="w-5 h-5" />
                                    Finalize Provisioning
                                </>
                            )}
                        </button>
                        <p className="text-center text-[9px] font-black text-gray-400 mt-8 uppercase tracking-[0.3em] leading-relaxed">
                            By finalizing, you acknowledge immediate access creation <br /> for institutional nodes based on assigned role.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
