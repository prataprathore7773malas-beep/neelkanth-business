import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  CreditCard,
  ArrowLeftRight,
  Receipt,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  IndianRupee,
  Clock3,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { supabase, supabaseConfigured } from "./lib/supabase";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "customers", label: "Customers", icon: Users },
  { id: "products", label: "Products", icon: Package },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { id: "expenses", label: "Expenses", icon: Receipt },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "settings", label: "Settings", icon: Settings }
];

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMessage("");

    if (!supabaseConfigured) {
      setMessage("Supabase connection is not configured yet.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    onLogin();
  }

  return (
    <main className="login-page">
      <div className="login-glow" />
      <section className="login-card">
        <div className="brand-mark">NS</div>
        <p className="eyebrow">NEELKANTH STONES</p>
        <h1>Business Management</h1>
        <p className="login-subtitle">
          Billing, customers, payments and business records — all in one place.
        </p>

        {!supabaseConfigured && (
          <div className="notice warning">
            Supabase keys are not configured yet. We will connect them during deployment.
          </div>
        )}

        <form onSubmit={submit} className="login-form">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="owner@example.com"
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          {message && <div className="notice error">{message}</div>}

          <button className="primary-button full" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="login-footer">
          Secure business access · Neelkanth Stones
        </div>
      </section>
    </main>
  );
}

function StatCard({ title, value, icon: Icon, tone }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={19} />
      </div>
      <div>
        <span>{title}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function Dashboard({ business }) {
  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow brown">OVERVIEW</p>
          <h2>Good to see you.</h2>
          <p>Here is your business snapshot.</p>
        </div>
        <button className="primary-button">
          <Plus size={17} /> New Invoice
        </button>
      </div>

      <div className="stats-grid">
        <StatCard title="Today's Sales" value="₹0" icon={IndianRupee} tone="gold" />
        <StatCard title="Total Receivable" value="₹0" icon={Clock3} tone="brown" />
        <StatCard title="Paid Invoices" value="0" icon={CheckCircle2} tone="green" />
        <StatCard title="Pending Invoices" value="0" icon={AlertCircle} tone="red" />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Recent Invoices</h3>
              <p>Your latest billing activity will appear here.</p>
            </div>
            <button className="ghost-button">View all</button>
          </div>
          <div className="empty-state">
            <FileText size={34} />
            <strong>No invoices yet</strong>
            <span>Create your first invoice to start tracking sales.</span>
            <button className="secondary-button"><Plus size={16} /> Create Invoice</button>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Business</h3>
              <p>Current account</p>
            </div>
          </div>
          <div className="business-card">
            <div className="business-logo">NS</div>
            <div>
              <strong>{business?.name || "Neelkanth Stones"}</strong>
              <span>{business?.city || "Jodhpur"}, {business?.state || "Rajasthan"}</span>
              <span>{business?.phone || "8619201942"}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function PlaceholderPage({ title, description, icon: Icon }) {
  return (
    <div className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow brown">MODULE</p>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        <button className="primary-button"><Plus size={17} /> Add New</button>
      </div>
      <section className="panel large-empty">
        <Icon size={42} />
        <h3>{title} module</h3>
        <p>This module is connected to the database foundation and will be built next.</p>
      </section>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [business, setBusiness] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadSession() {
      const { data } = await supabase.auth.getSession();
      if (!active) return;

      setSession(data.session);

      if (data.session?.user) {
        await loadAccount(data.session.user.id);
      }

      setLoading(false);
    }

    async function loadAccount(userId) {
      const [{ data: p }, { data: membership }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase
          .from("business_members")
          .select("business_id, role, businesses(*)")
          .eq("user_id", userId)
          .eq("role", "owner")
          .maybeSingle()
      ]);

      setProfile(p || null);
      setBusiness(membership?.businesses || null);
    }

    loadSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          await loadAccount(newSession.user.id);
        } else {
          setProfile(null);
          setBusiness(null);
        }
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
  }

  if (loading) {
    return <div className="loading-screen">Loading Neelkanth Business...</div>;
  }

  if (!session) {
    return <Login onLogin={() => {}} />;
  }

  const current = navItems.find((item) => item.id === page) || navItems[0];
  const CurrentIcon = current.icon;

  return (
    <div className="app-shell">
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark small">NS</div>
          <div>
            <strong>Neelkanth</strong>
            <span>Business</span>
          </div>
          <button className="mobile-close" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${page === item.id ? "active" : ""}`}
                onClick={() => {
                  setPage(item.id);
                  setMobileOpen(false);
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">
              {(profile?.full_name || session.user.email || "O").charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{profile?.full_name || "Owner"}</strong>
              <span>{session.user.email}</span>
            </div>
          </div>
          <button className="logout-button" onClick={logout}>
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="topbar-title">
            <CurrentIcon size={18} />
            <span>{current.label}</span>
          </div>
          <div className="topbar-business">
            {business?.name || "Neelkanth Stones"}
          </div>
        </header>

        {page === "dashboard" ? (
          <Dashboard business={business} />
        ) : (
          <PlaceholderPage
            title={current.label}
            description={`Manage your ${current.label.toLowerCase()} in one place.`}
            icon={CurrentIcon}
          />
        )}
      </main>
    </div>
  );
}

export default App;