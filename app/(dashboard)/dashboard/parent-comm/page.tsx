"use client";

import { useState, useEffect, useRef } from "react";
import {
    MessageSquare, Search, Users, Send, Loader2,
    UserX, ChevronRight, ArrowLeft, User, Bell
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Parent {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
}

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    class?: { name: string };
    parents: Parent[];
}

interface Message {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
}

function timeAgo(date: string) {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export default function ParentCommPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<Student | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [newMsg, setNewMsg] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEnd = useRef<HTMLDivElement>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        fetch("/api/users?role=STUDENT")
            .then(r => r.json())
            .then(d => setStudents(Array.isArray(d) ? d : []))
            .catch(() => toast.error("Failed to load students."))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selected) return;
        loadMessages();
        pollRef.current = setInterval(loadMessages, 8000);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [selected]);

    useEffect(() => {
        messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function loadMessages() {
        if (!selected) return;
        setLoadingMsgs(true);
        try {
            const all = await fetch("/api/notifications").then(r => r.json());
            const thread = Array.isArray(all)
                ? all
                    .filter((n: any) => n.type === "MESSAGE" && n.message.includes(`[STUDENT:${selected.id}]`))
                    .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                : [];
            setMessages(thread);
        } catch { /* silent */ }
        finally { setLoadingMsgs(false); }
    }

    async function sendMessage() {
        if (!selected || !newMsg.trim()) return;
        setSending(true);
        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId: selected.id, message: newMsg.trim() })
            });
            if (!res.ok) throw new Error("Failed");
            setNewMsg("");
            toast.success("Message sent to parents!");
            await loadMessages();
        } catch {
            toast.error("Could not send message.");
        } finally {
            setSending(false);
        }
    }

    const filtered = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        (s.class?.name || "").toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading students...</p>
        </div>
    );

    // ── Chat view ─────────────────────────────────────────────────────────────
    if (selected) {
        const hasParents = selected.parents.length > 0;

        return (
            <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-up">

                {/* Header */}
                <div className="bg-white border-b border-slate-100 rounded-tl-[2rem] rounded-tr-[2rem] px-6 py-5 flex items-center gap-4 shadow-sm shrink-0">
                    <button
                        onClick={() => { setSelected(null); setMessages([]); if (pollRef.current) clearInterval(pollRef.current); }}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-sm shrink-0">
                        {selected.firstName[0]}{selected.lastName[0]}
                    </div>
                    <div className="flex-grow min-w-0">
                        <h3 className="font-black text-slate-900 uppercase tracking-tighter truncate">{selected.firstName} {selected.lastName}</h3>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            {selected.class?.name || "No class"} •{" "}
                            {hasParents
                                ? selected.parents.map(p => `${p.firstName} ${p.lastName}`).join(", ")
                                : "No parent assigned"
                            }
                        </p>
                    </div>
                    {!hasParents && (
                        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 shrink-0">
                            <UserX className="w-4 h-4 text-amber-500" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-amber-700">No parent assigned</p>
                        </div>
                    )}
                </div>

                {/* Parent contact strip */}
                {hasParents && (
                    <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-3 flex flex-wrap gap-4 shrink-0">
                        {selected.parents.map(p => (
                            <div key={p.id} className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-[9px] font-black shrink-0">
                                    {p.firstName[0]}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-emerald-800">{p.firstName} {p.lastName}</p>
                                    <p className="text-[9px] text-emerald-600">{p.email}{p.phone ? ` · ${p.phone}` : ""}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Messages */}
                <div className="flex-grow overflow-y-auto bg-slate-50/50 p-6 space-y-3">
                    {loadingMsgs && messages.length === 0 ? (
                        <div className="py-10 flex items-center justify-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Loading conversation...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 py-16">
                            <MessageSquare className="w-14 h-14 text-slate-200" />
                            <div className="text-center">
                                <p className="font-black text-slate-900 uppercase">No messages yet</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">Start the conversation below.</p>
                            </div>
                        </div>
                    ) : messages.map(msg => {
                        const rawText = msg.message
                            .replace(/\[STUDENT:[^\]]+\]/g, "")
                            .replace(/\[FROM:[^\]]+\]/g, "")
                            .trim();
                        const isParentReply = msg.message.includes("[FROM:");

                        return (
                            <div key={msg.id} className={`flex ${isParentReply ? "justify-start" : "justify-end"}`}>
                                <div className={`max-w-[72%] rounded-[1.5rem] px-5 py-4 space-y-1 ${isParentReply
                                    ? "bg-white border border-slate-100 text-slate-900 shadow-sm rounded-bl-sm"
                                    : "bg-slate-900 text-white rounded-br-sm"
                                    }`}>
                                    <p className={`text-[8px] font-black uppercase tracking-widest mb-1.5 ${isParentReply ? "text-slate-400" : "text-emerald-400"}`}>
                                        {isParentReply ? "Parent Reply" : "You (School)"}
                                    </p>
                                    <p className={`text-sm leading-relaxed ${isParentReply ? "text-slate-800 font-medium" : "text-white font-semibold"}`}>
                                        {rawText}
                                    </p>
                                    <p className={`text-[8px] mt-1.5 ${isParentReply ? "text-slate-300" : "text-slate-500"}`}>
                                        {timeAgo(msg.createdAt)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEnd} />
                </div>

                {/* Input */}
                <div className="bg-white border-t border-slate-100 p-4 flex gap-3 shrink-0">
                    <textarea
                        className="flex-grow bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium resize-none outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all placeholder:text-slate-300"
                        rows={2}
                        placeholder={hasParents
                            ? `Message to ${selected.parents.map(p => p.firstName).join(" & ")} about ${selected.firstName}... (Ctrl+Enter to send)`
                            : "No parent assigned — message will be noted internally only"}
                        value={newMsg}
                        onChange={e => setNewMsg(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) sendMessage(); }}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={sending || !newMsg.trim()}
                        className="bg-slate-900 text-white px-5 rounded-2xl hover:bg-emerald-600 transition-all shadow-lg disabled:opacity-40 flex flex-col items-center justify-center gap-1.5 w-14 shrink-0"
                    >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
            </div>
        );
    }

    // ── Student list ──────────────────────────────────────────────────────────
    return (
        <div className="space-y-8 animate-fade-up">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">Parent Communication</h1>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mt-1">
                        Send messages to parents about their child
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3 text-center shadow-sm">
                        <p className="text-2xl font-black text-emerald-700">{students.filter(s => s.parents.length > 0).length}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">With Parents</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3 text-center shadow-sm">
                        <p className="text-2xl font-black text-amber-700">{students.filter(s => s.parents.length === 0).length}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">No Parent</p>
                    </div>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                    className="w-full bg-white border border-slate-100 rounded-2xl pl-10 pr-5 py-4 text-xs font-semibold outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-sm focus:border-emerald-400 transition-all"
                    placeholder="Search student or class..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {filtered.length === 0 ? (
                <div className="py-24 flex flex-col items-center gap-4 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                    <Users className="w-12 h-12 text-slate-200" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">No students found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(student => {
                        const hasParents = student.parents.length > 0;
                        return (
                            <button
                                key={student.id}
                                onClick={() => setSelected(student)}
                                className="bg-white border border-slate-100 rounded-[2rem] p-6 text-left hover:shadow-xl hover:border-emerald-200 transition-all group space-y-4 shadow-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black shrink-0">
                                        {student.firstName[0]}{student.lastName[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-black text-slate-900 uppercase tracking-tighter truncate">{student.firstName} {student.lastName}</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{student.class?.name || "No class"}</p>
                                    </div>
                                </div>

                                {/* Parents */}
                                {hasParents ? (
                                    <div className="space-y-2">
                                        {student.parents.map(p => (
                                            <div key={p.id} className="flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-2">
                                                <User className="w-3 h-3 text-emerald-600 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-black text-emerald-800 truncate">{p.firstName} {p.lastName}</p>
                                                    <p className="text-[9px] text-emerald-600 truncate">{p.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                                        <UserX className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                        <p className="text-[9px] font-black uppercase tracking-widest text-amber-700">No parent assigned yet</p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                    <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-600 group-hover:translate-x-1 transition-transform">
                                        <MessageSquare className="w-3 h-3" /> Open Chat
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
