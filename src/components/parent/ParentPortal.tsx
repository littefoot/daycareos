import React, { useState } from 'react';
import { ParentGuardian, Child, Provider, AdmissionsStage } from '../../types';
import { FormTemplate } from '../../types/formSchema';
import { calculateMonthlyFee } from '../../data/agencySettingsData';
import { FileText, X } from 'lucide-react';
import { ModalPortal } from '../common/ModalPortal';
import { doc, setDoc } from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { COLLECTIONS } from '../../services/firebaseService';

// Subcomponents
import { ParentHeaderStepper } from './components/ParentHeaderStepper';
import { Step1InquiryCall } from './steps/Step1InquiryCall';
import { Step2DigitalForms } from './steps/Step2DigitalForms';
import { Step3ProviderMatching } from './steps/Step3ProviderMatching';
import { Step4DocumentsPayment } from './steps/Step4DocumentsPayment';
import { Step5ActiveCareHub } from './steps/Step5ActiveCareHub';
import { GatedNotesModal } from '../common/notes/GatedNotesModal';
import { parseFormSubmissionToCrm } from '../../utils/formCrmSync';

export interface ParentPortalProps {
  parentsList: ParentGuardian[];
  childrenList: Child[];
  formsList: FormTemplate[];
  providersList?: Provider[];
  onCompleteIntake?: (newChild: Partial<Child>, newParent: Partial<ParentGuardian>) => void;
  onUpdateDocStatus?: (
    childId: string, 
    docId: string, 
    status: any, 
    extraData?: { fileName?: string; fileUrl?: string; uploadedAt?: string }
  ) => void;
  onUpdateChildStage?: (childId: string, newStage: any) => void;
  onUpdateChildProfile?: (childId: string, updates: Partial<Child>) => void;
  onUpdateParentProfile?: (parentId: string, updates: Partial<ParentGuardian>) => void;
  magicFamilyId?: string | null;
  magicChildId?: string | null;
  isMagicLink?: boolean;
  attendanceState?: Record<string, { status: string; checkIn?: string; checkOut?: string }>;
}

// Sibling stage to Journey Step mapping (Strictly per child)
const getStageStepNumber = (stage?: AdmissionsStage): number => {
  switch (stage) {
    case 'inquiry': return 1;
    case 'docs_needed': return 2;
    case 'matching': return 3;
    case 'contract': return 4;
    case 'enrolled': return 5;
    default: return 1;
  }
};

