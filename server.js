 /* 
   搭建服务器的核心文件
*/
//引入koa koa-router
let Koa = require("koa")
let KoaRouter = require("koa-router")
//flyio请求插件
let Fly = require("flyio/src/node")
//加密生成token、解密
let jwt = require("jsonwebtoken")

//1.生成应用及路由器实例
const app = new Koa()
const router = new KoaRouter() 
const fly = new Fly

//核心代码
/*
   req //请求
   res //请求响应
   req res是express中的写法，这里koa将这两个合二为一 ctx
   router.get('/',(req, res, next) =>{

   })
*/
router.get('/',(ctx, next) => {
   //1.获取请求的参数

   //2.根据请求的地址和参数处理数据

   //3.响应数据
   ctx.body = "服务器返回的数据结果11111"
})

// 搜索图书的接口
let datas = require("./datas/data.json")
router.get("/search", (ctx, next) => {
  //1.获取请求的参数,前端返回给服务器端的数据
  let req = ctx.query.req; //浏览器端传递过来的参数值
  console.log("请求的参数req值：", req);

  //2.根据请求的地址和参数处理数据
  let result = datas;

  //3.响应数据, 服务器端返回给前端(浏览器端)的数据
  ctx.body = result;
});

//获取用户openID的接口
router.get("/getOpenId", async (ctx, next) => {
  //1.获取请求的参数, 前端返回给服务器端的数据
  let code = ctx.query.code; //浏览器端传递过来的参数值
  console.log("请求的参数code值：", code);
  let appId = "wx95de0dfa21a179f4"; //微信小程序开发自己申请的AppID(这里暂时放的测试的,必须换成自己的)
  let appSecret = "7a7d81f4d800980ad1d7dc6b7dc9a2c3"; //微信小程序开发自己生成的密钥(这里暂时放的测试的,必须换成自己的)

  //2.根据请求的地址和参数处理数据
  let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;

  /* 
      发送请求给微信接口，获取openId
      微信服务器返回给自己的服务器的openId
      
      定义一个变量result接收请求返回的值
   */
  /* 
      //这里是异步任务，返回的是一个promise对象，需要等待这里执行完毕
      fly.get(url).then(res=> {
         console.log(res)
      })
      .catch(error => {
         console.log(error);
      }); 
   */
  /* 将上述注释掉的代码优化后如下 */
  let result = await fly.get(url);
  let userInfo = JSON.parse(result.data);
  console.log("获取用户的openid", userInfo);

  //这里不能直接将用户的userInfo{openid:'xxx',session_key:'yyy'}返回给前端(浏览器端)，必须进行加密
  //将用户的openid存入数据库,openid:{userName:'xx',money:'yy'}

  //自定义登录状态，就是根据用户的openid和session_key进行加密生成token,返回给前端(浏览器端)
  //对openid和session_key进行加密,自定义登录状态
  let token = jwt.sign(userInfo, "guigutushuceshi");
  console.log("加密生成token：",token);
  /* 
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uX2tleSI6Iit0ZXBLd2tmSkxTb2pINDdwbWJEWXc9PSIsIm9wZW5pZCI6Im85a240NUNyeC12djFpczctUzVyMFUtQlhOcGsiLCJpYXQiOjE2MjE1ODY3OTh9.4DuL8mpBqhRRGK4IkA58TOIS8tBsDLnsYwCLPoXrdLg
  */

  //3.响应数据，服务器端返回给前端(浏览器端)的数据
  ctx.body = token;
});

//测试验证身份token的接口
router.get('/test',(ctx,next) =>{
  //1.获取请求的参数，前端(浏览器端)返回给后台的参数值
   console.log("请求token参数值：",ctx.request.header.authorization);
   let token = ctx.request.header.authorization;

   try {
     //反编译解密token值
     let result = jwt.verify(token, "guigutushuceshi");
     console.log("测试结果：",result);

     //3.响应数据，后端(服务器端)返回个前端(浏览器端)的数据
     ctx.body = "测试token接口成功";
   } 
   catch (error) {
      ctx.body = "测试token接口失败";
   }

})

//测试保存图片接口
router.get("/saveImage", (ctx, next) => {
  //1.获取请求的参数,前端(浏览器端)返回给后台的参数值
  console.log(ctx);
//   var imgData = ctx.request.url;
//   //2.根据请求的地址和参数处理数据
//   var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
//   var dataBuffer = new Buffer(base64Data, "base64");
//   //fs.writeFile("out.png", dataBuffer);

//   console.log(dataBuffer);

//   //3.返回给前端(浏览器)的数据
//   ctx.body = dataBuffer;

  ctx.body = "测试成功";
});


//2.使用路由器及路由
app.use(router.routes())
app.use(router.allowedMethods()) //类似页面理由*，当请求status!== 200和404的时候处理请求头

//3.监听端口
app.listen('3000',() => {
   console.log('服务器启动成功')
   console.log('服务器地址：http://localhost:3000')
})
