import { FormTemplate } from '../types/formSchema';
import { INITIAL_PARENT_FORMS } from './parentFormsData';
import { INITIAL_PROVIDER_FORMS } from './providerFormsData';
import { INITIAL_HOME_VISITOR_FORMS } from './homeVisitorFormsData';
import { INITIAL_SUPPLEMENTAL_FORMS } from './supplementalFormsData';

export const ALL_INITIAL_FORMS: FormTemplate[] = [
  ...INITIAL_PARENT_FORMS,
  ...INITIAL_PROVIDER_FORMS,
  ...INITIAL_HOME_VISITOR_FORMS,
  ...INITIAL_SUPPLEMENTAL_FORMS
];
