import React, { useState, useEffect, useRef } from 'react';
import { AccsLogo } from './AccsLogo';
import { UserRole } from '../types';
import { 
  ShieldCheck, 
  Home, 
  Users,
  ClipboardCheck,
  Sparkles,
  Maximize,
  Minimize,
  LogOut,
  ChevronDown,
  Check,
  ExternalLink,
  Copy,
  Share2,
  Bot
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onNavigateHome?: () => void;
  activeBrand?: string;
  onBrandChange?: (brand: string) => void;
  alertCount?: number;
  onOpenBinder?: () => void;
  onOpenPdfSigner?: () => void;
  isParentPortalMode?: boolean;
  isAdminAuthenticated?: boolean;
  onLogoutAdmin?: () => void;
  isAiOpen?: boolean;
  onToggleAi?: () => void;
}

interface RoleOption {
  role: UserRole;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'admin',
    title: 'Admin Command Centre',
    subtitle: 'Full admissions CRM, CCEYA ratios & daily queue',
    icon: ShieldCheck,
    iconColor: 'text-orange-600',
    iconBg: 'bg-orange-100',
  },
  {
    role: 'visitor',
    title: 'Home Visitor Portal',
    subtitle: 'CCEYA s. 26 inspections & RECE caseloads',
    icon: ClipboardCheck,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
  },
  {
    role: 'provider',
    title: 'Licensed Provider Hub',
    subtitle: '1-tap attendance, Sabrina\'s Law & timesheets',
    icon: Home,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
  },
  {
    role: 'parent',
    title: 'Parent Registration & Care Portal',
    subtitle: '5-step onboarding, health cards & fee statements',
    icon: Users,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
  },
];

const REGISTER_ROLE_OPTION: RoleOption = {
  role: 'register',
  title: 'Public Admissions Inquiry (PAR-0)',
  subtitle: 'Dedicated intake pre-screening application page',
  icon: Sparkles,
  iconColor: 'text-amber-600',
  iconBg: 'bg-amber-100',
};

export interface QuickPortalLink {
  id: string;
  role: UserRole;
  title: string;
  shortTitle: string;
  code: string;
  path: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  bgHover: string;
  badgeBg: string;
}

