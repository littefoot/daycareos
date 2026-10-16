import React, { useState, useEffect } from 'react';
import { ModalPortal } from '../common/ModalPortal';
import { 
  Copy, 
  Check, 
  Search, 
  Filter, 
  ExternalLink, 
  UserCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Download, 
  Sparkles, 
  Eye, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText,
  Clock,
  ArrowRight,
  HeartPulse,
  Briefcase
} from 'lucide-react';
import { TEST_FAMILIES_ROSTER, TestFamilyProfile } from '../../data/testFamiliesData';

interface TestFamiliesSandboxProps {
  onSelectFamilyForTest?: (family: TestFamilyProfile) => void;
}

export const TestFamiliesSandbox: React.FC<TestFamiliesSandboxProps> = ({ onSelectFamilyForTest }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');
  const [selectedFunding, setSelectedFunding] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const [activeModalFamily, setActiveModalFamily] = useState<TestFamilyProfile | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModalFamily) {
        setActiveModalFamily(null);
      }
    };
    if (activeModalFamily) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalFamily]);

  // Copy helper with animated toast
  const copyToClipboard = (text: string, label: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setCopiedToast(`Copied ${label}: "${text}"`);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
    setTimeout(() => {
      setCopiedToast(null);
    }, 3000);
  };

  // Copy full family dossier
  const copyFullDossier = (fam: TestFamilyProfile) => {
    const text = `--- ACCS TEST FAMILY DOSSIER: ${fam.childName} ---
CHILD INFORMATION:
- Legal Name: ${fam.childName}
- Date of Birth: ${fam.dob} (${fam.ageFormatted}, ${fam.ageGroup})
- Gender: ${fam.gender}
- Ontario Health Card (OHIP): ${fam.ohip}
- Allergies: ${fam.allergies.join(', ')}
- EpiPen Required: ${fam.epiPenRequired ? 'YES' : 'NO'}
- Dietary Restrictions: ${fam.dietaryRestrictions.join(', ')}
- Medical Notes: ${fam.medicalNotes}

PARENT / GUARDIAN 1:
- Name: ${fam.parent1Name} (${fam.parent1Relationship})
- Cell Phone: ${fam.parent1Cell}
- Email: ${fam.parent1Email}
- Employer: ${fam.parent1Employer}

PARENT / GUARDIAN 2:
- Name: ${fam.parent2Name} (${fam.parent2Relationship})
- Cell Phone: ${fam.parent2Cell}

RESIDENCE:
- Address: ${fam.homeAddress}
- City: ${fam.city}, Ontario
- Postal Code: ${fam.postalCode}
- Region: ${fam.region}

CHILD CARE PROGRAM PREFERENCES:
- Funding: ${fam.fundingLabel}
- Monthly Rate: $${fam.monthlyFee.toFixed(2)} CAD/mo
- Days Requested: ${fam.scheduleDays.join(', ')}
- Hours of Care: ${fam.hoursOfCare}
- Evening Care Needed: ${fam.eveningCare ? 'YES' : 'NO'}
- Preferred Start Date: ${fam.preferredStartDate}

EMERGENCY & MEDICAL CONTACTS:
- Emergency Contact: ${fam.emergencyContactName} (${fam.emergencyRelationship}) - ${fam.emergencyContactPhone}
- Family Physician: ${fam.physicianName} - ${fam.physicianPhone}
- Clinic: ${fam.clinicAddress}
`;
    copyToClipboard(text, 'Full Family Dossier', `dossier-${fam.id}`);
  };

  // Copy Form 1 Specific Bundle
  const copyForm1Bundle = (fam: TestFamilyProfile) => {
    const text = `Child Name: ${fam.childName}
DOB: ${fam.dob}
OHIP: ${fam.ohip}
Parent: ${fam.parent1Name}
Phone: ${fam.parent1Cell}
Email: ${fam.parent1Email}
Address: ${fam.homeAddress}, ${fam.city}, ON ${fam.postalCode}
Emergency Contact: ${fam.emergencyContactName} (${fam.emergencyContactPhone})
Doctor: ${fam.physicianName} (${fam.physicianPhone})
Schedule: ${fam.scheduleDays.join(', ')} (${fam.hoursOfCare})`;
    copyToClipboard(text, 'Form 1 Bundle', `f1-${fam.id}`);
  };

  // Filtered families
  const filteredFamilies = TEST_FAMILIES_ROSTER.filter(fam => {
    const matchesSearch = 
      fam.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fam.parent1Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fam.parent1Email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fam.parent1Cell.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fam.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fam.ohip.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion = selectedRegion === 'all' || fam.region === selectedRegion;
    const matchesAge = selectedAgeGroup === 'all' || fam.ageGroup === selectedAgeGroup;
    const matchesFunding = selectedFunding === 'all' || fam.fundingType === selectedFunding;

    return matchesSearch && matchesRegion && matchesAge && matchesFunding;
  });

  // Export CSV
  const exportCSV = () => {
    const headers = [
      'Child Name', 'DOB', 'Age', 'Group', 'OHIP', 'Parent 1 Name', 'Phone', 'Email', 
      'Address', 'City', 'Postal Code', 'Region', 'Funding', 'Monthly Fee', 'Days', 'Hours', 'Allergies', 'EpiPen'
    ];
    const rows = filteredFamilies.map(f => [
      `"${f.childName}"`, f.dob, `"${f.ageFormatted}"`, f.ageGroup, f.ohip,
      `"${f.parent1Name}"`, `"${f.parent1Cell}"`, `"${f.parent1Email}"`,
      `"${f.homeAddress}"`, `"${f.city}"`, f.postalCode, `"${f.region}"`,
      `"${f.fundingLabel}"`, f.monthlyFee, `"${f.scheduleDays.join(', ')}"`,
      `"${f.hoursOfCare}"`, `"${f.allergies.join(', ')}"`, f.epiPenRequired ? 'YES' : 'NO'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `accs_test_families_24_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl border-2 border-emerald-400 shadow-neo flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="w-7 h-7 bg-emerald-500 rounded-xl flex items-center justify-center text-slate-950 font-black shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-400 block">Copied to Clipboard!</span>
            <span className="text-xs text-slate-200 font-medium">{copiedToast}</span>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="neo-card bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-neo">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/10 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center border-2 border-slate-900 shadow-neo-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-wider bg-slate-900 text-amber-300 px-3 py-1 rounded-full inline-block mb-1 border border-slate-900">
                  Parent Intake Testing Sandbox
                </span>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950">
                  24 Realistic Ontario Test Families & Children
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportCSV}
                className="neo-btn bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-extrabold gap-2 shadow-neo-sm"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Export 24 Profiles (CSV)</span>
              </button>
            </div>
          </div>

          <p className="text-sm font-medium text-slate-900 max-w-3xl leading-relaxed">
            Click any cell or data point below to instantly copy it to your clipboard for rapid pasting into Parent Portal intake forms (Form 0 through Form 5), or click <strong>"Test Live Intake"</strong> on any family to launch the full parent journey pre-filled.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border-2 border-slate-900 shadow-neo-sm">
              <span className="text-[10px] font-extrabold uppercase text-slate-600 block">Total Profiles</span>
              <span className="text-xl font-black text-slate-900">24 Ready</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border-2 border-slate-900 shadow-neo-sm">
              <span className="text-[10px] font-extrabold uppercase text-slate-600 block">Durham Region</span>
              <span className="text-xl font-black text-slate-900">15 Oshawa/Whitby/Ajax</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border-2 border-slate-900 shadow-neo-sm">
              <span className="text-[10px] font-extrabold uppercase text-slate-600 block">York & Toronto</span>
              <span className="text-xl font-black text-slate-900">9 Markham/Scarb</span>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-3 rounded-2xl border-2 border-slate-900 shadow-neo-sm">
              <span className="text-[10px] font-extrabold uppercase text-slate-600 block">Funding Varieties</span>
              <span className="text-xl font-black text-slate-900">CWELCC $10 & Subsidy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="neo-card bg-white p-4 rounded-2xl shadow-neo border-2 border-slate-900 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by child, parent, email, city, OHIP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-bold rounded-xl bg-slate-50 border-2 border-slate-900 focus:ring-2 focus:ring-orange-500"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Region Filter */}
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 border-2 border-slate-900 focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Regions ({TEST_FAMILIES_ROSTER.length})</option>
            <option value="Durham Region">Durham Region</option>
            <option value="York Region">York Region</option>
            <option value="Toronto">Toronto</option>
          </select>

          {/* Age Group Filter */}
          <select
            value={selectedAgeGroup}
            onChange={(e) => setSelectedAgeGroup(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 border-2 border-slate-900 focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Ages</option>
            <option value="Infant">Infants (&lt;18 mos)</option>
            <option value="Toddler">Toddlers (18–30 mos)</option>
            <option value="Preschool">Preschool (30+ mos)</option>
          </select>

          {/* Funding Filter */}
          <select
            value={selectedFunding}
            onChange={(e) => setSelectedFunding(e.target.value)}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-slate-50 border-2 border-slate-900 focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Funding</option>
            <option value="cwelcc">CWELCC $10/Day</option>
            <option value="subsidy">Municipal Subsidy</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-300 ml-auto md:ml-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'table' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'cards' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Card View
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
        <span>Showing {filteredFamilies.length} of {TEST_FAMILIES_ROSTER.length} Test Profiles</span>
        <span className="text-orange-600">💡 Click any cell with a 📋 icon to copy immediately</span>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="neo-card bg-white rounded-2xl shadow-neo border-2 border-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-extrabold uppercase tracking-wider text-[11px] border-b-2 border-slate-900">
                  <th className="p-3.5">#</th>
                  <th className="p-3.5">Child & Photo</th>
                  <th className="p-3.5">DOB & Age</th>
                  <th className="p-3.5">Ontario Health #</th>
                  <th className="p-3.5">Parent / Contact</th>
                  <th className="p-3.5">Address & City</th>
                  <th className="p-3.5">Funding & Rate</th>
                  <th className="p-3.5">Care Schedule</th>
                  <th className="p-3.5">Medical / Allergies</th>
                  <th className="p-3.5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                {filteredFamilies.map((fam, idx) => {
                  const isCopiedOHIP = copiedKey === `ohip-${fam.id}`;
                  const isCopiedPhone = copiedKey === `phone-${fam.id}`;
                  const isCopiedEmail = copiedKey === `email-${fam.id}`;
                  const isCopiedName = copiedKey === `name-${fam.id}`;
                  const isCopiedAddress = copiedKey === `addr-${fam.id}`;
                  const isCopiedDOB = copiedKey === `dob-${fam.id}`;

                  return (
                    <tr 
                      key={fam.id} 
                      className="hover:bg-amber-50/50 transition-colors group"
                    >
                      {/* Row Number */}
                      <td className="p-3.5 text-slate-400 font-bold text-[10px]">
                        {idx + 1}
                      </td>

                      {/* Child Profile & Photo */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative group/avatar cursor-pointer" onClick={() => setActiveModalFamily(fam)}>
                            <img
                              src={fam.photoUrl}
                              alt={fam.childName}
                              className="w-11 h-11 rounded-xl object-cover border-2 border-slate-900 shadow-neo-sm"
                            />
                            <div className="absolute inset-0 bg-slate-900/60 rounded-xl flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                              <Eye className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <div>
                            <button
                              onClick={() => copyToClipboard(fam.childName, 'Child Legal Name', `name-${fam.id}`)}
                              className="font-extrabold text-slate-900 hover:text-orange-600 flex items-center gap-1.5 text-left group/btn"
                              title="Click to copy name"
                            >
                              <span>{fam.childName}</span>
                              {isCopiedName ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-300 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                              )}
                            </button>
                            <span className="text-[10px] text-slate-500 font-semibold block">
                              {fam.gender} • {fam.ageGroup}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* DOB & Age */}
                      <td className="p-3.5">
                        <button
                          onClick={() => copyToClipboard(fam.dob, 'Date of Birth', `dob-${fam.id}`)}
                          className="font-mono text-slate-800 hover:text-orange-600 flex items-center gap-1 group/btn"
                          title="Click to copy DOB (YYYY-MM-DD)"
                        >
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-bold">{fam.dob}</span>
                          {isCopiedDOB ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-slate-300 opacity-0 group-hover/btn:opacity-100" />
                          )}
                        </button>
                        <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                          {fam.ageFormatted}
                        </span>
                      </td>

                      {/* OHIP Card */}
                      <td className="p-3.5">
                        <button
                          onClick={() => copyToClipboard(fam.ohip, 'Ontario Health Card (OHIP)', `ohip-${fam.id}`)}
                          className="px-2 py-1 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg font-mono font-bold text-[11px] hover:bg-emerald-100 flex items-center gap-1.5 group/btn transition-colors"
                          title="Click to copy OHIP Number"
                        >
                          <span>{fam.ohip}</span>
                          {isCopiedOHIP ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-emerald-500 opacity-0 group-hover/btn:opacity-100" />
                          )}
                        </button>
                      </td>

                      {/* Parent & Contact */}
                      <td className="p-3.5 space-y-1">
                        <span className="font-bold text-slate-900 block text-xs">
                          {fam.parent1Name} <span className="text-slate-400 font-normal">({fam.parent1Relationship})</span>
                        </span>
                        
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => copyToClipboard(fam.parent1Cell, 'Parent Phone', `phone-${fam.id}`)}
                            className="text-[11px] text-slate-600 hover:text-orange-600 flex items-center gap-1 group/btn font-mono"
                            title="Click to copy Phone"
                          >
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{fam.parent1Cell}</span>
                            {isCopiedPhone ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-slate-300 opacity-0 group-hover/btn:opacity-100" />
                            )}
                          </button>

                          <button
                            onClick={() => copyToClipboard(fam.parent1Email, 'Parent Email', `email-${fam.id}`)}
                            className="text-[11px] text-slate-600 hover:text-orange-600 flex items-center gap-1 group/btn font-mono"
                            title="Click to copy Email"
                          >
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[140px]">{fam.parent1Email}</span>
                            {isCopiedEmail ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-slate-300 opacity-0 group-hover/btn:opacity-100" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Address & City */}
                      <td className="p-3.5">
                        <button
                          onClick={() => copyToClipboard(`${fam.homeAddress}, ${fam.city}, ON ${fam.postalCode}`, 'Full Address', `addr-${fam.id}`)}
                          className="hover:text-orange-600 text-left group/btn block"
                          title="Click to copy full street address"
                        >
                          <span className="font-bold text-slate-800 block">{fam.homeAddress}</span>
                          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{fam.city}, {fam.postalCode}</span>
                            {isCopiedAddress ? (
                              <Check className="w-3 h-3 text-emerald-600 ml-1" />
                            ) : (
                              <Copy className="w-2.5 h-2.5 text-slate-300 opacity-0 group-hover/btn:opacity-100 ml-1" />
                            )}
                          </span>
                        </button>
                      </td>

                      {/* Funding & Rate */}
                      <td className="p-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border ${
                          fam.fundingType === 'cwelcc'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-purple-100 text-purple-900 border-purple-300'
                        }`}>
                          {fam.fundingType === 'cwelcc' ? 'CWELCC $10/Day' : 'Subsidy'}
                        </span>
                        <span className="text-xs font-black text-slate-900 block mt-1">
                          {fam.monthlyFee === 0 ? '$0.00 (Subsidized)' : `$${fam.monthlyFee.toFixed(2)}/mo`}
                        </span>
                      </td>

                      {/* Care Schedule */}
                      <td className="p-3.5 space-y-0.5">
                        <span className="font-bold text-slate-800 block text-xs">
                          {fam.scheduleFormatted}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{fam.hoursOfCare}</span>
                        </span>
                        {fam.eveningCare && (
                          <span className="text-[9px] bg-amber-200 text-amber-900 font-extrabold px-1.5 py-0.5 rounded inline-block">
                            Evening Needed
                          </span>
                        )}
                      </td>

                      {/* Medical / Allergies */}
                      <td className="p-3.5">
                        {fam.epiPenRequired ? (
                          <div className="flex items-center gap-1.5 bg-rose-50 text-rose-800 border border-rose-300 px-2 py-1 rounded-lg">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <div className="text-[10px] font-extrabold">
                              <span>Epi-Pen Alert</span>
                              <span className="block text-[9px] font-semibold text-rose-700 truncate max-w-[110px]">
                                {fam.allergies[0]}
                              </span>
                            </div>
                          </div>
                        ) : fam.allergies[0].startsWith('None') ? (
                          <span className="text-[11px] text-slate-400 font-medium">None</span>
                        ) : (
                          <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded font-bold block truncate max-w-[120px]">
                            {fam.allergies[0]}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => copyForm1Bundle(fam)}
                            className="neo-btn bg-white hover:bg-slate-100 text-slate-800 text-[10px] px-2.5 py-1.5 font-extrabold rounded-xl border border-slate-300 shadow-sm"
                            title="Copy formatted key-values for Form 1"
                          >
                            <Copy className="w-3 h-3 text-slate-500" />
                            <span>Copy Form 1</span>
                          </button>

                          <button
                            onClick={() => setActiveModalFamily(fam)}
                            className="neo-btn bg-slate-900 hover:bg-slate-800 text-white text-[10px] px-2.5 py-1.5 font-extrabold rounded-xl shadow-neo-sm"
                            title="View Full Profile Dossier"
                          >
                            <Eye className="w-3 h-3 text-amber-400" />
                            <span>Dossier</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFamilies.map((fam) => {
            const isCopiedOHIP = copiedKey === `ohip-${fam.id}`;
            const isCopiedPhone = copiedKey === `phone-${fam.id}`;
            const isCopiedEmail = copiedKey === `email-${fam.id}`;

            return (
              <div 
                key={fam.id} 
                className="neo-card bg-white p-5 rounded-3xl border-2 border-slate-900 shadow-neo flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-transform"
              >
                <div className="space-y-3">
                  {/* Top Header Card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={fam.photoUrl}
                        alt={fam.childName}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-900 shadow-neo-sm shrink-0"
                      />
                      <div>
                        <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider">
                          {fam.region}
                        </span>
                        <h3 className="text-base font-black text-slate-900 leading-tight">
                          {fam.childName}
                        </h3>
                        <span className="text-xs text-slate-500 font-bold">
                          {fam.dob} ({fam.ageFormatted})
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-1 rounded-lg text-[10px] font-extrabold border shrink-0 ${
                      fam.fundingType === 'cwelcc'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-purple-100 text-purple-900 border-purple-300'
                    }`}>
                      {fam.fundingType === 'cwelcc' ? 'CWELCC $10' : 'Subsidy'}
                    </span>
                  </div>

                  {/* OHIP Card Badge */}
                  <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-300">
                    <span className="text-[11px] font-bold text-slate-600">Ontario Health #</span>
                    <button
                      onClick={() => copyToClipboard(fam.ohip, 'OHIP', `ohip-${fam.id}`)}
                      className="font-mono font-extrabold text-xs text-emerald-800 hover:text-emerald-600 flex items-center gap-1"
                    >
                      <span>{fam.ohip}</span>
                      {isCopiedOHIP ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    </button>
                  </div>

                  {/* Parent Info Grid */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-bold text-slate-900">{fam.parent1Name} ({fam.parent1Relationship})</span>
                      <span className="text-[11px] text-slate-500">{fam.city}</span>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200 font-mono text-[11px]">
                      <button
                        onClick={() => copyToClipboard(fam.parent1Cell, 'Phone', `phone-${fam.id}`)}
                        className="flex items-center gap-1 text-slate-700 hover:text-orange-600"
                      >
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{fam.parent1Cell}</span>
                        {isCopiedPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-2.5 h-2.5 text-slate-400" />}
                      </button>

                      <button
                        onClick={() => copyToClipboard(fam.parent1Email, 'Email', `email-${fam.id}`)}
                        className="flex items-center gap-1 text-slate-700 hover:text-orange-600 max-w-[130px] truncate"
                      >
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{fam.parent1Email}</span>
                        {isCopiedEmail ? <Check className="w-3 h-3 text-emerald-600 shrink-0" /> : <Copy className="w-2.5 h-2.5 text-slate-400 shrink-0" />}
                      </button>
                    </div>
                  </div>

                  {/* Care Schedule & Allergies */}
                  <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{fam.scheduleFormatted}</span>
                      <span className="font-mono text-[11px] text-slate-600">{fam.hoursOfCare}</span>
                    </div>
                    {fam.epiPenRequired && (
                      <span className="text-[10px] text-rose-700 font-extrabold flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                        <span>EpiPen: {fam.allergies.join(', ')}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => copyForm1Bundle(fam)}
                    className="flex-1 neo-btn bg-white hover:bg-slate-50 text-slate-800 py-2 px-3 text-xs font-bold rounded-xl border border-slate-300 shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Form 1</span>
                  </button>

                  <button
                    onClick={() => setActiveModalFamily(fam)}
                    className="neo-btn bg-slate-900 hover:bg-slate-800 text-white py-2 px-3 text-xs font-bold rounded-xl shadow-neo-sm flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dossier</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Active Family Dossier Modal */}
      {activeModalFamily && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setActiveModalFamily(null);
              }
            }}
            className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto cursor-pointer"
          >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-3 border-slate-900 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-neo relative animate-in fade-in zoom-in-95 space-y-6 my-8 max-h-[90vh] overflow-y-auto cursor-default"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b-2 border-slate-100">
              <div className="flex items-center gap-4">
                <img
                  src={activeModalFamily.photoUrl}
                  alt={activeModalFamily.childName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-900 shadow-neo"
                />
                <div>
                  <span className="text-xs font-black uppercase text-orange-600 tracking-wider">
                    {activeModalFamily.region} • {activeModalFamily.ageGroup}
                  </span>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900">
                    {activeModalFamily.childName}
                  </h2>
                  <span className="text-xs text-slate-500 font-bold">
                    DOB: {activeModalFamily.dob} ({activeModalFamily.ageFormatted})
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveModalFamily(null)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center border border-slate-300 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Copy Action Bar */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-amber-50 rounded-2xl border border-amber-200">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5 mr-2">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>Bulk Copy:</span>
              </span>
              <button
                onClick={() => copyFullDossier(activeModalFamily)}
                className="neo-btn bg-slate-900 text-white text-xs px-3 py-1.5 font-bold shadow-sm flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>Copy Full Dossier</span>
              </button>
              <button
                onClick={() => copyForm1Bundle(activeModalFamily)}
                className="neo-btn bg-white text-slate-800 text-xs px-3 py-1.5 font-bold border border-slate-300 shadow-sm flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-slate-600" />
                <span>Copy Form 1 Bundle</span>
              </button>
            </div>

            {/* Structured Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Child & Medical Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-900 space-y-2">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-orange-600" />
                  <span>Child & Medical Profile</span>
                </h4>
                
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Legal Name:</span>
                    <button 
                      onClick={() => copyToClipboard(activeModalFamily.childName, 'Child Name', 'modal-name')}
                      className="font-bold text-slate-900 hover:text-orange-600"
                    >
                      {activeModalFamily.childName} 📋
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">OHIP Health Card:</span>
                    <button 
                      onClick={() => copyToClipboard(activeModalFamily.ohip, 'OHIP', 'modal-ohip')}
                      className="font-mono font-bold text-emerald-800 hover:text-emerald-600"
                    >
                      {activeModalFamily.ohip} 📋
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Allergies:</span>
                    <span className="font-bold text-slate-900">{activeModalFamily.allergies.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">EpiPen Status:</span>
                    <span className={`font-bold ${activeModalFamily.epiPenRequired ? 'text-rose-600' : 'text-slate-700'}`}>
                      {activeModalFamily.epiPenRequired ? 'YES (Carried in Bag)' : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dietary:</span>
                    <span className="font-bold text-slate-900">{activeModalFamily.dietaryRestrictions.join(', ')}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200 mt-2">
                    "{activeModalFamily.medicalNotes}"
                  </p>
                </div>
              </div>

              {/* Parents & Household Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-900 space-y-2">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-orange-600" />
                  <span>Parents & Residence</span>
                </h4>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Parent 1:</span>
                    <button 
                      onClick={() => copyToClipboard(activeModalFamily.parent1Name, 'Parent 1 Name', 'modal-p1')}
                      className="font-bold text-slate-900 hover:text-orange-600"
                    >
                      {activeModalFamily.parent1Name} 📋
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Phone:</span>
                    <button 
                      onClick={() => copyToClipboard(activeModalFamily.parent1Cell, 'Phone', 'modal-phone')}
                      className="font-mono font-bold text-slate-900 hover:text-orange-600"
                    >
                      {activeModalFamily.parent1Cell} 📋
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Email:</span>
                    <button 
                      onClick={() => copyToClipboard(activeModalFamily.parent1Email, 'Email', 'modal-email')}
                      className="font-mono font-bold text-slate-900 hover:text-orange-600 truncate max-w-[160px]"
                    >
                      {activeModalFamily.parent1Email} 📋
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Employer:</span>
                    <span className="font-medium text-slate-700">{activeModalFamily.parent1Employer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Parent 2:</span>
                    <span className="font-medium text-slate-700">{activeModalFamily.parent2Name} ({activeModalFamily.parent2Cell})</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Street Address:</span>
                    <button 
                      onClick={() => copyToClipboard(`${activeModalFamily.homeAddress}, ${activeModalFamily.city}, ON ${activeModalFamily.postalCode}`, 'Full Address', 'modal-addr')}
                      className="font-bold text-slate-900 hover:text-orange-600 text-right"
                    >
                      {activeModalFamily.homeAddress}, {activeModalFamily.city} 📋
                    </button>
                  </div>
                </div>
              </div>

              {/* Care Schedule & Funding */}
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-900 space-y-2">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>Program & Fee Schedule</span>
                </h4>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Funding Model:</span>
                    <span className="font-extrabold text-emerald-800">{activeModalFamily.fundingLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly Parent Fee:</span>
                    <span className="font-black text-slate-900">${activeModalFamily.monthlyFee.toFixed(2)} CAD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Operating Days:</span>
                    <span className="font-bold text-slate-800">{activeModalFamily.scheduleDays.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hours Requested:</span>
                    <span className="font-mono font-bold text-slate-800">{activeModalFamily.hoursOfCare}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Target Start Date:</span>
                    <span className="font-bold text-orange-600">{activeModalFamily.preferredStartDate}</span>
                  </div>
                </div>
              </div>

              {/* Emergency & Doctor */}
              <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-900 space-y-2">
                <h4 className="font-black text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-orange-600" />
                  <span>Emergency & Physician</span>
                </h4>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Emergency Contact:</span>
                    <span className="font-bold text-slate-900">{activeModalFamily.emergencyContactName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Emergency Phone:</span>
                    <button 
                      onClick={() => copyToClipboard(activeModalFamily.emergencyContactPhone, 'Emergency Phone', 'modal-em-phone')}
                      className="font-mono font-bold text-slate-900 hover:text-orange-600"
                    >
                      {activeModalFamily.emergencyContactPhone} 📋
                    </button>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Family Physician:</span>
                    <span className="font-bold text-slate-900">{activeModalFamily.physicianName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Doctor Phone:</span>
                    <button 
                      onClick={() => copyToClipboard(activeModalFamily.physicianPhone, 'Physician Phone', 'modal-doc-phone')}
                      className="font-mono font-bold text-slate-900 hover:text-orange-600"
                    >
                      {activeModalFamily.physicianPhone} 📋
                    </button>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Clinic:</span>
                    <span className="text-slate-700 text-right truncate max-w-[170px]">{activeModalFamily.clinicAddress}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Modal Actions */}
            <div className="pt-4 border-t-2 border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-bold">Profile ID: {activeModalFamily.id}</span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModalFamily(null)}
                  className="neo-btn bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 text-xs font-bold border border-slate-300 rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </ModalPortal>
      )}
    </div>
  );
};
