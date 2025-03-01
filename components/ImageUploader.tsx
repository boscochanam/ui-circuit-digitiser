import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
    onUpload: (file: File) => void;
}

const ImageUploader: React.FC<Props> = ({ onUpload }) => {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                onUpload(acceptedFiles[0]);
            }
        },
        [onUpload]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".png", ".jpg", ".jpeg"],
        },
        multiple: false,
    });

    return (
        <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${
                    isDragActive
                        ? "border-[#0a84ff] bg-[#2c2c2e]"
                        : "border-[#3a3a3c]"
                }`}
        >
            <input {...getInputProps()} />
            <p className="text-[#5ac8fa]">
                {isDragActive
                    ? "Drop the image here..."
                    : "Drag & drop a circuit image here, or click to select one"}
            </p>
        </div>
    );
};

export default ImageUploader;
