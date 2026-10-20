import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { Resource } from '../types';
import { getMockDocumentContent } from '../services/mockPdfs';
import { api } from '../services/api';

interface PdfViewerModalProps {
  resource: Resource;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onClose: () => void;
  onOpenReport: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  resource,
  isBookmarked,
  onToggleBookmark,
  onClose,
  onOpenReport,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'reader' | 'raw_file'>('reader');

  const doc = getMockDocumentContent(resource.id, resource.title);
  const totalPages = doc.totalPages || 1;
  const pageData = doc.pages.find(p => p.pageNumber === currentPage) || doc.pages[0];

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 15, 175));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 15, 65));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleDownload = async () => {
    try {
      await api.trackDownload(resource.id);
      // Trigger file download
      if (resource.fileUrl) {
        const link = document.createElement('a');
        link.href = resource.fileUrl;
        link.download = resource.fileName || `${resource.title.slice(0, 30)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Generate formatted clean academic study note text (no JSON / no raw code serialization)
        let formattedStudyDoc = `========================================================================\n`;
        formattedStudyDoc += `CAMPUS STUDY HUB — UNITED GROUP OF INSTITUTIONS (UGI)\n`;
        formattedStudyDoc += `Official Academic Digital Repository\n`;
        formattedStudyDoc += `========================================================================\n\n`;
        formattedStudyDoc += `RESOURCE TITLE: ${resource.title}\n`;
        formattedStudyDoc += `FACULTY / UPLOADER: ${resource.uploadedBy.name} (${resource.uploadedBy.role.toUpperCase()})\n`;
        formattedStudyDoc += `PUBLICATION DATE: ${resource.uploadDate}\n`;
        formattedStudyDoc += `ACADEMIC YEAR: ${doc.academicYear || '2024-2025'}\n`;
        formattedStudyDoc += `DEPARTMENT: ${doc.department || 'Engineering'}\n`;
        formattedStudyDoc += `\n------------------------------------------------------------------------\n\n`;

        doc.pages.forEach((p, idx) => {
          formattedStudyDoc += `[ SECTION / PAGE ${idx + 1} ]: ${p.header}\n`;
          if (p.subHeader) formattedStudyDoc += `Focus: ${p.subHeader}\n\n`;

          p.sections.forEach(sec => {
            if (sec.heading) {
              formattedStudyDoc += `>> ${sec.heading}\n`;
            }
            if (sec.text) {
              formattedStudyDoc += `${sec.text}\n\n`;
            }
            if (sec.formula) {
              formattedStudyDoc += `   Key Formula / Equation: ${sec.formula}\n\n`;
            }
            if (sec.bullets && sec.bullets.length > 0) {
              sec.bullets.forEach(b => {
                formattedStudyDoc += `   • ${b}\n`;
              });
              formattedStudyDoc += `\n`;
            }
            if (sec.facultyNote) {
              formattedStudyDoc += `   [Teacher Exam Tip]: ${sec.facultyNote}\n\n`;
            }
          });
          formattedStudyDoc += `\n------------------------------------------------------------------------\n\n`;
        });

        formattedStudyDoc += `Archived and verified for UGI Students.\nCampus Study Hub · "Missed a Class? Never Miss a Concept."\n`;

        const blob = new Blob([formattedStudyDoc], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resource.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Study_Notes.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Download tracking failed', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/80 backdrop-blur-xs p-2 sm:p-4">
      <div
        className={`bg-warm-white flex flex-col rounded-xl shadow-2xl border border-soft-beige transition-all overflow-hidden ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[92vh]'
        }`}
      >
        {/* Top Header / Toolbar */}
        <div className="bg-[#FAF4E5] border-b border-[#E8D9B8] px-4 py-3 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-bloodstone text-warm-white flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-charcoal truncate" title={resource.title}>
                {resource.title}
              </h2>
              <div className="flex items-center gap-2 text-xs text-charcoal/70">
                <span>{resource.uploadedBy.name}</span>
                <span aria-hidden="true">·</span>
                <span>{resource.fileSize || '1.8 MB'}</span>
                {resource.version && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-bloodstone font-medium">v{resource.version}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle if fileUrl exists */}
            {resource.fileUrl && (
              <div className="hidden sm:flex items-center bg-[#E8D9B8]/50 p-0.5 rounded-lg text-xs font-medium mr-1">
                <button
                  type="button"
                  onClick={() => setViewMode('reader')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'reader' ? 'bg-warm-white text-bloodstone shadow-xs' : 'text-charcoal/70 hover:text-charcoal'
                  }`}
                >
                  Formatted
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('raw_file')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'raw_file' ? 'bg-warm-white text-bloodstone shadow-xs' : 'text-charcoal/70 hover:text-charcoal'
                  }`}
                >
                  Source File
                </button>
              </div>
            )}

            {/* Bookmark */}
            <button
              type="button"
              onClick={onToggleBookmark}
              title={isBookmarked ? 'Remove Bookmark' : 'Save to Bookmarks'}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked ? 'text-bloodstone bg-bloodstone/10' : 'text-charcoal/70 hover:bg-[#E8D9B8]/60 hover:text-charcoal'
              }`}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>

            {/* Download */}
            <button
              type="button"
              onClick={handleDownload}
              title="Download Document"
              className="px-3 py-1.5 bg-bloodstone hover:bg-bloodstone-hover text-warm-white text-xs font-medium rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Report */}
            <button
              type="button"
              onClick={onOpenReport}
              title="Report broken or incorrect resource"
              className="p-2 text-charcoal/60 hover:text-bloodstone hover:bg-bloodstone/10 rounded-lg transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-2 text-charcoal/70 hover:bg-[#E8D9B8]/60 rounded-lg transition-colors hidden md:block"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-charcoal/70 hover:bg-bloodstone/10 hover:text-bloodstone rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Secondary Page & Zoom Controls */}
        <div className="bg-[#FAF4E5]/80 border-b border-[#E8D9B8]/60 px-4 py-2 flex items-center justify-between text-xs text-charcoal/80 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              className="p-1 rounded hover:bg-[#E8D9B8] disabled:opacity-40 transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium">
              Page <span className="font-mono text-bloodstone">{currentPage}</span> of{' '}
              <span className="font-mono">{totalPages}</span>
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              className="p-1 rounded hover:bg-[#E8D9B8] disabled:opacity-40 transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1 rounded hover:bg-[#E8D9B8] transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="font-mono text-xs w-10 text-center">{zoom}%</span>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1 rounded hover:bg-[#E8D9B8] transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleRotate}
              className="p-1 rounded hover:bg-[#E8D9B8] transition-colors"
              title="Rotate 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Document Body */}
        <div className="flex-1 bg-[#2C2929] overflow-auto p-4 sm:p-8 flex justify-center items-start">
          {viewMode === 'raw_file' && resource.fileUrl ? (
            <div className="w-full h-full bg-white rounded-lg shadow-xl overflow-hidden flex flex-col">
              <div className="bg-[#FAF4E5] p-2 text-xs flex justify-between items-center border-b border-[#E8D9B8]">
                <span>Rendering Source: {resource.fileName || 'file.pdf'}</span>
                <a
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-bloodstone hover:underline flex items-center gap-1 font-medium"
                >
                  Open in New Tab <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <iframe
                src={resource.fileUrl}
                title={resource.title}
                className="w-full h-full border-0"
              />
            </div>
          ) : (
            <div
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out',
              }}
              className="w-full max-w-3xl bg-[#FFFCF5] shadow-2xl rounded-sm p-8 sm:p-12 border border-[#E8D9B8] min-h-[900px] flex flex-col justify-between"
            >
              {/* Document Header */}
              <div>
                <div className="border-b-2 border-bloodstone/30 pb-4 mb-6">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-charcoal/60 mb-1">
                    <span>{doc.collegeHeader}</span>
                    <span className="font-mono">{doc.academicYear}</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-serif font-bold text-bloodstone leading-tight mb-1">
                    {doc.title}
                  </h1>
                  <p className="text-xs text-charcoal/80 font-medium">{doc.subtitle}</p>
                </div>

                {/* Page Specific Header */}
                <div className="mb-6 bg-vanilla/30 p-3 rounded-lg border border-vanilla-dark/40">
                  <h2 className="text-sm font-bold text-charcoal">{pageData?.header}</h2>
                  {pageData?.subHeader && (
                    <p className="text-xs text-charcoal/70 mt-0.5">{pageData.subHeader}</p>
                  )}
                </div>

                {/* Page Sections */}
                <div className="space-y-6 text-sm text-charcoal leading-relaxed">
                  {pageData?.sections.map((sec, idx) => (
                    <div key={idx} className="space-y-2">
                      {sec.heading && (
                        <h3 className="text-sm font-semibold text-bloodstone flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-bloodstone inline-block"></span>
                          {sec.heading}
                        </h3>
                      )}

                      {sec.text && <p className="text-xs sm:text-sm text-charcoal/90">{sec.text}</p>}

                      {sec.bullets && (
                        <ul className="space-y-1.5 pl-4 list-disc text-xs sm:text-sm text-charcoal/85">
                          {sec.bullets.map((b, bIdx) => (
                            <li key={bIdx}>{b}</li>
                          ))}
                        </ul>
                      )}

                      {sec.formula && (
                        <div className="my-3 p-3 bg-warm-white rounded-lg border border-[#E8D9B8] font-mono text-xs sm:text-sm text-bloodstone text-center font-medium shadow-xs">
                          {sec.formula}
                        </div>
                      )}

                      {/* Visual Matrix representation */}
                      {sec.diagramType === 'matrix' && sec.diagramData?.matrix && (
                        <div className="flex items-center justify-center my-4 font-mono text-sm">
                          <span className="text-2xl mr-2 text-charcoal/70">[</span>
                          <div className="grid grid-cols-3 gap-x-6 gap-y-2 text-center">
                            {sec.diagramData.matrix.flat().map((val: number, vIdx: number) => (
                              <span key={vIdx} className="w-8 py-1 bg-vanilla/40 rounded">
                                {val}
                              </span>
                            ))}
                          </div>
                          <span className="text-2xl ml-2 text-charcoal/70">]</span>
                        </div>
                      )}

                      {/* Visual Table */}
                      {sec.diagramType === 'table' && sec.diagramData && (
                        <div className="overflow-x-auto my-3 border border-[#E8D9B8] rounded-lg">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-[#FAF4E5] border-b border-[#E8D9B8] text-charcoal font-semibold">
                              <tr>
                                {sec.diagramData.headers.map((h: string, hIdx: number) => (
                                  <th key={hIdx} className="p-2">
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E8D9B8]/50">
                              {sec.diagramData.rows.map((row: string[], rIdx: number) => (
                                <tr key={rIdx} className="hover:bg-vanilla/20">
                                  {row.map((cell: string, cIdx: number) => (
                                    <td key={cIdx} className="p-2 font-mono text-[11px]">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Exam Questions */}
                      {sec.diagramType === 'exam_question' && Array.isArray(sec.diagramData) && (
                        <div className="space-y-2 my-3">
                          {sec.diagramData.map((q: any, qIdx: number) => (
                            <div
                              key={qIdx}
                              className="p-2.5 bg-[#FAF4E5]/60 rounded-md border border-[#E8D9B8] flex justify-between items-start gap-3"
                            >
                              <div className="text-xs">
                                <span className="font-bold text-bloodstone mr-2">{q.qNo}</span>
                                <span className="text-charcoal/90">{q.text}</span>
                              </div>
                              <span className="text-[11px] font-mono text-bloodstone font-semibold shrink-0">
                                {q.marks}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {sec.facultyNote && (
                        <div className="p-2.5 bg-vanilla/40 rounded-md border border-vanilla-dark/50 text-xs text-charcoal/80 flex items-start gap-2 italic">
                          <span className="font-semibold not-italic text-bloodstone shrink-0">Note:</span>
                          <span>{sec.facultyNote}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Page Footer */}
              <div className="border-t border-[#E8D9B8] pt-4 mt-8 flex items-center justify-between text-[11px] text-charcoal/60">
                <span>UGI Campus Study Hub — Student Copy</span>
                <span className="font-mono">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
