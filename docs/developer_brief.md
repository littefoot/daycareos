**FUNCTIONAL REQUIREMENTS BRIEF**

# **Home Child Care Admissions & Registration Platform**

## *Developer handoff for the initial build, with forms to be supplied separately*

| Document status | Working requirements brief \- ready for technical discovery and estimation |
| :---- | :---- |
| **Prepared for** | Home-based child care agency operating in Ontario, Canada |
| **Version date** | August 7, 2026 |
| **Important constraint** | Current PDFs and Jotforms are being revised and will be provided later as the source material for form configuration. |
| **Build-now decision:** Development may begin without the final forms. The platform foundation, workflow, permissions, dashboards, document handling, notifications, and configurable form engine can be built now. Final field mapping and form wording remain a later configuration and validation step. |  |

# **1\. Purpose and Desired Outcome**

The agency needs a secure, mobile-friendly admissions platform that manages a family from first inquiry through screening, provider matching, registration, final approval, enrolment, and eventual withdrawal or service expiry. It must replace fragmented follow-up across phone calls, email, PDFs, and Jotform with one traceable workflow and one structured database record.

The platform is not merely a collection of online forms. It is an admissions case-management system in which forms, documents, communication, decisions, tasks, and placement information are connected to the same child application.

## **Primary goals**

1. Give families a simple intake and registration experience on phones and computers.  
2. Give staff a shared admissions dashboard and clear next actions.  
3. Track provider availability and help staff identify appropriate possible matches.  
4. Store structured enrolment data so staff can search, filter, report, and avoid retyping information.  
5. Preserve signed forms and supporting documents as controlled records.  
6. Support private-pay and municipal subsidy pathways, including pending approvals and exceptions.  
7. Allow the agency to change questions, workflow rules, reminders, and chatbot handoff behaviour without a software rebuild.

## **Out of scope for final configuration at this stage**

8. Final wording, order, validation, and legal text for every registration form.  
9. Final visual recreation of the agency's PDFs and Jotforms.  
10. Field-by-field migration mapping from legacy forms.  
11. Full attendance, payroll, and billing-system design beyond creating the enrolled child record and the required handoff points.

These items are deferred, not removed. The developer should provide a clear configuration and testing process for adding them later.

# **2\. Users and Access**

| User | Initial responsibilities | Access principle |
| :---- | :---- | :---- |
| Parent/guardian applicant | Complete one child application, upload documents, sign, receive messages, download completed records. | Initially, the person who starts the application is the primary portal user and signer. |
| Agency administrator | Create leads, call families, manage documents, send packages, update statuses, match providers, communicate, review. | Access granted by the agency director. |
| Home visitor | Review assigned cases, contribute notes, assess matching and readiness, complete authorized approvals. | Only assigned or permitted records. |
| Agency director | Full oversight, final approval, permissions, exceptions, settings, reports, audit review. | Highest level; may delegate access. |
| Child care provider | Review only the care requirements and records specifically released for a proposed or confirmed placement. | No access to unrelated families or unnecessary sensitive documents. |
| Chatbot | Collect brief prescreening information and create a lead. | No access to full child records; no automated admission or rejection decisions. |

## **Permission requirements**

12. Role-based permissions with optional case assignment and per-feature controls.  
13. The director can grant or revoke access and choose which roles can review, approve, override, export, or download sensitive records.  
14. Sensitive medical, immunization, health card, custody, and identification information must support narrower permissions.  
15. Every view, edit, approval, override, status change, signature, upload, replacement, and download of sensitive records should be auditable.  
16. Future-ready design for a second parent/guardian, additional approved guardians, separate signatures, and custody-based restrictions.

# **3\. End-to-End Admissions Workflow**

| Core flow: Inquiry \-\> chatbot/basic intake \-\> staff screening call \-\> provider search \-\> preliminary match \-\> initial documents \-\> agency approval to release registration package \-\> complete package \-\> review and approvals \-\> placement secured \-\> orientation/break-in plan \-\> enrolled child record. |
| :---- |

