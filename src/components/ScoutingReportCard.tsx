import React from 'react';
import { ScoutingReport } from '../types';
import { ClipboardCheck, CheckCircle2, AlertCircle, Award, RefreshCw, FileText } from 'lucide-react';

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
      <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600 animate-pulse" />
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-emerald-600 animate-spin mb-4 border border-slate-200">
            <RefreshCw className="w-6 h-6" />
          </div>
          <h3 className="font-sans text-xl font-bold text-slate-900 mb-2">
            Compiling Scouting Dossier for {playerName}...
          </h3>
          <p className="text-xs text-slate-500 max-w-md leading-relaxed">
            Analyzing logged match minutes, goal involvement ratios, and performance notes.
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
        <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="font-sans text-lg font-bold text-slate-900">No Scouting Report Available</p>
        <p className="text-xs text-slate-500 mt-1 mb-4">Log match performance to generate the player's tactical dossier.</p>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer"
          >
            Generate Scouting Report
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8 shadow-xs relative transition-all">
      
      {/* Top Header Label */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center shadow-xs border border-slate-800">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
              Verified Evaluation
            </span>
            <h3 className="font-sans text-lg font-bold text-slate-900 leading-tight">
              Tactical Scout Dossier
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {report.generatedAt && (
            <span className="text-[11px] text-slate-500 font-mono">
              Updated: {new Date(report.generatedAt).toLocaleDateString()}
            </span>
          )}

          {showRegenerateButton && onRegenerate && (
            <button
              onClick={onRegenerate}
              title="Refresh report with latest match stats"
              id="btn-regenerate-report"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh Analysis</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Professional Summary */}
      <div className="mb-6">
        <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold mb-2 flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-700" />
          <span>Executive Summary</span>
        </h4>
        <p className="font-sans text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200 italic">
          "{report.summary}"
        </p>
      </div>

      {/* Grid: Strengths & Areas to Develop */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        
        {/* 2. Strengths */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
          <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-700 font-bold mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Key Strengths</span>
          </h4>
          <ul className="space-y-2">
            {report.strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-800 leading-normal font-medium">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Areas to Improve */}
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
          <h4 className="text-xs font-mono uppercase tracking-wider text-amber-700 font-bold mb-3 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Development Areas</span>
          </h4>
          <ul className="space-y-2">
            {report.areasToDevelop.map((area, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-800 leading-normal font-medium">
                <span className="text-amber-600 font-bold">•</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* 4. Verdict */}
      <div className="bg-slate-900 text-white p-4 rounded-xl flex items-start sm:items-center gap-3 border border-slate-800">
        <div className="p-2 rounded-lg bg-amber-500 text-slate-950 shrink-0 mt-0.5 sm:mt-0 font-bold">
          <Award className="w-4 h-4" />
        </div>
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
            Scout Verdict
          </span>
          <p className="font-sans text-sm font-semibold text-white">
            {report.verdict}
          </p>
        </div>
      </div>

    </div>
  );
};
