import { getObjectStream, store } from '@@controllers/s3'
import { S3ObjectCreatedNotificationEvent } from 'aws-lambda'
import log from 'lambda-log'
import csv from 'csvtojson'
import { buildIndex } from '@@controllers/lunr'
import { getSourceId } from '@@shared/utils/sourceFormats'

const bucket = process.env.BUCKET

const main = async (event: S3ObjectCreatedNotificationEvent): Promise<void> => {
  log.info('Event', { event })
  if (!bucket) {
    log.warn('No Bucket', { env: process.env })
    return
  }
  if (bucket !== event.detail.bucket.name) {
    log.warn('Invalid Bucket', { envBucket: bucket, eventBucket: event.detail.bucket.name })
    return
  }

  const sourceId = getSourceId(event.detail.object.key)
  if (!sourceId) {
    log.warn('Invalid sourceId', { bucket, key: event.detail.object.key })
    return
  }

  const start = new Date().getTime()

  const key = event.detail.object.key
  const sourceStream = await getObjectStream({ bucket, key })

  if (!sourceStream) {
    log.warn('No Stream', { bucket, key })
    return
  }

  let fields: string[] = []
  const allData = (await csv()
    .on('header', (header) => {
      fields = header
    })
    .fromStream(sourceStream)) as LegoSet[] | Movie[]
  const endLoad = new Date().getTime()

  log.info('getAllData', {
    count: allData.length,
    duration: endLoad - start,
    totalDuration: endLoad - start,
  })

  const idx = buildIndex({ ref: fields[0], fields: fields.slice(1), documents: allData })

  const endIndex = new Date().getTime()

  log.info('buildIndex', {
    count: allData.length,
    duration: endIndex - endLoad,
    totalDuration: endIndex - start,
  })

  await Promise.all([
    store({
      bucket,
      content: JSON.stringify(idx.toJSON()),
      filename: sourceId,
      fileType: 'idx',
    }),
    store({
      bucket,
      content: JSON.stringify(allData),
      filename: sourceId,
      fileType: 'doc',
    }),
  ])

  const endStore = new Date().getTime()

  log.info('storeAllData', {
    duration: endStore - endIndex,
    totalDuration: endStore - start,
  })
}

export const handler = main
