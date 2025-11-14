export interface Slider {
  id: number
  name: string
  image: string
  button_text: string
  url: string
  slider_type: 'mobile' | 'desktop'
  gender: 'male' | 'female'
  createdAt?: string
  updatedAt?: string
}

export interface CreateSliderRequest {
  name: string
  image: string
  button_text: string
  url: string
  slider_type: 'mobile' | 'desktop'
  gender: 'male' | 'female'
}

export interface UpdateSliderRequest {
  name?: string
  image?: string
  button_text?: string
  url?: string
  slider_type?: 'mobile' | 'desktop'
  gender?: 'male' | 'female'
}

export interface SlidersResponse {
  data: Slider[]
  meta?: {
    total: number
    page: number
    lastPage: number
    limit: number
  }
}
