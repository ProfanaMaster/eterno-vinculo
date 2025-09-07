import { FamilyMember } from '../types/family';

interface FamilyProfileGridProps {
  members: FamilyMember[];
  className?: string;
}

export default function FamilyProfileGrid({ members, className = '' }: FamilyProfileGridProps) {
  if (!members || members.length === 0) {
    return null;
  }

  // Organizar miembros en filas de 2
  const rows = [];
  for (let i = 0; i < members.length; i += 2) {
    rows.push(members.slice(i, i + 2));
  }

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center space-x-8 mb-8">
          {row.map((member) => (
            <div
              key={member.id}
              className="relative group text-center"
            >
              {/* Foto de perfil - Más grande */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/80 shadow-lg group-hover:shadow-xl transition-all duration-200 mx-auto mb-3">
                <img
                  src={member.profile_image_url}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Información del miembro */}
              <div className="text-center">
                <h3 className="text-white text-lg font-semibold mb-1">
                  {member.name}
                </h3>
                <p className="text-white/80 text-sm">
                  {member.relationship}
                </p>
              </div>
            </div>
          ))}
          
          {/* Espacio vacío si la fila tiene solo un elemento */}
          {row.length === 1 && (
            <div className="w-32 h-32 md:w-40 md:h-40" />
          )}
        </div>
      ))}
    </div>
  );
}
