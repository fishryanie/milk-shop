import { InfoPage } from "@/components/info-page";
import { pageMetadata } from "@/lib/site-content";

export const revalidate = 15;
export const metadata = pageMetadata("/privacy");
export default function PrivacyPage() {
  return <InfoPage path="/privacy" />;
}
