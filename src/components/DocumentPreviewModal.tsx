import React from 'react';
import { useJobContext } from '../context/JobContext';
import { FileText, Download, X, FileCheck } from 'lucide-react';

export const DocumentPreviewModal: React.FC = () => {
  const { previewDocument, setPreviewDocument } = useJobContext();

  if (!previewDocument) return null;

  const downloadFile = () => {
    if (previewDocument.dataUrl) {
      const link = document.createElement('a');
      link.href = previewDocument.dataUrl;
      link.download = previewDocument.name;
      link.click();
    } else if (previewDocument.textContent) {
      const blob = new Blob([previewDocument.textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = previewDocument.name;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const isPdf = previewDocument.name.endsWith('.pdf') || previewDocument.fileType.includes('pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-2xs">
      <div className="w-full max-w-3xl bg-white dark:bg-[#181817] rounded-xl shadow-2xl border border-stone-200/80 dark:border-stone-850 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-stone-200/80 dark:border-stone-850 flex items-center justify-between bg-stone-50/50 dark:bg-stone-850/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate max-w-md">
                {previewDocument.name}
              </h3>
              <p className="text-[11px] text-stone-500 capitalize">
                {previewDocument.type.replace('_', ' ')} · {(previewDocument.size / 1024).toFixed(1)} KB · {previewDocument.uploadDate.split('T')[0]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadFile}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1E2922] hover:bg-[#2A3B31] text-white dark:bg-stone-100 dark:text-stone-900 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={() => setPreviewDocument(null)}
              className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Close document viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="p-6 overflow-y-auto flex-1 bg-stone-50/50 dark:bg-[#131312]">
          {previewDocument.textContent ? (
            <div className="bg-white dark:bg-[#1C1C1B] p-6 rounded-lg border border-stone-200/80 dark:border-stone-800 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 mb-3 pb-2 border-b border-stone-100 dark:border-stone-800">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Document Text</span>
              </div>
              <pre className="text-xs text-stone-800 dark:text-stone-200 font-sans whitespace-pre-wrap leading-relaxed">
                {previewDocument.textContent}
              </pre>
            </div>
          ) : previewDocument.dataUrl && isPdf ? (
            <iframe
              src={previewDocument.dataUrl}
              className="w-full h-[500px] rounded-lg border border-stone-200 dark:border-stone-800"
              title={previewDocument.name}
            />
          ) : previewDocument.dataUrl ? (
            <img
              src={previewDocument.dataUrl}
              alt={previewDocument.name}
              className="max-h-[500px] mx-auto rounded-lg shadow-2xs"
            />
          ) : (
            <div className="text-center py-12 text-stone-400 text-xs">
              Preview not available for this binary format. Click Download above to view locally.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
