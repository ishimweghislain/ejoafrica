"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X, Trash2 } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
}

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, description }: ConfirmModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 transition-opacity" onClick={onClose} />
            <div className="relative bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl animate-fade-up border border-slate-100">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-300 hover:text-slate-500">
                    <X className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="bg-red-50 p-6 rounded-[2.5rem] text-red-500 shadow-xl shadow-red-500/10">
                        <AlertTriangle className="w-10 h-10" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-tight">{title}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                            {description}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full pt-6">
                        <button
                            onClick={onClose}
                            className="bg-slate-50 text-slate-400 py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Abort
                        </button>
                        <button
                            onClick={onConfirm}
                            className="bg-red-500 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
