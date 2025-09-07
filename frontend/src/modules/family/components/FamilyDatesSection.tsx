import { FamilyMember } from '../types/family';

interface FamilyDatesSectionProps {
  members: FamilyMember[];
  className?: string;
}

export default function FamilyDatesSection({ members, className = '' }: FamilyDatesSectionProps) {
  if (!members || members.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (birthDate: string, deathDate: string) => {
    const birth = new Date(birthDate);
    const death = new Date(deathDate);
    let age = death.getFullYear() - birth.getFullYear();
    const monthDiff = death.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && death.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div className="space-y-6">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
          >
            {/* Nombre y relación */}
            <div className="text-center mb-3">
              <h3 className="text-white text-lg font-semibold">
                {member.name}
              </h3>
              <p className="text-white/80 text-sm">
                {member.relationship}
              </p>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-4 text-center">
              {/* Fecha de nacimiento */}
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60 text-xs uppercase tracking-wide mb-1">
                  Nacimiento
                </div>
                <div className="text-white font-medium">
                  {formatDate(member.birth_date)}
                </div>
              </div>

              {/* Fecha de fallecimiento */}
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-white/60 text-xs uppercase tracking-wide mb-1">
                  Fallecimiento
                </div>
                <div className="text-white font-medium">
                  {formatDate(member.death_date)}
                </div>
              </div>
            </div>

            {/* Edad */}
            <div className="text-center mt-3">
              <div className="inline-block bg-white/10 rounded-full px-4 py-2">
                <span className="text-white/80 text-sm">
                  Vivió {calculateAge(member.birth_date, member.death_date)} años
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
