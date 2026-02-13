import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Users, BookOpen, Calendar, ShieldCheck, Sparkles, GraduationCap } from "lucide-react";

export default function HomePage() {
    return (
        <div className="flex flex-col gap-12 md:gap-24 pb-20 overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative min-h-[85vh] flex items-center overflow-hidden pt-12 md:pt-0">
                <div className="absolute inset-0 z-0 scale-110 animate-pulse-slow">
                    <Image
                        src="/images/education.jpg"
                        alt="Students learning"
                        fill
                        className="object-cover brightness-[0.35]"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/20 to-black/80"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
                    <div className="max-w-2xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md text-emerald-400 text-xs font-black uppercase tracking-widest animate-fade-in">
                            <Sparkles className="w-3 h-3" />
                            <span>Next-Gen Education</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] animate-fade-up">
                            Future-Proof <span className="text-emerald-400">Education</span> Management
                        </h1>

                        <p className="text-base md:text-lg text-gray-300 leading-relaxed max-w-xl animate-fade-up delay-100">
                            Streamline your school administrative workflows, empower teachers, and engage parents with Africa's most advanced management platform.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-6 animate-fade-up delay-200">
                            <Link href="/login" className="btn-primary group flex items-center gap-2">
                                Launch Portal
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link href="/features" className="px-6 py-3 rounded-xl font-bold border border-white/20 text-white backdrop-blur-md transition-all hover:bg-white/10 text-sm">
                                Explore Features
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners section - Lycee De Kigali Focus */}
            <section className="max-w-7xl mx-auto px-6 w-full text-center space-y-8">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 opacity-60">Trusted Educational Partners</h2>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                    <div className="flex items-center gap-3 text-lg md:text-xl font-black text-gray-600">
                        <GraduationCap className="w-6 h-6" />
                        <span>LYCÉE DE KIGALI</span>
                    </div>
                    <div className="flex items-center gap-3 text-lg md:text-xl font-black text-gray-600">
                        <BookOpen className="w-6 h-6" />
                        <span>GREEN HILLS</span>
                    </div>
                    <div className="flex items-center gap-3 text-lg md:text-xl font-black text-gray-600">
                        <Users className="w-6 h-6" />
                        <span>RIVIERA HS</span>
                    </div>
                </div>
            </section>

            {/* Core Features - Bubbling Up Style */}
            <section className="bg-gray-50/50 dark:bg-gray-900/30 py-20 md:py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight">Everything Bubbling Up</h2>
                        <p className="text-sm text-gray-500 font-medium">Modern education demands modern tools. We've got you covered.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                        <FeatureCard
                            icon={<ShieldCheck className="w-8 h-8 text-emerald-500" />}
                            title="Secure Roles"
                            description="Custom permissions for Admin, Teachers, Students, and Parents."
                            delay="0s"
                        />
                        <FeatureCard
                            icon={<Calendar className="w-8 h-8 text-blue-500" />}
                            title="Smart Planning"
                            description="Manage years, terms, and timetables with automated conflict detection."
                            delay="0.1s"
                        />
                        <FeatureCard
                            icon={<BookOpen className="w-8 h-8 text-orange-500" />}
                            title="Deep Curriculum"
                            description="Hierarchical syllabus management from subtopics to lesson plans."
                            delay="0.2s"
                        />
                    </div>
                </div>
            </section>

            {/* Lycee De Kigali Testimonial section */}
            <section className="max-w-7xl mx-auto px-6 w-full py-12 md:py-20 lg:py-32 border-t">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="relative aspect-square md:aspect-video lg:aspect-square bg-emerald-600 rounded-[3rem] overflow-hidden shadow-2xl animate-bubble">
                        <div className="absolute inset-0 p-12 flex flex-col justify-end text-white space-y-4 z-10">
                            <div className="bg-white/20 backdrop-blur-md w-fit p-4 rounded-[2rem] border border-white/10 mb-4">
                                <GraduationCap className="w-12 h-12" />
                            </div>
                            <h3 className="text-3xl font-black">Lycee De Kigali</h3>
                            <p className="text-emerald-100 font-medium italic">"The digital backbone of our excellence."</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        {/* Using a school themed icon placeholder since I don't have an image path for LDK */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <GraduationCap className="w-64 h-64 text-white/5" />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-4">
                            <span className="text-emerald-600 font-black text-xs uppercase tracking-widest">Partner Spotlight</span>
                            <h2 className="text-4xl font-black leading-tight text-gray-900">Elevating Standards at <span className="text-emerald-600">Lycée De Kigali</span></h2>
                            <p className="text-gray-500 leading-relaxed font-medium">
                                As one of Rwanda's top-performing schools, Lycée De Kigali needed a system that could match their rigorous academic standards. Eshuri provided the perfect solution for managing complex course hierarchies and detailed student disciplinary tracking.
                            </p>
                        </div>

                        <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 italic font-medium text-gray-700 relative">
                            "Switching to Eshuri was the best decision for our administrative staff. The time saved on timetable generation and report processing is unprecedented. It has truly modernized our teaching environment."
                            <footer className="mt-4 not-italic font-black text-sm text-gray-900">— Principal, Lycée De Kigali</footer>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-6 w-full mb-12">
                <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-20 text-center text-white space-y-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -ml-48 -mb-48"></div>

                    <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Ready for a <span className="text-emerald-400">Live Demo</span>?</h2>
                    <p className="text-gray-400 text-sm md:text-base font-medium max-w-xl mx-auto">
                        Experience how Eshuri can transform your institution. Contact us to request your administrative access.
                    </p>
                    <div className="flex justify-center pt-8">
                        <Link href="/contact" className="bg-emerald-500 text-white px-10 py-4 rounded-2xl font-black hover:bg-emerald-400 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20 text-sm uppercase tracking-widest">
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: string }) {
    return (
        <div
            className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-2 group animate-bubble"
            style={{ animationDelay: delay }}
        >
            <div className="mb-8 w-16 h-16 rounded-[1.5rem] bg-gray-50 dark:bg-gray-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">{icon}</div>
            <h3 className="text-xl font-black mb-4 tracking-tight">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed font-medium">{description}</p>
        </div>
    );
}