## **Stage 1 \- Inquiry and lead creation**

Families may enter through the agency website, online inquiry or registration form, telephone, email, or a provider/agency referral. Staff must be able to manually create a lead when the inquiry did not originate online.

17. Record source, inquiry date/time, primary contact, preferred communication method, region, and assigned staff member.  
18. Detect possible duplicate families or children while allowing staff to confirm whether they are truly duplicates.  
19. Create the initial task: screening call required.  
20. Allow staff to log telephone calls, outcomes, notes, next action, and follow-up date.

## **Stage 2 \- Chatbot prescreening**

The chatbot asks brief, low-risk questions, creates a lead, confirms what happens next, and transfers the family to staff. The agency must be able to change the handoff method later.

### **Recommended basic questions**

21. Parent/guardian name and contact details.  
22. Where care is needed: Durham Region, York Region, Toronto, or another configured service area; collect postal code or general location only as needed.  
23. Child age/date of birth, desired start date, and expected length of care.  
24. Required days and daily arrival/departure hours.  
25. Private pay, subsidy approved, subsidy pending, or unsure.  
26. School pickup/drop-off or transportation requirements.  
27. A high-level prompt asking whether staff should discuss allergies, medical needs, accessibility needs, or other supports. Detailed sensitive information belongs in the secure portal or staff call.  
28. Preferred follow-up: email, text, or telephone.

### **Chatbot behaviour**

29. Handoff occurs after the basic questions are answered; timing and method are configurable.  
30. Immediately offer a human when requested or when the question is outside the approved answer library.  
31. Display an emergency/safeguarding instruction instead of attempting to manage urgent concerns.  
32. Do not promise a space, determine eligibility, make medical judgments, or reject an applicant.  
33. Show privacy notice/consent before collecting personal information and avoid collecting documents in the chat.  
34. Store transcripts or summaries only under agency-approved retention and consent settings.

## **Stage 3 \- Staff screening call**

Agency staff call the parent to clarify requirements. The screening checklist must be configurable because questions may change over time.

35. Confirm parent and child details, home/work location, desired region and travel radius.  
36. Confirm days, arrival/departure hours, desired start date, and duration of care.  
37. Confirm private-pay or subsidy situation, including municipality and pending status.  
38. Discuss allergies, medical conditions, dietary needs, accessibility requirements, developmental or other special supports.  
39. Discuss transportation, school pickup/drop-off, language, cultural considerations, routines, comfort needs, behaviours, and support strategies.  
40. Record staff notes, family priorities, required follow-up, and consent to proceed with matching.

| Fair matching safeguard: Medical needs, disabilities, or special supports must not be used by the chatbot to automatically reject a child. “Temperament” should be documented as routines, behaviours, comfort needs, and required supports. Provider group balance and the ability to meet needs safely remain staff-reviewed matching considerations. |
| :---- |

## **Stage 4 \- Provider availability and possible match**

Staff search for possible spaces in the requested region or a nearby area. Matching is decision support, not an automatic placement decision.

### **Provider-space information required**

41. Provider/home, region, service area, approximate location, travel distance, and schools served.  
42. Open days/hours, available start date, planned absences, and whether transportation is offered.  
43. Current group composition by age category and available capacity.  
44. Provider preferences/restrictions and ability to support specific routines or needs.  
45. Current proposed matches that may temporarily hold capacity.  
46. Staff notes and reason a provider was suggested or ruled out.

### **Match approval sequence**

47. Staff discusses the possible provider with the parent and sends an approved provider profile.  
48. The provider reviews the family's care requirements using only the information authorized and necessary at that stage.  
49. Parent and child visit the provider's home.  
50. Parent and provider record acceptance or concerns.  
51. Agency gives final permission to proceed to initial-document and registration stages.

## **Stage 5 \- No suitable space**

52. Add the family to the appropriate regional waitlist while keeping the lead open.  
53. Offer nearby regions/providers at agency discretion and record what was offered.  
54. Notify the family that no suitable current space is available without closing the lead automatically.  
55. Schedule automatic reminders and staff follow-up tasks.  
56. Record family availability changes and reassess the match later.  
57. Allow discretionary assistance with a required note and responsible staff member.

