import React, { useState } from 'react';
import { X, Database, Copy, Check, Terminal, ShieldCheck } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-[#F6F1E7] border-2 border-[#1E1C19] rounded-2xl w-full max-w-2xl my-8 overflow-hidden shadow-2xl relative">
        
        {/* Modal Header */}
        <div className="bg-[#1E1C19] text-[#F6F1E7] p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#C9862E]" />
            <h3 className="font-serif-heading text-xl font-bold">Supabase & Database Architecture</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-[#8C8577]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 text-[#1E1C19]">
          
          <div className="bg-white p-4 rounded-xl border border-[#8C8577]/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#2D5D3F] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-sm">Postgres & Row Level Security (RLS)</p>
              <p className="text-[#8C8577] leading-relaxed">
                FootyFolio is designed to run seamlessly with a free-tier Supabase Postgres database. Talent profiles and scouting reports are publicly discoverable by authenticated scouts, while player match logs are secured by Row Level Security.
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#1E1C19] font-bold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#2D5D3F]" />
                <span>Supabase SQL DDL Migration Script</span>
              </span>
              <button
                onClick={handleCopySchema}
                id="btn-copy-sql-schema"
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#2D5D3F] text-[#F6F1E7] text-xs font-semibold hover:bg-[#234932] transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied SQL' : 'Copy SQL'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-[#1E1C19] text-[#F6F1E7] text-[11px] font-mono overflow-x-auto max-h-60 leading-relaxed border border-[#8C8577]/30">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>

          <div className="pt-3 border-t border-[#8C8577]/20 text-xs text-[#8C8577] flex items-center justify-between">
            <span>Environment Variables: <code className="font-mono text-[#1E1C19]">GEMINI_API_KEY</code></span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#1E1C19] text-[#F6F1E7] font-semibold text-xs"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
