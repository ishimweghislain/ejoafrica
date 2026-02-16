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
    const [classes, setClasses] = useState<any[]>([]);
    const [availableCourses, setAvailableCourses] = useState<any[]>([]);
    const [fetchingCourses, setFetchingCourses] = useState(false);

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
        classId: "",
        // New fields for student/parent logic
        courseIds: [] as string[],
        studentIds: [] as string[],
        parent1: { firstName: "", lastName: "", email: "", phone: "", password: "" },
        parent2: { firstName: "", lastName: "", email: "", phone: "", password: "" },
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                password: "",
                confirmPassword: "",
                classId: initialData.classId || "",
                courseIds: initialData.studyingCourses?.map((c: any) => c.id) || [],
                studentIds: initialData.children?.map((c: any) => c.id) || [],
                parent1: initialData.parents?.[0] ? { ...initialData.parents[0], password: "" } : { firstName: "", lastName: "", email: "", phone: "", password: "" },
                parent2: initialData.parents?.[1] ? { ...initialData.parents[1], password: "" } : { firstName: "", lastName: "", email: "", phone: "", password: "" },
            });
        }
    }, [initialData, isOpen]);

    const [allStudents, setAllStudents] = useState<any[]>([]);

    // 1. Fetch Basic Data (Classes)
    useEffect(() => {
        async function fetchClasses() {
            try {
                const res = await fetch("/api/classes");
                const data = await res.json();
                setClasses(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to load classes:", err);
            }
        }
        if (isOpen) fetchClasses();
    }, [isOpen]);

    // 2. Fetch Dependent Data (Courses for Student/Class)
    useEffect(() => {
        async function fetchCourses() {
            if (!formData.classId) {
                setAvailableCourses([]);
                return;
            }
            setFetchingCourses(true);
            try {
                const res = await fetch(`/api/courses?classId=${formData.classId}`);
                const data = await res.json();
                setAvailableCourses(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to load courses:", err);
            } finally {
                setFetchingCourses(false);
            }
        }
        if (isOpen && formData.role === "STUDENT" && formData.classId) {
            fetchCourses();
        }
    }, [isOpen, formData.classId, formData.role]);

    // 3. Fetch Students for Parent accounts
    useEffect(() => {
        async function fetchStudents() {
            if (formData.role === "PARENT") {
                const res = await fetch("/api/users?role=STUDENT");
                const data = await res.json();
                setAllStudents(data);
            }
        }
        if (isOpen && formData.role === "PARENT") fetchStudents();
    }, [isOpen, formData.role]);

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

        // Validate at least one parent if student
        if (formData.role === "STUDENT") {
            if (!formData.parent1.firstName || !formData.parent1.email) {
                toast.error("Guardian Data Required: At least one parent is mandatory.", { icon: "👨‍👩-👧" });
                setLoading(false);
                return;
            }
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

            toast.success(`Account ${initialData ? 'updated' : 'created'} successfully.`, {
                icon: initialData ? "🔄" : "👤",
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(`Error: ${err.message}`, {
                icon: "⚠️",
            });
        } finally {
            setLoading(false);
        }
    }

    const inputClass = "w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-[12px] font-bold text-gray-900 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white outline-none transition-all shadow-sm";
    const labelClass = "text-[9px] font-black uppercase text-gray-500 tracking-[0.2em] mb-2 block ml-2";

    if (!isOpen || !mounted) return null;

    const toggleCourse = (id: string) => {
        setFormData(prev => ({
            ...prev,
            courseIds: prev.courseIds.includes(id)
                ? prev.courseIds.filter(cid => cid !== id)
                : [...prev.courseIds, id]
        }));
    };

    const toggleStudent = (id: string) => {
        setFormData(prev => ({
            ...prev,
            studentIds: prev.studentIds.includes(id)
                ? prev.studentIds.filter(cid => cid !== id)
                : [...prev.studentIds, id]
        }));
    };

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 transition-opacity animate-in fade-in" onClick={onClose} />

            <div className="relative bg-white border border-slate-100 w-full max-w-6xl rounded-[3rem] p-8 md:p-12 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[92vh] shadow-2xl">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-5">
                        <div className="bg-emerald-500 p-3.5 rounded-2xl text-white shadow-xl shadow-emerald-500/20">
                            {initialData ? <RefreshCcw className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 leading-tight uppercase tracking-tighter">
                                {initialData ? "Update Profile" : "Add New Account"}
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">
                                {initialData ? "Modify Details" : "Identity Provisioning"}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-gray-100 rounded-2xl transition-all border border-transparent hover:border-gray-100">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Column 1: Core Identity */}
                        <div className="space-y-8">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 pb-4 border-b-2 border-emerald-50">Personal Identity</h4>
                            <div className="grid grid-cols-2 gap-4">
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>System Role</label>
                                    <select className={inputClass} value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                        <option value="SCHOOL_ADMIN">Admin</option>
                                        <option value="DOS">DOS</option>
                                        <option value="DOD">DOD</option>
                                        <option value="TEACHER">Teacher</option>
                                        <option value="STUDENT">Student</option>
                                        <option value="PARENT">Parent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>School Name</label>
                                    <input className={inputClass} value={formData.school} onChange={(e) => setFormData({ ...formData, school: e.target.value })} />
                                </div>
                            </div>

                            {formData.role === "STUDENT" && (
                                <div>
                                    <label className={labelClass}>Class Level</label>
                                    <select className={inputClass} value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })}>
                                        <option value="">Select Level</option>
                                        {classes.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className={labelClass}>Access Password {initialData && "(Leave blank to keep current)"}</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="password" required={!initialData} className={inputClass} placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                                    <input type="password" required={!!formData.password} className={inputClass} placeholder="Confirm" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Geographic & Contact */}
                        <div className="space-y-8">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 pb-4 border-b-2 border-emerald-50">Contact & Security</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Phone Signal</label>
                                    <input className={inputClass} placeholder="+250..." value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelClass}>Account PIN</label>
                                    <input maxLength={6} className={inputClass} placeholder="6 Digits" value={formData.accountPin} onChange={(e) => setFormData({ ...formData, accountPin: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Country</label>
                                    <input className={inputClass} value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                                </div>
                                <div>
                                    <label className={labelClass}>City</label>
                                    <input className={inputClass} value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Full Address</label>
                                <input className={inputClass} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                            </div>

                            {formData.role === "STUDENT" && formData.classId && (
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col h-[250px]">
                                    <label className={labelClass}>Academic Courses</label>
                                    {fetchingCourses ? (
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 p-2">
                                            <Loader2 className="w-3 h-3 animate-spin" /> Syncing courses...
                                        </div>
                                    ) : availableCourses.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-2 overflow-y-auto pr-2 custom-scrollbar">
                                            {availableCourses.map(course => (
                                                <button
                                                    key={course.id}
                                                    type="button"
                                                    onClick={() => toggleCourse(course.id)}
                                                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${formData.courseIds.includes(course.id)
                                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                                                        : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-300'
                                                        }`}
                                                >
                                                    <span className="text-[10px] font-black uppercase tracking-tight truncate pr-2">{course.title}</span>
                                                    {formData.courseIds.includes(course.id) && <ShieldCheck className="w-4 h-4 flex-shrink-0" />}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[9px] font-bold text-slate-400 p-2 italic text-center mt-auto mb-auto">No courses found for this level.</p>
                                    )}
                                </div>
                            )}

                            {formData.role === "PARENT" && (
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col h-[250px]">
                                    <label className={labelClass}>Linked Students (Children)</label>
                                    {allStudents.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-2 overflow-y-auto pr-2 custom-scrollbar">
                                            {allStudents.map(student => (
                                                <button
                                                    key={student.id}
                                                    type="button"
                                                    onClick={() => toggleStudent(student.id)}
                                                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${formData.studentIds.includes(student.id)
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                        : 'bg-white border-slate-100 text-slate-600 hover:border-blue-300'
                                                        }`}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black uppercase tracking-tight">{student.firstName} {student.lastName}</span>
                                                        <span className={`text-[8px] font-bold uppercase ${formData.studentIds.includes(student.id) ? 'text-blue-100' : 'text-slate-400'}`}>{student.class?.name || "No Class"}</span>
                                                    </div>
                                                    {formData.studentIds.includes(student.id) && <ShieldCheck className="w-4 h-4 flex-shrink-0" />}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[9px] font-bold text-slate-400 p-2 italic text-center mt-auto mb-auto">No student identities found.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Column 3: Guardians (Only for Students) */}
                        <div className="space-y-8">
                            {formData.role === "STUDENT" ? (
                                <div className="space-y-8 bg-slate-50/50 p-8 rounded-[3rem] border border-slate-100">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 pb-4 border-b-2 border-emerald-100/30">Guardians</h4>

                                    {/* Parent 1 */}
                                    <div className="space-y-5">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Primary Parent</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input className={inputClass} placeholder="First Name" value={formData.parent1.firstName} onChange={(e) => setFormData({ ...formData, parent1: { ...formData.parent1, firstName: e.target.value } })} />
                                            <input className={inputClass} placeholder="Last Name" value={formData.parent1.lastName} onChange={(e) => setFormData({ ...formData, parent1: { ...formData.parent1, lastName: e.target.value } })} />
                                        </div>
                                        <input type="email" className={inputClass} placeholder="Email Address" value={formData.parent1.email} onChange={(e) => setFormData({ ...formData, parent1: { ...formData.parent1, email: e.target.value } })} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input className={inputClass} placeholder="Phone" value={formData.parent1.phone} onChange={(e) => setFormData({ ...formData, parent1: { ...formData.parent1, phone: e.target.value } })} />
                                            <input type="password" className={inputClass} placeholder="Access Key" value={formData.parent1.password} onChange={(e) => setFormData({ ...formData, parent1: { ...formData.parent1, password: e.target.value } })} />
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-100 my-8" />

                                    {/* Parent 2 */}
                                    <div className="space-y-5">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Secondary Parent</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input className={inputClass} placeholder="First Name" value={formData.parent2.firstName} onChange={(e) => setFormData({ ...formData, parent2: { ...formData.parent2, firstName: e.target.value } })} />
                                            <input className={inputClass} placeholder="Last Name" value={formData.parent2.lastName} onChange={(e) => setFormData({ ...formData, parent2: { ...formData.parent2, lastName: e.target.value } })} />
                                        </div>
                                        <input type="email" className={inputClass} placeholder="Email Address" value={formData.parent2.email} onChange={(e) => setFormData({ ...formData, parent2: { ...formData.parent2, email: e.target.value } })} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input className={inputClass} placeholder="Phone" value={formData.parent2.phone} onChange={(e) => setFormData({ ...formData, parent2: { ...formData.parent2, phone: e.target.value } })} />
                                            <input type="password" className={inputClass} placeholder="Access Key" value={formData.parent2.password} onChange={(e) => setFormData({ ...formData, parent2: { ...formData.parent2, password: e.target.value } })} />
                                        </div>
                                    </div>
                                    <p className="text-[8px] font-bold text-slate-400 italic text-center px-4">Parents can log in using their email and the provided access key.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/20 h-full min-h-[400px]">
                                    <ShieldCheck className="w-16 h-16 text-slate-100 mb-6" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 text-center leading-relaxed max-w-[200px]">
                                        Guardian data is only provisioned for student identity nodes.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 text-white py-5 rounded-2xl flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 mt-4"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                            <>
                                {initialData ? <RefreshCcw className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                {initialData ? "Save Changes" : "Create User Account"}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>,
        document.body
    );
}
