
import { useState, useEffect } from "react";
import { Link, Check, Copy, Share2, MessageCircle, Mail } from "lucide-react";

interface InviteBoxProps {
    link: string | null;
    isGenerating: boolean;
    onGenerate: () => void;
}

const InviteBox: React.FC<InviteBoxProps> = ({ link, isGenerating }) => {
    const [copied, setCopied] = useState(false);
    const [canShare, setCanShare] = useState(false);

    useEffect(() => {
        setCanShare(!!navigator.share);
    }, []);

    const handleCopy = () => {
        if (link) {
            navigator.clipboard.writeText(link);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleNativeShare = async () => {
        if (link && navigator.share) {
            try {
                await navigator.share({
                    title: 'Přidej se k mé trase na GoExplore!',
                    text: 'Ahoj, přidej se k mé trase a naplánujme to společně.',
                    url: link,
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        }
    };

    // Construct social links
    const encodedText = encodeURIComponent("Přidej se k mé trase na GoExplore!");

    // WhatsApp
    const whatsappLink = link ? `https://wa.me/?text=${encodeURIComponent(`Přidej se k mé trase: ${link}`)}` : "#";

    // Email (Added UTF-8 encoding potentially, but URL encoding does this)
    const emailLink = link ? `mailto:?subject=${encodedText}&body=${encodeURIComponent(`Ahoj,\n\npřidej se k mé trase a naplánujme to společně:\n${link}`)}` : "#";

    return (
        <div className="w-full space-y-6">

            {/* 1. Main Link Input */}
            <div className="space-y-2">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Link size={20} className="text-emerald-500" />
                    </div>

                    {isGenerating || !link ? (
                        // Skeleton Loading
                        <div className="h-[58px] w-full rounded-2xl border-2 border-slate-100 bg-slate-50 animate-pulse flex items-center pl-12 pr-4">
                            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                        </div>
                    ) : (
                        // Actual Input
                        <input
                            readOnly
                            value={link}
                            onClick={(e) => e.currentTarget.select()}
                            className="block w-full rounded-2xl border-2 border-emerald-100 bg-white py-4 pl-12 pr-14 text-slate-600 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono text-sm shadow-sm cursor-text selection:bg-emerald-100 selection:text-emerald-900"
                        />
                    )}

                    {/* Copy Button (Inside Input) */}
                    {link && (
                        <div className="absolute inset-y-2 right-2 flex">
                            <button
                                onClick={handleCopy}
                                className={`
                                    flex items-center justify-center w-10 h-10 rounded-xl transition-all
                                    ${copied
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : 'bg-white text-slate-400 hover:bg-slate-100 hover:text-emerald-600'
                                    }
                                `}
                                title="Zkopírovat odkaz"
                            >
                                {copied ? <Check size={20} /> : <Copy size={20} />}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Share Actions */}
            {link && (
                <div className="flex flex-col gap-3">

                    {/* Native Share (If supported) */}
                    {canShare ? (
                        <button
                            onClick={handleNativeShare}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 hover:-translate-y-0.5 transition-all"
                        >
                            <Share2 size={20} />
                            Sdílet s přáteli
                        </button>
                    ) : (
                        /* Secondary Options Grid (Fallback if Native Share not available) */
                        <div className="grid grid-cols-2 gap-3">
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366]/10 px-4 py-3 text-sm font-bold text-[#25D366] hover:bg-[#25D366]/20 transition-all border border-[#25D366]/20"
                                title="Poslat přes WhatsApp"
                            >
                                <MessageCircle size={18} />
                                WhatsApp
                            </a>

                            <a
                                href={emailLink}
                                className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all border border-slate-200"
                                title="Poslat emailem"
                            >
                                <Mail size={18} />
                                Email
                            </a>
                        </div>
                    )}
                </div>
            )}

            <p className="text-center text-xs font-medium text-slate-400">
                Odkaz je platný 48 hodin
            </p>
        </div>
    );
};

export default InviteBox;
