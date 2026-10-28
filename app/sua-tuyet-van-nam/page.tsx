import { InfoPage } from "@/components/info-page";
import { pageMetadata } from "@/lib/site-content";

export const revalidate = 15;
export const metadata = pageMetadata("/sua-tuyet-van-nam");

export default function SnowMilkPage() {
  return <InfoPage path="/sua-tuyet-van-nam" />;
}
