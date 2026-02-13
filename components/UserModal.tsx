"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, ShieldCheck, RefreshCcw, Globe, MapPin, Hash } from "lucide-react";
import { toast } from "react-hot-toast";

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    defaultRole?: string;
    initialData?: any;
}

export default function UserModal({
    isOpen,
    onClose,
    onSuccess,
    defaultRole = "STUDENT",
    initialData
}: UserModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: defaultRole,
        phone: "",
        accountPin: "",
        country: "Rwanda",
        city: "Kigali",
        address: "",
        school: "Lycée de Kigali",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...formData,
                ...initialData,
                password: "", // Don't show password
                confirmPassword: "",
            });
        } else {
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                confirmPassword: "",
                role: defaultRole,
                phone: "",
                accountPin: "",
                country: "Rwanda",
                city: "Kigali",
                address: "",
                school: "Lycée de Kigali",
            });
        }
    }, [initialData, isOpen]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error("Security Validation Failed: Passwords do not match", {
                icon: "🔒",
            });
            setLoading(false);
            return;
        }

        try {
            const url = initialData ? `/api/users/${initialData.id}` : "/api/users";
            const method = initialData ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `Failed to ${initialData ? 'update' : 'create'} user`);

            toast.success(`Identity Provisioning Successful: Node ${initialData ? 'updated' : 'created'}.`, {
                icon: initialData ? "🔄" : "👤",
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(`PROTOCOL ERROR: ${err.message}`, {
                icon: "⚠️",
            });
        } finally {
            setLoading(false);
        }
    }

    const inputClass = "w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white outline-none transition-all shadow-sm";
    const labelClass = "text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-3 block ml-2";

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60" onClick={onClose} />

            <div className="relative bg-white border border-slate-100 w-full max-w-3xl rounded-[3rem] p-10 animate-fade-up overflow-y-auto max-h-[90vh] shadow-2xl">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                            {initialData ? <RefreshCcw className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 leading-tight">
                                {initialData ? "Update Identity" : "Identity Provisioning"}
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                {initialData ? "Modify Existing Node" : "Security Access Node"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10 px-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="space-y-8">
                            <section className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 pb-4 border-b border-gray-50">Identity Credentials</h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>First Name</label>
                                        <input required className={inputClass} value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Last Name</label>
                                        <input required className={inputClass} value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Institutional Email</label>
                                    <input type="email" required className={inputClass} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 pb-4 border-b border-gray-50">System Role</h4>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className={labelClass}>Assigned Role</label>
                                        <select className={inputClass} value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                            <option value="SCHOOL_ADMIN">School Administrator</option>
                                            <option value="DOS">Director of Studies</option>
                                            <option value="DOD">Director of Discipline</option>
                                            <option value="TEACHER">Teacher</option>
                                            <option value="STUDENT">Student</option>
                                            <option value="PARENT">Parent / Tutor</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Institutional Node</label>
                                        <input className={inputClass} value={formData.school} onChange={(e) => setFormData({ ...formData, school: e.target.value })} />
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="space-y-8">
                            <section className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 pb-4 border-b border-gray-50">Geographic Routing</h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>Country</label>
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/40" />
                                            <input className={`${inputClass} pl-12`} value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>City</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/40" />
                                            <input className={`${inputClass} pl-12`} value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>Phone Number</label>
                                        <input className={inputClass} placeholder="+250..." value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Account PIN (6 Digits)</label>
                                        <div className="relative">
                                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/40" />
                                            <input maxLength={6} className={`${inputClass} pl-12`} placeholder="******" value={formData.accountPin} onChange={(e) => setFormData({ ...formData, accountPin: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Physical Address</label>
                                    <input className={inputClass} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 pb-4 border-b border-gray-50">Security Access</h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>Master Password {initialData && "(Keep Blank)"}</label>
                                        <input
                                            type="password"
                                            required={!initialData}
                                            className={inputClass}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Verify Password</label>
                                        <input
                                            type="password"
                                            required={!!formData.password}
                                            className={inputClass}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-8 rounded-[2rem] flex items-center justify-center gap-4 text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-2xl shadow-slate-200 mt-6"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                {initialData ? <RefreshCcw className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                                {initialData ? "Finalize Synchronization" : "Finalize Enrollment"}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
}
