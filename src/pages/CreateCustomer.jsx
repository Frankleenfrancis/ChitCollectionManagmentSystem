import { useEffect, useState, useCallback } from "react";
import { customerApi } from "../api/customerApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editId, setEditId] = useState(null);

  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    chitplanId: "" // <-- Add this
  });


  // Handle search debounce
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(t);
  }, [search]);

  // Synchronize and pull records from database endpoints
  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      const query = debouncedSearch.trim();

      if (query !== "") {
        if (/^\d{10}$/.test(query)) {
          const singleCustomer = await customerApi.getByPhone(query);
          data = singleCustomer ? [singleCustomer] : [];
        } else {
          data = await customerApi.search(query, page, 5);
        }
      } else {
        data = await customerApi.getAll(page, 5);
      }

      if (data && data.content) {
        setCustomers(data.content);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setCustomers(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else if (data && typeof data === "object") {
        setCustomers([data]);
        setTotalPages(1);
        setTotalElements(1);
      } else {
        setCustomers([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (e) {
      console.error("Fetch tracking error:", e);
      toast.error("Failed to load customers layout configuration");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Handle submission (Create vs Update routing)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editId) {
        // Trigger PUT /customers/{id}
        const response = await customerApi.update(editId, form);
        toast.success("Customer record updated successfully");

        // Extract complete payload containing backend calculated DTO parameters
        const updatedCustomerPayload = response?.data?.data || response?.data || response;

        // Fast visual update to UI array element state memory context
        setCustomers((prev) =>
          prev.map((c) => {
            const rowCleanedId = c.id ? parseInt(String(c.id).replace(/\D/g, ""), 10) : null;
            const codeCleanedId = c.customerCode ? parseInt(String(c.customerCode).replace(/\D/g, ""), 10) : null;

            return rowCleanedId === editId || codeCleanedId === editId
              ? { ...c, ...updatedCustomerPayload }
              : c;
          })
        );
      } else {
        // Trigger POST /customers
        const response = await customerApi.create(form);
        toast.success("Customer saved to database successfully");

        const newCustomerPayload = response?.data?.data || response?.data || response;
        setCustomers((prev) => [newCustomerPayload, ...prev]);
      }

      handleCancel();

      setTimeout(() => {
        loadCustomers();
      }, 300);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger GET /customers/{id} to grab fresh data payload rows before editing
  const handleEditClick = async (e, customerRow) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("Row clicked data profile:", customerRow);

    const searchCode = customerRow.id || customerRow.customerCode;

    if (!searchCode) {
      toast.error("Missing row structural index identification key matching rules.");
      return;
    }

    const cleanNumericString = String(searchCode).replace(/\D/g, "");
    const databaseId = parseInt(cleanNumericString, 10);

    if (isNaN(databaseId)) {
      toast.error("Could not translate customer identification code to a numeric primary key.");
      return;
    }

    try {
      toast.loading("Synchronizing values with DB...", { id: "edit-sync" });
      const APIResponse = await customerApi.getById(databaseId);
      toast.dismiss("edit-sync");

      const freshData = APIResponse?.data || APIResponse;

      if (freshData) {
        setEditId(databaseId);
        setForm({
          fullName: freshData.fullName || "",
          phone: freshData.phone || "",
          email: freshData.email || "",
          address: freshData.address || "",
          city: freshData.city || "",
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      toast.dismiss("edit-sync");
      console.warn("GET by ID failed, falling back to row mapping data context...", err);

      setEditId(databaseId);
      setForm({
        fullName: customerRow.fullName || "",
        phone: customerRow.phone || "",
        email: customerRow.email || "",
        address: customerRow.address || "",
        city: customerRow.city || "",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleCancel = () => {
    setForm({ fullName: "", phone: "", email: "", address: "", city: "" });
    setEditId(null);
  };

  const handleDeleteClick = async (e, customerRow) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("Deactivation execution intercept payload target:", customerRow);

    const searchCode = customerRow?.id || customerRow?.customerCode;

    if (!searchCode) {
      toast.error("Unable to delete: Missing customer tracking reference code.");
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete customer ${customerRow.fullName || ""}?`)) {
      return;
    }

    const cleanNumericString = String(searchCode).replace(/\D/g, "");
    const databaseId = parseInt(cleanNumericString, 10);

    if (isNaN(databaseId)) {
      toast.error("Invalid identification code format. Cannot resolve database ID.");
      return;
    }

    try {
      toast.loading("Processing deletion...", { id: "delete-toast" });

      await customerApi.deactivate(databaseId);

      toast.success("Customer record removed successfully!", { id: "delete-toast" });

      setCustomers((prevCustomers) =>
        prevCustomers.filter((c) => c.id !== customerRow.id && c.customerCode !== customerRow.customerCode)
      );
    } catch (err) {
      console.error("Backend deletion failure:", err);
      const serverMessage = err.response?.data?.message || "Failed to delete customer from database.";
      toast.error(serverMessage, { id: "delete-toast" });
    }
  };

  const initials = (name) =>
    name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "??";

  const colorFor = (id = 0) => {
    const colors = ["bg-indigo-500", "bg-pink-500", "bg-green-500", "bg-orange-500", "bg-blue-500"];
    const numericId = typeof id === "string" ? id.charCodeAt(0) : id;
    return colors[numericId % colors.length] || "bg-indigo-500";
  };

  const renderInput = (k, label, placeholder, required = false, type = "text") => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">
        {label} {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        name={k}
        value={form[k] || ""}
        onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-300"
      />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible mt-6">

        <div>
          <div>
            <button
              type="button"
              onClick={() => {
                if (window.location.pathname.includes("/admin")) {
                  navigate("/admin/dashboard");
                } else if (window.location.pathname.includes("/agent")) {
                  navigate("/agent/dashboard");
                } else {
                  navigate("/login");
                }
              }}
              className="mt-1  flex items-left justify-center p-2  m-2 border border-gray-200 bg-white hover:bg-gray-50 hover:text-indigo-600 text-gray-500 rounded-xl shadow-sm transition-colors"
              title="Go to Dashboard Home"
            >
              <span className="text-base leading-none">⬅️</span>
            </button>
          </div>
          <div className="m-2 flex items-start justify-center">
            <h1 className="text-4xl text-center font-bold text-gray-900">Customer Management</h1>
          </div>
          <span>
            <p className="text-sm text-center text-gray-400 mb-3">
              Manage and monitor database customer profiles.
            </p>
          </span>

        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Search Customer Profile
          </label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Name, phone, city, or email tracking identifiers..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-300"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-700 border-b pb-1">
            {editId ? `✏️ Modify Profile Record ID: ${editId}` : "➕ Register Profile Structure Entity"}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {renderInput("fullName", "Full Name", "Frankleen Francis", true)}
            {renderInput("phone", "Phone Number", "+91 ccccc", true, "tel")}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {renderInput("email", "Email Address", "frank@gmail.com", false, "email")}
            {renderInput("city", "Current City", "Coimbatore", false)}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Street Address *</label>
            <textarea
              name="address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              required
              rows={3}
              placeholder="12, Gandhi Street, Gandhipuram"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-300 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel / Clear
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-50"
            >
              {submitting ? "Saving..." : editId ? "Save Changes" : "Add Customer"}
            </button>
          </div>
        </form>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible mt-6">
          <div className="overflow-visible">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3.5">Customer Name & ID</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3.5">Chit Group</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3.5">Total Value</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3.5">Amount Paid</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3.5">Progress Status</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40" /></td>
                      <td colSpan={5} />
                    </tr>
                  ))
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                      No active client records mapped matching system lookups definitions.
                    </td>
                  </tr>
                ) : (
                  customers.map((c, idx) => {
                    const currentId = c.id || c.customerCode;

                    // 1. MATCH BACKEND KEYS: Use c.totalValue and c.totalPaid from your Spring Boot DTO
                    const totalVal = c.totalValue || 0;
                    const paidAmt = c.totalPaid || 0;

                    // 2. Calculate the progress metric safely
                    const percent = totalVal > 0 ? Math.min(100, Math.round((paidAmt / totalVal) * 100)) : 0;

                    return (
                      <tr key={currentId || `cust-${idx}`} className="hover:bg-gray-50/70 transition-colors">
                        {/* Name & ID Column */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`${colorFor(currentId || idx)} w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                              {initials(c.fullName)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{c.fullName}</p>
                              <p className="text-xs text-indigo-500 font-mono">ID: #{currentId || "Pending"}</p>
                            </div>
                          </div>
                        </td>

                        {/* Chit Group Column - Maps to "chitGroupName" from your API */}
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                          {c.chitGroupName || "N/A"}
                        </td>

                        {/* Total Value Column - Maps to "totalValue" from your API */}
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                          ₹{Number(totalVal).toLocaleString("en-IN")}
                        </td>

                        {/* Amount Paid Column - FIXED: Changed from c.amountPaid to c.totalPaid */}
                        <td className="px-6 py-4 text-sm text-emerald-600 font-semibold">
                          ₹{Number(paidAmt).toLocaleString("en-IN")}
                        </td>

                        {/* Progress Status Bar Column */}
                        <td className="px-6 py-4">
                          <div className="w-full max-w-xs">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-500 font-medium">{percent}% Completed</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${c.active ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                                {c.active ? "Up-to-date" : "Inactive"}
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-1.5 transition-all duration-500" style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        </td>

                        {/* Actions Menu Column */}
                        <td className="px-6 py-4 text-right relative">
                          <ActionMenu
                            onEdit={(e) => handleEditClick(e, c)}
                            onDelete={(e) => handleDeleteClick(e, c)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && search.trim().length !== 10 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 mt-4">
            <p className="text-sm text-gray-400">Showing {customers.length} of {totalElements} customer rows</p>
            <div className="flex items-center gap-1">
              <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-40">Previous</button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i)} className={`w-8 h-8 text-sm rounded-lg font-medium transition-colors ${page === i ? "bg-indigo-600 text-white shadow-sm" : "text-gray-500 hover:bg-gray-100"}`}>{i + 1}</button>
              ))}
              <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionMenu({ onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((prev) => !prev); }}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="5" cy="4" r="1.5" /><circle cx="5" cy="10" r="1.5" /><circle cx="5" cy="16" r="1.5" />
        </svg>
      </button>

      {open && <div className="fixed inset-0 z-40" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(false); }} />}

      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-[9999] overflow-hidden">
          <button
            type="button"
            onClick={(e) => { onEdit?.(e); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Edit Record
          </button>
          <button
            type="button"
            onClick={(e) => { onDelete?.(e); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}