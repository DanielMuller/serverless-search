import path from 'node:path'

export enum SourceId {
  LEGO = 'lego-sets',
  MOVIES = 'imdb-movies',
  DYNAMO = 'lego-sets-dynamo',
}

export const getSourceId = (filename: string): SourceId | undefined => {
  switch (path.basename(filename).toLowerCase()) {
    case 'lego_sets.csv':
      return SourceId.LEGO
    case 'imdb_movies.csv':
      return SourceId.MOVIES
    default:
      return undefined
  }
}

const legoIndex = {
  ref: 'set_id',
  fields: [
    'name',
    'year',
    'theme',
    'subtheme',
    'themeGroup',
    'category',
    'pieces',
    'minifigs',
    'agerange_min',
    'US_retailPrice',
    'bricksetURL',
    'thumbnailURL',
    'imageURL',
  ],
}
const moviesIndex = {
  ref: 'names',
  fields: [
    'date_x',
    'score',
    'genre',
    'overview',
    'crew',
    'orig_title',
    'status',
    'orig_lang',
    'budget_x',
    'revenue',
    'country',
  ],
}

export const getSourceIndex = (sourceId: SourceId): Index | undefined => {
  switch (sourceId) {
    case SourceId.LEGO:
      return legoIndex
    case SourceId.DYNAMO:
      return legoIndex
    case SourceId.MOVIES:
      return moviesIndex
    default:
      return undefined
  }
}
