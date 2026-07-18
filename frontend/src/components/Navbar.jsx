import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  const navItems = [
    { to: "/", label: "Issue Feed" },
    ...(user
      ? [
          { to: "/report", label: "Report" },
          { to: "/my-reports", label: "My Reports" },
        ]
      : []),
    ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  const linkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-semibold transition ${
      isActive
        ? "bg-teal-700 text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
    }`;

  return (
    <header className="sticky top-0 z-[1000] border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-700 text-sm font-bold text-white">
            CC
          </span>
          <span>
            <span className="block text-lg font-bold leading-tight text-slate-950">
              CivicConnect AI
            </span>
            <span className="block text-xs font-medium text-slate-500">
              Smart civic reporting
            </span>
          </span>
        </Link>

        <button
          type="button"
          className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="primary-navigation"
        >
          Menu
        </button>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-950">
                  {user.name}
                </p>
                <p className="text-xs font-medium capitalize text-slate-500">
                  {user.role}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <Link
                to="/register"
                className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {open && (
        <div
          id="primary-navigation"
          className="border-t border-slate-200 bg-white px-4 py-3 md:hidden"
        >
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={linkClass}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}

            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-slate-900 px-4 py-2 text-left text-sm font-semibold text-white"
              >
                Logout
              </button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className={linkClass}
                  onClick={() => setOpen(false)}
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className={linkClass}
                  onClick={() => setOpen(false)}
                >
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
