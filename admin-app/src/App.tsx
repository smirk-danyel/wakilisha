import { useMemo, useState } from "react";
import {
  Archive,
  Bell,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  LayoutDashboard,
  MapPin,
  Menu,
  MoreHorizontal,
  Phone,
  Play,
  RefreshCw,
  Search,
  Send,
  Settings,
  UserPlus,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import wakilishaLogo from "./assets/wakilisha-logo.png";
import nationalPoliceLogo from "./assets/national-police-logo.png";

type ReportStatus =
  | "Received"
  | "Pending"
  | "Dispatched"
  | "Resolved"
  | "Archived";
type ReportFilter = "Active" | "Resolved" | "All" | "Archived";

type Report = {
  id: number;
  token: string;
  category: string;
  categoryLabel: string;
  location: string;
  phone: string;
  status: ReportStatus;
  officer: string;
  reported: string;
  description: string;
  coordinates: string;
  hasImage: boolean;
  hasAudio: boolean;
  duration: string;
};

const initialReports: Report[] = [
  {
    id: 1,
    token: "WAK-A1F82C",
    category: "Crime and Security",
    categoryLabel: "Crime / Security",
    location: "Kapsoya, near Total Station",
    phone: "07•• ••• 101",
    status: "Pending",
    officer: "Sample Officer",
    reported: "14m ago",
    description:
      "A suspected break-in has been reported. Details are awaiting officer assessment.",
    coordinates: "0.5204° N, 35.2982° E",
    hasImage: true,
    hasAudio: true,
    duration: "1:15",
  },
  {
    id: 2,
    token: "WAK-B82D71",
    category: "Medical Emergency",
    categoryLabel: "Medical",
    location: "Annex, Chepkoilel Junction",
    phone: "07•• ••• 234",
    status: "Dispatched",
    officer: "Sample Officer",
    reported: "32m ago",
    description: "A medical emergency has been reported near the junction.",
    coordinates: "0.5140° N, 35.2850° E",
    hasImage: false,
    hasAudio: true,
    duration: "0:48",
  },
  {
    id: 3,
    token: "WAK-C91E45",
    category: "Fire",
    categoryLabel: "Fire",
    location: "Huruma, Market Lane",
    phone: "07•• ••• 120",
    status: "Dispatched",
    officer: "Sample Officer",
    reported: "58m ago",
    description: "A fire incident has been reported in the Huruma area.",
    coordinates: "0.5250° N, 35.2750° E",
    hasImage: true,
    hasAudio: false,
    duration: "—",
  },
  {
    id: 4,
    token: "WAK-D772B9",
    category: "Road Traffic Accident",
    categoryLabel: "Accident",
    location: "Langas, Main Stage",
    phone: "07•• ••• 112",
    status: "Resolved",
    officer: "Sample Officer",
    reported: "2h ago",
    description: "A road traffic accident was reported near Langas Main Stage.",
    coordinates: "0.4900° N, 35.2750° E",
    hasImage: true,
    hasAudio: false,
    duration: "—",
  },
  {
    id: 5,
    token: "WAK-E803F1",
    category: "Rescue",
    categoryLabel: "Rescue",
    location: "Kimumu, Eldoret-Iten Road",
    phone: "07•• ••• 344",
    status: "Received",
    officer: "Unassigned",
    reported: "3h ago",
    description:
      "A rescue request has been received and is awaiting assessment.",
    coordinates: "0.5700° N, 35.2700° E",
    hasImage: false,
    hasAudio: true,
    duration: "0:36",
  },
  {
    id: 6,
    token: "WAK-F651A2",
    category: "Hazard and Infrastructure",
    categoryLabel: "Hazard",
    location: "Munyaka, Block B",
    phone: "07•• ••• 011",
    status: "Resolved",
    officer: "Sample Officer",
    reported: "4h ago",
    description: "An infrastructure hazard was reported in Munyaka.",
    coordinates: "0.5350° N, 35.2650° E",
    hasImage: true,
    hasAudio: false,
    duration: "—",
  },
  {
    id: 7,
    token: "WAK-G318D4",
    category: "Other Emergency",
    categoryLabel: "Other Emergency",
    location: "Mwanzo, Eldoret",
    phone: "07•• ••• 455",
    status: "Archived",
    officer: "Unassigned",
    reported: "Yesterday",
    description: "Sample archived report for dashboard preview.",
    coordinates: "Not provided",
    hasImage: false,
    hasAudio: false,
    duration: "—",
  },
];

const categories = [
  { name: "Medical", count: 38, color: "#22C55E" },
  { name: "Accident", count: 29, color: "#F97316" },
  { name: "Crime / Security", count: 25, color: "#3B82F6" },
  { name: "Fire", count: 14, color: "#EF4444" },
  { name: "Rescue", count: 9, color: "#0D9488" },
  { name: "Hazard", count: 8, color: "#F59E0B" },
  { name: "Other Emergency", count: 5, color: "#8B5CF6" },
];

const totalCategoryReports = categories.reduce(
  (total, category) => total + category.count,
  0,
);

const donutBackground = `conic-gradient(${categories
  .map((category, index) => {
    const previous = categories
      .slice(0, index)
      .reduce((total, item) => total + item.count, 0);
    const start = (previous / totalCategoryReports) * 100;
    const end = ((previous + category.count) / totalCategoryReports) * 100;
    return `${category.color} ${start}% ${end}%`;
  })
  .join(", ")})`;

const statusStyles: Record<ReportStatus, string> = {
  Received: "bg-gray-100 text-gray-700",
  Pending: "bg-amber-100 text-amber-800",
  Dispatched: "bg-blue-100 text-blue-700",
  Resolved: "bg-emerald-100 text-emerald-700",
  Archived: "bg-purple-100 text-purple-700",
};

function SidebarLink({
  icon: Icon,
  label,
  active = false,
  disabled = false,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      title={disabled ? `${label} will be implemented later` : undefined}
      className={`flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-left text-sm font-medium transition ${
        active
          ? "bg-brand-teal text-white shadow-sm"
          : disabled
            ? "cursor-not-allowed text-gray-400"
            : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      <Icon size={17} />
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-[2px]"
        />
      )}

      <aside
        id="admin-sidebar"
        className={`fixed inset-y-4 left-4 z-50 flex w-[260px] flex-col justify-between overflow-y-auto rounded-[28px] bg-white p-6 shadow-drawer transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-[calc(100%+2rem)]"
        }`}
      >
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <img
              src={wakilishaLogo}
              alt="Wakilisha"
              className="h-11 w-auto shrink-0"
            />

            <p className="text-[11px] font-medium leading-tight text-gray-500">
              Wakilisha Admin Control Center
            </p>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="ml-auto rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="space-y-6">
            <div className="space-y-1.5">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Menu
              </p>

              <SidebarLink icon={LayoutDashboard} label="Dashboard" active />
              <SidebarLink icon={Users} label="Officers on Duty" disabled />
              <SidebarLink icon={Archive} label="Archived Reports" disabled />
            </div>

            <div className="space-y-1.5 pt-2">
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Admin
              </p>

              <SidebarLink icon={Settings} label="Admin Settings" disabled />
              <SidebarLink
                icon={UserPlus}
                label="Register New Admin"
                disabled
              />
            </div>
          </nav>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-center rounded-2xl border border-gray-200/80 bg-white p-4">
            <img
              src={nationalPoliceLogo}
              alt="The National Police Service"
              className="h-auto w-32"
            />
          </div>
        </div>
      </aside>
    </>
  );
}

function KpiCard({
  title,
  value,
  caption,
  icon: Icon,
  iconClass,
  trend,
  dark = false,
}: {
  title: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  iconClass: string;
  trend: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`flex flex-col justify-between rounded-3xl border p-5 shadow-soft-card sm:p-6 ${
        dark
          ? "border-brand-teal bg-brand-teal text-white"
          : "border-gray-100 bg-white text-gray-900"
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
            dark ? "bg-white/10 text-white" : iconClass
          }`}
        >
          <Icon size={20} />
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            dark
              ? "bg-brand-accent-green text-brand-teal-hover"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {trend}
        </span>
      </div>
      <div className="mt-5">
        <p
          className={`text-xs font-medium ${
            dark ? "text-white/80" : "text-gray-500"
          }`}
        >
          {title}
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight">{value}</span>
          <span
            className={`text-[11px] ${
              dark ? "text-white/70" : "text-gray-400"
            }`}
          >
            {caption}
          </span>
        </div>
      </div>
    </div>
  );
}

function ReportsByType() {
  return (
    <section className="flex flex-col justify-between rounded-3xl border border-white/60 bg-gradient-to-b from-[#E6F4EA] to-[#F0F4F2] p-6 shadow-soft-card">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Reports by Type
            </h2>
            <p className="text-xs text-gray-500">Sample weekly distribution</p>
          </div>
          <span className="flex items-center gap-1 rounded-full border border-gray-200/60 bg-white/80 px-3 py-1 text-xs font-medium text-gray-700">
            This week <ChevronDown size={13} />
          </span>
        </div>

        <div
          className="relative mx-auto my-5 flex h-44 w-44 items-center justify-center rounded-full"
          style={{ background: donutBackground }}
          aria-label="Sample reports by emergency type"
        >
          <div className="flex h-[72%] w-[72%] flex-col items-center justify-center rounded-full bg-[#EDF3EF] text-center">
            <span className="text-2xl font-bold leading-none text-gray-900">
              {totalCategoryReports}
            </span>
            <span className="mt-1 text-[10px] font-medium text-gray-500">
              Sample reports
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2 space-y-2 border-t border-gray-200/60 pt-3">
        {categories.map((category) => (
          <div
            key={category.name}
            className="flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="font-medium text-gray-700">{category.name}</span>
            </div>
            <span className="font-bold text-gray-900">{category.count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function IncidentChart() {
  const values = [
    [65, 50],
    [85, 70],
    [48, 40],
    [72, 65],
    [95, 80],
    [60, 55],
    [38, 32],
  ];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            Incidents Over Time
          </h2>
          <p className="text-xs text-gray-500">
            Sample reported vs resolved per day
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-medium text-gray-600">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-brand-teal" />
            Reported
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-brand-accent-green" />
            Resolved
          </span>
        </div>
      </div>

      <div className="relative mt-7 flex h-52 items-end justify-between border-b border-gray-200 px-2 pb-7">
        <div className="pointer-events-none absolute inset-0 mb-7 flex flex-col justify-between">
          {[30, 20, 10, 0].map((number) => (
            <div
              key={number}
              className="flex items-center border-b border-gray-100 text-[9px] text-gray-400"
            >
              <span>{number}</span>
            </div>
          ))}
        </div>

        {values.map(([reported, resolved], index) => (
          <div
            key={days[index]}
            className="relative z-10 flex h-full flex-col items-center justify-end gap-2"
          >
            <div className="flex h-40 items-end gap-1">
              <div
                className="w-3 rounded-t-md bg-brand-teal sm:w-4"
                style={{ height: `${reported}%` }}
              />
              <div
                className="w-3 rounded-t-md bg-brand-accent-green sm:w-4"
                style={{ height: `${resolved}%` }}
              />
            </div>
            <span className="text-[10px] font-medium text-gray-500">
              {days[index]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ReportsByArea() {
  const estates = [
    { name: "Kapsoya", value: 28 },
    { name: "Langas", value: 22 },
    { name: "Huruma", value: 18 },
    { name: "Annex", value: 14 },
    { name: "Kimumu", value: 10 },
    { name: "Munyaka", value: 8 },
  ];

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-soft-card">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Reports by Area</h2>
          <p className="text-xs text-gray-500">
            Sample distribution across Eldoret
          </p>
        </div>
        <span className="rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-semibold text-brand-teal">
          Eldoret
        </span>
      </div>

      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[0.9fr_1.1fr]">
        {/* Area bubble visualization */}
        <div className="relative mx-auto h-56 w-full max-w-[320px]">
          <div className="absolute left-3 top-2 z-20 flex h-28 w-28 flex-col items-center justify-center rounded-full bg-brand-teal text-white shadow-md">
            <span className="text-xl font-bold">28%</span>
            <span className="text-[10px] text-white/80">Kapsoya</span>
          </div>

          <div className="absolute right-4 top-4 z-10 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-brand-teal/80 text-white shadow-sm">
            <span className="text-lg font-bold">22%</span>
            <span className="text-[10px] text-white/80">Langas</span>
          </div>

          <div className="absolute bottom-2 left-9 z-30 flex h-20 w-20 flex-col items-center justify-center rounded-full bg-brand-accent-green text-brand-teal-hover shadow-sm">
            <span className="text-base font-bold">18%</span>
            <span className="text-[9px] font-medium">Huruma</span>
          </div>

          <div className="absolute bottom-4 right-7 z-0 flex h-16 w-16 flex-col items-center justify-center rounded-full bg-brand-teal/20 text-brand-teal">
            <span className="text-sm font-bold">14%</span>
            <span className="text-[9px]">Annex</span>
          </div>
        </div>

        {/* Area breakdown */}
        <div className="space-y-3">
          {estates.map((estate, index) => (
            <div key={estate.name}>
              <div className="mb-1 flex justify-between text-xs font-medium">
                <span className="text-gray-800">{estate.name}</span>
                <span className="font-bold text-gray-900">{estate.value}%</span>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${
                    index === 2 ? "bg-brand-accent-green" : "bg-brand-teal"
                  }`}
                  style={{ width: `${estate.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function IncidentTable({
  reports,
  selectedReport,
  onSelect,
  filter,
  onFilterChange,
  search,
  onSearchChange,
  category,
  onCategoryChange,
}: {
  reports: Report[];
  selectedReport: Report | null;
  onSelect: (report: Report) => void;
  filter: ReportFilter;
  onFilterChange: (filter: ReportFilter) => void;
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
}) {
  const filters: ReportFilter[] = ["Active", "Resolved", "All", "Archived"];

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-soft-card sm:p-6">
      <div className="flex flex-col justify-between gap-4 border-b border-gray-100 pb-5 xl:flex-row xl:items-center">
        <div className="shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Incident Reports</h2>
          <p className="text-xs text-gray-500">Sample dashboard preview</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:flex-nowrap xl:justify-end">
          <div className="flex flex-wrap items-center gap-1 rounded-full bg-gray-100 p-1 text-xs font-semibold">
            {filters.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => onFilterChange(item)}
                className={`rounded-full px-3 py-1.5 transition ${
                  filter === item
                    ? "bg-brand-teal text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              className="w-full rounded-full border border-gray-200 py-2 pl-9 pr-3 text-xs focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal sm:w-64"
              placeholder="Search token, location or phone"
              aria-label="Search incident reports"
            />
          </div>

          <select
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="w-36 shrink-0 rounded-full border border-gray-200 bg-gray-50 py-2 pl-3 pr-8 text-xs font-medium text-gray-700 focus:border-brand-teal focus:outline-none"
            aria-label="Filter by emergency category"
          >
            <option value="All">All Types</option>
            {categories.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[850px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              <th className="px-3 py-3">Token</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Location</th>
              <th className="px-3 py-3">Reporter</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Officer</th>
              <th className="px-3 py-3">Reported</th>
              <th className="px-3 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 font-medium">
            {reports.map((report) => (
              <tr
                key={report.id}
                onClick={() => onSelect(report)}
                className={`cursor-pointer transition-colors hover:bg-brand-teal/5 ${
                  selectedReport?.id === report.id ? "bg-brand-teal/5" : ""
                }`}
              >
                <td className="px-3 py-4 font-bold text-brand-teal">
                  {report.token}
                </td>
                <td className="px-3 py-4">
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
                    {report.categoryLabel}
                  </span>
                </td>
                <td className="px-3 py-4 text-gray-700">{report.location}</td>
                <td className="px-3 py-4 font-mono text-gray-600">
                  {report.phone}
                </td>
                <td className="px-3 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[report.status]}`}
                  >
                    {report.status}
                  </span>
                </td>
                <td className="px-3 py-4 text-gray-700">{report.officer}</td>
                <td className="px-3 py-4 text-gray-500">{report.reported}</td>
                <td className="px-3 py-4 text-right">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(report);
                    }}
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-teal"
                    aria-label={`Inspect ${report.token}`}
                  >
                    <MoreHorizontal size={17} />
                  </button>
                </td>
              </tr>
            ))}

            {reports.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400">
                  No sample reports match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function IncidentDrawer({
  report,
  onClose,
}: {
  report: Report | null;
  onClose: () => void;
}) {
  if (!report) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close incident details"
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default bg-gray-900/30 backdrop-blur-[2px]"
      />

      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col justify-between overflow-y-auto bg-white p-5 shadow-drawer sm:p-6"
        aria-label="Incident details"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-gray-900">
                {report.token}
              </h2>
              <p className="text-[11px] text-gray-500">
                {report.categoryLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200"
              aria-label="Close drawer"
            >
              <X size={17} />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-gray-500">Status</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[report.status]}`}
            >
              {report.status}
            </span>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3.5">
            <div className="flex items-start gap-2.5">
              <MapPin size={17} className="mt-0.5 shrink-0 text-status-red" />
              <div>
                <p className="text-xs font-bold text-gray-900">
                  {report.location}, Eldoret
                </p>
                <p className="mt-1 text-[11px] text-gray-500">
                  GPS: {report.coordinates}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Incident Details
            </label>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3.5 text-xs leading-relaxed text-gray-700">
              {report.description}
            </div>
          </div>

          {report.hasImage && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-900">
                Photo Evidence
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500">
                  <FileText size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-gray-900">
                    Sample image evidence
                  </p>
                  <p className="text-[10px] text-gray-400">
                    Actual media will appear after API integration
                  </p>
                </div>
              </div>
            </div>
          )}

          {report.hasAudio && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-900">
                Voice Recording
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3.5">
                <button
                  type="button"
                  disabled
                  title="Audio player will be connected to the evidence API"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-teal text-white opacity-60"
                  aria-label="Audio player preview"
                >
                  <Play size={15} fill="currentColor" />
                </button>
                <div className="flex flex-1 items-center justify-center gap-1">
                  {Array.from({ length: 18 }).map((_, index) => (
                    <span
                      key={index}
                      className={`w-1 rounded-full ${
                        index < 6 ? "bg-brand-teal" : "bg-gray-300"
                      }`}
                      style={{ height: `${8 + ((index * 13) % 22)}px` }}
                    />
                  ))}
                </div>
                <span className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] font-bold text-gray-500">
                  {report.duration}
                </span>
              </div>
              <p className="text-[10px] text-gray-400">
                Sample player preview — actual evidence will be streamed
                securely.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Citizen Reporter
            </label>
            <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-3">
              <div>
                <p className="text-xs font-semibold text-gray-900">
                  {report.phone}
                </p>
                <p className="mt-0.5 text-[10px] text-gray-500">
                  Reporter contact preview
                </p>
              </div>
              <a
                href={`tel:${report.phone.replace(/[^\d+]/g, "")}`}
                className="rounded-full border border-gray-200 bg-white p-2 text-gray-600 shadow-sm hover:text-brand-teal"
                aria-label="Call reporter"
              >
                <Phone size={16} />
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-gray-200 p-3 text-[11px] leading-relaxed text-gray-500">
            This is sample content for the visual prototype. Officer assignment,
            status changes and evidence access will be connected to the
            Wakilisha API.
          </div>
        </div>

        <div className="mt-6 space-y-2 border-t border-gray-100 pt-5">
          <button
            type="button"
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-teal py-3 text-xs font-semibold tracking-wide text-white opacity-50"
          >
            <Users size={15} /> Assign Officer
          </button>
          <button
            type="button"
            disabled
            className="w-full rounded-xl border border-brand-teal py-3 text-xs font-semibold tracking-wide text-brand-teal opacity-50"
          >
            Move to Records
          </button>
        </div>
      </aside>
    </>
  );
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reports] = useState(initialReports);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filter, setFilter] = useState<ReportFilter>("Active");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const visibleReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesStatus =
        filter === "All"
          ? true
          : filter === "Active"
            ? report.status !== "Resolved" && report.status !== "Archived"
            : report.status === filter;

      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        report.token.toLowerCase().includes(query) ||
        report.location.toLowerCase().includes(query) ||
        report.phone.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" || report.categoryLabel === category;

      return matchesStatus && matchesSearch && matchesCategory;
    });
  }, [reports, filter, search, category]);

  const dateLabel = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-screen bg-brand-light-bg font-sans text-[#1A1A1A]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] gap-6 p-4 lg:p-6">
        <Sidebar open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="flex items-center justify-between gap-3 py-2">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={isSidebarOpen}
                aria-controls="admin-sidebar"
                className="rounded-xl border border-gray-100 bg-white p-2.5 text-brand-teal shadow-soft-card transition hover:bg-gray-50"
              >
                <Menu size={20} />
              </button>

              <div>
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  Command Center
                </h1>
                <p className="mt-1 text-[11px] font-medium text-gray-500">
                  {dateLabel} • Eldoret Hub
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] font-semibold text-amber-800 sm:inline-flex">
                PREVIEW DATA
              </span>
              <button
                type="button"
                disabled
                title="Refresh will be connected to the API"
                className="rounded-full border border-gray-100 bg-white p-3 text-gray-500 shadow-soft-card opacity-60"
                aria-label="Refresh dashboard"
              >
                <RefreshCw size={16} />
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-gray-100 bg-white px-2 py-1.5 shadow-soft-card sm:gap-3 sm:pr-4"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-teal text-xs font-semibold text-brand-accent-green">
                  WA
                </span>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block text-[11px] font-semibold text-gray-900">
                    Operations Administrator
                  </span>
                  <span className="block text-[10px] text-gray-500">
                    Demo account
                  </span>
                </span>
                <ChevronDown
                  size={13}
                  className="hidden text-gray-400 sm:block"
                />
              </button>
              <button
                type="button"
                className="rounded-full bg-white p-2.5 text-gray-500 shadow-soft-card lg:hidden"
                aria-label="Notifications preview"
              >
                <Bell size={17} />
              </button>
            </div>
          </header>

          <section
            aria-label="Dashboard statistics"
            className="grid grid-cols-2 gap-4 xl:grid-cols-4"
          >
            <KpiCard
              title="Total Reports"
              value="128"
              caption="this week"
              icon={FileText}
              iconClass=""
              trend="+12%"
              dark
            />
            <KpiCard
              title="Pending"
              value="14"
              caption="this week"
              icon={Clock3}
              iconClass="bg-amber-50 text-status-amber"
              trend="+3"
            />
            <KpiCard
              title="Dispatched"
              value="9"
              caption="this week"
              icon={Send}
              iconClass="bg-blue-50 text-status-blue"
              trend="+2"
            />
            <KpiCard
              title="Resolved"
              value="105"
              caption="this week"
              icon={CheckCircle2}
              iconClass="bg-emerald-50 text-emerald-600"
              trend="+14%"
            />
          </section>

          <section className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-7">
              <ReportsByType />
            </div>
            <div className="col-span-12 lg:col-span-5">
              <IncidentChart />
            </div>
          </section>

          <section className="grid grid-cols-12 gap-6">
            <div className="col-span-12">
              <ReportsByArea />
            </div>
          </section>

          <IncidentTable
            reports={visibleReports}
            selectedReport={selectedReport}
            onSelect={setSelectedReport}
            filter={filter}
            onFilterChange={setFilter}
            search={search}
            onSearchChange={setSearch}
            category={category}
            onCategoryChange={setCategory}
          />

          <footer className="flex flex-wrap items-center justify-between gap-2 pb-3 text-[10px] text-gray-400">
            <span>Wakilisha • Eldoret Emergency Response</span>
            <span>Dashboard UI preview • API integration pending</span>
          </footer>
        </main>
      </div>

      <IncidentDrawer
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}

export default App;
