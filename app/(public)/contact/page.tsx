import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="py-20 px-4 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-12">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                        Let's <span className="text-emerald-600">Connect</span>
                    </h1>
                    <p className="text-lg text-gray-500 leading-relaxed">
                        Have questions about implementation? Need a demo for your board of directors? We are here to help you revolutionize your school.
                    </p>
                </div>

                <div className="space-y-8">
                    <div className="flex items-start gap-6 group">
                        <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">Email Us</h4>
                            <p className="text-gray-500">info@fullstack</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-6 group">
                        <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                            <Phone className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">Call Us</h4>
                            <p className="text-gray-500">+250 788 123 456</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-6 group">
                        <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">Visit Us</h4>
                            <p className="text-gray-500">Innovation Village, Kigali, Rwanda</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass p-10 rounded-[3rem] shadow-2xl space-y-8">
                <h3 className="text-2xl font-bold">Send a Message</h3>
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Full Name</label>
                            <input type="text" className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-6 py-4 outline-none ring-2 ring-transparent focus:ring-emerald-500/20 transition-all font-medium" placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Email Address</label>
                            <input type="email" className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-6 py-4 outline-none ring-2 ring-transparent focus:ring-emerald-500/20 transition-all font-medium" placeholder="john@example.com" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Phone Number</label>
                        <input type="tel" className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-6 py-4 outline-none ring-2 ring-transparent focus:ring-emerald-500/20 transition-all font-medium" placeholder="+250..." />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Your Message</label>
                        <textarea rows={5} className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-2xl px-6 py-4 outline-none ring-2 ring-transparent focus:ring-emerald-500/20 transition-all font-medium resize-none" placeholder="Tell us about your school..."></textarea>
                    </div>

                    <button type="submit" className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-3">
                        Send Message <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
