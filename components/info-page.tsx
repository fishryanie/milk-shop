import { pageCatalog } from "@/lib/catalog";
import Link from "next/link";
import {
  infoSections,
  pageDefinitions,
  type InfoPath,
} from "@/lib/site-content";

export async function InfoPage({ path }: { path: InfoPath }) {
  const { settings } = await pageCatalog();
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 mobile:px-4 mobile:py-6">
      <Link
        href="/"
        prefetch={false}
        className="text-sm font-semibold text-blue"
      >
        ← Cái Tiệm Sữa · Xem thực đơn
      </Link>
      <article className="mt-8">
        <h1 className="font-serif text-4xl font-normal tracking-tight mobile:text-3xl">
          {pageDefinitions[path].title}
        </h1>
        {path === "/contact" && (
          <p className="mt-5 flex flex-wrap gap-5 text-blue">
            <a href={`tel:${settings.phone}`} className="underline">
              Gọi {settings.phone}
            </a>
            <a
              href="https://www.google.com/maps/search/?api=1&query=10.852523902605594%2C106.66730207366463"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Xem bản đồ
            </a>
          </p>
        )}
        {infoSections(path, settings).map((section) => (
          <section key={section.heading} className="mt-8">
            <h2 className="font-serif text-2xl font-normal text-blue-dark">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-4 leading-8 text-muted">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </article>
      <nav
        aria-label="Thông tin về tiệm"
        className="mt-10 flex flex-wrap gap-5 border-t border-line pt-6 text-sm text-blue"
      >
        <Link href="/about" prefetch={false}>
          Giới thiệu
        </Link>
        <Link href="/contact" prefetch={false}>
          Liên hệ
        </Link>
        <Link href="/privacy" prefetch={false}>
          Quyền riêng tư
        </Link>
      </nav>
    </main>
  );
}
