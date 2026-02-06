import { Mail, Phone, MapPin, Send, MessageSquare, Sparkles } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="flex flex-col gap-24 py-20 overflow-hidden">
            {/* Header Section */}
            <section className="max-w-7xl mx-auto px-6 w-full text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black uppercase tracking-widest animate-fade-in">
                    <Sparkles className="w-3 h-3" />
                    <span>Global Support Terminal</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 leading-[1.1]">
                    Let's Build the <span className="text-emerald-600">Future</span>
                </h1>
                <p className="text-sm md:text-base text-gray-500 font-bold uppercase tracking-widest max-w-2xl mx-auto leading-relaxed opacity-60">
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
                            value="info@ejoafrica.edu"
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
                    <div className="rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl shadow-emerald-950/5 relative group aspect-square">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15949.72147137452!2d30.0573932871582!3d-1.94411649999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4294ed05f63%3A0xe6ceccf50e95cb1d!2sInnovation%20Village!5e0!3m2!1sen!2srw!4v1700000000000!5m2!1sen!2srw"
                            width="100%"
                            height="100%"
                            style={{ border: 0, filter: 'grayscale(1) contrast(1.2) opacity(0.8)' }}
                            allowFullScreen
                            loading="lazy"
                            className="transition-all duration-700 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110"
                        ></iframe>
                        <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl pointer-events-none transition-transform group-hover:translate-y-20">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">HQ Location</p>
                            <p className="text-[11px] font-bold text-gray-900 leading-tight">Visit our innovation hub in Kigali</p>
                        </div>
                    </div>
                </div>

                {/* Right: Message Form */}
                <div className="lg:col-span-8">
                    <div className="glass-modal p-10 md:p-16 rounded-[4rem] shadow-2xl space-y-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

                        <div className="flex items-center gap-4">
                            <div className="bg-gray-900 p-4 rounded-3xl text-white">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">System Message</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Secure Transmission Node</p>
                            </div>
                        </div>

                        <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <InputField label="Identity Name" placeholder="Full Name" />
                            <InputField label="Link Protocol" placeholder="Email Address" type="email" />
                            <InputField label="Signal Number" placeholder="Phone Contact" type="tel" className="md:col-span-2" />

                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2 block">Payload Content</label>
                                <textarea
                                    rows={5}
                                    className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-6 outline-none ring-4 ring-transparent focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all font-bold text-gray-900 text-sm resize-none shadow-sm"
                                    placeholder="Tell us about your institutional requirements..."
                                ></textarea>
                            </div>

                            <div className="md:col-span-2 pt-4">
                                <button type="submit" className="w-full bg-gray-900 text-white rounded-3xl py-8 font-black uppercase tracking-[0.3em] shadow-2xl shadow-gray-200 hover:bg-emerald-600 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 text-xs">
                                    Finalize Submission <Send className="w-5 h-5" />
                                </button>
                                <p className="text-center text-[9px] font-black text-gray-300 mt-8 uppercase tracking-[0.3em] leading-relaxed">
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
        <div className="flex items-center gap-6 group">
            <div className="bg-white border border-gray-100 p-5 rounded-[2rem] text-emerald-600 shadow-sm transition-all group-hover:bg-emerald-600 group-hover:text-white group-hover:scale-110 active:scale-95 group-hover:shadow-xl group-hover:shadow-emerald-500/20">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60 mb-1">{label}</p>
                <h4 className="font-black text-lg text-gray-900 tracking-tight">{value}</h4>
                <p className="text-[10px] font-bold text-gray-400 italic">{sub}</p>
            </div>
        </div>
    );
}

function InputField({ label, placeholder, type = "text", className = "" }: { label: string, placeholder: string, type?: string, className?: string }) {
    return (
        <div className={`space-y-3 ${className}`}>
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-2 block">{label}</label>
            <input
                type={type}
                className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-8 py-5 outline-none ring-4 ring-transparent focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all font-bold text-gray-900 text-sm shadow-sm"
                placeholder={placeholder}
            />
        </div>
    );
}
