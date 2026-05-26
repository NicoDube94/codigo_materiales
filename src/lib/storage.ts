
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

const STORAGE_KEY = 'materilog_data';

export const getStore = (): Product[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const now = Date.now();
    const seed: Product[] = [
      {
        id: 'p-4044gon',
        productCode: '4044GON',
        materials: [
          {
            id: 'm-img-1',
            materialCode: '25H00003662',
            description: 'REJILLA DE FUNDICIÓN SUPERIOR',
            photoUrl: 'https://picsum.photos/seed/rejilla/300/200',
            timestamp: now
          },
          {
            id: 'm-img-2',
            materialCode: '27-262',
            description: 'BOTON ENCENDIDO REFORZADO',
            photoUrl: 'https://picsum.photos/seed/button/300/200',
            timestamp: now - 600000
          },
          {
            id: 'm-img-3',
            materialCode: '48H00025',
            description: 'O RING 2-115 SILICONA ALTA TEMP',
            photoUrl: 'https://picsum.photos/seed/oring/300/200',
            timestamp: now - 1200000
          },
          {
            id: 'm-img-4',
            materialCode: '20H00055',
            description: 'TABLERO ADORNO CON IMPRESIÓN LÁSER',
            photoUrl: 'https://picsum.photos/seed/panel/300/200',
            timestamp: now - 1800000
          },
          {
            id: 'm-img-5',
            materialCode: '67H00664',
            description: 'ENCENDEDOR PIEZOELÉCTRICO MOD. PXE',
            photoUrl: 'https://picsum.photos/seed/igniter/300/200',
            timestamp: now - 2400000
          },
          {
            id: 'm-img-6',
            materialCode: '12H00010',
            description: 'QUEMADOR RÁPIDO DE ALUMINIO',
            photoUrl: 'https://picsum.photos/seed/burner/300/200',
            timestamp: now - 3600000
          },
          {
            id: 'm-img-7',
            materialCode: '33H00045',
            description: 'VÁLVULA DE SEGURIDAD TERMOMAGNÉTICA',
            photoUrl: 'https://picsum.photos/seed/valve/300/200',
            timestamp: now - 7200000
          },
          {
            id: 'm-img-8',
            materialCode: '05H00022',
            description: 'PERILLA COCINA PLÁSTICA GRIS',
            photoUrl: 'https://picsum.photos/seed/knob/300/200',
            timestamp: now - 14400000
          },
          {
            id: 'm-img-9',
            materialCode: '18H00099',
            description: 'VIDRIO PUERTA HORNO TEMPLADO',
            photoUrl: 'https://picsum.photos/seed/glass/300/200',
            timestamp: now - 28800000
          }
        ]
      },
      {
        id: 'p-1',
        productCode: '43716VM',
        materials: [
          {
            id: 'm1',
            materialCode: '76H02105',
            description: 'Etiqueta de eficiencia energía clase A++',
            photoUrl: 'https://picsum.photos/seed/label/300/200',
            timestamp: now - 86400000
          }
        ]
      }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
  return JSON.parse(stored);
};

export const saveStore = (data: Product[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const addMaterialToProduct = (productCode: string, material: Omit<Material, 'id' | 'timestamp'>) => {
  const store = getStore();
  let product = store.find(p => p.productCode === productCode);
  
  const newMaterial: Material = {
    ...material,
    id: Math.random().toString(36).substring(2, 11),
    timestamp: Date.now()
  };

  if (product) {
    product.materials.unshift(newMaterial);
  } else {
    product = {
      id: Math.random().toString(36).substring(2, 11),
      productCode,
      materials: [newMaterial]
    };
    store.unshift(product);
  }

  saveStore(store);
  return store;
};

export const addNewProduct = (productCode: string): { success: boolean; error?: string } => {
  const store = getStore();
  const normalizedCode = productCode.trim().toUpperCase();
  
  if (!normalizedCode) {
    return { success: false, error: "El código de producto no puede estar vacío." };
  }

  const existing = store.find(p => p.productCode === normalizedCode);
  if (existing) {
    return { success: false, error: "Este código de producto ya existe en el catálogo." };
  }

  const newProduct: Product = {
    id: 'p-' + Math.random().toString(36).substring(2, 11),
    productCode: normalizedCode,
    materials: []
  };

  store.unshift(newProduct);
  saveStore(store);
  return { success: true };
};

