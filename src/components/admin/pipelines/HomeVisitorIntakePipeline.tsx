import React, { useState } from 'react';
import { HomeVisitorApplicant, VisitorIntakeStage, HomeVisitor, RegionType } from '../../../types';
import { ModalPortal } from '../../common/ModalPortal';
import { 
  UserCheck, 
  ShieldCheck, 
  FileCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Search, 
  Filter, 
  Plus, 
  X, 
  Sparkles, 
  FileText, 
  Check, 
  ArrowRight, 
  User, 
  ShieldAlert,
  ExternalLink,
  Award,
  BookOpen
} from 'lucide-react';

interface HomeVisitorIntakePipelineProps {
  applicants: HomeVisitorApplicant[];
  onUpdateApplicantStage: (applicantId: string, newStage: VisitorIntakeStage) => void;
  onUpdateApplicantData: (applicantId: string, updates: Partial<HomeVisitorApplicant>) => void;
  onGraduateVisitor: (applicant: HomeVisitorApplicant) => void;
  onAddApplicant: (applicant: HomeVisitorApplicant) => void;
}

const STAGE_CONFIG: { stage: VisitorIntakeStage; label: string; subtext: string; badgeColor: string }[] = [
  {
    stage: 'screening',
    label: '1. Screening & RECE',
    subtext: 'College of ECE Verification',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  {
    stage: 'vsc_credentials',
    label: '2. VSC & Credentials',
    subtext: 'Police Record & CPR-C',
    badgeColor: 'bg-amber-100 text-amber-800'
  },
  {
    stage: 'cceya_training',
    label: '3. CCEYA Checklist',
    subtext: '38-Page Audit & 2 Shadows',
    badgeColor: 'bg-purple-100 text-purple-800'
  },
  {
    stage: 'active',
    label: '4. Ready for Caseload',
    subtext: 'Director Sign-Off',
    badgeColor: 'bg-emerald-100 text-emerald-800'
  }
];

export const HomeVisitorIntakePipeline: React.FC<HomeVisitorIntakePipelineProps> = ({
  applicants,
  onUpdateApplicantStage,
  onUpdateApplicantData,
  onGraduateVisitor,
  onAddApplicant
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<HomeVisitorApplicant | null>(null);
  const [isNewApplicantModalOpen, setIsNewApplicantModalOpen] = useState(false);
  const [isReceModalOpen, setIsReceModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Close modal on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isNewApplicantModalOpen) {
        setIsNewApplicantModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNewApplicantModalOpen]);

  // New visitor draft state
  const [newDraftName, setNewDraftName] = useState('');
  const [newDraftEmail, setNewDraftEmail] = useState('');
  const [newDraftPhone, setNewDraftPhone] = useState('');
  const [newDraftRece, setNewDraftRece] = useState('');
  const [newDraftRegion, setNewDraftRegion] = useState<'Durham South' | 'Durham North' | 'York/Toronto'>('Durham South');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredApplicants = applicants.filter(app => {
    return (
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.receNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.assignedRegion && app.assignedRegion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const getNextStage = (current: VisitorIntakeStage): VisitorIntakeStage | null => {
    if (current === 'screening') return 'vsc_credentials';
    if (current === 'vsc_credentials') return 'cceya_training';
    if (current === 'cceya_training') return 'active';
    return null;
  };

  const handleCreateApplicant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDraftName || !newDraftRece) return;

    const newApp: HomeVisitorApplicant = {
      id: `vis-app-${Date.now()}`,
      applicantName: newDraftName,
      email: newDraftEmail || 'visitor@example.com',
      phone: newDraftPhone || '(905) 555-0188',
      appliedDate: new Date().toISOString().split('T')[0],
      stage: 'screening',
      receNumber: newDraftRece.startsWith('RECE') ? newDraftRece : `RECE #${newDraftRece}`,
      receGoodStanding: true,
      vscCleared: false,
      firstAidCertified: true,
      cceyaChecklistTrainingComplete: false,
      shadowInspectionsCount: 0,
      assignedRegion: newDraftRegion,
      notes: 'New RECE home visitor candidate profile initiated.'
    };

    onAddApplicant(newApp);
    setIsNewApplicantModalOpen(false);
    showToast(`Registered ${newDraftName} (${newApp.receNumber}) to Home Visitor Pipeline.`);

    setNewDraftName('');
    setNewDraftEmail('');
    setNewDraftPhone('');
    setNewDraftRece('');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl border-2 border-emerald-500 shadow-neo flex items-center gap-3 animate-fade-in">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-bold">{toastMessage}</p>
        </div>
      )}

      {/* Header Controls & Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border-2 border-slate-900 shadow-neo space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-xl border border-slate-900">
                <UserCheck className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Home Visitor Intake Pipeline</h2>
              <span className="bg-purple-600 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
                {applicants.length} Candidates
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Onboarding Registered Early Childhood Educators (RECE), verifying College of ECE standing, and training on Ministry quarterly inspection checklists.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewApplicantModalOpen(true)}
              className="px-4 py-2.5 bg-purple-600 text-white rounded-2xl border-2 border-slate-900 shadow-neo-sm hover:bg-purple-700 font-bold text-xs flex items-center gap-2 transition-all active:translate-x-0.5 active:translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Visitor Applicant</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="pt-2 border-t border-slate-100">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, RECE #, territory..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Kanban Board (4 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STAGE_CONFIG.map(({ stage, label, subtext, badgeColor }) => {
          const stageApplicants = filteredApplicants.filter(a => a.stage === stage);

          return (
            <div 
              key={stage}
              className="flex flex-col rounded-3xl border-2 border-slate-900 bg-slate-50/70 p-3 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-slate-200">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">{label}</h3>
                  <p className="text-[10px] text-slate-500 font-medium">{subtext}</p>
                </div>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full border border-slate-900/20 ${badgeColor}`}>
                  {stageApplicants.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageApplicants.length === 0 ? (
                  <div className="h-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                    <Clock className="w-5 h-5 text-slate-300 mb-1" />
                    <p className="text-[11px] text-slate-400 font-semibold">No candidates in this stage</p>
                  </div>
                ) : (
                  stageApplicants.map(app => {
                    return (
                      <div
                        key={app.id}
                        className="bg-white p-3.5 rounded-2xl border-2 border-slate-900 shadow-neo-sm hover:shadow-neo transition-all space-y-2.5"
                      >
                        {/* Candidate Name & RECE Badge */}
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <h4 className="text-xs font-black text-slate-900">{app.applicantName}</h4>
                            <span className="inline-block mt-0.5 bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-purple-200">
                              {app.receNumber}
                            </span>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                            {app.appliedDate}
                          </span>
                        </div>

                        {/* Assigned Territory & Good Standing */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            <span>{app.assignedRegion || 'Unassigned'}</span>
                          </span>

                          <span className={`px-2 py-0.5 rounded-lg border font-bold flex items-center gap-1 ${
                            app.receGoodStanding 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            <Award className="w-3 h-3" />
                            <span>{app.receGoodStanding ? 'College Verified' : 'Unverified'}</span>
                          </span>
                        </div>

                        {/* Compliance Status Block */}
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 space-y-1 text-[10px]">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600 font-medium">VSC Police Check:</span>
                            <span className={`font-bold ${app.vscCleared ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {app.vscCleared ? 'Cleared' : 'Pending'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-600 font-medium">Standard First Aid:</span>
                            <span className={`font-bold ${app.firstAidCertified ? 'text-emerald-600' : 'text-slate-500'}`}>
                              {app.firstAidCertified ? 'Active' : 'Pending'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-600 font-medium">Shadow Inspections:</span>
                            <span className={`font-bold ${app.shadowInspectionsCount >= 2 ? 'text-emerald-600' : 'text-purple-600'}`}>
                              {app.shadowInspectionsCount} / 2 Completed
                            </span>
                          </div>
                        </div>

                        {/* Notes Preview */}
                        <p className="text-[10px] text-slate-500 italic line-clamp-2">
                          "{app.notes}"
                        </p>

                        {/* Interactive Buttons */}
                        <div className="pt-1 flex flex-col gap-1.5">
                          {app.stage === 'screening' && (
                            <div className="flex items-center gap-1.5">
                              <a
                                href="https://www.college-ece.ca/find-an-ece/"
                                target="_blank"
                                rel="noreferrer"
                                className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-[10px] font-bold transition-all text-center flex items-center justify-center gap-1"
                              >
                                <span>Verify CECE</span>
                                <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                              </a>
                              <button
                                onClick={() => {
                                  onUpdateApplicantStage(app.id, 'vsc_credentials');
                                  showToast(`${app.applicantName} advanced to VSC & Credentials.`);
                                }}
                                className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                              >
                                <span>Advance</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {app.stage === 'vsc_credentials' && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => {
                                  onUpdateApplicantData(app.id, { 
                                    vscCleared: !app.vscCleared,
                                    firstAidCertified: true 
                                  });
                                  showToast(`Updated VSC status for ${app.applicantName}`);
                                }}
                                className="flex-1 py-1 px-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-[9px] font-bold text-center"
                              >
                                {app.vscCleared ? 'Mark VSC Pending' : 'Clear Police VSC'}
                              </button>
                              <button
                                onClick={() => {
                                  onUpdateApplicantStage(app.id, 'cceya_training');
                                  showToast(`${app.applicantName} advanced to CCEYA Checklist Training.`);
                                }}
                                disabled={!app.vscCleared}
                                className={`flex-1 py-1 px-2 rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 ${
                                  app.vscCleared 
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                <span>To Training</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}

                          {app.stage === 'cceya_training' && (
                            <div className="space-y-1">
                              <button
                                onClick={() => {
                                  const currentCount = app.shadowInspectionsCount;
                                  const newCount = Math.min(2, currentCount + 1);
                                  onUpdateApplicantData(app.id, {
                                    shadowInspectionsCount: newCount,
                                    cceyaChecklistTrainingComplete: newCount >= 2,
                                    stage: newCount >= 2 ? 'active' : 'cceya_training'
                                  });
                                  showToast(`Recorded shadow visit ${newCount}/2 for ${app.applicantName}`);
                                }}
                                className="w-full py-1.5 px-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
                              >
                                <BookOpen className="w-3 h-3" />
                                <span>Log Shadow Visit ({app.shadowInspectionsCount}/2)</span>
                              </button>
                            </div>
                          )}

                          {app.stage === 'active' && (
                            <button
                              onClick={() => {
                                onGraduateVisitor(app);
                                showToast(`🎉 ${app.applicantName} (${app.receNumber}) graduated to Active Home Visitor Roster!`);
                              }}
                              className="w-full py-2 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1.5 shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                              <span>Graduate to Active Visitor</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: New Home Visitor Registration */}
      {isNewApplicantModalOpen && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsNewApplicantModalOpen(false);
              }
            }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-3xl border-2 border-slate-900 shadow-neo p-6 space-y-4 max-h-[85vh] overflow-y-auto cursor-default"
          >
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900">
              <div>
                <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                  Staff Recruitment
                </span>
                <h3 className="text-lg font-black text-slate-900">New RECE Visitor Applicant</h3>
                <p className="text-xs text-slate-500">Register Registered Early Childhood Educator into pipeline</p>
              </div>
              <button
                onClick={() => setIsNewApplicantModalOpen(false)}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateApplicant} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Natasha Kowalski, RECE"
                  value={newDraftName}
                  onChange={e => setNewDraftName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">College of ECE Registration # *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RECE #79821"
                  value={newDraftRece}
                  onChange={e => setNewDraftRece(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none font-bold text-purple-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="natasha@example.com"
                    value={newDraftEmail}
                    onChange={e => setNewDraftEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="(905) 555-0144"
                    value={newDraftPhone}
                    onChange={e => setNewDraftPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Regional Territory</label>
                <select
                  value={newDraftRegion}
                  onChange={e => setNewDraftRegion(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:outline-none bg-white font-semibold"
                >
                  <option value="Durham South">Durham South (Oshawa, Whitby)</option>
                  <option value="Durham North">Durham North (Pickering, Ajax, Uxbridge)</option>
                  <option value="York/Toronto">York/Toronto (Markham, East York)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewApplicantModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 text-white rounded-xl text-xs font-black hover:bg-purple-700 shadow-neo-sm"
                >
                  Register Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      </ModalPortal>
      )}
    </div>
  );
};
