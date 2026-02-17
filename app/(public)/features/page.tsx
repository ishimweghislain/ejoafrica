import { ShieldCheck, Calendar, BookOpen, Clock, Users, FileText, LayoutDashboard, BrainCircuit } from "lucide-react";

export default function FeaturesPage() {
    const features = [
        {
            icon: <LayoutDashboard className="w-8 h-8" />,
            title: "Role-Based Dashboards",
            description: "Customized interfaces for School Admins, DOS, DOD, Teachers, Students, and Parents."
        },
        {
            icon: <Clock className="w-8 h-8" />,
            title: "Timetable Management",
            description: "Design complex class schedules with automated conflict detection and teacher assignment."
        },
        {
            icon: <ShieldCheck className="w-8 h-8" />,
            title: "Academic Setup",
            description: "Manage academic years, terms, and classes with a few clicks. Maintain historical data easily."
        },
        {
            icon: <BrainCircuit className="w-8 h-8" />,
            title: "Course Engineering",
            description: "Deep content management from whole courses down to daily lessons and subtopics."
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "User Management",
            description: "Centralized control over thousands of users with detailed profiles and secure authentication."
        },
        {
            icon: <FileText className="w-8 h-8" />,
            title: "Assignments & Reports",
            description: "Create question banks and student assignments. Track progress with detailed performance reports."
        }
    ];

    return (
        <div className="py-20 px-4 max-w-7xl mx-auto space-y-20">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                    Everything You Need to <span className="text-emerald-600">Excel</span>
                </h1>
                <p className="text-lg text-gray-500 leading-relaxed">
                    Eshuri provides a comprehensive suite of tools designed to handle every aspect of modern school administration across Africa.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pt-10">
                {features.map((feature, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-10 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                        <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-2xl w-fit text-emerald-600 mb-8">
                            {feature.icon}
                        </div>
                        <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                        <p className="text-gray-500 leading-relaxed text-sm">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
