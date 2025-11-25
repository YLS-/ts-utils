import type { Storage } from 'firebase-admin/storage'

export type Bucket = ReturnType<Storage['bucket']>
export type File = ReturnType<Bucket['file']>
export type GetSignedUrlConfig = Parameters<File['getSignedUrl']>[0]
export type SaveOptions = Parameters<File['save']>[1]
export type CreateBucketRequest = Parameters<Bucket['create']>[0]
