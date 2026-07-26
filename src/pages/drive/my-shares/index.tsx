import Head from "next/head";
import FileHeader from "@/components/FileHeader";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { DotLoader } from "react-spinners";

type SharedFileItem = {
  file: FileListProps;
  sharedWith: { id: string; name: string | null; email: string | null }[];
};

export default function MyShares() {
  const [items, setItems] = useState<SharedFileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchShares = async () => {
      try {
        const res = await fetch("/api/my-shares");
        const data = await res.json();
        setItems(data);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchShares();
  }, [isLoaded, user]);

  return (
    <>
      <Head>
        <title>My Shares - PELNI</title>
        <meta
          name="description"
          content="PELNI Shipping Agencies - Document Management"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <FileHeader headerName={"My Shares"} />
        <div className="h-[75vh] w-full overflow-y-auto p-5">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <DotLoader color="#b8c2d7" size={60} />
            </div>
          ) : items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.file.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-lg">
                      📄
                    </div>
                    <div>
                      <p className="text-sm font-medium text-textC">
                        {item.file.fileName}
                      </p>
                      <p className="text-xs text-gray-400">
                        Shared with:{" "}
                        {item.sharedWith
                          .map((u) => u.name || u.email)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center">
              <Image
                draggable={false}
                src="/empty_state_folder.png"
                width={500}
                height={500}
                alt="empty-state"
                className="w-48 object-cover object-center opacity-75"
              />
              <h2 className="mb-4 text-2xl">No shared files yet</h2>
              <p className="text-sm text-gray-600">
                Files you share with others will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
