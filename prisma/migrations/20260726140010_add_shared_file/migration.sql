-- CreateTable
CREATE TABLE "SharedFile" (
    "id" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "sharedWithId" TEXT NOT NULL,
    "sharedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SharedFile_sharedWithId_idx" ON "SharedFile"("sharedWithId");

-- CreateIndex
CREATE UNIQUE INDEX "SharedFile_fileId_sharedWithId_key" ON "SharedFile"("fileId", "sharedWithId");

-- AddForeignKey
ALTER TABLE "SharedFile" ADD CONSTRAINT "SharedFile_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedFile" ADD CONSTRAINT "SharedFile_sharedWithId_fkey" FOREIGN KEY ("sharedWithId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedFile" ADD CONSTRAINT "SharedFile_sharedById_fkey" FOREIGN KEY ("sharedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
