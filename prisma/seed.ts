import { prisma } from "@/server/db/client";
import { hash } from "bcryptjs";
//import * as argon2 from "argon2";

async function main() {
  

const passwordHash = await hash("ChangeMe_123", 10); //await argon2.hash("ChangeMe_123", {type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1,});

  await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "demo",
      passwordHash,
    },
  });
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
