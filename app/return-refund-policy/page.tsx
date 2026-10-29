import { InfoPage } from "@/components/info-page";
import { pageMetadata } from "@/lib/site-content";

export const revalidate = 15;
export const metadata = pageMetadata("/return-refund-policy");
export default function ReturnRefundPolicyPage() {
  return <InfoPage path="/return-refund-policy" />;
}
