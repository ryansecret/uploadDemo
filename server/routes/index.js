const router = require('koa-router')()
const mime=require('mime')
const assert=require("assert")
const S3Lite=require("../lib/s3Lite.js")
const parse = require('await-busboy');

let s3Config= {
  endpoint: 's3.#region#.jcloudcs.com',
  protocal: 'http',
  maxRetries: 2,
  httpOptions: {
    timeout: 10000,
  },
  credentials: {

  }
}
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    let buffers = [];
    stream.on('error', reject);
    stream.on('data', (data) => buffers.push(data))
    stream.on('end', () => resolve(Buffer.concat(buffers)))
  });
}

router.get('/upload', async (ctx) => {

  let { regionId, bucket: Bucket, prefix='', relativePath,totalChunks,identifier,chunkNumber: PartNumber } = ctx.query;
  let Key = prefix + relativePath;


  let s3=new S3Lite(regionId,s3Config)

  try {

    ctx.session.uploadIds=ctx.session.uploadIds||{}
    let uploadId=ctx.session.uploadIds[identifier]

    let uploadParts=await s3.getUploadedParts({bucket:Bucket,key:Key,uploadId,totalParts:totalChunks})

    if(uploadParts)
    {
      let {uploadId,parts}=uploadParts
      ctx.session.uploadIds[identifier]=uploadId

      ctx.body={
        exist: false,
        uploadedChunck: parts.map(item =>{
          return item.PartNumber;
        })
      }
    }
    else
      ctx.status=206
  }
  catch (e) {

    ctx.status=e.statusCode||500
    ctx.body={message:e.message}
  }
})

router.post('/upload', async (ctx) => {
  let { regionId, bucket: Bucket, prefix='' } = ctx.query;
  let s3=new S3Lite(regionId,s3Config)
  const parts = parse(ctx, {
    autoFields: true
  });
  let part;
  while ((part = await parts)) {
    let {prefix,relativePath,chunkNumber: PartNumber, filename, identifier, totalChunks,storageClass}=parts.field
    let Key=relativePath
    if(prefix)
      Key=prefix+Key
    try {
      let file=await streamToBuffer(part)
      let StorageClass=storageClass
      ctx.session.uploadIds=ctx.session.uploadIds||{}
      let uploadId=ctx.session.uploadIds[identifier]
      if (PartNumber == 1&&!uploadId) {
        let uploaded = await  s3.getUploadedParts({bucket:Bucket,key:Key,uploadId,totalParts:totalChunks})
        if (!uploaded) {
          let ContentType=mime.getType(filename)
          let {UploadId}= await s3.createUpload({ bucket:Bucket,key:Key,contentType: ContentType,storageClass:StorageClass});
          uploadId=UploadId
        }
        else
        {
          uploadId=uploaded.uploadId
        }
        ctx.session.uploadIds[identifier]=uploadId
      }

      if(!uploadId)
        uploadId=await s3.getUploadId({bucket:Bucket,key:Key})

      assert(uploadId,'uploadId must not null')

      await s3.client.uploadPart({
        Bucket,
        Key,
        PartNumber,
        UploadId:uploadId,
        Body:file
      }).promise()

      let {Parts}=await s3.client.listParts({
        Bucket,
        Key,
        UploadId:uploadId
      }).promise()
      if(Parts.length===Number(totalChunks))
      {
        await s3.completeUpload({
          bucket:Bucket,
          key:Key,
          uploadId:uploadId,
          parts:Parts
        })
        ctx.session.uploadIds[identifier]=null
        ctx.body = "upload finish"
      }
      ctx.status=200
    }
    catch (e) {
      ctx.status=e.statusCode||500
      ctx.body={message:e.message}
    }
  }

})



module.exports = router
