import { useState, useRef } from "react";
import { X, Upload, Loader2, File } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function UploadFileModal({ transactionId, onClose, onSuccess }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileRef = useRef(null);

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploadedFile({ name: file.name, url: file_url });
    setUploading(false);
  }

  async function handleSave() {
    if (!uploadedFile) return;
    
    // Update transaction with file reference (store in note or create custom field)
    onSuccess(uploadedFile);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1A1A1A]">Unggah Struk/Dokumen</h2>
          <button onClick={onClose} className="text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {uploadedFile ? (
            <div className="bg-[#F8FAFC] rounded-2xl p-4 flex items-center gap-3 border border-[#E2E8F0]">
              <File className="w-5 h-5 text-[#FF6A00]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1A1A1A] truncate">{uploadedFile.name}</p>
                <p className="text-xs text-[#8FA4C8]">Siap disimpan</p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-[#E2E8F0] rounded-2xl p-8 text-center hover:border-[#FF6A00] transition-colors"
            >
              <div className="flex flex-col items-center gap-2">
                {uploading ? (
                  <Loader2 className="w-8 h-8 text-[#FF6A00] animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 text-[#8FA4C8]" />
                )}
                <p className="font-semibold text-[#1A1A1A] text-sm">
                  {uploading ? "Mengunggah..." : "Klik untuk unggah"}
                </p>
                <p className="text-xs text-[#8FA4C8]">Struk, invoice, atau dokumen apapun</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
              />
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm text-[#4A5568] bg-[#F2F4F7] hover:bg-[#E2E8F0] transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              disabled={!uploadedFile}
              className="flex-1 py-3.5 rounded-xl font-bold text-sm text-white bg-[#FF6A00] hover:bg-[#e05e00] disabled:opacity-40 transition-colors"
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}