## **Stage 6 \- Preliminary documents**

After the agency gives the go-ahead, the parent is asked to submit the initial documents required before the full registration package is released:

58. Child birth certificate  
59. Health card  
60. Immunization form/record

Each document requires its own status: Not submitted, Under review, Accepted, Rejected, or Replacement requested.

61. Authorized staff can accept or reject each item and include a reason or clarification request.  
62. The parent sees a missing-items checklist and can replace a rejected file.  
63. Automatic email/text reminders are scheduled according to configurable rules.  
64. The application pauses until required items are accepted or an authorized exception is recorded.

## **Stage 7 \- Release and completion of the full registration package**

An authorized staff member selects “Approve and Send Registration Package.” The system records who released it and when, then sends secure portal access to the applicant.

### **Parent experience**

65. Mobile-friendly secure portal and online forms.  
66. Save and return later, with clear progress and missing-items indicators.  
67. Upload supporting documents and electronically sign required agreements.  
68. Reuse previously entered information so the parent does not repeatedly type the same data.  
69. Review before submission and download/receive a copy of completed signed records.  
70. Initially, each child has a separate application and the person who starts it is the primary signer.

### **Database and signed-record rule**

Form responses must populate structured database fields. At signature/submission, the system creates an immutable or tamper-evident PDF snapshot containing the applicable form version, responses, signature evidence, and timestamp. Staff corrections after signature must be tracked and, when material, require re-acknowledgement or re-signature.

## **Stage 8 \- Review, conditions, and final approval**

Agency administrators, home visitors, the director, and other specifically authorized staff may review according to permissions. The director controls who can provide final approval.

71. Required documents uploaded and accepted.  
72. All applicable registration forms complete.  
73. Parent agreement signed.  
74. Deposit or registration fee recorded as paid, waived, not applicable, or pending.  
75. Subsidy placement confirmed, or an authorized pending/exception arrangement recorded.  
76. Provider and agency agreements completed where applicable.  
77. Provider match and start arrangements approved.

Final approval is blocked when a required condition is incomplete unless an authorized person records an exception, reason, date, and any expiry/condition.

## **Stage 9 \- Placement secured and pre-start activation**

78. Send acceptance and confirmed start-date communication to the family.  
79. Notify the assigned provider with the approved placement details.  
80. Create the active child/enrolment record without re-entry.  
81. Provide policies and orientation information.  
82. Schedule orientation, first-day visit, and optional gradual break-in visits.  
83. Allow staff to add, remove, reschedule, complete, or waive onboarding tasks with notes.  
84. Create required handoffs for attendance and billing setup.  
85. Continue reminders for any approved outstanding condition.

## **Stage 10 \- Withdrawal, transfer, and service expiry**

The first release must record enrolment and support a withdrawal/service-end date. Subsidized placements must also support subsidy authorization and service-expiry dates, reminders before expiry, and renewal/extension history.

86. Record notice date, last day of service, reason, initiator, and responsible staff member.  
87. Preserve the historical application and signed documents after closure according to approved retention rules.  
88. Future-ready support for provider transfers, re-enrolment, expired applications, declined applications, and unable-to-contact outcomes.

# **4\. Status Model**

Process status and final outcome must be separate fields. This allows the dashboard to show what needs to happen next without confusing it with how the case ultimately ended.

| Type | MVP values | Future-ready values |
| :---- | :---- | :---- |
| Process status | New inquiry; Screening call required; Searching for provider; Waitlisted; Initial documents required; Registration package sent; Under review; Approved; Enrolled. | Awaiting family response; Visit scheduled; Corrections required; Orientation pending; On hold; other configurable statuses. |
| Outcome | Enrolled; Withdrawn/closed; Service expired. | Parent withdrew; Agency declined; Unable to contact; Transferred; Registration expired/inactive. |
| Funding status | Private pay; Subsidy approved; Subsidy pending; Agency-approved exception/special arrangement. | Additional funding programs or agency-defined values. |

