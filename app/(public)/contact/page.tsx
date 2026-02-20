"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";

const slideInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
};

const slideInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
};

export default function ContactPage() {
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        toast.success("Message Sent.", { icon: "🚀" });
        (e.target as HTMLFormElement).reset();
    }

    return (
        <div className="flex flex-col gap-12 py-12 md:py-20 bg-white overflow-hidden min-h-screen">
            {/* Header */}
            <section className="max-w-4xl mx-auto px-6 w-full text-center space-y-3">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600 text-white text-[8px] font-black uppercase tracking-widest italic"
                >
                    <Sparkles className="w-2 h-2" />
                    <span>Communication Hub</span>
                </motion.div>
                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 uppercase italic"
                >
                    CONNECT WITH <span className="text-emerald-600 underline text-3xl">US</span>
                </motion.h1>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest max-w-sm mx-auto">
                    Institutional communication channels.
                </p>
            </section>

            {/* Content Grid */}
            <section className="max-w-5xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Info */}
                <motion.div
                    variants={slideInLeft}
                    initial="hidden"
                    animate="visible"
                    className="lg:col-span-4 space-y-4"
                >
                    <div className="space-y-3">
                        <ContactInfoCard icon={<Mail className="w-4 h-4" />} label="Email" value="info@ejoafrica.edu" />
                        <ContactInfoCard icon={<Phone className="w-4 h-4" />} label="Voice" value="+250 788 123 456" />
                        <ContactInfoCard icon={<MapPin className="w-4 h-4" />} label="Geo" value="Kigali, Rwanda" />
                    </div>

                    <div className="rounded-2xl border-2 border-slate-50 overflow-hidden shadow-lg aspect-[3/2] lg:aspect-square">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15949.72147137452!2d30.0573932871582!3d-1.94411649999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4294ed05f63%3A0xe6ceccf50e95cb1d!2sInnovation%20Village!5e0!3m2!1sen!2srw!4v1700000000000!5m2!1sen!2srw"
                            width="100%"
                            height="100%"
                            style={{ border: 0, filter: 'grayscale(0.3)' }}
                            allowFullScreen
                            loading="lazy"
                        ></iframe>
                    </div>
                </motion.div>

                {/* Right: Form */}
                <motion.div
                    variants={slideInRight}
                    initial="hidden"
                    animate="visible"
                    className="lg:col-span-8"
                >
                    <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-100 flex flex-col gap-6 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-900 p-3 rounded-xl text-white shadow-lg">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">System Message</h3>
                                <p className="text-[8px] font-black uppercase text-emerald-600">Secure Protocol</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Name" placeholder="Full name" />
                            <InputField label="Email Link" placeholder="email@address.com" type="email" />
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block ml-1">Payload</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-600 transition-all font-bold text-slate-900 text-[11px] resize-none shadow-sm"
                                    placeholder="Tell us about your institutional requirements..."
                                ></textarea>
                            </div>

                            <div className="md:col-span-2 pt-2">
                                <button type="submit" className="w-full bg-slate-900 text-white rounded-xl py-4 font-black uppercase tracking-[0.3em] shadow-lg hover:bg-emerald-600 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 text-[10px]">
                                    Execute <Send className="w-3 h-3" />
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}

function ContactInfoCard({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex items-center gap-4 group">
            <div className="bg-white border border-slate-100 p-3 rounded-xl text-emerald-600 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                {icon}
            </div>
            <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-0.5">{label}</p>
                <h4 className="font-black text-xs text-slate-900 tracking-tight">{value}</h4>
            </div>
        </div>
    );
}

function InputField({ label, placeholder, type = "text" }: { label: string, placeholder: string, type?: string }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block ml-1">{label}</label>
            <input
                required
                type={type}
                className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 outline-none focus:border-emerald-600 transition-all font-bold text-slate-900 text-[11px] shadow-sm"
                placeholder={placeholder}
            />
        </div>
    );
}
