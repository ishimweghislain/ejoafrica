"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, HelpCircle, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface QuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function QuestionModal({ isOpen, onClose, onSuccess }: QuestionModalProps) {
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        text: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        difficulty: "MEDIUM",
        courseId: "",
        classId: "",
    });

    useEffect(() => {
        setMounted(true);
        async function loadData() {
            try {
                const [cRes, clRes] = await Promise.all([
                    fetch("/api/courses"),
                    fetch("/api/classes")
                ]);
                const [cData, clData] = await Promise.all([cRes.json(), clRes.json()]);
                setCourses(cData);
                setClasses(clData);
            } catch (err) {
                console.error(err);
            }
        }
        if (isOpen) loadData();
    }, [isOpen]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.correctAnswer) {
            toast.error("Please mark one option as the correct answer.");
            return;
        }

        setLoading(true);
        const tid = toast.loading("Saving question...");

        try {
            const res = await fetch("/api/questions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Failed to create question");

            toast.success("Question added successfully.", { id: tid, icon: "✅" });
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                text: "",
                options: ["", "", "", ""],
                correctAnswer: "",
                difficulty: "MEDIUM",
                courseId: "",
                classId: "",
            });
        } catch (err: any) {
            toast.error(err.message, { id: tid });
        } finally {
            setLoading(false);
        }
    }

    const inputClass = "w-full bg-slate-50/50 border border-slate-100 rounded-xl px-4 py-3 text-[12px] font-bold text-slate-900 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all";
    const labelClass = "text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2 block ml-2";

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] p-8 animate-fade-up overflow-y-auto max-h-[90vh] shadow-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-900 p-2.5 rounded-xl text-white">
                            <HelpCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Add New Question</h3>
                            <p className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Question Details</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Course</label>
                            <select required className={inputClass} value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}>
                                <option value="">Select Course</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.class.name})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Class (Optional)</label>
                            <select className={inputClass} value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })}>
                                <option value="">Inherit Course Class</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Question Text</label>
                        <textarea
                            required
                            className={`${inputClass} min-h-[100px] resize-none`}
                            placeholder="Type the question content here..."
                            value={formData.text}
                            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                        />
                    </div>

                    <div className="space-y-4">
                        <label className={labelClass}>Options & Correct Answer</label>
                        <div className="grid grid-cols-1 gap-3">
                            {formData.options.map((opt, i) => (
                                <div key={i} className="flex items-center gap-3 group">
                                    <div className="text-[10px] font-black text-slate-300 w-4 uppercase">{String.fromCharCode(65 + i)}</div>
                                    <input
                                        required
                                        className={`${inputClass} flex-grow`}
                                        placeholder={`Option ${i + 1}`}
                                        value={opt}
                                        onChange={(e) => {
                                            const newOps = [...formData.options];
                                            newOps[i] = e.target.value;
                                            setFormData({ ...formData, options: newOps });
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, correctAnswer: opt })}
                                        className={`p-3 rounded-xl transition-all ${formData.correctAnswer === opt && opt !== ""
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                            : 'bg-slate-50 text-slate-300 hover:bg-emerald-50 hover:text-emerald-500'
                                            }`}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex gap-4">
                            {["EASY", "MEDIUM", "HARD"].map(d => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, difficulty: d })}
                                    className={`px-4 py-2 rounded-lg text-[9px] font-black tracking-widest transition-all ${formData.difficulty === d
                                        ? 'bg-slate-900 text-white shadow-lg'
                                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                        }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-emerald-600 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Question"}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
