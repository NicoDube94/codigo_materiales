import { createClient } from "@supabase/supabase-js"
import * as XLSX from "xlsx"
import { NextRequest, NextResponse } from "next/server"

const DEFAULT_PRODUCT_CODE = "538BC4"

const normalizeValue = (value: unknown): string => {
  if (value === null || value === undefined) return ""
  return String(value).trim()
}

const normalizeKey = (key: string): string =>
  key
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")

const pickFirst = (...candidates: unknown[]): string => {
  for (const candidate of candidates) {
    const value = normalizeValue(candidate)
    if (value) return value
  }
  return ""
}

const normalizeRecord = (row: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(row).map(([key, value]) => [normalizeKey(key), value]))

const parseRows = (records: Record<string, unknown>[]) => {
  return records.flatMap((row) => {
    const normalizedRow = normalizeRecord(row)
    const productCode = pickFirst(
      normalizedRow.productcode,
      normalizedRow.modelo,
      normalizedRow.model,
      normalizedRow.codigoproducto,
      normalizedRow.productmodel,
      normalizedRow.nombremodelo,
      normalizedRow.modeloproducto,
      normalizedRow.modelodelproducto,
      normalizedRow.nombreproducto,
      DEFAULT_PRODUCT_CODE
    )

    const materialCode = pickFirst(
      normalizedRow.materialcode,
      normalizedRow.codigo,
      normalizedRow.codigomaterial,
      normalizedRow.material
    )

    const description = pickFirst(
      normalizedRow.description,
      normalizedRow.descripcion,
      normalizedRow.nombre,
      normalizedRow.materialdescription,
      normalizedRow.descripcionmaterial
    )

    const photoUrl = pickFirst(
      normalizedRow.photourl,
      normalizedRow.photo,
      normalizedRow.foto,
      normalizedRow.imagen,
      normalizedRow.image
    )

    if (!materialCode || !description) return []

    return [{
      productCode: productCode || DEFAULT_PRODUCT_CODE,
      materialCode,
      description,
      photoUrl,
    }]
  })
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "No se recibió ningún archivo." },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: "buffer" })

    const firstSheetName = workbook.SheetNames[0]
    if (!firstSheetName) {
      return NextResponse.json(
        { ok: false, error: "El archivo no tiene hojas válidas para importar." },
        { status: 400 }
      )
    }

    const worksheet = workbook.Sheets[firstSheetName]
    const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: "",
    })

    const rows = parseRows(records)
    if (!rows.length) {
      return NextResponse.json(
        { ok: false, error: "El archivo no tiene filas válidas para importar." },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Faltan variables de entorno de Supabase. Revisa NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.",
        },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const seen = new Set<string>()
    const importedProductCodes = new Set<string>()
    let imported = 0

    for (const row of rows) {
      const dedupeKey = `${row.productCode}|${row.materialCode}`
      if (seen.has(dedupeKey)) continue
      seen.add(dedupeKey)
      importedProductCodes.add(row.productCode)

      const { data: product, error: productError } = await supabase
        .from("products")
        .upsert([{ product_code: row.productCode }], { onConflict: "product_code" })
        .select("id")
        .maybeSingle()

      if (productError) throw productError
      if (!product) {
        throw new Error(`No se pudo crear o recuperar el producto ${row.productCode}.`)
      }

      let materialId: string | null = null

      const { data: existingMaterial, error: materialLookupError } = await supabase
        .from("materials_catalog")
        .select("id")
        .eq("material_code", row.materialCode)
        .maybeSingle()

      if (materialLookupError) throw materialLookupError

      if (existingMaterial) {
        materialId = existingMaterial.id

        const { error: updateError } = await supabase
          .from("materials_catalog")
          .update({
            description: row.description,
            photo_url: row.photoUrl || "",
          })
          .eq("id", materialId)

        if (updateError) throw updateError
      } else {
        const { data: newMaterial, error: insertError } = await supabase
          .from("materials_catalog")
          .insert([
            {
              material_code: row.materialCode,
              description: row.description,
              photo_url: row.photoUrl || "",
            },
          ])
          .select("id")
          .single()

        if (insertError) throw insertError
        materialId = newMaterial.id
      }

      const { error: linkError } = await supabase
        .from("product_materials")
        .upsert(
          [{ product_id: product.id, material_id: materialId }],
          { onConflict: "product_id,material_id" }
        )

      if (linkError) throw linkError
      imported += 1
    }

    return NextResponse.json({
      ok: true,
      imported,
      message: `Importación correcta para ${importedProductCodes.size} modelo(s).`,
    })
  } catch (error: unknown) {
    console.error("Error al importar archivo:", error)
    const message =
      error instanceof Error ? error.message : "Error desconocido al importar el archivo."

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    )
  }
}
