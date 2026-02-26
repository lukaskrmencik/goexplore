import { useState, useEffect } from "react";
import { Link, Check, Copy, Share2, MessageCircle, Mail } from "lucide-react";
import { copyTextToClipboard } from "../../../../../utils/clipboard";
import "./InviteBox.css";

const INVITE_EXPIRATION_HOURS = Number(import.meta.env.VITE_INVITE_EXPIRATION_HOURS) || 48;

interface InviteBoxProps {
    link: string | null;
    isGenerating: boolean;
}

const InviteBox: React.FC<InviteBoxProps> = ({ link, isGenerating }) => {
    const [copied, setCopied] = useState(false);
    const [canShare, setCanShare] = useState(false);

    useEffect(() => {
        setCanShare(!!navigator.share);
    }, []);

    const handleCopy = async () => {
        if (!link) return;
        const succeeded = await copyTextToClipboard(link);
        if (!succeeded) return;
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleNativeShare = async () => {
        if (!link || !navigator.share) return;
        try {
            await navigator.share({
                title: 'Přidej se k mé trase na GoExplore!',
                text: 'Ahoj, přidej se k mé trase a naplánujme to společně.',
                url: link,
            });
        } catch {
        }
    };

    const whatsappShareUrl = link
        ? `https://wa.me/?text=${encodeURIComponent(`Přidej se k mé trase: ${link}`)}`
        : "#";

    const emailShareUrl = link
        ? `mailto:?subject=${encodeURIComponent("Přidej se k mé trase na GoExplore!")}&body=${encodeURIComponent(`Ahoj,\n\npřidej se k mé trase a naplánujme to společně:\n${link}`)}`
        : "#";

    return (
        <div className="invite-box-container">

            <div className="invite-box-input-group">
                <div className="invite-box-input-wrapper">
                    <div className="invite-box-link-icon-wrapper">
                        <Link size={20} className="invite-box-link-icon" />
                    </div>

                    {isGenerating || !link ? (
                        <div className="invite-box-skeleton">
                            <div className="invite-box-skeleton-bar"></div>
                        </div>
                    ) : (
                        <input
                            readOnly
                            value={link}
                            onClick={(e) => e.currentTarget.select()}
                            className="invite-box-input"
                        />
                    )}

                    {link && (
                        <div className="invite-box-copy-wrapper">
                            <button
                                onClick={handleCopy}
                                className={`invite-box-copy-btn ${copied ? 'invite-box-copy-btn-copied' : 'invite-box-copy-btn-default'}`}
                                title="Zkopírovat odkaz"
                            >
                                {copied ? <Check size={20} /> : <Copy size={20} />}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {link && (
                <div className="invite-box-share-actions">
                    {canShare ? (
                        <button
                            onClick={handleNativeShare}
                            className="invite-box-native-share-btn"
                        >
                            <Share2 size={20} />
                            Sdílet s přáteli
                        </button>
                    ) : (
                        <div className="invite-box-secondary-grid">
                            <a
                                href={whatsappShareUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="invite-box-secondary-link invite-box-link-whatsapp"
                                title="Poslat přes WhatsApp"
                            >
                                <MessageCircle size={18} />
                                WhatsApp
                            </a>

                            <a
                                href={emailShareUrl}
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
