import { homepageSections } from "@/lib/site-content";

export function HomepageDetails() {
  return (
    <section
      aria-label="Tìm hiểu Cái Tiệm Sữa"
      className="mx-auto max-w-[1440px] px-[5.5vw] pb-[60px] mobile:px-4 mobile:pb-8"
    >
      <div className="grid gap-7 md:grid-cols-3">
        {homepageSections.map((section) => (
          <div key={section.heading}>
            <h2 className="font-serif text-xl font-normal text-ink">
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-3 text-xs leading-[1.9] text-muted"
              >
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
