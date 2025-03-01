import React, { useState } from "react";

interface Props {
    initialData: any;
    onUpdate: (newData: any) => void;
}

const JsonEditor: React.FC<Props> = ({ initialData, onUpdate }) => {
    const [jsonText, setJsonText] = useState(
        JSON.stringify(initialData, null, 2)
    );
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJsonText(e.target.value);
        try {
            const parsed = JSON.parse(e.target.value);
            setError(null);
            onUpdate(parsed);
        } catch (err) {
            setError("Invalid JSON format");
        }
    };

    return (
        <div className="space-y-2">
            <textarea
                value={jsonText}
                onChange={handleChange}
                className="w-full h-96 font-mono text-sm p-4 bg-[#2c2c2e] rounded-lg border border-[#3a3a3c] focus:border-[#0a84ff] focus:ring-1 focus:ring-[#0a84ff] text-[#ffffff]"
                spellCheck="false"
            />
            {error && <div className="text-[#ff375f] text-sm">{error}</div>}
        </div>
    );
};

export default JsonEditor;