# **5\. Dashboard and Work Management**

## **Admissions dashboard \- confirmed initial widgets**

89. New leads awaiting screening calls.  
90. Applications grouped by current status.  
91. Missing, rejected, or replacement-requested documents.  
92. Families waiting for a provider match.  
93. Regional waitlists.  
94. Upcoming start dates and orientations.

## **Recommended supporting controls**

95. Filters for region, assigned staff, provider, status, funding route, start date, overdue items, and communication preference.  
96. Task owner, due date, priority, notes, completion status, and escalation.  
97. Saved views and exports based on the user's permissions.  
98. A complete case timeline containing calls, email/text events, document decisions, status changes, meetings, approvals, and notes.  
99. Clear alerts for duplicate records, upcoming subsidy expiry, stalled applications, and unconfirmed start conditions.

# **6\. Communication and Notifications**

100. Support email and text notifications; telephone remains a staff task and logged communication method.  
101. Templates are editable by authorized staff and can vary by workflow event or region.  
102. Families should not receive sensitive documents or full records as ordinary email/text attachments; messages should link to the secure portal when appropriate.  
103. Record delivery status when available and permit staff to resend or switch contact method.  
104. Respect communication consent, opt-out rules, preferred language when added later, and quiet hours/configuration.

## **Minimum automated events**

105. Lead received and staff follow-up expected.  
106. Screening call or provider-home visit scheduled/reminder.  
107. No current space and waitlist follow-up.  
108. Initial documents requested, missing, rejected, or accepted.  
109. Registration package released, incomplete, returned for correction, or approved.  
110. Placement acceptance, orientation, break-in visit, and start-date reminder.  
111. Upcoming subsidy/service-expiry date and required renewal action.

# **7\. Core Data Model**

The developer may choose the technology, but the database should represent the following concepts separately so the system can evolve without duplicating or overwriting history.

| Entity | Purpose / key data |
| :---- | :---- |
| Household / family | Shared contact and address information; future parent/guardian and sibling relationships. |
| Adult / guardian | Identity, contact methods, relationship, portal access, signature authority, communication consent. |
| Child | Identity, care needs, medical/support flags, authorized relationships; reusable across enrolment history. |
| Lead / application | Inquiry source, region, care requirements, status, outcome, assigned staff, timestamps. |
| Screening | Configurable questions, responses, call notes, follow-up and consent. |
| Provider / home | Service region, location, schedule, schools, transportation, preferences, permissions. |
| Capacity / vacancy | Age-group capacity, current occupancy, holds, openings, effective dates, group composition. |
| Match candidate | Child application, provider, reason, status, visit, parent/provider decisions, agency approval. |
| Document | Document type, application, version, status, storage reference, reviewer, decision, replacement chain. |
| Form template/version | Questions, validation, consent language, effective dates, mappings, signature rules. |
| Form submission | Responses, submission version, signature evidence, PDF snapshot, corrections/re-signature history. |
| Funding / subsidy | Route, municipality, approval/pending status, effective date, expiry date, renewal history. |
| Enrolment / placement | Child, provider, start/end dates, schedule, status, reason, transfer history. |
| Task / appointment | Owner, due date, type, related application, reminders, completion/waiver evidence. |
| Communication | Channel, sender/recipient, template, outcome, time, consent, linked case. |
| Audit event | Actor, action, record, timestamp, old/new values, security context where appropriate. |

# **8\. Forms Supplied Separately \- Required Architecture**

| Do not hard-code today's forms: The PDFs and Jotforms are mixed and being revised. The developer should build a configurable form and mapping layer, then add the final forms after the agency approves their content. |
| :---- |

## **Form engine requirements**

