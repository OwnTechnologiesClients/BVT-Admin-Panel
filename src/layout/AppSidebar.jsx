"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import {
  GridIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  GraduationCapIcon,
  UsersIcon,
  BarChartIcon,
  SettingsIcon,
  ChevronDownIcon,
  HorizontaLDots,
  ClipboardListIcon,
  EnvelopeIcon,
  CreditCardIcon,
  PageIcon,
} from "../icons/index";

const adminNavItems = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: <BookOpenIcon />,
    name: "Course Management",
    subItems: [
      {
        name: "Course Categories", path: "/course-categories", subItems: [
          { name: "View Categories", path: "/course-categories" },
          { name: "Add Category", path: "/course-categories/add" }
        ]
      },
      {
        name: "Courses", path: "/courses", subItems: [
          { name: "View Courses", path: "/courses" },
          { name: "Add Course", path: "/courses/add" }
        ]
      },
      {
        name: "Chapters", path: "/chapters", subItems: [
          { name: "View Chapters", path: "/chapters" },
          { name: "Add Chapter", path: "/chapters/add" }
        ]
      },
      {
        name: "Lessons", path: "/lessons", subItems: [
          { name: "View Lessons", path: "/lessons" },
          { name: "Add Lesson", path: "/lessons/add" }
        ]
      },
      {
        name: "Lesson Content", path: "/lesson-content", subItems: [
          { name: "View Content", path: "/lesson-content" },
          { name: "Add Content", path: "/lesson-content/add" }
        ]
      },
    ],
  },
  {
    icon: <CalendarDaysIcon />,
    name: "Event Management",
    subItems: [
      {
        name: "Events", path: "/event-categories", subItems: [
          { name: "View Event", path: "/events" },
          { name: "Add Event", path: "/events/add" }
        ]
      },
      {
        name: "Event Themes", path: "/event-categories", subItems: [
          { name: "View Themes", path: "/event-categories" },
          { name: "Add Theme", path: "/event-categories/add" }
        ]
      },
    ],
  },
  // {
  //   icon: <GraduationCapIcon />,
  //   name: "Programs",
  //   subItems: [
  //     { name: "View Programs", path: "/programs" },
  //     { name: "Add Program", path: "/programs/add" },
  //   ],
  // },
  {
    icon: <ClipboardListIcon />,
    name: "Tests",
    subItems: [
      { name: "View Tests", path: "/tests" },
      { name: "Add Test", path: "/tests/add" },
    ],
  },
  {
    icon: <UsersIcon />,
    name: "Users",
    subItems: [
      { name: "View Users", path: "/users" },
      { name: "Add User", path: "/users/add" },
    ],
  },
  {
    icon: <UsersIcon />,
    name: "Instructors",
    subItems: [
      { name: "View Instructors", path: "/instructors" },
      { name: "Add Instructor", path: "/instructors/add" },
    ],
  },
  {
    icon: <UsersIcon />,
    name: "Students",
    subItems: [
      { name: "View Students", path: "/students" },
      { name: "Add Student", path: "/students/add" },
    ],
  },
  {
    icon: <CreditCardIcon />,
    name: "Payments",
    path: "/payments",
  },
];

const adminOthersItems = [
  {
    icon: <EnvelopeIcon />,
    name: "Email Campaigns",
    subItems: [
      { name: "All Campaigns", path: "/email-campaigns" },
      { name: "Create Campaign", path: "/email-campaigns/create" },
    ],
  },
  {
    icon: <EnvelopeIcon />,
    name: "Support Inquiries",
    path: "/support-inquiries",
  },
  {
    icon: <ClipboardListIcon />,
    name: "Student Queries",
    path: "/notifications",
  },
  {
    icon: <PageIcon />,
    name: "Certificates",
    path: "/certificates",
  },
];

const instructorNavItems = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/instructor",
  },
  {
    icon: <BookOpenIcon />,
    name: "My Courses",
    subItems: [
      { name: "Course List", path: "/instructor/courses" },
      { name: "Upcoming Sessions", path: "/instructor/schedule" },
    ],
  },
  {
    icon: <UsersIcon />,
    name: "Students",
    subItems: [
      { name: "Student Roster", path: "/instructor/students" },
      { name: "Progress Reports", path: "/instructor/students/progress" },
    ],
  },
  {
    icon: <ClipboardListIcon />,
    name: "Assessments",
    subItems: [
      { name: "All Tests", path: "/instructor/tests" },
      { name: "Create Test", path: "/instructor/tests/create" },
    ],
  },
];

const instructorOthersItems = [
  {
    icon: <ClipboardListIcon />,
    name: "Notifications",
    subItems: [
      { name: "Student Queries", path: "/instructor/notifications" },
    ],
  },
  {
    icon: <BarChartIcon />,
    name: "Insights",
    subItems: [
      { name: "Course Performance", path: "/instructor/insights/courses" },
      { name: "Student Engagement", path: "/instructor/insights/engagement" },
    ],
  },
  {
    icon: <SettingsIcon />,
    name: "Profile",
    subItems: [
      { name: "My Profile", path: "/instructor/profile" },
      { name: "Availability", path: "/instructor/profile/availability" },
    ],
  },
];

