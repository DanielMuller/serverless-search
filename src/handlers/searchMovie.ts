import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda'
import { get } from '@@controllers/s3'

import log from 'lambda-log'
import { loadIndex } from '@@controllers/lunr'
import { SourceId } from '@@shared/utils/sourceFormats'

const bucket = process.env.BUCKET
let idx: lunr.Index
let documents: Movie[]

const main = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2<SearchResponse>> => {
  log.info('Event', { event })
  log.info('Env', { env: process.env })
  log.info('Version', { version: process.version })

  if (!bucket) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Bucket is not defined' }),
    }
  }
  if (!event.queryStringParameters || !event.queryStringParameters?.search) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing search parameter' }),
    }
  }
  const start = new Date().getTime()

  if (!idx) {
    const dataStr = await get({ bucket, filename: SourceId.MOVIES, fileType: 'idx' })
    if (!dataStr) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Index not found' }),
      }
    }
    const sets = (await get({ bucket, filename: SourceId.MOVIES, fileType: 'doc' })) || '[]'
    idx = loadIndex(dataStr)
    documents = JSON.parse(sets)
  }

  const idxLoaded = new Date().getTime()

  log.info('indexLoaded', { duration: idxLoaded - start, totalDuration: idxLoaded - start })

  const queryResult = idx.search(event.queryStringParameters.search)

  const queryDone = new Date().getTime()

  log.info('queryDone', { duration: queryDone - idxLoaded, totalDuration: queryDone - start })

  const response = queryResult.map((item) => {
    const match = documents.find((doc) => item.ref === doc.names)
    if (match) {
      const enhancedMatch: SearchResponseItem = {
        ...match,
        matchInfo: {
          score: item.score,
          matchData: item.matchData,
        },
      }
      return enhancedMatch
    }
    return undefined
  })

  return response
}

export const handler = main

type SearchResponse = (SearchResponseItem | undefined)[]

interface SearchResponseItem extends Movie {
  matchInfo: {
    score: lunr.Index.Result['score']
    matchData: lunr.Index.Result['matchData']
  }
}
