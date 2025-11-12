import React from "react";

export const PageBreadcrumb = ({
  pageTitle,
  homeHref = "/",
  homeLabel = "Dashboard",
  trail = [],
  items,
}) => {
  const hasLegacyItems = Array.isArray(items) && items.length > 0;

  const effectiveHomeHref = hasLegacyItems
    ? items[0]?.href ?? homeHref
    : homeHref;
  const effectiveHomeLabel = hasLegacyItems
    ? items[0]?.label ?? homeLabel
    : homeLabel;

  const derivedTitle =
    pageTitle ??
    (hasLegacyItems
      ? items[items.length - 1]?.label ?? effectiveHomeLabel
      : trail[trail.length - 1]?.label ?? effectiveHomeLabel);

  const breadcrumbTrail = hasLegacyItems
    ? items.slice(1).map((item) => ({
        label: item.label,
        href: item.href,
      }))
    : trail.length > 0
    ? trail
    : [{ label: derivedTitle, href: undefined }];

  return (
    <div className="mb-6">
      {derivedTitle && (
        <h1 className="text-2xl font-bold text-gray-900">{derivedTitle}</h1>
      )}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <a
              href={effectiveHomeHref}
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <svg
                className="mr-2.5 h-3 w-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
              </svg>
              {effectiveHomeLabel}
            </a>
          </li>
          {breadcrumbTrail.map((item, index) => {
            const isLast = index === breadcrumbTrail.length - 1;
            return (
              <li key={`${item.label}-${index}`}>
                <div className="flex items-center">
                  <svg
                    className="mx-1 h-3 w-3 text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 9 4-4-4-4"
                    />
                  </svg>
                  {item.href && !isLast ? (
                    <a
                      href={item.href}
                      className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                      {item.label}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumb;
