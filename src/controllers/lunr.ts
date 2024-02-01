import lunr from 'lunr'
import lunrMutable from 'lunr-mutable-indexes'

export const buildIndex = (params: BuildIndex): lunr.Index => {
  const idx: lunr.Index = lunr(function () {
    this.ref(params.ref)
    params.fields.forEach((f) => {
      this.field(f)
    })
    params.documents.forEach((document) => {
      this.add(document)
    })
  })
  return idx
}

export const loadIndex = (stringified: string): lunr.Index => {
  const data = JSON.parse(stringified)
  return lunr.Index.load(data)
}

export const buildMutableIndex = (params: BuildIndex): lunr.Index => {
  const idx: lunr.Index = lunrMutable(function () {
    this.ref(params.ref)
    params.fields.forEach((f) => {
      this.field(f)
    })
  })
  return idx
}

export const loadMutableIndex = (stringified: string): lunr.Index => {
  const data = JSON.parse(stringified)
  return lunrMutable.Index.load(data)
}

interface BuildIndex {
  ref: string
  fields: string[]
  documents: LegoSet[] | Movie[]
}
