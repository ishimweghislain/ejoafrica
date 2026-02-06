"use client";

import { Mail, Phone, MapPin, Send, MessageSquare, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ContactPage() {
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        toast.success("Transmission Received: Our support nodes have been notified.", { icon: "🚀" });
        (e.target as HTMLFormElement).reset();
    }

    return (
        <div className="flex flex-col gap-24 py-20 overflow-hidden bg-slate-50/50">
            {/* Header Section */}
            <section className="max-w-7xl mx-auto px-6 w-full text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 text-[10px] font-black uppercase tracking-widest animate-fade-in">
                    <Sparkles className="w-3 h-3" />
                    <span>Global Support Terminal</span>
                </div>
                <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 leading-none">
                    Let's Build the <span className="text-emerald-600">Future</span>
                </h1>
                <p className="text-sm md:text-base text-slate-400 font-bold uppercase tracking-[0.3em] max-w-2xl mx-auto leading-relaxed">
                    Revolutionizing African educational infrastructure through precision technology.
                </p>
            </section>

            {/* Interaction Grid */}
            <section className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                {/* Left: Contact Info */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="space-y-8">
                        <ContactInfoCard
                            icon={<Mail className="w-6 h-6" />}
                            label="Email Protocol"
                            value="info@ldk.edu.rw"
                            sub="Secure Communication"
                        />
                        <ContactInfoCard
                            icon={<Phone className="w-6 h-6" />}
                            label="Voice Node"
                            value="+250 788 123 456"
                            sub="Available 08:00 - 18:00"
                        />
                        <ContactInfoCard
                            icon={<MapPin className="w-6 h-6" />}
                            label="Geographic Point"
                            value="Innovation Village, Kigali"
                            sub="Republic of Rwanda"
                        />
                    </div>

                    {/* Google Map Integration */}
                    <div className="rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl shadow-emerald-950/10 relative group aspect-square">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15949.72147137452!2d30.0573932871582!3d-1.94411649999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4294ed05f63%3A0xe6ceccf50e95cb1d!2sInnovation%20Village!5e0!3m2!1sen!2srw!4v1700000000000!5m2!1sen!2srw"
                            width="100%"
                            height="100%"
                            style={{ border: 0, filter: 'grayscale(1) contrast(1.2) opacity(0.8)' }}
                            allowFullScreen
                            loading="lazy"
                            className="transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110"
                        ></iframe>
                        <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-[2rem] border border-white shadow-2xl pointer-events-none transition-transform group-hover:translate-y-28">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">HQ Location</p>
                            <p className="text-xs font-black text-slate-900 leading-tight">Visit our innovation hub in Kigali</p>
                        </div>
                    </div>
                </div>

                {/* Right: Message Form */}
                <div className="lg:col-span-8">
                    <div className="bg-white p-10 md:p-20 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] space-y-16 relative overflow-hidden border border-slate-50">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -mr-40 -mt-40"></div>

                        <div className="flex items-center gap-6">
                            <div className="bg-slate-900 p-5 rounded-[2rem] text-white shadow-2xl shadow-slate-900/20">
                                <MessageSquare className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">System Message</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Secure Transmission Node</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <InputField label="Identity Name" placeholder="Full Name" />
                            <InputField label="Link Protocol" placeholder="Email Address" type="email" />
                            <InputField label="Signal Number" placeholder="Phone Contact" type="tel" className="md:col-span-2" />

                            <div className="md:col-span-2 space-y-4">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-2 block">Payload Content</label>
                                <textarea
                                    required
                                    rows={5}
                                    className="w-full bg-slate-50/50 border border-slate-100 rounded-[2.5rem] px-8 py-7 outline-none ring-8 ring-transparent focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-900 text-sm resize-none shadow-sm"
                                    placeholder="Tell us about your institutional requirements..."
                                ></textarea>
                            </div>

                            <div className="md:col-span-2 pt-6">
                                <button type="submit" className="w-full bg-slate-900 text-white rounded-[2.5rem] py-8 font-black uppercase tracking-[0.4em] shadow-2xl shadow-slate-900/10 hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-6 text-xs">
                                    Finalize Submission <Send className="w-6 h-6" />
                                </button>
                                <p className="text-center text-[9px] font-black text-slate-300 mt-10 uppercase tracking-[0.4em] leading-relaxed">
                                    All transmissions are protected via institutional <br /> encryption protocols.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}

function ContactInfoCard({ icon, label, value, sub }: { icon: React.ReactNode, label: string, value: string, sub: string }) {
    return (
        <div className="flex items-center gap-8 group">
            <div className="bg-white border border-slate-100 p-6 rounded-[2rem] text-emerald-600 shadow-xl shadow-slate-200/50 transition-all group-hover:bg-emerald-600 group-hover:text-white group-hover:scale-110 active:scale-95 group-hover:shadow-emerald-500/20">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600/50 mb-1">{label}</p>
                <h4 className="font-black text-xl text-slate-900 tracking-tighter">{value}</h4>
                <p className="text-[10px] font-bold text-slate-400 italic">{sub}</p>
            </div>
        </div>
    );
}

function InputField({ label, placeholder, type = "text", className = "" }: { label: string, placeholder: string, type?: string, className?: string }) {
    return (
        <div className={`space-y-4 ${className}`}>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] ml-2 block">{label}</label>
            <input
                required
                type={type}
                className="w-full bg-slate-50/50 border border-slate-100 rounded-[2rem] px-8 py-6 outline-none ring-8 ring-transparent focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500 transition-all font-bold text-slate-900 text-sm shadow-sm"
                placeholder={placeholder}
            />
        </div>
    );
}
