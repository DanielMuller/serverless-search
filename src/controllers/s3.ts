import {
  GetObjectCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3'
import internal from 'stream'

import log from 'lambda-log'

const client = new S3Client({ region: process.env.AWS_REGION })
const indexPrefix = 'indexes/'

export const getObjectStream = async (
  params: GetObjectStream,
): Promise<internal.Readable | undefined> => {
  const command = new GetObjectCommand({
    Bucket: params.bucket,
    Key: params.key,
  })
  const res = await client.send(command)
  if (res.Body instanceof internal.Readable) {
    return res.Body as internal.Readable
  }
  return undefined
}

export const get = async (params: Get): Promise<string | undefined> => {
  const command = new GetObjectCommand({
    Bucket: params.bucket,
    Key: `${indexPrefix}${params.filename}/${params.fileType}`,
  })
  const res = await client.send(command)
  return res.Body?.transformToString('utf-8')
}

export const store = async (params: Store): Promise<void> => {
  const s3Params: PutObjectCommandInput = {
    Bucket: params.bucket,
    Key: `${indexPrefix}${params.filename}/${params.fileType}`,
    ContentType: 'application/json',
    Body: params.content,
  }
  log.info('s3put', {
    region: process.env.AWS_REGION,
    s3Params: { ...s3Params, ...{ Body: '***' } },
  })
  const command = new PutObjectCommand(s3Params)
  client.send(command)
}

interface Store {
  bucket: string
  filename: string
  fileType: 'idx' | 'doc' | 'jsonl'
  content: string
}

interface GetObjectStream {
  bucket: string
  key: string
}

interface Get extends Omit<Store, 'content'> {}
