import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";
import { DiGoogleDrive } from "react-icons/di";
import { MdStarBorder } from "react-icons/md";
import { RiDeleteBin6Fill, RiDeleteBin6Line } from "react-icons/ri";
import { IoMdStar } from "react-icons/io";
import { IoSettingsOutline, IoSettingsSharp } from "react-icons/io5";
import { FiShare2, FiUpload } from "react-icons/fi";

function Navbar() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/user/status");
        const data = await res.json();
        setIsAdmin(data.role === "admin");
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [isLoaded, user]);

  const isActive = (href: string) => router.pathname === href;
  return (
    <nav className="space-y-0.5 pr-5">
      <Link
        href={"/drive/my-drive"}
        className={`tablet:justify-normal tablet:space-x-3 tablet:px-4 tablet:py-1.5 flex items-center justify-center rounded-full p-2 hover:bg-darkC ${
          isActive("/drive/my-drive") ? "bg-[#C2E7FF]" : ""
        }`}
      >
        {isActive("/drive/my-drive") ? (
          <DiGoogleDrive className="tablet:h-5 tablet:w-5 h-6 w-6 rounded-sm border-[2.3px] border-textC bg-textC text-white" />
        ) : (
          <DiGoogleDrive className="tablet:h-5 tablet:w-5 h-6 w-6 rounded-sm border-[2.3px] border-textC" />
        )}
        <span className="tablet:block hidden">My Drive</span>
      </Link>

      <Link
        href={"/drive/my-shares"}
        className={`tablet:justify-normal tablet:space-x-3 tablet:px-4 tablet:py-1.5 flex items-center justify-center rounded-full p-2 hover:bg-darkC ${
          isActive("/drive/my-shares") ? "bg-[#C2E7FF]" : ""
        }`}
      >
        <FiUpload className="tablet:h-5 tablet:w-5 h-6 w-6" />
        <span className="tablet:block hidden">My Shares</span>
      </Link>
      <Link
        href={"/drive/shared-with-me"}
        className={`tablet:justify-normal tablet:space-x-3 tablet:px-4 tablet:py-1.5 flex items-center justify-center rounded-full p-2 hover:bg-darkC ${
          isActive("/drive/shared-with-me") ? "bg-[#C2E7FF]" : ""
        }`}
      >
        <FiShare2 className="tablet:h-5 tablet:w-5 h-6 w-6" />
        <span className="tablet:block hidden">Shared with me</span>
      </Link>
      <Link
        href={"/drive/starred"}
        className={`tablet:justify-normal tablet:space-x-3 tablet:px-4 tablet:py-1.5 flex items-center justify-center rounded-full p-2 hover:bg-darkC ${
          isActive("/drive/starred") ? "bg-[#C2E7FF]" : ""
        }`}
      >
        {isActive("/drive/starred") ? (
          <IoMdStar className="tablet:h-5 tablet:w-5 h-6 w-6" />
        ) : (
          <MdStarBorder className="tablet:h-5 tablet:w-5 h-6 w-6" />
        )}

        <span className="tablet:block hidden">Starred</span>
      </Link>
      <Link
        href={"/drive/trash"}
        className={`tablet:justify-normal tablet:space-x-3 tablet:px-4 tablet:py-1.5 flex items-center justify-center rounded-full p-2 hover:bg-darkC ${
          isActive("/drive/trash") ? "bg-[#C2E7FF]" : ""
        }`}
      >
        {isActive("/drive/trash") ? (
          <RiDeleteBin6Fill className="tablet:h-5 tablet:w-5 h-6 w-6" />
        ) : (
          <RiDeleteBin6Line className="tablet:h-5 tablet:w-5 h-6 w-6" />
        )}
        <span className="tablet:block hidden">Bin</span>
      </Link>

      {/* Manage — cuma kelihatan kalo admin */}
      {isAdmin && (
        <Link
          href={"/admin/users"}
          className={`tablet:justify-normal tablet:space-x-3 tablet:px-4 tablet:py-1.5 flex items-center justify-center rounded-full p-2 hover:bg-darkC ${
            isActive("/admin/users") ? "bg-[#C2E7FF]" : ""
          }`}
        >
          {isActive("/admin/users") ? (
            <IoSettingsSharp className="tablet:h-5 tablet:w-5 h-6 w-6" />
          ) : (
            <IoSettingsOutline className="tablet:h-5 tablet:w-5 h-6 w-6" />
          )}
          <span className="tablet:block hidden">Manage</span>
        </Link>
      )}
    </nav>
  );
}

export default Navbar;
