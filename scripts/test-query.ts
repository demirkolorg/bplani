import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  try {
    const iller = await prisma.il.findMany({
      take: 2,
      orderBy: { ad: "asc" },
      include: {
        _count: { select: { ilceler: true } },
        createdUser: { select: { ad: true, soyad: true } },
        updatedUser: { select: { ad: true, soyad: true } },
      },
    })
    console.log("SUCCESS:")
    console.log(JSON.stringify(iller, null, 2))
  } catch (error) {
    console.error("ERROR:", error)
  }
}

main().finally(() => prisma.$disconnect())
