import { createClient } from "@supabase/supabase-js"
import * as XLSX from "xlsx"
import { NextRequest, NextResponse } from "next/server"

const DEFAULT_PRODUCT_CODE = "538BC4"

const normalizeValue = (value: unknown): string => {
  if (value === null || value === undefined) return ""
  return String(value).trim()
}

const pickFirst = (...candidates: unknown[]): string => {
  for (const candidate of candidates) {
    const value = normalizeValue(candidate)
    if (value) return value
  }
  return ""
}

const parseRows = (records: Record<string, unknown>[]) => {
  return records.flatMap((row) => {
    const productCode = pickFirst(
      row.product_code,
      row.productCode,
      row.modelo,
      row["Modelo"],
      row.model,
      row["model"],
      DEFAULT_PRODUCT_CODE
    )

    const materialCode = pickFirst(
      row.material_code,
      row.materialCode,
      row.codigo,
      row["Código"],
      row["Material Code"],
      row["material code"]
    )

    const description = pickFirst(
      row.description,
      row.descripcion,
      row["Descripción"],
      row["description"],
      row.name,
      row["Nombre"]
    )

    const photoUrl = pickFirst(
      row.photo_url,
      row.photoUrl,
      row["Photo"],
      row["Foto"],
      row.foto,
      row["photo url"]
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
    let imported = 0

    for (const row of rows) {
      const dedupeKey = `${row.productCode}|${row.materialCode}`
      if (seen.has(dedupeKey)) continue
      seen.add(dedupeKey)

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
      message: `Importación correcta para el modelo ${DEFAULT_PRODUCT_CODE}.`,
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
