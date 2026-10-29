import { InfoPage } from "@/components/info-page";
import { pageMetadata } from "@/lib/site-content";

export const revalidate = 15;
export const metadata = pageMetadata("/shipping-policy");
export default function ShippingPolicyPage() {
  return <InfoPage path="/shipping-policy" />;
}
