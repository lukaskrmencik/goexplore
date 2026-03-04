import { useState, useRef } from "react";
import type { RefObject } from "react";
import type { EditorType, RouteAxisEditorHandle, RouteDateEditorHandle, RouteConfigurationEditorHandle } from "../../../types/editor";
import { getErrorMessage } from "../../../utils/apiError";

const EDITOR_TITLES: Record<EditorType, string> = {
    axis: "Trasa",
    date: "Datum trasy",
    users: "Lidé",
    equipment: "Výbava",
    config: "Nastavení trasy",
};

export interface EditorRefs {
    axisEditorRef: RefObject<RouteAxisEditorHandle>;
    dateEditorRef: RefObject<RouteDateEditorHandle>;
    configEditorRef: RefObject<RouteConfigurationEditorHandle>;
}

export const useEditorState = (refetch: () => void, onSaveError: (message: string) => void) => {
    const [activeEditor, setActiveEditor] = useState<EditorType | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [wasMobileMenuOpen, setWasMobileMenuOpen] = useState(false);

    const axisEditorRef = useRef<RouteAxisEditorHandle>(null);
    const dateEditorRef = useRef<RouteDateEditorHandle>(null);
    const configEditorRef = useRef<RouteConfigurationEditorHandle>(null);

    const handleCloseEditor = () => {
        setActiveEditor(null);
        refetch();
        if (wasMobileMenuOpen) {
            setIsMobileMenuOpen(true);
            setWasMobileMenuOpen(false);
        }
    };

    const handleOpenEditor = (editor: EditorType) => {
        if (isMobileMenuOpen) {
            setWasMobileMenuOpen(true);
            setIsMobileMenuOpen(false);
        }
        setActiveEditor(editor);
    };

    const handleSaveAndClose = async () => {
        try {
            if (activeEditor === 'axis' && axisEditorRef.current) {
                await axisEditorRef.current.save();
            } else if (activeEditor === 'date' && dateEditorRef.current) {
                await dateEditorRef.current.save();
            } else if (activeEditor === 'config' && configEditorRef.current) {
                await configEditorRef.current.save();
            }
            handleCloseEditor();
        } catch (e) {
            onSaveError(getErrorMessage(e, "Nepodařilo se uložit změny."));
        }
    };

    const editorTitle = activeEditor ? EDITOR_TITLES[activeEditor] : "";
    const isAutoSaveEditor = activeEditor === 'users' || activeEditor === 'equipment';

    return {
        activeEditor,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        editorTitle,
        isAutoSaveEditor,
        editorRefs: { axisEditorRef, dateEditorRef, configEditorRef } as EditorRefs,
        handleOpenEditor,
        handleCloseEditor,
        handleSaveAndClose,
    };
};
