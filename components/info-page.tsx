import { pageCatalog } from "@/lib/catalog";
import Link from "next/link";
import {
  infoSections,
  pageDefinitions,
  productCollectionSchema,
  productPageLinks,
  productsForPage,
  serializeJsonLd,
  type InfoPath,
} from "@/lib/site-content";
import { money } from "@/shared/commerce/types";
import { ProductImage } from "./product-image";
import { PolicyLinks } from "./policy-links";
import { policyNavigationLinks } from "@/lib/policy-links";
import { POLICY_UPDATED } from "@/lib/policies";
import { sellerProfile } from "@/lib/seller-profile";

export async function InfoPage({ path }: { path: InfoPath }) {
  const catalog = await pageCatalog();
  const { settings } = catalog;
  const productPage = productPageLinks.find((page) => page.path === path);
  const products = productsForPage(path, catalog.products);
  const seller = sellerProfile(process.env);
  const sections = infoSections(path, settings, seller);
  const isPolicy = policyNavigationLinks.some((page) => page.path === path);
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 mobile:px-4 mobile:py-6">
      {productPage && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(
              productCollectionSchema(productPage.path, products),
            ),
          }}
        />
      )}
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
        {isPolicy && (
          <>
            <p className="mt-4 leading-7 text-muted">{pageDefinitions[path].description}</p>
            <p className="mt-3 text-xs text-muted">
              Cập nhật: <time dateTime={POLICY_UPDATED}>29/10/2026</time>
            </p>
            <nav aria-label="Mục lục" className="mt-6 rounded-xl border border-line bg-blue-light/40 p-5">
              <p className="text-sm font-semibold text-blue-dark">Nội dung trang</p>
              <ol className="mt-2 space-y-1 text-sm leading-6 text-blue">
                {sections.map((section, index) => (
                  <li key={section.heading}>
                    <a href={`#section-${index + 1}`} className="underline-offset-4 hover:underline">
                      {index + 1}. {section.heading}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </>
        )}
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
            {!seller.hasExampleEmail && (
              <a href={`mailto:${seller.email}`} className="underline">Email {seller.email}</a>
            )}
          </p>
        )}
        {sections.map((section, index) => (
          <section id={`section-${index + 1}`} key={section.heading} className="mt-8 scroll-mt-6">
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
        {isPolicy && path !== "/contact" && (
          <p className="mt-8 rounded-xl border border-line bg-paper-light p-4 text-sm leading-7 text-muted">
            Cần hỗ trợ? <a href={`tel:${settings.phone}`} className="font-semibold text-blue underline">Gọi {settings.phone}</a>
            {" "}hoặc xem <Link href="/contact" prefetch={false} className="text-blue underline">thông tin liên hệ</Link> của tiệm.
          </p>
        )}
        {productPage && (
          <section className="mt-8" aria-labelledby="current-products">
            <h2
              id="current-products"
              className="font-serif text-2xl font-normal text-blue-dark"
            >
              Món và giá hiện tại
            </h2>
            {products.length ? (
              <div className="mt-5 grid gap-5">
                {products.map((product) => {
                  const available =
                    product.status === "available" && product.stock !== 0;
                  return (
                    <article
                      key={product.id}
                      className="flex gap-4 rounded-xl border border-line bg-paper-light p-4 mobile:flex-col"
                    >
                      <div className="w-32 shrink-0 mobile:w-full">
                        <ProductImage
                          product={product}
                          sizes="(max-width: 760px) 90vw, 128px"
                          className="aspect-square w-full rounded-lg object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-serif text-xl">{product.name}</h3>
                        <p className="mt-2 leading-7 text-muted">
                          {product.description}
                        </p>
                        <p className="mt-3 font-semibold text-blue-dark">
                          {product.sizes?.length
                            ? `Giá từ ${money(Math.min(...product.sizes.map((size) => size.price)))}`
                            : money(product.price)}{" "}
                          / {product.unit}
                        </p>
                        {product.sizes?.length ? (
                          <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-muted">
                            {product.sizes.map((size) => (
                              <li key={size.id}>
                                {size.name}: {money(size.price)}
                                {size.available ? "" : " (tạm hết)"}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                        <p className="mt-2 text-sm text-muted">
                          {available ? "Còn món" : "Tạm hết"}
                        </p>
                        <Link
                          href={`/#mon-${product.id}`}
                          prefetch={false}
                          className="mt-3 inline-block font-semibold text-blue underline"
                        >
                          Xem {product.name} trong thực đơn →
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 leading-8 text-muted">
                Chưa có thông tin món để hiển thị. Vui lòng xem thực đơn hoặc
                gọi tiệm để kiểm tra món và giá.
              </p>
            )}
          </section>
        )}
      </article>
      <nav
        aria-label="Thông tin về tiệm"
        className="mt-10 flex flex-wrap gap-5 border-t border-line pt-6 text-sm text-blue"
      >
        {productPageLinks
          .filter((page) => page.path !== path)
          .map((page) => (
            <Link key={page.path} href={page.path} prefetch={false}>
              {page.label}
            </Link>
          ))}
      </nav>
      <PolicyLinks currentPath={path} />
    </main>
  );
}
