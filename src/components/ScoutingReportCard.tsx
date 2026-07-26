import React from 'react';
import { ScoutingReport } from '../types';
import { Sparkles, CheckCircle2, AlertCircle, Award, RefreshCw, FileText } from 'lucide-react';

interface ScoutingReportCardProps {
  report?: ScoutingReport;
  playerName: string;
  position: string;
  isGenerating?: boolean;
  onRegenerate?: () => void;
  showRegenerateButton?: boolean;
}

export const ScoutingReportCard: React.FC<ScoutingReportCardProps> = ({
  report,
  playerName,
  position,
  isGenerating = false,
  onRegenerate,
  showRegenerateButton = true
}) => {
  if (isGenerating) {
    return (
      <div className="rounded-2xl border-2 border-[#16A34A]/40 bg-white p-6 lg:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#16A34A] animate-pulse" />
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#16A34A]/10 flex items-center justify-center text-[#16A34A] animate-spin mb-4">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="font-sans text-xl font-bold text-[#111827] mb-2">
            Generating Scouting Report for {playerName}...
          </h3>
          <p className="text-xs text-[#6B7280] max-w-md leading-relaxed">
            Gemini AI is analyzing logged match minutes, goal involvement ratios, and notes to compose a professional scout dossier.
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-6 text-center">
        <FileText className="w-8 h-8 text-[#6B7280] mx-auto mb-2" />
        <p className="font-sans text-lg font-bold text-[#111827]">No Scouting Report Yet</p>
        <p className="text-xs text-[#6B7280] mt-1 mb-4">Log your first match performance to generate your AI scout write-up.</p>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="px-4 py-2 rounded-xl bg-[#16A34A] text-white text-xs font-semibold hover:bg-[#15803D] transition-all cursor-pointer"
          >
            Generate Scouting Report
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 lg:p-8 shadow-xs relative transition-all hover:border-[#16A34A]/40">
      
      {/* Top Header Label */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#16A34A] text-white flex items-center justify-center shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#6B7280] font-bold block">
              AI Verified Report
            </span>
            <h3 className="font-sans text-lg font-bold text-[#111827] leading-none">
              AI Scout Report
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {report.generatedAt && (
            <span className="text-[11px] text-[#6B7280] font-mono">
              Updated: {new Date(report.generatedAt).toLocaleDateString()}
            </span>
          )}

          {showRegenerateButton && onRegenerate && (
            <button
              onClick={onRegenerate}
              title="Regenerate report with latest match stats"
              id="btn-regenerate-report"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827] hover:text-[#16A34A] hover:border-[#16A34A] text-xs font-medium transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh AI</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Professional Summary */}
      <div className="mb-6">
        <h4 className="text-xs font-mono uppercase tracking-wider text-[#16A34A] font-bold mb-2 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          <span>Professional Summary</span>
        </h4>
        <p className="font-sans text-sm text-[#111827] leading-relaxed bg-[#F8FAFC] p-4 rounded-xl border border-[#E5E7EB] italic">
          "{report.summary}"
        </p>
      </div>

      {/* Grid: Strengths & Areas to Develop */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        
        {/* 2. Strengths */}
        <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E5E7EB]">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#16A34A] font-bold mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
            <span>Strengths</span>
          </h4>
          <ul className="space-y-2">
            {report.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-[#111827] leading-normal font-medium">
                <span className="text-[#16A34A] font-bold">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Areas to Improve */}
        <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E5E7EB]">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#D97706] font-bold mb-3 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-[#D97706]" />
            <span>Areas to Improve</span>
          </h4>
          <ul className="space-y-2">
            {report.areasToDevelop.map((area, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-[#111827] leading-normal font-medium">
                <span className="text-[#D97706] font-bold">•</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* 4. Verdict */}
      <div className="bg-[#111827] text-white p-4 rounded-xl flex items-start sm:items-center gap-3">
        <div className="p-2 rounded-lg bg-[#D97706] text-white shrink-0 mt-0.5 sm:mt-0">
          <Award className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#D97706] font-bold block">
            Verdict
          </span>
          <p className="font-sans text-sm font-semibold text-white">
            {report.verdict}
          </p>
        </div>
      </div>

    </div>
  );
};
