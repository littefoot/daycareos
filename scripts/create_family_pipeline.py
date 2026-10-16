with open('src/components/admin/AdmissionsPipeline.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("from '../../types'", "from '../../../types'")
content = content.replace("from '../common/Avatar'", "from '../../common/Avatar'")
content = content.replace("export const AdmissionsPipeline:", "export const FamilyIntakePipeline:")
content = content.replace("interface AdmissionsPipelineProps", "export interface FamilyIntakePipelineProps")
content = content.replace("AdmissionsPipelineProps", "FamilyIntakePipelineProps")
content += '\n\nexport const AdmissionsPipeline = FamilyIntakePipeline;\n'

with open('src/components/admin/pipelines/FamilyIntakePipeline.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully written src/components/admin/pipelines/FamilyIntakePipeline.tsx")
