import { InfoPage } from "@/components/info-page";
import { pageMetadata } from "@/lib/site-content";

export const revalidate = 15;
export const metadata = pageMetadata("/sua-tuoi");

export default function FreshMilkPage() {
  return <InfoPage path="/sua-tuoi" />;
}
