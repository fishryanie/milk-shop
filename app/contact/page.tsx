import { InfoPage } from "@/components/info-page";
import { pageMetadata } from "@/lib/site-content";

export const revalidate = 15;
export const metadata = pageMetadata("/contact");
export default function ContactPage() {
  return <InfoPage path="/contact" />;
}
