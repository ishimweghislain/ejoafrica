"use client";

import { motion } from "framer-motion";
import {
    Send, MapPin, Mail, Phone, Globe, ExternalLink, Zap
} from "lucide-react";
import { toast } from "react-hot-toast";

const slideInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7 } }
};

const slideInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.7 } }
};

export default function ContactPage() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast.success("Message sent! We will respond shortly.", {
            icon: '🚀',
            style: {
                borderRadius: '1rem',
                background: '#0f172a',
                color: '#fff',
                fontFamily: 'inherit',
                fontWeight: '900',
                fontSize: '11px',
                textTransform: 'uppercase'
            }
        });
    };

    return (
        <div className="py-24 px-8 max-w-7xl mx-auto bg-white min-h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-8 mb-24"
            >
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em] italic border border-emerald-100 shadow-sm">
                    <Zap className="w-4 h-4 text-emerald-500" />
                    <span>Get in Touch</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-slate-900 leading-[1.1]">
                    CONTACT <span className="text-emerald-600">US</span>
                </h1>
                <p className="text-xs md:text-sm text-slate-400 font-black uppercase tracking-[0.3em] max-w-2xl mx-auto italic leading-relaxed opacity-80">
                    Connect with our team for any questions or support.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* Contact Info */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={slideInLeft}
                    className="space-y-12"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <ContactCard icon={<Mail className="w-5 h-5" />} label="Email" value="ishimweghislain82@gmail.com" sub="Available 24/7" color="text-emerald-500" />
                        <ContactCard icon={<Phone className="w-5 h-5" />} label="Phone" value="+250 788 000 000" sub="General Support" color="text-blue-500" />
                        <ContactCard icon={<MapPin className="w-5 h-5" />} label="Office" value="Kigali, Rwanda" sub="Innovation District" color="text-rose-500" />
                        <ContactCard icon={<Globe className="w-5 h-5" />} label="Website" value="eshuri.rw" sub="Main Portal" color="text-indigo-500" />
                    </div>

                    <div className="p-10 bg-slate-900 text-white rounded-[3rem] space-y-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">School Support</h3>
                        <p className="text-xs md:text-sm text-slate-400 font-medium italic leading-relaxed opacity-80">
                            Our team provides dedicated support for all schools using the eShuri platform.
                        </p>
                        <div className="pt-4">
                            <button className="flex items-center gap-3 text-emerald-400 text-[10px] font-black uppercase tracking-widest hover:text-emerald-300 transition-all italic">
                                Technical Documentation <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Contact Form */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={slideInRight}
                    className="bg-white p-10 md:p-14 rounded-[4rem] border border-slate-100 shadow-2xl relative"
                >
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-600 rounded-t-full"></div>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InputField label="Name" placeholder="Full Name" />
                            <InputField label="Email" placeholder="email@school.com" type="email" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] block ml-1 italic">Message</label>
                            <textarea
                                required
                                rows={5}
                                className="w-full bg-slate-50 border border-slate-50 rounded-2xl px-6 py-5 outline-none focus:bg-white focus:ring-8 focus:ring-emerald-500/5 transition-all font-bold text-slate-900 text-sm italic resize-none shadow-inner"
                                placeholder="How can we help you?"
                            ></textarea>
                        </div>
                        <button className="w-full bg-slate-900 text-white p-6 rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95 shadow-2xl text-[10px] flex items-center justify-center gap-4 italic group">
                            Send Message
                            <Send className="w-4 h-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-all duration-500" />
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}

function ContactCard({ icon, label, value, sub, color }: { icon: any, label: string, value: string, sub: string, color: string }) {
    return (
        <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-50 group hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
            <div className={`p-3.5 rounded-xl w-fit ${color} bg-white shadow-sm mb-6 group-hover:scale-110 transition-transform`}>{icon}</div>
            <div className="space-y-1">
                <p className="text-[8px] font-black uppercase text-slate-300 tracking-[0.3em] italic">{label}</p>
                <p className="text-xs font-black text-slate-900 uppercase italic truncate">{value}</p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic opacity-50">{sub}</p>
            </div>
        </div>
    );
}

function InputField({ label, placeholder, type = "text" }: { label: string, placeholder: string, type?: string }) {
    return (
        <div className="space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] block ml-1 italic">{label}</label>
            <input
                required
                type={type}
                className="w-full bg-slate-50 border border-slate-50 rounded-2xl px-6 py-4.5 outline-none focus:bg-white focus:ring-8 focus:ring-emerald-500/5 transition-all font-bold text-slate-900 text-sm italic shadow-inner"
                placeholder={placeholder}
            />
        </div>
    );
}
