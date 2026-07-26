import Head from "next/head";
import GetFiles from "@/components/GetFiles";
import FileHeader from "@/components/FileHeader";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useFetchAllFiles } from "@/hooks/fetchAllFiles";
import { DotLoader } from "react-spinners";

export default function SharedWithMe() {
  const [isFile, setIsFile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useUser();

  const list = useFetchAllFiles(
    user?.id ?? "",
    user?.primaryEmailAddress?.emailAddress ?? undefined,
  );

  useEffect(() => {
    const hasFiles = list.some(
      (item) => !item.isFolder && item.isSharedWithMe && !item.isTrashed,
    );
    setIsFile(hasFiles);

    setTimeout(() => {
      setIsLoading(false);
    }, 2200);
  }, [list]);

  return (
    <>
      <Head>
        <title>Shared with me - PELNI</title>
        <meta
          name="description"
          content="PELNI Shipping Agencies - Document Management"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <FileHeader headerName={"Shared with me"} />
        <div className="h-[75vh] w-full overflow-y-auto p-5">
          {!isFile && isLoading ? (
            <div className="flex h-full items-center justify-center">
              <DotLoader color="#b8c2d7" size={60} />
            </div>
          ) : (
            <>
              {isFile ? (
                <div className="mb-5 flex flex-col space-y-4">
                  <h2>Files</h2>
                  <div className="flex flex-wrap justify-start gap-x-3 gap-y-5 text-textC">
                    <GetFiles folderId="" select="shared" />
                  </div>
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
                  <h2 className="mb-4 text-2xl">No shared files</h2>
                  <p className="text-sm text-gray-600">
                    Files shared with you by other users will appear here
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
