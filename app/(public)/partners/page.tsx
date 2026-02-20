"use client";

import { motion } from "framer-motion";
import { Quote, GraduationCap, School, BookOpen, Users, Star, ShieldCheck } from "lucide-react";

export default function PartnersPage() {
    const testimonials = [
        {
            school: "Elite Science Academy",
            role: "STEM Excellence",
            message: "The transition to Ejo Africa has been transformative for our administrative workflows. The depth of the curriculum management system allows us to maintain the high standards our institution is known for. It truly is the digital backbone of our academic excellence.",
            principal: "Head of Institution"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="py-20 space-y-32 overflow-x-hidden bg-white">
            <section className="max-w-7xl mx-auto px-6 text-center space-y-16">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100 italic">
                        <School className="w-3 h-3" />
                        <span>Official Partnerships</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight uppercase italic mt-4">
                        ELITE INSTITUTIONS <br />
                        <span className="text-emerald-600 text-6xl md:text-8xl">TRUST US</span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
                        We partner with the most prestigious educational institutions across the continent to redefine the standards of school management.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-wrap justify-center gap-10 md:gap-20"
                >
                    {[1, 2, 3, 4].map((i) => (
                        <motion.div
                            key={i}
                            variants={itemVariants}
                            className="flex flex-col items-center gap-6 group"
                        >
                            <div className="w-28 h-28 bg-slate-50 rounded-[2.5rem] flex items-center justify-center border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                                {i === 1 ? <GraduationCap className="w-12 h-12 text-slate-400 group-hover:text-emerald-500" /> :
                                    i === 2 ? <School className="w-12 h-12 text-slate-400 group-hover:text-blue-500" /> :
                                        i === 3 ? <BookOpen className="w-12 h-12 text-slate-400 group-hover:text-orange-500" /> :
                                            <Users className="w-12 h-12 text-slate-400 group-hover:text-rose-500" />}
                            </div>
                            <span className="font-black text-[10px] tracking-[0.3em] text-slate-400 uppercase group-hover:text-slate-900 transition-colors">
                                {i === 1 ? 'SCIENCE ACADEMY' : i === 2 ? 'GLOBAL HARBORS' : i === 3 ? 'PRESTIGE HS' : 'AFRICAN LEARNING'}
                            </span>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            <section className="bg-slate-900 py-32 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -ml-64 -mb-64"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-24 space-y-4">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Institutional Voices</h2>
                        <h3 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">The Excellence Review</h3>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        {testimonials.map((t, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="bg-white/5 backdrop-blur-2xl p-10 md:p-20 rounded-[4rem] border border-white/10 relative group"
                            >
                                <Quote className="absolute -top-12 -left-6 w-32 h-32 text-white/5 group-hover:text-emerald-500/10 transition-colors" />
                                <div className="relative z-10 space-y-12">
                                    <p className="text-2xl md:text-4xl font-black leading-[1.3] italic tracking-tight text-white/90">
                                        "{t.message}"
                                    </p>
                                    <div className="pt-12 border-t border-white/10 flex items-center gap-8">
                                        <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center border-4 border-white/10 shadow-2xl">
                                            <Star className="w-12 h-12 fill-current" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-3xl tracking-tighter uppercase italic">{t.school}</h4>
                                            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mt-1">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="max-w-5xl mx-auto px-6 py-20 text-center space-y-12">
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl mx-auto flex items-center justify-center text-emerald-600 mb-8 border border-emerald-100">
                    <ShieldCheck className="w-10 h-10" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">Join the Elite Network</h2>
                <p className="text-gray-500 text-lg leading-relaxed font-bold italic">"Ejo Africa is more than software; it's a standard of academic operation."</p>
                <div className="flex justify-center pt-8">
                    <button className="bg-emerald-600 text-white px-12 py-6 rounded-[2rem] font-black hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-emerald-500/20 text-xs uppercase tracking-[0.3em]">
                        Become a Partner
                    </button>
                </div>
            </section>
        </div>
    );
}
