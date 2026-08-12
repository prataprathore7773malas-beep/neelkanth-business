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
  Printer,
  RefreshCw
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
  ["reports", "Reports", BarChart3],
  ["settings", "Settings", Settings]
];

/* =========================================================
   DEFAULT FORMS
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

const emptyExpense = {
  category_id: "",
  description: "",
  amount: "",
  expense_date: new Date().toISOString().slice(0, 10),
  payment_method: "Cash",
  reference_number: "",
  notes: ""
};

/* =========================================================
   HELPERS
========================================================= */

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  })}`;

const dateIn = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "—";

/* =========================================================
   LOGIN
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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setBusy(false);

    if (error) {
      setError(error.message);
    }
  }

  return (
    <main className="login">
      <div className="login-card">
        <div className="logo">NS</div>

        <small>NEELKANTH STONES</small>

        <h1>Business Management</h1>

        <p>
          Billing, customers, payments and business records —
          all in one place.
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

/* =========================================================
   COMMON MODAL
========================================================= */

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

/* =========================================================
   COMMON FIELD
========================================================= */

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

/* =========================================================
   COMMON PAGE
========================================================= */

function Page({
  heading,
  eyebrow,
  sub,
  action,
  children
}) {
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

/* =========================================================
   TOOLBAR
========================================================= */

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

/* =========================================================
   TABLE
========================================================= */

function DataTable({ headers, rows }) {
  return (
    <div className="table">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

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

/* =========================================================
   STATUS
========================================================= */

function Status({ text }) {
  return (
    <span
      className={`status ${String(text || "").toLowerCase()}`}
    >
      {text || "—"}
    </span>
  );
}

/* =========================================================
   STAT
========================================================= */

function Stat({ title, value }) {
  return (
    <div className="stat">
      <small>{title}</small>
      <strong>{value}</strong>
    </div>
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
    setError("");

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", {
        ascending: false
      });

    if (error) {
      setError(error.message);
    }

    setList(data || []);

    onCount?.(data?.length || 0);

    setLoading(false);
  }

  useEffect(() => {
    if (businessId) {
      load();
    }
  }, [businessId]);

  function openNew() {
    setForm(emptyCustomer);
    setModal("new");
    setError("");
  }

  function openEdit(customer) {
    setForm({
      ...emptyCustomer,
      ...customer
    });

    setModal("edit");
    setError("");
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
      name: form.name.trim(),
      business_id: businessId
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

  async function remove(customer) {
    if (!confirm(`Delete ${customer.name}?`)) {
      return;
    }

    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", customer.id);

    if (error) {
      setError(error.message);
    } else {
      load();
    }
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    if (!q) {
      return list;
    }

    return list.filter((customer) =>
      [
        customer.name,
        customer.phone,
        customer.email,
        customer.city,
        customer.gst_number
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(q)
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
          <DataTable
            headers={[
              "Customer",
              "Phone",
              "City",
              "GST",
              ""
            ]}
            rows={filtered.map((customer) => [
              <>
                <strong>{customer.name}</strong>
                <small>
                  {customer.email || "No email"}
                </small>
              </>,

              customer.phone || "—",

              customer.city || "—",

              customer.gst_number || "—",

              <>
                <button
                  className="icon"
                  onClick={() =>
                    openEdit(customer)
                  }
                >
                  <Pencil />
                </button>

                <button
                  className="icon danger"
                  onClick={() =>
                    remove(customer)
                  }
                >
                  <Trash2 />
                </button>
              </>
            ])}
          />
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
              onChange={(value) =>
                setForm({
                  ...form,
                  name: value
                })
              }
            />

            <Field
              label="Phone"
              value={form.phone}
              onChange={(value) =>
                setForm({
                  ...form,
                  phone: value
                })
              }
            />

            <Field
              label="Email"
              value={form.email}
              onChange={(value) =>
                setForm({
                  ...form,
                  email: value
                })
              }
            />

            <Field
              label="GST Number"
              value={form.gst_number}
              onChange={(value) =>
                setForm({
                  ...form,
                  gst_number: value
                })
              }
            />

            <Field
              label="Address"
              value={form.address}
              onChange={(value) =>
                setForm({
                  ...form,
                  address: value
                })
              }
              wide
            />

            <Field
              label="City"
              value={form.city}
              onChange={(value) =>
                setForm({
                  ...form,
                  city: value
                })
              }
            />

            <Field
              label="State"
              value={form.state}
              onChange={(value) =>
                setForm({
                  ...form,
                  state: value
                })
              }
            />

            <Field
              label="Pincode"
              value={form.pincode}
              onChange={(value) =>
                setForm({
                  ...form,
                  pincode: value
                })
              }
            />

            <Field
              label="Notes"
              value={form.notes}
              onChange={(value) =>
                setForm({
                  ...form,
                  notes: value
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
    setError("");

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("business_id", businessId)
      .order("created_at", {
        ascending: false
      });

    if (error) {
      setError(error.message);
    }

    setList(data || []);

    onCount?.(data?.length || 0);

    setLoading(false);
  }

  useEffect(() => {
    if (businessId) {
      load();
    }
  }, [businessId]);

  function openNew() {
    setForm(emptyProduct);
    setModal("new");
    setError("");
  }

  function openEdit(product) {
    setForm({
      ...emptyProduct,
      ...product,
      default_price:
        product.default_price ?? ""
    });

    setModal("edit");
    setError("");
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
      setError(
        "Default price must be a number."
      );
      return;
    }

    const payload = {
      business_id: businessId,
      name: form.name.trim(),
      category:
        form.category.trim() || null,
      description:
        form.description.trim() || null,
      unit:
        form.unit.trim() || null,
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

  async function remove(product) {
    if (!confirm(`Delete ${product.name}?`)) {
      return;
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      setError(error.message);
    } else {
      load();
    }
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();

    if (!q) {
      return list;
    }

    return list.filter((product) =>
      [
        product.name,
        product.category,
        product.description,
        product.unit
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(q)
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
            title={
              query
                ? "No matching products"
                : "No products yet"
            }
            button={!query ? "Add Product" : ""}
            onClick={openNew}
          />
        ) : (
          <DataTable
            headers={[
              "Product",
              "Category",
              "Unit",
              "Default Price",
              ""
            ]}
            rows={filtered.map((product) => [
              <>
                <strong>{product.name}</strong>

                <small>
                  {product.description ||
                    "No description"}
                </small>
              </>,

              product.category || "—",

              product.unit || "—",

              product.default_price == null
                ? "—"
                : money(
                    product.default_price
                  ),

              <>
                <button
                  className="icon"
                  onClick={() =>
                    openEdit(product)
                  }
                >
                  <Pencil />
                </button>

                <button
                  className="icon danger"
                  onClick={() =>
                    remove(product)
                  }
                >
                  <Trash2 />
                </button>
              </>
            ])}
          />
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
              onChange={(value) =>
                setForm({
                  ...form,
                  name: value
                })
              }
            />

            <Field
              label="Category"
              value={form.category}
              onChange={(value) =>
                setForm({
                  ...form,
                  category: value
                })
              }
              placeholder="Jodhpur Stone"
            />

            <Field
              label="Unit"
              value={form.unit}
              onChange={(value) =>
                setForm({
                  ...form,
                  unit: value
                })
              }
              placeholder="sq ft"
            />

            <Field
              label="Default Price"
              type="number"
              value={form.default_price}
              onChange={(value) =>
                setForm({
                  ...form,
                  default_price: value
                })
              }
            />

            <Field
              label="Description"
              value={form.description}
              onChange={(value) =>
                setForm({
                  ...form,
                  description: value
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
   INVOICE BUILDER
========================================================= */

function InvoiceBuilder({
  businessId,
  onSaved
}) {
  const [customers, setCustomers] =
    useState([]);

  const [products, setProducts] =
    useState([]);

  const [settings, setSettings] =
    useState(null);

  const [customerId, setCustomerId] =
    useState("");

  const [invoiceDate, setInvoiceDate] =
    useState(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

  const [dueDate, setDueDate] =
    useState("");

  const [discount, setDiscount] =
    useState("");

  const [taxRate, setTaxRate] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [items, setItems] = useState([
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

  const [error, setError] =
    useState("");

  const [busy, setBusy] =
    useState(false);

  useEffect(() => {
    async function loadData() {
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

      setCustomers(
        customerResult.data || []
      );

      setProducts(
        productResult.data || []
      );

      setSettings(
        settingsResult.data || null
      );

      if (
        settingsResult.data?.default_tax_rate !=
        null
      ) {
        setTaxRate(
          String(
            settingsResult.data
              .default_tax_rate
          )
        );
      }
    }

    if (businessId) {
      loadData();
    }
  }, [businessId]);

  function setItem(
    index,
    key,
    value
  ) {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

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

  function selectProduct(
    index,
    productId
  ) {
    const product = products.find(
      (item) => item.id === productId
    );

    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        return {
          ...item,

          product_id:
            product?.id || "",

          product_name:
            product?.name || "",

          description:
            product?.description || "",

          unit:
            product?.unit || "sq ft",

          rate:
            product?.default_price ?? "",

          amount:
            Number(item.quantity || 0) *
            Number(
              product?.default_price || 0
            )
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
        : current.filter(
            (_, i) => i !== index
          )
    );
  }

  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(item.amount || 0),
    0
  );

  const discountAmount =
    Number(discount || 0);

  const taxableAmount = Math.max(
    0,
    subtotal - discountAmount
  );

  const taxAmount =
    taxableAmount *
    (Number(taxRate || 0) / 100);

  const totalAmount =
    taxableAmount + taxAmount;

  async function saveInvoice(e) {
    e.preventDefault();

    setError("");

    if (!customerId) {
      setError("Select a customer.");
      return;
    }

    if (
      items.some(
        (item) =>
          !item.product_name ||
          Number(item.quantity) <= 0 ||
          Number(item.rate) < 0
      )
    ) {
      setError(
        "Complete all invoice items."
      );

      return;
    }

    setBusy(true);

    const {
      data: { user }
    } = await supabase.auth.getUser();

    const prefix =
      settings?.invoice_prefix || "INV";

    const invoiceNumber = `${prefix}-${Date.now()
      .toString()
      .slice(-8)}`;

    const invoicePayload = {
      business_id: businessId,
      customer_id: customerId,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate || null,
      due_date: dueDate || null,
      subtotal,
      discount: discountAmount,
      tax_rate: Number(taxRate || 0),
      tax_amount: taxAmount,
      total_amount: totalAmount,
      notes: notes || null,
      status: "issued",
      payment_status: "unpaid",
      created_by: user?.id || null
    };

    const {
      data: invoice,
      error: invoiceError
    } = await supabase
      .from("invoices")
      .insert(invoicePayload)
      .select()
      .single();

    if (invoiceError) {
      setBusy(false);
      setError(invoiceError.message);
      return;
    }

    const itemRows = items.map(
      (item) => ({
        invoice_id: invoice.id,
        product_id:
          item.product_id || null,
        product_name:
          item.product_name,
        description:
          item.description || null,
        quantity:
          Number(item.quantity),
        unit:
          item.unit || null,
        rate:
          Number(item.rate),
        amount:
          Number(item.amount)
      })
    );

    const {
      error: itemError
    } = await supabase
      .from("invoice_items")
      .insert(itemRows);

    if (itemError) {
      await supabase
        .from("invoices")
        .delete()
        .eq("id", invoice.id);

      setBusy(false);

      setError(itemError.message);

      return;
    }

    setBusy(false);

    alert(
      `Invoice ${invoiceNumber} saved successfully.`
    );

    onSaved?.();
  }

  return (
    <Page
      heading="New Invoice"
      eyebrow="BILLING"
      sub="Create and save a customer invoice."
      action={
        <button
          className="secondary"
          type="button"
          onClick={() => window.print()}
        >
          <Printer />
          Print
        </button>
      }
    >
      <form
        onSubmit={saveInvoice}
        className="invoice-layout"
      >
        <section className="panel">
          <div className="section-title">
            <div>
              <h3>Invoice Details</h3>
              <p>
                Customer and billing
                information.
              </p>
            </div>
          </div>

          <div className="grid">
            <label className="field">
              <span>Customer *</span>

              <select
                value={customerId}
                onChange={(e) =>
                  setCustomerId(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select customer
                </option>

                {customers.map(
                  (customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.name}
                    </option>
                  )
                )}
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
              <h3>Items</h3>
              <p>
                Add stone products to
                the invoice.
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

                    {products.map(
                      (product) => (
                        <option
                          key={product.id}
                          value={product.id}
                        >
                          {product.name}
                        </option>
                      )
                    )}
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

            <strong>
              {money(subtotal)}
            </strong>
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

            <strong>
              {money(totalAmount)}
            </strong>
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
              ? "Saving Invoice..."
              : "Save Invoice"}
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
  const [customers, setCustomers] =
    useState([]);
  const [query, setQuery] = useState("");
  const [mode, setMode] =
    useState("list");
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  async function load() {
    setLoading(true);

    const [
      invoiceResult,
      customerResult
    ] = await Promise.all([
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

    if (invoiceResult.error) {
      setError(
        invoiceResult.error.message
      );
    }

    setList(invoiceResult.data || []);

    setCustomers(
      customerResult.data || []
    );

    setLoading(false);
  }

  useEffect(() => {
    if (businessId) {
      load();
    }
  }, [businessId]);

  const customerNames = useMemo(
    () =>
      Object.fromEntries(
        customers.map((customer) => [
          customer.id,
          customer.name
        ])
      ),
    [customers]
  );

  const filtered = useMemo(() => {
    const q = query
      .toLowerCase()
      .trim();

    if (!q) {
      return list;
    }

    return list.filter((invoice) =>
      [
        invoice.invoice_number,
        customerNames[
          invoice.customer_id
        ],
        invoice.status,
        invoice.payment_status
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [
    list,
    query,
    customerNames
  ]);

  if (mode === "new") {
    return (
      <InvoiceBuilder
        businessId={businessId}
        onSaved={() => {
          setMode("list");
          load();
        }}
      />
    );
  }

  return (
    <Page
      heading="Invoices"
      eyebrow="BILLING HISTORY"
      sub="View saved invoices and billing status."
      action={
        <button
          onClick={() =>
            setMode("new")
          }
        >
          <Plus />
          New Invoice
        </button>
      }
    >
      <section className="panel">
        <Toolbar
          query={query}
          setQuery={setQuery}
          placeholder="Search invoice number, customer or status..."
          count={`${filtered.length} invoice${
            filtered.length !== 1
              ? "s"
              : ""
          }`}
        />

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {loading ? (
          <Empty text="Loading invoices..." />
        ) : filtered.length === 0 ? (
          <Empty
            icon={FileText}
            title="No invoices yet"
            button="New Invoice"
            onClick={() =>
              setMode("new")
            }
          />
        ) : (
          <DataTable
            headers={[
              "Invoice",
              "Customer",
              "Date",
              "Total",
              "Status",
              "Payment"
            ]}
            rows={filtered.map(
              (invoice) => [
                <strong>
                  {invoice.invoice_number}
                </strong>,

                customerNames[
                  invoice.customer_id
                ] ||
                  "Walk-in / Unknown",

                dateIn(
                  invoice.invoice_date
                ),

                money(
                  invoice.total_amount
                ),

                <Status
                  text={
                    invoice.status
                  }
                />,

                <Status
                  text={
                    invoice.payment_status
                  }
                />
              ]
            )}
          />
        )}
      </section>
    </Page>
  );
}

/* =========================================================
   PAYMENTS
========================================================= */

function Payments({ businessId }) {
  const [list, setList] =
    useState([]);

  const [invoices, setInvoices] =
    useState([]);

  const [customers, setCustomers] =
    useState([]);

  const [form, setForm] =
    useState({
      invoice_id: "",
      customer_id: "",
      amount: "",
      payment_date:
        new Date()
          .toISOString()
          .slice(0, 10),
      payment_method: "Cash",
      reference_number: "",
      notes: ""
    });

  const [modal, setModal] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  async function load() {
    setLoading(true);

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
          "id,invoice_number,customer_id,total_amount,payment_status"
        )
        .eq("business_id", businessId)
        .neq("status", "cancelled"),

      supabase
        .from("customers")
        .select("id,name")
        .eq("business_id", businessId)
    ]);

    if (paymentResult.error) {
      setError(
        paymentResult.error.message
      );
    }

    setList(paymentResult.data || []);
    setInvoices(
      invoiceResult.data || []
    );
    setCustomers(
      customerResult.data || []
    );

    setLoading(false);
  }

  useEffect(() => {
    if (businessId) {
      load();
    }
  }, [businessId]);

  const customerNames =
    Object.fromEntries(
      customers.map((customer) => [
        customer.id,
        customer.name
      ])
    );

  const invoiceNames =
    Object.fromEntries(
      invoices.map((invoice) => [
        invoice.id,
        invoice.invoice_number
      ])
    );

  function selectInvoice(id) {
    const invoice = invoices.find(
      (item) => item.id === id
    );

    setForm((current) => ({
      ...current,
      invoice_id: id,
      customer_id:
        invoice?.customer_id || ""
    }));
  }

  async function save(e) {
    e.preventDefault();

    setError("");

    if (
      !Number(form.amount) ||
      Number(form.amount) <= 0
    ) {
      setError(
        "Enter a valid payment amount."
      );

      return;
    }

    const {
      data: { user }
    } =
      await supabase.auth.getUser();

    const payload = {
      business_id: businessId,
      invoice_id:
        form.invoice_id || null,
      customer_id:
        form.customer_id || null,
      amount: Number(form.amount),
      payment_date:
        form.payment_date || null,
      payment_method:
        form.payment_method,
      reference_number:
        form.reference_number || null,
      notes: form.notes || null,
      received_by:
        user?.id || null
    };

    const {
      data: payment,
      error
    } = await supabase
      .from("payments")
      .insert(payload)
      .select()
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    /* -----------------------------------------
       Update invoice payment status
    ----------------------------------------- */

    if (form.invoice_id) {
      const invoice =
        invoices.find(
          (item) =>
            item.id ===
            form.invoice_id
        );

      const previousPayments =
        list
          .filter(
            (item) =>
              item.invoice_id ===
              form.invoice_id
          )
          .reduce(
            (sum, item) =>
              sum +
              Number(
                item.amount || 0
              ),
            0
          );

      const paid =
        previousPayments +
        Number(form.amount);

      const invoiceTotal =
        Number(
          invoice?.total_amount || 0
        );

      let paymentStatus = "partial";

      if (paid >= invoiceTotal) {
        paymentStatus = "paid";
      }

      await supabase
        .from("invoices")
        .update({
          payment_status:
            paymentStatus
        })
        .eq(
          "id",
          form.invoice_id
        );
    }

    /* -----------------------------------------
       Create transaction
    ----------------------------------------- */

    await supabase
      .from("transactions")
      .insert({
        business_id: businessId,
        customer_id:
          form.customer_id || null,
        invoice_id:
          form.invoice_id || null,
        payment_id:
          payment?.id || null,
        type: "payment",
        amount: Number(form.amount),
        transaction_date:
          form.payment_date || null,
        description:
          `Payment received via ${form.payment_method}`,
        created_by:
          user?.id || null
      });

    setModal(false);

    setForm({
      invoice_id: "",
      customer_id: "",
      amount: "",
      payment_date:
        new Date()
          .toISOString()
          .slice(0, 10),
      payment_method: "Cash",
      reference_number: "",
      notes: ""
    });

    load();
  }

  return (
    <Page
      heading="Payments"
      eyebrow="COLLECTIONS"
      sub="Record customer payments and update invoice payment status."
      action={
        <button
          onClick={() => {
            setError("");
            setModal(true);
          }}
        >
          <Plus />
          Record Payment
        </button>
      }
    >
      <section className="panel">
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Invoice</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">
                    Loading...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    No payments yet.
                  </td>
                </tr>
              ) : (
                list.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      {dateIn(
                        payment.payment_date
                      )}
                    </td>

                    <td>
                      {customerNames[
                        payment.customer_id
                      ] || "—"}
                    </td>

                    <td>
                      {invoiceNames[
                        payment.invoice_id
                      ] || "—"}
                    </td>

                    <td>
                      <strong>
                        {money(
                          payment.amount
                        )}
                      </strong>
                    </td>

                    <td>
                      {payment.payment_method ||
                        "—"}
                    </td>

                    <td>
                      {payment.reference_number ||
                        "—"}
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
                  selectInvoice(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select invoice
                  (optional)
                </option>

                {invoices.map(
                  (invoice) => (
                    <option
                      key={invoice.id}
                      value={invoice.id}
                    >
                      {
                        invoice.invoice_number
                      }{" "}
                      —{" "}
                      {customerNames[
                        invoice.customer_id
                      ] || "Customer"}{" "}
                      —{" "}
                      {money(
                        invoice.total_amount
                      )}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="field">
              <span>Customer</span>

              <select
                value={
                  form.customer_id
                }
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

                {customers.map(
                  (customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.name}
                    </option>
                  )
                )}
              </select>
            </label>

            <Field
              label="Amount *"
              type="number"
              value={form.amount}
              onChange={(value) =>
                setForm({
                  ...form,
                  amount: value
                })
              }
            />

            <Field
              label="Payment Date"
              type="date"
              value={
                form.payment_date
              }
              onChange={(value) =>
                setForm({
                  ...form,
                  payment_date:
                    value
                })
              }
            />

            <label className="field">
              <span>
                Payment Method
              </span>

              <select
                value={
                  form.payment_method
                }
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
                <option>
                  Bank Transfer
                </option>
                <option>Cheque</option>
                <option>Other</option>
              </select>
            </label>

            <Field
              label="Reference Number"
              value={
                form.reference_number
              }
              onChange={(value) =>
                setForm({
                  ...form,
                  reference_number:
                    value
                })
              }
            />

            <Field
              label="Notes"
              value={form.notes}
              onChange={(value) =>
                setForm({
                  ...form,
                  notes: value
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
                onClick={() =>
                  setModal(false)
                }
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

function Transactions({
  businessId
}) {
  const [list, setList] =
    useState([]);

  const [customers, setCustomers] =
    useState([]);

  const [invoices, setInvoices] =
    useState([]);

  const [query, setQuery] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function load() {
    setLoading(true);
    setError("");

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
        .select(
          "id,invoice_number"
        )
        .eq(
          "business_id",
          businessId
        )
    ]);

    if (transactionResult.error) {
      setError(
        transactionResult.error.message
      );
    }

    setList(
      transactionResult.data || []
    );

    setCustomers(
      customerResult.data || []
    );

    setInvoices(
      invoiceResult.data || []
    );

    setLoading(false);
  }

  useEffect(() => {
    if (businessId) {
      load();
    }
  }, [businessId]);

  const customerNames =
    Object.fromEntries(
      customers.map((customer) => [
        customer.id,
        customer.name
      ])
    );

  const invoiceNames =
    Object.fromEntries(
      invoices.map((invoice) => [
        invoice.id,
        invoice.invoice_number
      ])
    );

  const filtered = useMemo(() => {
    const q = query
      .toLowerCase()
      .trim();

    if (!q) {
      return list;
    }

    return list.filter(
      (transaction) =>
        [
          transaction.type,
          transaction.description,
          transaction.amount,
          customerNames[
            transaction.customer_id
          ],
          invoiceNames[
            transaction.invoice_id
          ]
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(q)
        )
    );
  }, [
    list,
    query,
    customerNames,
    invoiceNames
  ]);

  const total =
    filtered.reduce(
      (sum, transaction) =>
        sum +
        Number(
          transaction.amount || 0
        ),
      0
    );

  return (
    <Page
      heading="Transactions"
      eyebrow="LEDGER"
      sub="Complete transaction history for the business."
      action={
        <button onClick={load}>
          <RefreshCw />
          Refresh
        </button>
      }
    >
      <section className="panel">
        <Toolbar
          query={query}
          setQuery={setQuery}
          placeholder="Search type, customer, invoice or description..."
          count={`${filtered.length} transaction${
            filtered.length !== 1
              ? "s"
              : ""
          } • ${money(total)}`}
        />

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {loading ? (
          <Empty text="Loading transactions..." />
        ) : filtered.length === 0 ? (
          <Empty
            icon={ArrowLeftRight}
            title="No transactions yet"
            text="Transactions will appear here as payments and other ledger entries are recorded."
          />
        ) : (
          <DataTable
            headers={[
              "Date",
              "Type",
              "Customer",
              "Invoice",
              "Description",
              "Amount"
            ]}
            rows={filtered.map(
              (transaction) => [
                dateIn(
                  transaction.transaction_date
                ),

                <Status
                  text={
                    transaction.type
                  }
                />,

                customerNames[
                  transaction.customer_id
                ] || "—",

                invoiceNames[
                  transaction.invoice_id
                ] || "—",

                transaction.description ||
                  "—",

                <strong>
                  {money(
                    transaction.amount
                  )}
                </strong>
              ]
            )}
          />
        )}
      </section>
    </Page>
  );
}

/* =========================================================
   EXPENSES
========================================================= */

function Expenses({
  businessId
}) {
  const [list, setList] =
    useState([]);

  const [categories, setCategories] =
    useState([]);

  const [form, setForm] =
    useState(emptyExpense);

  const [modal, setModal] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  async function load() {
    setLoading(true);

    const [
      expenseResult,
      categoryResult
    ] = await Promise.all([
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

    if (expenseResult.error) {
      setError(
        expenseResult.error.message
      );
    }

    setList(
      expenseResult.data || []
    );

    setCategories(
      categoryResult.data || []
    );

    setLoading(false);
  }

  useEffect(() => {
    if (businessId) {
      load();
    }
  }, [businessId]);

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
    } =
      await supabase.auth.getUser();

    const payload = {
      ...form,
      business_id: businessId,
      category_id:
        form.category_id || null,
      amount: Number(form.amount),
      created_by:
        user?.id || null
    };

    const { error } =
      await supabase
        .from("expenses")
        .insert(payload);

    if (error) {
      setError(error.message);
      return;
    }

    /* -----------------------------------------
       Add expense to transactions
    ----------------------------------------- */

    await supabase
      .from("transactions")
      .insert({
        business_id: businessId,
        type: "expense",
        amount: Number(form.amount),
        transaction_date:
          form.expense_date || null,
        description:
          form.description,
        created_by:
          user?.id || null
      });

    setModal(false);

    setForm(emptyExpense);

    load();
  }

  const categoryNames =
    Object.fromEntries(
      categories.map((category) => [
        category.id,
        category.name
      ])
    );

  return (
    <Page
      heading="Expenses"
      eyebrow="EXPENSE MANAGEMENT"
      sub="Record business expenses and operating costs."
      action={
        <button
          onClick={() => {
            setError("");
            setModal(true);
          }}
        >
          <Plus />
          Add Expense
        </button>
      }
    >
      <section className="panel">
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6">
                    Loading...
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    No expenses yet.
                  </td>
                </tr>
              ) : (
                list.map((expense) => (
                  <tr key={expense.id}>
                    <td>
                      {dateIn(
                        expense.expense_date
                      )}
                    </td>

                    <td>
                      {categoryNames[
                        expense.category_id
                      ] || "—"}
                    </td>

                    <td>
                      {expense.description}
                    </td>

                    <td>
                      <strong>
                        {money(
                          expense.amount
                        )}
                      </strong>
                    </td>

                    <td>
                      {expense.payment_method ||
                        "—"}
                    </td>

                    <td>
                      {expense.reference_number ||
                        "—"}
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
          title="Add Expense"
          onClose={() =>
            setModal(false)
          }
        >
          <form
            className="grid"
            onSubmit={save}
          >
            <label className="field">
              <span>Category</span>

              <select
                value={
                  form.category_id
                }
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

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </label>

            <Field
              label="Description *"
              value={form.description}
              onChange={(value) =>
                setForm({
                  ...form,
                  description:
                    value
                })
              }
            />

            <Field
              label="Amount *"
              type="number"
              value={form.amount}
              onChange={(value) =>
                setForm({
                  ...form,
                  amount: value
                })
              }
            />

            <Field
              label="Date"
              type="date"
              value={
                form.expense_date
              }
              onChange={(value) =>
                setForm({
                  ...form,
                  expense_date:
                    value
                })
              }
            />

            <label className="field">
              <span>
                Payment Method
              </span>

              <select
                value={
                  form.payment_method
                }
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
                <option>
                  Bank Transfer
                </option>
                <option>Cheque</option>
                <option>Other</option>
              </select>
            </label>

            <Field
              label="Reference Number"
              value={
                form.reference_number
              }
              onChange={(value) =>
                setForm({
                  ...form,
                  reference_number:
                    value
                })
              }
            />

            <Field
              label="Notes"
              value={form.notes}
              onChange={(value) =>
                setForm({
                  ...form,
                  notes: value
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
                onClick={() =>
                  setModal(false)
                }
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
  const [stats, setStats] =
    useState({
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
        .select(
          "total_amount"
        )
        .eq(
          "business_id",
          businessId
        )
        .neq(
          "status",
          "cancelled"
        ),

      supabase
        .from("payments")
        .select("amount")
        .eq(
          "business_id",
          businessId
        ),

      supabase
        .from("expenses")
        .select("amount")
        .eq(
          "business_id",
          businessId
        )
    ]);

    const invoices =
      invoiceResult.data || [];

    const payments =
      paymentResult.data || [];

    const expenses =
      expenseResult.data || [];

    setStats({
      sales: invoices.reduce(
        (sum, invoice) =>
          sum +
          Number(
            invoice.total_amount || 0
          ),
        0
      ),

      paid: payments.reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.amount || 0
          ),
        0
      ),

      expenses: expenses.reduce(
        (sum, expense) =>
          sum +
          Number(
            expense.amount || 0
          ),
        0
      ),

      invoices:
        invoices.length
    });
  }

  useEffect(() => {
    if (businessId) {
      load();
    }
  }, [businessId]);

  return (
    <Page
      heading="Dashboard"
      eyebrow="OVERVIEW"
      sub="Neelkanth Stones business snapshot."
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
              stats.sales -
                stats.paid
            )
          )}
        />

        <Stat
          title="Expenses"
          value={money(
            stats.expenses
          )}
        />

        <Stat
          title="Invoices"
          value={stats.invoices}
        />

        <Stat
          title="Net Cash"
          value={money(
            stats.paid -
              stats.expenses
          )}
        />
      </div>

      <section className="panel empty">
        <LayoutDashboard />

        <strong>
          Live business dashboard
        </strong>

        <p>
          Sales, collections,
          invoices and expenses
          are connected with
          Supabase.
        </p>
      </section>
    </Page>
  );
}

/* =========================================================
   REPORTS
========================================================= */

function Reports({
  businessId
}) {
  const [data, setData] =
    useState({
      sales: 0,
      paid: 0,
      expenses: 0,
      invoiceCount: 0
    });

  const [loading, setLoading] =
    useState(true);

  async function load() {
    setLoading(true);

    const [
      invoiceResult,
      paymentResult,
      expenseResult
    ] = await Promise.all([
      supabase
        .from("invoices")
        .select("total_amount")
        .eq(
          "business_id",
          businessId
        )
        .neq(
          "status",
          "cancelled"
        ),

      supabase
        .from("payments")
        .select("amount")
        .eq(
          "business_id",
          businessId
        ),

      supabase
        .from("expenses")
        .select("amount")
        .eq(
          "business_id",
          businessId
        )
    ]);

    const sales =
      (invoiceResult.data || []).reduce(
        (sum, invoice) =>
          sum +
          Number(
            invoice.total_amount || 0
          ),
        0
      );

    const paid =
      (paymentResult.data || []).reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.amount || 0
          ),
        0
      );

    const expenses =
      (expenseResult.data || []).reduce(
        (sum, expense) =>
          sum +
          Number(
            expense.amount || 0
          ),
        0
      );

    setData({
      sales,
      paid,
      expenses,
      invoiceCount:
        invoiceResult.data?.length ||
        0
    });

    setLoading(false);
  }

  useEffect(() => {
    if (businessId) {
      load();
    }
  }, [businessId]);

  return (
    <Page
      heading="Reports"
      eyebrow="BUSINESS REPORTS"
      sub="Live summary from invoices, payments and expenses."
    >
      <div className="report-grid">
        {[
          [
            "Sales",
            money(data.sales)
          ],

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
                data.sales -
                  data.paid
              )
            )
          ],

          [
            "Invoices",
            data.invoiceCount
          ]
        ].map(
          ([title, value]) => (
            <div
              className="report-card"
              key={title}
            >
              <small>
                {title}
              </small>

              <strong>
                {loading
                  ? "Loading..."
                  : value}
              </strong>
            </div>
          )
        )}
      </div>
    </Page>
  );
}

/* =========================================================
   SETTINGS
========================================================= */

function SettingsPage({
  business
}) {
  const [form, setForm] =
    useState({
      name: business?.name || "",
      phone: business?.phone || "",
      email: business?.email || "",
      address:
        business?.address || "",
      city: business?.city || "",
      state:
        business?.state || "",
      pincode:
        business?.pincode || "",
      gst_number:
        business?.gst_number || ""
    });

  const [message, setMessage] =
    useState("");

  const [busy, setBusy] =
    useState(false);

  useEffect(() => {
    setForm({
      name: business?.name || "",
      phone: business?.phone || "",
      email: business?.email || "",
      address:
        business?.address || "",
      city: business?.city || "",
      state:
        business?.state || "",
      pincode:
        business?.pincode || "",
      gst_number:
        business?.gst_number || ""
    });
  }, [business]);

  async function save(e) {
    e.preventDefault();

    setBusy(true);
    setMessage("");

    const { error } =
      await supabase
        .from("businesses")
        .update(form)
        .eq(
          "id",
          business.id
        );

    setBusy(false);

    setMessage(
      error
        ? error.message
        : "Business details saved successfully."
    );
  }

  return (
    <Page
      heading="Settings"
      eyebrow="BUSINESS SETTINGS"
      sub="Update Neelkanth Stones business information."
    >
      <section className="panel">
        <form
          className="grid"
          onSubmit={save}
        >
          <Field
            label="Business Name"
            value={form.name}
            onChange={(value) =>
              setForm({
                ...form,
                name: value
              })
            }
          />

          <Field
            label="Phone"
            value={form.phone}
            onChange={(value) =>
              setForm({
                ...form,
                phone: value
              })
            }
          />

          <Field
            label="Email"
            value={form.email}
            onChange={(value) =>
              setForm({
                ...form,
                email: value
              })
            }
          />

          <Field
            label="GST Number"
            value={form.gst_number}
            onChange={(value) =>
              setForm({
                ...form,
                gst_number: value
              })
            }
          />

          <Field
            label="Address"
            value={form.address}
            onChange={(value) =>
              setForm({
                ...form,
                address: value
              })
            }
            wide
          />

          <Field
            label="City"
            value={form.city}
            onChange={(value) =>
              setForm({
                ...form,
                city: value
              })
            }
          />

          <Field
            label="State"
            value={form.state}
            onChange={(value) =>
              setForm({
                ...form,
                state: value
              })
            }
          />

          <Field
            label="Pincode"
            value={form.pincode}
            onChange={(value) =>
              setForm({
                ...form,
                pincode: value
              })
            }
          />

          {message && (
            <div className="notice wide">
              {message}
            </div>
          )}

          <div className="actions wide">
            <button disabled={busy}>
              {busy
                ? "Saving..."
                : "Save Business Details"}
            </button>
          </div>
        </form>
      </section>
    </Page>
  );
}

/* =========================================================
   MAIN APP
========================================================= */

export default function App() {
  const [session, setSession] =
    useState(null);

  const [business, setBusiness] =
    useState(null);

  const [profile, setProfile] =
    useState(null);

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
    const {
      data: profileData
    } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .maybeSingle();

    const {
      data: membership
    } = await supabase
      .from("business_members")
      .select(
        "business_id,role,businesses(*)"
      )
      .eq(
        "user_id",
        uid
      )
      .eq(
        "role",
        "owner"
      )
      .maybeSingle();

    setProfile(profileData);

    setBusiness(
      membership?.businesses ||
        null
    );

    if (membership?.business_id) {
      const [
        customerResult,
        productResult
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
        customerResult.count || 0
      );

      setProductCount(
        productResult.count || 0
      );
    }
  }

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(
          data.session
        );

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
      (item) =>
        item[0] === page
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
