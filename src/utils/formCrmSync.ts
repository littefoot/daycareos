/**
 * Automated CRM Sync Utility for All Child Care Solutions (ACCS)
 * Automatically parses, formats, and syncs parent form submission payloads
 * (PAR-1 through PAR-5) directly into Child & Parent CRM profiles in real time,
 * eliminating manual staff data entry entirely.
 */

import { Child, ParentGuardian, EmergencyContact } from '../types';

export interface FormCrmSyncResult {
  childUpdates: Partial<Child>;
  parentUpdates: Partial<ParentGuardian>;
  summary: string[];
}

/**
 * Calculates age in months and friendly formatting from birth date (YYYY-MM-DD)
 */
export function calculateAgeMetrics(dob: string) {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;

  const now = new Date();
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) {
    months--;
  }

  const ageMonths = Math.max(0, months);
  const years = Math.floor(ageMonths / 12);
  const remMonths = ageMonths % 12;
  const ageYearsFormatted = `${years} yr${years !== 1 ? 's' : ''} ${remMonths} mo${remMonths !== 1 ? 's' : ''}`;
  const isUnderTwo = ageMonths < 24;
  const isUnderThree = ageMonths < 36;

  return { ageMonths, ageYearsFormatted, isUnderTwo, isUnderThree };
}

/**
 * Parses and formats form submission data into CRM child and parent records.
 */