/** Collapsed rail: submenu opens in a fixed panel (avoids sidebar overflow clipping). */
function RailNestedFlyout({ nav, groupActive, children }) {
  const btnRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const leaveTimer = useRef(null);

  const show = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    const r = btnRef.current?.getBoundingClientRect();
    if (r) {
      const left = r.right + 8;
      const maxLeft = window.innerWidth - 248;
      setPos({
        top: Math.max(8, r.top),
        left: Math.min(left, maxLeft),
      });
    }
    setOpen(true);
  };

  const hide = () => {
    leaveTimer.current = setTimeout(() => setOpen(false), 140);
  };

  const cancelHide = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        title={nav.name}
        onMouseEnter={show}
        onMouseLeave={hide}
        className={`menu-item w-full cursor-default lg:justify-center ${
          groupActive ? "menu-item-active" : "menu-item-inactive"
        }`}
      >
        <span
          className={`menu-item-icon-slot ${
            groupActive ? "menu-item-icon-active" : "menu-item-icon-inactive"
          }`}
        >
          {nav.icon}
        </span>
      </button>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="menu"
            onMouseEnter={cancelHide}
            onMouseLeave={hide}
            style={{ top: pos.top, left: pos.left }}
            className="fixed z-[500] max-h-[min(70vh,calc(100vh-16px))] min-w-[240px] overflow-y-auto rounded-lg border border-gray-200 bg-white py-2 shadow-xl"
          >
            <p className="border-b border-gray-100 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              {nav.name}
            </p>
            {children}
          </div>,
          document.body
        )}
    </>
  );
}

