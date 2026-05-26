import { createClient } from '@supabase/supabase-js';

// Conexión a Supabase usando variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Ajustamos las interfaces para que coincidan con la base de datos
export interface Material {
  id: string;
  materialCode: string;
  description: string;
  photoUrl: string;
  timestamp: number; // Mantenemos el formato para no romper tus componentes UI
}

export interface Product {
  id: string;
  productCode: string;
  materials: Material[];
}

// Obtiene todos los productos y sus materiales asociados desde Supabase
export const getStore = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      product_code,
      materials (
        id,
        material_code,
        description,
        photo_url,
        created_at
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error obteniendo datos de Supabase:', error);
    return [];
  }

  // Mapeamos los datos de la BD al formato que ya usa tu frontend
  return data.map((p: any) => ({
    id: p.id,
    productCode: p.product_code,
    materials: p.materials.map((m: any) => ({
      id: m.id,
      materialCode: m.material_code,
      description: m.description,
      photoUrl: m.photo_url,
      timestamp: new Date(m.created_at).getTime()
    }))
  }));
};

// Agrega un material. Si el producto no existe, lo crea primero.
export const addMaterialToProduct = async (
  productCode: string, 
  material: Omit<Material, 'id' | 'timestamp'>
) => {
  // 1. Buscar si el producto ya existe
  let { data: product } = await supabase
    .from('products')
    .select('id')
    .eq('product_code', productCode)
    .single();

  // 2. Si no existe, lo creamos
  if (!product) {
    const { data: newProduct, error: prodError } = await supabase
      .from('products')
      .insert([{ product_code: productCode }])
      .select('id')
      .single();

    if (prodError) throw new Error('Error al crear el nuevo producto en la BD');
    product = newProduct;
  }

  // 3. Insertar el material relacionándolo con el producto
  const { error: matError } = await supabase
    .from('materials')
    .insert([{
      product_id: product.id,
      material_code: material.materialCode,
      description: material.description,
      photo_url: material.photoUrl
    }]);

  if (matError) throw new Error('Error al guardar el material en la BD');

  // Devolvemos el store actualizado
  return await getStore();
};

// Crear un nuevo producto vacío
export const addNewProduct = async (productCode: string): Promise<{ success: boolean; error?: string }> => {
  const normalizedCode = productCode.trim().toUpperCase();
  
  if (!normalizedCode) {
    return { success: false, error: "El código de producto no puede estar vacío." };
  }

  // Verificar si ya existe en la BD
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('product_code', normalizedCode)
    .single();

  if (existing) {
    return { success: false, error: "Este código de producto ya existe en el catálogo." };
  }

  // Insertar nuevo producto
  const { error } = await supabase
    .from('products')
    .insert([{ product_code: normalizedCode }]);

  if (error) {
    return { success: false, error: "Error de base de datos al crear el producto." };
  }

  return { success: true };
};