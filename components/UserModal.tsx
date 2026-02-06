"use client";

import { useState } from "react";
import { X, Loader2, ShieldCheck } from "lucide-react";

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    defaultRole?: string;
}

export default function UserModal({
    isOpen,
    onClose,
    onSuccess,
    defaultRole = "STUDENT"
}: UserModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
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

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Security Validation Failed: Passwords do not match");
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
            if (!res.ok) throw new Error(data.error || "Failed to create user");

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const inputClass = "w-full bg-gray-50/50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold text-gray-900 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white outline-none transition-all shadow-sm";
    const labelClass = "text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-3 block ml-2";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Lightened Backdrop */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-md" onClick={onClose} />

            <div className="relative glass-modal w-full max-w-2xl rounded-[3rem] p-10 animate-fade-up overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 leading-tight">Identity Provisioning</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Security Access Node</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {error && (
                    <div className="mb-8 p-6 bg-red-50 text-red-600 rounded-3xl text-sm font-bold border border-red-100 animate-bubble">
                        PROTOCOL ERROR: {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 pb-4 border-b border-gray-50">Personal Credentials</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>First Name</label>
                                <input required className={inputClass} value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Last Name</label>
                                <input required className={inputClass} value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 pb-4 border-b border-gray-50">System Parameters</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Institutional Email</label>
                                <input type="email" required className={inputClass} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            </div>
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
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 pb-4 border-b border-gray-50">Security Access</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={labelClass}>Master Password</label>
                                <input type="password" required className={inputClass} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                            <div>
                                <label className={labelClass}>Verify Password</label>
                                <input type="password" required className={inputClass} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-6 flex items-center justify-center gap-4 text-sm"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                <ShieldCheck className="w-5 h-5" />
                                Finalize Enrollment
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
