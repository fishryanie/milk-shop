import { policyNavigationLinks } from "@/lib/policy-links";

export function PolicyLinks({ currentPath }: { currentPath?: string }) {
  return (
    <nav aria-label="Thông tin và chính sách" className="mt-8 border-t border-line pt-6">
      <h2 className="text-sm font-semibold text-blue-dark">Thông tin & chính sách mua hàng</h2>
      <ul className="mt-3 grid gap-x-8 gap-y-1 text-sm leading-6 text-muted sm:grid-cols-2 lg:grid-cols-3">
        {policyNavigationLinks.map(({ path, label }) => (
          <li key={path}>
            <a
              href={path}
              aria-current={path === currentPath ? "page" : undefined}
              className="inline-block py-1 hover:text-blue hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue aria-[current=page]:font-semibold aria-[current=page]:text-blue"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
