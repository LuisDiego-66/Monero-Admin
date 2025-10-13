import { z } from 'zod'

export const mediaFileSchema = z.object({
  id: z.string(),
  file: z.instanceof(File).nullable(),
  url: z.string().url('URL inválida'),
  type: z.enum(['image', 'video', 'document']),
  name: z.string().min(1, 'El nombre del archivo es requerido'),
  source: z.enum(['existing', 'new'])
})

export const variantSizeFormSchema = z.object({
  id: z.number().optional(),
  size: z.string().min(1, 'La talla es requerida'),
  quantity: z.number().int().min(1, 'El stock es obligatorio y debe ser mayor a 0')
})

export const variantFormSchema = z
  .object({
    colorId: z.string().min(1, 'Debes seleccionar un color'),
    customColorName: z.string().optional(),
    customColorCode: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Código hexadecimal inválido')
      .optional(),

    sizes: z
      .array(variantSizeFormSchema)
      .min(1, 'Debes agregar al menos una talla')
      .refine(
        sizes => {
          const sizeNames = sizes.map(s => s.size.toLowerCase().trim())

          return new Set(sizeNames).size === sizeNames.length
        },
        { message: 'No puedes tener tallas duplicadas' }
      ),

    mediaFiles: z
      .array(mediaFileSchema)
      .min(1, 'Debes agregar al menos un archivo multimedia')
      .refine(files => files.some(f => f.type === 'image'), { message: 'Debes incluir al menos una imagen' })
  })
  .refine(
    data => {
      if (data.colorId === 'custom') {
        return !!data.customColorName && !!data.customColorCode
      }

      return true
    },
    {
      message: 'Debes completar el nombre y código del color personalizado',
      path: ['customColorName']
    }
  )

export const newColorSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(50),
  code: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Código hexadecimal inválido')
})

export type VariantFormData = z.infer<typeof variantFormSchema>
export type MediaFile = z.infer<typeof mediaFileSchema>
export type VariantSizeForm = z.infer<typeof variantSizeFormSchema>
export type NewColorForm = z.infer<typeof newColorSchema>
