"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

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
        country: "",
        city: "",
        address: "",
        school: "",
    });

    if (!isOpen) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
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

    const inputClass = "w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all";
    const labelClass = "text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1 block";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl animate-fade-up overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold">Register New User</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>First Name</label>
                            <input
                                required
                                className={inputClass}
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Last Name</label>
                            <input
                                required
                                className={inputClass}
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Email Address</label>
                            <input
                                type="email"
                                required
                                className={inputClass}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>User Role</label>
                            <select
                                className={inputClass}
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="SCHOOL_ADMIN">School Administrator</option>
                                <option value="DOS">Director of Studies</option>
                                <option value="DOD">Director of Discipline</option>
                                <option value="TEACHER">Teacher</option>
                                <option value="STUDENT">Student</option>
                                <option value="PARENT">Parent / Tutor</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Password</label>
                            <input
                                type="password"
                                required
                                className={inputClass}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Confirm Password</label>
                            <input
                                type="password"
                                required
                                className={inputClass}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className={labelClass}>Phone</label>
                            <input
                                className={inputClass}
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Account PIN</label>
                            <input
                                className={inputClass}
                                value={formData.accountPin}
                                onChange={(e) => setFormData({ ...formData, accountPin: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Country</label>
                            <input
                                className={inputClass}
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-4 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create User Account"}
                    </button>
                </form>
            </div>
        </div>
    );
}
