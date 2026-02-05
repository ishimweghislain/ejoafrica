import { Quote } from "lucide-react";

export default function PartnersPage() {
    const testimonials = [
        {
            name: "Dr. Jean Bosco",
            role: "Registrar, Rwanda Tech Institute",
            message: "EjoAfrica has transformed how we manage our academic terms. The deep curriculum hierarchy is exactly what we needed for our complex courses."
        },
        {
            name: "Sarah Mwangi",
            role: "Principal, Nairobi Heights School",
            message: "The teacher-student communication and the automated timetable generator have saved us hundreds of hours every single semester."
        },
        {
            name: "Daniel Okezie",
            role: "Director, Lagos Merit Academy",
            message: "Security and role management are top-notch. I can finally see clear disciplinary reports and academic progress in one dashboard."
        }
    ];

    return (
        <div className="py-20 space-y-32">
            <section className="max-w-7xl mx-auto px-4 text-center space-y-12">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold">Our Global Partners</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        We collaborate with leading educational institutions and governmental bodies to drive the digital transformation of African education.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-16 grayscale opacity-60">
                    <div className="text-4xl font-black text-gray-400">UNICEF EDU</div>
                    <div className="text-4xl font-black text-gray-400">UNESCO AFRICA</div>
                    <div className="text-4xl font-black text-gray-400">GOOGLE FOR EDU</div>
                    <div className="text-4xl font-black text-gray-400">MICROSOFT SCHOOLS</div>
                </div>
            </section>

            <section className="bg-emerald-600 py-32 text-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-20 text-center">What Educators Say</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {testimonials.map((t, idx) => (
                            <div key={idx} className="bg-white/10 backdrop-blur-md p-10 rounded-[3rem] border border-white/20 relative">
                                <Quote className="absolute -top-6 -left-2 w-16 h-16 text-white/10" />
                                <p className="italic text-lg mb-8 relative z-10">"{t.message}"</p>
                                <div className="pt-6 border-t border-white/10">
                                    <h4 className="font-bold text-xl">{t.name}</h4>
                                    <p className="text-emerald-200 text-sm italic">{t.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
