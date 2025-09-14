'use client'

import { Category } from '@/types'
import { ProductCard } from './ProductCard'

interface CategorySectionProps {
  category: Category
}

export function CategorySection({ category }: CategorySectionProps) {
  if (!category.products || category.products.length === 0) {
    return null
  }

  return (
    <section className="mb-12 animate-fade-in">
      <div className="flex items-center mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {category.name}
          </h2>
          {category.description && (
            <p className="text-gray-600">
              {category.description}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {category.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}