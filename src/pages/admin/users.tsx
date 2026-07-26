"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";

type UserData = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  status: string;
  createdAt: string;
};

export default function AdminUsers() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) {
      router.push("/login");
      return;
    }
    fetchUsers();
  }, [isLoaded, user, router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.status === 403) {
        router.push("/drive/my-drive");
        return;
      }
      const data = await res.json();
      setUsers(data);
    } catch {
      setError("Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (
    targetUserId: string,
    action: "approve" | "reject" | "inactivate",
    role?: string,
  ) => {
    setActionLoading(targetUserId);
    setError("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, action, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Gagal");
      }

      await fetchUsers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setActionLoading(null);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800">
            Pending
          </span>
        );
      case "active":
        return (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
            Active
          </span>
        );
      case "inactive":
        return (
          <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
            Inactive
          </span>
        );
      case "rejected":
        return (
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
            Ditolak
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const roleBadge = (role: string) => {
    if (role === "admin") {
      return (
        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
          Admin
        </span>
      );
    }
    return (
      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
        User
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-textC">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 text-xl font-semibold text-textC">
        👥 Manage Users
      </h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="pb-3 pr-4 font-medium">Name</th>
              <th className="pb-3 pr-4 font-medium">Email</th>
              <th className="pb-3 pr-4 font-medium">Role</th>
              <th className="pb-3 pr-4 font-medium">Status</th>
              <th className="pb-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  Belum ada user
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 pr-4 font-medium text-textC">
                  {u.name || "-"}
                </td>
                <td className="py-3 pr-4 text-gray-600">{u.email || "-"}</td>
                <td className="py-3 pr-4">{roleBadge(u.role)}</td>
                <td className="py-3 pr-4">{statusBadge(u.status)}</td>
                <td className="py-3">
                  {u.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(u.id, "approve", "user")}
                        disabled={actionLoading === u.id}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        {actionLoading === u.id ? "..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleAction(u.id, "approve", "admin")}
                        disabled={actionLoading === u.id}
                        className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
                      >
                        {actionLoading === u.id ? "..." : "Approve as Admin"}
                      </button>
                      <button
                        onClick={() => handleAction(u.id, "reject")}
                        disabled={actionLoading === u.id}
                        className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-200 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {u.status === "active" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const newRole =
                            u.role === "admin" ? "user" : "admin";
                          handleAction(u.id, "approve", newRole);
                        }}
                        disabled={actionLoading === u.id}
                        className="rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-50"
                      >
                        {actionLoading === u.id
                          ? "..."
                          : `Switch to ${u.role === "admin" ? "User" : "Admin"}`}
                      </button>
                      <button
                        onClick={() => handleAction(u.id, "inactivate")}
                        disabled={actionLoading === u.id}
                        className="rounded-lg bg-orange-100 px-3 py-1.5 text-xs font-medium text-orange-600 transition hover:bg-orange-200 disabled:opacity-50"
                      >
                        {actionLoading === u.id ? "..." : "Set Inactive"}
                      </button>
                    </div>
                  )}
                  {u.status === "inactive" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(u.id, "approve", "user")}
                        disabled={actionLoading === u.id}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        {actionLoading === u.id ? "..." : "Activate"}
                      </button>
                      <button
                        onClick={() => handleAction(u.id, "approve", "admin")}
                        disabled={actionLoading === u.id}
                        className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
                      >
                        {actionLoading === u.id ? "..." : "Activate as Admin"}
                      </button>
                    </div>
                  )}
                  {u.status === "rejected" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(u.id, "approve", "user")}
                        disabled={actionLoading === u.id}
                        className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-medium text-green-600 transition hover:bg-green-200 disabled:opacity-50"
                      >
                        {actionLoading === u.id ? "..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleAction(u.id, "approve", "admin")}
                        disabled={actionLoading === u.id}
                        className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-purple-700 disabled:opacity-50"
                      >
                        {actionLoading === u.id ? "..." : "Approve as Admin"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
