import { get, store } from '@@controllers/s3'
import log from 'lambda-log'
import { buildMutableIndex, loadMutableIndex } from '@@controllers/lunr'
import { SourceId, getSourceIndex } from '@@shared/utils/sourceFormats'
import { DynamoDBStreamEvent } from 'aws-lambda'
import { unmarshall } from '@aws-sdk/util-dynamodb'

const bucket = process.env.BUCKET

const main = async (event: DynamoDBStreamEvent): Promise<void> => {
  if (!bucket) {
    log.warn('No Bucket', { env: process.env })
    return
  }

  const sourceId = SourceId.DYNAMO
  let idx: lunr.Index | undefined
  try {
    const dataStr = await get({ bucket, filename: SourceId.DYNAMO, fileType: 'idx' })
    if (!dataStr) {
      return
    }
    idx = loadMutableIndex(dataStr)
  } catch {}

  if (!idx) {
    const sourceIndex = getSourceIndex(sourceId)
    if (!sourceIndex) {
      return
    }
    idx = buildMutableIndex({ ref: sourceIndex.ref, fields: sourceIndex?.fields, documents: [] })
  }

  event.Records.forEach((record) => {
    if (!record.dynamodb) {
      return
    }
    if (record.eventName === 'INSERT') {
      if (!record.dynamodb.NewImage) {
        return
      }
      // @ts-expect-error missing types on lunr-mutable-indexes
      idx.add(unmarshall(record.dynamodb?.NewImage))
    }
    if (record.eventName === 'REMOVE') {
      // @ts-expect-error missing types on lunr-mutable-indexes
      idx.remove({ set_id: record.dynamodb?.OldImage.set_id.S })
    }
    if (record.eventName === 'MODIFY') {
      // @ts-expect-error missing types on lunr-mutable-indexes
      idx.remove({ set_id: record.dynamodb?.OldImage.set_id.S })
      // @ts-expect-error missing types on lunr-mutable-indexes
      idx.add(unmarshall(record.dynamodb?.NewImage))
    }
  })

  await store({
    bucket,
    content: JSON.stringify(idx.toJSON()),
    filename: sourceId,
    fileType: 'idx',
  })
}

export const handler = main
