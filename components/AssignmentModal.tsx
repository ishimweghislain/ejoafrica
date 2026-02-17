"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2, Loader2, ClipboardList, Clock, Info, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface AssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface Question {
    text: string;
    options: string[];
    correctAnswer: string;
    marks: number;
    timer: number;
    difficulty: string;
}

export default function AssignmentModal({ isOpen, onClose, onSuccess }: AssignmentModalProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);
    const [classes, setClasses] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        deadline: "",
        classId: "",
        courseId: "",
    });

    const [questions, setQuestions] = useState<Question[]>([
        { text: "", options: ["", "", "", ""], correctAnswer: "", marks: 5, timer: 60, difficulty: "MEDIUM" }
    ]);

    useEffect(() => {
        async function loadData() {
            try {
                const [clsRes, crsRes] = await Promise.all([
                    fetch("/api/classes"),
                    fetch("/api/courses")
                ]);
                const [clsData, crsData] = await Promise.all([clsRes.json(), crsRes.json()]);
                setClasses(clsData);
                setCourses(crsData);
            } catch (err) {
                console.error(err);
            } finally {
                setFetchingData(false);
            }
        }
        if (isOpen) loadData();
    }, [isOpen]);

    const addQuestion = () => {
        setQuestions([...questions, { text: "", options: ["", "", "", ""], correctAnswer: "", marks: 5, timer: 60, difficulty: "MEDIUM" }]);
    };

    const removeQuestion = (idx: number) => {
        if (questions.length > 1) {
            setQuestions(questions.filter((_, i) => i !== idx));
        }
    };

    const handleQuestionChange = (idx: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions];
        newQuestions[idx] = { ...newQuestions[idx], [field]: value };
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIdx: number, oIdx: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIdx].options[oIdx] = value;
        setQuestions(newQuestions);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!formData.classId || !formData.courseId) return toast.error("Select Class and Course");

        // Validate questions
        for (let i = 0; i < questions.length; i++) {
            if (!questions[i].text) return toast.error(`Question ${i + 1} is empty`);
            if (!questions[i].correctAnswer) return toast.error(`Question ${i + 1} has no correct answer`);
            if (questions[i].options.some(o => !o)) return toast.error(`Question ${i + 1} has empty options`);
        }

        setLoading(true);
        const tid = toast.loading("Saving assignment...");

        try {
            const res = await fetch("/api/assignments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, questions }),
            });

            if (!res.ok) throw new Error("Failed to save assignment");

            toast.success("Assignment saved successfully", { id: tid });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.message, { id: tid });
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen || !mounted) return null;

    const inputClass = "w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all";
    const labelClass = "text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block ml-2";

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-fade-up">
                {/* Header */}
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-5">
                        <div className="bg-slate-900 p-4 rounded-[1.5rem] text-white shadow-xl">
                            <ClipboardList className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">Create Assignment</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Add new questions for your students</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    {fetchingData ? (
                        <div className="py-20 flex flex-col items-center gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading System Metadata...</p>
                        </div>
                    ) : (
                        <>
                            {/* Metadata Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="md:col-span-2 space-y-6">
                                    <div className="space-y-4">
                                        <label className={labelClass}>Assignment Title</label>
                                        <input
                                            required
                                            className={inputClass}
                                            placeholder="e.g. Mathematics Mid-term"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className={labelClass}>Instructions</label>
                                        <textarea
                                            className={`${inputClass} h-32 resize-none`}
                                            placeholder="Tell students what to do..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-6 shadow-sm">
                                        <div>
                                            <label className={labelClass}>Deadline</label>
                                            <input
                                                type="datetime-local"
                                                className={inputClass}
                                                value={formData.deadline}
                                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Class Designation</label>
                                            <select required className={inputClass} value={formData.classId} onChange={(e) => setFormData({ ...formData, classId: e.target.value })}>
                                                <option value="">Select Level</option>
                                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Course Subject</label>
                                            <select required className={inputClass} value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}>
                                                <option value="">Select Subject</option>
                                                {courses.filter(c => !formData.classId || c.classId === formData.classId).map(c => (
                                                    <option key={c.id} value={c.id}>{c.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Questions Section */}
                            <div className="space-y-8">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Questions</h4>
                                    </div>
                                    <span className="bg-slate-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase text-slate-500 tracking-widest">{questions.length} Questions</span>
                                </div>

                                <div className="space-y-12">
                                    {questions.map((q, qIdx) => (
                                        <div key={qIdx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative group/card hover:shadow-xl transition-all">
                                            <div className="absolute -left-4 top-8 w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-xs shadow-xl italic">
                                                {qIdx + 1}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeQuestion(qIdx)}
                                                className="absolute -right-3 -top-3 p-3 bg-white text-red-500 border border-red-50 rounded-2xl shadow-xl opacity-0 group-hover/card:opacity-100 hover:bg-red-500 hover:text-white transition-all z-10"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                                <div className="md:col-span-3 space-y-6">
                                                    <div>
                                                        <label className={labelClass}>Question</label>
                                                        <input
                                                            className={`${inputClass} text-lg py-5 border-none bg-slate-50/50 placeholder:italic`}
                                                            placeholder="Enter your question here..."
                                                            value={q.text}
                                                            onChange={(e) => handleQuestionChange(qIdx, 'text', e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {q.options.map((opt, oIdx) => {
                                                            const isCorrect = q.correctAnswer === opt && opt !== "";
                                                            return (
                                                                <div key={oIdx} className="relative group/opt">
                                                                    <input
                                                                        className={`${inputClass} pr-12 ${isCorrect ? 'border-emerald-500 ring-4 ring-emerald-500/5 bg-emerald-50/20' : ''}`}
                                                                        placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                                                        value={opt}
                                                                        onChange={(e) => handleOptionChange(qIdx, oIdx, e.target.value)}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleQuestionChange(qIdx, 'correctAnswer', opt)}
                                                                        className={`absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${isCorrect ? 'bg-emerald-500 text-white' : 'text-slate-200 hover:text-emerald-500 hover:bg-emerald-50'}`}
                                                                        title="Mark as correct answer"
                                                                    >
                                                                        <CheckCircle2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <div className="space-y-6 bg-slate-50/30 p-6 rounded-[2rem] border border-slate-50">
                                                    <div>
                                                        <label className={labelClass}>Marks</label>
                                                        <div className="relative">
                                                            <input
                                                                type="number"
                                                                className={inputClass}
                                                                value={q.marks}
                                                                onChange={(e) => handleQuestionChange(qIdx, 'marks', e.target.value)}
                                                            />
                                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Points</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className={labelClass}>Time Limit</label>
                                                        <div className="relative">
                                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                                            <input
                                                                type="number"
                                                                className={`${inputClass} pl-12`}
                                                                value={q.timer}
                                                                onChange={(e) => handleQuestionChange(qIdx, 'timer', e.target.value)}
                                                            />
                                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">Sec</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className={labelClass}>Difficulty</label>
                                                        <select
                                                            className={inputClass}
                                                            value={q.difficulty}
                                                            onChange={(e) => handleQuestionChange(qIdx, 'difficulty', e.target.value)}
                                                        >
                                                            <option value="EASY">EASY</option>
                                                            <option value="MEDIUM">MEDIUM</option>
                                                            <option value="HARD">HARD</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={addQuestion}
                                        className="w-full py-8 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 text-slate-300 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50/30 transition-all group"
                                    >
                                        <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                            <Plus className="w-8 h-8" />
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-[0.2em] italic">Add Another Question</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </form>

                {/* Footer */}
                <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-slate-400">
                        <Info className="w-5 h-5" />
                        <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Ensure all correct answers are mapped before deployment.</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-white transition-all"
                        >
                            Abort Protocol
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/10 hover:bg-emerald-600 transition-all flex items-center gap-3 min-w-[200px] justify-center"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>Create Assignment</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
