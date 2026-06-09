// import { createClient } from '@supabase/supabase-js';

// // Conexión a Supabase usando variables de entorno
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

// export const supabase = createClient(supabaseUrl, supabaseKey);

// // Ajustamos las interfaces para que coincidan con la base de datos
// export interface Material {
//   id: string;
//   materialCode: string;
//   description: string;
//   photoUrl: string;
//   timestamp: number; // Mantenemos el formato para no romper tus componentes UI
// }

// export interface Product {
//   id: string;
//   productCode: string;
//   materials: Material[];
// }

// // Obtiene todos los productos y sus materiales asociados desde Supabase
// export const getStore = async (): Promise<Product[]> => {
//   const { data, error } = await supabase
//     .from('products')
//     .select(`
//       id,
//       product_code,
//       materials (
//         id,
//         material_code,
//         description,
//         photo_url,
//         created_at
//       )
//     `)
//     .order('created_at', { ascending: false });

//   if (error) {
//     console.error('Error obteniendo datos de Supabase:', error);
//     return [];
//   }

//   // Mapeamos los datos de la BD al formato que ya usa tu frontend
//   return data.map((p: any) => ({
//     id: p.id,
//     productCode: p.product_code,
//     materials: p.materials.map((m: any) => ({
//       id: m.id,
//       materialCode: m.material_code,
//       description: m.description,
//       photoUrl: m.photo_url,
//       timestamp: new Date(m.created_at).getTime()
//     }))
//   }));
// };

// // Agrega un material. Si el producto no existe, lo crea primero.
// export const addMaterialToProduct = async (
//   productCode: string, 
//   material: Omit<Material, 'id' | 'timestamp'>
// ) => {
//   // 1. Buscar si el producto ya existe
//   let { data: product } = await supabase
//     .from('products')
//     .select('id')
//     .eq('product_code', productCode)
//     .single();

//   // 2. Si no existe, lo creamos
//   if (!product) {
//     const { data: newProduct, error: prodError } = await supabase
//       .from('products')
//       .insert([{ product_code: productCode }])
//       .select('id')
//       .single();

//     if (prodError) throw new Error('Error al crear el nuevo producto en la BD');
//     product = newProduct;
//   }

//   // 3. Insertar el material relacionándolo con el producto
//   const { error: matError } = await supabase
//     .from('materials')
//     .insert([{
//       product_id: product.id,
//       material_code: material.materialCode,
//       description: material.description,
//       photo_url: material.photoUrl
//     }]);

//   if (matError) throw new Error('Error al guardar el material en la BD');

//   // Devolvemos el store actualizado
//   return await getStore();
// };

// // Crear un nuevo producto vacío
// export const addNewProduct = async (productCode: string): Promise<{ success: boolean; error?: string }> => {
//   const normalizedCode = productCode.trim().toUpperCase();
  
//   if (!normalizedCode) {
//     return { success: false, error: "El código de producto no puede estar vacío." };
//   }

//   // Verificar si ya existe en la BD
//   const { data: existing } = await supabase
//     .from('products')
//     .select('id')
//     .eq('product_code', normalizedCode)
//     .single();

//   if (existing) {
//     return { success: false, error: "Este código de producto ya existe en el catálogo." };
//   }

//   // Insertar nuevo producto
//   const { error } = await supabase
//     .from('products')
//     .insert([{ product_code: normalizedCode }]);

//   if (error) {
//     return { success: false, error: "Error de base de datos al crear el producto." };
//   }

//   return { success: true };
// };

// // Elimina un material por su ID
// export const deleteMaterial = async (materialId: string): Promise<void> => {
//   const { error } = await supabase
//     .from('materials')
//     .delete()
//     .eq('id', materialId);

//   if (error) throw new Error('Error al eliminar el material de la BD');
// };

// // Actualiza los datos de un material existente
// export const updateMaterial = async (
//   materialId: string,
//   updates: { materialCode: string; description: string; photoUrl: string }
// ): Promise<{ success: boolean; error?: string }> => {
//   const { error } = await supabase
//     .from('materials')
//     .update({
//       material_code: updates.materialCode,
//       description: updates.description,
//       photo_url: updates.photoUrl,
//     })
//     .eq('id', materialId);

