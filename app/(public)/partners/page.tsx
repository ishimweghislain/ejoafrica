import { Quote, GraduationCap, School, BookOpen, Users } from "lucide-react";

export default function PartnersPage() {
    const testimonials = [
        {
            school: "Lycée De Kigali",
            role: "Excellence in Academics",
            message: "The transition to EjoAfrica has been transformative for our administrative workflows. The depth of the curriculum management system allows us to maintain the high standards our institution is known for. It truly is the digital backbone of our academic excellence.",
            principal: "Principal, LDK"
        }
    ];

    return (
        <div className="py-20 space-y-32 overflow-x-hidden">
            <section className="max-w-7xl mx-auto px-6 text-center space-y-12">
                <div className="space-y-4 animate-fade-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        <School className="w-3 h-3" />
                        <span>Official Partnerships</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">Elite Institutions <br /><span className="text-emerald-600">Trust EjoAfrica</span></h1>
                    <p className="text-gray-500 max-w-2xl mx-auto font-medium">
                        We partner with the most prestigious educational institutions in Rwanda to redefine the standards of school management.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-[2rem] flex items-center justify-center">
                            <GraduationCap className="w-10 h-10 text-gray-400" />
                        </div>
                        <span className="font-black text-xs tracking-widest text-gray-400">LYCÉE DE KIGALI</span>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-[2rem] flex items-center justify-center">
                            <School className="w-10 h-10 text-gray-400" />
                        </div>
                        <span className="font-black text-xs tracking-widest text-gray-400">GREEN HILLS</span>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 bg-gray-100 rounded-[2rem] flex items-center justify-center">
                            <BookOpen className="w-10 h-10 text-gray-400" />
                        </div>
                        <span className="font-black text-xs tracking-widest text-gray-400">RIVIERA HS</span>
                    </div>
                </div>
            </section>

            <section className="bg-emerald-600 py-32 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -mr-64 -mt-64 animate-pulse-slow"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-black/5 rounded-full blur-3xl -ml-64 -mb-64"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <h2 className="text-3xl md:text-4xl font-black mb-20 text-center tracking-tight">Institutional Voices</h2>

                    <div className="max-w-4xl mx-auto">
                        {testimonials.map((t, idx) => (
                            <div key={idx} className="bg-white/10 backdrop-blur-xl p-10 md:p-16 rounded-[4rem] border border-white/20 relative animate-bubble group">
                                <Quote className="absolute -top-10 -left-4 w-24 h-24 text-white/5 group-hover:text-white/10 transition-colors" />
                                <div className="relative z-10 space-y-10">
                                    <p className="text-xl md:text-3xl font-medium leading-[1.4] italic tracking-tight">
                                        "{t.message}"
                                    </p>
                                    <div className="pt-10 border-t border-white/10 flex items-center gap-6">
                                        <div className="w-20 h-20 bg-white/20 rounded-[1.5rem] flex items-center justify-center border border-white/10">
                                            <GraduationCap className="w-10 h-10" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-2xl tracking-tight">{t.school}</h4>
                                            <p className="text-emerald-200 text-sm font-bold uppercase tracking-widest">{t.principal}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="max-w-7xl mx-auto px-6 py-20 text-center space-y-12">
                <h2 className="text-2xl font-black tracking-tight">Join the Network</h2>
                <p className="text-gray-500 max-w-lg mx-auto font-medium">Become part of the growing ecosystem of smart schools in Africa. Our deployment team is ready to assist your institution.</p>
                <div className="flex justify-center">
                    <button className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-emerald-500 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20 text-sm uppercase tracking-widest">
                        Request Partnership
                    </button>
                </div>
            </section>
        </div>
    );
}
