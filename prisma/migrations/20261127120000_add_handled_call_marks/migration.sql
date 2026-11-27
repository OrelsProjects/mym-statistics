-- CreateTable
CREATE TABLE "handled_call_marks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "phone_call_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "handled_call_marks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "handled_call_marks_user_id_phone_call_id_key" ON "handled_call_marks"("user_id", "phone_call_id");

-- AddForeignKey
ALTER TABLE "handled_call_marks" ADD CONSTRAINT "handled_call_marks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handled_call_marks" ADD CONSTRAINT "handled_call_marks_phone_call_id_fkey" FOREIGN KEY ("phone_call_id") REFERENCES "phone_calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
