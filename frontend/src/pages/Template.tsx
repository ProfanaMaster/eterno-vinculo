import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

interface TemplateItem {
  id: string;
  name: string;
  video_url: string;
  thumbnail_url: string;
  description: string;
  category: string;
}

function TemplatePage() {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<TemplateItem | null>(null);

  const templates: TemplateItem[] = [
    {
      id: '1',
      name: 'Deportivo Cali',
      video_url: 'https://bhbnmuernqfbahkazbyg.supabase.co/storage/v1/object/public/ejemplos/video-ejemplo-1.mp4',
      thumbnail_url: 'https://bhbnmuernqfbahkazbyg.supabase.co/storage/v1/object/public/ejemplos/miniatura-deportivo-cali.png',
      description: 'Plantilla deportiva con colores del Deportivo Cali',
      category: 'deportiva'
    },
    {
      id: '2',
      name: 'América de Cali',
      video_url: 'https://bhbnmuernqfbahkazbyg.supabase.co/storage/v1/object/public/ejemplos/video-ejemplo-2.mp4',
      thumbnail_url: 'https://bhbnmuernqfbahkazbyg.supabase.co/storage/v1/object/public/ejemplos/miniatura-america-cali.png',
      description: 'Plantilla deportiva con colores del América de Cali',
      category: 'deportiva'
    },
    {
      id: '3',
      name: 'Resplandor Nubes',
      video_url: 'https://bhbnmuernqfbahkazbyg.supabase.co/storage/v1/object/public/ejemplos/video-ejemplo-3.mp4',
      thumbnail_url: 'https://bhbnmuernqfbahkazbyg.supabase.co/storage/v1/object/public/ejemplos/miniatura-nubes.png',
      description: 'Plantilla elegante con efecto de nubes resplandecientes',
      category: 'elegante'
    },
    {
      id: '4',
      name: 'Olas en la Playa',
      video_url: 'https://bhbnmuernqfbahkazbyg.supabase.co/storage/v1/object/public/ejemplos/video-ejemplo-4.mp4',
      thumbnail_url: 'https://bhbnmuernqfbahkazbyg.supabase.co/storage/v1/object/public/ejemplos/miniatura-olas.png',
      description: 'Plantilla relajante con movimiento de olas marinas',
      category: 'naturaleza'
    },
    {
      id: '5',
      name: 'Girasoles',
      video_url: 'https://bhbnmuernqfbahkazbyg.supabase.co/storage/v1/object/public/ejemplos/video-ejemplo-5.mp4',
      thumbnail_url: 'https://bhbnmuernqfbahkazbyg.supabase.co/storage/v1/object/public/ejemplos/miniatura-girasoles.png',
      description: 'Plantilla vibrante con la belleza de los girasoles',
      category: 'naturaleza'
    },
    {
      id: '6',
      name: 'Plantilla para Gatos',
      video_url: 'https://bhbnmuernqfbahkazbyg.supabase.co/storage/v1/object/public/ejemplos/video-ejemplo-6.mp4',
      thumbnail_url: 'https://bhbnmuernqfbahkazbyg.supabase.co/storage/v1/object/public/ejemplos/miniatura-gato.png',
      description: 'Plantilla especial diseñada para honrar la memoria de gatos',
      category: 'mascotas'
    },
    {
      id: '7',
      name: 'Plantilla para Perros',
      video_url: 'https://bhbnmuernqfbahkazbyg.supabase.co/storage/v1/object/public/ejemplos/video-ejemplo-7.mp4',
      thumbnail_url: 'https://bhbnmuernqfbahkazbyg.supabase.co/storage/v1/object/public/ejemplos/miniatura-perro.png',
      description: 'Plantilla especial diseñada para honrar la memoria de perros',
      category: 'mascotas'
    }
  ];

  const categories = [
    { key: 'all', label: 'Todas' },
    { key: 'deportiva', label: 'Deportiva' },
    { key: 'elegante', label: 'Elegante' },
    { key: 'naturaleza', label: 'Naturaleza' },
    { key: 'mascotas', label: 'Mascotas' }
  ];

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  const handleTemplateSelect = (template: TemplateItem) => {
    setSelectedTemplate(template.id);
    setSelectedVideo(template);
    setIsModalOpen(true);
  };

  // Asegurar que la página se cargue desde el inicio
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header de la página */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Nuestras <span className="text-gradient">Plantillas</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Ejemplos visuales de las plantillas disponibles para memoriales
            </p>
            
            {/* Mensaje informativo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="text-blue-600 text-xl">ℹ️</div>
                <div className="text-left">
                  <p className="text-blue-800 font-medium">Página de Ejemplos</p>
                  <p className="text-blue-700 text-sm">
                    Esta página es solo para visualizar las plantillas disponibles. 
                    No se crean perfiles memoriales aquí.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros de categoría */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.key
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

                     {/* Grid de plantillas */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {filteredTemplates.map((template) => (
                                <div
                   key={template.id}
                   className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                   onClick={() => handleTemplateSelect(template)}
                 >
                                   {/* Contenedor de la miniatura */}
                  <div className="relative aspect-video bg-gray-900 overflow-hidden">
                    <img
                      src={template.thumbnail_url}
                      alt={`Miniatura de ${template.name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.parentElement?.querySelector('.image-fallback');
                        if (fallback) {
                          (fallback as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                    
                    {/* Fallback cuando la imagen no carga */}
                    <div className="image-fallback absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-center" style={{display: 'none'}}>
                      <div>
                        <div className="text-4xl mb-2">🖼️</div>
                        <p className="text-sm opacity-90">Imagen no disponible</p>
                      </div>
                    </div>
                    
                    {/* Overlay de reproducción */}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full p-3">
                        <svg className="w-8 h-8 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>

                 {/* Solo el título */}
                 <div className="p-4 text-center">
                   <h3 className="text-lg font-semibold text-gray-900">
                     {template.name}
                   </h3>
                 </div>
               </div>
             ))}
           </div>

          {/* CTA adicional */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                ¿No encuentras la plantilla perfecta?
              </h3>
              <p className="text-gray-600 mb-6">
                Nuestro equipo puede crear una plantilla personalizada para ti
              </p>
                             <button 
                 className="btn btn-secondary"
                 onClick={() => {
                   const phoneNumber = '+573106066092';
                   const message = 'Hola, me interesa crear una plantilla personalizada para memorial. ¿Podrían ayudarme?';
                   const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                   window.open(whatsappUrl, '_blank');
                 }}
               >
                 Contactar para Personalización
               </button>
            </div>
          </div>
                 </div>
       </main>

       {/* Modal para reproducir video */}
       {isModalOpen && selectedVideo && (
         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
             {/* Header del modal */}
             <div className="flex items-center justify-between p-6 border-b">
               <h3 className="text-2xl font-bold text-gray-900">
                 {selectedVideo.name}
               </h3>
               <button
                 onClick={() => setIsModalOpen(false)}
                 className="text-gray-400 hover:text-gray-600 transition-colors"
               >
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </div>
             
                           {/* Video en pantalla completa */}
              <div className="p-6">
                <div className="bg-gray-900 rounded-lg overflow-hidden flex justify-center items-center">
                  <video
                    className="max-w-full max-h-[60vh] object-contain"
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    onLoadedMetadata={(e) => {
                      // Ajustar el contenedor según las dimensiones del video
                      const video = e.target as HTMLVideoElement;
                      const container = video.parentElement;
                      if (container) {
                        const aspectRatio = video.videoWidth / video.videoHeight;
                        if (aspectRatio < 1) {
                          // Video vertical (celular) - ajustar altura
                          container.style.maxHeight = '80vh';
                          container.style.width = 'auto';
                        } else {
                          // Video horizontal - mantener proporción
                          container.style.maxHeight = '60vh';
                          container.style.width = '100%';
                        }
                      }
                    }}
                  >
                    <source src={selectedVideo.video_url} type="video/mp4" />
                    Tu navegador no soporta el elemento de video.
                  </video>
                </div>
               
               {/* Descripción */}
               <div className="mt-6 text-center">
                 <p className="text-gray-600 text-lg">
                   {selectedVideo.description}
                 </p>
                 <div className="mt-4">
                   <span className="inline-block bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                     {selectedVideo.category}
                   </span>
                 </div>
               </div>
             </div>
           </div>
         </div>
       )}

       <Footer />
     </div>
   );
 }

export default TemplatePage;
