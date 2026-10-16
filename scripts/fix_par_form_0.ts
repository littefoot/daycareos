import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import { FormTemplate } from '../src/types/formSchema';

async function main() {
  console.log('Connecting to Cloud Firestore to update par-form-0...');
  const formRef = doc(db, 'form_templates', 'par-form-0');
  const snap = await getDoc(formRef);
  const currentData = snap.exists() ? (snap.data() as FormTemplate) : null;
  const currentVersion = currentData?.versionNumber || 22;
  const nextVersionNumber = currentVersion + 1;

  // The clean, canonical Form PAR-0 structure
  const cleanFormZero: FormTemplate = {
    id: 'par-form-0',
    formCode: 'PAR-0',
    title: '0. Initial Intake & Pre-Screening Form',
    category: 'Admissions',
    description: 'Initial intake inquiry to gather basic household needs, care region, and schedule the mandatory staff screening call before full registration.',
    version: `2026.${nextVersionNumber}`,
    versionNumber: nextVersionNumber,
    isRequired: true,
    targetStage: 'inquiry',
    assignedTo: 'parent',
    lastUpdated: new Date().toISOString(),
    lastModifiedBy: 'Agency Director (Admin)',
    changeSummary: 'Canonical reordering: Legal Name at top of Section 1, Street Address in Section 1',
    sections: [
      {
        id: 'sec-0-1',
        title: 'Initial Household Inquiry',
        description: 'Basic details to assess matching availability in your municipality.',
        fields: [
          {
            id: 'f0-1-first',
            name: 'parent_first_name',
            label: 'Primary Parent / Guardian First Name',
            type: 'text',
            placeholder: 'e.g. Sarah',
            required: true,
            gridCols: 2,
            order: 0
          },
          {
            id: 'f0-1-last',
            name: 'parent_last_name',
            label: 'Primary Parent / Guardian Last Name',
            type: 'text',
            placeholder: 'e.g. Tremblay',
            required: true,
            gridCols: 2,
            order: 1
          },
          {
            id: 'f0-2',
            name: 'primary_phone',
            label: 'Primary Guardian Contact Phone',
            type: 'phone',
            placeholder: 'e.g. (905) 555-0192',
            required: true,
            gridCols: 2,
            order: 2
          },
          {
            id: 'f0-3',
            name: 'email',
            label: 'Primary Guardian Email Address',
            type: 'email',
            placeholder: 'e.g. sarah.t@example.com',
            required: true,
            gridCols: 2,
            order: 3
          },
          {
            id: 'f0-4',
            name: 'care_region',
            label: 'Desired Care Region / Municipality',
            type: 'dropdown',
            options: ['Durham Region', 'York Region', 'Toronto'],
            required: true,
            gridCols: 2,
            order: 4
          },
          {
            id: 'f0-address',
            name: 'parent_address',
            label: 'Residential Street Address & Postal Code',
            type: 'text',
            placeholder: 'e.g. 142 Taunton Road East, Oshawa, ON L1G 3T8',
            helpText: 'Helps us match you with licensed provider homes closest to your house or school.',
            required: false,
            gridCols: 1,
            order: 5
          },
          {
            id: 'f0-5',
            name: 'child_name_age',
            label: 'Child Name & Estimated Age',
            type: 'text',
            placeholder: 'e.g. Liam, 18 months',
            required: true,
            gridCols: 2,
            order: 6
          },
          {
            id: 'f0-6',
            name: 'desired_start_date',
            label: 'Desired Start Date',
            type: 'date',
            required: true,
            gridCols: 2,
            order: 7
          },
          {
            id: 'f0-allergies',
            name: 'known_allergies',
            label: 'Known Allergies / Dietary / Medical Notes',
            type: 'text',
            placeholder: 'e.g. Peanuts, Sun, Air, Dairy, or None',
            required: false,
            gridCols: 2,
            order: 8
          },
          {
            id: 'f0-8',
            name: 'screening_notes',
            label: 'Specific Schedule Needs / Notes',
            type: 'textarea',
            placeholder: 'e.g. Mon–Fri 7:30am–5pm; preferred start times, etc.',
            required: false,
            gridCols: 1,
            order: 9
          },
          {
            id: 'f0-prescreening-consent',
            name: 'prescreening_acknowledgment',
            label: 'By submitting this inquiry, I acknowledge that I am initiating an initial pre-screening review with All Child Care Solutions, a licensed Home Child Care Agency operating under the Child Care and Early Years Act, 2014 (CCEYA) and regulated by the Ontario Ministry of Education. All personal and health data is encrypted under Canadian PIPEDA and Ontario PHIPA privacy standards.',
            type: 'consent_clause',
            required: true,
            gridCols: 1,
            order: 10
          }
        ]
      }
    ]
  };

  // Archive previous version if it exists
  if (currentData) {
    const versionRef = doc(db, 'form_templates', 'par-form-0', 'versions', `v${currentVersion}`);
    await setDoc(versionRef, {
      id: `v${currentVersion}`,
      versionNumber: currentVersion,
      versionTag: currentData.version || `2026.${currentVersion}`,
      timestamp: currentData.lastUpdated || new Date().toISOString(),
      author: currentData.lastModifiedBy || 'Previous Version',
      changeSummary: currentData.changeSummary || 'Pre-cleanup snapshot',
      formSnapshot: currentData
    });
    console.log(`Archived previous version v${currentVersion}.`);
  }

  // Save clean form
  await setDoc(formRef, cleanFormZero);
  console.log(`Successfully updated par-form-0 to v${nextVersionNumber} in Cloud Firestore.`);
  process.exit(0);
}

main().catch(err => {
  console.error('Error fixing form:', err);
  process.exit(1);
});
