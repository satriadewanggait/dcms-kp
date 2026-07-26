import { updateShareSettings } from "@/API/Files";
import React, { useEffect, useState } from "react";

type SharedUser = {
  id: string;
  name: string | null;
  email: string | null;
};

type ExistingShare = {
  id: string;
  sharedWith: SharedUser;
};

function ShareDialog({
  file,
  onClose,
}: {
  file: FileListProps;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<"link" | "users">("users");

  // --- Public link mode ---
  const [isShared, setIsShared] = useState(!!file.isShared);
  const [shareToken, setShareToken] = useState(file.shareToken ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const shareUrl =
    typeof window !== "undefined" && shareToken
      ? `${window.location.origin}/share/${shareToken}`
      : "";
  const accessMode = isShared ? "public" : "private";

  const enableSharing = async () => {
    setIsSaving(true);
    const nextToken = shareToken || crypto.randomUUID();
    try {
      await updateShareSettings(file.id, true, nextToken);
      setIsShared(true);
      setShareToken(nextToken);
    } finally {
      setIsSaving(false);
    }
  };

  const disableSharing = async () => {
    setIsSaving(true);
    try {
      await updateShareSettings(file.id, false, "");
      setIsShared(false);
      setShareToken("");
    } finally {
      setIsSaving(false);
    }
  };

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      window.alert("Share link copied.");
    } catch {
      window.prompt("Copy this link", shareUrl);
    }
  };

  // --- Share with users mode ---
  const [users, setUsers] = useState<SharedUser[]>([]);
  const [existingShares, setExistingShares] = useState<ExistingShare[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [shareMsg, setShareMsg] = useState("");

  useEffect(() => {
    if (tab !== "users") return;

    const load = async () => {
      try {
        const [usersRes, sharesRes] = await Promise.all([
          fetch("/api/users"),
          fetch(`/api/share?fileId=${file.id}`),
        ]);
        setUsers(await usersRes.json());
        const sharesData: ExistingShare[] = await sharesRes.json();
        setExistingShares(sharesData);
      } catch {
        // ignore
      }
    };
    load();
  }, [tab, file.id]);

  const handleShareWithUser = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    setShareMsg("");

    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: file.id, targetUserId: selectedUserId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message ?? "Gagal share");
      }

      setShareMsg("✅ Berhasil di-share!");
      setSelectedUserId("");

      // Refresh daftar share
      const sharesRes = await fetch(`/api/share?fileId=${file.id}`);
      setExistingShares(await sharesRes.json());
    } catch (err) {
      setShareMsg(`❌ ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShare = async (targetUserId: string) => {
    setLoading(true);
    try {
      await fetch(`/api/share?fileId=${file.id}&targetUserId=${targetUserId}`, {
        method: "DELETE",
      });

      setExistingShares((prev) =>
        prev.filter((s) => s.sharedWith.id !== targetUserId),
      );
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  // Filter users that haven't been shared with yet
  const availableUsers = users.filter(
    (u) => !existingShares.some((s) => s.sharedWith.id === u.id),
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-darkC2/40"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-[30rem] space-y-5 rounded-xl bg-white p-5 shadow-lg shadow-[#bbb]"
      >
        <h2 className="text-2xl">Share &quot;{file.fileName}&quot;</h2>

        {/* Tabs */}
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setTab("link")}
            className={`pb-2 text-sm font-medium transition ${
              tab === "link"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            🔗 Public link
          </button>
          <button
            onClick={() => setTab("users")}
            className={`pb-2 text-sm font-medium transition ${
              tab === "users"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            👥 Share with users
          </button>
        </div>

        {tab === "link" && (
          <div className="rounded-xl border border-[#ddd] p-4">
            <div className="mb-4 space-y-3">
              <p className="font-medium text-textC">General access</p>
              <button
                type="button"
                onClick={() => void disableSharing()}
                disabled={isSaving || accessMode === "private"}
                className={`flex w-full items-start justify-between rounded-xl border px-4 py-3 text-left transition ${
                  accessMode === "private"
                    ? "border-[#1a73e8] bg-[#e8f0fe]"
                    : "border-[#ddd] hover:bg-darkC2"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <div>
                  <p className="font-medium text-textC">Only you</p>
                  <p className="text-sm text-textC/70">
                    Only your account can open this file.
                  </p>
                </div>
                <span className="text-sm font-medium text-textC/70">
                  {accessMode === "private" ? "Selected" : ""}
                </span>
              </button>
              <button
                type="button"
                onClick={() => void enableSharing()}
                disabled={isSaving}
                className={`flex w-full items-start justify-between rounded-xl border px-4 py-3 text-left transition ${
                  accessMode === "public"
                    ? "border-[#1a73e8] bg-[#e8f0fe]"
                    : "border-[#ddd] hover:bg-darkC2"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <div>
                  <p className="font-medium text-textC">Anyone with the link</p>
                  <p className="text-sm text-textC/70">
                    Anyone who has the link can view this file.
                  </p>
                </div>
                <span className="text-sm font-medium text-textC/70">
                  {accessMode === "public" ? "Selected" : ""}
                </span>
              </button>
            </div>

            {isShared && shareUrl ? (
              <div className="space-y-3">
                <div className="rounded-lg bg-darkC2 px-3 py-2 text-sm text-textC">
                  <span className="block truncate">{shareUrl}</span>
                </div>
                <button
                  type="button"
                  onClick={() => void copyLink()}
                  className="rounded-full bg-[#1a73e8] px-4 py-2 text-sm font-medium text-white hover:bg-[#1557b0]"
                >
                  Copy link
                </button>
              </div>
            ) : (
              <div className="rounded-lg bg-darkC2 px-3 py-2 text-sm text-textC/70">
                Link sharing is disabled. Switch to &quot;Anyone with the
                link&quot; to enable.
              </div>
            )}
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-4">
            {/* Existing shares */}
            {existingShares.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-textC">
                  Shared with:
                </p>
                <div className="space-y-2">
                  {existingShares.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                          {(
                            s.sharedWith.name?.[0] ??
                            s.sharedWith.email?.[0] ??
                            "?"
                          ).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-textC">
                            {s.sharedWith.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {s.sharedWith.email}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveShare(s.sharedWith.id)}
                        disabled={loading}
                        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add new share */}
            {availableUsers.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-textC">
                  Add people:
                </p>
                <div className="flex gap-2">
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="flex-1 rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="">Select a user...</option>
                    {availableUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name || u.email}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => void handleShareWithUser()}
                    disabled={!selectedUserId || loading}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    Share
                  </button>
                </div>
              </div>
            )}

            {availableUsers.length === 0 && existingShares.length === 0 && (
              <p className="text-sm text-gray-400">
                No other users available to share with.
              </p>
            )}

            {shareMsg && (
              <p className="text-sm" key={shareMsg}>
                {shareMsg}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-2 font-medium text-textC2 hover:bg-darkC2"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareDialog;
