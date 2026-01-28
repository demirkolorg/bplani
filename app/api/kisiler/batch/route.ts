import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { batchDeleteSchema, batchArchiveSchema, type BatchOperationResult } from "@/lib/validations/batch"
import { getSession } from "@/lib/auth"
import { validationErrorResponse, handleApiError } from "@/lib/api-response"
import { AuthenticationError } from "@/types/errors"

/**
 * DELETE /api/kisiler/batch
 * Batch delete kisiler
 * - Hard deletes records without relations
 * - Soft deletes (archives) records with relations
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return handleApiError(new AuthenticationError(), "DELETE /api/kisiler/batch")
    }

    const body = await request.json()
    const validatedData = batchDeleteSchema.safeParse(body)

    if (!validatedData.success) {
      return validationErrorResponse(validatedData.error)
    }

    const { ids } = validatedData.data

    // Transaction to handle batch delete
    const result = await prisma.$transaction(async (tx) => {
      // Check which records have relations
      const kisiWithRelations = await tx.kisi.findMany({
        where: { id: { in: ids } },
        select: {
          id: true,
          _count: {
            select: {
              gsmler: true,
              adresler: true,
              tanitimlar: true,
              operasyonlar: true,
              araclar: true,
              notlar: true,
            }
          }
        }
      })

      // Separate IDs based on relations
      const idsToArchive: string[] = []
      const idsToDelete: string[] = []

      kisiWithRelations.forEach(kisi => {
        const hasRelations = Object.values(kisi._count).some(count => count > 0)
        if (hasRelations) {
          idsToArchive.push(kisi.id)
        } else {
          idsToDelete.push(kisi.id)
        }
      })

      let archivedCount = 0
      let deletedCount = 0

      // Archive records with relations (soft delete)
      if (idsToArchive.length > 0) {
        const archiveResult = await tx.kisi.updateMany({
          where: { id: { in: idsToArchive } },
          data: { isArchived: true, updatedUserId: session.id }
        })
        archivedCount = archiveResult.count
      }

      // Hard delete records without relations
      if (idsToDelete.length > 0) {
        const deleteResult = await tx.kisi.deleteMany({
          where: { id: { in: idsToDelete } }
        })
        deletedCount = deleteResult.count
      }

      const result: BatchOperationResult = {
        success: archivedCount + deletedCount,
        failed: ids.length - (archivedCount + deletedCount),
        archived: archivedCount,
        deleted: deletedCount,
      }

      return result
    })

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error, "DELETE /api/kisiler/batch")
  }
}

/**
 * PATCH /api/kisiler/batch
 * Batch archive/unarchive kisiler
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return handleApiError(new AuthenticationError(), "PATCH /api/kisiler/batch")
    }

    const body = await request.json()
    const validatedData = batchArchiveSchema.safeParse(body)

    if (!validatedData.success) {
      return validationErrorResponse(validatedData.error)
    }

    const { ids, isArchived } = validatedData.data

    const updateResult = await prisma.kisi.updateMany({
      where: { id: { in: ids } },
      data: {
        isArchived,
        updatedUserId: session.id
      }
    })

    const result: BatchOperationResult = {
      success: updateResult.count,
      failed: ids.length - updateResult.count,
    }

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error, "PATCH /api/kisiler/batch")
  }
}
