import { 
  Provider, 
  HomeVisitor, 
  Child, 
  ParentGuardian, 
  DailyActionAlert,
  AttendanceEntry
} from '../types';

/**
 * Returns today's actual system date formatted as YYYY-MM-DD.
 */
export function getSystemTodayDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Calculates date differences in days between target date and base date.
 * Positive = future (days remaining). Negative = past (days expired).
 */
export function getDaysDifference(targetDateStr: string, baseDateStr?: string): number {
  if (!targetDateStr) return 9999;
  const base = new Date((baseDateStr || getSystemTodayDate()) + 'T00:00:00');
  const target = new Date(targetDateStr + 'T00:00:00');
  return Math.round((target.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDaysRemaining(days: number): string {
  if (days < 0) {
    return `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`;
  }
  if (days === 0) {
    return 'Expires TODAY';
  }
  return `Expires in ${days} day${days === 1 ? '' : 's'}`;
}

export interface ComplianceCalculationOptions {
  providers: Provider[];
  homeVisitors: HomeVisitor[];
  children: Child[];
  parents: ParentGuardian[];
  attendanceState?: Record<string, AttendanceEntry>;
  baseDate?: string; // YYYY-MM-DD (defaults to current system date)
  currentTimeMinutes?: number; // Optional minute of day (0-1439). If undefined, calculates from local system clock.
}

/**
 * Deterministic calculation engine that evaluates all regulatory compliance schedules,
 * document expirations, attendance sign-ins, payment escalations, and ratio rules.
 */
export function calculateComplianceAlerts({
  providers,
  homeVisitors,
  children,
  parents,
  attendanceState = {},
  baseDate = getSystemTodayDate(),
  currentTimeMinutes
}: ComplianceCalculationOptions): DailyActionAlert[] {
  const alerts: DailyActionAlert[] = [];
  const baseParts = baseDate.split('-').map(Number);
  const currentMonth = baseParts[1]; // 1-12
  const currentDay = baseParts[2];

  // -------------------------------------------------------------
  // 1. PROVIDER COMPLIANCE & RATIO AUDIT
  // -------------------------------------------------------------
  providers.forEach(provider => {
    // 1a. Vulnerable Sector Check (5-year statutory expiry)
    if (provider.vscExpiryDate) {
      const days = getDaysDifference(provider.vscExpiryDate, baseDate);
      if (days < 0) {
        alerts.push({
          id: `alert-prov-vsc-exp-${provider.id}`,
          severity: 'urgent',
          category: 'document',
          title: `VSC Expired: ${provider.name}`,
          description: `Vulnerable Sector Police Check expired on ${provider.vscExpiryDate}. Care suspension risk under CCEYA.`,
          dateDue: provider.vscExpiryDate,
          actionableTarget: provider.id,
          metadata: { type: 'provider_vsc', providerId: provider.id }
        });
      } else if (days <= 30) {
        alerts.push({
          id: `alert-prov-vsc-warn-${provider.id}`,
          severity: 'warning',
          category: 'document',
          title: `VSC Expiring Soon: ${provider.name}`,
          description: `Vulnerable Sector Check expires in ${days} days (${provider.vscExpiryDate}). Submission to police detachment required.`,
          dateDue: provider.vscExpiryDate,
          actionableTarget: provider.id,
          metadata: { type: 'provider_vsc', providerId: provider.id }
        });
      }
    }

    // 1b. Annual Offence Declaration (1-year statutory renewal)
    if (provider.offenceDeclDate) {
      const days = getDaysDifference(provider.offenceDeclDate, baseDate);
      if (days < 0) {
        alerts.push({
          id: `alert-prov-offence-exp-${provider.id}`,
          severity: 'urgent',
          category: 'document',
          title: `Offence Declaration Overdue: ${provider.name}`,
          description: `Annual Offence Declaration expired on ${provider.offenceDeclDate}. Mandatory digital sign-off required.`,
          dateDue: provider.offenceDeclDate,
          actionableTarget: provider.id,
          metadata: { type: 'provider_offence', providerId: provider.id }
        });
      } else if (days <= 14) {
        alerts.push({
          id: `alert-prov-offence-warn-${provider.id}`,
          severity: 'warning',
          category: 'document',
          title: `Offence Declaration Due: ${provider.name}`,
          description: `Annual Offence Declaration must be renewed within ${days} days (${provider.offenceDeclDate}).`,
          dateDue: provider.offenceDeclDate,
          actionableTarget: provider.id,
          metadata: { type: 'provider_offence', providerId: provider.id }
        });
      }
    }

    // 1c. Standard First Aid & CPR Level C (3-year expiry)
    if (provider.firstAidExpiryDate) {
      const days = getDaysDifference(provider.firstAidExpiryDate, baseDate);
      if (days < 0) {
        alerts.push({
          id: `alert-prov-cpr-exp-${provider.id}`,
          severity: 'urgent',
          category: 'document',
          title: `First Aid & CPR Expired: ${provider.name}`,
          description: `Standard First Aid & Infant/Child CPR Level C expired on ${provider.firstAidExpiryDate}. Ineligible to care for children until recertified.`,
          dateDue: provider.firstAidExpiryDate,
          actionableTarget: provider.id,
          metadata: { type: 'provider_first_aid', providerId: provider.id }
        });
      } else if (days <= 30) {
        alerts.push({
          id: `alert-prov-cpr-warn-${provider.id}`,
          severity: 'warning',
          category: 'document',
          title: `First Aid & CPR Expiring: ${provider.name}`,
          description: `First Aid & CPR Level C certification expires in ${days} days (${provider.firstAidExpiryDate}).`,
          dateDue: provider.firstAidExpiryDate,
          actionableTarget: provider.id,
          metadata: { type: 'provider_first_aid', providerId: provider.id }
        });
      }
    }

    // 1d. Home Daycare Liability Insurance Rider (1-year expiry)
    if (provider.homeInsuranceExpiryDate) {
      const days = getDaysDifference(provider.homeInsuranceExpiryDate, baseDate);
      if (days < 0) {
        alerts.push({
          id: `alert-prov-ins-exp-${provider.id}`,
          severity: 'urgent',
          category: 'document',
          title: `Home Insurance Rider Expired: ${provider.name}`,
          description: `Commercial Daycare Home Liability Insurance expired on ${provider.homeInsuranceExpiryDate}. Proof of $2M policy rider required.`,
          dateDue: provider.homeInsuranceExpiryDate,
          actionableTarget: provider.id,
          metadata: { type: 'provider_insurance', providerId: provider.id }
        });
      } else if (days <= 30) {
        alerts.push({
          id: `alert-prov-ins-warn-${provider.id}`,
          severity: 'warning',
          category: 'document',
          title: `Home Insurance Renewal Due: ${provider.name}`,
          description: `Home Daycare Liability Rider expires in ${days} days (${provider.homeInsuranceExpiryDate}).`,
          dateDue: provider.homeInsuranceExpiryDate,
          actionableTarget: provider.id,
          metadata: { type: 'provider_insurance', providerId: provider.id }
        });
      }
    }

    // 1e. Tetanus (10-year expiry) & TB / Chest X-Ray (2-year expiry)
    if (provider.tetanusExpiryDate) {
      const days = getDaysDifference(provider.tetanusExpiryDate, baseDate);
      if (days < 0) {
        alerts.push({
          id: `alert-prov-tetanus-${provider.id}`,
          severity: 'warning',
          category: 'document',
          title: `Tetanus Booster Overdue: ${provider.name}`,
          description: `10-year Td/Tdap immunization record expired on ${provider.tetanusExpiryDate}. Physician booster certificate required.`,
          dateDue: provider.tetanusExpiryDate,
          actionableTarget: provider.id
        });
      }
    }
    if (provider.tbXrayExpiryDate) {
      const days = getDaysDifference(provider.tbXrayExpiryDate, baseDate);
      if (days < 0) {
        alerts.push({
          id: `alert-prov-tb-${provider.id}`,
          severity: 'warning',
          category: 'document',
          title: `TB / Chest X-Ray Expired: ${provider.name}`,
          description: `2-year TB test / Chest X-ray clearance expired on ${provider.tbXrayExpiryDate}.`,
          dateDue: provider.tbXrayExpiryDate,
          actionableTarget: provider.id
        });
      }
    }

    // 1f. Independent Contractor Agreement & Policy Renewal (1-year renewal)
    if (provider.contractRenewalDate) {
      const days = getDaysDifference(provider.contractRenewalDate, baseDate);
      if (days <= 14) {
        alerts.push({
          id: `alert-prov-contract-${provider.id}`,
          severity: days < 0 ? 'warning' : 'info',
          category: 'document',
          title: `Contract Renewal Due: ${provider.name}`,
          description: `Independent Contractor Agreement & Policy renewal ${days < 0 ? 'overdue since' : 'due on'} ${provider.contractRenewalDate}.`,
          dateDue: provider.contractRenewalDate,
          actionableTarget: provider.id
        });
      }
    }

    // 1g. T4A Annual Tax Information Slip (Last working day of February)
    if (currentMonth === 1 || currentMonth === 2) {
      const isLateFeb = currentMonth === 2 && currentDay >= 15;
      alerts.push({
        id: `alert-prov-t4a-${provider.id}`,
        severity: isLateFeb ? 'urgent' : 'warning',
        category: 'document',
        title: `T4A Tax Slip Reminder: ${provider.name}`,
        description: `T4A Statement of Remuneration must be issued to ${provider.name} before the last working day of February.`,
        dateDue: `${baseParts[0]}-02-28`,
        actionableTarget: provider.id
      });
    }

    // 1h. Provider Household Adult Members (Family members 18+)
    if (provider.householdAdults && provider.householdAdults.length > 0) {
      provider.householdAdults.forEach(adult => {
        if (adult.vscExpiryDate) {
          const days = getDaysDifference(adult.vscExpiryDate, baseDate);
          if (days < 0 || days <= 30) {
            alerts.push({
              id: `alert-adult-vsc-${adult.id}`,
              severity: days < 0 ? 'urgent' : 'warning',
              category: 'document',
              title: `Household Member VSC ${days < 0 ? 'Expired' : 'Expiring'}: ${adult.name}`,
              description: `Adult household resident ${adult.name} (${adult.relationship} of ${provider.name}) VSC ${days < 0 ? 'expired' : `expires in ${days} days`}.`,
              dateDue: adult.vscExpiryDate,
              actionableTarget: provider.id
            });
          }
        }
        if (adult.offenceDeclDate) {
          const days = getDaysDifference(adult.offenceDeclDate, baseDate);
          if (days < 0 || days <= 14) {
            alerts.push({
              id: `alert-adult-offence-${adult.id}`,
              severity: days < 0 ? 'urgent' : 'warning',
              category: 'document',
              title: `Household Member Offence Decl Due: ${adult.name}`,
              description: `Adult household resident ${adult.name} (${provider.name}) must submit annual Offence Declaration.`,
              dateDue: adult.offenceDeclDate,
              actionableTarget: provider.id
            });
          }
        }
        if (!adult.behaviourMgmtSignedDate) {
          alerts.push({
            id: `alert-adult-behaviour-${adult.id}`,
            severity: 'warning',
            category: 'document',
            title: `Behaviour Management Policy Missing: ${adult.name}`,
            description: `Household resident ${adult.name} (${provider.name}) must sign the CCEYA Behaviour Management Agreement.`,
            dateDue: baseDate,
            actionableTarget: provider.id
          });
        }
      });
    }

    // 1i. CCEYA Ratio & Capacity Calculations
    const assignedChildren = children.filter(c => c.providerId === provider.id && !c.isArchived);
    const underTwoCount = assignedChildren.filter(c => c.isUnderTwo).length;
    const ownKidsUnderFour = provider.ownChildrenUnderFour ?? (provider.ownChildrenUnderSix ?? 0);
    const totalHeadcount = assignedChildren.length + ownKidsUnderFour;

    // CCEYA Rule: Max 3 children under 2 years old
    const maxUnderTwo = provider.maxUnderTwo ?? 3;
    if (underTwoCount > maxUnderTwo) {
      alerts.push({
        id: `alert-ratio-infant-${provider.id}`,
        severity: 'urgent',
        category: 'ratio',
        title: `CCEYA Ratio Breach: ${provider.name}`,
        description: `Home has ${underTwoCount} infants under 2 years (Statutory Maximum: ${maxUnderTwo} under 2). Immediate re-matching required.`,
        dateDue: baseDate,
        actionableTarget: provider.id
      });
    }

    // CCEYA Rule: Total capacity max 6 (including provider's own children under 4)
    if (totalHeadcount > provider.maxCapacity) {
      alerts.push({
        id: `alert-ratio-cap-${provider.id}`,
        severity: 'urgent',
        category: 'ratio',
        title: `Over Capacity Limit: ${provider.name}`,
        description: `Total headcount is ${totalHeadcount} (including ${ownKidsUnderFour} provider's own young children). Exceeds statutory cap of ${provider.maxCapacity}.`,
        dateDue: baseDate,
        actionableTarget: provider.id
      });
    } else if (totalHeadcount < provider.maxCapacity && assignedChildren.length < 5) {
      const openSpots = provider.maxCapacity - totalHeadcount;
      alerts.push({
        id: `alert-ratio-vacancy-${provider.id}`,
        severity: 'info',
        category: 'ratio',
        title: `Licensed Vacancy: ${provider.homeName}`,
        description: `${provider.homeName} in ${provider.region} has ${openSpots} available licensed spot${openSpots > 1 ? 's' : ''}.`,
        dateDue: baseDate,
        actionableTarget: provider.id
      });
    }
  });

  // -------------------------------------------------------------
  // 2. HOME VISITOR COMPLIANCE (RECE)
  // -------------------------------------------------------------
  homeVisitors.forEach(visitor => {
    if (visitor.receExpiryDate) {
      const days = getDaysDifference(visitor.receExpiryDate, baseDate);
      if (days < 0) {
        alerts.push({
          id: `alert-vis-rece-exp-${visitor.id}`,
          severity: 'urgent',
          category: 'document',
          title: `RECE License Expired: ${visitor.name}`,
          description: `College of ECE License (${visitor.receNumber}) expired on ${visitor.receExpiryDate}. Statutory field visits restricted.`,
          dateDue: visitor.receExpiryDate,
          actionableTarget: visitor.id
        });
      } else if (days <= 30) {
        alerts.push({
          id: `alert-vis-rece-warn-${visitor.id}`,
          severity: 'warning',
          category: 'document',
          title: `RECE Renewal Due: ${visitor.name}`,
          description: `College of ECE registration (${visitor.receNumber}) expires in ${days} days (${visitor.receExpiryDate}).`,
          dateDue: visitor.receExpiryDate,
          actionableTarget: visitor.id
        });
      }
    }
    if (visitor.vscExpiryDate) {
      const days = getDaysDifference(visitor.vscExpiryDate, baseDate);
      if (days < 0 || days <= 30) {
        alerts.push({
          id: `alert-vis-vsc-${visitor.id}`,
          severity: days < 0 ? 'urgent' : 'warning',
          category: 'document',
          title: `Visitor VSC ${days < 0 ? 'Expired' : 'Expiring'}: ${visitor.name}`,
          description: `Home Child Care Visitor police check ${days < 0 ? 'expired' : `expires in ${days} days`}.`,
          dateDue: visitor.vscExpiryDate,
          actionableTarget: visitor.id
        });
      }
    }
  });

  // -------------------------------------------------------------
  // 3. CHILDREN HEALTH, SABRINA'S LAW, PERMISSIONS & ATTENDANCE
  // -------------------------------------------------------------
  children.forEach(child => {
    if (child.isArchived) return;

    // 3a. Sabrina's Law: Epi-Pen Auto-Injector Expiry
    if (child.epiPenRequired) {
      if (!child.epiPenExpiry) {
        alerts.push({
          id: `alert-epipen-missing-${child.id}`,
          severity: 'urgent',
          category: 'health',
          title: `Sabrina's Law: Epi-Pen Expiry Missing (${child.fullName})`,
          description: `Epi-Pen auto-injector expiration date is missing from child file. Urgent parent audit required.`,
          actionableTarget: child.id
        });
      } else {
        const days = getDaysDifference(child.epiPenExpiry, baseDate);
        if (days < 0) {
          alerts.push({
            id: `alert-epipen-exp-${child.id}`,
            severity: 'urgent',
            category: 'health',
            title: `Sabrina's Law EXPIRED: Epi-Pen (${child.fullName})`,
            description: `On-site Epi-Pen auto-injector expired on ${child.epiPenExpiry}. Immediate replacement unit must be provided today.`,
            dateDue: child.epiPenExpiry,
            actionableTarget: child.id
          });
        } else if (days <= 30) {
          alerts.push({
            id: `alert-epipen-warn-${child.id}`,
            severity: 'warning',
            category: 'health',
            title: `Epi-Pen Expiring Soon: ${child.fullName}`,
            description: `Epi-Pen expires in ${days} days (${child.epiPenExpiry}). Request unexpired pharmacy prescription from family.`,
            dateDue: child.epiPenExpiry,
            actionableTarget: child.id
          });
        }
      }
    }

    // 3b. Ryan's Law: Asthma Inhaler / Puffer Expiry
    if (child.asthmaPufferExpiry) {
      const days = getDaysDifference(child.asthmaPufferExpiry, baseDate);
      if (days < 0) {
        alerts.push({
          id: `alert-asthma-exp-${child.id}`,
          severity: 'urgent',
          category: 'health',
          title: `Ryan's Law: Asthma Inhaler Expired (${child.fullName})`,
          description: `Prescription asthma puffer expired on ${child.asthmaPufferExpiry}. Replacement required on site.`,
          dateDue: child.asthmaPufferExpiry,
          actionableTarget: child.id
        });
      } else if (days <= 30) {
        alerts.push({
          id: `alert-asthma-warn-${child.id}`,
          severity: 'warning',
          category: 'health',
          title: `Asthma Inhaler Expiring: ${child.fullName}`,
          description: `Prescription puffer expires in ${days} days (${child.asthmaPufferExpiry}).`,
          dateDue: child.asthmaPufferExpiry,
          actionableTarget: child.id
        });
      }
    }

    // 3c. Prescription Medications
    if (child.prescriptionMeds && child.prescriptionMeds.length > 0) {
      child.prescriptionMeds.forEach(med => {
        const days = getDaysDifference(med.expiryDate, baseDate);
        if (days < 0 || days <= 14) {
          alerts.push({
            id: `alert-rx-${child.id}-${med.id}`,
            severity: days < 0 ? 'urgent' : 'warning',
            category: 'health',
            title: `Prescription Rx ${days < 0 ? 'Expired' : 'Expiring'}: ${med.medicationName}`,
            description: `Prescription medication (${med.medicationName} - ${med.dosage}) for ${child.fullName} ${days < 0 ? 'expired' : `expires in ${days} days`}.`,
            dateDue: med.expiryDate,
            actionableTarget: child.id
          });
        }
      });
    }

    // 3d. Court Order / Custody Paper Review
    if (child.courtOrderExpiry) {
      const days = getDaysDifference(child.courtOrderExpiry, baseDate);
      if (days < 0 || days <= 30) {
        alerts.push({
          id: `alert-court-${child.id}`,
          severity: days < 0 ? 'urgent' : 'warning',
          category: 'document',
          title: `Custody Court Order ${days < 0 ? 'Expired' : 'Review Due'}: ${child.fullName}`,
          description: `Legal custody paper / court order decree ${days < 0 ? 'expired on' : 'review date is'} ${child.courtOrderExpiry}. Contact parents for renewed legal documentation.`,
          dateDue: child.courtOrderExpiry,
          actionableTarget: child.id
        });
      }
    }

    // 3e. Special Permissions Expiry
    if (child.specialPermissions && child.specialPermissions.length > 0) {
      child.specialPermissions.forEach(perm => {
        if (perm.expiryDate) {
          const days = getDaysDifference(perm.expiryDate, baseDate);
          if (days <= 30) {
            alerts.push({
              id: `alert-perm-${child.id}-${perm.id}`,
              severity: days < 0 ? 'warning' : 'info',
              category: 'document',
              title: `Permission ${days < 0 ? 'Expired' : 'Renewal'}: ${perm.title}`,
              description: `${perm.title} for ${child.fullName} ${days < 0 ? 'expired on' : 'expires in ' + days + ' days'} (${perm.expiryDate}).`,
              dateDue: perm.expiryDate,
              actionableTarget: child.id
            });
          }
        }
      });
    }

    // 3f. Daily Attendance: Scheduled child not signed in today
    if (child.admissionsStage === 'enrolled' && child.providerId) {
      const prov = providers.find(p => p.id === child.providerId);
      const record = attendanceState[child.id];
      const isPresent = record && record.status === 'present';
      const isExplicitAbsent = record && (record.status === 'absent' || record.status === 'sick' || record.status === 'vacation');

      if (!isPresent && !isExplicitAbsent) {
        alerts.push({
          id: `alert-att-not-in-${child.id}`,
          severity: 'warning',
          category: 'attendance',
          title: `Not Signed In: ${child.fullName}`,
          description: `${child.fullName} is scheduled today at ${prov?.name || 'Assigned Home'} but has not been signed in yet.`,
          dateDue: baseDate,
          actionableTarget: child.id,
          metadata: { type: 'attendance_checkin', childId: child.id, providerId: child.providerId }
        });
      }
    }

    // 3g. Municipal Subsidy Expiry
    if (child.fundingType === 'subsidy' && child.subsidyExpiryDate) {
      const days = getDaysDifference(child.subsidyExpiryDate, baseDate);
      if (days < 0) {
        alerts.push({
          id: `alert-sub-exp-${child.id}`,
          severity: 'urgent',
          category: 'payment',
          title: `Subsidy Authorization EXPIRED: ${child.fullName}`,
          description: `${child.subsidyRegion || 'Municipal'} child care subsidy expired on ${child.subsidyExpiryDate}. Reverting to private care billing ($35/day) if renewal not received.`,
          dateDue: child.subsidyExpiryDate,
          actionableTarget: child.id
        });
      } else if (days <= 30) {
        alerts.push({
          id: `alert-sub-warn-${child.id}`,
          severity: days <= 14 ? 'urgent' : 'warning',
          category: 'payment',
          title: `Subsidy Expiring in ${days} Days: ${child.fullName}`,
          description: `${child.subsidyRegion || 'Municipal'} subsidy authorization expires on ${child.subsidyExpiryDate}. Contact caseworker.`,
          dateDue: child.subsidyExpiryDate,
          actionableTarget: child.id
        });
      }
    }

    // 3g-2. Municipal Subsidy Allowable Absence Quota Alerts (Task #7)
    if (child.fundingType === 'subsidy') {
      const absencesUsed = child.subsidizedAbsenceDaysUsed ?? 0;
      const maxAllowed = child.subsidizedAbsenceQuota ?? 30;
      const warnThreshold = Math.max(1, maxAllowed - 5);
      if (absencesUsed >= maxAllowed) {
        alerts.push({
          id: `alert-sub-absence-exceeded-${child.id}`,
          severity: 'urgent',
          category: 'payment',
          title: `Absence Quota Exceeded: ${child.fullName} (${absencesUsed}/${maxAllowed} Days)`,
          description: `${child.fullName} has reached ${absencesUsed} absence days this calendar year (annual policy limit: ${maxAllowed} days). Regional municipal subsidy will not reimburse subsequent absences; private care billing ($35.00/day) required.`,
          dateDue: baseDate,
          actionableTarget: child.id,
          actionLabel: 'Review Subsidy Ledger',
          targetTab: 'families'
        });
      } else if (absencesUsed >= warnThreshold) {
        alerts.push({
          id: `alert-sub-absence-warning-${child.id}`,
          severity: 'warning',
          category: 'payment',
          title: `Absence Quota Warning: ${child.fullName} (${absencesUsed}/${maxAllowed} Days)`,
          description: `${child.fullName} has used ${absencesUsed} of ${maxAllowed} allowable subsidized absence days (${maxAllowed - absencesUsed} remaining). Alert caseworker if extended absence or vacation is planned.`,
          dateDue: baseDate,
          actionableTarget: child.id,
          actionLabel: 'Check Absence Ledger',
          targetTab: 'families'
        });
      }
    }

    // 3h. Parent Payments & Termination Escalation
    if (child.eTransferStatus === 'overdue') {
      // Post-1st termination escalation
      const isPastGracePeriod = currentDay >= 4;
      if (isPastGracePeriod) {
        alerts.push({
          id: `alert-pay-term-${child.id}`,
          severity: 'urgent',
          category: 'payment',
          title: `Care Termination Warning: ${child.fullName}`,
          description: `Monthly fee ($${child.monthlyFee.toFixed(2)}) is 3+ days overdue. Care subject to immediate termination under agency policy if unpaid.`,
          dateDue: `${baseParts[0]}-${String(currentMonth).padStart(2, '0')}-04`,
          actionableTarget: child.id
        });
      } else {
        alerts.push({
          id: `alert-pay-overdue-${child.id}`,
          severity: 'warning',
          category: 'payment',
          title: `e-Transfer Overdue: ${child.fullName}`,
          description: `Monthly fee of $${child.monthlyFee.toFixed(2)} is overdue. Dispatch 1-click Interac e-transfer reminder.`,
          dateDue: `${baseParts[0]}-${String(currentMonth).padStart(2, '0')}-01`,
          actionableTarget: child.id
        });
      }
    } else if (currentDay >= 28) {
      // 3-days pre-month-end gentle reminder
      const nextMonth = currentMonth < 12 ? currentMonth + 1 : 1;
      const nextYear = currentMonth < 12 ? baseParts[0] : baseParts[0] + 1;
      alerts.push({
        id: `alert-pay-gentle-${child.id}`,
        severity: 'info',
        category: 'payment',
        title: `Monthly Fee Reminder: ${child.fullName}`,
        description: `Gentle reminder: Monthly fee ($${child.monthlyFee.toFixed(2)}) is due on or before the 1st of next month.`,
        dateDue: `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`,
        actionableTarget: child.id
      });
    }
    // 3i. Yellow Immunization Card / Milestone Booster Expiry
    if (child.immunizationExpiryDate) {
      const days = getDaysDifference(child.immunizationExpiryDate, baseDate);
      if (days < 0) {
        alerts.push({
          id: `alert-vax-exp-${child.id}`,
          severity: 'urgent',
          category: 'health',
          title: `Yellow Card Booster Overdue: ${child.fullName}`,
          description: `Child immunization record expired or milestone booster overdue by ${Math.abs(days)} days (${child.immunizationExpiryDate}). Request updated yellow card from parent.`,
          dateDue: child.immunizationExpiryDate,
          actionableTarget: child.id
        });
      } else if (days <= 30) {
        alerts.push({
          id: `alert-vax-warn-${child.id}`,
          severity: 'warning',
          category: 'health',
          title: `Immunization Milestone Due: ${child.fullName}`,
          description: `Age-milestone vaccination / Yellow Card booster due in ${days} days (${child.immunizationExpiryDate}).`,
          dateDue: child.immunizationExpiryDate,
          actionableTarget: child.id
        });
      }
    }
  });

  // -------------------------------------------------------------
  // 4. SCREENING, PARENT CONTRACTS & FORM 0 INTAKE CALLS
  // -------------------------------------------------------------
  parents.forEach(parent => {
    if (!parent.formZeroApproved && !parent.isArchived) {
      alerts.push({
        id: `alert-formzero-${parent.id}`,
        severity: 'warning',
        category: 'screening',
        title: `Intake Screening Call Waiting: ${parent.fullName}`,
        description: `${parent.fullName} (${parent.region}) submitted Form 0 pre-screening. Schedule 10-min discovery call.`,
        dateDue: baseDate,
        actionableTarget: parent.id
      });
    }

    // Parent Contract & Annual Fee Agreement Renewal
    if (parent.contractExpiryDate) {
      const days = getDaysDifference(parent.contractExpiryDate, baseDate);
      if (days < 0 || days <= 30) {
        alerts.push({
          id: `alert-contract-parent-${parent.id}`,
          severity: days < 0 ? 'urgent' : 'warning',
          category: 'document',
          title: `Parent Contract Renewal ${days < 0 ? 'Overdue' : 'Due'}: ${parent.fullName}`,
          description: `Master Parent Contract & Fee Terms (PAR-5) ${days < 0 ? 'expired on' : 'expires in ' + days + ' days'} (${parent.contractExpiryDate}). Annual renewal required.`,
          dateDue: parent.contractExpiryDate,
          actionableTarget: parent.id
        });
      }
    }
  });

  // -------------------------------------------------------------
  // 5. CCEYA 2-TAP DAILY ATTENDANCE & PHYSICAL WHEREABOUTS SENTINEL
  // -------------------------------------------------------------
  const now = new Date();
  const minuteOfDay = currentTimeMinutes !== undefined 
    ? currentTimeMinutes 
    : (now.getHours() * 60 + now.getMinutes());

  const isPast1230PM = minuteOfDay >= 750;  // 12:30 PM (750 minutes from 00:00)
  const isPast500PM = minuteOfDay >= 1020;  // 5:00 PM / 17:00 (1020 minutes from 00:00)

  children.forEach(child => {
    if (!child.providerId) return;
    const provider = providers.find(p => p.id === child.providerId);
    const providerName = provider ? provider.name : 'Assigned Provider';
    const att = attendanceState[child.id];
    const status = att?.status;

    // 5a. 12:30 PM Missing Morning Sign-In Alert
    if (isPast1230PM) {
      const isRecorded = status && status !== 'not_checked_in';
      if (!isRecorded) {
        alerts.push({
          id: `alert-signin-missing-${child.id}`,
          severity: 'warning',
          category: 'attendance',
          title: `Missing Morning Sign-In: ${child.fullName}`,
          description: `Child is scheduled today at ${providerName}'s home daycare but has not been checked in or marked absent/sick by 12:30 PM. CCEYA physical whereabouts audit required.`,
          dateDue: baseDate,
          actionableTarget: child.id,
          targetTab: 'providers',
          actionLabel: 'Check In Child',
          metadata: { type: 'attendance_signin', childId: child.id, providerId: child.providerId }
        });
      }
    }

    // 5b. 5:00 PM Missing Evening Sign-Out Alert
    if (isPast500PM) {
      const isPresentWithoutCheckout = status === 'present' && !att?.checkOut;
      if (isPresentWithoutCheckout) {
        alerts.push({
          id: `alert-signout-missing-${child.id}`,
          severity: 'warning',
          category: 'attendance',
          title: `Missing Evening Sign-Out: ${child.fullName}`,
          description: `Child was signed in at ${att?.checkIn || 'morning'} at ${providerName}'s home daycare but has not been tapped out by 5:00 PM. Record departure timestamp and authorized pickup adult for CCEYA liability compliance.`,
          dateDue: baseDate,
          actionableTarget: child.id,
          targetTab: 'providers',
          actionLabel: 'Tap Out Child',
          metadata: { type: 'attendance_signout', childId: child.id, providerId: child.providerId }
        });
      }
    }
  });

  return alerts;
}
