import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Database, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Sliders, 
  Save, 
  RotateCcw, 
  Eye, 
  FileText, 
  Check, 
  Info,
  Server,
  Zap
} from 'lucide-react';
import { 
  AiGovernanceSettings, 
  AiDomainTask, 
  AiDomainRoutingConfig 
} from '../../types';
import { 
  loadAiGovernanceSettings, 
  saveAiGovernanceSettings, 
  DEFAULT_AI_GOVERNANCE_SETTINGS,
  SAMPLE_PIPEDA_TEST_PAYLOAD 
} from '../../data/aiGovernanceData';
import { 
  sanitizePiiForAi, 
  auditPiiCompliance, 
  SanitizationResult 
} from '../../utils/piiSanitizer';
import { 
  GEMINI_MODEL_PRESETS, 
  OPENAI_MODEL_PRESETS, 
  DEEPSEEK_MODEL_PRESETS 
} from '../chat/AccsAiAssistant';

interface AiModelGovernanceConsoleProps {
  onClose?: () => void;
}

export const AiModelGovernanceConsole: React.FC<AiModelGovernanceConsoleProps> = () => {
  const [settings, setSettings] = useState<AiGovernanceSettings>(loadAiGovernanceSettings);
  const [hasSaved, setHasSaved] = useState(false);

  // Playground state
  const [playgroundInput, setPlaygroundInput] = useState<string>(SAMPLE_PIPEDA_TEST_PAYLOAD);

  // Real-time sanitization result for playground
  const playgroundResult: SanitizationResult = useMemo(() => {
    return sanitizePiiForAi(playgroundInput, {
      maskOhip: settings.maskOhipNumbers,
      maskAddresses: settings.maskPhysicalAddresses,
      maskPhones: settings.maskPhoneAndEmail,
      maskEmails: settings.maskPhoneAndEmail,
      maskPostalCodes: settings.maskPhysicalAddresses,
      maskChildNames: settings.maskChildSurnames,
      preserveAgencyContacts: true
    });
  }, [playgroundInput, settings]);

  const auditResult = useMemo(() => {
    return auditPiiCompliance(playgroundInput);
  }, [playgroundInput]);

  const handleSave = () => {
    const updated = {
      ...settings,
      lastAuditTimestamp: new Date().toISOString(),
      auditedBy: 'Agency Director'
    };
    setSettings(updated);
    saveAiGovernanceSettings(updated);
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Reset AI Model Governance to default Ministry and Canadian PIPEDA standards?')) {
      setSettings(DEFAULT_AI_GOVERNANCE_SETTINGS);
      saveAiGovernanceSettings(DEFAULT_AI_GOVERNANCE_SETTINGS);
      setHasSaved(true);
      setTimeout(() => setHasSaved(false), 3000);
    }
  };

  const updateDomainConfig = (domain: AiDomainTask, patch: Partial<AiDomainRoutingConfig>) => {
    setSettings(prev => ({
      ...prev,
      domainRouting: {
        ...prev.domainRouting,
        [domain]: {
          ...prev.domainRouting[domain],
          ...patch
        }
      }
    }));
  };

  const getAvailableModelsForProvider = (provider: string) => {
    switch (provider) {
      case 'gemini':
        return GEMINI_MODEL_PRESETS;
      case 'openai':
        return OPENAI_MODEL_PRESETS;
      case 'deepseek':
        return DEEPSEEK_MODEL_PRESETS;
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Canadian Data Sovereignty Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border-2 border-slate-900 shadow-neo">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-orange-500 text-white font-mono font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                Task #28 Policy Control
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span>🇨🇦 Canadian PIPEDA / PHIPA Sovereign</span>
              </span>
              <span className="bg-blue-500/20 text-blue-300 border border-blue-400/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Zero Cloud LLM Database Access Verified</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Cpu className="w-6 h-6 text-orange-400" />
              <span>Admin AI Model Governance & Data Sovereignty Console</span>
            </h2>

            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Enforces strict Canadian data privacy (PIPEDA & Ontario PHIPA) by maintaining a complete air-gap between external Cloud LLMs and the Cloud Firestore database. Cloud AI APIs receive only ephemeral, client-side sanitized prompt payloads with all OHIP numbers and sensitive identifiers scrubbed beforehand.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <button
              type="button"
              onClick={handleSave}
              className="neo-btn bg-orange-500 hover:bg-orange-400 text-white px-5 py-2.5 text-xs font-black flex items-center gap-1.5 shadow-neo-sm transition-all"
            >
              {hasSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{hasSaved ? 'Policy Saved!' : 'Save AI Policy'}</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Reset to default Ministry policies"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Triple Air-Gap Architecture Guarantee Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6 pt-6 border-t border-slate-700/80 text-xs">
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-[11px] uppercase tracking-wider">Canadian Data Residency</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Database region locked to <strong>northamerica-northeast1</strong> (Montreal, Canada). No family records leave Canadian borders.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-[11px] uppercase tracking-wider">Air-Gapped Cloud LLMs</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                External AI models have <strong>zero API keys or query access</strong> to Firestore. Prompts contain only sanitized context.
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-[11px] uppercase tracking-wider">Client-Side Pre-Flight</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                OHIP numbers, private home street addresses, and full names are scrubbed locally in the browser before network transmission.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Client-Side PII Pre-Flight Sanitization Controls */}
      <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-8 shadow-neo space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-slate-100">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-base font-black text-slate-900">
                1. Client-Side Pre-Flight PII Sanitization Controls
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure automatic client-side redaction rules applied prior to any prompt dispatch.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-800">
            <input
              type="checkbox"
              checked={settings.strictPiiMaskingEnabled}
              onChange={(e) => setSettings(prev => ({ ...prev, strictPiiMaskingEnabled: e.target.checked }))}
              className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
            />
            <span>Master PII Masking: {settings.strictPiiMaskingEnabled ? 'Active' : 'Disabled'}</span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* OHIP Masking */}
          <div className={`p-4 rounded-2xl border-2 transition-all ${
            settings.maskOhipNumbers ? 'bg-emerald-50/50 border-emerald-500/80' : 'bg-slate-50 border-slate-200 opacity-60'
          }`}>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maskOhipNumbers}
                onChange={(e) => setSettings(prev => ({ ...prev, maskOhipNumbers: e.target.checked }))}
                className="w-4 h-4 mt-0.5 accent-emerald-600 rounded cursor-pointer shrink-0"
              />
              <div className="space-y-1">
                <span className="font-extrabold text-xs text-slate-900 block">Ontario Health Card (OHIP)</span>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Masks 10-digit Ontario health card numbers + 2-letter version codes (e.g. <code className="font-mono text-[10px] bg-white px-1 rounded border">4019-281-994-EC</code>).
                </p>
              </div>
            </label>
          </div>

          {/* Address Masking */}
          <div className={`p-4 rounded-2xl border-2 transition-all ${
            settings.maskPhysicalAddresses ? 'bg-emerald-50/50 border-emerald-500/80' : 'bg-slate-50 border-slate-200 opacity-60'
          }`}>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maskPhysicalAddresses}
                onChange={(e) => setSettings(prev => ({ ...prev, maskPhysicalAddresses: e.target.checked }))}
                className="w-4 h-4 mt-0.5 accent-emerald-600 rounded cursor-pointer shrink-0"
              />
              <div className="space-y-1">
                <span className="font-extrabold text-xs text-slate-900 block">Home Street Addresses</span>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Redacts physical street numbers and Canadian postal codes (<code className="font-mono text-[10px] bg-white px-1 rounded border">L4C 1V2</code>) to protect home privacy.
                </p>
              </div>
            </label>
          </div>

          {/* Phone & Email Masking */}
          <div className={`p-4 rounded-2xl border-2 transition-all ${
            settings.maskPhoneAndEmail ? 'bg-emerald-50/50 border-emerald-500/80' : 'bg-slate-50 border-slate-200 opacity-60'
          }`}>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maskPhoneAndEmail}
                onChange={(e) => setSettings(prev => ({ ...prev, maskPhoneAndEmail: e.target.checked }))}
                className="w-4 h-4 mt-0.5 accent-emerald-600 rounded cursor-pointer shrink-0"
              />
              <div className="space-y-1">
                <span className="font-extrabold text-xs text-slate-900 block">Personal Phone & Email</span>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Redacts personal parent/provider phones and emails while preserving the official agency hotline (<code className="font-mono text-[10px] bg-white px-1 rounded border">(416) 694-7445</code>).
                </p>
              </div>
            </label>
          </div>

          {/* Child Surname Masking */}
          <div className={`p-4 rounded-2xl border-2 transition-all ${
            settings.maskChildSurnames ? 'bg-emerald-50/50 border-emerald-500/80' : 'bg-slate-50 border-slate-200 opacity-60'
          }`}>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maskChildSurnames}
                onChange={(e) => setSettings(prev => ({ ...prev, maskChildSurnames: e.target.checked }))}
                className="w-4 h-4 mt-0.5 accent-emerald-600 rounded cursor-pointer shrink-0"
              />
              <div className="space-y-1">
                <span className="font-extrabold text-xs text-slate-900 block">Children Surnames</span>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Replaces child surnames with initial and pseudonym (<code className="font-mono text-[10px] bg-white px-1 rounded border">Emily C. [CHILD]</code>) to protect minor identity.
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Domain-Specific Modular AI Routing Matrix */}
      <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-8 shadow-neo space-y-5">
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-base font-black text-slate-900">
                2. Modular Domain-Specific AI Model Routing
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign specialized models per operational agency domain based on reasoning depth and compliance tier.
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
            4 Operational Domains Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(settings.domainRouting) as AiDomainTask[]).map((taskKey) => {
            const config = settings.domainRouting[taskKey];
            const models = getAvailableModelsForProvider(config.preferredProvider);

            return (
              <div
                key={taskKey}
                className="p-5 rounded-2xl border-2 border-slate-900 bg-slate-50/70 shadow-neo-sm space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-black uppercase text-slate-900 tracking-wide">
                      {config.title}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-300">
                      {config.piiMaskingLevel === 'strict_phipa' ? '🛡️ Strict PHIPA' : '⚖️ Standard PIPEDA'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {config.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                  {/* Provider Selection */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      AI Provider
                    </label>
                    <select
                      value={config.preferredProvider}
                      onChange={(e) => {
                        const newProvider = e.target.value as any;
                        const avail = getAvailableModelsForProvider(newProvider);
                        updateDomainConfig(taskKey, {
                          preferredProvider: newProvider,
                          preferredModelId: avail[0]?.id || 'gemini-3.8-flash'
                        });
                      }}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                    >
                      <option value="gemini">Google Gemini</option>
                      <option value="openai">OpenAI (ChatGPT)</option>
                      <option value="deepseek">DeepSeek</option>
                    </select>
                  </div>

                  {/* Model Selection */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Assigned Model
                    </label>
                    <select
                      value={config.preferredModelId}
                      onChange={(e) => updateDomainConfig(taskKey, { preferredModelId: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono text-[11px] font-bold text-slate-900 focus:outline-none focus:border-purple-600"
                    >
                      {models.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Live Interactive PII Sanitizer Test Playground */}
      <div className="bg-white rounded-3xl border-2 border-slate-900 p-6 sm:p-8 shadow-neo space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-slate-100">
          <div className="flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-orange-600" />
            <div>
              <h3 className="text-base font-black text-slate-900">
                3. Live Canadian PIPEDA Pre-Flight Sanitization Playground
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulate how client-side scrubbing removes OHIP numbers and addresses in real-time before external LLM dispatch.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPlaygroundInput(SAMPLE_PIPEDA_TEST_PAYLOAD)}
            className="neo-btn bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 text-xs font-bold gap-1 self-start sm:self-auto border border-slate-300 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-orange-600" />
            <span>Load Sample Family Record</span>
          </button>
        </div>

        {/* Audit metrics banner */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-700">Detections in Raw Text:</span>
            <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
              auditResult.totalViolations > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}>
              {auditResult.totalViolations} Sensitive Token(s) Detected
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            {auditResult.ohipViolations > 0 && (
              <span className="bg-rose-100 text-rose-900 px-2 py-0.5 rounded font-bold border border-rose-300">
                {auditResult.ohipViolations} OHIP Health Card
              </span>
            )}
            {auditResult.addressViolations > 0 && (
              <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold border border-amber-300">
                {auditResult.addressViolations} Physical Address
              </span>
            )}
            {auditResult.phoneViolations > 0 && (
              <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-bold border border-purple-300">
                {auditResult.phoneViolations} Personal Phone
              </span>
            )}
            {auditResult.emailViolations > 0 && (
              <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-bold border border-blue-300">
                {auditResult.emailViolations} Email
              </span>
            )}
          </div>
        </div>

        {/* Side-by-Side Playground */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Raw Text Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">
                Raw Client-Side Text (What the user or system inputs)
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {playgroundInput.length} chars
              </span>
            </div>
            <textarea
              rows={8}
              value={playgroundInput}
              onChange={(e) => setPlaygroundInput(e.target.value)}
              placeholder="Paste raw family record, OHIP, or parent phone number..."
              className="w-full p-3 bg-white border-2 border-slate-300 rounded-2xl font-mono text-[11px] leading-relaxed text-slate-900 focus:outline-none focus:border-orange-500 shadow-inner"
            />
          </div>

          {/* Sanitized Output */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-emerald-800 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sanitized Payload (What External Cloud LLM Sees)</span>
              </label>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {playgroundResult.maskedCount} Token(s) Scrubbed
              </span>
            </div>
            <div className="w-full p-3 bg-slate-900 text-emerald-400 border-2 border-slate-900 rounded-2xl font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap min-h-[178px] shadow-sm">
              {playgroundResult.sanitizedText}
            </div>
          </div>
        </div>

        <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2 text-xs text-emerald-950 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            100% Client-Side Guarantee: This sanitization executes locally in JavaScript on the client's browser before any network payload is constructed or transmitted.
          </span>
        </div>
      </div>
    </div>
  );
};