export const QUICK_PORTAL_LINKS: QuickPortalLink[] = [
  {
    id: 'parent-inquiry',
    role: 'register',
    title: 'Parent Registration & Inquiry Form (PAR-0)',
    shortTitle: 'Parent Intake',
    code: 'PAR-0',
    path: '/?role=register',
    description: 'Public pre-screening intake form for prospective parents',
    icon: Sparkles,
    iconColor: 'text-amber-600',
    bgHover: 'hover:bg-amber-50',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    id: 'provider-apply',
    role: 'apply-provider',
    title: 'Provider Facility Registration Form (PROV-0)',
    shortTitle: 'Provider Application',
    code: 'PROV-0',
    path: '/?role=apply-provider',
    description: 'Public home facility registration & CCEYA screening form for prospective providers',
    icon: Home,
    iconColor: 'text-purple-600',
    bgHover: 'hover:bg-purple-50',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
  },
  {
    id: 'visitor-apply',
    role: 'apply-visitor',
    title: 'RECE Home Visitor Application Form (VIS-0)',
    shortTitle: 'Home Visitor Application',
    code: 'VIS-0',
    path: '/?role=apply-visitor',
    description: 'Public employment application for certified RECE home child care visitors',
    icon: ClipboardCheck,
    iconColor: 'text-blue-600',
    bgHover: 'hover:bg-blue-50',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
  },
];

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onNavigateHome,
  alertCount = 0,
  isParentPortalMode = false,
  isAdminAuthenticated = false,
  onLogoutAdmin,
  isAiOpen = false,
  onToggleAi
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen toggle failed:', err);
    }
  };

  const [copiedPortalId, setCopiedPortalId] = useState<string | null>(null);
  const [isMobileShareOpen, setIsMobileShareOpen] = useState(false);
  const mobileShareRef = useRef<HTMLDivElement>(null);

  // Close mobile share menu on click outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (mobileShareRef.current && !mobileShareRef.current.contains(e.target as Node)) {
        setIsMobileShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleCopyPortalUrl = (portal: QuickPortalLink, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const fullUrl = `${window.location.origin}${portal.path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedPortalId(portal.id);
    setTimeout(() => {
      setCopiedPortalId(null);
    }, 2500);
  };

  const activeRoleOption = ROLE_OPTIONS.find(opt => opt.role === currentRole) || (currentRole === 'register' ? REGISTER_ROLE_OPTION : ROLE_OPTIONS[0]);
  const ActiveIcon = activeRoleOption.icon;

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-slate-900 shadow-sm h-16 print:hidden no-print">
      {/* Main Header Navigation Bar */}
      <div className="w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left Side: Brand Logo + View As Role Switcher */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <AccsLogo 
            size="md" 
            onClick={() => {
              if (onNavigateHome) {
                onNavigateHome();
              } else {
                onRoleChange('admin');
              }
            }} 
          />

          {/* Custom Neo-Brutalist View As Role Selector Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border-2 border-slate-900 px-3 py-1.5 rounded-2xl shadow-neo-sm hover:shadow-neo transition-all cursor-pointer text-left select-none"
              aria-expanded={isDropdownOpen}
              aria-haspopup="listbox"
            >
              <div className="flex items-center gap-1.5">
                <span className={`p-1 rounded-lg border border-slate-900/10 shadow-xs ${activeRoleOption.iconBg}`}>
                  <ActiveIcon className={`w-3.5 h-3.5 ${activeRoleOption.iconColor}`} />
                </span>
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider hidden sm:inline">
                  View as:
                </span>
                <span className="text-xs font-black text-slate-900">
                  {activeRoleOption.title}
                </span>
              </div>

              {currentRole === 'admin' && alertCount > 0 && (
                <span className="bg-[#ff6900] text-white text-[10px] px-2 py-0.5 rounded-full font-black ml-1 hidden md:inline">
                  {alertCount} Alerts
                </span>
              )}

              <ChevronDown 
                className={`w-3.5 h-3.5 text-slate-700 transition-transform duration-200 ml-0.5 ${
                  isDropdownOpen ? 'rotate-180 text-[#ff6900]' : ''
                }`} 
              />
            </button>

            {/* Neo-Brutalist Dropdown Popover */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-white border-2 border-slate-900 rounded-3xl shadow-neo p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between mb-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    Switch User Portal View
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    {ROLE_OPTIONS.length} Portals
                  </span>
                </div>

                <div className="space-y-1" role="listbox">
                  {ROLE_OPTIONS.map((option) => {
                    const isSelected = currentRole === option.role;
                    const IconComponent = option.icon;

                    return (
                      <button
                        key={option.role}
                        type="button"
                        onClick={() => {
                          onRoleChange(option.role);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-2xl border-2 transition-all text-left cursor-pointer group ${
                          isSelected
                            ? 'bg-amber-50/90 border-slate-900 shadow-neo-sm'
                            : 'border-transparent hover:border-slate-900 hover:bg-slate-50'
                        }`}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl border-2 border-slate-900 flex items-center justify-center shrink-0 shadow-xs ${option.iconBg}`}>
                            <IconComponent className={`w-4 h-4 ${option.iconColor}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-black text-xs text-slate-900 leading-tight">
                                {option.title}
                              </p>
                              {option.role === 'admin' && alertCount > 0 && (
                                <span className="text-[9px] font-black bg-[#ff6900] text-white px-1.5 py-0.2 rounded-full">
                                  {alertCount}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                              {option.subtitle}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-black border border-slate-900 shrink-0 ml-2">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: 3 Quick Share & Open New Tab Portals (Public Admissions Inquiry, Provider Hub, Home Visitor) */}
        {currentRole === 'admin' && (
          <>
            {/* Desktop & Laptop View (lg and above): 3 Split Action Pills */}
            <div className="hidden lg:flex items-center gap-2">
              {QUICK_PORTAL_LINKS.map(portal => {
                const Icon = portal.icon;
                const isCopied = copiedPortalId === portal.id;
                const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${portal.path}` : portal.path;

                return (
                  <div
                    key={portal.id}
                    className="inline-flex items-center bg-white border-2 border-slate-900 rounded-2xl shadow-neo-sm hover:shadow-neo transition-all divide-x-2 divide-slate-900 text-xs font-bold overflow-hidden"
                  >
                    <a
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 text-slate-900 ${portal.bgHover} transition-colors cursor-pointer group`}
                      title={`Open ${portal.title} in a new tab (${portal.description})`}
                    >
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${portal.iconColor}`} />
                      <span className="font-extrabold text-[11px] text-slate-900 whitespace-nowrap">{portal.shortTitle}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border uppercase ${portal.badgeBg}`}>
                        {portal.code}
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all ml-0.5 shrink-0" />
                    </a>

                    <button
                      type="button"
                      onClick={(e) => handleCopyPortalUrl(portal, e)}
                      className={`px-2 py-1.5 transition-colors cursor-pointer flex items-center justify-center ${
                        isCopied ? 'bg-emerald-500 text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                      title={isCopied ? 'Copied to clipboard!' : `Copy ${portal.title} link to clipboard for email or messaging`}
                      aria-label={`Copy link for ${portal.title}`}
                    >
                      {isCopied ? (
                        <span className="flex items-center gap-0.5 text-[10px] font-black text-white px-0.5 animate-in fade-in">
                          <Check className="w-3 h-3 text-white" />
                          <span>Copied</span>
                        </span>
                      ) : (
                        <Copy className="w-3 h-3 text-slate-600 hover:text-slate-900" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Mobile & Small Tablet View (< lg): Compact Quick-Share Popover */}
            <div ref={mobileShareRef} className="relative flex lg:hidden items-center">
              <button
                type="button"
                onClick={() => setIsMobileShareOpen(!isMobileShareOpen)}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border-2 border-slate-900 px-2.5 py-1.5 rounded-2xl shadow-neo-sm hover:shadow-neo text-xs font-black text-slate-900 cursor-pointer"
                title="Open or Copy Public Portals (Parents, Providers, Home Visitors)"
              >
                <Share2 className="w-3.5 h-3.5 text-orange-600" />
                <span className="hidden sm:inline">Portals</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </button>

              {isMobileShareOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white border-2 border-slate-900 rounded-3xl shadow-neo p-2.5 z-50 animate-in fade-in">
                  <div className="px-2 py-1 border-b border-slate-100 mb-2">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Open in New Tab or Copy Link
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    {QUICK_PORTAL_LINKS.map(portal => {
                      const Icon = portal.icon;
                      const isCopied = copiedPortalId === portal.id;
                      const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${portal.path}` : portal.path;

                      return (
                        <div
                          key={portal.id}
                          className="flex items-center justify-between p-2 rounded-2xl border border-slate-200 hover:border-slate-900 bg-slate-50 transition-all text-xs"
                        >
                          <a
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 font-extrabold text-slate-900 flex-1 hover:text-orange-600 truncate"
                            title={`Open ${portal.title} in a new tab`}
                          >
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${portal.iconColor}`} />
                            <span className="truncate">{portal.shortTitle}</span>
                            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                          </a>

                          <button
                            type="button"
                            onClick={(e) => handleCopyPortalUrl(portal, e)}
                            className={`neo-btn text-[10px] px-2 py-1 font-bold shrink-0 ml-2 ${
                              isCopied ? 'bg-emerald-500 text-white' : 'bg-white hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isCopied ? '✓ Copied' : 'Copy'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Right Side: Fullscreen Button + User Profile Avatar + Logout */}
        <div className="flex items-center gap-2.5 shrink-0">

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="neo-btn bg-white hover:bg-slate-50 text-slate-800 p-2 text-xs font-bold gap-1 shadow-neo-sm cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen Mode' : 'Enter Fullscreen Mode'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 text-slate-800" />
            ) : (
              <Maximize className="w-4 h-4 text-slate-800" />
            )}
          </button>

          {/* Profile Avatar on the Far Right (Role-Specific) */}
          {currentRole === 'admin' ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white border-2 border-slate-900 flex items-center justify-center font-black text-xs shadow-neo-sm shrink-0">
                AD
              </div>
              <div className="text-left hidden sm:block">
                <p className="font-extrabold text-slate-900 text-xs leading-tight">Agency Director</p>
                <p className="text-[10px] text-slate-500 font-bold">Executive Office</p>
              </div>
            </div>
          ) : currentRole === 'parent' ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white border-2 border-slate-900 flex items-center justify-center font-black text-xs shadow-neo-sm shrink-0">
                PAR
              </div>
              <div className="text-left hidden sm:block">
                <p className="font-extrabold text-slate-900 text-xs leading-tight">Parent Portal</p>
                <p className="text-[10px] text-slate-500 font-bold">Enrolled Family</p>
              </div>
            </div>
          ) : null}

          {/* Admin Logout / Lock Staff Access Button */}
          {isAdminAuthenticated && onLogoutAdmin && (
            <button
              onClick={onLogoutAdmin}
              className="p-2 rounded-xl border-2 border-slate-900 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 transition-colors shadow-neo-sm cursor-pointer ml-1"
              title="Lock Staff Access / Log Out"
              aria-label="Log Out Staff"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
