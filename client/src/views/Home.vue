<template>
  <div style="display: flex;justify-content: center">
    <uploader
      style="display: inline-block"
      :target="target"
      :single-file="true"
      ref="uploader"
      :validate-file="checkFile"
      @filesSubmitted="filesSubmitted"
    >
      <template v-slot="{ files }">
        <uploader-drop class="el-upload el-upload--text el-upload-dragger">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">
            {{ $t("dragFile") }}
            <em
              ><upload-btn :attrs="attr" :single="true">{{
                $t("click")
              }}</upload-btn></em
            >
          </div>
        </uploader-drop>

        <div>上传文件最大支持5GB</div>

        <template v-for="file in files">
          <a class="el-upload-list__item-name" :key="file.name">
            <i class="el-icon-document"></i>{{ file.name | handleLongName }}
          </a>
          <el-progress
            :key="file.name"
            :percentage="file.vmProgress"
            :status="getStatus(file)"
          ></el-progress>
        </template>
      </template>
    </uploader>
  </div>
</template>

<script>
const IMAGE_TYPES = "image/jpg,image/jpeg,image/bmp,image/gif,image/png";
const STATUS = {
  success: "success",
  exception: "exception"
};
export default {
  name: "uploadImage",
  data() {
    this.attr = {
      accept: IMAGE_TYPES
    };

    return {
      dgShow: false,
      file: {
        name: ""
      },
      target: ""
    };
  },
  filters: {
    handleLongName(value) {
      if (value.length > 26) {
        return (
          value.substring(0, 15) +
          "..." +
          value.substring(value.length - 8, value.length)
        );
      } else {
        return value;
      }
    }
  },
  methods: {
    init({ regionId, bucket }) {
      this.regionId = regionId;
      this.bucket = bucket;
      this.target = `http://hosting.jdcloud.com:3000/upload?regionId=${
        this.regionId
      }&bucket=${encodeURIComponent(this.bucket)}`;
    },
    checkFile(file) {
      let name = file.name;
      if (!(name.length <= 80 && name.length > 0)) {
        return false;
      }
      if (!/^[A-Za-z0-9\-_./\u4e00-\u9fa5]{1,80}$/.test(name)) {
        return false;
      }

      if (/^\//.test(name)) {
        return false;
      }
      if (/[/]{2,}/.test(name)) {
        return false;
      }
      return true;
    },
    getStatus(file) {
      if (file.error) return STATUS.exception;
      if (file && file.vmProgress === 100) {
        return STATUS.success;
      }
      return "";
    },
    async filesSubmitted(files) {
      //这里调用接口，添加相关逻辑
      let fileName = files[0].name;
      console.log("开始上传文件---" + fileName);
      this.$refs.uploader.resume();
    }
  },
  created() {
    // 配置
    this.init({
      regionId: "cn-east-2-stag",
      bucket: "12124444"
    });
  }
};
</script>
<i18n locale="en" lang="yaml">
  dragFile: "Drop files here to upload or"
  click: "select files"
  tips: "Uploading of file is not completed. Confirm to disable the function?"
</i18n>
<i18n locale="cn" lang="yaml">
  dragFile: "将文件拖到此处，或"
  click: "点击上传"
  tips: "文件尚未上传完毕，确定要关闭吗？"
</i18n>
<style scoped>
.el-progress /deep/ .el-progress__text {
  position: absolute;
  top: -13px;
  right: 0;
}
.el-progress /deep/ .el-progress-bar {
  padding-right: 0px;
}
</style>
