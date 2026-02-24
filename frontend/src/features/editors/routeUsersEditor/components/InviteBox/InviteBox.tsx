
import { useState, useEffect } from "react";
import { Link, Check, Copy, Share2, MessageCircle, Mail } from "lucide-react";
import "./InviteBox.css";

interface InviteBoxProps {
    link: string | null;
    isGenerating: boolean;
    onGenerate: () => void;
}

const INVITE_EXPIRATION_HOURS = Number(import.meta.env.VITE_INVITE_EXPIRATION_HOURS) || 48;

const InviteBox: React.FC<InviteBoxProps> = ({ link, isGenerating }) => {
    const [copied, setCopied] = useState(false);
    const [canShare, setCanShare] = useState(false);

    useEffect(() => {
        setCanShare(!!navigator.share);
    }, []);

    const copyToClipboard = async (text: string): Promise<boolean> => {
        // Modern Clipboard API (requires secure context + permissions in some browsers)
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch {
            // fall through to legacy method
        }

        // Legacy fallback (works in more restricted contexts)
        try {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.setAttribute("readonly", "true");
            textarea.style.position = "fixed";
            textarea.style.top = "0";
            textarea.style.left = "0";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            const ok = document.execCommand("copy");
            document.body.removeChild(textarea);
            return ok;
        } catch {
            return false;
        }
    };

    const handleCopy = async () => {
        if (!link) return;
        const ok = await copyToClipboard(link);
        if (!ok) {
            console.error("Copy to clipboard failed");
            return;
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
        <div className="invite-box-container">

            {/* 1. Main Link Input */}
            <div className="invite-box-input-group">
                <div className="invite-box-input-wrapper group">
                    <div className="invite-box-link-icon-wrapper">
                        <Link size={20} className="invite-box-link-icon" />
                    </div>

                    {isGenerating || !link ? (
                        // Skeleton Loading
                        <div className="invite-box-skeleton">
                            <div className="invite-box-skeleton-bar"></div>
                        </div>
                    ) : (
                        // Actual Input
                        <input
                            readOnly
                            value={link}
                            onClick={(e) => e.currentTarget.select()}
                            className="invite-box-input"
                        />
                    )}

                    {/* Copy Button (Inside Input) */}
                    {link && (
                        <div className="invite-box-copy-wrapper">
                            <button
                                onClick={handleCopy}
                                className={`invite-box-copy-btn ${copied
                                    ? 'invite-box-copy-btn-copied'
                                    : 'invite-box-copy-btn-default'
                                    }`}
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
                <div className="invite-box-share-actions">

                    {/* Native Share (If supported) */}
                    {canShare ? (
                        <button
                            onClick={handleNativeShare}
                            className="invite-box-native-share-btn"
                        >
                            <Share2 size={20} />
                            Sdílet s přáteli
                        </button>
                    ) : (
                        /* Secondary Options Grid (Fallback if Native Share not available) */
                        <div className="invite-box-secondary-grid">
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="invite-box-secondary-link invite-box-link-whatsapp"
                                title="Poslat přes WhatsApp"
                            >
                                <MessageCircle size={18} />
                                WhatsApp
                            </a>

                            <a
                                href={emailLink}
                                className="invite-box-secondary-link invite-box-link-email"
                                title="Poslat emailem"
                            >
                                <Mail size={18} />
                                Email
                            </a>
                        </div>
                    )}
                </div>
            )}

            <p className="invite-box-helper-text">
                Odkaz je platný {INVITE_EXPIRATION_HOURS} hodin
            </p>
        </div>
    );
};

export default InviteBox;
