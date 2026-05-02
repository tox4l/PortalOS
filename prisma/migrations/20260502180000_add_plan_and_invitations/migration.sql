-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('STUDIO', 'GROWTH');

-- AlterTable — add plan column to agencies
ALTER TABLE "agencies" ADD COLUMN "plan" "Plan" NOT NULL DEFAULT 'STUDIO';

-- Fix brand_color default to match schema
ALTER TABLE "agencies" ALTER COLUMN "brand_color" SET DEFAULT '#8C7340';

-- CreateEnum
CREATE TYPE "ClientRole" AS ENUM ('CLIENT_LEAD', 'CLIENT_REVIEWER', 'CLIENT_VIEWER');

-- AlterTable — add role column to client_users
ALTER TABLE "client_users" ADD COLUMN "role" "ClientRole" NOT NULL DEFAULT 'CLIENT_LEAD';

-- AlterEnum — add GENERIC to NotificationType
ALTER TYPE "NotificationType" ADD VALUE 'GENERIC';

-- CreateTable
CREATE TABLE "team_invitations" (
    "id" TEXT NOT NULL,
    "agency_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "invited_by_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_invitations" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "agency_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "ClientRole" NOT NULL DEFAULT 'CLIENT_REVIEWER',
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "invited_by_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex — team_invitations
CREATE UNIQUE INDEX "team_invitations_token_key" ON "team_invitations"("token");
CREATE UNIQUE INDEX "team_invitations_agency_id_email_key" ON "team_invitations"("agency_id", "email");
CREATE INDEX "team_invitations_token_idx" ON "team_invitations"("token");
CREATE INDEX "team_invitations_email_idx" ON "team_invitations"("email");

-- CreateIndex — client_invitations
CREATE UNIQUE INDEX "client_invitations_token_key" ON "client_invitations"("token");
CREATE UNIQUE INDEX "client_invitations_client_id_email_key" ON "client_invitations"("client_id", "email");
CREATE INDEX "client_invitations_token_idx" ON "client_invitations"("token");
CREATE INDEX "client_invitations_email_idx" ON "client_invitations"("email");

-- AddForeignKey — team_invitations
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey — client_invitations
ALTER TABLE "client_invitations" ADD CONSTRAINT "client_invitations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "client_invitations" ADD CONSTRAINT "client_invitations_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "agencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "client_invitations" ADD CONSTRAINT "client_invitations_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "client_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
