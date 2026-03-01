"use client";

import { useState, useEffect, useRef } from "react";
import {
    MessageSquare, Send, Loader2, ArrowLeft,
    ChevronDown, ChevronUp, School
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
}

interface Child {
    id: string;
    firstName: string;
    lastName: string;
    class?: { name: string };
}

function timeAgo(date: string) {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export default function ParentMessagesPage() {
    const [user, setUser] = useState<any>(null);
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChild, setSelectedChild] = useState<Child | null>(null);
    const [messages, setMessages] = useState<Notification[]>([]);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [reply, setReply] = useState("");
    const [sending, setSending] = useState(false);
    const messagesEnd = useRef<HTMLDivElement>(null);
    const pollRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        async function init() {
            const me = await fetch("/api/auth/me").then(r => r.json());
            setUser(me);

            if (me.role === "PARENT") {
                const uData = await fetch(`/api/users/${me.id}`).then(r => r.json());
                const kids: Child[] = uData.children || [];
                setChildren(kids);
                if (kids.length > 0) setSelectedChild(kids[0]);
            } else if (me.role === "STUDENT") {
                setSelectedChild({ id: me.id, firstName: me.firstName, lastName: me.lastName });
            }
            setLoading(false);
        }
        init().catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!selectedChild) return;
        loadMessages();
        pollRef.current = setInterval(loadMessages, 8000);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, [selectedChild]);

    useEffect(() => {
        messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    async function loadMessages() {
        if (!selectedChild) return;
        setLoadingMsgs(true);
        try {
            const all = await fetch("/api/notifications").then(r => r.json());
            const thread = Array.isArray(all)
                ? all
                    .filter((n: any) => n.type === "MESSAGE" && n.message.includes(`[STUDENT:${selectedChild.id}]`))
                    .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                : [];
            setMessages(thread);
        } catch { /* silent */ }
        finally { setLoadingMsgs(false); }
    }

    async function sendReply() {
        if (!selectedChild || !reply.trim()) return;
        setSending(true);
        try {
            const res = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studentId: selectedChild.id, message: reply.trim() })
            });
            if (!res.ok) throw new Error("Failed");
            setReply("");
            toast.success("Reply sent!");
            await loadMessages();
        } catch {
            toast.error("Could not send reply.");
        } finally {
            setSending(false);
        }
    }

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading messages...</p>
        </div>
    );

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-up">

            {/* Header */}
            <div className="space-y-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">School Messages</h1>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mt-1">
                        Messages from the school about your child
                    </p>
                </div>

                {/* Child switcher */}
                {children.length > 1 && (
                    <div className="flex gap-2 flex-wrap">
                        {children.map(c => (
                            <button
                                key={c.id}
                                onClick={() => { setSelectedChild(c); setMessages([]); }}
                                className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedChild?.id === c.id
                                    ? 'bg-slate-900 text-white shadow-lg'
                                    : 'bg-white border border-slate-100 text-slate-500 hover:border-emerald-300'
                                    }`}
                            >
                                {c.firstName} {c.lastName}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Chat area */}
            <div className="flex-grow overflow-y-auto bg-slate-50/50 rounded-[2rem] border border-slate-100 my-6 p-6 space-y-3">
                {loadingMsgs && messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Loading messages...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4">
                        <MessageSquare className="w-14 h-14 text-slate-200" />
                        <div className="text-center">
                            <p className="font-black text-slate-900 uppercase">No messages yet</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">
                                The school will send you messages here about your child.
                            </p>
                        </div>
                    </div>
                ) : messages.map(msg => {
                    const rawText = msg.message
                        .replace(/\[STUDENT:[^\]]+\]/g, "")
                        .replace(/\[FROM:[^\]]+\]/g, "")
                        .trim();

                    // [FROM:xxx] means a parent sent it; otherwise it's from school
                    const isFromMe = msg.message.includes("[FROM:");

                    return (
                        <div key={msg.id} className={`flex ${isFromMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] rounded-[1.5rem] px-5 py-4 ${isFromMe
                                ? "bg-emerald-600 text-white rounded-br-sm"
                                : "bg-white border border-slate-100 text-slate-900 shadow-sm rounded-bl-sm"
                                }`}>
                                <div className="flex items-center gap-2 mb-1.5">
                                    {!isFromMe && <School className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                                    <p className={`text-[8px] font-black uppercase tracking-widest ${isFromMe ? "text-emerald-100" : "text-slate-400"}`}>
                                        {isFromMe ? "You" : "School (DOD)"}
                                    </p>
                                </div>
                                <p className={`text-sm leading-relaxed ${isFromMe ? "text-white font-semibold" : "text-slate-800 font-medium"}`}>
                                    {rawText}
                                </p>
                                <p className={`text-[8px] mt-2 ${isFromMe ? "text-emerald-100" : "text-slate-300"}`}>
                                    {timeAgo(msg.createdAt)}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEnd} />
            </div>

            {/* Reply box */}
            {selectedChild && (
                <div className="bg-white border border-slate-100 rounded-[2rem] p-4 flex gap-3 shrink-0 shadow-sm">
                    <textarea
                        className="flex-grow bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium resize-none outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-400 transition-all placeholder:text-slate-300"
                        rows={2}
                        placeholder="Write a reply to the school... (Ctrl+Enter to send)"
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) sendReply(); }}
                    />
                    <button
                        onClick={sendReply}
                        disabled={sending || !reply.trim()}
                        className="bg-emerald-600 text-white px-5 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg disabled:opacity-40 flex flex-col items-center justify-center gap-1.5 w-14 shrink-0"
                    >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
            )}
        </div>
    );
}