112. Agency-authorized users can create, copy, revise, publish, retire, and preview form templates.  
113. Support text, dates, times, addresses, phone/email, single/multiple choice, yes/no, repeating child schedules, uploads, acknowledgements, conditional sections, and electronic signatures.  
114. Conditional logic can show or require fields based on age, funding route, health/support answers, region, or other approved rules.  
115. Each published version is frozen. Existing signed submissions remain attached to the exact wording/version signed.  
116. Common data fields are mapped to the database and can prefill later forms; form-specific answers remain available without polluting core records.  
117. Updates to a form do not silently change completed submissions.  
118. Generate a readable final PDF matching the approved structure closely enough for agency use and recordkeeping.  
119. Provide a migration/import path for approved Jotform response data if the agency later requests it.

## **Later form-onboarding process**

120. Agency provides physical forms, PDFs, Jotform exports/links, and desired changes.  
121. Developer creates a form inventory and identifies duplicates, obsolete questions, conditional questions, signatures, and supporting documents.  
122. Agency approves a canonical field dictionary and the final wording/order for each form.  
123. Developer configures the forms, mappings, validation, PDF output, permissions, and workflow triggers.  
124. Agency tests sample cases: private pay, subsidy approved, subsidy pending, siblings, missing documents, replacement documents, special supports, waitlist, and withdrawal.  
125. Approved forms are versioned and published; old versions remain retrievable for prior submissions.

# **9\. Security, Privacy, and Record Integrity**

The platform will hold information about children, guardians, medical needs, identification, subsidy, and provider locations. Security and privacy requirements must be treated as core product requirements. The developer should document the chosen hosting location, subprocessors, AI/data flows, access controls, encryption, backups, breach response, deletion, and retention implementation for agency review.

126. Encryption in transit and at rest; secrets stored outside source code.  
127. Secure authentication, password reset, session controls, and multi-factor authentication for staff where practical.  
128. Least-privilege role-based access and explicit protection for health card, medical, immunization, custody, identity, and provider-home information.  
129. Malware/file-type/size checks for uploads, secure download links, and prevention of public document URLs.  
130. Complete audit trail and tamper-evident signed-record snapshots.  
131. Backups, tested restoration, environment separation, logging, monitoring, and incident-handling procedures.  
132. Configurable retention, legal hold where required, secure deletion/anonymization, and export of a family's records when authorized.  
133. Accessibility and mobile usability, including keyboard access, readable errors, and clear consent/signature screens.

| Ontario review required: Before launch, the agency should have the final workflows, notices, consents, records schedule, subsidy requirements, and AI/chatbot use reviewed against applicable Ontario childcare, privacy, accessibility, electronic-signature, and municipal requirements. This brief defines operational needs and is not legal advice. |
| :---- |

## **AI/chatbot implementation guardrails**

134. Do not send full applications, documents, health card details, medical records, or provider-home addresses to an AI model unless the agency has explicitly approved the vendor, terms, hosting/data route, purpose, consent, and retention settings.  
135. Prefer a scripted/structured intake flow for required questions; use AI only for friendly explanation and approved FAQ answers.  
136. Maintain an editable approved knowledge base and a clear “I am not sure \- let me connect you with staff” response.  
137. The agency must be able to disable the chatbot or change its handoff method without affecting the registration portal.  
138. Keep the AI integration vendor-neutral so DeepSeek, Kimi, or another service can be evaluated or replaced later.

# **10\. MVP and Future Phases**

| Build first (MVP) | Prepare architecture now / enable later |
| :---- | :---- |
| Separate application per child; one primary applicant/signer. | One household account, shared sibling data, multiple guardians and signatures. |
| Website/phone/email/referral lead creation and configurable basic chatbot intake. | Additional inquiry channels, languages, live staff handoff and advanced FAQ. |
| Screening, matching, regional waitlists and provider vacancy records. | Advanced capacity projections, automated match suggestions, transfers. |
| Initial document review and controlled release of registration package. | Expanded document types and external verification integrations. |
| Configurable forms, e-signature, structured data, signed PDF snapshots. | Legacy Jotform migration and further form automation. |
| Email/text notices plus logged phone-call tasks. | Two-way messaging and expanded notification preferences. |
| Private pay, subsidy approved/pending, exception; subsidy/service expiry. | Additional funding programs, renewal automation and municipal integrations. |
| Enrolled, withdrawn/closed, service expired outcomes. | Declined, unable to contact, transferred, expired/inactive and re-enrolment outcomes. |