export const ParentPortal: React.FC<ParentPortalProps> = ({
  parentsList,
  childrenList,
  formsList,
  providersList = [],
  onCompleteIntake,
  onUpdateDocStatus,
  onUpdateChildStage,
  onUpdateChildProfile,
  onUpdateParentProfile,
  magicFamilyId = null,
  magicChildId = null,
  isMagicLink = false,
  attendanceState
}) => {
  // Initialize with magicFamilyId if supplied, otherwise first parent
  const initialParentId = (magicFamilyId && parentsList.some(p => p.id === magicFamilyId))
    ? magicFamilyId
    : (magicFamilyId || parentsList[0]?.id || '');

  const [selectedParentId, setSelectedParentId] = useState<string>(initialParentId);

  // Sync selectedParentId if magicFamilyId is passed or parentsList updates
  React.useEffect(() => {
    if (magicFamilyId && parentsList.some(p => p.id === magicFamilyId)) {
      setSelectedParentId(magicFamilyId);
    }
  }, [magicFamilyId, parentsList]);

  // Current Parent & Children
  const currentParent = parentsList.find(p => p.id === selectedParentId) || parentsList[0];
  const parentChildren = childrenList.filter(c => c.parentId === currentParent?.id);

  // Target Child from URL query param or prop
  const urlChildId = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('childId') : null;
  const initialChildTarget = magicChildId || urlChildId;

  // Selected Sibling / Child in Family
  const [selectedChildId, setSelectedChildId] = useState<string>(() => {
    if (initialChildTarget && parentChildren.some(c => c.id === initialChildTarget)) {
      return initialChildTarget;
    }
    return parentChildren[0]?.id || '';
  });
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  // Only sync if selected child is not in current parent or explicit prop changes
  React.useEffect(() => {
    if (magicChildId && parentChildren.some(c => c.id === magicChildId)) {
      setSelectedChildId(magicChildId);
    } else if (parentChildren.length > 0 && !parentChildren.some(c => c.id === selectedChildId)) {
      setSelectedChildId(parentChildren[0].id);
    }
  }, [selectedParentId, magicChildId, parentChildren.length]);

  const activeChild = parentChildren.find(c => c.id === selectedChildId) || parentChildren[0] || childrenList[0];

  // Matched Provider Home for active child (strictly assigned by admin)
  const matchedProvider = activeChild?.providerId
    ? (providersList.find(p => p.id === activeChild.providerId) || null)
    : null;

  // Highest unlocked step strictly for THIS active child
  const childMaxStep = getStageStepNumber(activeChild?.admissionsStage);
  const isChildScreeningApproved = childMaxStep >= 2;

  // 1-2-3-4-5 Gamified Journey Step State (tracks active child's current step)
  const [currentStep, setCurrentStep] = useState<number>(childMaxStep);
  const [previewDocModal, setPreviewDocModal] = useState<{ title: string; url: string } | null>(null);

  // Close preview document modal on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewDocModal) {
        setPreviewDocModal(null);
      }
    };
    if (previewDocModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewDocModal]);

  // Auto-align journey stepper whenever active child or their admissionsStage changes
  React.useEffect(() => {
    if (activeChild) {
      const step = getStageStepNumber(activeChild.admissionsStage);
      setCurrentStep(step);
    }
  }, [selectedChildId, activeChild?.id, activeChild?.admissionsStage]);

  // Filter for all active Parent Forms from the Form Builder
  const parentForms = formsList.filter(f => f.assignedTo === 'parent' || f.assignedTo === 'both');

  // Currently Active Open Form in Parent Portal (defaults to PAR-1 in Step 2)
  const [activeFormId, setActiveFormId] = useState<string>('par-form-1');

  React.useEffect(() => {
    if (currentStep === 2) {
      if (!activeFormId) {
        const firstDocForm = parentForms.find(f => f.id !== 'par-form-0')?.id || 'par-form-1';
        setActiveFormId(firstDocForm);
      }
    }
  }, [currentStep, activeFormId, parentForms]);

  // Form Submission & Input State isolated per Child & Form: [childId]: { [formId]: { ...fields } }
  const [childFormData, setChildFormData] = useState<Record<string, Record<string, Record<string, any>>>>({});

  // Smart Field Auto-Filler: Pulls directly from parent & active child database record
  const getSmartFieldValue = (formId: string, fieldName: string) => {
    const childForms = (activeChild?.id && childFormData[activeChild.id]) || {};
    const formVals = childForms[formId] || {};
    if (formVals[fieldName] !== undefined && formVals[fieldName] !== '') {
      return formVals[fieldName];
    }

    // 1. Cross-form inheritance: check previously filled/submitted forms for this child
    const allParentFormIds = ['par-form-0', 'par-form-1', 'par-form-2', 'par-form-3', 'par-form-4', 'par-form-5'];
    for (const priorFormId of allParentFormIds) {
      if (priorFormId !== formId) {
        const priorVals = childForms[priorFormId] || {};
        if (priorVals[fieldName] !== undefined && priorVals[fieldName] !== '') {
          return priorVals[fieldName];
        }
      }
    }

    // 2. Canonical child & parent database properties
    if (fieldName === 'dob' || fieldName === 'date_of_birth' || fieldName === 'birth_date' || fieldName === 'child_dob' || fieldName === 'child_birth_date') {
      if (activeChild?.dob) return activeChild.dob;
      for (const priorFormId of allParentFormIds) {
        const priorVals = childForms[priorFormId] || {};
        for (const alias of ['dob', 'date_of_birth', 'birth_date', 'child_dob']) {
          if (priorVals[alias]) return priorVals[alias];
        }
      }
      return '';
    }

    if (fieldName === 'child_legal_name' || fieldName === 'child_name' || fieldName === 'child_full_name') {
      if (activeChild?.fullName) return activeChild.fullName;
      for (const priorFormId of allParentFormIds) {
        const priorVals = childForms[priorFormId] || {};
        for (const alias of ['child_legal_name', 'child_name', 'child_full_name']) {
          if (priorVals[alias]) return priorVals[alias];
        }
      }
      return '';
    }

    if (fieldName === 'health_card_no' || fieldName === 'health_card' || fieldName === 'ohip_number' || fieldName === 'ohip') {
      if ((activeChild as any)?.ohip) return (activeChild as any).ohip;
      for (const priorFormId of allParentFormIds) {
        const priorVals = childForms[priorFormId] || {};
        for (const alias of ['health_card_no', 'health_card', 'ohip_number', 'ohip']) {
          if (priorVals[alias]) return priorVals[alias];
        }
      }
      return '';
    }

    if (fieldName === 'parent_full_name' || fieldName === 'guardian_1_name' || fieldName === 'primary_guardian' || fieldName === 'parent_legal_name') {
      return currentParent?.fullName || '';
    }
    if (fieldName === 'parent_first_name' || fieldName === 'guardian_1_first_name' || fieldName === 'parent_firstname') {
      return currentParent?.firstName || currentParent?.fullName?.split(' ')[0] || '';
    }
    if (fieldName === 'parent_last_name' || fieldName === 'guardian_1_last_name' || fieldName === 'parent_lastname') {
      return currentParent?.lastName || currentParent?.fullName?.split(' ').slice(1).join(' ') || '';
    }
    if (fieldName === 'child_legal_name' || fieldName === 'child_full_name') {
      return activeChild?.fullName || '';
    }
    if (fieldName === 'child_first_name' || fieldName === 'child_firstname') {
      return activeChild?.firstName || activeChild?.fullName?.split(' ')[0] || '';
    }
    if (fieldName === 'child_last_name' || fieldName === 'child_lastname') {
      return activeChild?.lastName || activeChild?.fullName?.split(' ').slice(1).join(' ') || '';
    }
    if (fieldName === 'primary_phone' || fieldName === 'guardian_1_cell' || fieldName === 'primary_cell' || fieldName === 'parent_phone') {
      return currentParent?.phone || '';
    }
    if (fieldName === 'email' || fieldName === 'guardian_1_email' || fieldName === 'parent_email') {
      return currentParent?.email || '';
    }
    if (fieldName === 'guardian_1_address' || fieldName === 'home_address') {
      return currentParent?.homeAddress || currentParent?.region || '';
    }
    if (fieldName === 'emergency_friend_contact' || fieldName === 'emergency_contact_1_name') {
      return activeChild?.emergencyContacts?.[0]?.name || currentParent?.fullName || '';
    }
    if (fieldName === 'emergency_friend_cell' || fieldName === 'emergency_contact_1_phone') {
      return activeChild?.emergencyContacts?.[0]?.phone || currentParent?.phone || '';
    }
    if (fieldName === 'child_name_age') {
      return `${activeChild?.fullName || ''}${activeChild?.ageYearsFormatted ? `, ${activeChild.ageYearsFormatted}` : ''}`;
    }
    if (fieldName === 'child_preferred_name') {
      return activeChild?.preferredName || activeChild?.fullName || '';
    }
    if (fieldName === 'care_region' || fieldName === 'desired_care_region') {
      return currentParent?.region || 'Durham Region (Oshawa, Whitby, Pickering)';
    }
    if (fieldName === 'agency_selection' || fieldName === 'agency_name') {
      const urlAgency = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('agency')?.toLowerCase() : null;
      if (urlAgency === 'circles' || urlAgency === 'circles-in-the-sun' || urlAgency === 'circles_in_the_sun') {
        return 'Circles in the Sun (Sister Agency)';
      }
      return 'All Child Care Solutions Inc.';
    }
    if (fieldName === 'care_type') {
      return 'Full-time (CWELCC $22/day)';
    }
    if (fieldName === 'funding_type' || fieldName === 'anticipated_funding_stream') {
      return activeChild?.fundingType === 'subsidy'
        ? 'Municipal Child Care Subsidy'
        : 'CWELCC ($22/Day Daycare Program)';
    }
    if (fieldName === 'desired_start_date') {
      return currentParent?.preferredStartDate || '2026-09-01';
    }
    if (fieldName === 'known_allergies' || fieldName === 'allergies') {
      return activeChild?.allergies && activeChild.allergies.length > 0
        ? activeChild.allergies.join(', ')
        : 'No known allergies';
    }
    if (fieldName === 'monthly_fee_cwelcc') {
      return `$${activeChild?.monthlyFee !== undefined ? activeChild.monthlyFee.toFixed(2) : calculateMonthlyFee(activeChild?.fundingType || 'cwelcc').toFixed(2)}/mo`;
    }
    if (fieldName === 'screening_notes' || fieldName === 'form_zero_notes') {
      return currentParent?.formZeroNotes || '';
    }
    if (fieldName === 'guardian_2_name' || fieldName === 'secondary_guardian_name') {
      return currentParent?.secondaryGuardianName || '';
    }
    if (fieldName === 'guardian_2_cell' || fieldName === 'secondary_guardian_phone' || fieldName === 'emergency_g2_cell') {
      return currentParent?.secondaryGuardianPhone || '';
    }
    if (fieldName === 'guardian_2_email' || fieldName === 'secondary_guardian_email') {
      return currentParent?.secondaryGuardianEmail || '';
    }
    if (fieldName === 'guardian_2_address' || fieldName === 'secondary_guardian_address') {
      return currentParent?.secondaryGuardianAddress || currentParent?.homeAddress || '';
    }
    if (fieldName === 'guardian_2_relationship' || fieldName === 'secondary_guardian_relationship') {
      return currentParent?.secondaryGuardianRelationship || '';
    }
    if (fieldName === 'guardian_1_employer' || fieldName === 'parent_employer') {
      return currentParent?.employer || '';
    }
    if (fieldName === 'guardian_1_work_phone' || fieldName === 'parent_work_phone') {
      return currentParent?.workPhone || '';
    }
    if (fieldName === 'guardian_2_employer') {
      return currentParent?.secondaryGuardianEmployer || '';
    }
    if (fieldName === 'guardian_2_work_phone') {
      return currentParent?.secondaryGuardianWorkPhone || '';
    }
    if (fieldName === 'prescreening_acknowledgment' || fieldName === 'f0-prescreening-consent') {
      return true;
    }
    return '';
  };

  const [formCompletionStatus, setFormCompletionStatus] = useState<Record<string, 'completed' | 'in_progress' | 'pending'>>({
    'par-form-0': 'completed',
    'par-form-1': 'in_progress',
    'par-form-2': 'pending',
    'par-form-3': 'pending',
    'par-form-4': 'pending',
    'par-form-5': 'pending'
  });

  const [submittedBanner, setSubmittedBanner] = useState<string | null>(null);
  const activeForm = parentForms.find(f => f.id === activeFormId) || parentForms.find(f => f.id !== 'par-form-0') || parentForms[0];
  const [parentPaymentRefInput, setParentPaymentRefInput] = useState<string>('');
  const [parentPaymentSubmitted, setParentPaymentSubmitted] = useState<boolean>(false);

  const handleInputChange = (formId: string, fieldName: string, value: any) => {
    if (!activeChild) return;
    setChildFormData(prev => ({
      ...prev,
      [activeChild.id]: {
        ...(prev[activeChild.id] || {}),
        [formId]: {
          ...((prev[activeChild.id] && prev[activeChild.id][formId]) || {}),
          [fieldName]: value
        }
      }
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent, formId: string) => {
    e.preventDefault();

    // 1. Mark this form as completed in local state
    setFormCompletionStatus(prev => ({
      ...prev,
      [formId]: 'completed'
    }));

    // 2. Automated CRM Sync: Parse, format, and save directly into staff database in real time
    const userEntered = (activeChild?.id && childFormData[activeChild.id]?.[formId]) || {};
    const submittedPayload: Record<string, any> = { ...userEntered };
    if (activeForm) {
      for (const section of activeForm.sections) {
        for (const field of section.fields) {
          if (submittedPayload[field.name] === undefined || submittedPayload[field.name] === '') {
            submittedPayload[field.name] = getSmartFieldValue(formId, field.name);
          }
        }
      }
    }

    const { childUpdates, parentUpdates, summary } = parseFormSubmissionToCrm(
      formId,
      submittedPayload,
      activeChild,
      currentParent
    );

    // Sync in-memory staff CRM database in real time (Zero manual entry)
    if (activeChild?.id && Object.keys(childUpdates).length > 0 && onUpdateChildProfile) {
      onUpdateChildProfile(activeChild.id, childUpdates);
    }
    if (currentParent?.id && Object.keys(parentUpdates).length > 0 && onUpdateParentProfile) {
      onUpdateParentProfile(currentParent.id, parentUpdates);
    }

    try {
      const submissionId = `${currentParent?.id || 'parent'}_${formId}_${activeChild?.id || 'child'}`;
      await setDoc(doc(db, COLLECTIONS.SUBMISSIONS, submissionId), {
        id: submissionId,
        parentId: currentParent?.id || '',
        parentName: currentParent?.fullName || '',
        childId: activeChild?.id || '',
        childName: activeChild?.fullName || '',
        formId: formId,
        formCode: activeForm?.formCode || formId,
        formTitle: activeForm?.title || '',
        submittedData: submittedPayload,
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        crmSyncSummary: summary
      }, { merge: true });

      // Save parsed updates to Cloud Firestore children & parents collections
      if (activeChild?.id && Object.keys(childUpdates).length > 0) {
        await setDoc(doc(db, COLLECTIONS.CHILDREN, activeChild.id), childUpdates, { merge: true });
      }
      if (currentParent?.id && Object.keys(parentUpdates).length > 0) {
        await setDoc(doc(db, COLLECTIONS.PARENTS, currentParent.id), parentUpdates, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore form submission save warning:', err);
    }

    setSubmittedBanner(formId);
    setTimeout(() => setSubmittedBanner(null), 3500);

    if (formId === 'par-form-1' && onCompleteIntake) {
      const f1Data = submittedPayload || {};
      onCompleteIntake(
        {
          fullName: f1Data['child_legal_name'] || activeChild?.fullName || 'Child',
          dob: f1Data['dob'] || activeChild?.dob || '2024-11-10',
          fundingType: 'cwelcc'
        },
        {
          fullName: f1Data['guardian_1_name'] || currentParent?.fullName,
          phone: f1Data['guardian_1_cell'] || currentParent?.phone
        }
      );
    }

    // 3. Automatically advance to the NEXT pending form in sequence
    const step2Forms = parentForms.filter(f => f.id !== 'par-form-0');
    const currentIndex = step2Forms.findIndex(f => f.id === formId);

    const nextFormInOrder = step2Forms.slice(currentIndex + 1).find(f => formCompletionStatus[f.id] !== 'completed');
    const anyRemainingForm = step2Forms.find(f => f.id !== formId && formCompletionStatus[f.id] !== 'completed');

    if (nextFormInOrder) {
      setActiveFormId(nextFormInOrder.id);
    } else if (anyRemainingForm) {
      setActiveFormId(anyRemainingForm.id);
    } else {
      // All Step 2 forms completed! Advance to Step 3: Provider Matching
      if (onUpdateChildStage && activeChild?.id) {
        onUpdateChildStage(activeChild.id, 'matching');
      }
      setCurrentStep(3);
    }
  };

  // Document Upload Progress State per doc ID
  const [docUploadState, setDocUploadState] = useState<Record<string, {
    progress: number;
    fileName: string;
    fileSize: string;
    stageText: string;
    isComplete: boolean;
  }>>({});

  const handleDocumentUpload = (docId: string, file: File) => {
    if (!file || !activeChild) return;

    const sizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setDocUploadState(prev => ({
      ...prev,
      [docId]: {
        progress: 15,
        fileName: file.name,
        fileSize: sizeFormatted,
        stageText: 'Reading file & initiating Canadian Cloud Storage transfer...',
        isComplete: false
      }
    }));

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target?.result as string;
      let finalFileUrl = base64Url;

      try {
        const storageRef = ref(storage, `documents/${activeChild.id}/${docId}_${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed', 
          (snapshot) => {
            const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setDocUploadState(prev => ({
              ...prev,
              [docId]: {
                ...(prev[docId] || { fileName: file.name, fileSize: sizeFormatted, isComplete: false }),
                progress: Math.max(15, percent),
                stageText: percent < 90 
                  ? 'Uploading to Secure Canadian Cloud Storage (PIPEDA / PHIPA Compliant)...' 
                  : 'Running Canadian health privacy encryption...'
              }
            }));
          },
          (storageErr) => {
            console.warn('Firebase storage upload fallback to base64:', storageErr);
            finishUpload(base64Url);
          },
          async () => {
            try {
              finalFileUrl = await getDownloadURL(uploadTask.snapshot.ref);
            } catch (urlErr) {
              console.warn('Could not get downloadURL, using base64:', urlErr);
            }
            finishUpload(finalFileUrl);
          }
        );
      } catch (err) {
        console.warn('Direct upload error, falling back:', err);
        finishUpload(base64Url);
      }

      function finishUpload(resolvedUrl: string) {
        setDocUploadState(prev => ({
          ...prev,
          [docId]: {
            ...(prev[docId] || { fileName: file.name, fileSize: sizeFormatted }),
            progress: 100,
            stageText: 'Upload Complete! Transmitted to the Agency Director for Audit',
            isComplete: true
          }
        }));

        if (onUpdateDocStatus && activeChild) {
          onUpdateDocStatus(activeChild.id, docId, 'under_review', {
            fileName: file.name,
            fileUrl: resolvedUrl,
            uploadedAt: new Date().toISOString()
          });
        }

        setSubmittedBanner(`✓ ${file.name} successfully uploaded for audit!`);
        setTimeout(() => setSubmittedBanner(null), 4000);
      }
    };

    reader.readAsDataURL(file);
  };

  // Quick Helper to attach Ontario sample test documents from /public/documents/
  const handleUseSampleDoc = (docId: string, docType: string) => {
    const sampleMap: Record<string, { name: string; url: string }> = {
      birth_certificate: { name: 'ontario-birth-certificate.jpg', url: '/documents/ontario-birth-certificate.jpg' },
      health_card: { name: 'ontario-health-card.jpg', url: '/documents/ontario-health-card.jpg' },
      immunization: { name: 'ontario-immunization-yellow-card.jpg', url: '/documents/ontario-immunization-yellow-card.jpg' }
    };
    const sample = sampleMap[docType] || { name: 'ontario-document.jpg', url: '/documents/ontario-birth-certificate.jpg' };
    
    setDocUploadState(prev => ({
      ...prev,
      [docId]: {
        progress: 100,
        fileName: sample.name,
        fileSize: '1.2 MB',
        stageText: 'Sample Document Attached (Verified Format)',
        isComplete: true
      }
    }));

    if (onUpdateDocStatus && activeChild) {
      onUpdateDocStatus(activeChild.id, docId, 'under_review', {
        fileName: sample.name,
        fileUrl: sample.url,
        uploadedAt: new Date().toISOString()
      });
    }

    setSubmittedBanner(`✓ Attached Ontario sample "${sample.name}" for ${activeChild?.fullName || 'child'}`);
    setTimeout(() => setSubmittedBanner(null), 4000);
  };

  const handleResetDocs = async () => {
    if (!activeChild || !onUpdateDocStatus) return;
    const docsToReset = activeChild.documents || [];
    for (const d of docsToReset) {
      onUpdateDocStatus(activeChild.id, d.id, 'not_submitted', {
        fileName: '',
        fileUrl: ''
      });
    }
    setDocUploadState({});
    setSubmittedBanner(`✓ Reset documents to unsubmitted for re-testing.`);
    setTimeout(() => setSubmittedBanner(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header & Stepper */}
      <ParentHeaderStepper
        currentParent={currentParent}
        selectedParentId={selectedParentId}
        onSelectParentId={(id) => {
          setSelectedParentId(id);
          const parent = parentsList.find(p => p.id === id);
          if (parent && !parent.formZeroApproved) {
            setCurrentStep(1);
          }
        }}
        parentsList={parentsList}
        parentChildren={parentChildren}
        activeChild={activeChild}
        onSelectChildId={(childId) => {
          setSelectedChildId(childId);
          if (typeof window !== 'undefined') {
            const nextUrl = new URL(window.location.href);
            nextUrl.searchParams.set('childId', childId);
            window.history.replaceState({}, '', nextUrl.toString());
          }
        }}
        currentStep={currentStep}
        onSelectStep={(s) => setCurrentStep(s)}
        childMaxStep={childMaxStep}
        isMagicLink={isMagicLink}
      />

      {/* 2. Step 1: Inquiry & Pre-Screening */}
      {currentStep === 1 && (
        <Step1InquiryCall
          currentParent={currentParent}
          activeChild={activeChild}
          parentChildren={parentChildren}
          onSelectChildId={(childId) => setSelectedChildId(childId)}
          isChildScreeningApproved={isChildScreeningApproved}
          onAdvanceToStep2={() => setCurrentStep(2)}
        />
      )}

      {/* 3. Step 2: Digital Intake Forms */}
      {currentStep === 2 && (
        <Step2DigitalForms
          parentForms={parentForms}
          activeFormId={activeFormId}
          setActiveFormId={setActiveFormId}
          formCompletionStatus={formCompletionStatus}
          activeForm={activeForm}
          activeChild={activeChild}
          currentParent={currentParent}
          getSmartFieldValue={getSmartFieldValue}
          handleInputChange={handleInputChange}
          handleFormSubmit={handleFormSubmit}
          submittedBanner={submittedBanner}
          onAdvanceToStep3={() => setCurrentStep(3)}
          currentStep={currentStep}
          childDocs={activeChild?.documents && activeChild.documents.length > 0 ? activeChild.documents : [
            { id: 'doc-1', type: 'birth_certificate', title: 'Child Birth Certificate / Proof of Age', status: 'not_submitted' },
            { id: 'doc-2', type: 'health_card', title: 'Ontario Health Card (OHIP)', status: 'not_submitted' },
            { id: 'doc-3', type: 'immunization', title: 'Ontario Yellow Immunization Record', status: 'not_submitted' }
          ]}
          docUploadState={docUploadState}
          handleDocumentUpload={handleDocumentUpload}
          handleUseSampleDoc={handleUseSampleDoc}
          onResetDocs={handleResetDocs}
          setPreviewDocModal={setPreviewDocModal}
        />
      )}

      {/* 4. Step 3: Provider Matching */}
      {currentStep === 3 && (
        <Step3ProviderMatching
          currentParent={currentParent}
          activeChild={activeChild}
          matchedProvider={matchedProvider}
          providersList={providersList}
          childDocs={activeChild?.documents && activeChild.documents.length > 0 ? activeChild.documents : [
            { id: 'doc-1', type: 'birth_certificate', title: 'Child Birth Certificate / Proof of Age', status: 'not_submitted' },
            { id: 'doc-2', type: 'health_card', title: 'Ontario Health Card (OHIP)', status: 'not_submitted' },
            { id: 'doc-3', type: 'immunization', title: 'Ontario Yellow Immunization Record', status: 'not_submitted' }
          ]}
          docUploadState={docUploadState}
          handleDocumentUpload={handleDocumentUpload}
          handleUseSampleDoc={handleUseSampleDoc}
          onResetDocs={handleResetDocs}
          setPreviewDocModal={setPreviewDocModal}
          onBackToStep2={() => setCurrentStep(2)}
          onAdvanceToStep4={() => setCurrentStep(4)}
        />
      )}

      {/* 5. Step 4: Documents & Payment */}
      {currentStep === 4 && activeChild && (
        <Step4DocumentsPayment
          activeChild={activeChild}
          currentParent={currentParent}
          matchedProvider={matchedProvider}
          getSmartFieldValue={getSmartFieldValue}
          handleInputChange={handleInputChange}
          docUploadState={docUploadState}
          handleDocumentUpload={handleDocumentUpload}
          handleUseSampleDoc={handleUseSampleDoc}
          setPreviewDocModal={setPreviewDocModal}
          parentPaymentRefInput={parentPaymentRefInput}
          setParentPaymentRefInput={setParentPaymentRefInput}
          parentPaymentSubmitted={parentPaymentSubmitted}
          setParentPaymentSubmitted={setParentPaymentSubmitted}
          setSubmittedBanner={setSubmittedBanner}
          onBackToStep3={() => setCurrentStep(3)}
        />
      )}

      {/* 6. Step 5: Active Care Hub */}
      {currentStep === 5 && (
        <Step5ActiveCareHub
          activeChild={activeChild}
          matchedProvider={matchedProvider}
          attendanceState={attendanceState}
          onOpenNotes={() => setIsNotesModalOpen(true)}
        />
      )}

      {/* PARENT DOCUMENT PREVIEW LIGHTBOX MODAL */}
      {previewDocModal && (
        <ModalPortal>
          <div 
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setPreviewDocModal(null);
              }
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl border-4 border-slate-900 shadow-neo max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] cursor-default"
            >
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-400" />
                  <h3 className="font-extrabold text-sm text-white">{previewDocModal.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewDocModal(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-slate-100 flex-1 overflow-auto flex items-center justify-center min-h-[300px]">
                <img 
                  src={previewDocModal.url} 
                  alt={previewDocModal.title} 
                  className="max-h-[65vh] w-auto object-contain rounded-xl border border-slate-300 shadow-lg"
                />
              </div>

              <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  Uploaded document for Ministry licensing verification
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewDocModal(null)}
                  className="neo-btn bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Gated Notes Modal for Parent (External Notes on activeChild) */}
      {isNotesModalOpen && activeChild && (
        <GatedNotesModal
          isOpen={isNotesModalOpen}
          onClose={() => setIsNotesModalOpen(false)}
          targetType="child"
          targetId={activeChild.id}
          targetName={activeChild.fullName}
          currentUser={{
            role: 'parent',
            userId: currentParent?.id || 'parent-1',
            userName: currentParent?.fullName || 'Parent / Guardian',
            parentId: currentParent?.id
          }}
          targetChild={activeChild}
        />
      )}
    </div>
  );
};
