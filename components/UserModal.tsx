"use client";

import { useState, useEffect } from "react";
import { X, Loader2, ShieldCheck, RefreshCcw } from "lucide-react";
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

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        // Password matching check only if password is provided (required for create, optional for update)
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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-white/40 backdrop-blur-md" onClick={onClose} />

            <div className="relative bg-white border border-slate-100 w-full max-w-2xl rounded-[3rem] p-10 animate-fade-up overflow-y-auto max-h-[90vh] shadow-2xl">
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
                                <label className={labelClass}>Master Password {initialData && "(Leave blank to keep current)"}</label>
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
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 text-white py-6 rounded-3xl flex items-center justify-center gap-4 text-sm font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
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
        </div>
    );
}
