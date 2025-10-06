'use client'

import ProductWizard from './indexSteps'

interface AddProductFormProps {
  mode?: 'create' | 'edit'
  productId?: string
}

const AddProductForm = ({ mode = 'create', productId }: AddProductFormProps) => {
  return <ProductWizard mode={mode} productId={productId} />
}

export default AddProductForm