# **11\. Minimum Acceptance Criteria**

139. A staff member can create a lead from a phone, email, or referral inquiry and see it on the dashboard.  
140. A family can complete basic online intake on a phone, choose follow-up method, and receive confirmation.  
141. Staff can conduct and record screening, search/filter provider vacancies, create a proposed match, and record parent/provider/agency decisions.  
142. A family with no suitable match can be waitlisted by region without losing the active lead or follow-up history.  
143. Staff can request birth certificate, health card, and immunization documents; review each separately; request replacements; and trigger reminders.  
144. Only authorized staff can release the full registration package after prerequisites are satisfied or a documented exception is approved.  
145. The applicant can save, resume, upload, sign, submit, and download a complete package from a mobile-friendly secure portal.  
146. Structured answers populate the database and a version-specific signed PDF snapshot is preserved.  
147. Authorized reviewers can approve the case, record funding/deposit/agreement conditions, and prevent premature enrolment.  
148. Approval creates an active enrolment, notifies the family/provider, and creates orientation, break-in, attendance, and billing setup tasks.  
149. The system records withdrawal/last-service dates and subsidy/service-expiry dates with reminders and history.  
150. Permissions prevent unauthorized access, and the audit log shows material actions and overrides.  
151. Changing a form or chatbot handoff rule does not require rewriting the admissions workflow or losing historical submissions.

# **12\. Developer Discovery and Delivery Expectations**

## **Developer should return**

152. Proposed architecture and technology stack, including hosting, database, file storage, authentication, e-signature, messaging, AI integration boundary, and backups.  
153. Data model/entity diagram and API/integration plan.  
154. Wireframes for family intake, parent portal, staff dashboard, application review, provider vacancy/matching, and settings.  
155. MVP backlog, milestones, estimate, assumptions, exclusions, testing plan, training plan, and ongoing support/maintenance terms.  
156. A forms-later implementation plan showing exactly how physical forms, PDFs, and Jotforms will be inventoried, mapped, configured, approved, and versioned.  
157. Security/privacy design summary and list of all external vendors/subprocessors, including any AI service.  
158. Data ownership, export, backup, source-code ownership/access, documentation, and handover plan.

## **Questions the developer must confirm before implementation**

159. Which agency brand/domain will host the portal, and will it integrate with the existing WordPress site or run as a linked standalone application?  
160. Which staff roles can provide final approval, view medical/identity records, make overrides, and export data?  
161. Which SMS/email vendors, e-signature method, payment method, and hosting region are acceptable?  
162. What exact provider capacity rules and required occupancy calculations must be enforced at launch?  
163. What records must be shared with a proposed provider versus only after confirmed placement?  
164. What registration fee/deposit rules, refunds, exemptions, and subsidy confirmation evidence apply?  
165. What retention periods and municipal subsidy reporting requirements apply to each record type?  
166. Which reports/exports are required for day-one operations?  
167. What service-level expectations apply to uptime, backups, support response, and security incidents?

# **13\. Immediate Next Steps**

168. Agency sends this brief to the developer for discovery, feasibility review, questions, and a phased estimate.  
169. Developer confirms the proposed MVP foundation can be built without locking the agency into the current PDFs or Jotforms.  
170. Agency and developer confirm the open decisions listed above and approve wireframes and data model.  
171. Developer builds the admissions foundation and a sample configurable form using placeholder content.  
172. Agency revises and physically supplies the final forms when ready.  
173. Forms are inventoried, mapped, configured, tested, approved, versioned, and published before production launch.

| Instruction to developer: Please identify any requirement that you interpret differently, any item that materially changes cost or schedule, and any security/privacy dependency before coding. Do not assume that the current Jotform or PDF structure is final. |
| :---- |

