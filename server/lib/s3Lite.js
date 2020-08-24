const AWS = require('aws-sdk');
module.exports= class S3Lite {
    constructor(regionId,s3Config)
    {
        const options = Object.assign({ region: regionId }, s3Config);
        options.endpoint =
            options.protocal +
            '://' +
            options.endpoint.replace('#region#', regionId);
       this.client= new AWS.S3(options);
    }

    async checkObject({bucket,key})
    {
        try
        {
            await this.client.headObject({
                Bucket:bucket,
                Key:key
            }).promise()
        }
        catch (e) {
          if(e.statusCode!==404)
              throw e
        }
    }

    async getUploadId({bucket,key})
    {
       let uploadingParts=await this.client.listMultipartUploads({Bucket:bucket}).promise()
       let uploading=uploadingParts.Uploads.find(item => item.Key == key)
       if(uploading)
       {
         return uploading.UploadId
       }
       return null
    }

  async getUploadedParts({bucket,key,uploadId,totalParts})
  {
    if(!uploadId)
      uploadId=await this.getUploadId({bucket,key})

     if(uploadId)
     {
       let uploaded=await this.client.listParts({
         Bucket:bucket,
         Key:key,
         UploadId:uploadId
       }).promise()
       //兼容合并分片失败的情况，这时重新上传
       if(uploaded.Parts.length!==totalParts)
       {
         return {
           uploadId,
           parts:uploaded.Parts
         }
       }
     }
    return null
  }

    async createUpload({bucket,key,contentType,storageClass})
    {
       let {UploadId}=await this.client.createMultipartUpload({
           Bucket:bucket,
           Key:key,
           ContentType:contentType,
           StorageClass:storageClass
       }).on('build',function(req) {
           // 文件锁定监管模式可覆盖
           req.httpRequest.headers['x-amz-bypass-governance-retention']=true
       }).promise()

       return {UploadId}
    }

  async completeUpload({ bucket, key, uploadId,parts })
  {
    try {
        let params={
          Bucket:bucket,
          Key:key,
          UploadId:uploadId,
          MultipartUpload:{
            Parts:parts.map((item => {
              let { PartNumber, ETag } = item;
              return {
                PartNumber,
                ETag,
              }
            }))
          }
        }
        await this.client.completeMultipartUpload(params).on('build',function(req) {
          // 文件锁定监管模式可覆盖
          req.httpRequest.headers['x-amz-bypass-governance-retention']=true
        }).promise()

    }
    catch (e) {
      console.error(e)
      throw new Error(`bucket:${bucket} 文件:${key} uploadId:${uploadId} 合并分片失败`)
    }
  }
}
