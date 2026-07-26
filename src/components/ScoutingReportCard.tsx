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
      <div className="rounded-2xl border-2 border-[#2D5D3F]/40 bg-white p-6 lg:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#2D5D3F] animate-pulse" />
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#2D5D3F]/10 flex items-center justify-center text-[#2D5D3F] animate-spin mb-4">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="font-serif-heading text-xl font-bold text-[#1E1C19] mb-2">
            Generating Scouting Report for {playerName}...
          </h3>
          <p className="text-xs text-[#8C8577] max-w-md leading-relaxed">
            Gemini AI is analyzing logged match minutes, goal involvement ratios, and notes to compose a professional scout dossier.
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="rounded-2xl border border-dashed border-[#8C8577]/40 bg-white/80 p-6 text-center">
        <FileText className="w-8 h-8 text-[#8C8577] mx-auto mb-2" />
        <p className="font-serif-heading text-lg font-bold text-[#1E1C19]">No Scouting Report Yet</p>
        <p className="text-xs text-[#8C8577] mt-1 mb-4">Log your first match performance to generate your AI scout write-up.</p>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="px-4 py-2 rounded-lg bg-[#2D5D3F] text-white text-xs font-semibold hover:bg-[#234932] transition-all"
          >
            Generate Report Now
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-[#1E1C19]/10 bg-[#F6F1E7] p-6 lg:p-8 shadow-sm relative transition-all hover:border-[#2D5D3F]/40">
      
      {/* Top Header Label */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-[#8C8577]/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#2D5D3F] text-[#F6F1E7] flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C8577] font-bold block">
              Official Dossier
            </span>
            <h3 className="font-serif-heading text-lg font-bold text-[#1E1C19] leading-none">
              AI Scouting Write-up
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {report.generatedAt && (
            <span className="text-[11px] text-[#8C8577] font-mono">
              Updated: {new Date(report.generatedAt).toLocaleDateString()}
            </span>
          )}

          {showRegenerateButton && onRegenerate && (
            <button
              onClick={onRegenerate}
              title="Regenerate report with latest match stats"
              id="btn-regenerate-report"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#8C8577]/30 text-[#1E1C19] hover:text-[#2D5D3F] hover:border-[#2D5D3F] text-xs font-medium transition-all shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh AI</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Summary */}
      <div className="mb-6">
        <h4 className="text-xs font-mono uppercase tracking-wider text-[#2D5D3F] font-bold mb-2 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          <span>Player Summary</span>
        </h4>
        <p className="font-sans text-sm text-[#1E1C19] leading-relaxed bg-white/80 p-4 rounded-xl border border-[#8C8577]/20 italic">
          "{report.summary}"
        </p>
      </div>

      {/* Grid: Strengths & Areas to Develop */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        
        {/* 2. Strengths */}
        <div className="bg-white/80 p-4 rounded-xl border border-[#2D5D3F]/20">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#2D5D3F] font-bold mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#2D5D3F]" />
            <span>Key Strengths</span>
          </h4>
          <ul className="space-y-2">
            {report.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-[#1E1C19] leading-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D5D3F] mt-1.5 shrink-0" />
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Areas to Develop */}
        <div className="bg-white/80 p-4 rounded-xl border border-[#C9862E]/20">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#C9862E] font-bold mb-3 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-[#C9862E]" />
            <span>Areas to Develop</span>
          </h4>
          <ul className="space-y-2">
            {report.areasToDevelop.map((area, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-[#1E1C19] leading-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9862E] mt-1.5 shrink-0" />
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* 4. Verdict */}
      <div className="bg-[#1E1C19] text-[#F6F1E7] p-4 rounded-xl flex items-start sm:items-center gap-3">
        <div className="p-2 rounded-lg bg-[#C9862E] text-[#1E1C19] shrink-0 mt-0.5 sm:mt-0">
          <Award className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9862E] font-bold block">
            Scout Verdict
          </span>
          <p className="font-serif-heading text-sm font-semibold text-white">
            {report.verdict}
          </p>
        </div>
      </div>

    </div>
  );
};
