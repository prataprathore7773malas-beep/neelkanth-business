import { useEffect, useMemo, useState } from "react";
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
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Eye,
  Printer,
  Save,
  FolderPlus,
  Banknote
} from "lucide-react";

import { supabase } from "./lib/supabase";

/* =========================================================
   NAVIGATION
========================================================= */

const NAV = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["customers", "Customers", Users],
  ["products", "Products", Package],
  ["invoices", "Invoices", FileText],
  ["payments", "Payments", CreditCard],
  ["transactions", "Transactions", ArrowLeftRight],
  ["expenses", "Expenses", Receipt],
  ["salary", "Salary", Banknote],
  ["reports", "Reports", BarChart3],
  ["settings", "Settings", Settings]
];

/* =========================================================
   DEFAULTS
========================================================= */

const emptyCustomer = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "Rajasthan",
  pincode: "",
  gst_number: "",
  notes: ""
};

const emptyProduct = {
  name: "",
  category: "",
  description: "",
  unit: "sq ft",
  default_price: ""
};

const emptyStaff = {
  name: "",
  phone: "",
  email: "",
  designation: "",
  joining_date: "",
  monthly_salary: "",
  status: "active",
  notes: ""
};

const emptySalaryPayment = {
  staff_id: "",
  salary_month: new Date().toISOString().slice(0, 7) + "-01",
  amount: "",
  payment_date: new Date().toISOString().slice(0, 10),
  payment_method: "Cash",
  status: "paid",
  reference_number: "",
  notes: ""
};

const emptyExpense = {
  category_id: "",
  description: "",
  amount: "",
  expense_date: new Date().toISOString().slice(0, 10),
  payment_method: "Cash",
  reference_number: "",
  notes: ""
};