const AppSidebar = () => {
  const { isExpanded, isMobileOpen } = useSidebar();
  const { role } = useAuth();
  const pathname = usePathname();
  const isRail = !isExpanded && !isMobileOpen;
  const primaryNav =
    role === "instructor" ? instructorNavItems : adminNavItems;
  const secondaryNav =
    role === "instructor" ? instructorOthersItems : adminOthersItems;
  const homeHref = role === "instructor" ? "/instructor" : "/";
  const brandLabel = role === "instructor" ? "BVT Instructor" : "BVT Admin";

  const [openSubmenu, setOpenSubmenu] = useState({
    type: "main",
    index: null,
  });
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  // Helper function to get all paths from navigation items
  const getAllPaths = useCallback((items) => {
    const paths = [];
    items.forEach((nav) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          paths.push(subItem.path);
          if (subItem.subItems) {
            subItem.subItems.forEach((nestedSubItem) => {
              paths.push(nestedSubItem.path);
            });
          }
        });
      }
      if (nav.path) {
        paths.push(nav.path);
      }
    });
    return paths;
  }, []);

  const isActive = useCallback(
    (path) => {
      // Exact match takes priority
      if (path === pathname) {
        return true;
      }

      // For paths other than root, check if pathname starts with path + "/"
      // But only if there's no more specific path that matches exactly
      if (path !== "/" && pathname.startsWith(path + "/")) {
        // Check if there's a more specific path that matches exactly
        const allPaths = getAllPaths([...primaryNav, ...secondaryNav]);
        const hasMoreSpecificMatch = allPaths.some(
          (p) => p !== path && pathname === p && p.startsWith(path + "/")
        );

        // Only highlight parent if no more specific child matches
        return !hasMoreSpecificMatch;
      }

      return false;
    },
    [pathname, primaryNav, secondaryNav, getAllPaths]
  );

  useEffect(() => {
    // Check if the current path matches any submenu item
    // We need to check all paths (including nested) to find the most specific match
    let submenuMatched = false;
    let matchedIndex = null;
    let matchedType = null;

    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? primaryNav : secondaryNav;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          // Check all subItems (including nested ones) for exact matches first
          const checkSubItems = (subItems) => {
            for (const subItem of subItems) {
              // Check exact match first (most specific)
              if (pathname === subItem.path) {
                setOpenSubmenu({
                  type: menuType,
                  index,
                });
                submenuMatched = true;
                matchedIndex = index;
                matchedType = menuType;
                return true;
              }
              // Check nested subItems
              if (subItem.subItems) {
                if (checkSubItems(subItem.subItems)) {
                  return true;
                }
              }
            }
            return false;
          };

          // First check for exact matches
          if (!checkSubItems(nav.subItems)) {
            // If no exact match, check for parent path matches
            nav.subItems.forEach((subItem) => {
              if (isActive(subItem.path) && !submenuMatched) {
                setOpenSubmenu({
                  type: menuType,
                  index,
                });
                submenuMatched = true;
                matchedIndex = index;
                matchedType = menuType;
              }
            });
          }
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu({ type: "main", index: null });
    }
  }, [pathname, isActive, primaryNav, secondaryNav]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu.index !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return { type: menuType, index: null };
      }
      return { type: menuType, index };
    });
  };

  const isNavGroupActive = useCallback(
    (nav) => {
      if (!nav.subItems) return false;
      const walk = (items) => {
        for (const item of items) {
          if (item.path && isActive(item.path)) return true;
          if (item.subItems && walk(item.subItems)) return true;
        }
        return false;
      };
      return walk(nav.subItems);
    },
    [isActive]
  );

  const renderFlyoutLinks = (nav) => (
    <ul className="space-y-0.5">
      {nav.subItems.map((subItem) => (
        <li key={subItem.name}>
          {subItem.subItems ? (
            <div>
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-600">
                {subItem.name}
              </div>
              <ul className="ml-2 space-y-0.5 border-l border-gray-100">
                {subItem.subItems.map((nestedSubItem) => (
                  <li key={nestedSubItem.name}>
                    <Link
                      href={nestedSubItem.path}
                      className={`block px-3 py-1.5 text-sm rounded-r-md ${
                        isActive(nestedSubItem.path)
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {nestedSubItem.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <Link
              href={subItem.path}
              className={`mx-1 block rounded-md px-3 py-2 text-sm ${
                isActive(subItem.path)
                  ? "bg-blue-50 font-medium text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {subItem.name}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );

  const renderMenuItems = (navItems, menuType) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name} className="relative">
          {nav.subItems ? (
            isRail ? (
              <RailNestedFlyout nav={nav} groupActive={isNavGroupActive(nav)}>
                {renderFlyoutLinks(nav)}
              </RailNestedFlyout>
            ) : (
              <>
                <button
                  onClick={() => handleSubmenuToggle(index, menuType)}
                  className={`menu-item group w-full cursor-pointer ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index
                      ? "menu-item-active"
                      : "menu-item-inactive"
                  } ${!isExpanded && !isMobileOpen ? "lg:justify-center" : "lg:justify-start"}`}
                >
                  <span
                    className={`menu-item-icon-slot ${
                      openSubmenu?.type === menuType && openSubmenu?.index === index
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                  {(isExpanded || isMobileOpen) && (
                    <span className="menu-item-chevron">
                      <ChevronDownIcon
                        className={`h-5 w-5 transition-transform duration-200 ${
                          openSubmenu?.type === menuType && openSubmenu?.index === index
                            ? "rotate-180 text-blue-500"
                            : ""
                        }`}
                      />
                    </span>
                  )}
                </button>
                {nav.subItems && (isExpanded || isMobileOpen) && (
                  <div
                    ref={(el) => {
                      subMenuRefs.current[`${menuType}-${index}`] = el;
                    }}
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      height:
                        openSubmenu?.type === menuType && openSubmenu?.index === index
                          ? `${subMenuHeight[`${menuType}-${index}`]}px`
                          : "0px",
                    }}
                  >
                    <ul className="mt-2 ml-12 space-y-1 border-l border-gray-100 pl-3">
                      {nav.subItems.map((subItem) => (
                        <li key={subItem.name}>
                          {subItem.subItems ? (
                            <div>
                              <div className="menu-dropdown-item flex items-center justify-between">
                                <span className="font-semibold">{subItem.name}</span>
                              </div>
                              <ul className="ml-4 mt-1 space-y-1">
                                {subItem.subItems.map((nestedSubItem) => (
                                  <li key={nestedSubItem.name}>
                                    <Link
                                      href={nestedSubItem.path}
                                      className={`menu-dropdown-item ${
                                        isActive(nestedSubItem.path)
                                          ? "menu-dropdown-item-active"
                                          : "menu-dropdown-item-inactive"
                                      }`}
                                    >
                                      {nestedSubItem.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <Link
                              href={subItem.path}
                              className={`menu-dropdown-item ${
                                isActive(subItem.path)
                                  ? "menu-dropdown-item-active"
                                  : "menu-dropdown-item-inactive"
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )
          ) : (
            nav.path &&
            (isRail ? (
              <div className="relative w-full">
                <Link
                  href={nav.path}
                  title={nav.name}
                  className={`menu-item group lg:justify-center ${
                    isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
                >
                  <span
                    className={`menu-item-icon-slot ${
                      isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                </Link>
              </div>
            ) : (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-slot ${
                    isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            ))
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed left-0 top-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out lg:mt-0 ${
        isExpanded || isMobileOpen ? "w-[290px]" : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
    >
      <div
        className={`flex py-8 ${!isExpanded && !isMobileOpen ? "lg:justify-center" : "justify-start"}`}
      >
        <Link href={homeHref}>
          {isExpanded || isMobileOpen ? (
            <div className="flex items-center space-x-3">
              <img
                src="/BVT_logo.png"
                alt="BVT Admin Logo"
                className="h-8 w-8 object-contain"
              />
              <div className="text-xl font-bold text-blue-600">{brandLabel}</div>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <img src="/BVT_logo.png" alt="BVT Logo" className="h-8 w-8 object-contain" />
            </div>
          )}
        </Link>
      </div>
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 flex text-xs uppercase leading-[20px] text-gray-400 ${
                  !isExpanded && !isMobileOpen ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isMobileOpen ? "Menu" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(primaryNav, "main")}
            </div>

            <div>
              <h2
                className={`mb-4 flex text-xs uppercase leading-[20px] text-gray-400 ${
                  !isExpanded && !isMobileOpen ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isMobileOpen ? "Others" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(secondaryNav, "others")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
