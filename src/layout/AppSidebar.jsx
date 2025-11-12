"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
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
} from "../icons/index";

const adminNavItems = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [{ name: "Overview", path: "/" }],
  },
  {
    icon: <BookOpenIcon />,
    name: "Course Management",
    subItems: [
      { name: "Course Categories", path: "/course-categories", subItems: [
        { name: "View Categories", path: "/course-categories" },
        { name: "Add Category", path: "/course-categories/add" }
      ]},
      { name: "Courses", path: "/courses", subItems: [
        { name: "View Courses", path: "/courses" },
        { name: "Add Course", path: "/courses/add" }
      ]},
      { name: "Chapters", path: "/chapters", subItems: [
        { name: "View Chapters", path: "/chapters" },
        { name: "Add Chapter", path: "/chapters/add" }
      ]},
      { name: "Lessons", path: "/lessons", subItems: [
        { name: "View Lessons", path: "/lessons" },
        { name: "Add Lesson", path: "/lessons/add" }
      ]},
      { name: "Lesson Content", path: "/lesson-content", subItems: [
        { name: "View Content", path: "/lesson-content" },
        { name: "Add Content", path: "/lesson-content/add" }
      ]},
    ],
  },
  {
    icon: <CalendarDaysIcon />,
    name: "Events",
    subItems: [
      { name: "View Events", path: "/events" },
      { name: "Add Event", path: "/events/add" },
    ],
  },
  {
    icon: <GraduationCapIcon />,
    name: "Programs",
    subItems: [
      { name: "View Programs", path: "/programs" },
      { name: "Add Program", path: "/programs/add" },
    ],
  },
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
    name: "Students",
    subItems: [
      { name: "View Students", path: "/students" },
      { name: "Add Student", path: "/students/add" },
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
];

const adminOthersItems = [
  {
    icon: <BarChartIcon />,
    name: "Analytics",
    subItems: [
      { name: "Course Analytics", path: "/analytics/courses" },
      { name: "Instructor Analytics", path: "/analytics/instructors" },
      { name: "Revenue Analytics", path: "/analytics/revenue" },
    ],
  },
  {
    icon: <ClipboardListIcon />,
    name: "Notifications",
    subItems: [
      { name: "Student Queries", path: "/notifications" },
    ],
  },
  {
    icon: <SettingsIcon />,
    name: "Settings",
    subItems: [
      { name: "General Settings", path: "/settings/general" },
      { name: "Course Settings", path: "/settings/courses" },
      { name: "Instructor Settings", path: "/settings/instructors" },
    ],
  },
];

const instructorNavItems = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    subItems: [{ name: "Overview", path: "/instructor" }],
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

const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { role } = useAuth();
  const pathname = usePathname();
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

  const isActive = useCallback(
    (path) =>
      path === pathname ||
      (path !== "/" && pathname.startsWith(path + "/")) ||
      (path !== "/" && pathname === path),
    [pathname]
  );

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? primaryNav : secondaryNav;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType,
                index,
              });
              submenuMatched = true;
            }
          });
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

  const renderMenuItems = (navItems, menuType) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-blue-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
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
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem, subIndex) => (
                  <li key={subItem.name}>
                    {subItem.subItems ? (
                      // If this subItem has its own subItems, render them with nested structure
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
                      // Regular subItem without nested items
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
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 ${
        isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
          ? "w-[290px]"
          : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href={homeHref}>
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center space-x-3">
              <img 
                src="/BVT_logo.png" 
                alt="BVT Admin Logo" 
                className="w-8 h-8 object-contain"
              />
              <div className="text-xl font-bold text-blue-600">{brandLabel}</div>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <img 
                src="/BVT_logo.png" 
                alt="BVT Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(primaryNav, "main")}
            </div>

            <div className="">
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Others"
                ) : (
                  <HorizontaLDots />
                )}
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
