export interface Advertisement {
  id: number
  text: string
  enabled: boolean
}

export interface UpdateAdvertisementPayload {
  text: string
  enabled: boolean
}
