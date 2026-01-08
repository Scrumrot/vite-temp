import { Page } from "@/components/Page.tsx";
import { NavConfigBuilder } from "@/features/nav-config-builder";

export function NavBuilderPage() {
    return (<Page title={'Nav Config Builder'}>
      <NavConfigBuilder/>
    </Page>)
}
