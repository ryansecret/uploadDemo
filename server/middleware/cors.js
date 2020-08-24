module.exports = async function (ctx,next) {
    ctx.set("Access-Control-Allow-Origin", ctx.request.header.origin);// 可去取配置
    ctx.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    ctx.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Token");
    ctx.set("Access-Control-Allow-Credentials", "true");
    ctx.status=200;
    await next();
}