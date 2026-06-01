import { useEffect, useState, useCallback } from "react";
import { authApi } from "../api/authApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";

export default function CreateAgent() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [loading, setLoading] = useState(true);
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [editId, setEditId] = useState(null);
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: "",
        username: "",
        password: "",
        email: "",
        phone: "",
        role: "AGENT",
    });

    // debounce
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400);

        return () => clearTimeout(t);
    }, [search]);

    // load users
    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await authApi.getAllUsers(
                page,
                5,
                debouncedSearch
            );

            if (data.content) {
                setUsers(data.content);
                setTotalPages(data.totalPages || 1);
                setTotalElements(data.totalElements || 0);
            } else if (Array.isArray(data)) {
                setUsers(data);
                setTotalPages(1);
                setTotalElements(data.length);
            } else {
                setUsers([]);
                setTotalPages(1);
                setTotalElements(0);
            }
        } catch (e) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await authApi.updateUser(editId, form);
                toast.success("Agent updated successfully");

                // FORCE IMMEDIATE LOCAL STATE UPDATE VS RE-RENDER
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        (user.id === editId || user._id === editId) ? { ...user, ...form } : user
                    )
                );
            } else {
                await authApi.createUserByAdmin(form);
                toast.success("Agent created successfully");
            }

            setForm({
                fullName: "",
                username: "",
                password: "",
                email: "",
                phone: "",
                role: "AGENT",
            });

            setEditId(null);

            // Re-sync with backend changes after a tiny interval
            setTimeout(() => {
                loadUsers();
            }, 300);
        } catch (err) {
            toast.error("Failed");
        }
    };

    // edit
    const handleEdit = (u) => {
        setEditId(u.id || u._id);

        setForm({
            fullName: u.fullName || "",
            username: u.username || "",
            password: "",
            email: u.email || "",
            phone: u.phone || "",
            role: u.role || "AGENT",
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    // delete
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this user?")) return;

        try {
            await authApi.deleteUser(id);
            toast.success("Deleted successfully");
            loadUsers();
        } catch (err) {
            toast.error("Delete failed");
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
        const colors = [
            "bg-indigo-500",
            "bg-pink-500",
            "bg-green-500",
            "bg-orange-500",
            "bg-blue-500",
        ];
        return colors[id % colors.length] || "bg-indigo-500";
    };

    const f = (
        k,
        label,
        placeholder,
        required = false,
        type = "text"
    ) => (
        <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
                {label}
                {required && (
                    <span className="text-red-400 ml-0.5">*</span>
                )}
            </label>

            <input
                type={type}
                value={form[k] || ""}
                onChange={(e) =>
                    setForm({
                        ...form,
                        [k]: e.target.value,
                    })
                }
                required={required}
                placeholder={placeholder}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-300"
            />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible mt-6">
                {/* Header */}

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
                    <h1 className="text-4xl text-center font-bold text-gray-900">
                        Agent Management
                    </h1>
                    <p className="text-sm text-center text-gray-400 mt-0.5">
                        Manage and monitor Agents.
                    </p>
                </div>
            </div>


            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                {/* Search */}
                <div className="mb-6">
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                        Search Agent
                    </label>
                    <div className="relative">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                            />
                        </svg>
                        <input
                            type="text"
                            placeholder="Name, phone, or email..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(0);
                            }}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 placeholder-gray-300"
                        />
                    </div>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="px-6 py-5 space-y-4"
                >
                    <div className="grid grid-cols-2 gap-4">
                        {f("fullName", "Full Name", "Murugan Selvam", true)}
                        {f("username", "User name", "murugan", true)}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {f("email", "Email", "name@email.com", false, "email")}
                        {f("phone", "Phone Number", "9500012345", true, "tel")}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {f(
                            "password",
                            "Password",
                            "********",
                            !editId,
                            "password"
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">
                                Role
                            </label>
                            <select
                                value={form.role}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        role: e.target.value,
                                    })
                                }
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                            >
                                <option value="AGENT">AGENT</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="USER">USER</option>
                                <option value="CUSTOMER">CUSTOMER</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => {
                                setForm({
                                    fullName: "",
                                    username: "",
                                    password: "",
                                    email: "",
                                    phone: "",
                                    role: "AGENT",
                                });
                                setEditId(null);
                            }}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
                        >
                            {editId ? "Save Changes" : "Add Agent"}
                        </button>
                    </div>
                </form>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible mt-6">
                    <div className="overflow-visible">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3.5">
                                        Full Name
                                    </th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3.5">
                                        User name
                                    </th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3.5">
                                        Email
                                    </th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3.5">
                                        Phone
                                    </th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-6 py-3.5">
                                        Role
                                    </th>
                                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-6 py-3.5">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4">
                                                <div className="h-4 bg-gray-200 rounded w-40" />
                                            </td>
                                        </tr>
                                    ))
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-12 text-center text-sm text-gray-600"
                                        >
                                            No agents found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((u, idx) => (
                                        <tr
                                            key={u.id ? `user-${u.id}` : `user-idx-${idx}`}
                                            className="hover:bg-gray-50/70 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`${colorFor(
                                                            u.id || idx
                                                        )} w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold`}
                                                    >
                                                        {initials(u.fullName)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            {u.fullName}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            ID: #{u.id || "N/A"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {u.username}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {u.email}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {u.phone}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {u.role}
                                            </td>
                                            <td className="px-6 py-4 text-right relative">
                                                {u.role === "ADMIN" ? (
                                                    <span className="text-xs text-gray-400">
                                                        System User
                                                    </span>
                                                ) : (
                                                    <ActionMenu
                                                        onEdit={() => handleEdit(u)}
                                                        onDeactivate={() =>
                                                            handleDelete(u.id || u._id)
                                                        }
                                                    />
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-300">
                    <p className="text-sm text-gray-400">
                        Showing {users.length} of {totalElements} agents
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            disabled={page === 0}
                            onClick={() =>
                                setPage((p) => Math.max(0, p - 1))
                            }
                            className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-40"
                        >
                            Previous
                        </button>

                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i)}
                                className={`w-8 h-8 text-sm rounded-lg font-medium transition-colors ${page === i
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-gray-500 hover:bg-gray-100"
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            disabled={page >= totalPages - 1}
                            onClick={() =>
                                setPage((p) =>
                                    Math.min(totalPages - 1, p + 1)
                                )
                            }
                            className="px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-40"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActionMenu({ onEdit, onDeactivate }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            >
                <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <circle cx="5" cy="4" r="1.5" />
                    <circle cx="5" cy="10" r="1.5" />
                    <circle cx="5" cy="16" r="1.5" />
                </svg>
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpen(false)}
                />
            )}

            {open && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-[9999] overflow-hidden">
                    <button
                        onClick={() => {
                            onEdit?.();
                            setOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        Edit
                    </button>

                    <button
                        onClick={() => {
                            onDeactivate?.();
                            setOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}