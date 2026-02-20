"use client";

import { motion } from "framer-motion";
import { Quote, GraduationCap, School, BookOpen, Users, Star, ShieldCheck } from "lucide-react";

const slideInLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
};

const slideInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6 } }
};

export default function PartnersPage() {
    const testimonials = [
        {
            school: "Elite Science Academy",
            role: "STEM Excellence",
            message: "The transition to Ejo Africa has been transformative for our administrative workflows. The depth of the curriculum management system allows us to maintain the high standards our institution is known for.",
            principal: "Head of Institution"
        }
    ];

    return (
        <div className="py-16 space-y-24 bg-white overflow-hidden">
            {/* Header */}
            <section className="max-w-7xl mx-auto px-6 text-center space-y-10">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100 italic">
                        <School className="w-3 h-3" />
                        <span>Official Network</span>
                    </div>
                    <h1 className="text-xl md:text-3xl font-black tracking-tight uppercase italic text-slate-900 leading-tight">
                        TRUSTED BY <br />
                        <span className="text-emerald-600 text-3xl md:text-4xl">ELITE SCHOOLS</span>
                    </h1>
                    <p className="text-slate-400 max-w-lg mx-auto font-black uppercase tracking-widest text-[9px] leading-relaxed">
                        Redefining the standards of African institutional management.
                    </p>
                </motion.div>

                {/* Partner Logos */}
                <div className="flex flex-wrap justify-center gap-6 md:gap-12 pt-10">
                    {[1, 2, 3, 4].map((i) => (
                        <motion.div
                            key={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={i % 2 === 0 ? slideInRight : slideInLeft}
                            className="flex flex-col items-center gap-4 group"
                        >
                            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:bg-emerald-50 transition-all">
                                {i === 1 ? <GraduationCap className="w-8 h-8 text-slate-400 group-hover:text-emerald-600" /> :
                                    i === 2 ? <School className="w-8 h-8 text-slate-400 group-hover:text-blue-600" /> :
                                        i === 3 ? <BookOpen className="w-8 h-8 text-slate-400 group-hover:text-orange-600" /> :
                                            <Users className="w-8 h-8 text-slate-400 group-hover:text-rose-600" />}
                            </div>
                            <span className="font-black text-[8px] tracking-widest text-slate-400 uppercase">
                                {i === 1 ? 'SCIENCE ACADEMY' : i === 2 ? 'GLOBAL HARBORS' : i === 3 ? 'PRESTIGE HS' : 'AFRICAN LEARNING'}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Testimonials */}
            <section className="bg-slate-900 py-20 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16 space-y-2">
                        <h2 className="text-[8px] font-black uppercase tracking-[0.4em] text-emerald-400">Institutional Voices</h2>
                        <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter">The Excellence Review</h3>
                    </div>

                    <div className="max-w-3xl mx-auto">
                        {testimonials.map((t, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.98 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className="bg-white/5 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-white/10 relative group"
                            >
                                <Quote className="absolute -top-8 -left-4 w-20 h-20 text-white/5 group-hover:text-emerald-500/10 transition-colors" />
                                <div className="relative z-10 space-y-8">
                                    <p className="text-xl md:text-2xl font-black leading-relaxed italic text-white/90">
                                        "{t.message}"
                                    </p>
                                    <div className="pt-8 border-t border-white/10 flex items-center gap-6">
                                        <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl">
                                            <Star className="w-8 h-8 fill-current" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-lg uppercase italic tracking-tighter">{t.school}</h4>
                                            <p className="text-emerald-400 text-[8px] font-black uppercase tracking-widest">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-4xl mx-auto px-6 py-10 text-center space-y-8">
                <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto" />
                <h2 className="text-2xl md:text-3xl font-black tracking-tighter uppercase italic">Join the Elite Network</h2>
                <div className="flex justify-center">
                    <button className="bg-emerald-600 text-white px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-emerald-700 transition-all hover:scale-105 shadow-xl">
                        Request Partnership
                    </button>
                </div>
            </section>
        </div>
    );
}
