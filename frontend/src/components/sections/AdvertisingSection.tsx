import { getSupabaseUrl } from '@/services/storage';

function AdvertisingSection() {
  const advertisingItems = [
    {
      image: 'eterno_01.png',
      title: 'Eterno Vínculo: Su Legado, Grabado para Siempre',
      description: 'Presentamos la Placa Memorial de Eterno Vínculo: una pieza de aluminio resistente y duradera, diseñada para preservar la memoria de quienes más amas. Cada placa incorpora un código QR personalizado en forma de corazón con su nombre, grabado con elegancia, acompaña el diseño, convirtiendo este tributo físico en un portal a su historia viva.',
      reverse: false
    },
    {
      image: 'eterno_03.png', 
      title: 'Un Homenaje al Amor, Creado con Respeto y Detalle',
      description: 'En Eterno Vínculo, entendemos la profunda importancia de cada recuerdo. Por eso, cada Placa Memorial es más que un producto; es una manifestación de amor y un homenaje cuidadoso. Desde el diseño personalizado del código QR en forma de corazón hasta la elegante caja de presentación, cada detalle es elaborado con el máximo respeto y la más delicada atención.',
      reverse: true
    },
    {
      image: 'eterno_06.png',
      title: 'Un Legado Vivo, Conectando Corazones en Cada Visita',
      description: 'La Placa Memorial de Eterno Vínculo transforma la lápida en un homenaje digital. Escanea y accede al perfil memorial para compartir fotos, mensajes y canciones de tu ser querido, sin necesidad de registro.',
      reverse: false
    },
    {
      image: 'eterno_07.png',
      title: 'Honra su Memoria, Mantén Viva su Historia.',
      description: 'En cada visita, en cada recuerdo te permite mantener la presencia de tus seres queridos. Con solo un escaneo de su lápida, accede a un perfil memorial digital único, un espacio donde sus historias, fotografías y legados cobran vida. Conecta con su memoria de una forma innovadora y profunda.',
      reverse: true
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {advertisingItems.map((item, index) => (
          <div 
            key={index}
            className={`flex flex-col lg:flex-row items-center gap-12 mb-20 last:mb-0 ${
              item.reverse ? 'lg:flex-row-reverse' : ''
            }`}
          >
            {/* Imagen */}
            <div className="flex-1">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={getSupabaseUrl('imagenes-pagina', item.image)}
                  alt={item.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>

            {/* Contenido de texto */}
            <div className="flex-1">
              <div className="max-w-lg mx-auto lg:mx-0">
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  {item.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default AdvertisingSection;
