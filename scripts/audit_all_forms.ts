import { ALL_INITIAL_FORMS } from '../src/data/allFormsData';
import { FormTemplate, FormField, FieldType } from '../src/types/formSchema';

const VALID_FIELD_TYPES: Set<FieldType> = new Set([
  'text', 'phone', 'email', 'date', 'time', 'dropdown', 'multiselect',
  'checkbox', 'radio', 'textarea', 'file_upload', 'signature',
  'notice_block', 'consent_clause'
]);

interface AuditFinding {
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  formId: string;
  formCode: string;
  issue: string;
}

function auditForms(forms: FormTemplate[]): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const formIdsSeen = new Set<string>();

  for (const form of forms) {
    // 1. Form ID check
    if (!form.id || !form.formCode) {
      findings.push({
        severity: 'CRITICAL',
        formId: form.id || 'UNKNOWN',
        formCode: form.formCode || 'UNKNOWN',
        issue: 'Form is missing id or formCode'
      });
    }

    if (formIdsSeen.has(form.id)) {
      findings.push({
        severity: 'CRITICAL',
        formId: form.id,
        formCode: form.formCode,
        issue: `Duplicate form ID detected: ${form.id}`
      });
    }
    formIdsSeen.add(form.id);

    // 2. Sections check
    if (!form.sections || form.sections.length === 0) {
      findings.push({
        severity: 'CRITICAL',
        formId: form.id,
        formCode: form.formCode,
        issue: 'Form has zero sections'
      });
      continue;
    }

    const fieldIdsSeen = new Set<string>();
    const fieldNamesSeen = new Set<string>();

    for (const [secIdx, sec] of form.sections.entries()) {
      if (!sec.id || !sec.title) {
        findings.push({
          severity: 'WARNING',
          formId: form.id,
          formCode: form.formCode,
          issue: `Section #${secIdx + 1} has missing id or title`
        });
      }

      for (const [fldIdx, field] of sec.fields.entries()) {
        if (!field.id || !field.name || !field.label) {
          findings.push({
            severity: 'CRITICAL',
            formId: form.id,
            formCode: form.formCode,
            issue: `Section "${sec.title}" Field #${fldIdx + 1} is missing id, name, or label`
          });
        }

        if (fieldIdsSeen.has(field.id)) {
          findings.push({
            severity: 'CRITICAL',
            formId: form.id,
            formCode: form.formCode,
            issue: `Duplicate field ID "${field.id}" in form "${form.id}" (Section: "${sec.title}")`
          });
        }
        fieldIdsSeen.add(field.id);

        if (!VALID_FIELD_TYPES.has(field.type)) {
          findings.push({
            severity: 'CRITICAL',
            formId: form.id,
            formCode: form.formCode,
            issue: `Invalid field type "${field.type}" on field "${field.id}"`
          });
        }

        if ((field.type === 'dropdown' || field.type === 'radio') && (!field.options || field.options.length === 0)) {
          findings.push({
            severity: 'WARNING',
            formId: form.id,
            formCode: form.formCode,
            issue: `Field "${field.label}" (${field.id}) is type "${field.type}" but has no options array defined`
          });
        }
      }
    }
  }

  return findings;
}

const findings = auditForms(ALL_INITIAL_FORMS);
console.log(`=== AUDIT SUMMARY: ${ALL_INITIAL_FORMS.length} FORMS INSPECTED ===`);
console.log(`Total Findings: ${findings.length}`);

for (const f of findings) {
  console.log(`[${f.severity}] [${f.formCode}] (${f.formId}): ${f.issue}`);
}

if (findings.filter(f => f.severity === 'CRITICAL').length === 0) {
  console.log('\nSUCCESS: 0 Critical Schema Issues found across ALL_INITIAL_FORMS!');
} else {
  console.error('\nFAILURE: Critical schema issues detected.');
}
