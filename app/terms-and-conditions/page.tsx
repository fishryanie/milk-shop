import { InfoPage } from "@/components/info-page";
import { pageMetadata } from "@/lib/site-content";

export const revalidate = 15;
export const metadata = pageMetadata("/terms-and-conditions");
export default function TermsPage() {
  return <InfoPage path="/terms-and-conditions" />;
}