const emptyTransaction = {
  customer_id: "",
  invoice_id: "",
  type: "income",
  amount: "",
  transaction_date: new Date().toISOString().slice(0, 10),
  description: ""
};

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  })}`;

const dateIn = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN")
    : "—";

/* =========================================================
   COMMON COMPONENTS
========================================================= */

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    setBusy(false);

    if (error) setError(error.message);
  }

  return (
    <main className="login">
      <div className="login-card">
        <div className="logo">NS</div>

        <small>NEELKANTH STONES</small>

        <h1>Business Management</h1>

        <p>
          Billing, customers, products, payments and
          business records — all in one place.
        </p>

        <form onSubmit={submit}>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="error">{error}</div>}

          <button disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Modal({ title, children, onClose, wide = false }) {
  return (
    <div className="modal-bg">
      <div className={`modal ${wide ? "modal-wide" : ""}`}>
        <div className="modal-top">
          <h2>{title}</h2>

          <button className="icon" onClick={onClose}>
            <X />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  wide = false,
  textarea = false,
  placeholder = ""
}) {
  return (
    <label className={wide ? "field wide" : "field"}>
      <span>{label}</span>

      {textarea ? (
        <textarea
          rows="3"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}

function Page({ heading, eyebrow, sub, action, children }) {
  return (
    <div className="page">
      <div className="heading">
        <div>
          <small>{eyebrow}</small>
          <h1>{heading}</h1>
          <p>{sub}</p>
        </div>

        {action}
      </div>

      {children}
    </div>
  );
}

function Toolbar({
  query,
  setQuery,
  placeholder,
  count
}) {
  return (
    <div className="toolbar">
      <div className="search">
        <Search />

        <input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <span>{count}</span>
    </div>
  );
}

function Empty({
  icon: Icon,
  title,
  text,
  button,
  onClick
}) {
  return (
    <div className="empty">
      {Icon && <Icon />}

      {title && <strong>{title}</strong>}

      {text && <span>{text}</span>}

      {button && (
        <button className="secondary" onClick={onClick}>
          <Plus />
          {button}
        </button>
      )}
    </div>
  );
}

function Status({ text }) {
  return (
    <span
      className={`status ${String(
        text || ""
      ).toLowerCase()}`}
    >
      {text || "—"}
    </span>
  );
}

/* =========================================================
   CUSTOMERS
========================================================= */

function Customers({ businessId, onCount }) {
  const [list, setList] = useState([]);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyCustomer);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    if (!businessId) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (error) setError(error.message);

    setList(data || []);
    onCount?.(data?.length || 0);
    setLoading(false);
  }

  useEffect(() => {
    if (businessId) load();
  }, [businessId]);

  function openNew() {
    setForm({ ...emptyCustomer });
    setError("");
    setModal("new");
  }

  function openEdit(item) {
    setForm({ ...emptyCustomer, ...item });
    setError("");
    setModal("edit");
  }

  async function save(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Customer name is required.");
      return;
    }

    const payload = {
      ...form,
      business_id: businessId,
      name: form.name.trim()
    };

    const result = form.id
      ? await supabase
          .from("customers")
          .update(payload)
          .eq("id", form.id)
      : await supabase
          .from("customers")
          .insert(payload);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setModal(null);
    load();
  }

  async function remove(item) {
    if (!confirm(`Delete ${item.name}?`)) return;

    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", item.id);

    if (error) setError(error.message);
    else load();
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    if (!q) return list;

    return list.filter((x) =>
      [
        x.name,
        x.phone,
        x.email,
        x.city,
        x.gst_number
      ].some((v) =>
        String(v || "").toLowerCase().includes(q)
      )
    );
  }, [list, query]);

  return (
    <Page
      heading="Customers"
      eyebrow="CUSTOMER MANAGEMENT"
      sub="Manage customer records and contact details."
      action={
        <button onClick={openNew}>
          <Plus />
          Add Customer
        </button>
      }
    >
      <section className="panel">
        <Toolbar
          query={query}
          setQuery={setQuery}
          placeholder="Search name, phone, city or GST..."
          count={`${filtered.length} customer${
            filtered.length !== 1 ? "s" : ""
          }`}
        />

        {error && <div className="error">{error}</div>}

        {loading ? (
          <Empty text="Loading customers..." />
        ) : filtered.length === 0 ? (
          <Empty
            icon={Users}
            title={
              query
                ? "No matching customers"
                : "No customers yet"
            }
            button={!query ? "Add Customer" : ""}
            onClick={openNew}
          />
        ) : (
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>GST</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      <small>
                        {item.email || "No email"}
                      </small>
                    </td>

                    <td>{item.phone || "—"}</td>
                    <td>{item.city || "—"}</td>
                    <td>{item.gst_number || "—"}</td>

                    <td>
                      <button
                        className="icon"
                        onClick={() => openEdit(item)}
                      >
                        <Pencil />
                      </button>

                      <button
                        className="icon danger"
                        onClick={() => remove(item)}
                      >
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modal && (
        <Modal
          title={
            modal === "edit"
              ? "Edit Customer"
              : "Add Customer"
          }
          onClose={() => setModal(null)}
        >
          <form className="grid" onSubmit={save}>
            <Field
              label="Name *"
              value={form.name}
              onChange={(v) =>
                setForm({ ...form, name: v })
              }
            />

            <Field
              label="Phone"
              value={form.phone}
              onChange={(v) =>
                setForm({ ...form, phone: v })
              }
            />

            <Field
              label="Email"
              value={form.email}
              onChange={(v) =>
                setForm({ ...form, email: v })
              }
            />

            <Field
              label="GST Number"
              value={form.gst_number}
              onChange={(v) =>
                setForm({
                  ...form,
                  gst_number: v
                })
              }
            />

            <Field
              label="Address"
              value={form.address}
              onChange={(v) =>
                setForm({
                  ...form,
                  address: v
                })
              }
              wide
            />

            <Field
              label="City"
              value={form.city}
              onChange={(v) =>
                setForm({ ...form, city: v })
              }
            />

            <Field
              label="State"
              value={form.state}
              onChange={(v) =>
                setForm({
                  ...form,
                  state: v
                })
              }
            />

            <Field
              label="Pincode"
              value={form.pincode}
              onChange={(v) =>
                setForm({
                  ...form,
                  pincode: v
                })
              }
            />

            <Field
              label="Notes"
              value={form.notes}
              onChange={(v) =>
                setForm({
                  ...form,
                  notes: v
                })
              }
              wide
              textarea
            />

            {error && (
              <div className="error wide">
                {error}
              </div>
            )}

            <div className="actions wide">
              <button
                type="button"
                className="secondary"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>

              <button>
                <Save />
                Save Customer
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* =========================================================
   PRODUCTS
========================================================= */

function Products({ businessId, onCount }) {
  const [list, setList] = useState([]);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    if (!businessId) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false });

    if (error) setError(error.message);

    setList(data || []);
    onCount?.(data?.length || 0);
    setLoading(false);
  }

  useEffect(() => {
    if (businessId) load();
  }, [businessId]);

  function openNew() {
    setForm({ ...emptyProduct });
    setError("");
    setModal("new");
  }

  function openEdit(item) {
    setForm({
      ...emptyProduct,
      ...item
    });

    setError("");
    setModal("edit");
  }

  async function save(e) {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    const price =
      form.default_price === ""
        ? null
        : Number(form.default_price);

    if (
      price !== null &&
      !Number.isFinite(price)
    ) {
      setError("Default price must be a number.");
      return;
    }

    const payload = {
      business_id: businessId,
      name: form.name.trim(),
      category: form.category || null,
      description: form.description || null,
      unit: form.unit || null,
      default_price: price
    };

    const result = form.id
      ? await supabase
          .from("products")
          .update(payload)
          .eq("id", form.id)
      : await supabase
          .from("products")
          .insert(payload);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setModal(null);
    load();
  }

  async function remove(item) {
    if (!confirm(`Delete ${item.name}?`)) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", item.id);

    if (error) setError(error.message);
    else load();
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    if (!q) return list;

    return list.filter((x) =>
      [
        x.name,
        x.category,
        x.description,
        x.unit
      ].some((v) =>
        String(v || "").toLowerCase().includes(q)
      )
    );
  }, [list, query]);

  return (
    <Page
      heading="Products"
      eyebrow="PRODUCT MANAGEMENT"
      sub="Manage stone products, units and default rates."
      action={
        <button onClick={openNew}>
          <Plus />
          Add Product
        </button>
      }
    >
      <section className="panel">
        <Toolbar
          query={query}
          setQuery={setQuery}
          placeholder="Search product, category or unit..."
          count={`${filtered.length} product${
            filtered.length !== 1 ? "s" : ""
          }`}
        />

        {error && <div className="error">{error}</div>}

        {loading ? (
          <Empty text="Loading products..." />
        ) : filtered.length === 0 ? (
          <Empty
            icon={Package}
            title="No products yet"
            button="Add Product"
            onClick={openNew}
          />
        ) : (
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Rate</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      <small>
                        {item.description ||
                          "No description"}
                      </small>
                    </td>

                    <td>{item.category || "—"}</td>
                    <td>{item.unit || "—"}</td>

                    <td>
                      {item.default_price == null
                        ? "—"
                        : money(item.default_price)}
                    </td>

                    <td>
                      <button
                        className="icon"
                        onClick={() => openEdit(item)}
                      >
                        <Pencil />
                      </button>

                      <button
                        className="icon danger"
                        onClick={() => remove(item)}
                      >
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modal && (
        <Modal
          title={
            modal === "edit"
              ? "Edit Product"
              : "Add Product"
          }
          onClose={() => setModal(null)}
        >
          <form className="grid" onSubmit={save}>
            <Field
              label="Product Name *"
              value={form.name}
              onChange={(v) =>
                setForm({
                  ...form,
                  name: v
                })
              }
            />

            <Field
              label="Category"
              value={form.category}
              onChange={(v) =>
                setForm({
                  ...form,
                  category: v
                })
              }
            />

            <label className="field">
              <span>Unit</span>
              <select
                value={form.unit}
                onChange={(e) =>
                  setForm({
                    ...form,
                    unit: e.target.value
                  })
                }
              >
                <option value="piece">Piece</option>
                <option value="sq ft">Sq. Ft</option>
                <option value="cu ft">Cu. Ft</option>
                <option value="kg">Kg</option>
                <option value="ton">Ton</option>
                <option value="meter">Meter</option>
                <option value="other">Other</option>
              </select>
            </label>

            <Field
              label="Default Price"
              type="number"
              value={form.default_price}
              onChange={(v) =>
                setForm({
                  ...form,
                  default_price: v
                })
              }
            />

            <Field
              label="Description"
              value={form.description}
              onChange={(v) =>
                setForm({
                  ...form,
                  description: v
                })
              }
              wide
              textarea
            />

            {error && (
              <div className="error wide">
                {error}
              </div>
            )}

            <div className="actions wide">
              <button
                type="button"
                className="secondary"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>

              <button>
                <Save />
                Save Product
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* =========================================================
   INVOICE EDITOR
========================================================= */

function InvoiceEditor({
  businessId,
  existing,
  onSaved,
  onClose
}) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);

  const [customerId, setCustomerId] = useState(
    existing?.customer_id || ""
  );

  const [invoiceDate, setInvoiceDate] = useState(
    existing?.invoice_date ||
      new Date().toISOString().slice(0, 10)
  );

  const [dueDate, setDueDate] = useState(
    existing?.due_date || ""
  );

  const [discount, setDiscount] = useState(
    existing?.discount ?? ""
  );

  const [taxRate, setTaxRate] = useState(
    existing?.tax_rate ?? ""
  );

  const [notes, setNotes] = useState(
    existing?.notes || ""
  );

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      const [
        customerResult,
        productResult,
        settingsResult
      ] = await Promise.all([
        supabase
          .from("customers")
          .select("id,name")
          .eq("business_id", businessId)
          .order("name"),

        supabase
          .from("products")
          .select("*")
          .eq("business_id", businessId)
          .order("name"),

        supabase
          .from("business_settings")
          .select("*")
          .eq("business_id", businessId)
          .maybeSingle()
      ]);

      setCustomers(customerResult.data || []);
      setProducts(productResult.data || []);
      setSettings(settingsResult.data || null);

      if (
        !existing &&
        settingsResult.data?.default_tax_rate != null
      ) {
        setTaxRate(
          String(
            settingsResult.data.default_tax_rate
          )
        );
      }

      if (existing) {
        const { data } = await supabase
          .from("invoice_items")
          .select("*")
          .eq("invoice_id", existing.id)
          .order("created_at");

        setItems(
          (data || []).map((x) => ({
            product_id: x.product_id || "",
            product_name: x.product_name || "",
            description: x.description || "",
            quantity: x.quantity || 1,
            unit: x.unit || "sq ft",
            rate: x.rate || 0,
            amount: x.amount || 0
          }))
        );
      } else {
        setItems([
          {
            product_id: "",
            product_name: "",
            description: "",
            quantity: 1,
            unit: "sq ft",
            rate: "",
            amount: 0
          }
        ]);
      }
    }

    load();
  }, [businessId, existing]);

  function setItem(index, key, value) {
    setItems((current) =>
      current.map((item, i) => {
        if (i !== index) return item;

        const next = {
          ...item,
          [key]: value
        };

        if (
          key === "quantity" ||
          key === "rate"
        ) {
          next.amount =
            Number(
              key === "quantity"
                ? value
                : item.quantity || 0
            ) *
            Number(
              key === "rate"
                ? value
                : item.rate || 0
            );
        }

        return next;
      })
    );
  }

  function selectProduct(index, productId) {
    const product = products.find(
      (x) => x.id === productId
    );

    setItems((current) =>
      current.map((item, i) => {
        if (i !== index) return item;

        return {
          ...item,
          product_id: product?.id || "",
          product_name: product?.name || "",
          description: product?.description || "",
          unit: product?.unit || "sq ft",
          rate: product?.default_price ?? "",
          amount:
            Number(item.quantity || 0) *
            Number(product?.default_price || 0)
        };
      })
    );
  }

  function addItem() {
    setItems((current) => [
      ...current,
      {
        product_id: "",
        product_name: "",
        description: "",
        quantity: 1,
        unit: "sq ft",
        rate: "",
        amount: 0
      }
    ]);
  }

  function removeItem(index) {
    setItems((current) =>
      current.length === 1
        ? current
        : current.filter((_, i) => i !== index)
    );
  }

  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(item.amount || 0),
    0
  );

  const discountAmount = Number(discount || 0);

  const taxable = Math.max(
    0,
    subtotal - discountAmount
  );

  const taxAmount =
    taxable * (Number(taxRate || 0) / 100);

  const total = taxable + taxAmount;

  async function save(e) {
    e.preventDefault();
    setError("");

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    if (!items.length) {
      setError("Add at least one item.");
      return;
    }

    if (
      items.some(
        (x) =>
          !x.product_name ||
          Number(x.quantity) <= 0
      )
    ) {
      setError(
        "Complete every invoice item correctly."
      );
      return;
    }

    setBusy(true);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    let invoiceNumber =
      existing?.invoice_number;

    if (!invoiceNumber) {
      const prefix =
        settings?.invoice_prefix || "INV";

      invoiceNumber =
        `${prefix}-${Date.now()
          .toString()
          .slice(-8)}`;
    }

    const payload = {
      business_id: businessId,
      customer_id: customerId,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate || null,
      due_date: dueDate || null,
      subtotal,
      discount: discountAmount,
      tax_rate: Number(taxRate || 0),
      tax_amount: taxAmount,
      total_amount: total,
      notes: notes || null,
      status: existing?.status || "issued",
      payment_status:
        existing?.payment_status || "unpaid",
      created_by:
        existing?.created_by || user?.id || null
    };

    let invoice;
    let invoiceError;

    if (existing) {
      const result = await supabase
        .from("invoices")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .single();

      invoice = result.data;
      invoiceError = result.error;
    } else {
      const result = await supabase
        .from("invoices")
        .insert(payload)
        .select()
        .single();

      invoice = result.data;
      invoiceError = result.error;
    }

    if (invoiceError) {
      setBusy(false);
      setError(invoiceError.message);
      return;
    }

    if (existing) {
      const { error: deleteError } =
        await supabase
          .from("invoice_items")
          .delete()
          .eq("invoice_id", invoice.id);

      if (deleteError) {
        setBusy(false);
        setError(deleteError.message);
        return;
      }
    }

    const itemRows = items.map((item) => ({
      invoice_id: invoice.id,
      product_id: item.product_id || null,
      product_name: item.product_name,
      description: item.description || null,
      quantity: Number(item.quantity),
      unit: item.unit || null,
      rate: Number(item.rate || 0),
      amount: Number(item.amount || 0)
    }));

    const { error: itemError } =
      await supabase
        .from("invoice_items")
        .insert(itemRows);

    if (itemError) {
      setBusy(false);
      setError(itemError.message);
      return;
    }

    setBusy(false);

    alert(
      existing
        ? "Invoice updated successfully."
        : `Invoice ${invoiceNumber} created successfully.`
    );

    onSaved?.();
  }

  return (
    <Page
      heading={
        existing
          ? "Edit Invoice"
          : "New Invoice"
      }
      eyebrow="BILLING"
      sub="Create or update a customer invoice."
      action={
        <button
          type="button"
          className="secondary"
          onClick={() => window.print()}
        >
          <Printer />
          Print
        </button>
      }
    >
      <form
        className="invoice-layout"
        onSubmit={save}
      >
        <section className="panel">
          <div className="section-title">
            <div>
              <h3>Invoice Details</h3>
              <p>
                Customer and billing information.
              </p>
            </div>
          </div>

          <div className="grid">
            <label className="field">
              <span>Customer *</span>

              <select
                value={customerId}
                onChange={(e) =>
                  setCustomerId(e.target.value)
                }
              >
                <option value="">
                  Select customer
                </option>

                {customers.map((x) => (
                  <option
                    key={x.id}
                    value={x.id}
                  >
                    {x.name}
                  </option>
                ))}
              </select>
            </label>

            <Field
              label="Invoice Date"
              type="date"
              value={invoiceDate}
              onChange={setInvoiceDate}
            />

            <Field
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={setDueDate}
            />

            <Field
              label="Tax Rate %"
              type="number"
              value={taxRate}
              onChange={setTaxRate}
            />

            <Field
              label="Discount"
              type="number"
              value={discount}
              onChange={setDiscount}
            />

            <Field
              label="Notes"
              value={notes}
              onChange={setNotes}
              wide
              textarea
            />
          </div>
        </section>

        <section className="panel">
          <div className="section-title">
            <div>
              <h3>Invoice Items</h3>
              <p>
                Products, quantities and rates.
              </p>
            </div>

            <button
              type="button"
              className="secondary"
              onClick={addItem}
            >
              <Plus />
              Add Item
            </button>
          </div>

          <div className="invoice-items">
            {items.map((item, index) => (
              <div
                className="invoice-row"
                key={index}
              >
                <label>
                  <span>Product</span>

                  <select
                    value={item.product_id}
                    onChange={(e) =>
                      selectProduct(
                        index,
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select product
                    </option>

                    {products.map((x) => (
                      <option
                        key={x.id}
                        value={x.id}
                      >
                        {x.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Qty</span>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) =>
                      setItem(
                        index,
                        "quantity",
                        e.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>Unit</span>

                  <input
                    value={item.unit}
                    onChange={(e) =>
                      setItem(
                        index,
                        "unit",
                        e.target.value
                      )
                    }
                  />
                </label>

                <label>
                  <span>Rate</span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) =>
                      setItem(
                        index,
                        "rate",
                        e.target.value
                      )
                    }
                  />
                </label>

                <div className="amount-cell">
                  <span>Amount</span>

                  <strong>
                    {money(item.amount)}
                  </strong>
                </div>

                <button
                  type="button"
                  className="icon danger"
                  onClick={() =>
                    removeItem(index)
                  }
                >
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="panel totals-panel">
          <div>
            <span>Subtotal</span>
            <strong>{money(subtotal)}</strong>
          </div>

          <div>
            <span>Discount</span>
            <strong>
              − {money(discountAmount)}
            </strong>
          </div>

          <div>
            <span>
              Tax ({Number(taxRate || 0)}%)
            </span>

            <strong>
              {money(taxAmount)}
            </strong>
          </div>

          <div className="grand">
            <span>Grand Total</span>
            <strong>{money(total)}</strong>
          </div>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          <button
            className="save-invoice"
            disabled={busy}
          >
            {busy
              ? "Saving..."
              : existing
              ? "Update Invoice"
              : "Save Invoice"}
          </button>

          <button
            type="button"
            className="secondary"
            onClick={onClose}
          >
            Cancel
          </button>
        </section>
      </form>
    </Page>
  );
}

/* =========================================================
   INVOICES
========================================================= */

function Invoices({ businessId }) {
  const [list, setList] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("list");
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);

    const [invoiceResult, customerResult] =
      await Promise.all([
        supabase
          .from("invoices")
          .select("*")
          .eq("business_id", businessId)
          .order("invoice_date", {
            ascending: false
          }),

        supabase
          .from("customers")
          .select("id,name")
          .eq("business_id", businessId)
      ]);

    if (invoiceResult.error)
      setError(invoiceResult.error.message);

    setList(invoiceResult.data || []);
    setCustomers(customerResult.data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (businessId) load();
  }, [businessId]);

  const customerNames = Object.fromEntries(
    customers.map((x) => [x.id, x.name])
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    if (!q) return list;

    return list.filter((x) =>
      [
        x.invoice_number,
        customerNames[x.customer_id],
        x.status,
        x.payment_status
      ].some((v) =>
        String(v || "").toLowerCase().includes(q)
      )
    );
  }, [list, query, customerNames]);

  async function remove(invoice) {
    if (
      !confirm(
        `Delete invoice ${invoice.invoice_number}?`
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", invoice.id);

    if (error) {
      setError(error.message);
      return;
    }

    load();
  }

  if (mode === "new") {
    return (
      <InvoiceEditor
        businessId={businessId}
        onSaved={() => {
          setMode("list");
          load();
        }}
        onClose={() => setMode("list")}
      />
    );
  }

  if (editing) {
    return (
      <InvoiceEditor
        businessId={businessId}
        existing={editing}
        onSaved={() => {
          setEditing(null);
          load();
        }}
        onClose={() => setEditing(null)}
      />
    );
  }

  return (
    <Page
      heading="Invoices"
      eyebrow="BILLING HISTORY"
      sub="Create, view, edit and manage invoices."
      action={
        <button onClick={() => setMode("new")}>
          <Plus />
          New Invoice
        </button>
      }
    >
      <section className="panel">
        <Toolbar
          query={query}
          setQuery={setQuery}
          placeholder="Search invoice, customer or status..."
          count={`${filtered.length} invoice${
            filtered.length !== 1 ? "s" : ""
          }`}
        />

        {error && (
          <div className="error">{error}</div>
        )}

        {loading ? (
          <Empty text="Loading invoices..." />
        ) : filtered.length === 0 ? (
          <Empty
            icon={FileText}
            title="No invoices yet"
            button="New Invoice"
            onClick={() => setMode("new")}
          />
        ) : (
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <strong>
                        {invoice.invoice_number}
                      </strong>
                    </td>

                    <td>
                      {customerNames[
                        invoice.customer_id
                      ] || "—"}
                    </td>

                    <td>
                      {dateIn(
                        invoice.invoice_date
                      )}
                    </td>

                    <td>
                      {money(invoice.total_amount)}
                    </td>

                    <td>
                      <Status
                        text={
                          invoice.payment_status
                        }
                      />
                    </td>

                    <td>
                      <button
                        className="icon"
                        onClick={() =>
                          setViewing(invoice)
                        }
                      >
                        <Eye />
                      </button>

                      <button
                        className="icon"
                        onClick={() =>
                          setEditing(invoice)
                        }
                      >
                        <Pencil />
                      </button>

                      <button
                        className="icon danger"
                        onClick={() =>
                          remove(invoice)
                        }
                      >
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {viewing && (
        <InvoiceView
          invoice={viewing}
          customerName={
            customerNames[
              viewing.customer_id
            ]
          }
          onClose={() => setViewing(null)}
        />
      )}
    </Page>
  );
}

/* =========================================================
   INVOICE VIEW
========================================================= */

function InvoiceView({
  invoice,
  customerName,
  onClose
}) {
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("invoice_items")
        .select("*")
        .eq("invoice_id", invoice.id)
        .order("created_at");

      setItems(data || []);

      if (invoice.customer_id) {
        const { data: customerData } =
          await supabase
            .from("customers")
            .select("*")
            .eq("id", invoice.customer_id)
            .maybeSingle();

        setCustomer(customerData);
      }
    }

    load();
  }, [invoice]);

  return (
    <Modal
      title={`Invoice ${invoice.invoice_number}`}
      onClose={onClose}
      wide
    >
      <div className="invoice-print">
        <div className="section-title">
          <div>
            <h3>Neelkanth Stones</h3>
            <p>
              Invoice: {invoice.invoice_number}
            </p>
          </div>

          <button
            className="secondary"
            onClick={() => window.print()}
          >
            <Printer />
            Print
          </button>
        </div>

        <div className="grid">
          <div>
            <strong>Customer</strong>
            <p>
              {customerName ||
                customer?.name ||
                "—"}
            </p>
          </div>

          <div>
            <strong>Invoice Date</strong>
            <p>
              {dateIn(invoice.invoice_date)}
            </p>
          </div>

          <div>
            <strong>Due Date</strong>
            <p>
              {dateIn(invoice.due_date)}
            </p>
          </div>

          <div>
            <strong>Payment Status</strong>
            <p>
              <Status
                text={invoice.payment_status}
              />
            </p>
          </div>
        </div>

        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.product_name}
                  </td>

                  <td>
                    {item.quantity}
                  </td>

                  <td>
                    {item.unit || "—"}
                  </td>

                  <td>
                    {money(item.rate)}
                  </td>

                  <td>
                    {money(item.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="totals-panel">
          <div>
            <span>Subtotal</span>
            <strong>
              {money(invoice.subtotal)}
            </strong>
          </div>

          <div>
            <span>Discount</span>
            <strong>
              {money(invoice.discount)}
            </strong>
          </div>

          <div>
            <span>Tax</span>
            <strong>
              {money(invoice.tax_amount)}
            </strong>
          </div>

          <div className="grand">
            <span>Total</span>
            <strong>
              {money(invoice.total_amount)}
            </strong>
          </div>
        </div>

        {invoice.notes && (
          <div className="notice">
            {invoice.notes}
          </div>
        )}
      </div>
    </Modal>
  );
}

/* =========================================================
   PAYMENTS
========================================================= */

function Payments({ businessId }) {
  const [list, setList] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [modal, setModal] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    invoice_id: "",
    customer_id: "",
    amount: "",
    payment_date: new Date()
      .toISOString()
      .slice(0, 10),
    payment_method: "Cash",
    reference_number: "",
    notes: ""
  });

  async function load() {
    const [
      paymentResult,
      invoiceResult,
      customerResult
    ] = await Promise.all([
      supabase
        .from("payments")
        .select("*")
        .eq("business_id", businessId)
        .order("payment_date", {
          ascending: false
        }),

      supabase
        .from("invoices")
        .select(
          "id,invoice_number,customer_id,total_amount"
        )
        .eq("business_id", businessId),

      supabase
        .from("customers")
        .select("id,name")
        .eq("business_id", businessId)
    ]);

    if (paymentResult.error)
      setError(paymentResult.error.message);

    setList(paymentResult.data || []);
    setInvoices(invoiceResult.data || []);
    setCustomers(customerResult.data || []);
  }

  useEffect(() => {
    if (businessId) load();
  }, [businessId]);

  const customerNames = Object.fromEntries(
    customers.map((x) => [x.id, x.name])
  );

  const invoiceNames = Object.fromEntries(
    invoices.map((x) => [
      x.id,
      x.invoice_number
    ])
  );

  function selectInvoice(id) {
    const invoice = invoices.find(
      (x) => x.id === id
    );

    setForm({
      ...form,
      invoice_id: id,
      customer_id:
        invoice?.customer_id || ""
    });
  }

  async function save(e) {
    e.preventDefault();
    setError("");

    if (Number(form.amount) <= 0) {
      setError("Enter a valid payment amount.");
      return;
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    const payload = {
      business_id: businessId,
      invoice_id: form.invoice_id || null,
      customer_id: form.customer_id || null,
      amount: Number(form.amount),
      payment_date:
        form.payment_date || null,
      payment_method: form.payment_method,
      reference_number:
        form.reference_number || null,
      notes: form.notes || null,
      received_by: user?.id || null
    };

    const { data: payment, error } =
      await supabase
        .from("payments")
        .insert(payload)
        .select()
        .single();

    if (error) {
      setError(error.message);
      return;
    }

    if (form.invoice_id) {
      const invoice = invoices.find(
        (x) => x.id === form.invoice_id
      );

      const previous =
        list
          .filter(
            (x) =>
              x.invoice_id === form.invoice_id
          )
          .reduce(
            (sum, x) =>
              sum + Number(x.amount || 0),
            0
          );

      const paid =
        previous + Number(form.amount);

      const total =
        Number(invoice?.total_amount || 0);

      const status =
        paid >= total
          ? "paid"
          : paid > 0
          ? "partial"
          : "unpaid";

      await supabase
        .from("invoices")
        .update({
          payment_status: status
        })
        .eq("id", form.invoice_id);
    }

    await supabase
      .from("transactions")
      .insert({
        business_id: businessId,
        customer_id: form.customer_id || null,
        invoice_id: form.invoice_id || null,
        payment_id: payment.id,
        type: "payment",
        amount: Number(form.amount),
        transaction_date:
          form.payment_date || null,
        description:
          `Payment received via ${form.payment_method}`,
        created_by: user?.id || null
      });

    setModal(false);

    setForm({
      invoice_id: "",
      customer_id: "",
      amount: "",
      payment_date: new Date()
        .toISOString()
        .slice(0, 10),
      payment_method: "Cash",
      reference_number: "",
      notes: ""
    });

    load();
  }

  async function remove(payment) {
    if (!confirm("Delete this payment?")) return;

    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", payment.id);

    if (error) {
      setError(error.message);
      return;
    }

    await supabase
      .from("transactions")
      .delete()
      .eq("payment_id", payment.id);

    load();
  }

  return (
    <Page
      heading="Payments"
      eyebrow="COLLECTIONS"
      sub="Record and manage customer payments."
      action={
        <button onClick={() => setModal(true)}>
          <Plus />
          Record Payment
        </button>
      }
    >
      <section className="panel">
        {error && (
          <div className="error">{error}</div>
        )}

        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Invoice</th>
                <th>Amount</th>
                <th>Method</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    No payments yet.
                  </td>
                </tr>
              ) : (
                list.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {dateIn(item.payment_date)}
                    </td>

                    <td>
                      {customerNames[
                        item.customer_id
                      ] || "—"}
                    </td>

                    <td>
                      {invoiceNames[
                        item.invoice_id
                      ] || "—"}
                    </td>

                    <td>
                      <strong>
                        {money(item.amount)}
                      </strong>
                    </td>

                    <td>
                      {item.payment_method || "—"}
                    </td>

                    <td>
                      <button
                        className="icon danger"
                        onClick={() =>
                          remove(item)
                        }
                      >
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modal && (
        <Modal
          title="Record Payment"
          onClose={() => setModal(false)}
        >
          <form
            className="grid"
            onSubmit={save}
          >
            <label className="field wide">
              <span>Invoice</span>

              <select
                value={form.invoice_id}
                onChange={(e) =>
                  selectInvoice(e.target.value)
                }
              >
                <option value="">
                  Select invoice
                </option>

                {invoices.map((x) => (
                  <option
                    key={x.id}
                    value={x.id}
                  >
                    {x.invoice_number} —{" "}
                    {money(x.total_amount)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Customer</span>

              <select
                value={form.customer_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    customer_id:
                      e.target.value
                  })
                }
              >
                <option value="">
                  Select customer
                </option>

                {customers.map((x) => (
                  <option
                    key={x.id}
                    value={x.id}
                  >
                    {x.name}
                  </option>
                ))}
              </select>
            </label>

            <Field
              label="Amount *"
              type="number"
              value={form.amount}
              onChange={(v) =>
                setForm({
                  ...form,
                  amount: v
                })
              }
            />

            <Field
              label="Payment Date"
              type="date"
              value={form.payment_date}
              onChange={(v) =>
                setForm({
                  ...form,
                  payment_date: v
                })
              }
            />

            <label className="field">
              <span>Payment Method</span>

              <select
                value={form.payment_method}
                onChange={(e) =>
                  setForm({
                    ...form,
                    payment_method:
                      e.target.value
                  })
                }
              >
                <option>Cash</option>
                <option>UPI</option>
                <option>Bank Transfer</option>
                <option>Cheque</option>
                <option>Other</option>
              </select>
            </label>

            <Field
              label="Reference Number"
              value={form.reference_number}
              onChange={(v) =>
                setForm({
                  ...form,
                  reference_number: v
                })
              }
            />

            <Field
              label="Notes"
              value={form.notes}
              onChange={(v) =>
                setForm({
                  ...form,
                  notes: v
                })
              }
              wide
              textarea
            />

            {error && (
              <div className="error wide">
                {error}
              </div>
            )}

            <div className="actions wide">
              <button
                type="button"
                className="secondary"
                onClick={() => setModal(false)}
              >
                Cancel
              </button>

              <button>
                Save Payment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* =========================================================
   TRANSACTIONS
========================================================= */

function Transactions({ businessId }) {
  const [list, setList] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] =
    useState(emptyTransaction);

  async function load() {
    const [
      transactionResult,
      customerResult,
      invoiceResult
    ] = await Promise.all([
      supabase
        .from("transactions")
        .select("*")
        .eq("business_id", businessId)
        .order("transaction_date", {
          ascending: false
        }),

      supabase
        .from("customers")
        .select("id,name")
        .eq("business_id", businessId),

      supabase
        .from("invoices")
        .select("id,invoice_number")
        .eq("business_id", businessId)
    ]);

    if (transactionResult.error)
      setError(
        transactionResult.error.message
      );

    setList(transactionResult.data || []);
    setCustomers(customerResult.data || []);
    setInvoices(invoiceResult.data || []);
  }

  useEffect(() => {
    if (businessId) load();
  }, [businessId]);

  const customerNames = Object.fromEntries(
    customers.map((x) => [x.id, x.name])
  );

  const invoiceNames = Object.fromEntries(
    invoices.map((x) => [
      x.id,
      x.invoice_number
    ])
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    if (!q) return list;

    return list.filter((x) =>
      [
        x.type,
        x.description,
        x.amount,
        customerNames[x.customer_id],
        invoiceNames[x.invoice_id]
      ].some((v) =>
        String(v || "").toLowerCase().includes(q)
      )
    );
  }, [
    list,
    query,
    customerNames,
    invoiceNames
  ]);

  async function save(e) {
    e.preventDefault();
    setError("");

    if (Number(form.amount) <= 0) {
      setError("Enter a valid amount.");
      return;
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("transactions")
      .insert({
        business_id: businessId,
        customer_id:
          form.customer_id || null,
        invoice_id:
          form.invoice_id || null,
        type: form.type,
        amount: Number(form.amount),
        transaction_date:
          form.transaction_date || null,
        description:
          form.description || null,
        created_by: user?.id || null
      });

    if (error) {
      setError(error.message);
      return;
    }

    setModal(false);
    setForm({ ...emptyTransaction });
    load();
  }

  async function remove(item) {
    if (!confirm("Delete this transaction?"))
      return;

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", item.id);

    if (error) setError(error.message);
    else load();
  }

  return (
    <Page
      heading="Transactions"
      eyebrow="LEDGER"
      sub="Complete business transaction history."
      action={
        <button onClick={() => setModal(true)}>
          <Plus />
          Add Transaction
        </button>
      }
    >
      <section className="panel">
        <Toolbar
          query={query}
          setQuery={setQuery}
          placeholder="Search transaction..."
          count={`${filtered.length} transaction${
            filtered.length !== 1 ? "s" : ""
          }`}
        />

        {error && (
          <div className="error">{error}</div>
        )}

        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Customer</th>
                <th>Invoice</th>
                <th>Description</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {dateIn(
                        item.transaction_date
                      )}
                    </td>

                    <td>
                      <Status text={item.type} />
                    </td>

                    <td>
                      {customerNames[
                        item.customer_id
                      ] || "—"}
                    </td>

                    <td>
                      {invoiceNames[
                        item.invoice_id
                      ] || "—"}
                    </td>

                    <td>
                      {item.description || "—"}
                    </td>

                    <td>
                      <strong>
                        {money(item.amount)}
                      </strong>
                    </td>

                    <td>
                      <button
                        className="icon danger"
                        onClick={() =>
                          remove(item)
                        }
                      >
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modal && (
        <Modal
          title="Add Transaction"
          onClose={() => setModal(false)}
        >
          <form
            className="grid"
            onSubmit={save}
          >
            <label className="field">
              <span>Type</span>

              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value
                  })
                }
              >
                <option value="income">
                  Income
                </option>

                <option value="expense">
                  Expense
                </option>

                <option value="adjustment">
                  Adjustment
                </option>
              </select>
            </label>

            <Field
              label="Amount *"
              type="number"
              value={form.amount}
              onChange={(v) =>
                setForm({
                  ...form,
                  amount: v
                })
              }
            />

            <Field
              label="Date"
              type="date"
              value={form.transaction_date}
              onChange={(v) =>
                setForm({
                  ...form,
                  transaction_date: v
                })
              }
            />

            <label className="field">
              <span>Customer</span>

              <select
                value={form.customer_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    customer_id:
                      e.target.value
                  })
                }
              >
                <option value="">
                  None
                </option>

                {customers.map((x) => (
                  <option
                    key={x.id}
                    value={x.id}
                  >
                    {x.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Invoice</span>

              <select
                value={form.invoice_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    invoice_id:
                      e.target.value
                  })
                }
              >
                <option value="">
                  None
                </option>

                {invoices.map((x) => (
                  <option
                    key={x.id}
                    value={x.id}
                  >
                    {x.invoice_number}
                  </option>
                ))}
              </select>
            </label>

            <Field
              label="Description"
              value={form.description}
              onChange={(v) =>
                setForm({
                  ...form,
                  description: v
                })
              }
            />

            {error && (
              <div className="error wide">
                {error}
              </div>
            )}

            <div className="actions wide">
              <button
                type="button"
                className="secondary"
                onClick={() => setModal(false)}
              >
                Cancel
              </button>

              <button>
                Save Transaction
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* =========================================================
   EXPENSES + CATEGORIES
========================================================= */

function Expenses({ businessId }) {
  const [list, setList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(null);
  const [categoryModal, setCategoryModal] =
    useState(false);

  const [form, setForm] =
    useState(emptyExpense);

  const [categoryName, setCategoryName] =
    useState("");

  const [error, setError] = useState("");

  async function load() {
    const [expenseResult, categoryResult] =
      await Promise.all([
        supabase
          .from("expenses")
          .select("*")
          .eq("business_id", businessId)
          .order("expense_date", {
            ascending: false
          }),

        supabase
          .from("expense_categories")
          .select("*")
          .eq("business_id", businessId)
          .order("name")
      ]);

    if (expenseResult.error)
      setError(expenseResult.error.message);

    setList(expenseResult.data || []);
    setCategories(categoryResult.data || []);
  }

  useEffect(() => {
    if (businessId) load();
  }, [businessId]);

  const categoryNames = Object.fromEntries(
    categories.map((x) => [x.id, x.name])
  );

  function openNew() {
    setForm({
      ...emptyExpense,
      expense_date: new Date()
        .toISOString()
        .slice(0, 10)
    });

    setError("");
    setModal("new");
  }

  function openEdit(item) {
    setForm({
      ...emptyExpense,
      ...item
    });

    setError("");
    setModal("edit");
  }

  async function save(e) {
    e.preventDefault();
    setError("");

    if (
      !form.description.trim() ||
      Number(form.amount) <= 0
    ) {
      setError(
        "Description and valid amount are required."
      );
      return;
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    const payload = {
      business_id: businessId,
      category_id:
        form.category_id || null,
      description: form.description.trim(),
      amount: Number(form.amount),
      expense_date:
        form.expense_date || null,
      payment_method:
        form.payment_method || null,
      reference_number:
        form.reference_number || null,
      notes: form.notes || null,
      created_by:
        form.created_by || user?.id || null
    };

    let expense;
    let expenseError;

    if (form.id) {
      const result = await supabase
        .from("expenses")
        .update(payload)
        .eq("id", form.id)
        .select()
        .single();

      expense = result.data;
      expenseError = result.error;
    } else {
      const result = await supabase
        .from("expenses")
        .insert(payload)
        .select()
        .single();

      expense = result.data;
      expenseError = result.error;
    }

    if (expenseError) {
      setError(expenseError.message);
      return;
    }

    if (!form.id) {
      await supabase
        .from("transactions")
        .insert({
          business_id: businessId,
          type: "expense",
          amount: Number(form.amount),
          transaction_date:
            form.expense_date || null,
          description:
            form.description.trim(),
          created_by:
            user?.id || null
        });
    }

    setModal(null);
    load();
  }

  async function remove(item) {
    if (
      !confirm(
        `Delete expense "${item.description}"?`
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", item.id);

    if (error) {
      setError(error.message);
      return;
    }

    load();
  }

  async function addCategory(e) {
    e.preventDefault();

    if (!categoryName.trim()) return;

    const { error } = await supabase
      .from("expense_categories")
      .insert({
        business_id: businessId,
        name: categoryName.trim()
      });

    if (error) {
      setError(error.message);
      return;
    }

    setCategoryName("");
    setCategoryModal(false);
    load();
  }

  async function removeCategory(item) {
    if (
      !confirm(
        `Delete category "${item.name}"?`
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from("expense_categories")
      .delete()
      .eq("id", item.id);

    if (error) {
      setError(error.message);
      return;
    }

    load();
  }

  return (
    <Page
      heading="Expenses"
      eyebrow="EXPENSE MANAGEMENT"
      sub="Record expenses and manage expense categories."
      action={
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="secondary"
            onClick={() =>
              setCategoryModal(true)
            }
          >
            <FolderPlus />
            Categories
          </button>

          <button onClick={openNew}>
            <Plus />
            Add Expense
          </button>
        </div>
      }
    >
      <section className="panel">
        {error && (
          <div className="error">{error}</div>
        )}

        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Method</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    No expenses yet.
                  </td>
                </tr>
              ) : (
                list.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {dateIn(
                        item.expense_date
                      )}
                    </td>

                    <td>
                      {categoryNames[
                        item.category_id
                      ] || "—"}
                    </td>

                    <td>
                      {item.description}
                    </td>

                    <td>
                      <strong>
                        {money(item.amount)}
                      </strong>
                    </td>

                    <td>
                      {item.payment_method || "—"}
                    </td>

                    <td>
                      <button
                        className="icon"
                        onClick={() =>
                          openEdit(item)
                        }
                      >
                        <Pencil />
                      </button>

                      <button
                        className="icon danger"
                        onClick={() =>
                          remove(item)
                        }
                      >
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modal && (
        <Modal
          title={
            modal === "edit"
              ? "Edit Expense"
              : "Add Expense"
          }
          onClose={() => setModal(null)}
        >
          <form
            className="grid"
            onSubmit={save}
          >
            <label className="field">
              <span>Category</span>

              <select
                value={form.category_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category_id:
                      e.target.value
                  })
                }
              >
                <option value="">
                  Select category
                </option>

                {categories.map((x) => (
                  <option
                    key={x.id}
                    value={x.id}
                  >
                    {x.name}
                  </option>
                ))}
              </select>
            </label>

            <Field
              label="Description *"
              value={form.description}
              onChange={(v) =>
                setForm({
                  ...form,
                  description: v
                })
              }
            />

            <Field
              label="Amount *"
              type="number"
              value={form.amount}
              onChange={(v) =>
                setForm({
                  ...form,
                  amount: v
                })
              }
            />

            <Field
              label="Date"
              type="date"
              value={form.expense_date}
              onChange={(v) =>
                setForm({
                  ...form,
                  expense_date: v
                })
              }
            />

            <label className="field">
              <span>Payment Method</span>

              <select
                value={form.payment_method}
                onChange={(e) =>
                  setForm({
                    ...form,
                    payment_method:
                      e.target.value
                  })
                }
              >
                <option>Cash</option>
                <option>UPI</option>
                <option>Bank Transfer</option>
                <option>Cheque</option>
                <option>Other</option>
              </select>
            </label>

            <Field
              label="Reference Number"
              value={form.reference_number}
              onChange={(v) =>
                setForm({
                  ...form,
                  reference_number: v
                })
              }
            />

            <Field
              label="Notes"
              value={form.notes}
              onChange={(v) =>
                setForm({
                  ...form,
                  notes: v
                })
              }
              wide
              textarea
            />

            {error && (
              <div className="error wide">
                {error}
              </div>
            )}

            <div className="actions wide">
              <button
                type="button"
                className="secondary"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>

              <button>
                Save Expense
              </button>
            </div>
          </form>
        </Modal>
      )}

      {categoryModal && (
        <Modal
          title="Expense Categories"
          onClose={() =>
            setCategoryModal(false)
          }
        >
          <form
            className="grid"
            onSubmit={addCategory}
          >
            <Field
              label="New Category"
              value={categoryName}
              onChange={setCategoryName}
              wide
              placeholder="Transport, Electricity, Salary..."
            />

            <div className="actions wide">
              <button
                type="button"
                className="secondary"
                onClick={() =>
                  setCategoryModal(false)
                }
              >
                Close
              </button>

              <button>
                <Plus />
                Add Category
              </button>
            </div>
          </form>

          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {categories.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>

                    <td>
                      <button
                        className="icon danger"
                        onClick={() =>
                          removeCategory(item)
                        }
                      >
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </Page>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  businessId,
  customerCount,
  productCount
}) {
  const [stats, setStats] = useState({
    sales: 0,
    paid: 0,
    expenses: 0,
    invoices: 0
  });

  async function load() {
    const [
      invoiceResult,
      paymentResult,
      expenseResult
    ] = await Promise.all([
      supabase
        .from("invoices")
        .select("total_amount")
        .eq("business_id", businessId)
        .neq("status", "cancelled"),

      supabase
        .from("payments")
        .select("amount")
        .eq("business_id", businessId),

      supabase
        .from("expenses")
        .select("amount")
        .eq("business_id", businessId)
    ]);

    const sales =
      (invoiceResult.data || []).reduce(
        (s, x) =>
          s + Number(x.total_amount || 0),
        0
      );

    const paid =
      (paymentResult.data || []).reduce(
        (s, x) =>
          s + Number(x.amount || 0),
        0
      );

    const expenses =
      (expenseResult.data || []).reduce(
        (s, x) =>
          s + Number(x.amount || 0),
        0
      );

    setStats({
      sales,
      paid,
      expenses,
      invoices:
        invoiceResult.data?.length || 0
    });
  }

  useEffect(() => {
    if (businessId) load();
  }, [businessId]);

  const Stat = ({ title, value }) => (
    <div className="stat">
      <small>{title}</small>
      <strong>{value}</strong>
    </div>
  );

  return (
    <Page
      heading="Dashboard"
      eyebrow="OVERVIEW"
      sub="Neelkanth Stones business snapshot."
      action={
        <button onClick={load}>
          <RefreshCw />
          Refresh
        </button>
      }
    >
      <div className="stats">
        <Stat
          title="Customers"
          value={customerCount}
        />

        <Stat
          title="Products"
          value={productCount}
        />

        <Stat
          title="Total Sales"
          value={money(stats.sales)}
        />

        <Stat
          title="Collected"
          value={money(stats.paid)}
        />

        <Stat
          title="Outstanding"
          value={money(
            Math.max(
              0,
              stats.sales - stats.paid
            )
          )}
        />

        <Stat
          title="Expenses"
          value={money(stats.expenses)}
        />

        <Stat
          title="Invoices"
          value={stats.invoices}
        />

        <Stat
          title="Net Cash"
          value={money(
            stats.paid - stats.expenses
          )}
        />
      </div>

      <section className="panel empty">
        <LayoutDashboard />

        <strong>
          Live business dashboard
        </strong>

        <span>
          Sales, payments, expenses and
          invoices are connected to Supabase.
        </span>
      </section>
    </Page>
  );
}

/* =========================================================
   REPORTS
========================================================= */

function Reports({ businessId }) {
  const [data, setData] = useState({
    sales: 0,
    paid: 0,
    expenses: 0,
    invoices: 0
  });

  async function load() {
    const [
      invoiceResult,
      paymentResult,
      expenseResult
    ] = await Promise.all([
      supabase
        .from("invoices")
        .select("total_amount")
        .eq("business_id", businessId)
        .neq("status", "cancelled"),

      supabase
        .from("payments")
        .select("amount")
        .eq("business_id", businessId),

      supabase
        .from("expenses")
        .select("amount")
        .eq("business_id", businessId)
    ]);

    const sales =
      (invoiceResult.data || []).reduce(
        (s, x) =>
          s + Number(x.total_amount || 0),
        0
      );

    const paid =
      (paymentResult.data || []).reduce(
        (s, x) =>
          s + Number(x.amount || 0),
        0
      );

    const expenses =
      (expenseResult.data || []).reduce(
        (s, x) =>
          s + Number(x.amount || 0),
        0
      );

    setData({
      sales,
      paid,
      expenses,
      invoices:
        invoiceResult.data?.length || 0
    });
  }

  useEffect(() => {
    if (businessId) load();
  }, [businessId]);

  return (
    <Page
      heading="Reports"
      eyebrow="BUSINESS REPORTS"
      sub="Live financial summary."
      action={
        <button onClick={load}>
          <RefreshCw />
          Refresh
        </button>
      }
    >
      <div className="report-grid">
        {[
          ["Sales", money(data.sales)],
          [
            "Payments Received",
            money(data.paid)
          ],
          [
            "Expenses",
            money(data.expenses)
          ],
          [
            "Outstanding",
            money(
              Math.max(
                0,
                data.sales - data.paid
              )
            )
          ],
          ["Invoices", data.invoices]
        ].map(([title, value]) => (
          <div
            className="report-card"
            key={title}
          >
            <small>{title}</small>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </Page>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function SettingsPage({ business }) {
  const [businessForm, setBusinessForm] =
    useState({
      name: business?.name || "",
      phone: business?.phone || "",
      email: business?.email || "",
      address: business?.address || "",
      city: business?.city || "",
      state: business?.state || "",
      pincode: business?.pincode || "",
      gst_number: business?.gst_number || ""
    });

  const [invoiceForm, setInvoiceForm] =
    useState({
      invoice_prefix: "INV",
      default_tax_rate: 0,
      currency: "INR",
      invoice_notes: "",
      invoice_terms: ""
    });

  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      if (!business?.id) return;

      const { data } = await supabase
        .from("business_settings")
        .select("*")
        .eq("business_id", business.id)
        .maybeSingle();

      if (data) {
        setInvoiceForm({
          invoice_prefix:
            data.invoice_prefix || "INV",
          default_tax_rate:
            data.default_tax_rate ?? 0,
          currency:
            data.currency || "INR",
          invoice_notes:
            data.invoice_notes || "",
          invoice_terms:
            data.invoice_terms || ""
        });
      }
    }

    load();
  }, [business]);

  async function save(e) {
    e.preventDefault();

    if (!business?.id) return;

    setBusy(true);
    setMessage("");

    const { error: businessError } =
      await supabase
        .from("businesses")
        .update(businessForm)
        .eq("id", business.id);

    if (businessError) {
      setBusy(false);
      setMessage(
        businessError.message
      );
      return;
    }

    const { data: existing } =
      await supabase
        .from("business_settings")
        .select("id")
        .eq("business_id", business.id)
        .maybeSingle();

    let settingsError;

    if (existing?.id) {
      const result = await supabase
        .from("business_settings")
        .update({
          ...invoiceForm,
          business_id: business.id,
          default_tax_rate:
            Number(
              invoiceForm.default_tax_rate || 0
            )
        })
        .eq("id", existing.id);

      settingsError = result.error;
    } else {
      const result = await supabase
        .from("business_settings")
        .insert({
          ...invoiceForm,
          business_id: business.id,
          default_tax_rate:
            Number(
              invoiceForm.default_tax_rate || 0
            )
        });

      settingsError = result.error;
    }

    setBusy(false);

    setMessage(
      settingsError
        ? settingsError.message
        : "Business settings saved successfully."
    );
  }

  return (
    <Page
      heading="Settings"
      eyebrow="BUSINESS SETTINGS"
      sub="Business and invoice configuration."
    >
      <section className="panel">
        <form
          className="grid"
          onSubmit={save}
        >
          <Field
            label="Business Name"
            value={businessForm.name}
            onChange={(v) =>
              setBusinessForm({
                ...businessForm,
                name: v
              })
            }
          />

          <Field
            label="Phone"
            value={businessForm.phone}
            onChange={(v) =>
              setBusinessForm({
                ...businessForm,
                phone: v
              })
            }
          />

          <Field
            label="Email"
            value={businessForm.email}
            onChange={(v) =>
              setBusinessForm({
                ...businessForm,
                email: v
              })
            }
          />

          <Field
            label="GST Number"
            value={businessForm.gst_number}
            onChange={(v) =>
              setBusinessForm({
                ...businessForm,
                gst_number: v
              })
            }
          />

          <Field
            label="Address"
            value={businessForm.address}
            onChange={(v) =>
              setBusinessForm({
                ...businessForm,
                address: v
              })
            }
            wide
          />

          <Field
            label="City"
            value={businessForm.city}
            onChange={(v) =>
              setBusinessForm({
                ...businessForm,
                city: v
              })
            }
          />

          <Field
            label="State"
            value={businessForm.state}
            onChange={(v) =>
              setBusinessForm({
                ...businessForm,
                state: v
              })
            }
          />

          <Field
            label="Pincode"
            value={businessForm.pincode}
            onChange={(v) =>
              setBusinessForm({
                ...businessForm,
                pincode: v
              })
            }
          />

          <Field
            label="Invoice Prefix"
            value={invoiceForm.invoice_prefix}
            onChange={(v) =>
              setInvoiceForm({
                ...invoiceForm,
                invoice_prefix: v
              })
            }
          />

          <Field
            label="Default Tax Rate %"
            type="number"
            value={invoiceForm.default_tax_rate}
            onChange={(v) =>
              setInvoiceForm({
                ...invoiceForm,
                default_tax_rate: v
              })
            }
          />

          <Field
            label="Currency"
            value={invoiceForm.currency}
            onChange={(v) =>
              setInvoiceForm({
                ...invoiceForm,
                currency: v
              })
            }
          />

          <Field
            label="Invoice Notes"
            value={invoiceForm.invoice_notes}
            onChange={(v) =>
              setInvoiceForm({
                ...invoiceForm,
                invoice_notes: v
              })
            }
            wide
            textarea
          />

          <Field
            label="Invoice Terms"
            value={invoiceForm.invoice_terms}
            onChange={(v) =>
              setInvoiceForm({
                ...invoiceForm,
                invoice_terms: v
              })
            }
            wide
            textarea
          />

          {message && (
            <div className="notice wide">
              {message}
            </div>
          )}

          <div className="actions wide">
            <button disabled={busy}>
              <Save />
              {busy
                ? "Saving..."
                : "Save All Settings"}
            </button>
          </div>
        </form>
      </section>
    </Page>
  );
}

/* =========================================================
   SALARY / STAFF
========================================================= */

function Salary({ businessId }) {
  const [tab, setTab] = useState("payments");
  const [staff, setStaff] = useState([]);
  const [payments, setPayments] = useState([]);
  const [modal, setModal] = useState(null);
  const [staffForm, setStaffForm] = useState({ ...emptyStaff });
  const [paymentForm, setPaymentForm] = useState({ ...emptySalaryPayment });
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    if (!businessId) return;
    setLoading(true);
    setError("");

    const [staffResult, paymentResult] = await Promise.all([
      supabase
        .from("staff")
        .select("*")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false }),
      supabase
        .from("salary_payments")
        .select("*, staff:staff_id(id,name,designation)")
        .eq("business_id", businessId)
        .order("salary_month", { ascending: false })
        .order("payment_date", { ascending: false })
    ]);

    if (staffResult.error) setError(staffResult.error.message);
    if (paymentResult.error) setError(paymentResult.error.message);

    setStaff(staffResult.data || []);
    setPayments(paymentResult.data || []);
    setLoading(false);
  }

  useEffect(() => {
    if (businessId) load();
  }, [businessId]);

  function openNewStaff() {
    setStaffForm({ ...emptyStaff });
    setError("");
    setModal("staff-new");
  }

  function openEditStaff(item) {
    setStaffForm({
      ...emptyStaff,
      ...item,
      monthly_salary:
        item.monthly_salary == null ? "" : item.monthly_salary
    });
    setError("");
    setModal("staff-edit");
  }

  function openNewPayment() {
    setPaymentForm({
      ...emptySalaryPayment,
      staff_id: staff[0]?.id || ""
    });
    setError("");
    setModal("payment-new");
  }

  async function saveStaff(e) {
    e.preventDefault();
    setError("");

    if (!staffForm.name.trim()) {
      setError("Staff name is required.");
      return;
    }

    const salary =
      staffForm.monthly_salary === ""
        ? 0
        : Number(staffForm.monthly_salary);

    if (!Number.isFinite(salary) || salary < 0) {
      setError("Monthly salary must be a valid amount.");
      return;
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    const payload = {
      business_id: businessId,
      name: staffForm.name.trim(),
      phone: staffForm.phone || null,
      email: staffForm.email || null,
      designation: staffForm.designation || null,
      joining_date: staffForm.joining_date || null,
      monthly_salary: salary,
      status: staffForm.status || "active",
      notes: staffForm.notes || null,
      created_by: staffForm.created_by || user?.id || null
    };

    const result = staffForm.id
      ? await supabase
          .from("staff")
          .update(payload)
          .eq("id", staffForm.id)
      : await supabase
          .from("staff")
          .insert(payload);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setModal(null);
    load();
  }

  async function removeStaff(item) {
    if (!confirm(`Delete ${item.name}? Salary history for this staff member will also be deleted.`)) return;

    const { error } = await supabase
      .from("staff")
      .delete()
      .eq("id", item.id);

    if (error) setError(error.message);
    else load();
  }

  async function savePayment(e) {
    e.preventDefault();
    setError("");

    if (!paymentForm.staff_id) {
      setError("Please select a staff member.");
      return;
    }

    if (Number(paymentForm.amount) <= 0) {
      setError("Enter a valid salary amount.");
      return;
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    const payload = {
      business_id: businessId,
      staff_id: paymentForm.staff_id,
      salary_month: paymentForm.salary_month || null,
      amount: Number(paymentForm.amount),
      payment_date: paymentForm.payment_date || null,
      payment_method: paymentForm.payment_method || "Cash",
      status: paymentForm.status || "paid",
      reference_number: paymentForm.reference_number || null,
      notes: paymentForm.notes || null,
      paid_by: user?.id || null
    };

    const { error } = await supabase
      .from("salary_payments")
      .insert(payload);

    if (error) {
      setError(error.message);
      return;
    }

    setModal(null);
    load();
  }

  async function removePayment(item) {
    if (!confirm("Delete this salary payment?")) return;

    const { error } = await supabase
      .from("salary_payments")
      .delete()
      .eq("id", item.id);

    if (error) setError(error.message);
    else load();
  }

  const filteredStaff = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return staff;
    return staff.filter((x) =>
      [x.name, x.phone, x.email, x.designation, x.status].some((v) =>
        String(v || "").toLowerCase().includes(q)
      )
    );
  }, [staff, query]);

  const filteredPayments = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return payments;
    return payments.filter((x) =>
      [
        x.staff?.name,
        x.staff?.designation,
        x.payment_method,
        x.status,
        x.reference_number,
        x.notes,
        x.salary_month
      ].some((v) =>
        String(v || "").toLowerCase().includes(q)
      )
    );
  }, [payments, query]);

  const totalPaid = payments.reduce(
    (sum, x) => sum + Number(x.amount || 0),
    0
  );

  return (
    <Page
      heading="Salary"
      eyebrow="STAFF & SALARY MANAGEMENT"
      sub="Manage staff members separately from business expenses and track salary payments."
      action={
        tab === "staff" ? (
          <button onClick={openNewStaff}>
            <Plus />
            Add Staff
          </button>
        ) : (
          <button onClick={openNewPayment} disabled={!staff.length}>
            <Plus />
            Record Salary
          </button>
        )
      }
    >
      <section className="panel salary-summary">
        <div>
          <span>Active Staff</span>
          <strong>{staff.filter((x) => x.status === "active").length}</strong>
        </div>
        <div>
          <span>Total Staff</span>
          <strong>{staff.length}</strong>
        </div>
        <div>
          <span>Total Salary Paid</span>
          <strong>{money(totalPaid)}</strong>
        </div>
      </section>

      <div className="salary-tabs">
        <button
          className={tab === "payments" ? "active" : ""}
          onClick={() => {
            setTab("payments");
            setQuery("");
          }}
        >
          Salary Payments
        </button>
        <button
          className={tab === "staff" ? "active" : ""}
          onClick={() => {
            setTab("staff");
            setQuery("");
          }}
        >
          Staff
        </button>
      </div>

      <section className="panel">
        <Toolbar
          query={query}
          setQuery={setQuery}
          placeholder={
            tab === "staff"
              ? "Search staff, phone or designation..."
              : "Search staff, month, method or status..."
          }
          count={
            tab === "staff"
              ? `${filteredStaff.length} staff`
              : `${filteredPayments.length} payment${filteredPayments.length !== 1 ? "s" : ""}`
          }
        />

        {error && <div className="error">{error}</div>}

        {loading ? (
          <Empty text="Loading salary records..." />
        ) : tab === "staff" ? (
          filteredStaff.length === 0 ? (
            <Empty
              icon={Users}
              title="No staff yet"
              button="Add Staff"
              onClick={openNewStaff}
            />
          ) : (
            <div className="table">
              <table>
                <thead>
                  <tr>
                    <th>Staff</th>
                    <th>Designation</th>
                    <th>Phone</th>
                    <th>Monthly Salary</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.name}</strong>
                        <small>{item.email || "No email"}</small>
                      </td>
                      <td>{item.designation || "—"}</td>
                      <td>{item.phone || "—"}</td>
                      <td>{money(item.monthly_salary)}</td>
                      <td><Status text={item.status} /></td>
                      <td>
                        <button className="icon" onClick={() => openEditStaff(item)}>
                          <Pencil />
                        </button>
                        <button className="icon danger" onClick={() => removeStaff(item)}>
                          <Trash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : filteredPayments.length === 0 ? (
          <Empty
            icon={Banknote}
            title="No salary payments yet"
            text={staff.length ? "Record the first salary payment." : "Add staff before recording salary."}
            button={staff.length ? "Record Salary" : "Add Staff"}
            onClick={staff.length ? openNewPayment : openNewStaff}
          />
        ) : (
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Salary Month</th>
                  <th>Payment Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.staff?.name || "—"}</strong>
                      <small>{item.staff?.designation || "Staff"}</small>
                    </td>
                    <td>{dateIn(item.salary_month)}</td>
                    <td>{dateIn(item.payment_date)}</td>
                    <td><strong>{money(item.amount)}</strong></td>
                    <td>{item.payment_method || "—"}</td>
                    <td><Status text={item.status} /></td>
                    <td>
                      <button className="icon danger" onClick={() => removePayment(item)}>
                        <Trash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modal === "staff-new" || modal === "staff-edit" ? (
        <Modal
          title={modal === "staff-edit" ? "Edit Staff" : "Add Staff"}
          onClose={() => setModal(null)}
        >
          <form className="grid" onSubmit={saveStaff}>
            <Field
              label="Staff Name *"
              value={staffForm.name}
              onChange={(v) => setStaffForm({ ...staffForm, name: v })}
            />
            <Field
              label="Phone"
              value={staffForm.phone}
              onChange={(v) => setStaffForm({ ...staffForm, phone: v })}
            />
            <Field
              label="Email"
              value={staffForm.email}
              onChange={(v) => setStaffForm({ ...staffForm, email: v })}
            />
            <Field
              label="Designation"
              value={staffForm.designation}
              onChange={(v) => setStaffForm({ ...staffForm, designation: v })}
            />
            <Field
              label="Joining Date"
              type="date"
              value={staffForm.joining_date}
              onChange={(v) => setStaffForm({ ...staffForm, joining_date: v })}
            />
            <Field
              label="Monthly Salary"
              type="number"
              value={staffForm.monthly_salary}
              onChange={(v) => setStaffForm({ ...staffForm, monthly_salary: v })}
            />
            <label className="field">
              <span>Status</span>
              <select
                value={staffForm.status}
                onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <Field
              label="Notes"
              value={staffForm.notes}
              onChange={(v) => setStaffForm({ ...staffForm, notes: v })}
              wide
              textarea
            />
            {error && <div className="error wide">{error}</div>}
            <div className="actions wide">
              <button type="button" className="secondary" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button>
                <Save />
                Save Staff
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {modal === "payment-new" && (
        <Modal title="Record Salary Payment" onClose={() => setModal(null)}>
          <form className="grid" onSubmit={savePayment}>
            <label className="field wide">
              <span>Staff *</span>
              <select
                value={paymentForm.staff_id}
                onChange={(e) => {
                  const id = e.target.value;
                  const selected = staff.find((x) => x.id === id);
                  setPaymentForm({
                    ...paymentForm,
                    staff_id: id,
                    amount:
                      paymentForm.amount === ""
                        ? selected?.monthly_salary ?? ""
                        : paymentForm.amount
                  });
                }}
              >
                <option value="">Select staff</option>
                {staff.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}{item.designation ? ` — ${item.designation}` : ""}
                  </option>
                ))}
              </select>
            </label>

            <Field
              label="Salary Month"
              type="date"
              value={paymentForm.salary_month}
              onChange={(v) => setPaymentForm({ ...paymentForm, salary_month: v })}
            />
            <Field
              label="Amount *"
              type="number"
              value={paymentForm.amount}
              onChange={(v) => setPaymentForm({ ...paymentForm, amount: v })}
            />
            <Field
              label="Payment Date"
              type="date"
              value={paymentForm.payment_date}
              onChange={(v) => setPaymentForm({ ...paymentForm, payment_date: v })}
            />

            <label className="field">
              <span>Payment Method</span>
              <select
                value={paymentForm.payment_method}
                onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
              >
                <option>Cash</option>
                <option>UPI</option>
                <option>Bank Transfer</option>
                <option>Cheque</option>
                <option>Other</option>
              </select>
            </label>

            <label className="field">
              <span>Status</span>
              <select
                value={paymentForm.status}
                onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
              >
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="pending">Pending</option>
              </select>
            </label>

            <Field
              label="Reference Number"
              value={paymentForm.reference_number}
              onChange={(v) => setPaymentForm({ ...paymentForm, reference_number: v })}
            />
            <Field
              label="Notes"
              value={paymentForm.notes}
              onChange={(v) => setPaymentForm({ ...paymentForm, notes: v })}
              wide
              textarea
            />

            {error && <div className="error wide">{error}</div>}
            <div className="actions wide">
              <button type="button" className="secondary" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button>
                <Save />
                Save Salary Payment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </Page>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

export default function App() {
  const [session, setSession] = useState(null);
  const [business, setBusiness] = useState(null);
  const [profile, setProfile] = useState(null);

  const [page, setPage] =
    useState("dashboard");

  const [customerCount, setCustomerCount] =
    useState(0);

  const [productCount, setProductCount] =
    useState(0);

  const [mobile, setMobile] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  async function account(uid) {
    const { data: profileData } =
      await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
        .maybeSingle();

    const { data: membership } =
      await supabase
        .from("business_members")
        .select(
          "business_id,role,businesses(*)"
        )
        .eq("user_id", uid)
        .eq("role", "owner")
        .maybeSingle();

    setProfile(profileData);

    setBusiness(
      membership?.businesses || null
    );

    if (membership?.business_id) {
      const [
        customers,
        products
      ] = await Promise.all([
        supabase
          .from("customers")
          .select("id", {
            count: "exact",
            head: true
          })
          .eq(
            "business_id",
            membership.business_id
          ),

        supabase
          .from("products")
          .select("id", {
            count: "exact",
            head: true
          })
          .eq(
            "business_id",
            membership.business_id
          )
      ]);

      setCustomerCount(
        customers.count || 0
      );

      setProductCount(
        products.count || 0
      );
    }
  }

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);

        if (data.session) {
          account(
            data.session.user.id
          );
        }

        setLoading(false);
      });

    const {
      data: listener
    } =
      supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          setSession(newSession);

          if (newSession) {
            account(
              newSession.user.id
            );
          } else {
            setBusiness(null);
            setProfile(null);
          }
        }
      );

    return () =>
      listener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="empty">
        Loading...
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  const current =
    NAV.find(
      (item) => item[0] === page
    ) || NAV[0];

  const Icon = current[2];

  return (
    <div className="app">
      <aside
        className={`side ${
          mobile ? "open" : ""
        }`}
      >
        <div className="brand">
          <div className="logo">
            NS
          </div>

          <b>Neelkanth</b>

          <button
            className="icon mobile"
            onClick={() =>
              setMobile(false)
            }
          >
            <X />
          </button>
        </div>

        <nav>
          {NAV.map(
            ([id, label, NavIcon]) => (
              <button
                key={id}
                className={
                  page === id
                    ? "active"
                    : ""
                }
                onClick={() => {
                  setPage(id);
                  setMobile(false);
                }}
              >
                <NavIcon />
                {label}
              </button>
            )
          )}
        </nav>

        <div className="user">
          {profile?.full_name ||
            "Owner"}

          <small>
            {session.user.email}
          </small>

          <button
            onClick={() =>
              supabase.auth.signOut()
            }
          >
            <LogOut />
            Logout
          </button>
        </div>
      </aside>

      <main>
        <header>
          <button
            className="icon mobile-menu"
            onClick={() =>
              setMobile(true)
            }
          >
            <Menu />
          </button>

          <Icon />

          {current[1]}

          <span>
            {business?.name ||
              "Neelkanth Stones"}
          </span>
        </header>

        {page === "dashboard" && (
          <Dashboard
            businessId={business?.id}
            customerCount={
              customerCount
            }
            productCount={
              productCount
            }
          />
        )}

        {page === "customers" && (
          <Customers
            businessId={business?.id}
            onCount={
              setCustomerCount
            }
          />
        )}

        {page === "products" && (
          <Products
            businessId={business?.id}
            onCount={
              setProductCount
            }
          />
        )}

        {page === "invoices" && (
          <Invoices
            businessId={business?.id}
          />
        )}

        {page === "payments" && (
          <Payments
            businessId={business?.id}
          />
        )}

        {page === "transactions" && (
          <Transactions
            businessId={business?.id}
          />
        )}

        {page === "expenses" && (
          <Expenses
            businessId={business?.id}
          />
        )}

        {page === "salary" && (
          <Salary
            businessId={business?.id}
          />
        )}

        {page === "reports" && (
          <Reports
            businessId={business?.id}
          />
        )}

        {page === "settings" && (
          <SettingsPage
            business={business}
          />
        )}
      </main>
    </div>
  );
}
