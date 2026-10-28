import { InfoPage } from "@/components/info-page";
import { pageMetadata } from "@/lib/site-content";

export const revalidate = 15;
export const metadata = pageMetadata("/about");
export default function AboutPage() {
  return <InfoPage path="/about" />;
}