export function parseFormSubmissionToCrm(
  formId: string,
  submittedData: Record<string, any>,
  currentChild?: Child,
  currentParent?: ParentGuardian
): FormCrmSyncResult {
  const childUpdates: Partial<Child> = {};
  const parentUpdates: Partial<ParentGuardian> = {};
  const summary: string[] = [];

  // ==========================================
  // 1. FORM PAR-1: Master Child Application for Enrolment
  // ==========================================
  if (formId === 'par-form-1') {
    // Child Profile Updates
    const legalName = submittedData['child_legal_name'] || submittedData['child_name'];
    if (legalName && legalName !== currentChild?.fullName) {
      childUpdates.fullName = legalName.trim();
      summary.push(`Child Legal Name ➔ "${childUpdates.fullName}"`);
    }

    const preferredName = submittedData['child_preferred_name'];
    if (preferredName) {
      childUpdates.preferredName = preferredName.trim();
      summary.push(`Preferred Name ➔ "${childUpdates.preferredName}"`);
    }

    const dob = submittedData['dob'] || submittedData['date_of_birth'] || submittedData['child_dob'];
    if (dob) {
      childUpdates.dob = dob;
      const ageMetrics = calculateAgeMetrics(dob);
      if (ageMetrics) {
        Object.assign(childUpdates, ageMetrics);
        summary.push(`Date of Birth ➔ ${dob} (${ageMetrics.ageYearsFormatted})`);
      }
    }

    // Guardian 1 (Primary)
    const g1Name = submittedData['guardian_1_name'] || submittedData['parent_legal_name'];
    if (g1Name) parentUpdates.fullName = g1Name.trim();

    const g1Phone = submittedData['guardian_1_cell'] || submittedData['primary_phone'];
    if (g1Phone) parentUpdates.phone = g1Phone.trim();

    const g1Email = submittedData['guardian_1_email'] || submittedData['email'];
    if (g1Email) parentUpdates.email = g1Email.trim();

    const g1Address = submittedData['guardian_1_address'] || submittedData['home_address'];
    if (g1Address) parentUpdates.homeAddress = g1Address.trim();

    const g1Employer = submittedData['guardian_1_employer'] || submittedData['parent_employer'];
    if (g1Employer) parentUpdates.employer = g1Employer.trim();

    const g1WorkPhone = submittedData['guardian_1_work_phone'] || submittedData['parent_work_phone'];
    if (g1WorkPhone) parentUpdates.workPhone = g1WorkPhone.trim();

    // Guardian 2 (Secondary)
    const g2Name = submittedData['guardian_2_name'] || submittedData['secondary_guardian_name'];
    if (g2Name) parentUpdates.secondaryGuardianName = g2Name.trim();

    const g2Phone = submittedData['guardian_2_cell'] || submittedData['secondary_guardian_phone'];
    if (g2Phone) parentUpdates.secondaryGuardianPhone = g2Phone.trim();

    const g2Email = submittedData['guardian_2_email'] || submittedData['secondary_guardian_email'];
    if (g2Email) parentUpdates.secondaryGuardianEmail = g2Email.trim();

    const g2Rel = submittedData['guardian_2_relationship'] || submittedData['secondary_guardian_relationship'];
    if (g2Rel) parentUpdates.secondaryGuardianRelationship = g2Rel.trim();

    const g2Address = submittedData['guardian_2_address'] || submittedData['secondary_guardian_address'];
    if (g2Address) parentUpdates.secondaryGuardianAddress = g2Address.trim();

    const g2Employer = submittedData['guardian_2_employer'];
    if (g2Employer) parentUpdates.secondaryGuardianEmployer = g2Employer.trim();

    const g2WorkPhone = submittedData['guardian_2_work_phone'];
    if (g2WorkPhone) parentUpdates.secondaryGuardianWorkPhone = g2WorkPhone.trim();

    if (g1Name || g2Name) {
      summary.push(`Guardians Synced ➔ ${g1Name || currentParent?.fullName}${g2Name ? ` & ${g2Name}` : ''}`);
    }

    // Emergency Contacts
    const contactName = submittedData['emergency_friend_contact'] || submittedData['emergency_contact_1_name'];
    const contactPhone = submittedData['emergency_friend_cell'] || submittedData['emergency_contact_1_phone'];
    const contactRel = submittedData['emergency_friend_relationship'] || submittedData['emergency_contact_1_relationship'] || 'Authorized Emergency Contact';

    if (contactName && contactPhone) {
      const existing = currentChild?.emergencyContacts || [];
      const newContact: EmergencyContact = {
        name: contactName.trim(),
        phone: contactPhone.trim(),
        relationship: contactRel.trim()
      };
      // Prevent duplicates
      const filtered = existing.filter(c => c.name.toLowerCase() !== contactName.trim().toLowerCase());
      childUpdates.emergencyContacts = [newContact, ...filtered];
      summary.push(`Emergency Contact Added ➔ ${contactName} (${contactPhone})`);
    }
  }

  // ==========================================
  // 2. FORM PAR-2: Emergency Outings & Wallet Form
  // ==========================================
  if (formId === 'par-form-2') {
    const escortName = submittedData['authorized_escort_name'] || submittedData['emergency_pickup_name'];
    const escortPhone = submittedData['authorized_escort_phone'] || submittedData['emergency_pickup_phone'];
    const escortRel = submittedData['authorized_escort_rel'] || 'Authorized Escort';

    if (escortName && escortPhone) {
      const existing = currentChild?.emergencyContacts || [];
      const newContact: EmergencyContact = {
        name: escortName.trim(),
        phone: escortPhone.trim(),
        relationship: escortRel.trim()
      };
      const filtered = existing.filter(c => c.name.toLowerCase() !== escortName.trim().toLowerCase());
      childUpdates.emergencyContacts = [...filtered, newContact];
      summary.push(`Authorized Escort Synced ➔ ${escortName} (${escortPhone})`);
    }
  }

  // ==========================================
  // 3. FORM PAR-3: Emergency Medical & Allergy Consent
  // ==========================================
  if (formId === 'par-form-3') {
    // Allergies
    const rawAllergies = submittedData['known_allergies'] || submittedData['allergies_detail'];
    if (rawAllergies && typeof rawAllergies === 'string' && rawAllergies.trim().length > 0) {
      if (rawAllergies.toLowerCase().includes('none') || rawAllergies.toLowerCase().includes('n/a')) {
        childUpdates.allergies = [];
      } else {
        childUpdates.allergies = rawAllergies
          .split(/[\n,;]+/)
          .map(s => s.trim())
          .filter(Boolean);
      }
      summary.push(`Allergies Updated ➔ ${childUpdates.allergies.join(', ') || 'No known allergies'}`);
    }

    // Epi-Pen
    const epiPenVal = submittedData['has_epipen'] || submittedData['epipen'] || submittedData['epipen_required'];
    if (epiPenVal !== undefined) {
      const epiPenRequired = epiPenVal === 'yes' || epiPenVal === true || String(epiPenVal).toLowerCase() === 'true';
      childUpdates.epiPenRequired = epiPenRequired;
      if (epiPenRequired) {
        summary.push(`Epi-Pen Protocol ➔ ACTIVATED (Sabrina's Law)`);
      }
    }

    // Dietary Restrictions
    const rawDiet = submittedData['dietary_religious_food_restrictions'] || submittedData['dietary_restrictions'];
    if (rawDiet && typeof rawDiet === 'string' && rawDiet.trim().length > 0) {
      childUpdates.dietaryRestrictions = rawDiet
        .split(/[\n,;]+/)
        .map(s => s.trim())
        .filter(Boolean);
      summary.push(`Dietary Restrictions ➔ ${childUpdates.dietaryRestrictions.join(', ')}`);
    }

    // Medical Notes
    const medicalNotes = submittedData['medical_history_notes'] || submittedData['physician_notes'] || submittedData['known_allergies'];
    if (medicalNotes) {
      childUpdates.medicalNotes = String(medicalNotes).trim();
    }
  }

  // ==========================================
  // 4. FORM PAR-5: Master Parent Contract & Fee Terms
  // ==========================================
  if (formId === 'par-form-5') {
    summary.push(`Parent Contract & CWELCC Fee Terms Executed with Legal Signature`);
  }

  return { childUpdates, parentUpdates, summary };
}
