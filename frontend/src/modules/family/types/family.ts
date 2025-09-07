// Tipos para el módulo de perfiles familiares

export interface FamilyMember {
  id: string;
  name: string;
  birth_date: string;
  death_date: string;
  profile_image_url: string;
  relationship: string;
  memorial_video_url?: string;
  order_index: number;
}

export interface FamilyProfile {
  id: string;
  slug: string;
  family_name: string;
  description: string;
  members: FamilyMember[];
  max_members: number;
  current_members: number;
  gallery_images: string[];
  template_id?: string;
  favorite_music?: string;
  visit_count?: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  order_id: string;
}

export interface CreateFamilyMemberData {
  name: string;
  birth_date: string;
  death_date: string;
  profile_image_url: string;
  relationship: string;
  memorial_video_url?: string;
}

export interface CreateFamilyProfileData {
  family_name: string;
  description: string;
  members: CreateFamilyMemberData[];
  template_id?: string;
  favorite_music?: string;
}

// Relaciones familiares disponibles
export const FAMILY_RELATIONSHIPS = [
  'padre',
  'madre',
  'hijo',
  'hija',
  'hermano',
  'hermana',
  'abuelo',
  'abuela',
  'nieto',
  'nieta',
  'tío',
  'tía',
  'sobrino',
  'sobrina',
  'primo',
  'prima',
  'esposo',
  'esposa',
  'novio',
  'novia',
  'suegro',
  'suegra',
  'yerno',
  'nuera',
  'cuñado',
  'cuñada',
  'otro'
] as const;

export type FamilyRelationship = typeof FAMILY_RELATIONSHIPS[number];

// Tipo para paquetes familiares
export interface FamilyPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  package_type: 'family';
  max_profiles: number;
  max_family_members: number;
  is_active: boolean;
}
