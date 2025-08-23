-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.memorial_profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  order_id uuid,
  slug character varying UNIQUE,
  profile_name character varying NOT NULL,
  profile_image_url text,
  banner_image_url text,
  description text,
  birth_date date,
  death_date date,
  gallery_images jsonb,
  memorial_video_url text,
  template_id character varying,
  is_published boolean DEFAULT true,
  edit_count integer DEFAULT 0,
  max_edits integer DEFAULT 1,
  qr_code_url text,
  qr_data jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  published_at timestamp with time zone,
  favorite_music text,
  deleted_at timestamp with time zone,
  CONSTRAINT memorial_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT memorial_profiles_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id),
  CONSTRAINT memorial_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.memories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  photo_url text NOT NULL,
  author_name text NOT NULL,
  message text NOT NULL,
  song text,
  things_list ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone DEFAULT now(),
  is_authorized boolean DEFAULT false,
  likes integer DEFAULT 0,
  memorial_profile_id uuid,
  CONSTRAINT memories_pkey PRIMARY KEY (id),
  CONSTRAINT memories_memorial_profile_id_fkey FOREIGN KEY (memorial_profile_id) REFERENCES public.memorial_profiles(id)
);
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  package_id uuid,
  status character varying DEFAULT 'pending'::character varying,
  payment_intent_id character varying,
  total_amount numeric,
  currency character varying,
  payment_method character varying,
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages(id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.packages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL,
  description text,
  price numeric NOT NULL,
  currency character varying DEFAULT 'USD'::character varying,
  features jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT packages_pkey PRIMARY KEY (id)
);
CREATE TABLE public.qr_orders (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  memorial_profile_id uuid,
  qr_file_path text NOT NULL,
  material character varying,
  size character varying,
  quantity integer DEFAULT 1,
  fabrication_status character varying DEFAULT 'pending'::character varying,
  fabrication_notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT qr_orders_pkey PRIMARY KEY (id),
  CONSTRAINT qr_orders_memorial_profile_id_fkey FOREIGN KEY (memorial_profile_id) REFERENCES public.memorial_profiles(id)
);
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL,
  description text,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid,
  CONSTRAINT site_settings_pkey PRIMARY KEY (id),
  CONSTRAINT site_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id)
);
CREATE TABLE public.templates (
  id character varying NOT NULL,
  name character varying NOT NULL,
  description text,
  preview_image_url text,
  css_styles jsonb,
  layout_config jsonb,
  is_premium boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT templates_pkey PRIMARY KEY (id)
);
CREATE TABLE public.user_memorial_history (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  memorial_id uuid,
  action text NOT NULL CHECK (action = ANY (ARRAY['created'::text, 'edited'::text, 'deleted'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_memorial_history_pkey PRIMARY KEY (id),
  CONSTRAINT user_memorial_history_memorial_id_fkey FOREIGN KEY (memorial_id) REFERENCES public.memorial_profiles(id),
  CONSTRAINT user_memorial_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email character varying NOT NULL UNIQUE,
  password_hash character varying,
  first_name character varying,
  last_name character varying,
  phone character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  role text DEFAULT 'user'::text CHECK (role = ANY (ARRAY['user'::text, 'admin'::text, 'super_admin'::text])),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);