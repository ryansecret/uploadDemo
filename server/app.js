const Koa = require('koa')
const app = new Koa()
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const MemoryStore = require('koa-session-memory');
const session = require('koa-session');
const corsMiddleware = require('./middleware/cors.js')

const store = new MemoryStore();

app.use(corsMiddleware)

app.keys = ['kfjsldfjklsd*#&(*$&(H342$%^'];
app.use(session({
  store,
  key: 'sessionid',
  maxAge: 86400000,
}, app));

const index = require('./routes/index')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))

app.use(json())
app.use(logger())


// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())


// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app