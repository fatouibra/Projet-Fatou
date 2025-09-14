'use client'

import { Button } from '@/components/ui/Button'

export function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-primary-500 to-primary-600 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            Bienvenue chez{' '}
            <span className="text-primary-100">MnuFood</span>
          </h1>
          
          <p className="text-lg md:text-xl text-primary-100 mb-8 animate-slide-up">
            Découvrez nos plats délicieux préparés avec amour et des ingrédients frais. 
            Commandez en ligne et savourez l'excellence culinaire chez vous.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-white text-primary-600 hover:bg-primary-50"
              onClick={() => {
                const menuSection = document.getElementById('menu')
                menuSection?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Voir le menu
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white hover:text-primary-600"
            >
              Commander maintenant
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-bounce-gentle"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
    </section>
  )
}