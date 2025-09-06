// Singleton para manejar incrementos de visitas globalmente
class VisitCounterManager {
  private static instance: VisitCounterManager;
  private incrementingSlugs: Set<string> = new Set();
  private completedSlugs: Set<string> = new Set();

  private constructor() {}

  public static getInstance(): VisitCounterManager {
    if (!VisitCounterManager.instance) {
      VisitCounterManager.instance = new VisitCounterManager();
    }
    return VisitCounterManager.instance;
  }

  public canIncrement(slug: string): boolean {
    // Verificar si ya se completó
    if (this.completedSlugs.has(slug)) {
      return false;
    }

    // Verificar si ya se está incrementando
    if (this.incrementingSlugs.has(slug)) {
      return false;
    }

    // Verificar localStorage
    if (typeof window !== 'undefined') {
      const hasIncremented = localStorage.getItem(`visit_incremented_${slug}`) === 'true';
      if (hasIncremented) {
        this.completedSlugs.add(slug);
        return false;
      }
    }

    return true;
  }

  public startIncrement(slug: string): void {
    this.incrementingSlugs.add(slug);
  }

  public completeIncrement(slug: string): void {
    this.incrementingSlugs.delete(slug);
    this.completedSlugs.add(slug);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(`visit_incremented_${slug}`, 'true');
    }
  }

  public reset(slug: string): void {
    this.incrementingSlugs.delete(slug);
    this.completedSlugs.delete(slug);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`visit_incremented_${slug}`);
    }
  }

  public resetAll(): void {
    this.incrementingSlugs.clear();
    this.completedSlugs.clear();
    
    if (typeof window !== 'undefined') {
      // Limpiar todos los localStorage relacionados con visitas
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('visit_incremented_')) {
          localStorage.removeItem(key);
        }
      });
    }
  }
}

export const visitCounterManager = VisitCounterManager.getInstance();
