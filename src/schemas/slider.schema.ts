import { z } from 'zod'

export const sliderFormSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  image: z.string().url('Debe ser una URL válida'),
  button_text: z.string().min(1, 'El texto del botón es requerido'),
  url: z.string().url('Debe ser una URL válida').or(z.literal('')).optional(),
  slider_type: z.enum(['mobile', 'desktop'], {
    required_error: 'Debe seleccionar un tipo de slider'
  }),
  gender: z.enum(['male', 'female'], {
    required_error: 'Debe seleccionar un género'
  })
})

export type SliderFormData = z.infer<typeof sliderFormSchema>