//   if (error) return { success: false, error: 'Error al actualizar el material en la BD.' };
//   return { success: true };
// };

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface Material {
  id: string;
  materialCode: string;
  description: string;
  photoUrl: string;
  timestamp: number;
}

export interface Product {
  id: string;
  productCode: string;
  materials: Material[];
}

// ─── Lectura ──────────────────────────────────────────────────────────────────

export const getStore = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      product_code,
      created_at,
      product_materials (
        materials_catalog (
          id,
          material_code,
          description,
          photo_url,
          created_at
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo datos de Supabase:', error);
    return [];
  }

  return data.map((p: any) => ({
    id: p.id,
    productCode: p.product_code,
    materials: (p.product_materials || [])
      .map((pm: any) => pm.materials_catalog)
      .filter(Boolean)
      .map((m: any) => ({
        id: m.id,
        materialCode: m.material_code,
        description: m.description,
        photoUrl: m.photo_url,
        timestamp: new Date(m.created_at).getTime()
      }))
  }));
};

export const getMaterialsCatalog = async (): Promise<Material[]> => {
  const { data, error } = await supabase
    .from('materials_catalog')
    .select('id, material_code, description, photo_url, created_at')
    .order('material_code', { ascending: true });

  if (error) {
    console.error('Error obteniendo catálogo de materiales:', error);
    return [];
  }

  return data.map((m: any) => ({
    id: m.id,
    materialCode: m.material_code,
    description: m.description,
    photoUrl: m.photo_url,
    timestamp: new Date(m.created_at).getTime()
  }));
};

// ─── Escritura ────────────────────────────────────────────────────────────────

export const addMaterialToCatalog = async (
  material: Omit<Material, 'id' | 'timestamp'>,
  productIds: string[]
): Promise<{ success: boolean; error?: string }> => {

  const { data: newMaterial, error: matError } = await supabase
    .from('materials_catalog')
    .insert([{
      material_code: material.materialCode,
      description: material.description,
      photo_url: material.photoUrl
    }])
    .select('id')
    .single();

  if (matError) {
    return { success: false, error: 'Error al crear el material en el catálogo.' };
  }

  if (productIds.length > 0) {
    const relations = productIds.map(productId => ({
      product_id: productId,
      material_id: newMaterial.id
    }));

    const { error: relError } = await supabase
      .from('product_materials')
      .insert(relations);

    if (relError) {
      return { success: false, error: 'Material creado pero error al vincular productos.' };
    }
  }

  return { success: true };
};

export const linkMaterialToProducts = async (
  materialId: string,
  productIds: string[]
): Promise<{ success: boolean; error?: string }> => {

  const relations = productIds.map(productId => ({
    product_id: productId,
    material_id: materialId
  }));

  const { error } = await supabase
    .from('product_materials')
    .upsert(relations, { onConflict: 'product_id,material_id' });

  if (error) {
    return { success: false, error: 'Error al vincular el material con los productos.' };
  }

  return { success: true };
};

export const addNewProduct = async (productCode: string): Promise<{ success: boolean; error?: string }> => {
  const normalizedCode = productCode.trim().toUpperCase();

  if (!normalizedCode) {
    return { success: false, error: 'El código de producto no puede estar vacío.' };
  }

  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('product_code', normalizedCode)
    .single();

  if (existing) {
    return { success: false, error: 'Este código de producto ya existe en el catálogo.' };
  }

  const { error } = await supabase
    .from('products')
    .insert([{ product_code: normalizedCode }]);

  if (error) {
    return { success: false, error: 'Error de base de datos al crear el producto.' };
  }

  return { success: true };
};

export const updateMaterial = async (
  materialId: string,
  updates: { materialCode: string; description: string; photoUrl: string }
): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase
    .from('materials_catalog')
    .update({
      material_code: updates.materialCode,
      description: updates.description,
      photo_url: updates.photoUrl,
    })
    .eq('id', materialId);

  if (error) {
    return { success: false, error: 'Error al actualizar el material.' };
  }
  return { success: true };
};