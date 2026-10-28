import { InfoPage } from "@/components/info-page";
import { pageMetadata } from "@/lib/site-content";

export const revalidate = 15;
export const metadata = pageMetadata("/banh-flan");

export default function FlanPage() {
  return <InfoPage path="/banh-flan" />;
}
