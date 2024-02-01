interface LegoSet {
  set_id: string
  name: string
  year: string
  theme: string
  subtheme?: string
  themeGroup?: string
  category: string
  pieces: number
  minifigs?: number
  agerange_min?: number
  US_retailPrice?: number
  bricksetURL?: string
  thumbnailURL?: string
  imageURL?: string
}

interface Movie {
  names: string
  date_x: string
  score: string
  genre: string
  overview: string
  crew: string
  orig_title: string
  status: string
  orig_lang: string
  budget_x: string
  revenue: string
  country: string
}

interface Index {
  ref: string
  fields: string[]
}
