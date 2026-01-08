import { Page } from "@/components/Page.tsx";
import { FormBuilderWizard } from "@/features/form-builder-wizard";


export function FormBuilderPage() {
  return (<Page title={'Form Builder'}>
    <FormBuilderWizard/>
  </Page>)
}
