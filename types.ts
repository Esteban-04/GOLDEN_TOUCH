
export interface Bracelet {
  id: string;
  name: string;
  description: string;
  price: number;
  weight: number;
  karats: number;
  imageUrl: string;
  createdAt: number;
}

export interface NewBracelet {
  name: string;
  description: string;
  price: number;
  weight: number;
  karats: number;
  imageFile: File | null;
}
