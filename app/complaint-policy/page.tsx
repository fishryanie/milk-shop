import { InfoPage } from "@/components/info-page";
import { pageMetadata } from "@/lib/site-content";

export const revalidate = 15;
export const metadata = pageMetadata("/complaint-policy");
export default function ComplaintPolicyPage() {
  return <InfoPage path="/complaint-policy" />;
}
